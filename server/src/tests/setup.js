const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

jest.setTimeout(30000);

let mongoServer;

/**
 * Connect to in-memory MongoDB before tests
 */
const setup = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.GALLERY_TOKEN_SECRET = 'test-gallery-secret';
  process.env.GALLERY_TOKEN_EXPIRES_IN = '2h';

  await mongoose.connect(uri);
};

/**
 * Clear all collections between tests
 */
const clearDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

/**
 * Disconnect and stop in-memory server
 */
const teardown = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Create a test user and return user + token
 */
const createTestUser = async (overrides = {}) => {
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'admin',
    ...overrides,
  };

  const user = await User.create(userData);
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  return { user, token };
};

module.exports = { setup, clearDB, teardown, createTestUser };
