# HashPack Setup Guide for TrustBridge

## 🚀 **Quick Setup for Real Hedera Transactions**

### **Step 1: Install HashPack Wallet**
1. **Download HashPack**: Go to https://hashpack.app/
2. **Install Extension**: Add HashPack to your browser (Chrome/Firefox/Edge)
3. **Create Account**: Set up a new Hedera testnet account
4. **Get Test HBAR**: Use the testnet faucet to get free test HBAR

### **Step 2: Get WalletConnect Project ID**
1. **Go to WalletConnect Cloud**: https://cloud.walletconnect.com/
2. **Sign up/Login** with your account
3. **Create New Project**:
   - Name: "TrustBridge"
   - Description: "Asset tokenization platform"
4. **Copy Project ID**: It looks like `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### **Step 3: Update Environment Variables**
Add to your `.env` file:
```bash
WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### **Step 4: Test the Integration**
1. **Start the frontend**: `npm run dev`
2. **Go to Asset Verification page**
3. **Click "Connect" next to HashPack status**
4. **Create an asset** - you'll get real Hedera transactions!

## 🎯 **What You'll Get with HashPack:**

### **Real Hedera Transactions:**
- ✅ **Transaction ID**: `0.0.12345@1234567890.123456789`
- ✅ **Token ID**: `0.0.12346` (real token on Hedera)
- ✅ **Verifiable on Hashscan**: https://hashscan.io/testnet/transaction/...
- ✅ **Real blockchain data**: Actual token creation on Hedera testnet

### **vs MetaMask (Signature Only):**
- ❌ **Transaction ID**: `0x...` (just a signature hash)
- ❌ **Token ID**: `pending_0x...` (not a real token)
- ❌ **Not verifiable on Hashscan**: Just a message signature
- ❌ **Backend handles creation**: Token created by backend operator

## 🔧 **Troubleshooting:**

### **HashPack Not Connecting:**
1. **Check if extension is installed**
2. **Make sure you're on testnet**
3. **Try refreshing the page**
4. **Check browser console for errors**

### **No Real Transactions:**
1. **Ensure HashPack is connected** (green dot)
2. **Check that you have test HBAR**
3. **Verify WalletConnect Project ID is set**

### **Transaction Fails:**
1. **Check Hedera account has enough HBAR**
2. **Verify account permissions**
3. **Check network connection**

## 📱 **Current Status:**

- ✅ **MetaMask Integration**: Working (signature only)
- ✅ **HashPack Integration**: Ready (real transactions)
- ✅ **Smart Detection**: Automatically uses HashPack if available
- ✅ **Fallback**: Uses MetaMask if HashPack not available

## 🎉 **Next Steps:**

1. **Install HashPack** and get WalletConnect Project ID
2. **Test the connection** on the asset verification page
3. **Create an asset** and see real Hedera transactions!
4. **Verify on Hashscan** using the transaction ID

---

**Need Help?** Check the browser console for detailed logs and error messages.
