# 🧪 Admin Flow Testing Guide

This guide provides comprehensive instructions for testing all admin functionality in the TrustBridge system.

## 📋 Prerequisites

1. **Backend Server Running**: Make sure the backend server is running on `http://localhost:3000`
2. **Frontend Server Running**: Make sure the frontend server is running on `http://localhost:5173`
3. **Database Connected**: Ensure MongoDB is connected and running
4. **Hedera Network**: Ensure Hedera testnet connection is working

## 🚀 Quick Start Testing

### Step 1: Start the Backend Server
```bash
cd trustbridge-backend
npm run start:dev
```

### Step 2: Start the Frontend Server
```bash
cd trustbridge-frontend
npm run dev
```

### Step 3: Run Automated Tests
```bash
cd /Users/MAC/Documents/TrustBridge
node test-admin-flow.js
```

## 🔍 Manual Testing Steps

### 1. **Health Check**
- **Endpoint**: `GET /health`
- **Expected**: Server status and basic information
- **Test**: Open browser to `http://localhost:3000/health`

### 2. **Admin Authentication**
- **Endpoint**: `POST /api/auth/login`
- **Test**: Login with admin credentials
- **Expected**: JWT token returned

### 3. **Hedera Admin Management**

#### 3.1 Check Admin Status
- **Endpoint**: `GET /api/admin/status/{walletAddress}`
- **Test**: Check if wallet has admin privileges
- **Expected**: Admin role and permissions

#### 3.2 Create Hedera Admin
- **Endpoint**: `POST /api/admin/hedera/create-admin`
- **Body**:
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "role": "SUPER_ADMIN"
}
```
- **Expected**: Admin account created successfully

#### 3.3 Get Admin Accounts
- **Endpoint**: `GET /api/admin/hedera/admin-accounts`
- **Expected**: List of all admin accounts

#### 3.4 Setup Admin Accounts
- **Endpoint**: `POST /api/admin/hedera/setup-admin-accounts`
- **Expected**: Initial admin setup completed

### 4. **AMC Pool Management**

#### 4.1 Create AMC Pool
- **Endpoint**: `POST /api/amc-pools`
- **Body**:
```json
{
  "name": "Test Investment Pool",
  "description": "A test pool for admin flow testing",
  "assets": ["asset1", "asset2"],
  "totalValue": 1000000,
  "tokenSupply": 1000000,
  "tokenPrice": 1.0,
  "apy": 8.5,
  "maturityDate": "2025-12-31T23:59:59.999Z",
  "status": "ACTIVE"
}
```
- **Expected**: Pool created with Hedera token

#### 4.2 Get AMC Pool
- **Endpoint**: `GET /api/amc-pools/{id}`
- **Expected**: Pool details returned

#### 4.3 Update AMC Pool
- **Endpoint**: `PUT /api/amc-pools/{id}`
- **Expected**: Pool updated successfully

#### 4.4 Get All Pools
- **Endpoint**: `GET /api/amc-pools`
- **Expected**: List of all pools

#### 4.5 Delete AMC Pool
- **Endpoint**: `DELETE /api/amc-pools/{id}`
- **Expected**: Pool deleted successfully

### 5. **Trading System**

#### 5.1 Create Trading Order
- **Endpoint**: `POST /api/trading/order`
- **Body**:
```json
{
  "poolTokenId": "test-pool-token-1",
  "orderType": "BUY",
  "amount": 100,
  "price": 1.0,
  "userId": "test-user-1"
}
```
- **Expected**: Order created and added to orderbook

#### 5.2 Get Orderbook
- **Endpoint**: `GET /api/trading/orderbook/{poolTokenId}`
- **Expected**: Buy and sell orders for the pool token

#### 5.3 Get Trades
- **Endpoint**: `GET /api/trading/trades/{poolTokenId}`
- **Expected**: List of executed trades

#### 5.4 Cancel Order
- **Endpoint**: `DELETE /api/trading/order/{orderId}`
- **Expected**: Order cancelled successfully

### 6. **Pool Token Management**

#### 6.1 Get Holdings
- **Endpoint**: `GET /api/pool-tokens/holdings/{userId}`
- **Expected**: User's pool token holdings

#### 6.2 Transfer Tokens
- **Endpoint**: `POST /api/pool-tokens/transfer`
- **Body**:
```json
{
  "fromUserId": "test-user-1",
  "toUserId": "test-user-2",
  "poolTokenId": "test-pool-token-1",
  "amount": 50
}
```
- **Expected**: Tokens transferred successfully

#### 6.3 Claim Dividends
- **Endpoint**: `POST /api/pool-tokens/claim-dividends`
- **Body**:
```json
{
  "userId": "test-user-1",
  "poolTokenId": "test-pool-token-1"
}
```
- **Expected**: Dividends claimed successfully

#### 6.4 Stake Tokens
- **Endpoint**: `POST /api/pool-tokens/stake`
- **Body**:
```json
{
  "userId": "test-user-1",
  "poolTokenId": "test-pool-token-1",
  "amount": 100
}
```
- **Expected**: Tokens staked successfully

### 7. **Dividend Distribution**

#### 7.1 Create Dividend Distribution
- **Endpoint**: `POST /api/dividends/distribute`
- **Body**:
```json
{
  "poolId": "test-pool-1",
  "amount": 10000,
  "description": "Test dividend distribution"
}
```
- **Expected**: Dividend distribution created

#### 7.2 Get Dividend Distributions
- **Endpoint**: `GET /api/dividends/distributions`
- **Expected**: List of dividend distributions

#### 7.3 Get Pool Dividends
- **Endpoint**: `GET /api/dividends/pool/{poolId}`
- **Expected**: Dividends for specific pool

### 8. **RWA Asset Management**

#### 8.1 Create RWA Asset
- **Endpoint**: `POST /api/rwa/assets`
- **Body**:
```json
{
  "name": "Test RWA Asset",
  "description": "A test real-world asset",
  "value": 500000,
  "location": "Test Location",
  "category": "REAL_ESTATE"
}
```
- **Expected**: RWA asset created

#### 8.2 Get RWA Assets
- **Endpoint**: `GET /api/rwa/assets`
- **Expected**: List of RWA assets

#### 8.3 Update RWA Asset
- **Endpoint**: `PUT /api/rwa/assets/{id}`
- **Expected**: RWA asset updated

## 🎯 Frontend Testing

### 1. **Admin Dashboard**
- **URL**: `http://localhost:5173/dashboard/admin`
- **Test**: Login as admin and access dashboard
- **Expected**: Admin dashboard with all features visible

### 2. **Hedera Admin Management**
- **URL**: `http://localhost:5173/admin/hedera-admins`
- **Test**: Create, view, and manage Hedera admin accounts
- **Expected**: Admin management interface working

### 3. **AMC Pool Management**
- **URL**: `http://localhost:5173/admin/amc-pools`
- **Test**: Create, view, and manage AMC pools
- **Expected**: Pool management interface working

### 4. **Dividend Management**
- **URL**: `http://localhost:5173/admin/dividend-management`
- **Test**: Create and manage dividend distributions
- **Expected**: Dividend management interface working

### 5. **Pool Marketplace**
- **URL**: `http://localhost:5173/pools`
- **Test**: View available investment pools
- **Expected**: Pool marketplace interface working

### 6. **Trading Interface**
- **URL**: `http://localhost:5173/pool-trading`
- **Test**: Create buy/sell orders for pool tokens
- **Expected**: Trading interface working

### 7. **Portfolio Management**
- **URL**: `http://localhost:5173/pool-token-portfolio`
- **Test**: View pool token holdings and performance
- **Expected**: Portfolio interface working

## 🔐 Admin Permission Testing

### 1. **Role-Based Access Control**
- Test different admin roles (SUPER_ADMIN, PLATFORM_ADMIN, AMC_ADMIN)
- Verify each role has appropriate permissions
- Test unauthorized access attempts

### 2. **JWT Token Validation**
- Test with valid JWT tokens
- Test with expired JWT tokens
- Test with invalid JWT tokens
- Test without JWT tokens

### 3. **Admin Guard Testing**
- Test protected endpoints with admin privileges
- Test protected endpoints without admin privileges
- Verify proper error messages for unauthorized access

## 📊 Expected Results

### ✅ Success Indicators
- All API endpoints return expected status codes
- Frontend interfaces load and function properly
- Admin permissions work correctly
- Hedera integration functions properly
- Database operations complete successfully

### ❌ Common Issues
- **401 Unauthorized**: Check JWT token and admin permissions
- **404 Not Found**: Check endpoint URLs and server status
- **500 Internal Server Error**: Check server logs and database connection
- **Hedera Connection Issues**: Check Hedera network connectivity

## 🐛 Troubleshooting

### Backend Issues
1. Check server logs for errors
2. Verify database connection
3. Check Hedera network connectivity
4. Verify environment variables

### Frontend Issues
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check authentication status
4. Verify component imports

### Database Issues
1. Check MongoDB connection
2. Verify schema definitions
3. Check database indexes
4. Verify data integrity

## 📝 Test Reporting

After running tests, document:
1. **Test Results**: Pass/fail status for each test
2. **Issues Found**: Any bugs or problems discovered
3. **Performance**: Response times and system performance
4. **Recommendations**: Suggestions for improvements

## 🎉 Success Criteria

The admin flow is considered fully functional when:
- ✅ All API endpoints work correctly
- ✅ Frontend interfaces are responsive and functional
- ✅ Admin permissions are properly enforced
- ✅ Hedera integration works seamlessly
- ✅ Database operations complete successfully
- ✅ No critical errors in logs
- ✅ User experience is smooth and intuitive

---

**Happy Testing! 🚀**
