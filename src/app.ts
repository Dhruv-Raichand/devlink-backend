import express from 'express';
import connectDB from './config/database.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import 'dotenv/config';

import authRouter from './routes/auth.route.js';
import profileRouter from './routes/profile.route.js';
import requestRouter from './routes/request.route.js';
import userRouter from './routes/user.route.js';
import chatRouter from './routes/chat.route.js';
import skillRouter from './routes/skill.route.js';
import paymentRouter from './routes/payment.route.js';

import initializeSocket from './utils/socket.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use('/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/request', requestRouter);
app.use('/user', userRouter);
app.use('/chat', chatRouter);
app.use('/skills', skillRouter);
app.use('/payment', paymentRouter);

app.use((req: any, res: any) => {
  res.status(404).send('Not Found');
});

const server = http.createServer(app);
initializeSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    await import('./utils/cronJob.js');

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
