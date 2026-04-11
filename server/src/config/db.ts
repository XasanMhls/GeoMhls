import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    let uri = env.MONGODB_URI;

    if (uri === 'memory') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('🧪 In-memory MongoDB started:', uri);
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}
