import razorpayInstance from '../utils/razorpay.js';

export const createPayment = async (req: any, res: any) => {
  try {
    razorpayInstance.orders.create(
      {
        amount: 50000,
        currency: 'INR',
        receipt: 'receipt#1',
      },
      (err: any, order: any) => {
        if (err) {
          console.error('Error creating Razorpay order:', err);
          return res.status(500).json({ error: 'Failed to create payment' });
        } else {
          res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
          });
        }
      }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};
