#!/usr/bin/env node

/**
 * Test script to verify collector endpoints are working
 * Run this after starting the server to check for issues
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCollectorEndpoints() {
  console.log('🧪 Testing Collector Endpoints...\n');

  try {
    // Test health endpoint first
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test authentication (this should fail without token)
    console.log('\n2. Testing authentication...');
    try {
      await axios.get(`${BASE_URL}/api/pickups/my-tasks`);
      console.log('❌ Authentication test failed - should have been rejected');
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('✅ Authentication properly rejected unauthorized request');
      } else {
        console.log('⚠️ Unexpected auth error:', authError.response?.status, authError.response?.data);
      }
    }

    // Test with invalid token
    console.log('\n3. Testing with invalid token...');
    try {
      await axios.get(`${BASE_URL}/api/pickups/my-tasks`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Invalid token test failed - should have been rejected');
    } catch (tokenError) {
      if (tokenError.response?.status === 401) {
        console.log('✅ Invalid token properly rejected');
      } else {
        console.log('⚠️ Unexpected token error:', tokenError.response?.status, tokenError.response?.data);
      }
    }

    console.log('\n✅ Basic endpoint tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: cd server && npm run dev');
    console.log('2. Start the client: cd client && npm run dev');
    console.log('3. Login as a collector to test the dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Please start it with:');
      console.log('   cd server && npm run dev');
    }
  }
}

// Run the test
testCollectorEndpoints();
