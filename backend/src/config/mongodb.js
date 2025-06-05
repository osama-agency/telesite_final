import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MongoDB configuration using Mongoose ODM
 * Alternative database option to PostgreSQL
 */

const mongoConfig = {
  development: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myshop',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  test: {
    uri: process.env.MONGODB_URI?.replace('/myshop', '/myshop_test') || 'mongodb://localhost:27017/myshop_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  production: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      ssl: true,
      authSource: 'admin'
    }
  }
};

const env = process.env.NODE_ENV || 'development';

/**
 * Connect to MongoDB
 */
export const connectMongoDB = async () => {
  try {
    const config = mongoConfig[env];

    if (!config.uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(config.uri, config.options);

    console.log('✅ MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📝 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('📝 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
  }
};

/**
 * Test MongoDB connection
 */
export const testMongoConnection = async () => {
  try {
    const config = mongoConfig[env];

    if (!config.uri) {
      throw new Error('MongoDB URI is not defined');
    }

    await mongoose.connect(config.uri, config.options);
    await mongoose.connection.db.admin().ping();

    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error.message);
    return false;
  }
};

export default mongoose;
