const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting fresh minimal deployment for digital assets...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy TrustToken first
  console.log("\n📦 Deploying TrustToken...");
  const TrustToken = await ethers.getContractFactory("TrustToken");
  const trustToken = await TrustToken.deploy();
  await trustToken.waitForDeployment();
  const trustTokenAddress = await trustToken.getAddress();
  console.log("✅ TrustToken deployed to:", trustTokenAddress);

  // Deploy AssetNFT
  console.log("\n📦 Deploying AssetNFT...");
  const AssetNFT = await ethers.getContractFactory("AssetNFT");
  const assetNFT = await AssetNFT.deploy();
  await assetNFT.waitForDeployment();
  const assetNFTAddress = await assetNFT.getAddress();
  console.log("✅ AssetNFT deployed to:", assetNFTAddress);

  // Deploy CoreAssetFactory
  console.log("\n📦 Deploying CoreAssetFactory...");
  const CoreAssetFactory = await ethers.getContractFactory("CoreAssetFactory");
  const coreAssetFactory = await CoreAssetFactory.deploy(
    trustTokenAddress,
    assetNFTAddress,
    deployer.address // fee recipient
  );
  await coreAssetFactory.waitForDeployment();
  const coreAssetFactoryAddress = await coreAssetFactory.getAddress();
  console.log("✅ CoreAssetFactory deployed to:", coreAssetFactoryAddress);

  // Deploy TRUSTMarketplace (no constructor parameters)
  console.log("\n📦 Deploying TRUSTMarketplace...");
  const TRUSTMarketplace = await ethers.getContractFactory("TRUSTMarketplace");
  const trustMarketplace = await TRUSTMarketplace.deploy();
  await trustMarketplace.waitForDeployment();
  const trustMarketplaceAddress = await trustMarketplace.getAddress();
  console.log("✅ TRUSTMarketplace deployed to:", trustMarketplaceAddress);

  // Deploy TRUSTFaucet for public minting
  console.log("\n📦 Deploying TRUSTFaucet...");
  const TRUSTFaucet = await ethers.getContractFactory("TRUSTFaucet");
  const trustFaucet = await TRUSTFaucet.deploy(trustTokenAddress);
  await trustFaucet.waitForDeployment();
  const trustFaucetAddress = await trustFaucet.getAddress();
  console.log("✅ TRUSTFaucet deployed to:", trustFaucetAddress);

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

  // Grant MINTER_ROLE to TRUSTFaucet
  console.log("\n🔐 Granting MINTER_ROLE to TRUSTFaucet...");
  const TRUST_MINTER_ROLE = await trustToken.MINTER_ROLE();
  await trustToken.grantRole(TRUST_MINTER_ROLE, trustFaucetAddress);
  console.log("✅ MINTER_ROLE granted to TRUSTFaucet");

  // Save deployment addresses
  const deploymentInfo = {
    network: "hedera_testnet",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TrustToken: trustTokenAddress,
      AssetNFT: assetNFTAddress,
      CoreAssetFactory: coreAssetFactoryAddress,
      TRUSTMarketplace: trustMarketplaceAddress,
      TRUSTFaucet: trustFaucetAddress
    }
  };

  console.log("\n📋 Deployment Summary:");
  console.log("====================");
  console.log("Network: hedera_testnet");
  console.log("Deployer:", deployer.address);
  console.log("Timestamp:", deploymentInfo.timestamp);
  console.log("\nContract Addresses:");
  console.log("TrustToken:", trustTokenAddress);
  console.log("AssetNFT:", assetNFTAddress);
  console.log("CoreAssetFactory:", coreAssetFactoryAddress);
  console.log("TRUSTMarketplace:", trustMarketplaceAddress);
  console.log("TRUSTFaucet:", trustFaucetAddress);

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-fresh-minimal.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-fresh-minimal.json");

  console.log("\n🎉 Fresh minimal deployment completed successfully!");
  console.log("🔗 All contracts are ready for HTS integration");
  console.log("📊 Starting with ZERO assets - clean slate!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
