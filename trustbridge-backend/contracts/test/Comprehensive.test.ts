import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TrustBridge Comprehensive Test Suite", function () {
  let owner: SignerWithAddress;
  let farmer: SignerWithAddress;
  let investor: SignerWithAddress;
  let attestor1: SignerWithAddress;
  let attestor2: SignerWithAddress;
  let attestor3: SignerWithAddress;
  let attacker: SignerWithAddress;
  let maliciousAttestor: SignerWithAddress;

  // Contract instances
  let trustToken: any;
  let attestorManager: any;
  let policyManager: any;
  let verificationRegistry: any;
  let assetFactory: any;
  let settlementEngine: any;
  let feeDistribution: any;
  let verificationBuffer: any;

  before(async function () {
    [owner, farmer, investor, attestor1, attestor2, attestor3, attacker, maliciousAttestor] = await ethers.getSigners();

    console.log("🏗️  Deploying TrustBridge contracts for comprehensive testing...");

    // Deploy all contracts
    const TrustToken = await ethers.getContractFactory("TrustToken");
    trustToken = await TrustToken.deploy();
    await trustToken.waitForDeployment();

    const AttestorManager = await ethers.getContractFactory("AttestorManager");
    attestorManager = await AttestorManager.deploy();
    await attestorManager.waitForDeployment();

    const PolicyManager = await ethers.getContractFactory("PolicyManager");
    policyManager = await PolicyManager.deploy();
    await policyManager.waitForDeployment();

    const VerificationRegistry = await ethers.getContractFactory("VerificationRegistry");
    verificationRegistry = await VerificationRegistry.deploy(
      await attestorManager.getAddress(),
      await policyManager.getAddress()
    );
    await verificationRegistry.waitForDeployment();

    const AssetFactory = await ethers.getContractFactory("AssetFactory");
    assetFactory = await AssetFactory.deploy(
      await trustToken.getAddress(),
      owner.address,
      await verificationRegistry.getAddress()
    );
    await assetFactory.waitForDeployment();

    const SettlementEngine = await ethers.getContractFactory("SettlementEngine");
    settlementEngine = await SettlementEngine.deploy(owner.address);
    await settlementEngine.waitForDeployment();

    const FeeDistribution = await ethers.getContractFactory("FeeDistribution");
    feeDistribution = await FeeDistribution.deploy(
      owner.address,
      owner.address,
      await trustToken.getAddress()
    );
    await feeDistribution.waitForDeployment();

    const VerificationBuffer = await ethers.getContractFactory("VerificationBuffer");
    verificationBuffer = await VerificationBuffer.deploy();
    await verificationBuffer.waitForDeployment();

    // Setup permissions
    const MANAGER_ROLE = await attestorManager.MANAGER_ROLE();
    await attestorManager.grantRole(MANAGER_ROLE, await verificationRegistry.getAddress());

    // Transfer tokens and ETH to users
    await trustToken.connect(owner).transfer(farmer.address, ethers.parseEther("100000"));
    await trustToken.connect(owner).transfer(investor.address, ethers.parseEther("200000"));
    await trustToken.connect(owner).transfer(attacker.address, ethers.parseEther("1000"));
    
    // Give users ETH for fees
    await owner.sendTransaction({ to: farmer.address, value: ethers.parseEther("4000") });
    await owner.sendTransaction({ to: investor.address, value: ethers.parseEther("4000") });
    await owner.sendTransaction({ to: attacker.address, value: ethers.parseEther("1000") });

    console.log("✅ All contracts deployed and initialized");
  });

  describe("TrustToken Comprehensive Tests", function () {
    it("Should handle staking edge cases", async function () {
      // Test 1: Staking with minimum lock period
      await trustToken.connect(farmer).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60);
      const stakingBalance = await trustToken.stakingBalances(farmer.address);
      expect(stakingBalance).to.equal(ethers.parseEther("1000"));

      // Test 2: Staking with maximum lock period
      await trustToken.connect(farmer).stake(ethers.parseEther("2000"), 365 * 24 * 60 * 60);
      const totalStakingBalance = await trustToken.stakingBalances(farmer.address);
      expect(totalStakingBalance).to.equal(ethers.parseEther("3000"));

      // Test 3: Try to stake with invalid lock period (too short)
      await expect(
        trustToken.connect(farmer).stake(ethers.parseEther("1000"), 29 * 24 * 60 * 60)
      ).to.be.revertedWith("Invalid lock period");

      // Test 4: Try to stake with invalid lock period (too long)
      await expect(
        trustToken.connect(farmer).stake(ethers.parseEther("1000"), 366 * 24 * 60 * 60)
      ).to.be.revertedWith("Invalid lock period");

      // Test 5: Try to stake zero amount
      await expect(
        trustToken.connect(farmer).stake(0, 30 * 24 * 60 * 60)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should handle unstaking scenarios", async function () {
      // Test 1: Try to unstake before lock period expires
      await expect(
        trustToken.connect(farmer).unstake()
      ).to.be.revertedWith("Tokens still locked");

      // Test 2: Fast forward time and test unstaking
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const balanceBefore = await trustToken.balanceOf(farmer.address);
      await trustToken.connect(farmer).unstake();
      const balanceAfter = await trustToken.balanceOf(farmer.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore); // Should receive staked tokens + rewards
      expect(await trustToken.stakingBalances(farmer.address)).to.equal(0);
    });

    it("Should handle reward calculations correctly", async function () {
      // Test different lock periods and their rewards
      const testCases = [
        { lockPeriod: 30 * 24 * 60 * 60, expectedAPY: 500 }, // 5%
        { lockPeriod: 90 * 24 * 60 * 60, expectedAPY: 1000 }, // 10%
        { lockPeriod: 180 * 24 * 60 * 60, expectedAPY: 1500 }, // 15%
        { lockPeriod: 365 * 24 * 60 * 60, expectedAPY: 2500 }, // 25%
      ];

      for (const testCase of testCases) {
        await trustToken.connect(investor).stake(ethers.parseEther("1000"), testCase.lockPeriod);
        
        // Fast forward to end of lock period
        await ethers.provider.send("evm_increaseTime", [testCase.lockPeriod + 1]);
        await ethers.provider.send("evm_mine", []);
        
        const reward = await trustToken.calculateReward(investor.address);
        expect(reward).to.be.gt(0);
        
        // Unstake to reset for next test
        await trustToken.connect(investor).unstake();
        await ethers.provider.send("evm_increaseTime", [-testCase.lockPeriod - 1]);
        await ethers.provider.send("evm_mine", []);
      }
    });

    it("Should handle pause/unpause functionality", async function () {
      // Test pausing
      await trustToken.connect(owner).pause();
      await expect(
        trustToken.connect(farmer).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60)
      ).to.be.revertedWithCustomError(trustToken, "EnforcedPause");

      // Test unpausing
      await trustToken.connect(owner).unpause();
      await trustToken.connect(farmer).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60);
      expect(await trustToken.stakingBalances(farmer.address)).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("AttestorManager Security Tests", function () {
    beforeEach(async function () {
      // Register legitimate attestors
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Legitimate Cooperative",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      await attestorManager.connect(owner).registerAttestor(
        attestor2.address,
        "Government Official",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );
    });

    it("Should prevent unauthorized attestor registration", async function () {
      // Test 1: Non-admin trying to register attestor
      await expect(
        attestorManager.connect(attacker).registerAttestor(
          attacker.address,
          "Fake Organization",
          "Fake Country",
          ethers.parseEther("1000"),
          { value: ethers.parseEther("1000") }
        )
      ).to.be.revertedWithCustomError(attestorManager, "AccessControlUnauthorizedAccount");

      // Test 2: Insufficient stake amount
      await expect(
        attestorManager.connect(owner).registerAttestor(
          attacker.address,
          "Fake Organization",
          "Fake Country",
          ethers.parseEther("1000"),
          { value: ethers.parseEther("100") }
        )
      ).to.be.revertedWith("Insufficient stake");

      // Test 3: Duplicate attestor registration
      await expect(
        attestorManager.connect(owner).registerAttestor(
          attestor1.address,
          "Duplicate Organization",
          "Duplicate Country",
          ethers.parseEther("1000"),
          { value: ethers.parseEther("1000") }
        )
      ).to.be.revertedWith("Attestor already registered");
    });

    it("Should handle attestor slashing scenarios", async function () {
      // Test 1: Slash attestor for fraudulent behavior
      const attestor1InfoBefore = await attestorManager.getAttestorInfo(attestor1.address);
      const stakeBefore = attestor1InfoBefore.stakeAmount;

      await attestorManager.connect(owner).slashAttestor(
        attestor1.address,
        "Fraudulent verification detected"
      );

      const attestor1InfoAfter = await attestorManager.getAttestorInfo(attestor1.address);
      expect(attestor1InfoAfter.stakeAmount).to.be.lt(stakeBefore);
      expect(attestor1InfoAfter.reputationScore).to.be.lt(attestor1InfoBefore.reputationScore);

      // Test 2: Try to slash non-existent attestor
      await expect(
        attestorManager.connect(owner).slashAttestor(
          attacker.address,
          "Non-existent attestor"
        )
      ).to.be.revertedWith("Attestor not found");

      // Test 3: Try to slash inactive attestor
      await attestorManager.connect(owner).slashAttestor(
        attestor1.address,
        "Multiple violations"
      );
      await attestorManager.connect(owner).slashAttestor(
        attestor1.address,
        "Final violation"
      );
      await attestorManager.connect(owner).slashAttestor(
        attestor1.address,
        "Should deactivate"
      );

      const finalInfo = await attestorManager.getAttestorInfo(attestor1.address);
      expect(finalInfo.isActive).to.be.false;
    });

    it("Should handle reputation updates correctly", async function () {
      // Test reputation updates
      await attestorManager.connect(owner).updateAttestorReputation(attestor1.address, true);
      await attestorManager.connect(owner).updateAttestorReputation(attestor1.address, false);
      await attestorManager.connect(owner).updateAttestorReputation(attestor1.address, true);

      const attestorInfo = await attestorManager.getAttestorInfo(attestor1.address);
      expect(attestorInfo.totalAttestations).to.equal(3);
      expect(attestorInfo.correctAttestations).to.equal(2);
    });
  });

  describe("PolicyManager Comprehensive Tests", function () {
    it("Should handle policy creation and updates", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("TEST_ASSET"));

      // Test 1: Create policy
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        8000, // 80% min score
        90 * 24 * 60 * 60, // 90 days TTL
        2, // 2 required attestors
        true // requires manual review
      );

      const policy = await policyManager.getAssetTypePolicy(assetType);
      expect(policy.minScore).to.equal(8000);
      expect(policy.ttlSeconds).to.equal(90 * 24 * 60 * 60);
      expect(policy.requiredAttestors).to.equal(2);
      expect(policy.requiresManualReview).to.be.true;

      // Test 2: Update policy
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        8500, // 85% min score
        180 * 24 * 60 * 60, // 180 days TTL
        3, // 3 required attestors
        false // no manual review
      );

      const updatedPolicy = await policyManager.getAssetTypePolicy(assetType);
      expect(updatedPolicy.minScore).to.equal(8500);
      expect(updatedPolicy.requiredAttestors).to.equal(3);
      expect(updatedPolicy.requiresManualReview).to.be.false;
    });

    it("Should prevent unauthorized policy changes", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("UNAUTHORIZED_ASSET"));

      await expect(
        policyManager.connect(attacker).setAssetTypePolicy(
          assetType,
          8000,
          90 * 24 * 60 * 60,
          2,
          true
        )
      ).to.be.revertedWithCustomError(policyManager, "AccessControlUnauthorizedAccount");
    });
  });

  describe("VerificationRegistry Security Tests", function () {
    beforeEach(async function () {
      // Setup attestors and policies
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Test Cooperative",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      await attestorManager.connect(owner).registerAttestor(
        attestor2.address,
        "Test Government",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const assetType = ethers.keccak256(ethers.toUtf8Bytes("SECURITY_TEST"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        2,
        false
      );
    });

    it("Should prevent unauthorized verification submissions", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("unauthorized-verification"));
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("SECURITY_TEST"));

      await expect(
        verificationRegistry.connect(attacker).submitVerification(
          assetId,
          assetType,
          farmer.address,
          8000,
          ethers.keccak256(ethers.toUtf8Bytes("evidence")),
          Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
          ["0x", "0x"],
          [attestor1.address, attestor2.address]
        )
      ).to.be.revertedWithCustomError(verificationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should handle verification expiration correctly", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("expiring-verification"));
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("SECURITY_TEST"));
      const shortExpiry = Math.floor(Date.now() / 1000) + 60; // 1 minute

      // Submit verification with short expiry
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        shortExpiry,
        ["0x", "0x"],
        [attestor1.address, attestor2.address]
      );

      // Fast forward time past expiry
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine", []);

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.false;
      expect(status.status).to.equal(3); // EXPIRED status
    });

    it("Should handle verification revocation correctly", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("revocable-verification"));
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("SECURITY_TEST"));

      // Submit verification
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x", "0x"],
        [attestor1.address, attestor2.address]
      );

      // Revoke verification
      await verificationRegistry.connect(owner).revokeVerification(
        assetId,
        "Fraudulent evidence discovered"
      );

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.false;
      expect(status.status).to.equal(4); // REVOKED status
    });

    it("Should handle duplicate verification attempts", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("duplicate-verification"));
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("SECURITY_TEST"));

      // Submit first verification
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x", "0x"],
        [attestor1.address, attestor2.address]
      );

      // Try to submit duplicate verification
      await expect(
        verificationRegistry.connect(owner).submitVerification(
          assetId,
          assetType,
          farmer.address,
          9000,
          ethers.keccak256(ethers.toUtf8Bytes("new-evidence")),
          Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
          ["0x", "0x"],
          [attestor1.address, attestor2.address]
        )
      ).to.be.revertedWith("Verification already exists");
    });
  });

  describe("AssetFactory Security Tests", function () {
    beforeEach(async function () {
      // Setup verification system
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Test Cooperative",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const assetType = ethers.keccak256(ethers.toUtf8Bytes("SECURITY_TEST"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );
    });

    it("Should prevent tokenization of unverified assets", async function () {
      const unverifiedAssetId = ethers.keccak256(ethers.toUtf8Bytes("unverified-asset"));

      await expect(
        assetFactory.connect(farmer).tokenizeAsset(
          "SECURITY_TEST",
          "Unverified Asset",
          "Unknown Location",
          ethers.parseEther("50000"),
          ethers.parseEther("1000000"),
          Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
          unverifiedAssetId,
          { value: ethers.parseEther("1000") }
        )
      ).to.be.revertedWith("Asset not verified");
    });

    it("Should prevent tokenization with insufficient fees", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("insufficient-fee-asset"));
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("SECURITY_TEST"));

      // Submit verification
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"],
        [attestor1.address]
      );

      // Try to tokenize with insufficient fee
      await expect(
        assetFactory.connect(farmer).tokenizeAsset(
          "SECURITY_TEST",
          "Insufficient Fee Asset",
          "Test Location",
          ethers.parseEther("50000"),
          ethers.parseEther("1000000"),
          Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
          assetId,
          { value: ethers.parseEther("100") } // Insufficient fee
        )
      ).to.be.revertedWith("Insufficient fee");
    });

    it("Should handle tokenization with expired verification", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("expired-verification-asset"));
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("SECURITY_TEST"));
      const shortExpiry = Math.floor(Date.now() / 1000) + 60; // 1 minute

      // Submit verification with short expiry
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        shortExpiry,
        ["0x"],
        [attestor1.address]
      );

      // Fast forward time past expiry
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine", []);

      // Try to tokenize expired verification
      await expect(
        assetFactory.connect(farmer).tokenizeAsset(
          "SECURITY_TEST",
          "Expired Verification Asset",
          "Test Location",
          ethers.parseEther("50000"),
          ethers.parseEther("1000000"),
          Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
          assetId,
          { value: ethers.parseEther("1000") }
        )
      ).to.be.revertedWith("Verification expired");
    });

    it("Should handle fee updates correctly", async function () {
      // Test fee update by admin
      await assetFactory.connect(owner).setTokenizationFee(300); // 3%
      
      const newFee = await assetFactory.tokenizationFee();
      expect(newFee).to.equal(300);

      // Test fee update by non-admin
      await expect(
        assetFactory.connect(attacker).setTokenizationFee(500)
      ).to.be.revertedWithCustomError(assetFactory, "AccessControlUnauthorizedAccount");

      // Test setting fee too high
      await expect(
        assetFactory.connect(owner).setTokenizationFee(1500) // 15%
      ).to.be.revertedWith("Fee too high");
    });
  });

  describe("SettlementEngine Comprehensive Tests", function () {
    it("Should handle settlement lifecycle correctly", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("settlement-test-asset"));
      const amount = ethers.parseEther("1000");
      const deliveryDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

      // Create settlement
      await settlementEngine.connect(investor).createSettlement(
        assetId,
        farmer.address,
        deliveryDeadline,
        "tracking-hash-001",
        { value: amount }
      );

      // Verify settlement was created
      const contractBalance = await ethers.provider.getBalance(await settlementEngine.getAddress());
      expect(contractBalance).to.equal(amount);

      // Test invalid deadline
      await expect(
        settlementEngine.connect(investor).createSettlement(
          ethers.keccak256(ethers.toUtf8Bytes("invalid-deadline-asset")),
          farmer.address,
          Math.floor(Date.now() / 1000) - 1, // Past deadline
          "tracking-hash-002",
          { value: amount }
        )
      ).to.be.revertedWith("Invalid deadline");

      // Test zero payment
      await expect(
        settlementEngine.connect(investor).createSettlement(
          ethers.keccak256(ethers.toUtf8Bytes("zero-payment-asset")),
          farmer.address,
          deliveryDeadline,
          "tracking-hash-003",
          { value: 0 }
        )
      ).to.be.revertedWith("No payment provided");
    });

    it("Should handle delivery confirmation correctly", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("delivery-test-asset"));
      const amount = ethers.parseEther("1000");
      const deliveryDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

      // Create settlement
      await settlementEngine.connect(investor).createSettlement(
        assetId,
        farmer.address,
        deliveryDeadline,
        "tracking-hash-004",
        { value: amount }
      );

      // Test delivery confirmation
      await settlementEngine.connect(farmer).confirmDelivery(
        assetId,
        "proof-hash-001"
      );

      // Verify confirmation was recorded
      const confirmations = await settlementEngine.deliveryConfirmations(assetId, 0);
      expect(confirmations.confirmer).to.equal(farmer.address);
      expect(confirmations.isValid).to.be.true;
    });

    it("Should handle dispute resolution", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("dispute-test-asset"));
      const amount = ethers.parseEther("1000");
      const deliveryDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

      // Create settlement
      await settlementEngine.connect(investor).createSettlement(
        assetId,
        farmer.address,
        deliveryDeadline,
        "tracking-hash-005",
        { value: amount }
      );

      // Raise dispute
      await settlementEngine.connect(investor).raiseDispute(assetId);

      // Verify dispute was raised
      const settlement = await settlementEngine.settlements(assetId);
      expect(settlement.status).to.equal(4); // DISPUTED status
    });
  });

  describe("FeeDistribution Comprehensive Tests", function () {
    it("Should distribute fees correctly", async function () {
      const feeAmount = ethers.parseEther("1000");

      // Distribute fees
      await feeDistribution.connect(owner).distributeFees({ value: feeAmount });

      // Verify fees were distributed
      const treasuryBalance = await ethers.provider.getBalance(owner.address);
      expect(treasuryBalance).to.be.gt(0);

      // Test zero fee distribution
      await expect(
        feeDistribution.connect(owner).distributeFees({ value: 0 })
      ).to.be.revertedWith("No fees to distribute");
    });

    it("Should handle validator rewards correctly", async function () {
      // Test claiming rewards when no rewards available
      await expect(
        feeDistribution.connect(attacker).claimValidatorRewards()
      ).to.be.revertedWith("No rewards available");
    });
  });

  describe("VerificationBuffer Tests", function () {
    it("Should handle buffer activation and protection levels", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("buffer-test-asset"));
      const initialValuation = ethers.parseEther("100000");

      // Activate buffer
      await verificationBuffer.connect(owner).activateBuffer(assetId, initialValuation);

      // Test protection levels at different time intervals
      let protectionLevel = await verificationBuffer.getProtectionLevel(assetId);
      expect(protectionLevel).to.equal(90); // 90% protection initially

      // Fast forward 25 hours
      await ethers.provider.send("evm_increaseTime", [25 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      protectionLevel = await verificationBuffer.getProtectionLevel(assetId);
      expect(protectionLevel).to.equal(70); // 70% protection after 25 hours

      // Fast forward 49 hours (total 74 hours)
      await ethers.provider.send("evm_increaseTime", [49 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      protectionLevel = await verificationBuffer.getProtectionLevel(assetId);
      expect(protectionLevel).to.equal(50); // 50% protection after 74 hours

      // Fast forward 73 hours (total 147 hours)
      await ethers.provider.send("evm_increaseTime", [73 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      protectionLevel = await verificationBuffer.getProtectionLevel(assetId);
      expect(protectionLevel).to.equal(0); // No protection after 72 hours
    });

    it("Should handle price history updates", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("price-history-asset"));
      const initialValuation = ethers.parseEther("100000");

      // Activate buffer
      await verificationBuffer.connect(owner).activateBuffer(assetId, initialValuation);

      // Update price history
      await verificationBuffer.connect(owner).updatePriceHistory(assetId, ethers.parseEther("105000"));
      await verificationBuffer.connect(owner).updatePriceHistory(assetId, ethers.parseEther("110000"));

      // Verify price history was updated
      const priceHistory = await verificationBuffer.priceHistory(assetId, 0);
      expect(priceHistory).to.equal(ethers.parseEther("105000"));
    });
  });

  describe("Integration Stress Tests", function () {
    it("Should handle multiple concurrent verifications", async function () {
      // Setup
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Stress Test Cooperative",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const assetType = ethers.keccak256(ethers.toUtf8Bytes("STRESS_TEST"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );

      // Submit multiple verifications
      const verificationPromises = [];
      for (let i = 0; i < 5; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`stress-test-asset-${i}`));
        verificationPromises.push(
          verificationRegistry.connect(owner).submitVerification(
            assetId,
            assetType,
            farmer.address,
            8000 + i * 100, // Varying scores
            ethers.keccak256(ethers.toUtf8Bytes(`evidence-${i}`)),
            Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
            ["0x"],
            [attestor1.address]
          )
        );
      }

      await Promise.all(verificationPromises);

      // Verify all verifications were processed
      for (let i = 0; i < 5; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`stress-test-asset-${i}`));
        const status = await verificationRegistry.getVerificationStatus(assetId);
        expect(status.verified).to.be.true;
      }
    });

    it("Should handle large-scale tokenization", async function () {
      // Setup verification
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Large Scale Cooperative",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const assetType = ethers.keccak256(ethers.toUtf8Bytes("LARGE_SCALE"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );

      // Tokenize multiple assets
      for (let i = 0; i < 3; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`large-scale-asset-${i}`));
        
        // Submit verification
        await verificationRegistry.connect(owner).submitVerification(
          assetId,
          assetType,
          farmer.address,
          8000,
          ethers.keccak256(ethers.toUtf8Bytes(`evidence-${i}`)),
          Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
          ["0x"],
          [attestor1.address]
        );

        // Tokenize asset
        await assetFactory.connect(farmer).tokenizeAsset(
          "LARGE_SCALE",
          `Large Scale Asset ${i}`,
          `Location ${i}`,
          ethers.parseEther("100000"),
          ethers.parseEther("1000000"),
          Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
          assetId,
          { value: ethers.parseEther("2000") }
        );
      }

      // Verify all assets were tokenized
      const totalAssets = await assetFactory.totalAssetsTokenized();
      expect(totalAssets).to.equal(3);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should optimize gas usage for common operations", async function () {
      // Setup
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Gas Test Cooperative",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const assetType = ethers.keccak256(ethers.toUtf8Bytes("GAS_TEST"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );

      // Test gas usage for verification submission
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("gas-test-asset"));
      const tx = await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"],
        [attestor1.address]
      );

      const receipt = await tx.wait();
      console.log(`Verification submission gas used: ${receipt.gasUsed.toString()}`);

      // Test gas usage for tokenization
      const tokenizationTx = await assetFactory.connect(farmer).tokenizeAsset(
        "GAS_TEST",
        "Gas Test Asset",
        "Test Location",
        ethers.parseEther("50000"),
        ethers.parseEther("1000000"),
        Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        assetId,
        { value: ethers.parseEther("1000") }
      );

      const tokenizationReceipt = await tokenizationTx.wait();
      console.log(`Tokenization gas used: ${tokenizationReceipt.gasUsed.toString()}`);
    });
  });

  describe("Access Control Security Tests", function () {
    it("Should enforce proper access controls across all contracts", async function () {
      // Test TrustToken access controls
      await expect(
        trustToken.connect(attacker).mint(attacker.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(trustToken, "AccessControlUnauthorizedAccount");

      await expect(
        trustToken.connect(attacker).burn(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(trustToken, "AccessControlUnauthorizedAccount");

      // Test AttestorManager access controls
      await expect(
        attestorManager.connect(attacker).slashAttestor(attestor1.address, "Unauthorized slash")
      ).to.be.revertedWithCustomError(attestorManager, "AccessControlUnauthorizedAccount");

      // Test PolicyManager access controls
      await expect(
        policyManager.connect(attacker).setAssetTypePolicy(
          ethers.keccak256(ethers.toUtf8Bytes("UNAUTHORIZED")),
          8000,
          90 * 24 * 60 * 60,
          2,
          true
        )
      ).to.be.revertedWithCustomError(policyManager, "AccessControlUnauthorizedAccount");

      // Test VerificationRegistry access controls
      await expect(
        verificationRegistry.connect(attacker).reviewVerification(
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          true
        )
      ).to.be.revertedWithCustomError(verificationRegistry, "AccessControlUnauthorizedAccount");

      // Test AssetFactory access controls
      await expect(
        assetFactory.connect(attacker).setTokenizationFee(500)
      ).to.be.revertedWithCustomError(assetFactory, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Economic Model Tests", function () {
    it("Should handle economic incentives correctly", async function () {
      // Test staking rewards
      await trustToken.connect(farmer).stake(ethers.parseEther("10000"), 365 * 24 * 60 * 60);
      
      // Fast forward 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const reward = await trustToken.calculateReward(farmer.address);
      expect(reward).to.be.gt(0);

      // Test fee distribution
      const feeAmount = ethers.parseEther("1000");
      await feeDistribution.connect(owner).distributeFees({ value: feeAmount });

      // Verify economic model maintains balance
      const totalSupply = await trustToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("200000000"));
    });
  });
});
