#!/usr/bin/env node

/**
 * Direct test of Google AI API using the .env file
 */

require('dotenv').config({ path: './trustbridge-backend/.env' });
const axios = require('axios');

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function testGoogleAIDirect() {
  console.log('🤖 Testing Google AI (Gemini) Integration...\n');
  
  if (!GOOGLE_AI_API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY not found in .env file!');
    console.log('Please check your .env file in trustbridge-backend/.env');
    process.exit(1);
  }
  
  console.log('✅ GOOGLE_AI_API_KEY found');
  console.log(`🔗 Using API URL: ${API_URL}`);
  
  try {
    const response = await axios.post(
      `${API_URL}?key=${GOOGLE_AI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: "Hello! Can you explain what TrustBridge is in one sentence?"
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (aiResponse) {
      console.log('\n✅ Google AI Response:');
      console.log('─'.repeat(50));
      console.log(aiResponse);
      console.log('─'.repeat(50));
      console.log('\n🎉 Google AI integration is working perfectly!');
    } else {
      console.log('❌ Unexpected response format:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing Google AI:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testGoogleAIDirect();
