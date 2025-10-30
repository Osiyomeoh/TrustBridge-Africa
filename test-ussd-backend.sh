#!/bin/bash

echo "🧪 Testing USSD Backend Connection"
echo "=================================="
echo ""

BACKEND_URL="http://localhost:4001/api/mobile/ussd"

echo "📡 Testing: $BACKEND_URL"
echo ""

# Test 1: Initial request
echo "📍 Test 1: Initial USSD request (empty input)"
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_123",
    "phoneNumber": "08012345678",
    "text": ""
  }' 2>/dev/null

echo ""
echo ""
echo "✅ If you see USSD menu, backend is working!"

