import express from 'express';
import userAuth from '../middlewares/auth.js';
import { createPayment } from '../controllers/payment.controller.js';
const paymentRouter = express.Router();

paymentRouter.post('/create', userAuth, createPayment);

export default paymentRouter;
