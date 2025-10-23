#!/usr/bin/env node

/**
 * Script to test MongoDB Atlas connection
 */

const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://devcasta:NQZ2mqBmiG1nXwQa@cluster0.ilmv3jy.mongodb.net/trustbridge?retryWrites=true&w=majority&appName=Cluster0';

async function testMongoConnection() {
  try {
    console.log('🔍 Testing MongoDB Atlas connection...');
    console.log('📡 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    // Set connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000, // Increase timeout
      socketTimeoutMS: 45000,
      bufferCommands: false
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Successfully connected to MongoDB Atlas');

    // Test a simple query
    const userSchema = new mongoose.Schema({
      walletAddress: String,
      role: String
    });

    const User = mongoose.model('User', userSchema);
    
    const user = await User.findOne({ walletAddress: '0.0.6916959' });
    console.log('📋 Test query result:', user ? `Found user with role: ${user.role}` : 'No user found');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the test
testMongoConnection();
