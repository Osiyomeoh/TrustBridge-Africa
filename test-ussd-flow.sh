#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "         🧪 COMPLETE USSD FLOW TEST - PAGA INTEGRATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

SESSION_ID="test$(date +%s)"
PHONE="+2348123456789"
API="http://localhost:4001/api/mobile/ussd"

# Step 1: Welcome Menu
echo "📱 STEP 1: Welcome Menu"
RESPONSE1=$(curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"phoneNumber\":\"$PHONE\",\"text\":\"\"}")
echo "$RESPONSE1"
echo ""

# Step 2: Register
echo "📝 STEP 2: User selects '1. Register'"
RESPONSE2=$(curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"phoneNumber\":\"$PHONE\",\"text\":\"1\"}")
echo "$RESPONSE2"
echo ""

# Step 3: Enter Name
echo "📝 STEP 3: Enter Full Name"
RESPONSE3=$(curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"phoneNumber\":\"$PHONE\",\"text\":\"*1*Ibrahim Musa\"}")
echo "$RESPONSE3"
echo ""

# Step 4: Enter State
echo "📝 STEP 4: Enter State"
RESPONSE4=$(curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"phoneNumber\":\"$PHONE\",\"text\":\"*1*Ibrahim Musa*Lagos\"}")
echo "$RESPONSE4"
echo ""

# Step 5: Enter Town
echo "📝 STEP 5: Enter Town"
RESPONSE5=$(curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"phoneNumber\":\"$PHONE\",\"text\":\"*1*Ibrahim Musa*Lagos*Ikeja\"}")
echo "$RESPONSE5"
echo ""

# Step 6: Main Menu
echo "📱 STEP 6: Return to Main Menu"
RESPONSE6=$(curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"phoneNumber\":\"$PHONE\",\"text\":\"*1*Ibrahim Musa*Lagos*Ikeja*1\"}")
echo "$RESPONSE6"
echo ""

# Step 7: Select Tokenize
echo "🎯 STEP 7: Select 'Tokenize My Asset'"
RESPONSE7=$(curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"phoneNumber\":\"$PHONE\",\"text\":\"*1*Ibrahim Musa*Lagos*Ikeja*1*1\"}")
echo "$RESPONSE7"
echo ""

echo "✅ Test Complete - Check responses above for Paga payment options"
