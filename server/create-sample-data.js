const mongoose = require('mongoose');
const User = require('./src/models/User');
const WasteReport = require('./src/models/WasteReport');
const PickupTask = require('./src/models/PickupTask');
require('dotenv').config();

const createSampleData = async () => {
  try {
    console.log('🔧 Creating sample data for testing...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise');
    console.log('✅ Connected to MongoDB');

    // Find the collector user
    const collector = await User.findOne({ role: 'collector' });
    if (!collector) {
      console.log('❌ No collector found! Please create a collector user first.');
      return;
    }
    console.log(`👤 Found collector: ${collector.firstName} ${collector.lastName}`);

    // Find or create a resident user for the waste report
    let resident = await User.findOne({ role: 'resident' });
    if (!resident) {
      console.log('📝 Creating sample resident user...');
      resident = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedpassword', // This would be hashed in real scenario
        role: 'resident',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'Nairobi',
          state: 'Nairobi',
          zipCode: '00100',
          country: 'Kenya'
        },
        location: {
          type: 'Point',
          coordinates: [36.8219, -1.2921] // Nairobi coordinates
        },
        isActive: true
      });
      await resident.save();
      console.log('✅ Created sample resident user');
    }

    // Create a sample waste report
    console.log('📝 Creating sample waste report...');
    const wasteReport = new WasteReport({
      userId: resident._id,
      type: 'recyclable',
      description: 'Plastic bottles and containers from household',
      location: {
        address: '123 Main St, Nairobi',
        coordinates: {
          lat: -1.2921,
          lng: 36.8219
        }
      },
      status: 'pending',
      priority: 'medium',
      estimatedVolume: 5.5,
      images: ['https://example.com/sample-image.jpg'],
      notes: 'Sample waste report for testing'
    });
    await wasteReport.save();
    console.log(`✅ Created waste report: ${wasteReport._id}`);

    // Create sample pickup tasks
    console.log('📝 Creating sample pickup tasks...');
    
    const tasks = [
      {
        reportId: wasteReport._id,
        collectorId: collector._id,
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        estimatedDuration: 30,
        notes: 'Regular plastic waste pickup'
      },
      {
        reportId: wasteReport._id,
        collectorId: collector._id,
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        estimatedDuration: 45,
        notes: 'Large volume pickup required'
      },
      {
        reportId: wasteReport._id,
        collectorId: collector._id,
        status: 'completed',
        scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        estimatedDuration: 25,
        actualStartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        actualEndTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        completionNotes: 'Successfully collected plastic waste',
        notes: 'Completed pickup task'
      }
    ];

    for (const taskData of tasks) {
      const task = new PickupTask(taskData);
      await task.save();
      console.log(`✅ Created pickup task: ${task._id} (${task.status})`);
    }

    console.log('\n🎉 Sample data created successfully!');
    console.log(`📊 Created ${tasks.length} pickup tasks for collector ${collector.firstName}`);

  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createSampleData();
