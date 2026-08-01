const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

mongoose.set('strictQuery', true);

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== 'production',
  });

  isConnected = true;
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
  isConnected = false;
}

module.exports = { connectDB, disconnectDB, mongoose };
