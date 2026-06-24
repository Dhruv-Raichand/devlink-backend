import express from 'express';
import { connectDB, closeDB } from './config/database.js';
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

import initializeSocket, { closeSocket } from './utils/socket.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { requestId } from './middlewares/requestId.js';
import { logger } from './logger/logger.js';
import { Request, Response } from 'express';

const app = express();

app.use(requestId);
app.use(requestLogger);

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

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime,
    timeStamp: new Date().toISOString(),
  });
});

app.use((req: Request, res: Response) => {
  req.log.warn({ method: req.method, url: req.url }, 'Route not found');
  res.status(404).send('Not Found');
});

app.use(errorHandler);

const server = http.createServer(app);
initializeSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    await import('./utils/cronJob.js');

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      logger.info({ port: PORT }, 'Server started');
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutdown started');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await closeDB();

      await closeSocket();

      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Shutdown error');
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
