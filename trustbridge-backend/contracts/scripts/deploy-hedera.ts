import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

interface DeploymentInfo {
  network: string;
  timestamp: string;
  contracts: {
    [key: string]: {
      address: string;
      transactionHash: string;
      gasUsed: string;
    };
  };
  totalGasUsed: string;
  deployer: string;
}

async function main() {
  console.log("🚀 Starting TrustBridge deployment to Hedera...");
  
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available. Please check your network configuration and private key.");
  }
  
  const deployer = signers[0];
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HBAR");
  
  if (balance < ethers.parseEther("10")) {
    throw new Error("Insufficient HBAR balance. Need at least 10 HBAR for deployment.");
  }

  const deploymentInfo: DeploymentInfo = {
    network: await ethers.provider.getNetwork().then(n => n.name),
    timestamp: new Date().toISOString(),
    contracts: {},
    totalGasUsed: "0",
    deployer: deployer.address
  };

  let totalGasUsed = 0n;

  try {
    // 1. Deploy TrustToken
    console.log("\n📝 Deploying TrustToken...");
    const TrustToken = await ethers.getContractFactory("TrustToken");
    const trustToken = await TrustToken.deploy();
    await trustToken.waitForDeployment();
    const trustTokenAddress = await trustToken.getAddress();
    const trustTokenTx = await trustToken.deploymentTransaction();
    const trustTokenReceipt = await trustTokenTx?.wait();
    
    deploymentInfo.contracts.TrustToken = {
      address: trustTokenAddress,
      transactionHash: trustTokenReceipt?.hash || "",
      gasUsed: trustTokenReceipt?.gasUsed.toString() || "0"
    };
    totalGasUsed += BigInt(trustTokenReceipt?.gasUsed || 0);
    console.log("✅ TrustToken deployed to:", trustTokenAddress);

    // 2. Deploy AttestorManager
    console.log("\n👥 Deploying AttestorManager...");
    const AttestorManager = await ethers.getContractFactory("AttestorManager");
    const attestorManager = await AttestorManager.deploy();
    await attestorManager.waitForDeployment();
    const attestorManagerAddress = await attestorManager.getAddress();
    const attestorManagerTx = await attestorManager.deploymentTransaction();
    const attestorManagerReceipt = await attestorManagerTx?.wait();
    
    deploymentInfo.contracts.AttestorManager = {
      address: attestorManagerAddress,
      transactionHash: attestorManagerReceipt?.hash || "",
      gasUsed: attestorManagerReceipt?.gasUsed.toString() || "0"
    };
    totalGasUsed += BigInt(attestorManagerReceipt?.gasUsed || 0);
    console.log("✅ AttestorManager deployed to:", attestorManagerAddress);

    // 3. Deploy PolicyManager
    console.log("\n📋 Deploying PolicyManager...");
    const PolicyManager = await ethers.getContractFactory("PolicyManager");
    const policyManager = await PolicyManager.deploy();
    await policyManager.waitForDeployment();
    const policyManagerAddress = await policyManager.getAddress();
    const policyManagerTx = await policyManager.deploymentTransaction();
    const policyManagerReceipt = await policyManagerTx?.wait();
    
    deploymentInfo.contracts.PolicyManager = {
      address: policyManagerAddress,
      transactionHash: policyManagerReceipt?.hash || "",
      gasUsed: policyManagerReceipt?.gasUsed.toString() || "0"
    };
    totalGasUsed += BigInt(policyManagerReceipt?.gasUsed || 0);
    console.log("✅ PolicyManager deployed to:", policyManagerAddress);

    // 4. Deploy VerificationRegistry
    console.log("\n🔍 Deploying VerificationRegistry...");
    const VerificationRegistry = await ethers.getContractFactory("VerificationRegistry");
    const verificationRegistry = await VerificationRegistry.deploy(
      attestorManagerAddress,
      policyManagerAddress
    );
    await verificationRegistry.waitForDeployment();
    const verificationRegistryAddress = await verificationRegistry.getAddress();
    const verificationRegistryTx = await verificationRegistry.deploymentTransaction();
    const verificationRegistryReceipt = await verificationRegistryTx?.wait();
    
    deploymentInfo.contracts.VerificationRegistry = {
      address: verificationRegistryAddress,
      transactionHash: verificationRegistryReceipt?.hash || "",
      gasUsed: verificationRegistryReceipt?.gasUsed.toString() || "0"
    };
    totalGasUsed += BigInt(verificationRegistryReceipt?.gasUsed || 0);
    console.log("✅ VerificationRegistry deployed to:", verificationRegistryAddress);

    // 5. Deploy AssetFactory
    console.log("\n🏭 Deploying AssetFactory...");
    const AssetFactory = await ethers.getContractFactory("AssetFactory");
    const assetFactory = await AssetFactory.deploy(
      trustTokenAddress,
      deployer.address, // fee recipient
      verificationRegistryAddress
    );
    await assetFactory.waitForDeployment();
    const assetFactoryAddress = await assetFactory.getAddress();
    const assetFactoryTx = await assetFactory.deploymentTransaction();
    const assetFactoryReceipt = await assetFactoryTx?.wait();
    
    deploymentInfo.contracts.AssetFactory = {
      address: assetFactoryAddress,
      transactionHash: assetFactoryReceipt?.hash || "",
      gasUsed: assetFactoryReceipt?.gasUsed.toString() || "0"
    };
    totalGasUsed += BigInt(assetFactoryReceipt?.gasUsed || 0);
    console.log("✅ AssetFactory deployed to:", assetFactoryAddress);

    // 6. Deploy SettlementEngine
    console.log("\n💸 Deploying SettlementEngine...");
    const SettlementEngine = await ethers.getContractFactory("SettlementEngine");
    const settlementEngine = await SettlementEngine.deploy(
      deployer.address // fee recipient
    );
    await settlementEngine.waitForDeployment();
    const settlementEngineAddress = await settlementEngine.getAddress();
    const settlementEngineTx = await settlementEngine.deploymentTransaction();
    const settlementEngineReceipt = await settlementEngineTx?.wait();
    
    deploymentInfo.contracts.SettlementEngine = {
      address: settlementEngineAddress,
      transactionHash: settlementEngineReceipt?.hash || "",
      gasUsed: settlementEngineReceipt?.gasUsed.toString() || "0"
    };
    totalGasUsed += BigInt(settlementEngineReceipt?.gasUsed || 0);
    console.log("✅ SettlementEngine deployed to:", settlementEngineAddress);

    // 7. Deploy FeeDistribution
    console.log("\n💰 Deploying FeeDistribution...");
    const FeeDistribution = await ethers.getContractFactory("FeeDistribution");
    const feeDistribution = await FeeDistribution.deploy(
      deployer.address, // treasury wallet
      deployer.address, // insurance pool (using same address for simplicity)
      trustTokenAddress // trust token
    );
    await feeDistribution.waitForDeployment();
    const feeDistributionAddress = await feeDistribution.getAddress();
    const feeDistributionTx = await feeDistribution.deploymentTransaction();
    const feeDistributionReceipt = await feeDistributionTx?.wait();
    
    deploymentInfo.contracts.FeeDistribution = {
      address: feeDistributionAddress,
      transactionHash: feeDistributionReceipt?.hash || "",
      gasUsed: feeDistributionReceipt?.gasUsed.toString() || "0"
    };
    totalGasUsed += BigInt(feeDistributionReceipt?.gasUsed || 0);
    console.log("✅ FeeDistribution deployed to:", feeDistributionAddress);

    // 8. Deploy VerificationBuffer
    console.log("\n⏰ Deploying VerificationBuffer...");
    const VerificationBuffer = await ethers.getContractFactory("VerificationBuffer");
    const verificationBuffer = await VerificationBuffer.deploy();
    await verificationBuffer.waitForDeployment();
    const verificationBufferAddress = await verificationBuffer.getAddress();
    const verificationBufferTx = await verificationBuffer.deploymentTransaction();
    const verificationBufferReceipt = await verificationBufferTx?.wait();
    
    deploymentInfo.contracts.VerificationBuffer = {
      address: verificationBufferAddress,
      transactionHash: verificationBufferReceipt?.hash || "",
      gasUsed: verificationBufferReceipt?.gasUsed.toString() || "0"
    };
    totalGasUsed += BigInt(verificationBufferReceipt?.gasUsed || 0);
    console.log("✅ VerificationBuffer deployed to:", verificationBufferAddress);

    // 9. Setup permissions and initial configuration
    console.log("\n🔧 Setting up permissions and initial configuration...");
    
    // Grant MANAGER_ROLE to VerificationRegistry in AttestorManager
    const ATTESTOR_MANAGER_ROLE = await attestorManager.MANAGER_ROLE();
    const grantManagerRoleTx = await attestorManager.grantRole(
      ATTESTOR_MANAGER_ROLE,
      verificationRegistryAddress
    );
    await grantManagerRoleTx.wait();
    console.log("✅ Granted MANAGER_ROLE to VerificationRegistry");

    // Grant POLICY_ROLE to VerificationRegistry in PolicyManager
    const POLICY_ROLE = await policyManager.POLICY_ROLE();
    const grantPolicyManagerRoleTx = await policyManager.grantRole(
      POLICY_ROLE,
      verificationRegistryAddress
    );
    await grantPolicyManagerRoleTx.wait();
    console.log("✅ Granted POLICY_ROLE to VerificationRegistry");

    // Set up default asset type policies
    const agriculturalType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
    const realEstateType = ethers.keccak256(ethers.toUtf8Bytes("REAL_ESTATE"));
    const equipmentType = ethers.keccak256(ethers.toUtf8Bytes("EQUIPMENT"));

    await policyManager.setAssetTypePolicy(
      agriculturalType,
      7500, // 75% minimum score
      180 * 24 * 60 * 60, // 180 days expiry
      2, // 2 attestors required
      false // no manual review required
    );
    console.log("✅ Set up AGRICULTURAL policy");

    await policyManager.setAssetTypePolicy(
      realEstateType,
      8500, // 85% minimum score
      365 * 24 * 60 * 60, // 365 days expiry
      3, // 3 attestors required
      true // manual review required
    );
    console.log("✅ Set up REAL_ESTATE policy");

    await policyManager.setAssetTypePolicy(
      equipmentType,
      7000, // 70% minimum score
      90 * 24 * 60 * 60, // 90 days expiry
      1, // 1 attestor required
      false // no manual review required
    );
    console.log("✅ Set up EQUIPMENT policy");

    // 10. Save deployment information
    deploymentInfo.totalGasUsed = totalGasUsed.toString();
    
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const networkName = await ethers.provider.getNetwork().then(n => n.name);
    const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 TrustBridge deployment completed successfully!");
    console.log("📊 Deployment Summary:");
    console.log(`   Network: ${deploymentInfo.network}`);
    console.log(`   Total Gas Used: ${ethers.formatUnits(totalGasUsed, "gwei")} gwei`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Deployment Info: ${deploymentFile}`);
    
    console.log("\n📋 Contract Addresses:");
    Object.entries(deploymentInfo.contracts).forEach(([name, info]) => {
      console.log(`   ${name}: ${info.address}`);
    });

    console.log("\n🔗 Next Steps:");
    console.log("1. Verify contracts on Hedera Explorer");
    console.log("2. Register initial attestors");
    console.log("3. Set up monitoring and alerts");
    console.log("4. Deploy frontend application");
    console.log("5. Launch marketing campaign for Hedera Africa Hackathon 2025!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });