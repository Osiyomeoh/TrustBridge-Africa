#!/bin/bash

# Complete USSD Flow Test
SESSION="flow-test-$(date +%s)"
PHONE="+2348123456789"
API="http://localhost:4001/api/mobile/ussd"

echo "🧪 COMPLETE USSD FLOW TEST - PAGA PAYMENT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Step 1: Start
echo "📱 Step 1: Welcome"
curl -s -X POST $API -H "Content-Type: application/json" -d "{\"sessionId\":\"$SESSION\",\"phoneNumber\":\"$PHONE\",\"text\":\"\"}" | head -1
echo ""

# Step 2: Register
echo "📝 Step 2: Register"
curl -s -X POST $API -H "Content-Type: application/json" -d "{\"sessionId\":\"$SESSION\",\"phoneNumber\":\"$PHONE\",\"text\":\"1\"}" | head -1
echo ""

# Continue with asset tokenization flow
echo "🎯 Testing continues..."
