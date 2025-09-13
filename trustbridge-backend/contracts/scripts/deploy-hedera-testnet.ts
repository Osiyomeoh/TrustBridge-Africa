import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Deploying TrustBridge to Hedera Testnet...");
  
  // This script uses the same deployment logic as deploy-hedera.ts
  // but with testnet-specific configurations
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HBAR");
  
  if (balance < ethers.parseEther("5")) {
    console.log("⚠️  Warning: Low HBAR balance. Consider getting testnet HBAR from:");
    console.log("   - Hedera Testnet Faucet: https://portal.hedera.com/");
    console.log("   - Or use the Hedera CLI: hedera account create --testnet");
  }

  // Import and run the main deployment script
  const { exec } = require('child_process');
  
  exec('npx hardhat run scripts/deploy-hedera.ts --network hedera_testnet', (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(`❌ Deployment error: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️  Warning: ${stderr}`);
    }
    console.log(stdout);
    
    console.log("\n🎯 Testnet Deployment Complete!");
    console.log("📝 Next Steps:");
    console.log("1. Test all contract functions on testnet");
    console.log("2. Register test attestors");
    console.log("3. Create test asset verifications");
    console.log("4. Test the complete workflow");
    console.log("5. Once satisfied, deploy to mainnet");
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
