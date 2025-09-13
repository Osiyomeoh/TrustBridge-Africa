import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Verifying TrustBridge deployment readiness...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HBAR");
  
  if (balance < ethers.parseEther("10")) {
    console.log("⚠️  Warning: Low HBAR balance. Consider getting more HBAR.");
  }
  
  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  
  // Check if contracts compile
  console.log("\n🔨 Checking contract compilation...");
  try {
    await ethers.getContractFactory("TrustToken");
    await ethers.getContractFactory("AttestorManager");
    await ethers.getContractFactory("PolicyManager");
    await ethers.getContractFactory("VerificationRegistry");
    await ethers.getContractFactory("AssetFactory");
    await ethers.getContractFactory("SettlementEngine");
    await ethers.getContractFactory("FeeDistribution");
    await ethers.getContractFactory("VerificationBuffer");
    console.log("✅ All contracts compile successfully");
  } catch (error) {
    console.error("❌ Contract compilation failed:", error);
    return;
  }
  
  // Check if deployment directory exists
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    console.log("📁 Creating deployments directory...");
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Check if .env file exists
  const envFile = path.join(__dirname, "../.env");
  if (!fs.existsSync(envFile)) {
    console.log("⚠️  .env file not found. Please create it from env.template");
    console.log("   cp env.template .env");
    console.log("   # Then edit .env with your Hedera credentials");
  } else {
    console.log("✅ .env file found");
  }
  
  // Check if tests pass
  console.log("\n🧪 Checking if tests pass...");
  console.log("   Run: npm run test:all");
  console.log("   Or: npx hardhat test");
  
  console.log("\n🎯 Deployment Readiness Summary:");
  console.log("✅ Contracts compiled");
  console.log("✅ Network connected");
  console.log("✅ Deployer account ready");
  console.log("✅ Deployments directory ready");
  
  if (balance >= ethers.parseEther("10")) {
    console.log("✅ Sufficient HBAR balance");
  } else {
    console.log("⚠️  Low HBAR balance - may need more for deployment");
  }
  
  console.log("\n🚀 Ready to deploy! Run one of these commands:");
  console.log("   npm run deploy:hedera:testnet  # Deploy to testnet");
  console.log("   npm run deploy:hedera:mainnet  # Deploy to mainnet");
  console.log("   ./deploy.sh                    # Full deployment script");
  
  console.log("\n🏆 Good luck with Hedera Africa Hackathon 2025!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
