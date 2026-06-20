import mongoose from 'mongoose';
import { logger } from '../logger/logger.js';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri)
    throw new Error('MONGODB_URI is not defined in environment variables');

  try {
    await mongoose.connect(uri);
    logger.info({ db: 'mongodb' }, 'Database Connected');
  } catch (err) {
    logger.fatal({ err, db: 'mongodb' }, 'Database Connection failed');
    process.exit(1);
  }
};

export default connectDB;
