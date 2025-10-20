const mongoose = require('mongoose');
const User = require('./src/models/User');
const PickupTask = require('./src/models/PickupTask');
require('dotenv').config();

const debugMyTasks500 = async () => {
  try {
    console.log('🔍 Debugging my-tasks 500 error...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise');
    console.log('✅ Connected to MongoDB');

    // Check if we have any collector users
    const collectors = await User.find({ role: 'collector' }).limit(5);
    console.log(`📋 Found ${collectors.length} collector users:`);
    collectors.forEach(collector => {
      console.log(`  - ${collector.firstName} ${collector.lastName} (${collector._id})`);
    });

    if (collectors.length === 0) {
      console.log('❌ No collector users found! This might be the issue.');
      return;
    }

    // Check pickup tasks for the first collector
    const firstCollector = collectors[0];
    console.log(`\n🔍 Checking tasks for collector: ${firstCollector.firstName} ${firstCollector.lastName}`);
    
    const tasks = await PickupTask.find({ collectorId: firstCollector._id });
    console.log(`📊 Found ${tasks.length} tasks for this collector`);

    if (tasks.length > 0) {
      console.log('📋 Sample tasks:');
      tasks.slice(0, 3).forEach(task => {
        console.log(`  - Task ${task._id}: ${task.status} (scheduled: ${task.scheduledDate})`);
      });
    }

    // Test the population that might be causing issues
    console.log('\n🔍 Testing population...');
    try {
      const populatedTasks = await PickupTask.find({ collectorId: firstCollector._id })
        .populate('reportId')
        .populate('collectorId', 'firstName lastName email phone')
        .limit(1);
      console.log('✅ Population successful');
      
      if (populatedTasks.length > 0) {
        const task = populatedTasks[0];
        console.log('📋 Sample populated task:');
        console.log(`  - Task ID: ${task._id}`);
        console.log(`  - Status: ${task.status}`);
        console.log(`  - Collector: ${task.collectorId ? task.collectorId.firstName : 'null'}`);
        console.log(`  - Report: ${task.reportId ? task.reportId._id : 'null'}`);
      }
    } catch (populationError) {
      console.error('❌ Population failed:', populationError.message);
      console.log('🔍 Trying without population...');
      
      const unpopulatedTasks = await PickupTask.find({ collectorId: firstCollector._id }).limit(1);
      console.log(`✅ Retrieved ${unpopulatedTasks.length} tasks without population`);
    }

    // Check for any invalid references
    console.log('\n🔍 Checking for invalid references...');
    const allTasks = await PickupTask.find({});
    console.log(`📊 Total tasks in database: ${allTasks.length}`);
    
    let invalidReportRefs = 0;
    let invalidCollectorRefs = 0;
    
    for (const task of allTasks) {
      // Check if reportId exists
      if (task.reportId) {
        const report = await mongoose.model('WasteReport').findById(task.reportId);
        if (!report) {
          invalidReportRefs++;
        }
      }
      
      // Check if collectorId exists
      if (task.collectorId) {
        const collector = await User.findById(task.collectorId);
        if (!collector) {
          invalidCollectorRefs++;
        }
      }
    }
    
    console.log(`❌ Invalid report references: ${invalidReportRefs}`);
    console.log(`❌ Invalid collector references: ${invalidCollectorRefs}`);
    
    if (invalidReportRefs > 0 || invalidCollectorRefs > 0) {
      console.log('⚠️ Invalid references found! This could cause 500 errors during population.');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

debugMyTasks500();
