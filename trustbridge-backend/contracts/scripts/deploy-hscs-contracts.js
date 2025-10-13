const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting HSCS Contract Deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Configuration - Use Hedera account IDs
  const treasuryWallet = process.env.TREASURY_ACCOUNT_ID || "0.0.6916959";
  const operationsWallet = process.env.OPERATIONS_ACCOUNT_ID || "0.0.6916959";
  const stakingPool = process.env.STAKING_ACCOUNT_ID || "0.0.6916959";
  const trustTokenContract = process.env.TRUST_TOKEN_ID || "0.0.6934709";

  console.log("\n📋 Deployment Configuration:");
  console.log("Treasury Wallet:", treasuryWallet);
  console.log("Operations Wallet:", operationsWallet);
  console.log("Staking Pool:", stakingPool);
  console.log("Trust Token Contract:", trustTokenContract);

  const deploymentResults = {};

  try {
    // 1. Deploy TrustTokenExchange Contract
    console.log("\n🔄 Deploying TrustTokenExchange...");
    const TrustTokenExchange = await ethers.getContractFactory("TrustTokenExchange");
    const trustTokenExchange = await TrustTokenExchange.deploy(
      treasuryWallet,
      operationsWallet,
      stakingPool,
      trustTokenContract
    );
    await trustTokenExchange.waitForDeployment();
    const exchangeAddress = await trustTokenExchange.getAddress();
    console.log("✅ TrustTokenExchange deployed to:", exchangeAddress);
    deploymentResults.trustTokenExchange = exchangeAddress;

    // 2. Deploy TrustTokenBurner Contract
    console.log("\n🔄 Deploying TrustTokenBurner...");
    const TrustTokenBurner = await ethers.getContractFactory("TrustTokenBurner");
    const trustTokenBurner = await TrustTokenBurner.deploy(
      trustTokenContract,
      treasuryWallet
    );
    await trustTokenBurner.waitForDeployment();
    const burnerAddress = await trustTokenBurner.getAddress();
    console.log("✅ TrustTokenBurner deployed to:", burnerAddress);
    deploymentResults.trustTokenBurner = burnerAddress;

    // 3. Deploy TrustTokenStaking Contract
    console.log("\n🔄 Deploying TrustTokenStaking...");
    const TrustTokenStaking = await ethers.getContractFactory("TrustTokenStaking");
    const trustTokenStaking = await TrustTokenStaking.deploy(
      trustTokenContract,
      stakingPool
    );
    await trustTokenStaking.waitForDeployment();
    const stakingAddress = await trustTokenStaking.getAddress();
    console.log("✅ TrustTokenStaking deployed to:", stakingAddress);
    deploymentResults.trustTokenStaking = stakingAddress;

    // 4. Verify deployments
    console.log("\n🔍 Verifying deployments...");
    
    // Check exchange contract
    const exchangeCode = await ethers.provider.getCode(exchangeAddress);
    console.log("Exchange contract code length:", exchangeCode.length);
    
    // Check burner contract
    const burnerCode = await ethers.provider.getCode(burnerAddress);
    console.log("Burner contract code length:", burnerCode.length);
    
    // Check staking contract
    const stakingCode = await ethers.provider.getCode(stakingAddress);
    console.log("Staking contract code length:", stakingCode.length);

    // 5. Test contract functions
    console.log("\n🧪 Testing contract functions...");
    
    // Test exchange contract
    try {
      const exchangeStats = await trustTokenExchange.getExchangeStats();
      console.log("✅ Exchange contract stats:", {
        totalHbarReceived: exchangeStats[0].toString(),
        totalTrustMinted: exchangeStats[1].toString(),
        totalExchanges: exchangeStats[2].toString(),
        contractBalance: exchangeStats[3].toString()
      });
    } catch (error) {
      console.log("⚠️ Exchange contract test failed:", error.message);
    }

    // Test burner contract
    try {
      const basicFee = await trustTokenBurner.calculateNftCreationFee("basic", "common");
      console.log("✅ Burner contract - Basic fee:", basicFee.toString());
    } catch (error) {
      console.log("⚠️ Burner contract test failed:", error.message);
    }

    // Test staking contract
    try {
      const globalStats = await trustTokenStaking.getGlobalStats();
      console.log("✅ Staking contract stats:", {
        totalStakedAmount: globalStats[0].toString(),
        totalRewardsDistributed: globalStats[1].toString(),
        totalStakers: globalStats[2].toString()
      });
    } catch (error) {
      console.log("⚠️ Staking contract test failed:", error.message);
    }

    // 6. Save deployment results
    const deploymentData = {
      network: "hedera_testnet",
      chainId: 296,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: deploymentResults,
      configuration: {
        treasuryWallet,
        operationsWallet,
        stakingPool,
        trustTokenContract
      }
    };

    const deploymentFile = path.join(__dirname, "../deployments/hscs-contracts.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log("\n💾 Deployment data saved to:", deploymentFile);

    // 7. Generate environment variables
    const envVars = `
# HSCS Contract Addresses (Generated on ${new Date().toISOString()})
TRUST_TOKEN_EXCHANGE_CONTRACT_ID=${exchangeAddress}
TRUST_TOKEN_BURNER_CONTRACT_ID=${burnerAddress}
TRUST_TOKEN_STAKING_CONTRACT_ID=${stakingAddress}

# Account Addresses for Distribution
TREASURY_ACCOUNT_ID=${treasuryWallet}
OPERATIONS_ACCOUNT_ID=${operationsWallet}
STAKING_ACCOUNT_ID=${stakingPool}
`;

    const envFile = path.join(__dirname, "../.env.hscs");
    fs.writeFileSync(envFile, envVars);
    console.log("📝 Environment variables saved to:", envFile);

    console.log("\n🎉 HSCS Contract Deployment Complete!");
    console.log("\n📊 Deployment Summary:");
    console.log("┌─────────────────────────┬──────────────────────────────────────────┐");
    console.log("│ Contract                │ Address                                   │");
    console.log("├─────────────────────────┼──────────────────────────────────────────┤");
    console.log(`│ TrustTokenExchange      │ ${exchangeAddress.padEnd(42)} │`);
    console.log(`│ TrustTokenBurner        │ ${burnerAddress.padEnd(42)} │`);
    console.log(`│ TrustTokenStaking       │ ${stakingAddress.padEnd(42)} │`);
    console.log("└─────────────────────────┴──────────────────────────────────────────┘");

    console.log("\n🔧 Next Steps:");
    console.log("1. Update your .env file with the contract addresses above");
    console.log("2. Restart your backend service");
    console.log("3. Test the integration with the frontend");
    console.log("4. Verify contracts on Hedera Explorer");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
