import express from 'express';
import userAuth from '../middlewares/auth.js';
import {
  createPayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
} from '../controllers/payment.controller.js';
const paymentRouter = express.Router();

paymentRouter.post('/create', userAuth, createPayment);

paymentRouter.post('/verify', userAuth, verifyPayment);

paymentRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

paymentRouter.get('/status/:orderId', userAuth, getPaymentStatus);

export default paymentRouter;
