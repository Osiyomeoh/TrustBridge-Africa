#!/bin/bash

# TrustBridge Contract Verification Helper
# Opens all contracts in Hedera Explorer for verification

echo "🔍 Opening TrustBridge contracts for verification..."

# Contract addresses from deployment
TRUST_TOKEN="0x5Fc7CFc9de33F889E5082a794C86924dE0730F1B"
ATTESTOR_MANAGER="0x4cBc1051eFaa1DE9b269F1D198607116f1b73B2A"
POLICY_MANAGER="0xdFA7fABDB764D552E4CF411588a7Be516CB0538d"
VERIFICATION_REGISTRY="0x191BD2259BeC74d4680295A81f71ED9853d89D52"
ASSET_FACTORY="0xD051EfA5FDeAB780F80d762bE2e9d2C64af7ED4B"
SETTLEMENT_ENGINE="0x31C0112671810d3Bf29e2fa3C1D2668B8aDD18FD"
FEE_DISTRIBUTION="0x173782c2151cA9d4c99beFd165FC2293444f6533"
VERIFICATION_BUFFER="0xBf47D97f75EC66BFdaC3bBe9E3DBFFce9D57C295"

echo "Opening contracts in browser..."

# Open each contract in browser
open "https://hashscan.io/testnet/contract/$TRUST_TOKEN"
sleep 1
open "https://hashscan.io/testnet/contract/$ATTESTOR_MANAGER"
sleep 1
open "https://hashscan.io/testnet/contract/$POLICY_MANAGER"
sleep 1
open "https://hashscan.io/testnet/contract/$VERIFICATION_REGISTRY"
sleep 1
open "https://hashscan.io/testnet/contract/$ASSET_FACTORY"
sleep 1
open "https://hashscan.io/testnet/contract/$SETTLEMENT_ENGINE"
sleep 1
open "https://hashscan.io/testnet/contract/$FEE_DISTRIBUTION"
sleep 1
open "https://hashscan.io/testnet/contract/$VERIFICATION_BUFFER"

echo "✅ All contracts opened in browser!"
echo ""
echo "📝 Verification Steps:"
echo "1. On each contract page, look for 'Verify Contract' button"
echo "2. Upload the corresponding .sol file from contracts/ directory"
echo "3. Enter constructor arguments if required"
echo "4. Submit for verification"
echo ""
echo "🔧 Constructor Arguments:"
echo "   VerificationRegistry: $ATTESTOR_MANAGER, $POLICY_MANAGER"
echo "   AssetFactory: $TRUST_TOKEN, 0x17d0a5E112F088076d79a5E73Ef3a143506789fF, $VERIFICATION_REGISTRY"
echo "   SettlementEngine: 0x17d0a5E112F088076d79a5E73Ef3a143506789fF"
echo "   FeeDistribution: 0x17d0a5E112F088076d79a5E73Ef3a143506789fF, 0x17d0a5E112F088076d79a5E73Ef3a143506789fF, $TRUST_TOKEN"
echo ""
echo "🏆 Good luck with verification!"
