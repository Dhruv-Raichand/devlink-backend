import razorpayInstance from '../utils/razorpay.js';
import Payment from '../models/payment.js';
import {
  membershipPlans,
  MembershipType,
  BillingCycle,
} from '../utils/constants.js';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils.js';
import User from '../models/user.js';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { SendResponse } from '../utils/sendResponse.js';

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      req.log.warn('Payment creation attempted without authentication');
      throw new ApiError(401, 'Unauthorized');
    }

    const { membershipType, billingCycle } = req.body;

    const isValidMembershipType = (value: any): value is MembershipType =>
      Object.keys(membershipPlans).includes(value);

    const isValidBillingCycle = (value: any): value is BillingCycle =>
      ['MONTHLY', 'YEARLY'].includes(value);

    if (
      !isValidMembershipType(membershipType) ||
      !isValidBillingCycle(billingCycle)
    ) {
      req.log.warn(
        { userId: req.user._id, membershipType, billingCycle },
        'Invalid payment input'
      );
      throw new ApiError(400, 'Invalid input');
    }

    const type = membershipType as MembershipType;
    const cycle = billingCycle as BillingCycle;

    const order = await razorpayInstance.orders.create({
      amount: membershipPlans[type][cycle] * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        membershipType: type,
        billingCycle: cycle,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      membershipType: type,
      billingCycle: cycle,
    });

    await payment.save();

    req.log.info(
      { userId: req.user._id, orderId: order.id, amount: order.amount },
      'Payment order created'
    );

    SendResponse(res, 201, 'Payment created successfully', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  }
);

export const verifyPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      req.log.warn('Payment verification missing required details');
      throw new ApiError(400, 'Missing payment details');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(razorpay_signature, 'hex');

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      req.log.warn(
        { orderId: razorpay_order_id, paymentId: razorpay_payment_id },
        'Payment signature verification failed'
      );
      throw new ApiError(400, 'Invalid signature');
    }

    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: 'authorized' },
      { new: true }
    );

    if (!payment) {
      req.log.warn({ orderId: razorpay_order_id }, 'Payment not found');
      throw new ApiError(404, 'Payment not found');
    }

    req.log.info(
      { orderId: razorpay_order_id, paymentId: razorpay_payment_id },
      'Payment verified successfully'
    );

    SendResponse(res, 200, 'Payment verified successfully');
  }
);

export const handleWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    req.log.info('Razorpay webhook received');

    const rawBody = req.body.toString();
    const isWebhookValid = validateWebhookSignature(
      rawBody,
      req.headers['x-razorpay-signature'] as string,
      process.env.RAZORPAY_WEBHOOK_SECRET as string
    );

    if (!isWebhookValid) {
      req.log.warn('Invalid Razorpay webhook signature');
      throw new ApiError(400, 'Invalid webhook signature');
    }

    const event = JSON.parse(rawBody);
    const paymentDetails = event.payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });
    if (!payment) {
      req.log.warn(
        { orderId: paymentDetails.order_id },
        'Webhook payment not found'
      );
      throw new ApiError(404, 'Payment not found');
    }

    if (payment.status === 'captured') {
      req.log.info(
        { orderId: payment.orderId, paymentId: payment.paymentId },
        'Webhook skipped: payment already processed'
      );
      SendResponse(res, 200, 'Payment already processed');
      return;
    }

    if (event.event === 'payment.captured') {
      payment.status = paymentDetails.status;
      payment.paymentId = paymentDetails.id;
      await payment.save();

      const expiryDate = new Date();
      if (payment.billingCycle === 'MONTHLY') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      await User.findByIdAndUpdate(payment.userId, {
        membershipType: payment.membershipType,
        billingCycle: payment.billingCycle,
        membershipExpiry: expiryDate,
      });

      req.log.info(
        {
          userId: payment.userId,
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          membershipType: payment.membershipType,
        },
        'Payment captured and membership upgraded'
      );
    }

    if (event.event === 'payment.failed') {
      payment.status = 'failed';
      await payment.save();
      req.log.warn(
        { orderId: paymentDetails.order_id, paymentId: paymentDetails.id },
        'Payment failed'
      );
    }

    SendResponse(res, 200, 'Webhook processed successfully');
  }
);

export const getPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      req.log.warn('Get payment status failed: unauthorized');
      throw new ApiError(401, 'Unauthorized');
    }

    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      userId: req.user._id,
    });

    if (!payment) {
      req.log.warn(
        { userId: req.user._id, orderId: req.params.orderId },
        'Payment not found'
      );
      throw new ApiError(404, 'Payment not found');
    }

    if (payment.status === 'captured') {
      const user = await User.findById(req.user._id).select('-password');

      req.log.info(
        {
          userId: req.user._id,
          orderId: payment.orderId,
          status: payment.status,
        },
        'Payment status retrieved'
      );

      SendResponse(res, 200, 'Payment status retrieved successfully', user);
      return;
    }

    req.log.info(
      {
        userId: req.user._id,
        orderId: payment.orderId,
        status: payment.status,
      },
      'Payment status retrieved'
    );

    SendResponse(res, 200, 'Payment status retrieved successfully');
  }
);
