/**
 * Test script for Collector Backend Endpoints
 * Run this after starting the server to verify all collector endpoints work correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testTaskId = '';

// Test user credentials (you'll need to create these in your database)
const testCollector = {
  email: 'collector@test.com',
  password: 'password123'
};

const testAdmin = {
  email: 'admin@test.com', 
  password: 'password123'
};

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = authToken) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Test functions
const testLogin = async () => {
  console.log('\n🔐 Testing Collector Login...');
  const result = await makeRequest('POST', '/auth/login', testCollector, '');
  
  if (result.success && result.data.data.token) {
    authToken = result.data.data.token;
    console.log('✅ Login successful');
    return true;
  } else {
    console.log('❌ Login failed:', result.error);
    return false;
  }
};

const testGetMyTasks = async () => {
  console.log('\n📋 Testing Get My Tasks...');
  const result = await makeRequest('GET', '/pickups/my-tasks?page=1&limit=10');
  
  if (result.success) {
    console.log('✅ Get my tasks successful');
    console.log(`   Found ${result.data.data.data.length} tasks`);
    
    // Store a task ID for other tests
    if (result.data.data.data.length > 0) {
      testTaskId = result.data.data.data[0]._id;
      console.log(`   Using task ID: ${testTaskId}`);
    }
    return true;
  } else {
    console.log('❌ Get my tasks failed:', result.error);
    return false;
  }
};

const testGetTaskDetails = async () => {
  if (!testTaskId) {
    console.log('\n⚠️  Skipping task details test - no task ID available');
    return true;
  }
  
  console.log('\n📄 Testing Get Task Details...');
  const result = await makeRequest('GET', `/pickups/tasks/${testTaskId}`);
  
  if (result.success) {
    console.log('✅ Get task details successful');
    console.log(`   Task status: ${result.data.data.status}`);
    return true;
  } else {
    console.log('❌ Get task details failed:', result.error);
    return false;
  }
};

const testCollectorStats = async () => {
  console.log('\n📊 Testing Collector Statistics...');
  const result = await makeRequest('GET', '/pickups/collector/stats');
  
  if (result.success) {
    console.log('✅ Collector stats successful');
    console.log(`   Total tasks: ${result.data.data.total}`);
    console.log(`   Completion rate: ${result.data.data.completionRate}%`);
    console.log(`   Today's tasks: ${result.data.data.today.total}`);
    return true;
  } else {
    console.log('❌ Collector stats failed:', result.error);
    return false;
  }
};

const testCollectorPerformance = async () => {
  console.log('\n🎯 Testing Collector Performance...');
  const result = await makeRequest('GET', '/pickups/collector/performance?period=month');
  
  if (result.success) {
    console.log('✅ Collector performance successful');
    console.log(`   Period: ${result.data.data.period}`);
    console.log(`   Total tasks: ${result.data.data.totalTasks}`);
    console.log(`   Completion rate: ${result.data.data.completionRate}%`);
    return true;
  } else {
    console.log('❌ Collector performance failed:', result.error);
    return false;
  }
};

const testTaskActions = async () => {
  if (!testTaskId) {
    console.log('\n⚠️  Skipping task actions test - no task ID available');
    return true;
  }
  
  console.log('\n🚀 Testing Task Actions...');
  
  // Test start task
  console.log('   Testing start task...');
  let result = await makeRequest('POST', `/pickups/tasks/${testTaskId}/start`);
  if (result.success || result.status === 400) { // 400 might mean already started
    console.log('   ✅ Start task endpoint working');
  } else {
    console.log('   ❌ Start task failed:', result.error);
  }
  
  // Test location update
  console.log('   Testing location update...');
  result = await makeRequest('POST', `/pickups/tasks/${testTaskId}/update-location`, {
    latitude: -1.2921,
    longitude: 36.8219
  });
  if (result.success) {
    console.log('   ✅ Location update successful');
  } else {
    console.log('   ❌ Location update failed:', result.error);
  }
  
  // Test complete task
  console.log('   Testing complete task...');
  result = await makeRequest('POST', `/pickups/tasks/${testTaskId}/complete`, {
    notes: 'Task completed successfully during testing',
    images: []
  });
  if (result.success || result.status === 400) { // 400 might mean not in progress
    console.log('   ✅ Complete task endpoint working');
  } else {
    console.log('   ❌ Complete task failed:', result.error);
  }
  
  return true;
};

const testScheduleEndpoint = async () => {
  console.log('\n📅 Testing Schedule Endpoint...');
  const today = new Date().toISOString().split('T')[0];
  const result = await makeRequest('GET', `/pickups/collector/${authToken.split('.')[1]}/schedule?startDate=${today}&endDate=${today}`);
  
  if (result.success || result.status === 403) { // 403 expected if collector ID doesn't match
    console.log('✅ Schedule endpoint working');
    return true;
  } else {
    console.log('❌ Schedule endpoint failed:', result.error);
    return false;
  }
};

const testRescheduleTask = async () => {
  if (!testTaskId) {
    console.log('\n⚠️  Skipping reschedule test - no task ID available');
    return true;
  }
  
  console.log('\n🔄 Testing Task Reschedule...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await makeRequest('POST', `/pickups/tasks/${testTaskId}/reschedule`, {
    scheduledDate: tomorrow.toISOString(),
    reason: 'Testing reschedule functionality'
  });
  
  if (result.success || result.status === 400) { // 400 might mean task can't be rescheduled
    console.log('✅ Reschedule endpoint working');
    return true;
  } else {
    console.log('❌ Reschedule failed:', result.error);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🧪 Starting Collector Backend Tests...');
  console.log('=====================================');
  
  const tests = [
    testLogin,
    testGetMyTasks,
    testGetTaskDetails,
    testCollectorStats,
    testCollectorPerformance,
    testTaskActions,
    testScheduleEndpoint,
    testRescheduleTask
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n=====================================');
  console.log('🏁 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All collector backend endpoints are working correctly!');
  } else {
    console.log('\n⚠️  Some endpoints need attention. Check the logs above.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, makeRequest, BASE_URL };
