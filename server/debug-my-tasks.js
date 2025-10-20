/**
 * Debug script for the my-tasks endpoint
 * Run this to test the endpoint directly
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const PickupTask = require('./src/models/PickupTask');
const WasteReport = require('./src/models/WasteReport');
const User = require('./src/models/User');

const debugMyTasks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise');
    console.log('✅ Connected to MongoDB');

    // Find a collector user
    const collector = await User.findOne({ role: 'collector' });
    if (!collector) {
      console.log('❌ No collector found in database');
      return;
    }
    console.log(`✅ Found collector: ${collector.firstName} ${collector.lastName}`);

    // Test the query that's failing
    console.log('\n🔍 Testing PickupTask query...');
    const filter = { collectorId: collector._id };
    
    // First, try without population
    console.log('Testing without population...');
    const tasksWithoutPopulation = await PickupTask.find(filter).limit(5);
    console.log(`✅ Found ${tasksWithoutPopulation.length} tasks without population`);

    // Test with reportId population only
    console.log('Testing with reportId population...');
    try {
      const tasksWithReportPopulation = await PickupTask.find(filter)
        .populate('reportId', 'type description location priority estimatedVolume')
        .limit(5);
      console.log(`✅ Found ${tasksWithReportPopulation.length} tasks with reportId population`);
    } catch (error) {
      console.log('❌ Error with reportId population:', error.message);
    }

    // Test with collectorId population only
    console.log('Testing with collectorId population...');
    try {
      const tasksWithCollectorPopulation = await PickupTask.find(filter)
        .populate('collectorId', 'firstName lastName email phone')
        .limit(5);
      console.log(`✅ Found ${tasksWithCollectorPopulation.length} tasks with collectorId population`);
    } catch (error) {
      console.log('❌ Error with collectorId population:', error.message);
    }

    // Test with both populations
    console.log('Testing with both populations...');
    try {
      const tasksWithBothPopulations = await PickupTask.find(filter)
        .populate('reportId', 'type description location priority estimatedVolume')
        .populate('collectorId', 'firstName lastName email phone')
        .sort({ scheduledDate: 1 })
        .limit(5);
      console.log(`✅ Found ${tasksWithBothPopulations.length} tasks with both populations`);
      
      // Log the structure of the first task
      if (tasksWithBothPopulations.length > 0) {
        console.log('\n📋 Sample task structure:');
        const sampleTask = tasksWithBothPopulations[0];
        console.log({
          id: sampleTask._id,
          status: sampleTask.status,
          scheduledDate: sampleTask.scheduledDate,
          estimatedDuration: sampleTask.estimatedDuration,
          reportId: sampleTask.reportId ? {
            id: sampleTask.reportId._id,
            type: sampleTask.reportId.type,
            priority: sampleTask.reportId.priority
          } : null,
          collectorId: sampleTask.collectorId ? {
            id: sampleTask.collectorId._id,
            name: `${sampleTask.collectorId.firstName} ${sampleTask.collectorId.lastName}`
          } : null
        });
      }
    } catch (error) {
      console.log('❌ Error with both populations:', error.message);
      console.log('Full error:', error);
    }

    // Test pagination
    console.log('\nTesting pagination...');
    const page = 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    try {
      const total = await PickupTask.countDocuments(filter);
      console.log(`✅ Total tasks for collector: ${total}`);
      
      const paginatedTasks = await PickupTask.find(filter)
        .populate('reportId', 'type description location priority estimatedVolume')
        .populate('collectorId', 'firstName lastName email phone')
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(limit);
        
      console.log(`✅ Paginated query successful: ${paginatedTasks.length} tasks`);
      
      const totalPages = Math.ceil(total / limit);
      console.log(`✅ Pagination: page ${page}, limit ${limit}, total ${total}, totalPages ${totalPages}`);
      
    } catch (error) {
      console.log('❌ Error with pagination:', error.message);
      console.log('Full error:', error);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the debug
if (require.main === module) {
  debugMyTasks().catch(console.error);
}

module.exports = { debugMyTasks };
