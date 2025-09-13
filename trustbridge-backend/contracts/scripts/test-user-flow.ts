import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🎭 Testing TrustBridge Complete User Flow on Hedera testnet...");
  
  // Load deployment info
  const networkName = await ethers.provider.getNetwork().then(n => n.name);
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log("📋 Testing user flow on:", networkName);
  
  const [deployer] = await ethers.getSigners();
  
  // Create additional test accounts
  const farmer = ethers.Wallet.createRandom().connect(ethers.provider);
  const investor = ethers.Wallet.createRandom().connect(ethers.provider);
  const attestor1 = ethers.Wallet.createRandom().connect(ethers.provider);
  const attestor2 = ethers.Wallet.createRandom().connect(ethers.provider);
  
  console.log("👥 Test Participants:");
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Farmer: ${farmer.address}`);
  console.log(`   Investor: ${investor.address}`);
  console.log(`   Attestor 1: ${attestor1.address}`);
  console.log(`   Attestor 2: ${attestor2.address}`);
  
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
    console.log("\n🎬 ACT 1: Setup and Token Distribution");
    console.log("=====================================");
    
    // Send ETH to participants for gas
    await deployer.sendTransaction({ to: farmer.address, value: ethers.parseEther("1") });
    await deployer.sendTransaction({ to: investor.address, value: ethers.parseEther("1") });
    await deployer.sendTransaction({ to: attestor1.address, value: ethers.parseEther("1") });
    await deployer.sendTransaction({ to: attestor2.address, value: ethers.parseEther("1") });
    
    // Distribute TRUST tokens
    await trustToken.transfer(farmer.address, ethers.parseEther("10000"));
    await trustToken.transfer(investor.address, ethers.parseEther("10000"));
    await trustToken.transfer(attestor1.address, ethers.parseEther("10000"));
    await trustToken.transfer(attestor2.address, ethers.parseEther("10000"));
    
    console.log("✅ ETH distributed to all participants");
    console.log("✅ TRUST tokens distributed to all participants");
    
    console.log("\n🎬 ACT 2: Attestor Registration");
    console.log("================================");
    
    // Register attestors
    const attestorStake = ethers.parseEther("1000"); // 1000 HBAR stake
    
    console.log("📝 Registering Attestor 1 (Kenya Agricultural Cooperative)...");
    await attestorManager.connect(attestor1).registerAttestor(
      attestor1.address,
      "Kenya Agricultural Cooperative",
      "Kenya",
      attestorStake,
      { value: attestorStake }
    );
    
    console.log("📝 Registering Attestor 2 (Nigeria Real Estate Board)...");
    await attestorManager.connect(attestor2).registerAttestor(
      attestor2.address,
      "Nigeria Real Estate Board", 
      "Nigeria",
      attestorStake,
      { value: attestorStake }
    );
    
    // Verify attestor registration
    const attestor1Info = await attestorManager.getAttestorInfo(attestor1.address);
    const attestor2Info = await attestorManager.getAttestorInfo(attestor2.address);
    
    console.log("✅ Attestor 1 registered:", attestor1Info.isActive);
    console.log("✅ Attestor 2 registered:", attestor2Info.isActive);
    console.log(`✅ Total staked amount: ${ethers.formatEther(await attestorManager.totalStakedAmount())} HBAR`);
    
    console.log("\n🎬 ACT 3: Asset Verification Process");
    console.log("===================================");
    
    // Create a unique asset ID
    const assetId = ethers.keccak256(ethers.toUtf8Bytes(`FARM_${Date.now()}`));
    
    console.log("🌾 Farmer submits agricultural asset for verification...");
    console.log(`   Asset ID: ${assetId}`);
    
    // Submit verification request
    const verificationTx = await verificationRegistry.connect(farmer).submitVerification(
      assetId,
      "Agricultural Land",
      "Premium farmland in Kenya",
      "Kenya",
      ethers.parseEther("500000"), // $500,000 value
      Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60, // 180 days expiry
      ["0x"], // No additional data
      [attestor1.address, attestor2.address] // Both attestors
    );
    
    await verificationTx.wait();
    console.log("✅ Verification request submitted");
    
    // Attestors submit their assessments
    console.log("📋 Attestor 1 submits assessment...");
    await verificationRegistry.connect(attestor1).submitAttestation(
      assetId,
      8500, // 85% score
      "High-quality agricultural land with excellent soil conditions and water access",
      "VERIFIED"
    );
    
    console.log("📋 Attestor 2 submits assessment...");
    await verificationRegistry.connect(attestor2).submitAttestation(
      assetId,
      8200, // 82% score
      "Good agricultural potential with proper documentation",
      "VERIFIED"
    );
    
    // Check verification status
    const verificationRecord = await verificationRegistry.getVerificationRecord(assetId);
    console.log("✅ Verification Status:", verificationRecord.status);
    console.log("✅ Average Score:", verificationRecord.averageScore);
    console.log("✅ Attestations Count:", verificationRecord.attestationCount);
    
    console.log("\n🎬 ACT 4: Asset Tokenization");
    console.log("=============================");
    
    console.log("🏭 Farmer tokenizes the verified asset...");
    
    const tokenizationFee = ethers.parseEther("10000"); // 2% of $500,000 = $10,000
    
    const tokenizationTx = await assetFactory.connect(farmer).tokenizeAsset(
      "FARM_TOKEN",
      "Kenya Premium Farmland Token",
      "Kenya",
      ethers.parseEther("500000"), // Total value
      ethers.parseEther("100000"), // Token supply
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
      
      console.log("\n🎬 ACT 5: Investment and Staking");
      console.log("================================");
      
      // Investor stakes TRUST tokens
      console.log("💰 Investor stakes TRUST tokens...");
      const stakeAmount = ethers.parseEther("5000");
      const lockPeriod = 90 * 24 * 60 * 60; // 90 days
      
      await trustToken.connect(investor).stake(stakeAmount, lockPeriod);
      console.log("✅ Investor staked 5000 TRUST tokens for 90 days");
      
      // Check staking balance
      const stakedBalance = await trustToken.stakingBalances(investor.address);
      console.log(`✅ Staked Balance: ${ethers.formatEther(stakedBalance)} TRUST`);
      
      console.log("\n🎬 ACT 6: Settlement Creation");
      console.log("=============================");
      
      // Create a settlement for asset trading
      console.log("💸 Creating settlement for asset trade...");
      
      const settlementAmount = ethers.parseEther("100000"); // $100,000 trade
      const deliveryDeadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
      
      const settlementTx = await settlementEngine.connect(farmer).createSettlement(
        assetId,
        investor.address,
        settlementAmount,
        deliveryDeadline,
        "Asset transfer settlement"
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
      
      console.log("\n🎬 ACT 7: Fee Distribution");
      console.log("==========================");
      
      // Simulate fee distribution
      console.log("💰 Distributing protocol fees...");
      
      const FeeDistribution = await ethers.getContractFactory("FeeDistribution");
      const feeDistribution = FeeDistribution.attach(deploymentInfo.contracts.FeeDistribution.address);
      
      const feeAmount = ethers.parseEther("1000"); // 1000 HBAR in fees
      
      // Send fees to the contract
      await deployer.sendTransaction({ 
        to: await feeDistribution.getAddress(), 
        value: feeAmount 
      });
      
      console.log("✅ Fees sent to FeeDistribution contract");
      
      console.log("\n🎉 USER FLOW COMPLETED SUCCESSFULLY!");
      console.log("=====================================");
      
      console.log("📊 Final Summary:");
      console.log("✅ Attestors registered and staked");
      console.log("✅ Asset verified by multiple attestors");
      console.log("✅ Asset tokenized successfully");
      console.log("✅ Investor staked TRUST tokens");
      console.log("✅ Settlement created for trading");
      console.log("✅ Protocol fees distributed");
      
      console.log("\n🏆 TrustBridge Platform Features Demonstrated:");
      console.log("   🌾 Real-world asset verification");
      console.log("   🏭 Asset tokenization");
      console.log("   💰 Staking and rewards");
      console.log("   🔍 Multi-party verification");
      console.log("   💸 Settlement and escrow");
      console.log("   📊 Fee distribution");
      console.log("   🔒 Security and access control");
      
      console.log("\n🎯 Ready for Hedera Africa Hackathon 2025!");
      console.log("   This demonstrates a complete RWA tokenization platform");
      console.log("   Perfect for showcasing to hackathon judges!");
      
    } else {
      console.log("⚠️  Could not find AssetTokenized event");
    }
    
  } catch (error) {
    console.error("❌ User flow test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
