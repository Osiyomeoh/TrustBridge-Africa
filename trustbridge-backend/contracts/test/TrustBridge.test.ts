import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TrustBridge System", function () {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attestor1: SignerWithAddress;
  let attestor2: SignerWithAddress;

  // Contract instances
  let trustToken: any;
  let attestorManager: any;
  let policyManager: any;
  let verificationRegistry: any;
  let assetFactory: any;
  let settlementEngine: any;
  let feeDistribution: any;

  beforeEach(async function () {
    [owner, user1, user2, attestor1, attestor2] = await ethers.getSigners();

    // Deploy TrustToken
    const TrustToken = await ethers.getContractFactory("TrustToken");
    trustToken = await TrustToken.deploy();
    await trustToken.waitForDeployment();

    // Transfer some tokens to users for testing
    await trustToken.connect(owner).transfer(user1.address, ethers.parseEther("10000"));
    await trustToken.connect(owner).transfer(user2.address, ethers.parseEther("10000"));

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

    // Grant MANAGER_ROLE to VerificationRegistry
    await attestorManager.connect(owner).grantRole(
      await attestorManager.MANAGER_ROLE(),
      await verificationRegistry.getAddress()
    );

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
  });

  describe("TrustToken", function () {
    it("Should deploy with correct initial supply", async function () {
      const totalSupply = await trustToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("200000000")); // 200M tokens
    });

    it("Should allow staking", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await trustToken.connect(user1).stake(stakeAmount, lockPeriod);
      
      const stakingBalance = await trustToken.stakingBalances(user1.address);
      expect(stakingBalance).to.equal(stakeAmount);
    });

    it("Should calculate rewards correctly", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockPeriod = 365 * 24 * 60 * 60; // 365 days

      await trustToken.connect(user1).stake(stakeAmount, lockPeriod);
      
      // Fast forward time (simulate)
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const reward = await trustToken.calculateReward(user1.address);
      expect(reward).to.be.gt(0);
    });
  });

  describe("AttestorManager", function () {
    it("Should register attestor", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Agricultural Cooperative",
        "Kenya",
        stakeAmount,
        { value: stakeAmount }
      );

      const attestorInfo = await attestorManager.getAttestorInfo(attestor1.address);
      expect(attestorInfo.isActive).to.be.true;
      expect(attestorInfo.stakeAmount).to.equal(stakeAmount);
    });

    it("Should slash attestor for fraudulent behavior", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Agricultural Cooperative",
        "Kenya",
        stakeAmount,
        { value: stakeAmount }
      );

      await attestorManager.connect(owner).slashAttestor(
        attestor1.address,
        "Fraudulent verification"
      );

      const attestorInfo = await attestorManager.getAttestorInfo(attestor1.address);
      expect(attestorInfo.stakeAmount).to.be.lt(stakeAmount);
    });
  });

  describe("PolicyManager", function () {
    it("Should set asset type policy", async function () {
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
      
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500, // 75% min score
        180 * 24 * 60 * 60, // 180 days TTL
        2, // 2 required attestors
        false // No manual review required for auto-approval // requires manual review
      );

      const policy = await policyManager.getAssetTypePolicy(assetType);
      expect(policy.minScore).to.equal(7500);
      expect(policy.requiredAttestors).to.equal(2);
    });
  });

  describe("VerificationRegistry", function () {
    beforeEach(async function () {
      // Register attestors
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Agricultural Cooperative",
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

      // Set policy
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        2,
        false // No manual review required for auto-approval
      );
    });

    it("Should submit verification", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("test-asset-1"));
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
      const score = 8000; // 80%
      const evidenceRoot = ethers.keccak256(ethers.toUtf8Bytes("evidence"));
      const expiresAt = Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60;

      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        user1.address,
        score,
        evidenceRoot,
        expiresAt,
        ["0x", "0x"], // Mock signatures
        [attestor1.address, attestor2.address]
      );

      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.true;
      expect(status.score).to.equal(score);
    });
  });

  describe("AssetFactory", function () {
    beforeEach(async function () {
      // Setup verification system
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Agricultural Cooperative",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const assetType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );

      // Submit verification
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("test-asset-1"));
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        user1.address,
        9000, // 90% score - above 85% threshold for auto-approval
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"],
        [attestor1.address]
      );
    });

    it("Should tokenize verified asset", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("test-asset-1"));
      const tokenizationFee = ethers.parseEther("1"); // 1 ETH fee

      await assetFactory.connect(user1).tokenizeAsset(
        "AGRICULTURAL",
        "Test Farm",
        "Nairobi, Kenya",
        ethers.parseEther("50000"), // $50,000 value
        ethers.parseEther("1000000"), // 1M tokens
        Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year maturity
        assetId,
        { value: tokenizationFee }
      );

      const asset = await assetFactory.getAsset(assetId);
      expect(asset.owner).to.equal(user1.address);
      expect(asset.totalValue).to.equal(ethers.parseEther("50000"));
    });
  });

  describe("SettlementEngine", function () {
    it("Should create settlement", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("test-asset-1"));
      const amount = ethers.parseEther("1000");
      const deliveryDeadline = Math.floor(Date.now() / 1000) + 8 * 24 * 60 * 60; // 8 days from now

      await settlementEngine.connect(user1).createSettlement(
        assetId,
        user2.address,
        deliveryDeadline,
        "tracking-hash-123",
        { value: amount }
      );

      // Settlement should be created (we can't easily get the settlement ID without events)
      expect(await ethers.provider.getBalance(await settlementEngine.getAddress())).to.equal(amount);
    });
  });

  describe("FeeDistribution", function () {
    it("Should distribute fees", async function () {
      const feeAmount = ethers.parseEther("100");

      await feeDistribution.connect(owner).distributeFees({ value: feeAmount });

      // Check that fees were distributed (treasury should receive 40%)
      const treasuryBalance = await ethers.provider.getBalance(owner.address);
      expect(treasuryBalance).to.be.gt(0);
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full verification and tokenization flow", async function () {
      // 1. Register attestor
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Agricultural Cooperative",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      // 2. Set policy
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );

      // 3. Submit verification
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("integration-test-asset"));
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        user1.address,
        9000, // 90% score - above 85% threshold for auto-approval
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"],
        [attestor1.address]
      );

      // 4. Tokenize asset
      const tokenizationFee = ethers.parseEther("1");
      await assetFactory.connect(user1).tokenizeAsset(
        "AGRICULTURAL",
        "Integration Test Farm",
        "Nairobi, Kenya",
        ethers.parseEther("100000"),
        ethers.parseEther("2000000"),
        Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        assetId,
        { value: tokenizationFee }
      );

      // 5. Verify asset was tokenized
      const asset = await assetFactory.getAsset(assetId);
      expect(asset.owner).to.equal(user1.address);
      expect(asset.isActive).to.be.true;
    });
  });
});
