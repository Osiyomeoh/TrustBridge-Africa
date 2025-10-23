const { Client, TopicCreateTransaction, TopicMessageSubmitTransaction, TopicId, PrivateKey } = require('@hashgraph/sdk');

// Test HCS operations
async function testHCSOperations() {
  console.log('🔍 Testing HCS Operations...\n');

  // Initialize Hedera client
  const client = Client.forTestnet();
  const operatorId = process.env.HEDERA_ACCOUNT_ID || '0.0.6916959';
  const operatorKey = process.env.HEDERA_PRIVATE_KEY || '0x29b72f47916186bb1cf4b823429d99f6e5659703b0201a8381211a468a1e2a19';

  try {
    // Convert the private key to the correct format
    const privateKey = PrivateKey.fromStringECDSA(operatorKey);
    client.setOperator(operatorId, privateKey);
    console.log('✅ Hedera client initialized with operator:', operatorId);

    // Test 1: Create a new HCS topic
    console.log('\n📝 Test 1: Creating HCS Topic...');
    const topicCreateTx = new TopicCreateTransaction()
      .setTopicMemo('TrustBridge RWA Asset Registry - Test Topic')
      .setMaxTransactionFee(5000);

    const topicCreateResponse = await topicCreateTx.execute(client);
    const topicCreateReceipt = await topicCreateResponse.getReceipt(client);
    
    if (topicCreateReceipt.topicId) {
      const topicId = topicCreateReceipt.topicId.toString();
      console.log('✅ HCS Topic created successfully:', topicId);

      // Test 2: Submit a message to the topic
      console.log('\n📤 Test 2: Submitting message to HCS topic...');
      const testMessage = JSON.stringify({
        type: 'TEST_MESSAGE',
        timestamp: Date.now(),
        data: 'This is a test message for TrustBridge HCS topic',
        sender: operatorId
      });

      const messageBuffer = Buffer.from(testMessage);
      
      const submitTx = new TopicMessageSubmitTransaction()
        .setTopicId(topicCreateReceipt.topicId)
        .setMessage(messageBuffer)
        .setMaxTransactionFee(5000);

      console.log('🔧 Freezing transaction...');
      const frozenTx = submitTx.freezeWith(client);
      console.log('✅ Transaction frozen successfully');

      console.log('🔧 Executing transaction...');
      const submitResponse = await frozenTx.execute(client);
      const submitReceipt = await submitResponse.getReceipt(client);
      
      console.log('✅ Message submitted to HCS topic successfully');
      console.log('📊 Transaction ID:', submitResponse.transactionId.toString());
      console.log('📊 Topic ID:', topicId);

      // Test 3: Try different freezing approaches
      console.log('\n🔧 Test 3: Testing different freezing approaches...');
      
      // Approach 1: freeze() without client
      try {
        console.log('Testing freeze() without client...');
        const testTx1 = new TopicMessageSubmitTransaction()
          .setTopicId(topicCreateReceipt.topicId)
          .setMessage(Buffer.from('test1'));
        
        const frozen1 = testTx1.freeze();
        console.log('✅ freeze() works without client');
      } catch (error) {
        console.log('❌ freeze() failed:', error.message);
      }

      // Approach 2: freezeWith(client)
      try {
        console.log('Testing freezeWith(client)...');
        const testTx2 = new TopicMessageSubmitTransaction()
          .setTopicId(topicCreateReceipt.topicId)
          .setMessage(Buffer.from('test2'));
        
        const frozen2 = testTx2.freezeWith(client);
        console.log('✅ freezeWith(client) works');
      } catch (error) {
        console.log('❌ freezeWith(client) failed:', error.message);
      }

      // Approach 3: freezeWithSigner (if available)
      try {
        console.log('Testing freezeWithSigner...');
        const testTx3 = new TopicMessageSubmitTransaction()
          .setTopicId(topicCreateReceipt.topicId)
          .setMessage(Buffer.from('test3'));
        
        // This might not be available, but let's test
        if (typeof testTx3.freezeWithSigner === 'function') {
          console.log('✅ freezeWithSigner method exists');
        } else {
          console.log('❌ freezeWithSigner method not available');
        }
      } catch (error) {
        console.log('❌ freezeWithSigner test failed:', error.message);
      }

      return {
        topicId: topicId,
        success: true
      };

    } else {
      console.log('❌ Failed to create HCS topic');
      return { success: false };
    }

  } catch (error) {
    console.error('❌ Error in HCS operations test:', error);
    return { success: false, error: error.message };
  } finally {
    client.close();
  }
}

// Run the test
testHCSOperations()
  .then(result => {
    console.log('\n📊 Test Results:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
