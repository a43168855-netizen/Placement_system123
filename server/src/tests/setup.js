const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/placement_management_test_db';

const setupTestDB = () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_key_12345';
    await connectDB(TEST_DB_URI);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.db.dropDatabase();
      await mongoose.connection.close();
    }
  });
};

module.exports = { setupTestDB, TEST_DB_URI };
