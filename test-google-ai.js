#!/usr/bin/env node

/**
 * Test script for Google AI (Gemini) integration
 * Run this after setting your GEMINI_API_KEY environment variable
 */

const axios = require('axios');

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function testGoogleAI() {
  console.log('🤖 Testing Google AI (Gemini) Integration...\n');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY environment variable not set!');
    console.log('Please run: export GOOGLE_AI_API_KEY="your_actual_api_key_here"');
    process.exit(1);
  }
  
  console.log('✅ GEMINI_API_KEY found');
  console.log(`🔗 Using API URL: ${API_URL}`);
  
  try {
    const response = await axios.post(
      `${API_URL}?key=${GEMINI_API_KEY}`,
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
testGoogleAI();
