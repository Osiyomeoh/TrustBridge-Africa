import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Verifying TrustBridge contracts on Hedera Explorer...");
  
  // Load deployment info
  const networkName = await ethers.provider.getNetwork().then(n => n.name);
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log("📋 Contract addresses to verify:");
  
  const contracts = [
    { name: "TrustToken", address: deploymentInfo.contracts.TrustToken.address },
    { name: "AttestorManager", address: deploymentInfo.contracts.AttestorManager.address },
    { name: "PolicyManager", address: deploymentInfo.contracts.PolicyManager.address },
    { name: "VerificationRegistry", address: deploymentInfo.contracts.VerificationRegistry.address },
    { name: "AssetFactory", address: deploymentInfo.contracts.AssetFactory.address },
    { name: "SettlementEngine", address: deploymentInfo.contracts.SettlementEngine.address },
    { name: "FeeDistribution", address: deploymentInfo.contracts.FeeDistribution.address },
    { name: "VerificationBuffer", address: deploymentInfo.contracts.VerificationBuffer.address }
  ];
  
  console.log("\n🌐 Hedera Explorer Links:");
  contracts.forEach(contract => {
    const explorerUrl = `https://hashscan.io/testnet/contract/${contract.address}`;
    console.log(`   ${contract.name}: ${explorerUrl}`);
  });
  
  console.log("\n📝 Manual Verification Steps:");
  console.log("1. Visit each contract URL above");
  console.log("2. Click 'Verify Contract' if available");
  console.log("3. Upload the corresponding source code from contracts/");
  console.log("4. Enter constructor arguments if required");
  console.log("5. Submit for verification");
  
  console.log("\n🔧 Constructor Arguments (if needed):");
  console.log("   TrustToken: None");
  console.log("   AttestorManager: None");
  console.log("   PolicyManager: None");
  console.log("   VerificationRegistry: AttestorManager address, PolicyManager address");
  console.log("   AssetFactory: TrustToken address, fee recipient address, VerificationRegistry address");
  console.log("   SettlementEngine: fee recipient address");
  console.log("   FeeDistribution: treasury wallet, insurance pool, TrustToken address");
  console.log("   VerificationBuffer: None");
  
  console.log("\n📁 Source Code Files:");
  const sourceFiles = [
    "contracts/TrustToken.sol",
    "contracts/AttestorManager.sol", 
    "contracts/PolicyManager.sol",
    "contracts/VerificationRegistry.sol",
    "contracts/AssetFactory.sol",
    "contracts/SettlementEngine.sol",
    "contracts/FeeDistribution.sol",
    "contracts/VerificationBuffer.sol"
  ];
  
  sourceFiles.forEach(file => {
    console.log(`   ${file}`);
  });
  
  console.log("\n🎯 Quick Verification Commands:");
  console.log("   # Open all contracts in browser:");
  contracts.forEach(contract => {
    console.log(`   open https://hashscan.io/testnet/contract/${contract.address}`);
  });
  
  console.log("\n✅ Verification will help with:");
  console.log("   - Contract transparency");
  console.log("   - Source code verification");
  console.log("   - Better hackathon presentation");
  console.log("   - Increased trust from judges");
  
  console.log("\n🏆 Ready for Hedera Africa Hackathon 2025!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
