import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("📋 Preparing TrustBridge contracts for HashScan verification...");
  
  // Load deployment info
  const networkName = await ethers.provider.getNetwork().then(n => n.name);
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  // Create verification directory
  const verificationDir = path.join(__dirname, "../verification");
  if (!fs.existsSync(verificationDir)) {
    fs.mkdirSync(verificationDir, { recursive: true });
  }
  
  const contracts = [
    { 
      name: "TrustToken", 
      address: deploymentInfo.contracts.TrustToken.address,
      sourceFile: "contracts/TrustToken.sol",
      metadataFile: "artifacts/contracts/TrustToken.sol/TrustToken.json",
      constructorArgs: []
    },
    { 
      name: "AttestorManager", 
      address: deploymentInfo.contracts.AttestorManager.address,
      sourceFile: "contracts/AttestorManager.sol",
      metadataFile: "artifacts/contracts/AttestorManager.sol/AttestorManager.json",
      constructorArgs: []
    },
    { 
      name: "PolicyManager", 
      address: deploymentInfo.contracts.PolicyManager.address,
      sourceFile: "contracts/PolicyManager.sol",
      metadataFile: "artifacts/contracts/PolicyManager.sol/PolicyManager.json",
      constructorArgs: []
    },
    { 
      name: "VerificationRegistry", 
      address: deploymentInfo.contracts.VerificationRegistry.address,
      sourceFile: "contracts/VerificationRegistry.sol",
      metadataFile: "artifacts/contracts/VerificationRegistry.sol/VerificationRegistry.json",
      constructorArgs: [
        deploymentInfo.contracts.AttestorManager.address,
        deploymentInfo.contracts.PolicyManager.address
      ]
    },
    { 
      name: "AssetFactory", 
      address: deploymentInfo.contracts.AssetFactory.address,
      sourceFile: "contracts/AssetFactory.sol",
      metadataFile: "artifacts/contracts/AssetFactory.sol/AssetFactory.json",
      constructorArgs: [
        deploymentInfo.contracts.TrustToken.address,
        deploymentInfo.deployer, // fee recipient
        deploymentInfo.contracts.VerificationRegistry.address
      ]
    },
    { 
      name: "SettlementEngine", 
      address: deploymentInfo.contracts.SettlementEngine.address,
      sourceFile: "contracts/SettlementEngine.sol",
      metadataFile: "artifacts/contracts/SettlementEngine.sol/SettlementEngine.json",
      constructorArgs: [
        deploymentInfo.deployer // fee recipient
      ]
    },
    { 
      name: "FeeDistribution", 
      address: deploymentInfo.contracts.FeeDistribution.address,
      sourceFile: "contracts/FeeDistribution.sol",
      metadataFile: "artifacts/contracts/FeeDistribution.sol/FeeDistribution.json",
      constructorArgs: [
        deploymentInfo.deployer, // treasury wallet
        deploymentInfo.deployer, // insurance pool
        deploymentInfo.contracts.TrustToken.address
      ]
    },
    { 
      name: "VerificationBuffer", 
      address: deploymentInfo.contracts.VerificationBuffer.address,
      sourceFile: "contracts/VerificationBuffer.sol",
      metadataFile: "artifacts/contracts/VerificationBuffer.sol/VerificationBuffer.json",
      constructorArgs: []
    }
  ];
  
  console.log("\n📁 Copying source files and metadata for verification...");
  
  contracts.forEach(contract => {
    const contractDir = path.join(verificationDir, contract.name);
    if (!fs.existsSync(contractDir)) {
      fs.mkdirSync(contractDir, { recursive: true });
    }
    
    // Copy source file
    const sourcePath = path.join(__dirname, "..", contract.sourceFile);
    const destSourcePath = path.join(contractDir, `${contract.name}.sol`);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destSourcePath);
      console.log(`✅ Copied ${contract.name}.sol`);
    } else {
      console.log(`❌ Source file not found: ${sourcePath}`);
    }
    
    // Copy metadata file
    const metadataPath = path.join(__dirname, "..", contract.metadataFile);
    const destMetadataPath = path.join(contractDir, `${contract.name}.json`);
    if (fs.existsSync(metadataPath)) {
      fs.copyFileSync(metadataPath, destMetadataPath);
      console.log(`✅ Copied ${contract.name}.json`);
    } else {
      console.log(`❌ Metadata file not found: ${metadataPath}`);
    }
    
    // Create verification info file
    const verificationInfo = {
      contractName: contract.name,
      address: contract.address,
      network: networkName,
      sourceFile: `${contract.name}.sol`,
      metadataFile: `${contract.name}.json`,
      constructorArgs: contract.constructorArgs,
      hashscanUrl: `https://hashscan.io/testnet/contract/${contract.address}`,
      verificationSteps: [
        "1. Go to the HashScan URL above",
        "2. Click 'Verify' in the Contract Bytecode section",
        "3. Upload the .sol source file",
        "4. Upload the .json metadata file",
        "5. Enter constructor arguments if any",
        "6. Click 'VERIFY' to submit"
      ]
    };
    
    const infoPath = path.join(contractDir, "verification-info.json");
    fs.writeFileSync(infoPath, JSON.stringify(verificationInfo, null, 2));
  });
  
  console.log("\n🌐 HashScan Verification URLs:");
  contracts.forEach(contract => {
    console.log(`   ${contract.name}: https://hashscan.io/testnet/contract/${contract.address}`);
  });
  
  console.log("\n📋 Verification Files Created:");
  console.log(`   Location: ${verificationDir}`);
  contracts.forEach(contract => {
    console.log(`   ${contract.name}/`);
    console.log(`     ├── ${contract.name}.sol (source code)`);
    console.log(`     ├── ${contract.name}.json (metadata)`);
    console.log(`     └── verification-info.json (instructions)`);
  });
  
  console.log("\n🔧 Constructor Arguments Summary:");
  contracts.forEach(contract => {
    if (contract.constructorArgs.length > 0) {
      console.log(`   ${contract.name}: ${contract.constructorArgs.join(", ")}`);
    } else {
      console.log(`   ${contract.name}: None`);
    }
  });
  
  console.log("\n📝 Next Steps:");
  console.log("1. Go to each HashScan URL above");
  console.log("2. Click 'Verify' in the Contract Bytecode section");
  console.log("3. Upload the .sol and .json files from verification/ directory");
  console.log("4. Enter constructor arguments if required");
  console.log("5. Submit for verification");
  
  console.log("\n🎯 Quick Start:");
  console.log("   # Open all contracts in browser:");
  contracts.forEach(contract => {
    console.log(`   open https://hashscan.io/testnet/contract/${contract.address}`);
  });
  
  console.log("\n✅ All verification files prepared!");
  console.log("🏆 Ready for HashScan verification!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
