# Hedera Integration Troubleshooting Guide
## "What Went Wrong and How We Fixed It"

---

## 🚨 CRITICAL MISTAKES & THEIR SOLUTIONS

### 1. **BALANCE CHECK PROTOBUF ERROR**
**❌ What Went Wrong:**
```typescript
// This caused: (BUG) body.data was not set in the protobuf
const balance = await signer.getAccountBalance(AccountId.fromString(accountId));
```

**✅ How We Fixed It:**
```typescript
// Use Mirror Node API instead - NO PROTOBUF ERRORS
const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
const accountData = await response.json();
const balance = accountData.balance?.balance || 0;
addLog(`Account balance: ${balance / 100000000} HBAR`);
```

**🎯 Lesson Learned:** NEVER use `signer.getAccountBalance()` - always use Mirror Node API for balance checks.

---

### 2. **KEY MANAGEMENT PROTOBUF ERRORS**
**❌ What Went Wrong:**
```typescript
// These caused: _toProtobufKey is not a function
const fileCreateTx = new FileCreateTransaction()
  .setContents(fileBytes)
  .setKeys([AccountId.fromString(accountId)]); // ❌ ERROR!

const topicCreateTx = new TopicCreateTransaction()
  .setTopicMemo(`Topic_${Date.now()}`)
  .setSubmitKey(AccountId.fromString(accountId)); // ❌ ERROR!
```

**✅ How We Fixed It:**
```typescript
// Just omit the key settings - let Hedera handle it automatically
const fileCreateTx = new FileCreateTransaction()
  .setContents(fileBytes); // ✅ WORKS!

const topicCreateTx = new TopicCreateTransaction()
  .setTopicMemo(`Topic_${Date.now()}`); // ✅ WORKS!
```

**🎯 Lesson Learned:** NEVER set explicit keys with `AccountId` objects - Hedera handles keys automatically.

---

### 3. **WRONG TRANSACTION EXECUTION METHODS**
**❌ What Went Wrong:**
```typescript
// These methods DON'T EXIST or cause errors:
signer.execute(transaction) // ❌ Not a function
signer.call({ method: 'hedera_executeTransaction', params: { transaction } }) // ❌ Protobuf errors
await signer.populateTransaction(transaction) // ❌ Caused "no transaction to sign"
```

**✅ How We Fixed It:**
```typescript
// The ONLY working pattern:
// 1. Freeze transaction
transaction.freezeWithSigner(signer);

// 2. Sign transaction (triggers HashPack popup)
const signedTransaction = await signer.signTransaction(transaction);

// 3. Execute signed transaction
const response = await signedTransaction.execute(hederaClient);
```

**🎯 Lesson Learned:** ONLY use `freezeWithSigner()` → `signTransaction()` → `execute()` pattern.

---

### 4. **INSUFFICIENT TRANSACTION FEES**
**❌ What Went Wrong:**
```typescript
// Missing transaction fees caused: INSUFFICIENT_TX_FEE
const tokenCreateTx = new TokenCreateTransaction()
  .setTokenName("Token")
  .setTokenSymbol("TKN"); // ❌ No fee set!
```

**✅ How We Fixed It:**
```typescript
// ALWAYS set explicit fees
const tokenCreateTx = new TokenCreateTransaction()
  .setTokenName("Token")
  .setTokenSymbol("TKN")
  .setMaxTransactionFee(1000); // ✅ 1000 tinybars = 0.001 HBAR
```

**🎯 Lesson Learned:** ALWAYS set `setMaxTransactionFee(1000)` on every transaction.

---

### 5. **WRONG ID EXTRACTION METHODS**
**❌ What Went Wrong:**
```typescript
// These don't work for getting resource IDs:
const tokenId = response.tokenId; // ❌ Undefined
const fileId = response.fileId; // ❌ Undefined
const topicId = response.topicId; // ❌ Undefined
```

**✅ How We Fixed It:**
```typescript
// ALWAYS get IDs from transaction receipts
const receipt = await response.getReceipt(hederaClient);
const tokenId = receipt.tokenId; // ✅ Works!
const fileId = receipt.fileId; // ✅ Works!
const topicId = receipt.topicId; // ✅ Works!
```

**🎯 Lesson Learned:** Resource IDs are in the receipt, NOT in the response object.

---

### 6. **QUERY OPERATIONS WITH WRONG CLIENT**
**❌ What Went Wrong:**
```typescript
// This caused: `client` must have an `operator`
const query = new FileContentsQuery().setFileId(fileId);
const fileContents = await query.execute(hederaClient); // ❌ Needs operator

const topicQuery = new TopicInfoQuery().setTopicId(topicId);
const topicInfo = await topicQuery.execute(hederaClient); // ❌ Needs operator
```

**✅ How We Fixed It:**
```typescript
// Use Mirror Node API for ALL queries
const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/files/${fileId}/contents`);
const fileContents = await response.text();

const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}`);
const topicInfo = await response.json();
```

**🎯 Lesson Learned:** NEVER use Hedera client for queries - always use Mirror Node API.

---

### 7. **MESSAGE DECODING ISSUES**
**❌ What Went Wrong:**
```typescript
// This showed binary garbage:
const message = new TextDecoder().decode(Uint8Array.from(atob(msg.message)));
// Result: "  " (unreadable binary data)
```

**✅ How We Fixed It:**
```typescript
// Proper multi-step decoding:
let decodedContent = '';
try {
  // First decode base64
  decodedContent = atob(msg.message);
  
  // Check if it's readable text
  if (!/^[\x20-\x7E\s]*$/.test(decodedContent)) {
    // If not readable, try UTF-8 decoding
    const bytes = new Uint8Array(decodedContent.split('').map(char => char.charCodeAt(0)));
    decodedContent = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }
} catch (e) {
  decodedContent = `[Binary data - ${msg.message.length} bytes]`;
}
```

**🎯 Lesson Learned:** HCS messages need proper base64 → UTF-8 decoding with error handling.

---

### 8. **TIMESTAMP FORMATTING ERRORS**
**❌ What Went Wrong:**
```typescript
// This showed "Invalid Date":
const timestamp = new Date(msg.consensus_timestamp);
// Result: "Invalid Date"
```

**✅ How We Fixed It:**
```typescript
// Proper Hedera timestamp conversion:
const timestampParts = msg.consensus_timestamp.split('.');
const seconds = parseInt(timestampParts[0]);
const formattedTimestamp = new Date(seconds * 1000).toISOString();
// Result: "2025-09-27T23:08:58.357Z"
```

**🎯 Lesson Learned:** Hedera timestamps need conversion from seconds to milliseconds.

---

## 🔧 THE ONLY WORKING PATTERNS

### Transaction Pattern (ALWAYS USE THIS)
```typescript
const transaction = new [TransactionType]()
  .set[Property]("value")
  .setMaxTransactionFee(1000); // ALWAYS set fee

transaction.freezeWithSigner(signer);
const signedTransaction = await signer.signTransaction(transaction);
const response = await signedTransaction.execute(hederaClient);
const receipt = await response.getReceipt(hederaClient);
const resourceId = receipt.[resourceType]Id; // tokenId, fileId, topicId
```

### Query Pattern (ALWAYS USE THIS)
```typescript
const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/[endpoint]`);
const data = await response.json();
```

### Message Decoding Pattern (ALWAYS USE THIS)
```typescript
let decodedContent = atob(msg.message);
if (!/^[\x20-\x7E\s]*$/.test(decodedContent)) {
  const bytes = new Uint8Array(decodedContent.split('').map(char => char.charCodeAt(0)));
  decodedContent = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}
```

---

## 🚨 NEVER DO THESE AGAIN

1. ❌ `signer.getAccountBalance()` - Use Mirror Node API
2. ❌ `.setKeys([AccountId.fromString(id)])` - Let Hedera handle keys
3. ❌ `.setSubmitKey(AccountId.fromString(id))` - Let Hedera handle keys
4. ❌ `signer.execute()` - Not a function
5. ❌ `signer.call()` - Protobuf errors
6. ❌ `populateTransaction()` - Caused "no transaction to sign"
7. ❌ Missing `setMaxTransactionFee()` - INSUFFICIENT_TX_FEE errors
8. ❌ `response.tokenId` - Use `receipt.tokenId`
9. ❌ `query.execute(hederaClient)` - Use Mirror Node API
10. ❌ `new Date(hederaTimestamp)` - Convert seconds to milliseconds

---

## ✅ ALWAYS DO THESE

1. ✅ Set `setMaxTransactionFee(1000)` on every transaction
2. ✅ Use `freezeWithSigner()` → `signTransaction()` → `execute()` pattern
3. ✅ Get resource IDs from `response.getReceipt(hederaClient)`
4. ✅ Use Mirror Node API for all queries
5. ✅ Let Hedera handle keys automatically
6. ✅ Proper message decoding with error handling
7. ✅ Convert Hedera timestamps properly
8. ✅ Handle all errors gracefully
9. ✅ Log everything for debugging
10. ✅ Test each service individually first

---

## 🎯 SUCCESS METRICS

After following these patterns, you should see:
- ✅ HashPack popup appears for transactions
- ✅ Transactions execute successfully
- ✅ Resource IDs are properly extracted
- ✅ Messages are readable (not binary garbage)
- ✅ Timestamps show proper dates
- ✅ No protobuf errors
- ✅ No "operator" errors
- ✅ No "insufficient fee" errors

---

**Remember: These patterns are PROVEN to work. Don't deviate from them!**
