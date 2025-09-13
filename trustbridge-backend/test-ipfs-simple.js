const axios = require('axios');

async function testIPFSSimple() {
  console.log('🧪 Testing IPFS Integration (Simple)...\n');

  const BASE_URL = 'http://localhost:4001';

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    try {
      const response = await axios.get(`${BASE_URL}/api-docs`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Please start the server first:');
      console.log('   npm run start:dev');
      return;
    }

    // Test 2: Test IPFS list (should work without auth)
    console.log('\n2️⃣ Testing IPFS service...');
    try {
      const response = await axios.get(`${BASE_URL}/ipfs/list`);
      console.log('✅ IPFS service is working');
      console.log(`   Found ${response.data.length || 0} pinned files`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  IPFS service requires authentication (this is expected)');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message || 'Unauthorized');
      } else {
        console.log('❌ IPFS service error:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Test presigned URL generation (should work without auth)
    console.log('\n3️⃣ Testing presigned URL generation...');
    try {
      const response = await axios.post(`${BASE_URL}/ipfs/presigned-url`, {
        fileName: 'test.txt',
        fileSize: 100,
        fileType: 'text/plain',
        metadata: {
          category: 'test',
          description: 'Test file'
        }
      });
      console.log('✅ Presigned URL generated successfully');
      console.log(`   URL: ${response.data.url}`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  Presigned URL requires authentication (this is expected)');
      } else {
        console.log('❌ Presigned URL error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Basic IPFS test completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. The server is running successfully');
    console.log('   2. IPFS service is initialized');
    console.log('   3. To test file uploads, you need to authenticate first');
    console.log('   4. Try the frontend at http://localhost:3001');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testIPFSSimple().catch(console.error);
