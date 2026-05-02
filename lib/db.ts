import mongoose, { Connection } from 'mongoose';

let connection: Connection | null = null;

export async function connectDB(): Promise<Connection> {
  if (connection) {
    return connection;
  }

  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    connection = conn.connection;
    console.log('✓ MongoDB connected');
    return connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (connection) {
    await mongoose.disconnect();
    connection = null;
  }
}

export function getConnection(): Connection | null {
  return connection;
}
