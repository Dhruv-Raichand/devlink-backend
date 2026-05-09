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

export const createPayment = async (req: any, res: any) => {
  try {
    const { membershipType, billingCycle } = req.body;

    const isValidMembershipType = (value: any): value is MembershipType =>
      Object.keys(membershipPlans).includes(value);

    const isValidBillingCycle = (value: any): value is BillingCycle =>
      ['MONTHLY', 'YEARLY'].includes(value);

    if (
      !isValidMembershipType(membershipType) ||
      !isValidBillingCycle(billingCycle)
    ) {
      return res.status(400).json({ success: false, error: 'Invalid input' });
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

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const verifyPayment = async (req: any, res: any) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid payment signature' });
    }

    // Just mark payment as verified on our end, webhook handles user upgrade
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: 'authorized' },
      { new: true }
    );

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, error: 'Payment not found' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

export const handleWebhook = async (req: any, res: any) => {
  try {
    console.log('Webhook hit');
    console.log(req.headers['x-razorpay-signature']);
    const rawBody = req.body.toString();
    const isWebhookValid = validateWebhookSignature(
      rawBody,
      req.headers['x-razorpay-signature'] as string,
      process.env.RAZORPAY_WEBHOOK_SECRET as string
    );

    if (!isWebhookValid) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody); // parse after validation
    const paymentDetails = event.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'captured') {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed',
      });
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

      console.log('Payment captured, user upgraded:', payment.userId);
    }

    if (event.event === 'payment.failed') {
      payment.status = 'failed';
      await payment.save();
      console.log('Payment failed for order:', paymentDetails.order_id);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Failed to handle webhook' });
  }
};

export const getPaymentStatus = async (req: any, res: any) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      userId: req.user._id,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, error: 'Payment not found' });
    }

    if (payment.status === 'captured') {
      const user = await User.findById(req.user._id).select('-password');
      return res.status(200).json({ success: true, ready: true, user });
    }

    res.status(200).json({ success: true, ready: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};
