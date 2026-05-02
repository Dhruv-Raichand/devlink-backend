import razorpayInstance from '../utils/razorpay.js';
import Payment from '../models/payment.js';
import { membershipAmount, MembershipType } from '../utils/constants.js';

export const createPayment = async (req: any, res: any) => {
  try {
    const { membershipType } = req.body;

    if (!Object.keys(membershipAmount).includes(membershipType)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid membership type' });
    }

    const type = membershipType as MembershipType;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[type] * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        membershipType: type,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      membershipType: type,
    });

    await payment.save();

    res.status(201).json({
      success: true,
      data: payment,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};
