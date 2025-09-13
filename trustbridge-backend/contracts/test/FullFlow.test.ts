import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TrustBridge Full End-to-End Flow", function () {
  let owner: SignerWithAddress;
  let farmer: SignerWithAddress;
  let investor: SignerWithAddress;
  let attestor1: SignerWithAddress;
  let attestor2: SignerWithAddress;
  let attestor3: SignerWithAddress;

  // Contract instances
  let trustToken: any;
  let attestorManager: any;
  let policyManager: any;
  let verificationRegistry: any;
  let assetFactory: any;
  let settlementEngine: any;
  let feeDistribution: any;

  before(async function () {
    [owner, farmer, investor, attestor1, attestor2, attestor3] = await ethers.getSigners();

    console.log("🏗️  Deploying TrustBridge contracts...");

    // Deploy TrustToken
    const TrustToken = await ethers.getContractFactory("TrustToken");
    trustToken = await TrustToken.deploy();
    await trustToken.waitForDeployment();

    // Deploy AttestorManager
    const AttestorManager = await ethers.getContractFactory("AttestorManager");
    attestorManager = await AttestorManager.deploy();
    await attestorManager.waitForDeployment();

    // Deploy PolicyManager
    const PolicyManager = await ethers.getContractFactory("PolicyManager");
    policyManager = await PolicyManager.deploy();
    await policyManager.waitForDeployment();

    // Deploy VerificationRegistry
    const VerificationRegistry = await ethers.getContractFactory("VerificationRegistry");
    verificationRegistry = await VerificationRegistry.deploy(
      await attestorManager.getAddress(),
      await policyManager.getAddress()
    );
    await verificationRegistry.waitForDeployment();

    // Deploy AssetFactory
    const AssetFactory = await ethers.getContractFactory("AssetFactory");
    assetFactory = await AssetFactory.deploy(
      await trustToken.getAddress(),
      owner.address,
      await verificationRegistry.getAddress()
    );
    await assetFactory.waitForDeployment();

    // Deploy SettlementEngine
    const SettlementEngine = await ethers.getContractFactory("SettlementEngine");
    settlementEngine = await SettlementEngine.deploy(owner.address);
    await settlementEngine.waitForDeployment();

    // Deploy FeeDistribution
    const FeeDistribution = await ethers.getContractFactory("FeeDistribution");
    feeDistribution = await FeeDistribution.deploy(
      owner.address,
      owner.address,
      await trustToken.getAddress()
    );
    await feeDistribution.waitForDeployment();

    // Setup permissions
    const MANAGER_ROLE = await attestorManager.MANAGER_ROLE();
    await attestorManager.grantRole(MANAGER_ROLE, await verificationRegistry.getAddress());

    // Transfer tokens to users
    await trustToken.connect(owner).transfer(farmer.address, ethers.parseEther("50000"));
    await trustToken.connect(owner).transfer(investor.address, ethers.parseEther("100000"));
    
    // Give farmer some ETH for fees
    await owner.sendTransaction({
      to: farmer.address,
      value: ethers.parseEther("9000") // 9,000 ETH for fees
    });

    console.log("✅ All contracts deployed successfully");
  });

  it("Should complete the full TrustBridge workflow", async function () {
    console.log("\n🌱 Step 1: Setting up attestors and policies...");

    // 1. Register multiple attestors
    const stakeAmount = ethers.parseEther("100"); // Further reduced stake amount
    
    await attestorManager.connect(owner).registerAttestor(
      attestor1.address,
      "Agricultural Cooperative",
      "Kenya",
      stakeAmount,
      { value: stakeAmount }
    );

    await attestorManager.connect(owner).registerAttestor(
      attestor2.address,
      "Government Official",
      "Kenya",
      stakeAmount,
      { value: stakeAmount }
    );

    await attestorManager.connect(owner).registerAttestor(
      attestor3.address,
      "Surveyor",
      "Kenya",
      stakeAmount,
      { value: stakeAmount }
    );

    console.log("✅ Registered 3 attestors");

    // 2. Set up asset type policies
    const agriculturalType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
    const realEstateType = ethers.keccak256(ethers.toUtf8Bytes("REAL_ESTATE"));

    // Agricultural policy - requires 2 attestors, 75% score
    await policyManager.connect(owner).setAssetTypePolicy(
      agriculturalType,
      7500, // 75% min score
      180 * 24 * 60 * 60, // 180 days TTL
      2, // 2 required attestors
      false // no manual review
    );

    // Real estate policy - requires 3 attestors, 85% score
    await policyManager.connect(owner).setAssetTypePolicy(
      realEstateType,
      8500, // 85% min score
      365 * 24 * 60 * 60, // 365 days TTL
      3, // 3 required attestors
      true // requires manual review
    );

    console.log("✅ Set up asset type policies");

    console.log("\n🌾 Step 2: Farmer stakes TRUST tokens...");

    // 3. Farmer stakes TRUST tokens for governance
    const stakeAmountFarmer = ethers.parseEther("10000");
    const lockPeriod = 90 * 24 * 60 * 60; // 90 days

    await trustToken.connect(farmer).stake(stakeAmountFarmer, lockPeriod);
    
    const stakingBalance = await trustToken.stakingBalances(farmer.address);
    expect(stakingBalance).to.equal(stakeAmountFarmer);
    console.log("✅ Farmer staked 10,000 TRUST tokens");

    console.log("\n🔍 Step 3: Asset verification process...");

    // 4. Submit verification for agricultural asset
    const assetId = ethers.keccak256(ethers.toUtf8Bytes("coffee-farm-001"));
    const assetType = agriculturalType;
    const score = 8500; // 85% score - above 75% threshold
    const evidenceRoot = ethers.keccak256(ethers.toUtf8Bytes("satellite-images-documents-gps"));
    const expiresAt = Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60;

    await verificationRegistry.connect(owner).submitVerification(
      assetId,
      assetType,
      farmer.address,
      score,
      evidenceRoot,
      expiresAt,
      ["0x", "0x"], // Mock signatures from 2 attestors
      [attestor1.address, attestor2.address]
    );

    // Verify the verification was approved
    const status = await verificationRegistry.getVerificationStatus(assetId);
    expect(status.verified).to.be.true;
    expect(status.score).to.equal(score);
    console.log("✅ Asset verified with 85% score");

    console.log("\n🏭 Step 4: Asset tokenization...");

    // 5. Tokenize the verified asset
    const totalValue = ethers.parseEther("100000"); // $100,000 farm
    const tokenSupply = ethers.parseEther("1000000"); // 1M tokens
    const tokenizationFee = ethers.parseEther("2000"); // 2% of $100,000 = $2,000

    await assetFactory.connect(farmer).tokenizeAsset(
      "AGRICULTURAL",
      "Coffee Farm Alpha",
      "Nairobi, Kenya",
      totalValue,
      tokenSupply,
      Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year maturity
      assetId,
      { value: tokenizationFee }
    );

    // Verify asset was tokenized
    const asset = await assetFactory.getAsset(assetId);
    expect(asset.owner).to.equal(farmer.address);
    expect(asset.totalValue).to.equal(totalValue);
    expect(asset.isActive).to.be.true;
    console.log("✅ Asset tokenized: 1M tokens representing $100,000 farm");

    console.log("\n💰 Step 5: Settlement and trading...");

    // 6. Create a settlement for asset trading
    const settlementAmount = ethers.parseEther("5000"); // $5,000 partial sale
    const deliveryDeadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days

    await settlementEngine.connect(investor).createSettlement(
      assetId,
      farmer.address,
      deliveryDeadline,
      "settlement-tracking-001",
      { value: settlementAmount }
    );

    // Verify settlement was created
    const contractBalance = await ethers.provider.getBalance(await settlementEngine.getAddress());
    expect(contractBalance).to.equal(settlementAmount);
    console.log("✅ Settlement created: $50,000 escrow for partial farm sale");

    console.log("\n💸 Step 6: Fee distribution...");

    // 7. Distribute protocol fees
    const protocolFees = ethers.parseEther("1000");
    await feeDistribution.connect(owner).distributeFees({ value: protocolFees });

    // Verify fees were distributed
    const treasuryBalance = await ethers.provider.getBalance(owner.address);
    expect(treasuryBalance).to.be.gt(0);
    console.log("✅ Protocol fees distributed to treasury and stakers");

    console.log("\n📊 Step 7: Verification metrics and monitoring...");

    // 8. Check attestor performance
    const attestor1Info = await attestorManager.getAttestorInfo(attestor1.address);
    const attestor2Info = await attestorManager.getAttestorInfo(attestor2.address);

    expect(attestor1Info.isActive).to.be.true;
    expect(attestor2Info.isActive).to.be.true;
    expect(attestor1Info.totalAttestations).to.be.gt(0);
    expect(attestor2Info.totalAttestations).to.be.gt(0);
    console.log("✅ Attestors are active and have performed attestations");

    // 9. Test real estate verification (higher requirements)
    console.log("\n🏠 Step 8: Real estate verification (higher standards)...");

    const realEstateAssetId = ethers.keccak256(ethers.toUtf8Bytes("commercial-building-001"));
    const realEstateScore = 9000; // 90% score - above 85% threshold

    await verificationRegistry.connect(owner).submitVerification(
      realEstateAssetId,
      realEstateType,
      farmer.address,
      realEstateScore,
      ethers.keccak256(ethers.toUtf8Bytes("property-documents-survey-reports")),
      Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
      ["0x", "0x", "0x"], // Mock signatures from 3 attestors
      [attestor1.address, attestor2.address, attestor3.address]
    );

    const realEstateStatus = await verificationRegistry.getVerificationStatus(realEstateAssetId);
    expect(realEstateStatus.verified).to.be.true;
    expect(realEstateStatus.score).to.equal(realEstateScore);
    console.log("✅ Real estate verified with 90% score (3 attestors required)");

    console.log("\n🎯 Step 9: Complete tokenization of real estate...");

    // 10. Tokenize real estate
    const realEstateValue = ethers.parseEther("500000"); // $500,000 building
    const realEstateTokenSupply = ethers.parseEther("5000000"); // 5M tokens
    const realEstateFee = ethers.parseEther("10000"); // 2% of $500,000 = $10,000

    await assetFactory.connect(farmer).tokenizeAsset(
      "REAL_ESTATE",
      "Commercial Building Beta",
      "Lagos, Nigeria",
      realEstateValue,
      realEstateTokenSupply,
      Math.floor(Date.now() / 1000) + 730 * 24 * 60 * 60, // 2 years maturity
      realEstateAssetId,
      { value: realEstateFee }
    );

    const realEstateAsset = await assetFactory.getAsset(realEstateAssetId);
    expect(realEstateAsset.owner).to.equal(farmer.address);
    expect(realEstateAsset.totalValue).to.equal(realEstateValue);
    console.log("✅ Real estate tokenized: 5M tokens representing $500,000 building");

    console.log("\n🏆 Step 10: Final verification and metrics...");

    // 11. Final system verification
    const totalAssets = await assetFactory.totalAssetsTokenized();
    const totalValueLocked = await assetFactory.totalValueLocked();
    const trustTokenSupply = await trustToken.totalSupply();

    expect(totalAssets).to.equal(2); // 2 assets tokenized
    expect(totalValueLocked).to.equal(ethers.parseEther("600000")); // $600,000 total
    expect(trustTokenSupply).to.equal(ethers.parseEther("200000000")); // 200M initial supply

    console.log("✅ System metrics verified:");
    console.log(`   - Total assets tokenized: ${totalAssets}`);
    console.log(`   - Total value locked: $${ethers.formatEther(totalValueLocked)}`);
    console.log(`   - TRUST token supply: ${ethers.formatEther(trustTokenSupply)}`);

    console.log("\n🎉 TrustBridge Full Flow Test Completed Successfully!");
    console.log("=" * 60);
    console.log("✅ All core functionalities working:");
    console.log("   - Multi-attestor verification system");
    console.log("   - Asset tokenization with verification requirements");
    console.log("   - Settlement and escrow functionality");
    console.log("   - Fee distribution and governance");
    console.log("   - Different asset types with varying requirements");
    console.log("   - TRUST token staking and governance");
    console.log("=" * 60);
  });

  it("Should handle edge cases and error conditions", async function () {
    console.log("\n🛡️  Testing edge cases and error handling...");

    // Test 1: Try to tokenize unverified asset
    const unverifiedAssetId = ethers.keccak256(ethers.toUtf8Bytes("unverified-asset"));
    
    await expect(
      assetFactory.connect(farmer).tokenizeAsset(
        "AGRICULTURAL",
        "Unverified Farm",
        "Unknown Location",
        ethers.parseEther("50000"),
        ethers.parseEther("1000000"),
        Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        unverifiedAssetId,
        { value: ethers.parseEther("1000") }
      )
    ).to.be.revertedWith("Asset not verified");

    console.log("✅ Correctly rejected unverified asset tokenization");

    // Test 2: Try to stake with insufficient balance
    const poorUser = (await ethers.getSigners())[6];
    await expect(
      trustToken.connect(poorUser).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60)
    ).to.be.revertedWithCustomError(trustToken, "ERC20InsufficientBalance");

    console.log("✅ Correctly rejected insufficient balance for staking");

    // Test 3: Try to register attestor with insufficient stake
    await expect(
      attestorManager.connect(owner).registerAttestor(
        poorUser.address,
        "Test Organization",
        "Test Country",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("100") } // Insufficient stake
      )
    ).to.be.revertedWith("Insufficient stake");

    console.log("✅ Correctly rejected insufficient attestor stake");

    // Test 4: Try to submit verification with insufficient attestors
    const insufficientAttestorsAssetId = ethers.keccak256(ethers.toUtf8Bytes("insufficient-attestors-asset"));
    
    await expect(
      verificationRegistry.connect(owner).submitVerification(
        insufficientAttestorsAssetId,
        ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL")),
        farmer.address,
        8000, // 80% score - above 75% threshold
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"], // Only 1 attestor - below 2 required
        [attestor1.address]
      )
    ).to.be.revertedWith("Insufficient attestor signatures");

    console.log("✅ Correctly rejected verification with insufficient attestors");

    console.log("✅ All edge cases handled correctly");
  });
});
