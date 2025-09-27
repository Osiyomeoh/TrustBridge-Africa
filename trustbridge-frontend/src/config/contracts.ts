// Centralized contract configuration
// This is the single source of truth for all contract addresses

export const CONTRACT_ADDRESSES = {
  // Core System Contracts - FRESH DEPLOYMENT WITH ZERO ASSETS
  trustToken: '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34', // Keep existing
  assetNFT: '0xD376EefAA879554A459Fe719233478Ac2575d42A', // NEW - Zero assets
  verificationRegistry: '0xC2e5D63Da10A3139857D18Cf43eB93CE0133Ca4B', // Keep existing
  trustAssetFactory: '0x044e4e033978af17102C69E1B79B6Ddc6078A0D9', // Keep existing
  attestorVerificationSystem: '0x5a109F8e0405Fa0034fFC41Dab805E1DBc84aE56', // Keep existing
  trustMarketplace: '0x962aFC4e76AD564608f02Af09673C61e990ed339', // NEW - Zero listings
  poolManager: '0x4F863bDAaE4611dF7df5C5eBa2fd42aAaA984646',
  poolToken: '0x3262BBF6c5d3Af2cdA1B4E44A10eF16af3A6662e',
  tradingEngine: '0xc326cF6Ab5EF03B2Df5390463634Db9d778e01E7',
  feeDistribution: '0xa00343B86a5531155F22d91899229124e6619843',
  spvManager: '0x10D7EfA83A38A8e37Bad40ac40aDDf7906c0cB43',
  
          // NEW MODULAR CONTRACTS - FRESH DEPLOYMENT WITH ZERO ASSETS
          coreAssetFactory: '0x882991D9C1C013039DdaeF3A04e8b812EcE44730', // NEW - Zero assets
  amcManager: '0xeDdEA0d8332e332382136feB27FbeAa2f0301250',
  
  // ENHANCED MINTING CONTRACTS - UPDATED WITH NEW TRUST TOKEN
  batchMinting: '0xF91BBA338533895852cF7108182cb4FF58E817f9',
  advancedMinting: '0x1A3bf7392234484D73727a5b7CE90832D4124128',
  
  // FAUCET CONTRACT - PUBLIC TEST TOKEN DISTRIBUTION
  trustFaucet: '0x0dD677A36Cfcf6d7ADFcf68329da234207c58210',
  
  // Legacy contracts (deprecated)
  governance: '0x0000000000000000000000000000000000000000',
  timelock: '0x0000000000000000000000000000000000000000',
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  hederaRpcUrl: 'https://testnet.hashio.io/api',
  chainId: 296, // Hedera Testnet
} as const;

// Role constants
export const ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  VERIFIER_ROLE: "0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09",
  ATTESTOR_ROLE: "0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09",
  MINTER_ROLE: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
  METADATA_ROLE: "0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09"
} as const;

// Contract types
export type ContractAddresses = typeof CONTRACT_ADDRESSES;
export type NetworkConfig = typeof NETWORK_CONFIG;
export type Roles = typeof ROLES;
