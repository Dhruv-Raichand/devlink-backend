import express from 'express';
import connectDB from './config/database.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import 'dotenv/config';

import authRouter from './routes/authRouter.js';
import profileRouter from './routes/profileRouter.js';
import requestRouter from './routes/requestRouter.js';
import userRouter from './routes/userRouter.js';
import chatRouter from './routes/chatRouter.js';
import initializeSocket from './utils/socket.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', chatRouter);

// 404 Handler
app.use((req: any, res: any) => {
  res.status(404).send('Not Found');
});

// Create server
const server = http.createServer(app);
initializeSocket(server);

const startServer = async () => {
  try {
    // DB + Start Server
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
