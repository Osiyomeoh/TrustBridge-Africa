# 🚀 TrustBridge Hedera Deployment Guide

## Overview
This guide will help you deploy TrustBridge smart contracts to Hedera Hashgraph for the **Hedera Africa Hackathon 2025**.

## Prerequisites

### 1. Hedera Account Setup
```bash
# Install Hedera CLI
npm install -g @hashgraph/hedera-cli

# Create a Hedera account
hedera account create --testnet
hedera account create --mainnet
```

### 2. Get Testnet HBAR
- **Hedera Portal**: https://portal.hedera.com/
- **Testnet Faucet**: https://portal.hedera.com/ (up to 10,000 testnet HBAR)
- **Hedera CLI**: `hedera account balance --testnet`

### 3. Environment Setup
Create `.env` file:
```bash
# Hedera Testnet
HEDERA_TESTNET_PRIVATE_KEY=your_testnet_private_key_here
HEDERA_TESTNET_ACCOUNT_ID=your_testnet_account_id_here

# Hedera Mainnet (for production)
HEDERA_MAINNET_PRIVATE_KEY=your_mainnet_private_key_here
HEDERA_MAINNET_ACCOUNT_ID=your_mainnet_account_id_here

# Optional: Hedera Mirror Node API
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

## Deployment Steps

### Step 1: Deploy to Hedera Testnet

```bash
# Deploy all contracts to testnet
npx hardhat run scripts/deploy-hedera.ts --network hedera_testnet

# Or use the testnet-specific script
npx hardhat run scripts/deploy-hedera-testnet.ts --network hedera_testnet
```

### Step 2: Verify Deployment
```bash
# Check deployment status
cat deployments/hedera_testnet.json

# Verify contracts on Hedera Explorer
# Testnet: https://hashscan.io/testnet
# Mainnet: https://hashscan.io/mainnet
```

### Step 3: Setup Initial Attestors
```bash
# Register initial attestors
npx hardhat run scripts/setup-initial-attestors.ts --network hedera_testnet
```

### Step 4: Test the Platform
```bash
# Run comprehensive tests
npx hardhat test test/Phase1-Security.test.ts --network hedera_testnet
npx hardhat test test/Phase2-EdgeCases.test.ts --network hedera_testnet
npx hardhat test test/Phase3-Integration.test.ts --network hedera_testnet
npx hardhat test test/Phase4-Performance.test.ts --network hedera_testnet
npx hardhat test test/Phase5-Economic.test.ts --network hedera_testnet
```

### Step 5: Deploy to Mainnet (Production)
```bash
# Deploy to Hedera mainnet
npx hardhat run scripts/deploy-hedera.ts --network hedera_mainnet

# Setup production attestors
npx hardhat run scripts/setup-initial-attestors.ts --network hedera_mainnet
```

## Contract Addresses

After deployment, you'll get contract addresses like:
```
TrustToken: 0x1234...
AttestorManager: 0x5678...
PolicyManager: 0x9abc...
VerificationRegistry: 0xdef0...
AssetFactory: 0x2468...
SettlementEngine: 0x1357...
FeeDistribution: 0x9753...
VerificationBuffer: 0x8642...
```

## Gas Costs

### Estimated Deployment Costs (Testnet)
- **TrustToken**: ~1.3M gas
- **AttestorManager**: ~1.2M gas
- **PolicyManager**: ~830K gas
- **VerificationRegistry**: ~1.2M gas
- **AssetFactory**: ~2.6M gas
- **SettlementEngine**: ~1.1M gas
- **FeeDistribution**: ~590K gas
- **VerificationBuffer**: ~546K gas
- **Total**: ~9.3M gas (~$0.01 USD)

### Estimated Deployment Costs (Mainnet)
- **Total**: ~9.3M gas (~$0.50 USD)

## Monitoring & Maintenance

### 1. Contract Verification
```bash
# Verify contracts on Hedera Explorer
npx hardhat verify --network hedera_testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### 2. Monitor Contract Activity
- **Hedera Explorer**: https://hashscan.io/
- **Mirror Node API**: https://docs.hedera.com/hedera/core-concepts/mirror-nodes
- **Custom Dashboard**: Use the monitoring service in the backend

### 3. Regular Maintenance
- Monitor attestor performance
- Update asset type policies
- Manage fee distributions
- Handle disputes and appeals

## Security Considerations

### 1. Private Key Management
- Use hardware wallets for mainnet
- Store private keys securely
- Use multi-signature wallets for production

### 2. Access Control
- Regularly audit role assignments
- Monitor admin functions
- Implement time-locked upgrades

### 3. Economic Security
- Monitor staking ratios
- Track attestor performance
- Manage fee structures

## Troubleshooting

### Common Issues

#### 1. Insufficient HBAR Balance
```bash
# Check balance
hedera account balance --testnet

# Get testnet HBAR
# Visit: https://portal.hedera.com/
```

#### 2. Network Connection Issues
```bash
# Test network connectivity
curl -X POST https://testnet.hashio.io/api \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### 3. Contract Deployment Failures
```bash
# Check gas limits
npx hardhat run scripts/deploy-hedera.ts --network hedera_testnet --verbose

# Increase gas limit in hardhat.config.ts
```

## Post-Deployment Checklist

### ✅ Technical
- [ ] All contracts deployed successfully
- [ ] Contract addresses saved
- [ ] Initial attestors registered
- [ ] Policies configured
- [ ] Tests passing on testnet
- [ ] Contracts verified on explorer

### ✅ Business
- [ ] Attestor onboarding process ready
- [ ] Asset verification workflows defined
- [ ] Fee structures finalized
- [ ] Legal compliance reviewed
- [ ] Marketing materials prepared

### ✅ Security
- [ ] Private keys secured
- [ ] Access controls configured
- [ ] Monitoring systems active
- [ ] Incident response plan ready
- [ ] Security audit completed

## Support & Resources

### Hedera Documentation
- **Developer Portal**: https://docs.hedera.com/
- **Smart Contracts**: https://docs.hedera.com/hedera/smart-contracts/
- **Mirror Nodes**: https://docs.hedera.com/hedera/core-concepts/mirror-nodes

### Community
- **Hedera Discord**: https://discord.gg/hedera
- **Hedera Forum**: https://forum.hedera.com/
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/hedera

### Hackathon Resources
- **Hedera Africa Hackathon 2025**: [Official Website]
- **Prize Pool**: $200K+ across multiple tracks
- **Submission Deadline**: [Check official website]
- **Judging Criteria**: Innovation, Technical Excellence, Hedera Integration

## 🏆 Success Metrics

### Technical Metrics
- **Uptime**: 99.9%+
- **Transaction Success Rate**: 99%+
- **Gas Efficiency**: Top 10% of Hedera projects
- **Security**: Zero critical vulnerabilities

### Business Metrics
- **Attestors Registered**: 50+ in first month
- **Assets Verified**: 100+ in first quarter
- **Total Value Locked**: $1M+ in first year
- **User Adoption**: 1000+ active users

### Hackathon Metrics
- **Innovation Score**: 9/10
- **Technical Excellence**: 9/10
- **Hedera Integration**: 10/10
- **Market Potential**: 9/10

---

**Good luck with your Hedera Africa Hackathon 2025 submission! 🚀**
