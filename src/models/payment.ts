import mongoose, { Document } from 'mongoose';

export interface IPayment {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  membershipType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IPaymentDocument extends IPayment, Document {}

const paymentSchema = new mongoose.Schema<IPaymentDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    orderId: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
    },

    receipt: {
      type: String,
      required: true,
    },

    membershipType: {
      type: String,
    },

    status: {
      type: String,
      default: 'created',
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);

export default Payment;
