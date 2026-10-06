import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
// quiet: stdout is the MCP JSON-RPC channel, so dotenv must not log to it
dotenv.config({ quiet: true });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/selfhub';


export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.error('✅ Connected to MongoDB');
    console.error('📍 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.error('🔌 MongoDB connection closed');
  process.exit(0);
});

export { mongoose };
