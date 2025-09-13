import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🎭 Testing TrustBridge Core Flow on Hedera testnet...");
  
  // Load deployment info
  const networkName = await ethers.provider.getNetwork().then(n => n.name);
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log("📋 Testing on network:", networkName);
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);
  
  // Connect to contracts
  const TrustToken = await ethers.getContractFactory("TrustToken");
  const trustToken = TrustToken.attach(deploymentInfo.contracts.TrustToken.address);
  
  const AttestorManager = await ethers.getContractFactory("AttestorManager");
  const attestorManager = AttestorManager.attach(deploymentInfo.contracts.AttestorManager.address);
  
  const PolicyManager = await ethers.getContractFactory("PolicyManager");
  const policyManager = PolicyManager.attach(deploymentInfo.contracts.PolicyManager.address);
  
  const VerificationRegistry = await ethers.getContractFactory("VerificationRegistry");
  const verificationRegistry = VerificationRegistry.attach(deploymentInfo.contracts.VerificationRegistry.address);
  
  const AssetFactory = await ethers.getContractFactory("AssetFactory");
  const assetFactory = AssetFactory.attach(deploymentInfo.contracts.AssetFactory.address);
  
  const SettlementEngine = await ethers.getContractFactory("SettlementEngine");
  const settlementEngine = SettlementEngine.attach(deploymentInfo.contracts.SettlementEngine.address);
  
  try {
    console.log("\n🎬 STEP 1: Check Initial State");
    console.log("==============================");
    
    const deployerBalance = await trustToken.balanceOf(deployer.address);
    const hbarBalance = await ethers.provider.getBalance(deployer.address);
    const totalStaked = await attestorManager.totalStakedAmount();
    
    console.log(`✅ Deployer TRUST Balance: ${ethers.formatEther(deployerBalance)} TRUST`);
    console.log(`✅ Deployer HBAR Balance: ${ethers.formatEther(hbarBalance)} HBAR`);
    console.log(`✅ Total Staked Amount: ${ethers.formatEther(totalStaked)} HBAR`);
    
    console.log("\n🎬 STEP 2: Staking TRUST Tokens");
    console.log("===============================");
    
    const stakeAmount = ethers.parseEther("2000"); // 2000 TRUST
    const lockPeriod = 90 * 24 * 60 * 60; // 90 days
    
    console.log(`💰 Staking ${ethers.formatEther(stakeAmount)} TRUST for ${lockPeriod / (24 * 60 * 60)} days...`);
    
    const stakeTx = await trustToken.stake(stakeAmount, lockPeriod);
    await stakeTx.wait();
    
    const stakedBalance = await trustToken.stakingBalances(deployer.address);
    console.log(`✅ Staked Balance: ${ethers.formatEther(stakedBalance)} TRUST`);
    
    console.log("\n🎬 STEP 3: Register Attestor (as Admin)");
    console.log("======================================");
    
    // Create a test attestor address
    const testAttestor = ethers.Wallet.createRandom().address;
    const attestorStake = ethers.parseEther("50"); // 50 HBAR stake
    
    console.log(`👥 Registering test attestor: ${testAttestor}`);
    console.log(`   Stake: ${ethers.formatEther(attestorStake)} HBAR`);
    
    const registerTx = await attestorManager.registerAttestor(
      testAttestor,
      "Test Attestor Organization",
      "Kenya",
      attestorStake,
      { value: attestorStake }
    );
    await registerTx.wait();
    
    const attestorInfo = await attestorManager.getAttestorInfo(testAttestor);
    console.log(`✅ Attestor Registered: ${attestorInfo.isActive}`);
    console.log(`✅ Attestor Stake: ${ethers.formatEther(attestorInfo.stakeAmount)} HBAR`);
    console.log(`✅ Attestor Reputation: ${attestorInfo.reputationScore}`);
    
    console.log("\n🎬 STEP 4: Submit Asset Verification");
    console.log("===================================");
    
    // Create a unique asset ID
    const assetId = ethers.keccak256(ethers.toUtf8Bytes(`TEST_FARM_${Date.now()}`));
    
    console.log(`🌾 Submitting agricultural asset for verification...`);
    console.log(`   Asset ID: ${assetId}`);
    
    const verificationTx = await verificationRegistry.submitVerification(
      assetId,
      "Test Agricultural Land",
      "Premium farmland for testing purposes",
      "Kenya",
      ethers.parseEther("100000"), // $100,000 value
      Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60, // 180 days expiry
      ["0x"], // No additional data
      [testAttestor] // Test attestor
    );
    await verificationTx.wait();
    
    console.log("✅ Verification request submitted");
    
    console.log("\n🎬 STEP 5: Submit Attestation (as Admin)");
    console.log("=======================================");
    
    console.log("📋 Submitting attestation for the test attestor...");
    
    const attestationTx = await verificationRegistry.submitAttestation(
      assetId,
      8500, // 85% score
      "High-quality agricultural land with excellent potential for farming",
      "VERIFIED"
    );
    await attestationTx.wait();
    
    console.log("✅ Attestation submitted");
    
    // Check verification status
    const verificationRecord = await verificationRegistry.getVerificationRecord(assetId);
    console.log(`✅ Verification Status: ${verificationRecord.status}`);
    console.log(`✅ Average Score: ${verificationRecord.averageScore}`);
    console.log(`✅ Attestations Count: ${verificationRecord.attestationCount}`);
    
    console.log("\n🎬 STEP 6: Tokenize Asset");
    console.log("========================");
    
    console.log("🏭 Tokenizing the verified asset...");
    
    const tokenizationFee = ethers.parseEther("2000"); // 2% of $100,000 = $2,000
    
    const tokenizationTx = await assetFactory.tokenizeAsset(
      "TEST_FARM_TOKEN",
      "Test Farmland Token",
      "Kenya",
      ethers.parseEther("100000"), // Total value
      ethers.parseEther("10000"), // Token supply
      Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year expiry
      assetId,
      { value: tokenizationFee }
    );
    
    const tokenizationReceipt = await tokenizationTx.wait();
    console.log("✅ Asset tokenized successfully");
    
    // Get the created asset token address from events
    const assetCreatedEvent = tokenizationReceipt?.logs.find(log => {
      try {
        const parsed = assetFactory.interface.parseLog(log);
        return parsed?.name === "AssetTokenized";
      } catch {
        return false;
      }
    });
    
    if (assetCreatedEvent) {
      const parsed = assetFactory.interface.parseLog(assetCreatedEvent);
      const assetTokenAddress = parsed?.args.assetToken;
      console.log(`✅ Asset Token Address: ${assetTokenAddress}`);
    }
    
    console.log("\n🎬 STEP 7: Create Settlement");
    console.log("===========================");
    
    console.log("💸 Creating settlement for asset trade...");
    
    const settlementAmount = ethers.parseEther("10000"); // $10,000 trade
    const deliveryDeadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
    
    const settlementTx = await settlementEngine.createSettlement(
      assetId,
      deployer.address, // Self as buyer
      settlementAmount,
      deliveryDeadline,
      "Test asset transfer settlement"
    );
    
    const settlementReceipt = await settlementTx.wait();
    console.log("✅ Settlement created successfully");
    
    // Get settlement ID from event
    const settlementCreatedEvent = settlementReceipt?.logs.find(log => {
      try {
        const parsed = settlementEngine.interface.parseLog(log);
        return parsed?.name === "SettlementCreated";
      } catch {
        return false;
      }
    });
    
    if (settlementCreatedEvent) {
      const parsed = settlementEngine.interface.parseLog(settlementCreatedEvent);
      const settlementId = parsed?.args.settlementId;
      console.log(`✅ Settlement ID: ${settlementId}`);
      
      // Check settlement details
      const settlement = await settlementEngine.settlements(settlementId);
      console.log(`✅ Settlement Amount: ${ethers.formatEther(settlement.amount)} HBAR`);
      console.log(`✅ Settlement Status: ${settlement.status}`);
    }
    
    console.log("\n🎬 STEP 8: Check Final State");
    console.log("===========================");
    
    const finalTrustBalance = await trustToken.balanceOf(deployer.address);
    const finalHbarBalance = await ethers.provider.getBalance(deployer.address);
    const finalStakedBalance = await trustToken.stakingBalances(deployer.address);
    const finalTotalStaked = await attestorManager.totalStakedAmount();
    
    console.log(`✅ Final TRUST Balance: ${ethers.formatEther(finalTrustBalance)} TRUST`);
    console.log(`✅ Final HBAR Balance: ${ethers.formatEther(finalHbarBalance)} HBAR`);
    console.log(`✅ Final Staked Balance: ${ethers.formatEther(finalStakedBalance)} TRUST`);
    console.log(`✅ Final Total Staked: ${ethers.formatEther(finalTotalStaked)} HBAR`);
    
    console.log("\n🎉 CORE USER FLOW COMPLETED!");
    console.log("===========================");
    
    console.log("📊 Final Summary:");
    console.log("✅ TRUST tokens staked");
    console.log("✅ Test attestor registered");
    console.log("✅ Asset verification submitted");
    console.log("✅ Attestation provided");
    console.log("✅ Asset tokenized");
    console.log("✅ Settlement created");
    
    console.log("\n🏆 TrustBridge Features Demonstrated:");
    console.log("   💰 Token staking");
    console.log("   👥 Attestor management");
    console.log("   🔍 Asset verification");
    console.log("   📋 Attestation process");
    console.log("   🏭 Asset tokenization");
    console.log("   💸 Settlement creation");
    console.log("   🔒 Role-based access control");
    
    console.log("\n🎯 This demonstrates the complete TrustBridge functionality!");
    console.log("   Perfect for showcasing to hackathon judges!");
    console.log("   All transactions executed on real Hedera testnet!");
    
  } catch (error) {
    console.error("❌ Core flow test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
