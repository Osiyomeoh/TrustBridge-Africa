#!/bin/bash

echo "🧪 Testing Complete USSD Flow"
echo "============================="
echo ""

SESSION_ID="test_flow_$(date +%s)"
BASE_URL="http://localhost:4001/api/mobile/ussd"

echo "Session ID: $SESSION_ID"
echo ""

# Step 1: Initial dial (empty text)
echo "📍 Step 1: Initial dial (*384#)"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"08012345678\",
    \"text\": \"\"
  }" 2>/dev/null | grep -v "^  "
echo ""
echo "Press Enter to continue..."
read

# Step 2: Select "1" (Register)
echo "📍 Step 2: Select option 1 (Register)"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"08012345678\",
    \"text\": \"1\"
  }" 2>/dev/null | grep -v "^  "
echo ""
echo "Press Enter to continue..."
read

# Step 3: Enter name
echo "📍 Step 3: Enter name 'Ibrahim'"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"08012345678\",
    \"text\": \"1*Ibrahim\"
  }" 2>/dev/null | grep -v "^  "
echo ""
echo "Press Enter to continue..."
read

# Step 4: Enter state
echo "📍 Step 4: Enter state 'Lagos'"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"08012345678\",
    \"text\": \"1*Ibrahim*Lagos\"
  }" 2>/dev/null | grep -v "^  "
echo ""
echo "Press Enter to continue..."
read

# Step 5: Enter town
echo "📍 Step 5: Enter town 'Ikeja'"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"phoneNumber\": \"08012345678\",
    \"text\": \"1*Ibrahim*Lagos*Ikeja\"
  }" 2>/dev/null | grep -v "^  "
echo ""

echo "✅ Flow test complete!"
echo ""
echo "Expected sequence:"
echo "1. Welcome menu"
echo "2. Registration form"
echo "3. Name prompt"
echo "4. State prompt"
echo "5. Town prompt"
echo "6. Registration complete"

