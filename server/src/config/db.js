const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri.startsWith('mongodb+srv')) {
      // Connect to MongoDB Atlas
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
      return;
    }

    if (uri) {
      try {
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return;
      } catch (localErr) {
        console.log(`⚠️  Local MongoDB unavailable (${localErr.message}).`);
      }
    }

    // Fallback for Development/Evaluation: In-Memory MongoDB Server
    console.log('⚡ Starting in-memory MongoDB server for seamless zero-config evaluation...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();

    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ In-memory MongoDB connected: ${conn.connection.host}`);

    // Auto-seed initial demo dataset
    const { seedData } = require('../seeds/seed');
    console.log('🌱 Auto-seeding initial demo data...');
    await seedData();
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

module.exports = connectDB;
