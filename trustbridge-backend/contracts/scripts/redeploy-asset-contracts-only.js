const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Redeploying only asset-related contracts to reset to zero assets...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Keep existing TrustToken - no need to redeploy
  const existingTrustToken = '0x170B35e97C217dBf63a500EaB884392F7BF6Ec34';
  console.log("✅ Using existing TrustToken:", existingTrustToken);

  // Deploy new AssetNFT (this will reset all NFTs to zero)
  console.log("\n📦 Deploying new AssetNFT (resets all NFTs to zero)...");
  const AssetNFT = await ethers.getContractFactory("AssetNFT");
  const assetNFT = await AssetNFT.deploy();
  await assetNFT.waitForDeployment();
  const assetNFTAddress = await assetNFT.getAddress();
  console.log("✅ New AssetNFT deployed to:", assetNFTAddress);

  // Deploy new CoreAssetFactory (this will reset all asset creation)
  console.log("\n📦 Deploying new CoreAssetFactory...");
  const CoreAssetFactory = await ethers.getContractFactory("CoreAssetFactory");
  const coreAssetFactory = await CoreAssetFactory.deploy(
    existingTrustToken,
    assetNFTAddress,
    deployer.address // fee recipient
  );
  await coreAssetFactory.waitForDeployment();
  const coreAssetFactoryAddress = await coreAssetFactory.getAddress();
  console.log("✅ New CoreAssetFactory deployed to:", coreAssetFactoryAddress);

  // Deploy new TRUSTMarketplace (this will reset all listings)
  console.log("\n📦 Deploying new TRUSTMarketplace...");
  const TRUSTMarketplace = await ethers.getContractFactory("TRUSTMarketplace");
  const trustMarketplace = await TRUSTMarketplace.deploy(
    assetNFTAddress,
    existingTrustToken,
    deployer.address // fee recipient
  );
  await trustMarketplace.waitForDeployment();
  const trustMarketplaceAddress = await trustMarketplace.getAddress();
  console.log("✅ New TRUSTMarketplace deployed to:", trustMarketplaceAddress);

  // Grant MINTER_ROLE to CoreAssetFactory
  console.log("\n🔐 Granting MINTER_ROLE to CoreAssetFactory...");
  const MINTER_ROLE = await assetNFT.MINTER_ROLE();
  await assetNFT.grantRole(MINTER_ROLE, coreAssetFactoryAddress);
  console.log("✅ MINTER_ROLE granted to CoreAssetFactory");

  // Grant LISTER_ROLE to public (zero address)
  console.log("\n🔐 Granting LISTER_ROLE to public...");
  const LISTER_ROLE = await trustMarketplace.LISTER_ROLE();
  await trustMarketplace.grantRole(LISTER_ROLE, ethers.ZeroAddress);
  console.log("✅ LISTER_ROLE granted to public");

  // Save deployment addresses
  const deploymentInfo = {
    network: "hedera_testnet",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    description: "Redeployed only asset-related contracts to reset to zero assets",
    contracts: {
      // Keep existing contracts
      trustToken: existingTrustToken,
      verificationRegistry: '0xC2e5D63Da10A3139857D18Cf43eB93CE0133Ca4B',
      attestorVerificationSystem: '0x5a109F8e0405Fa0034fFC41Dab805E1DBc84aE56',
      poolManager: '0x4F863bDAaE4611dF7df5C5eBa2fd42aAaA984646',
      poolToken: '0x3262BBF6c5d3Af2cdA1B4E44A10eF16af3A6662e',
      tradingEngine: '0xc326cF6Ab5EF03B2Df5390463634Db9d778e01E7',
      feeDistribution: '0xa00343B86a5531155F22d91899229124e6619843',
      spvManager: '0x10D7EfA83A38A8e37Bad40ac40aDDf7906c0cB43',
      amcManager: '0xeDdEA0d8332e332382136feB27FbeAa2f0301250',
      batchMinting: '0xF91BBA338533895852cF7108182cb4FF58E817f9',
      advancedMinting: '0x1A3bf7392234484D73727a5b7CE90832D4124128',
      trustFaucet: '0x0dD677A36Cfcf6d7ADFcf68329da234207c58210',
      
      // New contracts (reset to zero)
      assetNFT: assetNFTAddress,
      coreAssetFactory: coreAssetFactoryAddress,
      trustMarketplace: trustMarketplaceAddress
    }
  };

  console.log("\n📋 Deployment Summary:");
  console.log("====================");
  console.log("Network: hedera_testnet");
  console.log("Deployer:", deployer.address);
  console.log("Timestamp:", deploymentInfo.timestamp);
  console.log("\nNew Contract Addresses (reset to zero):");
  console.log("AssetNFT:", assetNFTAddress);
  console.log("CoreAssetFactory:", coreAssetFactoryAddress);
  console.log("TRUSTMarketplace:", trustMarketplaceAddress);
  console.log("\nExisting Contracts (unchanged):");
  console.log("TrustToken:", existingTrustToken);
  console.log("TrustFaucet:", '0x0dD677A36Cfcf6d7ADFcf68329da234207c58210');

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-reset-assets.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-reset-assets.json");

  console.log("\n🎉 Asset contracts redeployed successfully!");
  console.log("🔗 All asset-related contracts reset to ZERO");
  console.log("📊 Ready for fresh start with HTS integration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
