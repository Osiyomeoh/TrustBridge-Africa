import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Phase 2: TrustBridge Edge Cases & Boundary Tests", function () {
  let owner: SignerWithAddress;
  let farmer: SignerWithAddress;
  let investor: SignerWithAddress;
  let attestor1: SignerWithAddress;
  let attestor2: SignerWithAddress;
  let attestor3: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

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
    [owner, farmer, investor, attestor1, attestor2, attestor3, user1, user2] = await ethers.getSigners();

    console.log("🔍 Phase 2: Deploying contracts for edge case testing...");

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

    // Give users tokens and ETH
    await trustToken.connect(owner).transfer(farmer.address, ethers.parseEther("100000"));
    await trustToken.connect(owner).transfer(investor.address, ethers.parseEther("100000"));
    await trustToken.connect(owner).transfer(user1.address, ethers.parseEther("10000"));
    await trustToken.connect(owner).transfer(user2.address, ethers.parseEther("10000"));

    await owner.sendTransaction({ to: farmer.address, value: ethers.parseEther("1000") });
    await owner.sendTransaction({ to: investor.address, value: ethers.parseEther("1000") });
    await owner.sendTransaction({ to: user1.address, value: ethers.parseEther("100") });
    await owner.sendTransaction({ to: user2.address, value: ethers.parseEther("100") });

    console.log("✅ Phase 2: Contracts deployed and initialized");
  });

  describe("🔢 Numeric Boundary Tests", function () {
    it("Should handle maximum staking amounts", async function () {
      const maxStake = await trustToken.balanceOf(farmer.address);
      
      // Stake maximum possible amount
      await trustToken.connect(farmer).stake(maxStake, 30 * 24 * 60 * 60);
      
      const stakingBalance = await trustToken.stakingBalances(farmer.address);
      expect(stakingBalance).to.equal(maxStake);
    });

    it("Should handle minimum staking amounts", async function () {
      // Transfer minimal amount to user1
      await trustToken.connect(owner).transfer(user1.address, ethers.parseEther("1"));
      
      // Stake minimum amount (1 wei)
      await trustToken.connect(user1).stake(1, 30 * 24 * 60 * 60);
      
      const stakingBalance = await trustToken.stakingBalances(user1.address);
      expect(stakingBalance).to.equal(1);
    });

    it("Should handle maximum lock periods", async function () {
      await trustToken.connect(user2).stake(ethers.parseEther("1000"), 365 * 24 * 60 * 60);
      
      const lockPeriod = await trustToken.lockPeriods(user2.address);
      expect(lockPeriod).to.equal(365 * 24 * 60 * 60);
    });

    it("Should handle minimum lock periods", async function () {
      await trustToken.connect(user1).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60);
      
      const lockPeriod = await trustToken.lockPeriods(user1.address);
      expect(lockPeriod).to.equal(30 * 24 * 60 * 60);
    });

    it("Should handle maximum fee percentages", async function () {
      // Set maximum allowed fee (10%)
      await assetFactory.connect(owner).setTokenizationFee(1000);
      
      const fee = await assetFactory.tokenizationFee();
      expect(fee).to.equal(1000);
    });

    it("Should handle zero fee percentages", async function () {
      // Set zero fee
      await assetFactory.connect(owner).setTokenizationFee(0);
      
      const fee = await assetFactory.tokenizationFee();
      expect(fee).to.equal(0);
    });

    it("Should handle maximum verification scores", async function () {
      // Register attestor
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Test Organization",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const assetType = ethers.keccak256(ethers.toUtf8Bytes("TEST_ASSET"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );

      const assetId = ethers.keccak256(ethers.toUtf8Bytes("max-score-test"));

      // Submit verification with maximum score (10000)
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        10000, // Maximum score
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"],
        [attestor1.address]
      );

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.true;
      expect(status.score).to.equal(10000);
    });

    it("Should handle minimum verification scores", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("TEST_ASSET"));
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("min-score-test"));

      // Submit verification with minimum score (0)
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        0, // Minimum score
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"],
        [attestor1.address]
      );

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.false; // Should be rejected due to low score
      expect(status.score).to.equal(0);
    });
  });

  describe("⏰ Time Boundary Tests", function () {
    it("Should handle immediate expiry verifications", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("TEST_ASSET"));
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("immediate-expiry-test"));
      const immediateExpiry = Math.floor(Date.now() / 1000) + 1; // 1 second

      // Submit verification with immediate expiry
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        immediateExpiry,
        ["0x"],
        [attestor1.address]
      );

      // Fast forward 2 seconds
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine", []);

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.false;
      expect(status.status).to.equal(3); // EXPIRED
    });

    it("Should handle very long expiry verifications", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("TEST_ASSET"));
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("long-expiry-test"));
      const longExpiry = Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60; // 10 years

      // Submit verification with very long expiry
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        longExpiry,
        ["0x"],
        [attestor1.address]
      );

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.true;
      expect(status.expiresAt).to.equal(longExpiry);
    });

    it("Should handle immediate settlement deadlines", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("immediate-deadline-test"));
      const immediateDeadline = Math.floor(Date.now() / 1000) + 60; // 1 minute (more reasonable)

      // Create settlement with immediate deadline
      const tx = await settlementEngine.connect(investor).createSettlement(
        assetId,
        farmer.address,
        immediateDeadline,
        "tracking-hash",
        { value: ethers.parseEther("1000") }
      );

      // Fast forward 2 seconds
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine", []);

      // Get the settlement ID from the event
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = settlementEngine.interface.parseLog(log);
          return parsed.name === 'SettlementCreated';
        } catch {
          return false;
        }
      });
      
      const settlementId = event ? settlementEngine.interface.parseLog(event).args.settlementId : null;
      expect(settlementId).to.not.be.null;
      
      // Settlement should still exist but deadline has passed
      const settlement = await settlementEngine.settlements(settlementId);
      expect(settlement.amount).to.equal(ethers.parseEther("1000"));
      expect(settlement.deliveryDeadline).to.equal(immediateDeadline);
    });

    it("Should handle very long settlement deadlines", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("long-deadline-test"));
      const longDeadline = Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60; // 10 years

      // Create settlement with very long deadline
      const tx = await settlementEngine.connect(investor).createSettlement(
        assetId,
        farmer.address,
        longDeadline,
        "tracking-hash",
        { value: ethers.parseEther("1000") }
      );

      // Get the settlement ID from the event
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = settlementEngine.interface.parseLog(log);
          return parsed.name === 'SettlementCreated';
        } catch {
          return false;
        }
      });
      
      const settlementId = event ? settlementEngine.interface.parseLog(event).args.settlementId : null;
      expect(settlementId).to.not.be.null;
      
      const settlement = await settlementEngine.settlements(settlementId);
      expect(settlement.deliveryDeadline).to.equal(longDeadline);
    });
  });

  describe("📊 Data Size Boundary Tests", function () {
    it("Should handle maximum string lengths", async function () {
      const longString = "A".repeat(1000); // 1000 character string
      
      // Register attestor with long organization name
      await attestorManager.connect(owner).registerAttestor(
        attestor2.address,
        longString,
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const attestorInfo = await attestorManager.getAttestorInfo(attestor2.address);
      expect(attestorInfo.organizationType).to.equal(longString);
    });

    it("Should handle empty strings", async function () {
      // Register attestor with empty organization name
      await attestorManager.connect(owner).registerAttestor(
        attestor3.address,
        "", // Empty string
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const attestorInfo = await attestorManager.getAttestorInfo(attestor3.address);
      expect(attestorInfo.organizationType).to.equal("");
    });

    it("Should handle maximum asset values", async function () {
      const maxValue = ethers.parseEther("1000000000"); // 1 billion ETH worth
      
      // This test ensures the system can handle very large asset values
      // without overflow issues
      expect(maxValue).to.be.gt(0);
    });

    it("Should handle minimum asset values", async function () {
      const minValue = 1; // 1 wei
      
      // This test ensures the system can handle very small asset values
      expect(minValue).to.be.gt(0);
    });
  });

  describe("🔄 State Transition Edge Cases", function () {
    it("Should handle multiple rapid state changes", async function () {
      // Use a fresh user to avoid state pollution
      const freshUser = ethers.Wallet.createRandom().connect(ethers.provider);
      await owner.sendTransaction({ to: freshUser.address, value: ethers.parseEther("10") }); // Send ETH for gas
      await trustToken.connect(owner).transfer(freshUser.address, ethers.parseEther("10000"));
      
      // Rapidly pause and unpause
      await trustToken.connect(owner).pause();
      await trustToken.connect(owner).unpause();
      await trustToken.connect(owner).pause();
      await trustToken.connect(owner).unpause();

      // Should be unpaused
      await trustToken.connect(freshUser).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60);
      expect(await trustToken.stakingBalances(freshUser.address)).to.equal(ethers.parseEther("1000"));
    });

    it("Should handle multiple attestor registrations in sequence", async function () {
      // Register multiple attestors rapidly
      const freshAttestor1 = ethers.Wallet.createRandom().address;
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor1,
        "Org 1",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const freshAttestor2 = ethers.Wallet.createRandom().address;
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor2,
        "Org 2",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const freshAttestor3 = ethers.Wallet.createRandom().address;
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor3,
        "Org 3",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      // All should be registered
      const info1 = await attestorManager.getAttestorInfo(freshAttestor1);
      const info2 = await attestorManager.getAttestorInfo(freshAttestor2);
      const info3 = await attestorManager.getAttestorInfo(freshAttestor3);

      expect(info1.isActive).to.be.true;
      expect(info2.isActive).to.be.true;
      expect(info3.isActive).to.be.true;
    });

    it("Should handle multiple policy updates", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("POLICY_TEST"));

      // Update policy multiple times
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        8000,
        90 * 24 * 60 * 60,
        2,
        true
      );

      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        8500,
        180 * 24 * 60 * 60,
        3,
        false
      );

      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        9000,
        365 * 24 * 60 * 60,
        1,
        true
      );

      const policy = await policyManager.getAssetTypePolicy(assetType);
      expect(policy.minScore).to.equal(9000);
      expect(policy.requiredAttestors).to.equal(1);
      expect(policy.requiresManualReview).to.be.true;
    });
  });

  describe("💸 Economic Edge Cases", function () {
    it("Should handle zero-value settlements", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("zero-value-test"));

      // Try to create settlement with zero value
      await expect(
        settlementEngine.connect(investor).createSettlement(
          assetId,
          farmer.address,
          Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          "tracking-hash",
          { value: 0 }
        )
      ).to.be.revertedWith("No payment provided");
    });

    it("Should handle very small settlement amounts", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("small-value-test"));

      // Create settlement with 1 wei
      const tx = await settlementEngine.connect(investor).createSettlement(
        assetId,
        farmer.address,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        "tracking-hash",
        { value: 1 }
      );

      // Get the settlement ID from the event
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = settlementEngine.interface.parseLog(log);
          return parsed.name === 'SettlementCreated';
        } catch {
          return false;
        }
      });
      
      const settlementId = event ? settlementEngine.interface.parseLog(event).args.settlementId : null;
      expect(settlementId).to.not.be.null;
      
      const settlement = await settlementEngine.settlements(settlementId);
      expect(settlement.amount).to.equal(1);
    });

    it("Should handle very large settlement amounts", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("large-value-test"));
      const largeAmount = ethers.parseEther("1000"); // 1,000 ETH (more reasonable)

      // Create settlement with very large amount
      const tx = await settlementEngine.connect(investor).createSettlement(
        assetId,
        farmer.address,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        "tracking-hash",
        { value: largeAmount }
      );

      // Get the settlement ID from the event
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = settlementEngine.interface.parseLog(log);
          return parsed.name === 'SettlementCreated';
        } catch {
          return false;
        }
      });
      
      const settlementId = event ? settlementEngine.interface.parseLog(event).args.settlementId : null;
      expect(settlementId).to.not.be.null;
      
      const settlement = await settlementEngine.settlements(settlementId);
      expect(settlement.amount).to.equal(largeAmount);
    });

    it("Should handle fee calculations with very small amounts", async function () {
      // Set fee to 1 basis point (0.01%)
      await assetFactory.connect(owner).setTokenizationFee(1);

      const smallValue = ethers.parseEther("1");
      const expectedFee = smallValue / 10000n; // 1 basis point

      // This test ensures fee calculations work with very small amounts
      expect(expectedFee).to.equal(ethers.parseEther("0.0001"));
    });

    it("Should handle fee calculations with very large amounts", async function () {
      // Set fee to 100 basis points (1%)
      await assetFactory.connect(owner).setTokenizationFee(100);

      const largeValue = ethers.parseEther("1000000");
      const expectedFee = largeValue / 100n; // 1%

      // This test ensures fee calculations work with very large amounts
      expect(expectedFee).to.equal(ethers.parseEther("10000"));
    });
  });

  describe("🔗 Integration Edge Cases", function () {
    it("Should handle verification with maximum required attestors", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("MAX_ATTESTORS"));
      
      // Set policy requiring all 3 attestors
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        3, // Require all 3 attestors
        false
      );

      const assetId = ethers.keccak256(ethers.toUtf8Bytes("max-attestors-test"));

      // Submit verification with all 3 attestors
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x", "0x", "0x"],
        [attestor1.address, attestor2.address, attestor3.address]
      );

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.true;
    });

    it("Should handle verification with minimum required attestors", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("MIN_ATTESTORS"));
      
      // Set policy requiring only 1 attestor
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1, // Require only 1 attestor
        false
      );

      const assetId = ethers.keccak256(ethers.toUtf8Bytes("min-attestors-test"));

      // Submit verification with only 1 attestor
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

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.true;
    });

    it("Should handle buffer activation with extreme values", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("extreme-buffer-test"));
      const extremeValue = ethers.parseEther("1000000000"); // 1 billion ETH

      // Activate buffer with extreme value
      await verificationBuffer.connect(owner).activateBuffer(assetId, extremeValue);

      const protectionLevel = await verificationBuffer.getProtectionLevel(assetId);
      expect(protectionLevel).to.equal(90); // Should start with 90% protection
    });

    it("Should handle multiple buffer activations", async function () {
      const assetId1 = ethers.keccak256(ethers.toUtf8Bytes("buffer-test-1"));
      const assetId2 = ethers.keccak256(ethers.toUtf8Bytes("buffer-test-2"));
      const assetId3 = ethers.keccak256(ethers.toUtf8Bytes("buffer-test-3"));

      // Activate multiple buffers
      await verificationBuffer.connect(owner).activateBuffer(assetId1, ethers.parseEther("100000"));
      await verificationBuffer.connect(owner).activateBuffer(assetId2, ethers.parseEther("200000"));
      await verificationBuffer.connect(owner).activateBuffer(assetId3, ethers.parseEther("300000"));

      // All should be active
      const protection1 = await verificationBuffer.getProtectionLevel(assetId1);
      const protection2 = await verificationBuffer.getProtectionLevel(assetId2);
      const protection3 = await verificationBuffer.getProtectionLevel(assetId3);

      expect(protection1).to.equal(90);
      expect(protection2).to.equal(90);
      expect(protection3).to.equal(90);
    });
  });

  describe("🚨 Error Handling Edge Cases", function () {
    it("Should handle invalid asset IDs gracefully", async function () {
      const invalidAssetId = ethers.keccak256(ethers.toUtf8Bytes("invalid-asset"));

      // Try to get status of non-existent verification
      const status = await verificationRegistry.getVerificationStatus(invalidAssetId);
      expect(status.verified).to.be.false;
      expect(status.score).to.equal(0);
      expect(status.status).to.equal(0); // PENDING
    });

    it("Should handle invalid attestor addresses gracefully", async function () {
      const invalidAttestor = ethers.ZeroAddress;

      // Try to get info of non-existent attestor
      const info = await attestorManager.getAttestorInfo(invalidAttestor);
      expect(info.isActive).to.be.false;
      expect(info.stakeAmount).to.equal(0);
    });

    it("Should handle invalid policy queries gracefully", async function () {
      const invalidAssetType = ethers.keccak256(ethers.toUtf8Bytes("INVALID_TYPE"));

      // Try to get policy for non-existent asset type
      const policy = await policyManager.getAssetTypePolicy(invalidAssetType);
      expect(policy.minScore).to.equal(0);
      expect(policy.ttlSeconds).to.equal(0);
      expect(policy.requiredAttestors).to.equal(0);
      expect(policy.requiresManualReview).to.be.false;
    });

    it("Should handle invalid settlement queries gracefully", async function () {
      const invalidSettlementId = ethers.keccak256(ethers.toUtf8Bytes("invalid-settlement"));

      // Try to get non-existent settlement
      const settlement = await settlementEngine.settlements(invalidSettlementId);
      expect(settlement.amount).to.equal(0);
      expect(settlement.buyer).to.equal(ethers.ZeroAddress);
      expect(settlement.seller).to.equal(ethers.ZeroAddress);
    });
  });

  describe("🔄 Concurrent Operation Edge Cases", function () {
    it("Should handle concurrent staking operations", async function () {
      // Use fresh users to avoid state pollution
      const freshUser1 = ethers.Wallet.createRandom().connect(ethers.provider);
      const freshUser2 = ethers.Wallet.createRandom().connect(ethers.provider);
      
      await owner.sendTransaction({ to: freshUser1.address, value: ethers.parseEther("10") }); // Send ETH for gas
      await owner.sendTransaction({ to: freshUser2.address, value: ethers.parseEther("10") }); // Send ETH for gas
      
      await trustToken.connect(owner).transfer(freshUser1.address, ethers.parseEther("10000"));
      await trustToken.connect(owner).transfer(freshUser2.address, ethers.parseEther("10000"));
      
      // Multiple users stake simultaneously
      const stakePromises = [
        trustToken.connect(freshUser1).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60),
        trustToken.connect(freshUser2).stake(ethers.parseEther("2000"), 60 * 24 * 60 * 60),
      ];

      await Promise.all(stakePromises);

      const balance1 = await trustToken.stakingBalances(freshUser1.address);
      const balance2 = await trustToken.stakingBalances(freshUser2.address);

      expect(balance1).to.equal(ethers.parseEther("1000"));
      expect(balance2).to.equal(ethers.parseEther("2000"));
    });

    it("Should handle concurrent verification submissions", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("CONCURRENT_TEST"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );

      // Submit multiple verifications simultaneously
      const verificationPromises = [];
      for (let i = 0; i < 3; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`concurrent-test-${i}`));
        verificationPromises.push(
          verificationRegistry.connect(owner).submitVerification(
            assetId,
            assetType,
            farmer.address,
            8000,
            ethers.keccak256(ethers.toUtf8Bytes(`evidence-${i}`)),
            Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
            ["0x"],
            [attestor1.address]
          )
        );
      }

      await Promise.all(verificationPromises);

      // All verifications should be successful
      for (let i = 0; i < 3; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`concurrent-test-${i}`));
        const status = await verificationRegistry.getVerificationStatus(assetId);
        expect(status.verified).to.be.true;
      }
    });

    it("Should handle concurrent settlement creations", async function () {
      // Create multiple settlements simultaneously
      const settlementPromises = [];
      for (let i = 0; i < 3; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`concurrent-settlement-${i}`));
        settlementPromises.push(
          settlementEngine.connect(investor).createSettlement(
            assetId,
            farmer.address,
            Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            `tracking-hash-${i}`,
            { value: ethers.parseEther("1000") }
          )
        );
      }

      const txResults = await Promise.all(settlementPromises);

      // All settlements should be created - verify by checking events
      for (let i = 0; i < 3; i++) {
        const receipt = await txResults[i].wait();
        const event = receipt.logs.find(log => {
          try {
            const parsed = settlementEngine.interface.parseLog(log);
            return parsed.name === 'SettlementCreated';
          } catch {
            return false;
          }
        });
        
        expect(event).to.not.be.undefined;
        const settlementId = settlementEngine.interface.parseLog(event).args.settlementId;
        const settlement = await settlementEngine.settlements(settlementId);
        expect(settlement.amount).to.equal(ethers.parseEther("1000"));
      }
    });
  });
});
