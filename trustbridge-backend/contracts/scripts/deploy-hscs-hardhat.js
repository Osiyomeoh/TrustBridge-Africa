const hre = require("hardhat");

async function main() {
  console.log('🚀 Deploying HSCS Contracts using Hardhat...');
  
  // Get configuration
  const [deployer] = await hre.ethers.getSigners();
  const trustTokenId = process.env.TRUST_TOKEN_ID || '0.0.6934709';
  const treasuryWallet = process.env.TREASURY_ACCOUNT_ID || deployer.address;
  const operationsWallet = process.env.OPERATIONS_ACCOUNT_ID || deployer.address;
  const stakingPool = process.env.STAKING_ACCOUNT_ID || deployer.address;
  
  console.log('📋 Configuration:');
  console.log('Deployer:', deployer.address);
  console.log('Trust Token ID:', trustTokenId);
  console.log('Treasury Wallet:', treasuryWallet);
  console.log('Operations Wallet:', operationsWallet);
  console.log('Staking Pool:', stakingPool);
  
  const deploymentResults = {};
  
  try {
    // Deploy TrustTokenExchange
    console.log('\n🔄 Deploying TrustTokenExchange...');
    const TrustTokenExchange = await hre.ethers.getContractFactory("TrustTokenExchange");
    const trustTokenExchange = await TrustTokenExchange.deploy(
      trustTokenId,
      treasuryWallet,
      operationsWallet,
      stakingPool
    );
    await trustTokenExchange.waitForDeployment();
    deploymentResults.trustTokenExchange = await trustTokenExchange.getAddress();
    console.log('✅ TrustTokenExchange deployed to:', deploymentResults.trustTokenExchange);
    
    // Deploy TrustTokenBurner
    console.log('\n🔄 Deploying TrustTokenBurner...');
    const TrustTokenBurner = await hre.ethers.getContractFactory("TrustTokenBurner");
    const trustTokenBurner = await TrustTokenBurner.deploy(
      trustTokenId,
      treasuryWallet
    );
    await trustTokenBurner.waitForDeployment();
    deploymentResults.trustTokenBurner = await trustTokenBurner.getAddress();
    console.log('✅ TrustTokenBurner deployed to:', deploymentResults.trustTokenBurner);
    
    // Deploy TrustTokenStaking
    console.log('\n🔄 Deploying TrustTokenStaking...');
    const TrustTokenStaking = await hre.ethers.getContractFactory("TrustTokenStaking");
    const trustTokenStaking = await TrustTokenStaking.deploy(
      trustTokenId,
      stakingPool
    );
    await trustTokenStaking.waitForDeployment();
    deploymentResults.trustTokenStaking = await trustTokenStaking.getAddress();
    console.log('✅ TrustTokenStaking deployed to:', deploymentResults.trustTokenStaking);
    
    // Test deployed contracts
    console.log('\n🧪 Testing deployed contracts...');
    
    try {
      const exchangeStats = await trustTokenExchange.getExchangeStats();
      console.log('✅ TrustTokenExchange test successful');
    } catch (error) {
      console.log('⚠️ TrustTokenExchange test failed:', error.message);
    }
    
    try {
      const fee = await trustTokenBurner.calculateNftCreationFee("basic", "common");
      console.log('✅ TrustTokenBurner test successful, fee:', fee.toString());
    } catch (error) {
      console.log('⚠️ TrustTokenBurner test failed:', error.message);
    }
    
    try {
      const stats = await trustTokenStaking.getGlobalStats();
      console.log('✅ TrustTokenStaking test successful');
    } catch (error) {
      console.log('⚠️ TrustTokenStaking test failed:', error.message);
    }
    
    // Save deployment results
    const deploymentData = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: deploymentResults,
      configuration: {
        treasuryWallet,
        operationsWallet,
        stakingPool,
        trustTokenContract: trustTokenId
      }
    };
    
    const fs = require('fs');
    const path = require('path');
    const deploymentFile = path.join(__dirname, '../deployments/hscs-hardhat.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log('\n💾 Deployment data saved to:', deploymentFile);
    
    // Generate environment variables
    const envVars = `
# HSCS Contract Addresses (Generated on ${new Date().toISOString()})
TRUST_TOKEN_EXCHANGE_CONTRACT_ID=${deploymentResults.trustTokenExchange}
TRUST_TOKEN_BURNER_CONTRACT_ID=${deploymentResults.trustTokenBurner}
TRUST_TOKEN_STAKING_CONTRACT_ID=${deploymentResults.trustTokenStaking}

# Account Addresses for Distribution
TREASURY_ACCOUNT_ID=${treasuryWallet}
OPERATIONS_ACCOUNT_ID=${operationsWallet}
STAKING_ACCOUNT_ID=${stakingPool}
TRUST_TOKEN_ID=${trustTokenId}
`;
    
    const envFile = path.join(__dirname, '../.env.hscs');
    fs.writeFileSync(envFile, envVars);
    console.log('📝 Environment variables saved to:', envFile);
    
    console.log('\n🎉 HSCS Contract Deployment Complete!');
    console.log('\n📊 Deployment Summary:');
    console.log('┌─────────────────────────┬──────────────────────────────────────────┐');
    console.log('│ Contract                │ Address                                   │');
    console.log('├─────────────────────────┼──────────────────────────────────────────┤');
    console.log(`│ TrustTokenExchange      │ ${deploymentResults.trustTokenExchange.padEnd(42)} │`);
    console.log(`│ TrustTokenBurner        │ ${deploymentResults.trustTokenBurner.padEnd(42)} │`);
    console.log(`│ TrustTokenStaking       │ ${deploymentResults.trustTokenStaking.padEnd(42)} │`);
    console.log('└─────────────────────────┴──────────────────────────────────────────┘');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
