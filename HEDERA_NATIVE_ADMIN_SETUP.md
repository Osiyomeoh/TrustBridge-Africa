# Hedera Native Admin System Setup Guide

## Overview

The Hedera Native Admin System provides a hybrid approach to admin management that combines:
- **Existing Environment Variable System** (backward compatible)
- **New Hedera Native Admin Accounts** (native Hedera accounts with proper key management)
- **Database User Roles** (dynamic assignment)

## Environment Variables

Add these new environment variables to your `.env` file:

```bash
# Hedera Native Admin Configuration
HEDERA_SUPER_ADMIN_ACCOUNT=0.0.123456
HEDERA_PLATFORM_ADMIN_ACCOUNTS=0.0.234567,0.0.345678
HEDERA_AMC_ADMIN_ACCOUNTS=0.0.456789,0.0.567890
HEDERA_ADMIN_ACCOUNTS=0.0.678901,0.0.789012

# Existing admin configuration (still supported)
ADMIN_WALLETS=0x123...,0x456...
SUPER_ADMIN_WALLET=0x789...
PLATFORM_ADMIN_WALLETS=0xabc...,0xdef...
AMC_ADMIN_WALLETS=0x111...,0x222...
```

## Admin Role Hierarchy

### 1. Super Admin
- **Hedera Role**: `HEDERA_SUPER_ADMIN`
- **Permissions**: Full system control, can manage all admin accounts
- **Environment Variable**: `HEDERA_SUPER_ADMIN_ACCOUNT`

### 2. Platform Admin
- **Hedera Role**: `HEDERA_PLATFORM_ADMIN`
- **Permissions**: Can manage users, assets, and platform settings
- **Environment Variable**: `HEDERA_PLATFORM_ADMIN_ACCOUNTS`

### 3. AMC Admin
- **Hedera Role**: `HEDERA_AMC_ADMIN`
- **Permissions**: Can manage asset-backed securities and AMC operations
- **Environment Variable**: `HEDERA_AMC_ADMIN_ACCOUNTS`

### 4. Regular Admin
- **Hedera Role**: `HEDERA_ADMIN`
- **Permissions**: Basic admin privileges for platform operations
- **Environment Variable**: `HEDERA_ADMIN_ACCOUNTS`

## Setup Process

### 1. Initial Setup (One-time)

Use the admin dashboard to create all admin accounts:

1. Go to `/admin/hedera-admins`
2. Click "Setup All" button
3. This creates:
   - 1 Super Admin account
   - 2 Platform Admin accounts
   - 2 AMC Admin accounts
   - 2 Regular Admin accounts

### 2. Manual Setup

You can also create individual admin accounts:

1. Go to `/admin/hedera-admins`
2. Click "Create Admin"
3. Enter admin name and select role
4. The system will create a new Hedera account and assign the role

### 3. Environment Configuration

After creating accounts, update your environment variables:

```bash
# Example after setup
HEDERA_SUPER_ADMIN_ACCOUNT=0.0.123456
HEDERA_PLATFORM_ADMIN_ACCOUNTS=0.0.234567,0.0.345678
HEDERA_AMC_ADMIN_ACCOUNTS=0.0.456789,0.0.567890
HEDERA_ADMIN_ACCOUNTS=0.0.678901,0.0.789012
```

## API Endpoints

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

### Remove Admin Account
```bash
DELETE /api/admin/hedera/remove-admin
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountId": "0.0.123456"
}
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

### Setup All Admin Accounts
```bash
POST /api/admin/hedera/setup-admin-accounts
Authorization: Bearer <token>
```

## Admin Flow Priority

The system checks admin privileges in this order:

1. **Environment Variable Admins** (existing system - backward compatible)
2. **Hedera Native Admin Accounts** (new system)
3. **Database User Roles** (existing system - backward compatible)

## Security Features

### 1. Key Management
- Each admin account has its own private key
- Keys are generated securely using Hedera SDK
- Private keys are returned only during account creation

### 2. Account Validation
- All admin accounts are validated against Hedera network
- Accounts must exist and be active
- Deleted accounts are automatically excluded

### 3. Permission System
- Role-based permissions with granular control
- Permission checking at API level
- Frontend route protection based on roles

## Frontend Integration

### Admin Dashboard
- New "Hedera Admin Management" section
- Available to Super Admins and Platform Admins
- Real-time admin account management

### Navigation
- Added to admin actions in dashboard
- Route: `/admin/hedera-admins`
- Integrated with existing admin flow

## Migration from Existing System

The new system is **100% backward compatible**:

1. **Existing environment variables** continue to work
2. **Existing database roles** continue to work
3. **Existing admin permissions** are preserved
4. **No breaking changes** to current functionality

## Best Practices

### 1. Account Management
- Keep private keys secure and never expose them
- Use the setup process for initial deployment
- Regularly audit admin accounts

### 2. Environment Variables
- Use comma-separated values for multiple accounts
- Keep account IDs in lowercase for consistency
- Document all admin accounts in your deployment

### 3. Security
- Only Super Admins should create new admin accounts
- Regularly review admin permissions
- Monitor admin account activity

## Troubleshooting

### Common Issues

1. **Account not found**: Ensure account exists on Hedera network
2. **Permission denied**: Check if user has required admin role
3. **Setup failed**: Verify Hedera credentials and network connection

### Debug Steps

1. Check Hedera network connection
2. Verify environment variables
3. Check admin role assignments
4. Review API logs for errors

## Support

For issues or questions:
1. Check the admin dashboard logs
2. Review API endpoint responses
3. Verify Hedera account status
4. Contact system administrator

---

**Note**: This system provides a robust, scalable admin management solution that leverages Hedera's native capabilities while maintaining full backward compatibility with existing systems.
