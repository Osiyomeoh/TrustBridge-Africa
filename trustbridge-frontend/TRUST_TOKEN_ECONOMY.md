# TRUST Token Economy

## Overview

The TrustBridge platform implements a dual-token economy using **HBAR** (Hedera's native token) and **TRUST** (platform-specific token) to create a sustainable, deflationary economic model for digital asset creation and trading.

## Token Roles

### HBAR (Hedera Native Token)
- **Purpose**: Gas fees, exchange currency, treasury funding
- **Supply**: Fixed (cannot be burned)
- **Usage**: Network transactions, exchange for TRUST tokens

### TRUST (Platform Token)
- **Purpose**: Platform fees, governance, deflationary mechanism
- **Supply**: Dynamic (minted on exchange, burned on usage)
- **Usage**: NFT creation fees, trading fees, governance voting

## Economic Model

### 1. HBAR → TRUST Exchange

When users exchange HBAR for TRUST tokens, the HBAR is distributed as follows:

```
User sends 1 HBAR for exchange:
├── 60% → Community Treasury (HBAR)
│   └── Used for: Platform development, community rewards, governance
├── 25% → Platform Operations (HBAR)
│   └── Used for: Infrastructure, team salaries, maintenance
├── 10% → Staking Rewards Pool (HBAR)
│   └── Used for: Rewarding TRUST token stakers
└── 5% → Exchange Fee (HBAR)
    └── Used for: Immediate platform revenue
```

**Exchange Rate**: 1 HBAR = 100 TRUST tokens (with 0.1 HBAR exchange fee)

### 2. TRUST Token Usage & Burning

TRUST tokens are burned (removed from circulation) when used for platform services:

#### NFT Creation Costs:
- **Basic NFT**: 50 TRUST tokens
- **Premium Verification**: 100 TRUST tokens (2x multiplier)
- **Epic Rarity**: 100 TRUST tokens (2x multiplier)
- **Legendary Rarity**: 150 TRUST tokens (3x multiplier)

#### Other Burning Mechanisms:
- **Trading Fees**: 2.5% of trade value in TRUST tokens
- **Governance Voting**: 1 TRUST token per vote
- **Premium Features**: Additional TRUST token costs

### 3. Deflationary Pressure

The burning of TRUST tokens creates deflationary pressure:
- **Supply Reduction**: Each burn reduces total TRUST supply
- **Value Appreciation**: Remaining tokens become more valuable
- **Scarcity**: Creates natural price appreciation over time

## User Flow

### 1. First-Time User
```
1. Connect Wallet → See "0 TRUST" in header
2. Try to Create NFT → "Insufficient TRUST" error
3. Click "Buy TRUST" → Exchange modal opens
4. Exchange HBAR → Receive TRUST tokens
5. Create NFT → TRUST tokens burned as fee
```

### 2. Returning User
```
1. Dashboard → See TRUST balance in header
2. Create NFT → System checks balance
3. If sufficient → Proceed with creation
4. If insufficient → Prompt to buy more TRUST
```

## Economic Benefits

### For Users
- **Value Creation**: TRUST tokens appreciate due to deflationary burning
- **Governance Rights**: TRUST holders vote on treasury usage
- **Staking Rewards**: Earn HBAR by staking TRUST tokens
- **Platform Access**: Required for creating and trading digital assets

### For Platform
- **Sustainable Revenue**: Multiple revenue streams from HBAR distribution
- **Growth Funding**: Treasury enables feature development
- **Community Engagement**: TRUST holders invested in platform success
- **Decentralization**: Community controls treasury through governance

### For Economy
- **Deflationary**: Burns reduce TRUST supply, increase value
- **Growth**: Treasury funds drive innovation and development
- **Balance**: Fair distribution across all stakeholders
- **Transparency**: All transactions and distributions are public

## Technical Implementation

### Frontend Components
- `TrustTokenPurchase.tsx` - Exchange modal with HBAR distribution breakdown
- `TrustTokenBalance.tsx` - Header widget showing balance
- `useTrustTokenBalance.ts` - Hook for managing TRUST balance
- `CreateDigitalAsset.tsx` - NFT creation with TRUST fee checking

### Backend Services
- `TrustTokenService` - Minting and burning TRUST tokens
- `ExchangeService` - HBAR to TRUST conversion
- `TreasuryService` - Managing community treasury
- `StakingService` - TRUST token staking rewards

## Governance

### Treasury Management
- **TRUST holders vote** on treasury spending proposals
- **Proposals include**: New features, partnerships, community rewards
- **Transparency**: All treasury transactions are public
- **Community-driven**: Platform evolves based on user needs

### Voting Power
- **1 TRUST token = 1 vote**
- **Minimum stake**: 100 TRUST tokens to participate
- **Voting period**: 7 days for proposals
- **Quorum**: 10% of total TRUST supply must vote

## Future Enhancements

### Phase 2: Advanced Features
- **DEX Integration**: Decentralized exchange for TRUST/HBAR
- **Liquidity Pools**: Automated market making
- **Cross-chain**: Support for other blockchain tokens
- **Advanced Staking**: Tiered staking rewards

### Phase 3: Ecosystem Expansion
- **Partner Integrations**: Other platforms using TRUST tokens
- **Cross-platform**: TRUST tokens usable across multiple dApps
- **Institutional**: Large-scale TRUST token adoption
- **Global**: International expansion and compliance

## Security Considerations

### Smart Contract Security
- **Audited Contracts**: All TRUST token contracts professionally audited
- **Multi-signature**: Treasury requires multiple signatures for large transactions
- **Timelock**: Critical changes have 24-hour delay
- **Emergency Pause**: Ability to pause system in case of security issues

### Economic Security
- **Anti-manipulation**: Measures to prevent price manipulation
- **Liquidity Protection**: Minimum liquidity requirements
- **Governance Security**: Protection against governance attacks
- **Transparency**: All economic decisions are public and auditable

## Monitoring & Analytics

### Key Metrics
- **TRUST Token Supply**: Total supply and burn rate
- **HBAR Treasury**: Community treasury balance and usage
- **Exchange Volume**: HBAR to TRUST conversion rates
- **Platform Usage**: NFT creation and trading activity

### Dashboards
- **Public Dashboard**: Real-time economic metrics
- **Treasury Dashboard**: Community treasury management
- **Analytics Dashboard**: Platform usage and growth metrics
- **Governance Dashboard**: Voting and proposal tracking

---

## Quick Reference

### Exchange Rates
- **1 HBAR = 100 TRUST tokens**
- **Exchange fee: 0.1 HBAR**
- **Minimum exchange: 0.5 HBAR**

### Creation Costs
- **Basic NFT: 50 TRUST**
- **Premium NFT: 100 TRUST**
- **Epic NFT: 100 TRUST**
- **Legendary NFT: 150 TRUST**

### HBAR Distribution
- **Treasury: 60%**
- **Operations: 25%**
- **Staking: 10%**
- **Fees: 5%**

This economic model creates a sustainable, deflationary, community-driven economy that benefits all participants while ensuring the long-term success of the TrustBridge platform.
