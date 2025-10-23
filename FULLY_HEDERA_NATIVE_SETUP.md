# 🚀 TrustBridge Fully Hedera Native Setup Guide

## Overview

TrustBridge is now **fully Hedera native** for admin management! This means:

- ✅ **No environment variables** needed for admin configuration
- ✅ **Native Hedera accounts** for all administrators
- ✅ **Database-driven** admin role management
- ✅ **Hedera network validation** for all admin accounts
- ✅ **Proper key management** with Hedera SDK

## What Changed

### Before (Hybrid System)
- Environment variables for admin wallets
- Mixed admin checking (env vars + Hedera + database)
- Complex configuration management

### Now (Fully Hedera Native)
- **Only Hedera native accounts** for admins
- **Database-driven** admin role management
- **Automatic Hedera network validation**
- **Simplified configuration**

## Quick Start

### 1. Create Your First Hedera Super Admin

Go to the admin dashboard and create your initial super admin:

1. Navigate to `/admin/hedera-admins`
2. Click **"Create Super Admin"** button
3. This creates a native Hedera account with full admin privileges
4. Save the account ID and private key securely

### 2. Create Additional Admin Accounts

Once you have a super admin, you can:

1. **Create Individual Admins**: Use the "Create Admin" form
2. **Setup All Admins**: Use "Setup All" to create a complete admin hierarchy

## Admin Role Hierarchy

### 🟡 Super Admin
- **Full system control**
- Can create/remove all admin accounts
- Can manage all platform settings
- Can assign/remove roles

### 🔵 Platform Admin
- Can manage users and assets
- Can manage platform settings
- Can manage other admins (except super admins)

### 🟢 AMC Admin
- Can manage asset-backed securities
- Can manage AMC operations
- Can manage asset verification

### ⚪ Regular Admin
- Basic admin privileges
- Can manage assets and users
- Limited system access

## API Endpoints

### Create Initial Super Admin
```bash
POST /api/admin/hedera/create-initial-super-admin
Authorization: Bearer <token>
```

### Create Admin Account
```bash
POST /api/admin/hedera/create-admin
Authorization: Bearer <token>
Content-Type: application/json

{
  "adminName": "New Admin",
  "role": "ADMIN"
}
```

### Setup All Admin Accounts
```bash
POST /api/admin/hedera/setup-admin-accounts
Authorization: Bearer <token>
```

### Get Admin Accounts
```bash
GET /api/admin/hedera/admin-accounts
Authorization: Bearer <token>
```

### Check Admin Status
```bash
GET /api/admin/hedera/admin-status/0.0.123456
Authorization: Bearer <token>
```

## Migration from Environment Variables

### Step 1: Remove Environment Variables
You can now remove these from your `.env` file:
```bash
# Remove these - no longer needed
ADMIN_WALLETS=...
SUPER_ADMIN_WALLET=...
PLATFORM_ADMIN_WALLETS=...
AMC_ADMIN_WALLETS=...
```

### Step 2: Create Hedera Native Admins
1. Use the admin dashboard to create your first super admin
2. Create additional admin accounts as needed
3. All admin data is now stored in the database

### Step 3: Update Your Workflow
- Admin accounts are now managed through the Hedera admin interface
- No need to update environment variables for admin changes
- All admin operations go through the Hedera native system

## Security Features

### 🔐 Native Hedera Accounts
- Each admin has a real Hedera account
- Proper key management with Hedera SDK
- Network validation for all accounts

### 🛡️ Database Security
- Admin roles stored securely in MongoDB
- Automatic KYC verification for admin accounts
- Role-based access control

### 🔍 Network Validation
- All admin accounts validated against Hedera network
- Deleted accounts automatically excluded
- Real-time account status checking

## Best Practices

### 1. Initial Setup
- Create your super admin account first
- Save the private key securely (it's only shown once)
- Test admin functionality before creating additional accounts

### 2. Key Management
- Store private keys securely
- Never expose private keys in logs or public repositories
- Consider using hardware wallets for production

### 3. Account Management
- Regularly audit admin accounts
- Remove unused admin accounts
- Monitor admin account activity

### 4. Security
- Use strong authentication for admin access
- Regularly review admin permissions
- Monitor for suspicious admin activity

## Troubleshooting

### Common Issues

#### 1. "No admin accounts found"
- **Solution**: Create your first super admin using "Create Super Admin" button

#### 2. "Permission denied"
- **Solution**: Ensure you're using a Hedera admin account, not an environment variable account

#### 3. "Account not found on Hedera network"
- **Solution**: Check if the account exists and is active on Hedera

#### 4. "Database connection error"
- **Solution**: Ensure MongoDB is running and accessible

### Debug Steps

1. **Check Hedera Network Connection**
   ```bash
   # Test Hedera connection
   curl -X GET /api/hedera/test-connection
   ```

2. **Verify Database Connection**
   ```bash
   # Check database status
   curl -X GET /api/health
   ```

3. **Check Admin Status**
   ```bash
   # Check if account is admin
   curl -X GET /api/admin/hedera/admin-status/YOUR_ACCOUNT_ID
   ```

## Environment Configuration

### Required Environment Variables
```bash
# Hedera Network (REQUIRED)
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/trustbridge

# JWT (REQUIRED)
JWT_SECRET=your-jwt-secret
```

### Optional Environment Variables
```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://trustbridge.africa
```

## Production Deployment

### 1. Environment Setup
- Set up Hedera mainnet credentials
- Configure production MongoDB
- Set secure JWT secrets

### 2. Admin Account Creation
- Create initial super admin account
- Create additional admin accounts as needed
- Test all admin functionality

### 3. Security Hardening
- Enable HTTPS
- Set up proper CORS configuration
- Configure rate limiting
- Set up monitoring and logging

### 4. Backup Strategy
- Regular database backups
- Secure storage of admin private keys
- Disaster recovery procedures

## Support

### Getting Help
1. Check the admin dashboard for error messages
2. Review API endpoint responses
3. Check server logs for detailed error information
4. Verify Hedera network status

### Contact Information
- **Technical Issues**: Check server logs and API responses
- **Admin Issues**: Use the admin dashboard interface
- **Network Issues**: Verify Hedera network connectivity

---

## 🎉 Congratulations!

You've successfully migrated to a **fully Hedera native admin system**! 

Your TrustBridge platform now uses:
- ✅ Native Hedera accounts for all administrators
- ✅ Database-driven admin role management
- ✅ Automatic Hedera network validation
- ✅ Simplified configuration management
- ✅ Enhanced security with proper key management

The system is now more secure, scalable, and truly decentralized with Hedera's native capabilities!
