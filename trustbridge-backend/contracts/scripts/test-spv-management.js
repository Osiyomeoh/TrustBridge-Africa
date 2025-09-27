const { ethers } = require("hardhat");

async function main() {
  console.log("🏢 Testing SPV Management functionality...");
  
  const [deployer] = await ethers.getSigners();
  const userAddress = deployer.address;
  
  // Load deployment data
  const deployments = require('../deployments/trust-ecosystem.json');
  
  // Get contract addresses
  const spvManagerAddress = deployments.contracts.spvManager;
  const trustAssetFactoryAddress = deployments.contracts.trustAssetFactory;
  
  console.log("User address:", userAddress);
  console.log("SPV Manager address:", spvManagerAddress);
  console.log("Asset Factory address:", trustAssetFactoryAddress);
  
  // Create contract instances
  const spvManager = await ethers.getContractAt("SPVManager", spvManagerAddress);
  const assetFactory = await ethers.getContractAt("TRUSTAssetFactory", trustAssetFactoryAddress);
  
  // Check if user has SPV_ADMIN_ROLE
  const SPV_ADMIN_ROLE = await spvManager.SPV_ADMIN_ROLE();
  const hasSPVAdminRole = await spvManager.hasRole(SPV_ADMIN_ROLE, userAddress);
  console.log("User has SPV_ADMIN_ROLE:", hasSPVAdminRole);
  
  // Get a known asset ID from previous tests
  const knownAssetId = "0xc630666b9022a394f49235133ec78163ed87cde6a8cc86a8a243e06d551bf86b";
  
  try {
    // Check if asset exists
    const asset = await assetFactory.getAsset(knownAssetId);
    console.log("Found existing asset:", asset.name);
    console.log("Asset value:", ethers.formatEther(asset.totalValue), "TRUST");
    console.log("Asset owner:", asset.owner);
    
    console.log("\n🏢 Creating SPV...");
    
    // Create SPV
    const spvName = "Test SPV LLC";
    const totalCapital = ethers.parseEther("1000000"); // 1M TRUST
    const minimumInvestment = ethers.parseEther("10000"); // 10K TRUST
    const maximumInvestors = 100;
    const managementFee = 200; // 2%
    const performanceFee = 2000; // 20%
    const jurisdiction = "Delaware";
    
    console.log("SPV Parameters:");
    console.log("- Name:", spvName);
    console.log("- Total Capital:", ethers.formatEther(totalCapital), "TRUST");
    console.log("- Minimum Investment:", ethers.formatEther(minimumInvestment), "TRUST");
    console.log("- Maximum Investors:", maximumInvestors);
    console.log("- Management Fee:", managementFee, "basis points");
    console.log("- Performance Fee:", performanceFee, "basis points");
    console.log("- Jurisdiction:", jurisdiction);
    
    const createSPVTx = await spvManager.createSPV(
      spvName,
      totalCapital,
      minimumInvestment,
      maximumInvestors,
      managementFee,
      performanceFee,
      jurisdiction
    );
    const createSPVReceipt = await createSPVTx.wait();
    const spvId = createSPVReceipt.logs[0].args.spvId;
    console.log("✅ SPV created successfully!");
    console.log("SPV ID:", spvId);
    
    const spv = await spvManager.spvs(spvId);
    console.log("SPV Details:");
    console.log("- Name:", spv.name);
    console.log("- Jurisdiction:", spv.jurisdiction);
    console.log("- Purpose:", spv.purpose);
    console.log("- Manager:", spv.manager);
    console.log("- Created At:", new Date(Number(spv.createdAt) * 1000).toISOString());
    console.log("- Is Active:", spv.isActive);
    
    // Check SPV investors (should be empty initially)
    const spvInvestors = await spvManager.getSPVInvestors(spvId);
    console.log("SPV Investors:", spvInvestors.length, "investors");
    
    // Check manager's SPVs
    const managerSPVs = await spvManager.getManagerSPVs(userAddress);
    console.log("Manager's SPVs:", managerSPVs.length, "SPVs");
    
    console.log("\n🎉 SPV Management test successful!");
    
  } catch (error) {
    console.error("❌ SPV Management test failed:", error.message);
    
    // Check if it's a role issue
    if (error.message.includes("AccessControl")) {
      console.log("\n🔍 This appears to be a role access issue");
      console.log("The user might not have the required SPV_ADMIN_ROLE");
    }
    
    // Check if it's a contract issue
    if (error.message.includes("execution reverted")) {
      console.log("\n🔍 This appears to be a contract execution issue");
      console.log("The SPV Manager contract might have validation requirements");
    }
  }
  
  console.log("\n📊 SPV Management Test Complete");
}

main().catch(console.error);
