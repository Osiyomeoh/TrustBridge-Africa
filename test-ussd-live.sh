#!/bin/bash

# Test USSD Flow for TrustBridge Africa
# This simulates the USSD flow that would come from Africa's Talking

echo "🌍 TrustBridge Africa - USSD Flow Test"
echo "======================================"
echo ""

BACKEND_URL="http://localhost:4001/api/mobile/ussd"
PHONE_NUMBER="08012345678"
SESSION_ID="test_session_$(date +%s)"

echo "📱 Backend URL: $BACKEND_URL"
echo "📞 Test Phone: $PHONE_NUMBER"
echo "🔑 Session ID: $SESSION_ID"
echo ""

# Step 1: Initial menu (empty input)
echo "📍 Step 1: Opening main menu..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 2: Select registration
echo "📍 Step 2: Selecting registration (option 1)..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 3: Enter name
echo "📍 Step 3: Entering full name..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*Ibrahim Musa\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 4: Enter state
echo "📍 Step 4: Entering state..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*Ibrahim Musa*Lagos\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 5: Enter town
echo "📍 Step 5: Entering town..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*Ibrahim Musa*Lagos*Ikeja\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 6: Select tokenize asset
echo "📍 Step 6: Selecting tokenize asset (option 1)..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*1\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 7: Select asset type (Farmland)
echo "📍 Step 7: Selecting asset type - Farmland (option 1)..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*1*1\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 8: Enter land size
echo "📍 Step 8: Entering land size (10 acres)..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*1*1*10\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 9: Enter location
echo "📍 Step 9: Entering location..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*1*1*10*Lagos\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 10: Enter value
echo "📍 Step 10: Entering asset value (₦5,000,000)..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*1*1*10*Lagos*5000000\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "Press Enter to continue..."
read

# Step 11: Select Paga payment method
echo "📍 Step 11: Selecting Paga Agent payment (option 1)..."
curl -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"$PHONE_NUMBER\",
    \"text\": \"1*1*1*10*Lagos*5000000*1\"
  }" 2>/dev/null | python3 -m json.tool || cat

echo ""
echo "✅ USSD Flow Test Complete!"
echo ""
echo "Next steps:"
echo "1. Confirm payment (option 1 in final menu)"
echo "2. Asset will be created on Hedera blockchain"
echo "3. User will receive confirmation"

