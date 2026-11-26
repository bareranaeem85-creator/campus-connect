const mongoose = require('mongoose');

/**
 * Connects to MongoDB.
 * - Uses MONGO_URI when provided (MongoDB Atlas in production).
 * - In development without MONGO_URI, spins up an in-memory MongoDB so the
 *   project runs with zero setup. Returns true when the in-memory DB was used.
 */
async function connectDB() {
  let uri = process.env.MONGO_URI;
  let inMemory = false;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI is required in production');
    }
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri('campus-connect');
    inMemory = true;
    console.log('⚠  No MONGO_URI set — using in-memory MongoDB (data resets on restart)');
  }

  await mongoose.connect(uri);
  console.log('✓ MongoDB connected');
  return inMemory;
}

module.exports = connectDB;
