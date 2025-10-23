# 🔧 Hedera Interaction Setup Guide

## Overview

To create your Hedera super admin account, you need to interact with the Hedera network. This guide will help you set up the interaction properly.

## Prerequisites

### 1. Hedera Account Setup

You need a Hedera account with HBAR to create new accounts. Get one from:
- **Testnet**: https://portal.hedera.com/ (free testnet accounts)
- **Mainnet**: https://portal.hedera.com/ (real HBAR required)

### 2. Required Environment Variables

Update your `.env` file with your Hedera credentials:

```bash
# Hedera Network Configuration
HEDERA_NETWORK=testnet  # or 'mainnet' for production
HEDERA_ACCOUNT_ID=0.0.YOUR_REAL_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_REAL_PRIVATE_KEY
```

## Quick Setup Options

### Option 1: Using the Script (Recommended)

1. **Update your .env file** with your Hedera credentials
2. **Run the creation script**:
   ```bash
   cd trustbridge-backend
   node create-hedera-super-admin.js
   ```
3. **Save the generated credentials** securely
4. **Update your .env** with the new super admin account ID

### Option 2: Using the Admin Dashboard

1. **Start your backend server** with proper Hedera credentials
2. **Go to** `/admin/hedera-admins`
3. **Click "Create Super Admin"**
4. **Save the generated credentials**

### Option 3: Using the API

1. **Make sure your backend is running** with Hedera credentials
2. **Call the API endpoint**:
   ```bash
   curl -X POST http://localhost:4000/api/admin/hedera/create-initial-super-admin \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json"
   ```

## Step-by-Step Setup

### Step 1: Get Hedera Credentials

1. Go to https://portal.hedera.com/
2. Create a new account or use existing one
3. Copy your Account ID and Private Key
4. Make sure you have some HBAR (at least 20 HBAR for creating accounts)

### Step 2: Update Environment Variables

Create or update your `.env` file:

```bash
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.123456  # Your real account ID
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...  # Your real private key

# Database
MONGODB_URI=mongodb://localhost:27017/trustbridge

# JWT
JWT_SECRET=your-jwt-secret-here

# Server
PORT=4000
NODE_ENV=development
```

### Step 3: Install Dependencies

Make sure you have the required packages:

```bash
cd trustbridge-backend
npm install @hashgraph/sdk dotenv
```

### Step 4: Create Super Admin

Run the script:

```bash
node create-hedera-super-admin.js
```

### Step 5: Save Credentials

The script will output:
```
🎯 SUPER ADMIN DETAILS:
   Account ID: 0.0.789012
   Private Key: 302e020100300506032b657004220420...
   Public Key: 302a300506032b6570032100...
   Initial Balance: 10 HBAR
```

**IMPORTANT**: Save the private key securely - it won't be shown again!

### Step 6: Update Configuration

Add the new super admin to your `.env`:

```bash
HEDERA_SUPER_ADMIN_ACCOUNT=0.0.789012
```

## Testing the Setup

### 1. Verify Hedera Connection

```bash
curl -X GET http://localhost:4000/api/hedera/test-connection
```

### 2. Check Admin Status

```bash
curl -X GET http://localhost:4000/api/admin/hedera/admin-status/0.0.789012
```

### 3. Test Admin Dashboard

1. Go to `/admin/hedera-admins`
2. You should see your super admin account
3. Try creating additional admin accounts

## Troubleshooting

### Common Issues

#### 1. "INSUFFICIENT_ACCOUNT_BALANCE"
- **Solution**: Add more HBAR to your Hedera account
- **Testnet**: Get free HBAR from https://portal.hedera.com/
- **Mainnet**: Buy HBAR from exchanges

#### 2. "INVALID_ACCOUNT_ID"
- **Solution**: Check your HEDERA_ACCOUNT_ID format
- **Format**: Should be `0.0.XXXXXX`

#### 3. "INVALID_PRIVATE_KEY"
- **Solution**: Check your HEDERA_PRIVATE_KEY format
- **Format**: Should start with `302e020100300506032b657004220420`

#### 4. "Network connection failed"
- **Solution**: Check your internet connection and Hedera network status
- **Testnet**: https://status.hedera.com/

### Debug Steps

1. **Check environment variables**:
   ```bash
   echo $HEDERA_ACCOUNT_ID
   echo $HEDERA_PRIVATE_KEY
   ```

2. **Test Hedera connection**:
   ```bash
   node -e "
   const { Client, AccountId, PrivateKey } = require('@hashgraph/sdk');
   const client = Client.forTestnet();
   client.setOperator(AccountId.fromString('$HEDERA_ACCOUNT_ID'), PrivateKey.fromString('$HEDERA_PRIVATE_KEY'));
   console.log('Connection successful!');
   "
   ```

3. **Check account balance**:
   ```bash
   node -e "
   const { Client, AccountId, PrivateKey, AccountBalanceQuery } = require('@hashgraph/sdk');
   const client = Client.forTestnet();
   client.setOperator(AccountId.fromString('$HEDERA_ACCOUNT_ID'), PrivateKey.fromString('$HEDERA_PRIVATE_KEY'));
   const balance = await new AccountBalanceQuery().setAccountId(AccountId.fromString('$HEDERA_ACCOUNT_ID')).execute(client);
   console.log('Balance:', balance.hbars.toString());
   "
   ```

## Security Best Practices

### 1. Private Key Security
- Never commit private keys to version control
- Store private keys in secure environment variables
- Use different accounts for development and production
- Consider using hardware wallets for production

### 2. Environment Security
- Use `.env` files for local development
- Use secure environment variable management for production
- Never share private keys in logs or error messages

### 3. Network Security
- Use testnet for development
- Use mainnet only for production
- Monitor account balances regularly
- Set up alerts for low balances

## Production Deployment

### 1. Mainnet Setup
- Change `HEDERA_NETWORK=mainnet`
- Use real HBAR for account creation
- Set up proper monitoring and alerts

### 2. Security Hardening
- Use secure environment variable management
- Set up proper backup procedures
- Monitor admin account activity
- Regular security audits

## Support

### Getting Help
1. Check the Hedera documentation: https://docs.hedera.com/
2. Join the Hedera community: https://hedera.com/community
3. Check the TrustBridge logs for detailed error messages

### Useful Links
- **Hedera Portal**: https://portal.hedera.com/
- **Hedera Documentation**: https://docs.hedera.com/
- **Hedera Status**: https://status.hedera.com/
- **Hedera Community**: https://hedera.com/community

---

## 🎯 Quick Start Summary

1. **Get Hedera credentials** from https://portal.hedera.com/
2. **Update .env file** with your credentials
3. **Run the script**: `node create-hedera-super-admin.js`
4. **Save the generated credentials** securely
5. **Update .env** with the new super admin account ID
6. **Test the setup** using the admin dashboard

You're now ready to interact with Hedera and create your super admin account! 🚀
