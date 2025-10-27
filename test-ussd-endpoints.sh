#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "         🧪 USSD ENDPOINT TEST - PAGA INTEGRATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

SESSION_ID="endpoint-test-$(date +%s)"
PHONE="+2348123456789"
API="http://localhost:4001/api/mobile/ussd"

# Function to test endpoint
test_ussd() {
  local step=$1
  local text=$2
  local description=$3
  
  echo "📱 $description"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  curl -s -X POST $API \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"$SESSION_ID\",\"phoneNumber\":\"$PHONE\",\"text\":\"$text\"}"
  
  echo ""
  echo ""
}

# Step 1: Initial call (empty text)
test_ussd "step1" "" "Step 1: Welcome Menu (empty input)"

# Step 2: User selects Register
test_ussd "step2" "1" "Step 2: Select '1' (Register)"

# Step 3: Enter Full Name
test_ussd "step3" "*1" "Step 3: Enter name 'Ibrahim Musa'"

# Step 4: Enter State  
test_ussd "step4" "*1*Lagos" "Step 4: Enter state 'Lagos'"

# Step 5: Enter Town
test_ussd "step5" "*1*Lagos*Ikeja" "Step 5: Enter town 'Ikeja'"

# Step 6: Return to Main Menu
test_ussd "step6" "" "Step 6: Back to Main Menu (after registration)"

# Step 7: Start Tokenization
test_ussd "step7" "1" "Step 7: Select 'Tokenize My Asset'"

# Step 8: Choose Farmland
test_ussd "step8" "1" "Step 8: Choose 'Farmland'"

# Step 9: Enter Land Size
test_ussd "step9" "*1*10" "Step 9: Enter land size '10 acres'"

# Step 10: Enter Location
test_ussd "step10" "*1*10*Lagos" "Step 10: Enter location 'Lagos'"

# Step 11: Enter Value
test_ussd "step11" "*1*10*Lagos*5000000" "Step 11: Enter value 'NGN 5,000,000'"

# Step 12: Payment Selection - PAGA (KEY TEST!)
test_ussd "step12" "*1*10*Lagos*5000000*1" "Step 12: Select 'Paga Agent' payment ⭐"

echo "═══════════════════════════════════════════════════════════════"
echo "✅ Test Complete - Check Step 12 for Paga payment flow"
echo "═══════════════════════════════════════════════════════════════"

