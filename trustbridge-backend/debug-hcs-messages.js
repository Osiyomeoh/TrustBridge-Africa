// Debug script to check HCS messages
const axios = require('axios');
require('dotenv').config();

const debugHCSMessages = async () => {
  try {
    console.log('🔧 Debugging HCS messages...');
    
    const topicId = '0.0.7103462';
    console.log(`📊 Checking topic: ${topicId}`);
    
    // Get raw messages from Mirror Node
    const response = await axios.get(`https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?order=desc&limit=10`);
    
    console.log(`📝 Found ${response.data.messages?.length || 0} messages`);
    
    if (response.data.messages) {
      response.data.messages.forEach((msg, i) => {
        console.log(`\n--- Message ${i + 1} ---`);
        console.log('Sequence:', msg.sequence_number);
        console.log('Timestamp:', msg.consensus_timestamp);
        console.log('Raw message:', msg.message);
        
        try {
          const decoded = JSON.parse(Buffer.from(msg.message, 'base64').toString());
          console.log('Decoded message:', JSON.stringify(decoded, null, 2));
        } catch (e) {
          console.log('Failed to decode message:', e.message);
        }
      });
    }
    
    // Test the backend endpoint
    console.log('\n🔧 Testing backend endpoint...');
    const backendResponse = await axios.get('http://localhost:4001/api/hedera/rwa/trustbridge-assets');
    console.log('Backend response:', JSON.stringify(backendResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

debugHCSMessages();
