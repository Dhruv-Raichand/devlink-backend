import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri)
    throw new Error('MONGODB_URI is not defined in environment variables');

  try {
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection failed', err);
    process.exit(1);
  }
};

export default connectDB;
