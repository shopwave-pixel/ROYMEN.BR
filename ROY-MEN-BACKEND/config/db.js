import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri || uri.includes('<username>') || uri.includes('YOUR_MONGO_URI') || uri.includes('YOUR_MONGODB_ATLAS_URI') || uri.startsWith('YOUR_')) {
      console.warn('[DB] WARNING: No valid MONGO_URI found in environment variables. Running server with database offline.');
      return;
    }

    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip IPv6 refinement
    });

    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected! Attempting reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[DB] MongoDB Connection Error: ${err.message}`);
    });

  } catch (error) {
    console.error(`[DB] Error: ${error.message}`);
    console.warn(`[DB] WARNING: Server starting with database offline. Please configure a valid MONGO_URI secret if database connectivity is required.`);
  }
};

export default connectDB;
