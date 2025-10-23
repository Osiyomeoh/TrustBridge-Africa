// Test backend HCS message retrieval
const axios = require('axios');
require('dotenv').config();

const testBackendHCS = async () => {
  try {
    console.log('🔧 Testing backend HCS message retrieval...');
    
    // Test the backend endpoint
    const response = await axios.get('http://localhost:4001/api/hedera/rwa/trustbridge-assets');
    console.log('📊 Backend Response:', JSON.stringify(response.data, null, 2));
    
    // Test topic info
    const topicResponse = await axios.get('http://localhost:4001/api/hedera/rwa/topic-info');
    console.log('\n📊 Topic Info:', JSON.stringify(topicResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testBackendHCS();
