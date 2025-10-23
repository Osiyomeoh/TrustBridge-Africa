#!/bin/bash

# Quick Admin Flow Test Script
# This script tests the basic admin functionality

echo "🚀 Starting Quick Admin Flow Test..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "${BLUE}Testing: ${description}${NC}"
    echo -e "Endpoint: ${method} ${endpoint}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "http://localhost:4001/api$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            "http://localhost:4001/api$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
        echo "Response: $body"
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
}

# Test health check first
echo -e "${YELLOW}🏥 Testing Health Check...${NC}"
test_endpoint "GET" "/health" "Health Check"

# Test admin endpoints
echo -e "${YELLOW}👑 Testing Admin Endpoints...${NC}"
test_endpoint "GET" "/admin/status/0x1234567890123456789012345678901234567890" "Check Admin Status"
test_endpoint "GET" "/admin/hedera/admin-accounts" "Get Hedera Admin Accounts"

# Test AMC pool endpoints
echo -e "${YELLOW}🏊 Testing AMC Pool Endpoints...${NC}"
pool_data='{
    "name": "Test Investment Pool",
    "description": "A test pool for admin flow testing",
    "assets": ["asset1", "asset2"],
    "totalValue": 1000000,
    "tokenSupply": 1000000,
    "tokenPrice": 1.0,
    "apy": 8.5,
    "maturityDate": "2025-12-31T23:59:59.999Z",
    "status": "ACTIVE"
}'
test_endpoint "POST" "/api/amc-pools" "Create AMC Pool" "$pool_data"
test_endpoint "GET" "/api/amc-pools" "Get All AMC Pools"

# Test trading endpoints
echo -e "${YELLOW}📈 Testing Trading Endpoints...${NC}"
order_data='{
    "poolTokenId": "test-pool-token-1",
    "orderType": "BUY",
    "amount": 100,
    "price": 1.0,
    "userId": "test-user-1"
}'
test_endpoint "POST" "/api/trading/order" "Create Trading Order" "$order_data"
test_endpoint "GET" "/api/trading/orderbook/test-pool-token-1" "Get Orderbook"

# Test pool token endpoints
echo -e "${YELLOW}🪙 Testing Pool Token Endpoints...${NC}"
test_endpoint "GET" "/api/pool-tokens/holdings/test-user-1" "Get Pool Token Holdings"

# Test dividend endpoints
echo -e "${YELLOW}💰 Testing Dividend Endpoints...${NC}"
dividend_data='{
    "poolId": "test-pool-1",
    "amount": 10000,
    "description": "Test dividend distribution"
}'
test_endpoint "POST" "/api/dividends/distributions" "Create Dividend Distribution" "$dividend_data"
test_endpoint "GET" "/api/dividends/distributions" "Get Dividend Distributions"

# Test RWA endpoints
echo -e "${YELLOW}🏠 Testing RWA Endpoints...${NC}"
rwa_data='{
    "name": "Test RWA Asset",
    "description": "A test real-world asset",
    "value": 500000,
    "location": "Test Location",
    "category": "REAL_ESTATE"
}'
test_endpoint "POST" "/api/rwa/assets" "Create RWA Asset" "$rwa_data"
test_endpoint "GET" "/api/rwa/assets" "Get RWA Assets"

echo -e "${GREEN}🎉 Quick Admin Flow Test Complete!${NC}"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Check the results above for any failed tests"
echo "2. If tests failed, check the backend server logs"
echo "3. Verify the backend server is running on http://localhost:4001"
echo "4. Check the database connection"
echo "5. Verify Hedera network connectivity"
echo ""
echo "📖 For detailed testing, see: ADMIN_FLOW_TESTING_GUIDE.md"
echo "🤖 For automated testing, run: node test-admin-flow.js"
