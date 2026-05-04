import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    const uri = env.MONGODB_URI;
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}
