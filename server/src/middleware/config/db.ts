import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    let uri = env.MONGODB_URI;

    if (uri === 'memory') {
      if (env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI must be set in production. Set it to a MongoDB Atlas connection string.');
      }
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('🧪 In-memory MongoDB started:', uri);
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}
