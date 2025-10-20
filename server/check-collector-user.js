const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const checkCollectorUser = async () => {
  try {
    console.log('🔍 Checking collector user credentials...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise');
    console.log('✅ Connected to MongoDB');

    // Find collector users
    const collectors = await User.find({ role: 'collector' });
    console.log(`📋 Found ${collectors.length} collector users:`);
    
    collectors.forEach(collector => {
      console.log(`\n👤 Collector: ${collector.firstName} ${collector.lastName}`);
      console.log(`📧 Email: ${collector.email}`);
      console.log(`🆔 ID: ${collector._id}`);
      console.log(`✅ Active: ${collector.isActive}`);
      console.log(`🔐 Password Hash: ${collector.password ? 'Set' : 'Not set'}`);
    });

    if (collectors.length === 0) {
      console.log('\n❌ No collector users found!');
      console.log('💡 You may need to register a collector user first.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkCollectorUser();
