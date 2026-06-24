import mongoose from 'mongoose';
import { logger } from '../logger/logger.js';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri)
    throw new Error('MONGODB_URI is not defined in environment variables');

  try {
    await mongoose.connect(uri);
    logger.info({ db: 'mongodb' }, 'Database Connected');
  } catch (err) {
    logger.fatal({ err, db: 'mongodb' }, 'Database Connection failed');
    throw err;
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info({ db: 'mongodb' }, 'Database closed');
  } catch (err) {
    logger.error({ err, db: 'mongodb' }, 'Database close failed');
  }
};
