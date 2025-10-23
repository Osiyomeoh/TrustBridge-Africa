const axios = require('axios');

async function testAdminStatus() {
  const BASE_URL = 'http://localhost:4001';
  
  try {
    console.log('Testing admin status endpoint...');
    
    // Test without token first
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/status`);
      console.log('Response without token:', response.data);
    } catch (error) {
      console.log('Expected error without token:', error.response?.status, error.response?.data?.message);
    }
    
    // Test with a fake token
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/status`, {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('Response with fake token:', response.data);
    } catch (error) {
      console.log('Error with fake token:', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Error testing admin status:', error.message);
  }
}

testAdminStatus();
