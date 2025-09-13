import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TrustBridge Core Functionality", function () {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let attestor1: SignerWithAddress;

  // Contract instances
  let trustToken: any;
  let attestorManager: any;
  let policyManager: any;
  let verificationRegistry: any;
  let assetFactory: any;

  before(async function () {
    [owner, user1, attestor1] = await ethers.getSigners();

    // Deploy TrustToken
    const TrustToken = await ethers.getContractFactory("TrustToken");
    trustToken = await TrustToken.deploy();
    await trustToken.waitForDeployment();

    // Transfer tokens to user1 for testing
    await trustToken.connect(owner).transfer(user1.address, ethers.parseEther("10000"));

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
    const MANAGER_ROLE = await attestorManager.MANAGER_ROLE();
    await attestorManager.grantRole(MANAGER_ROLE, await verificationRegistry.getAddress());

    // Deploy AssetFactory
    const AssetFactory = await ethers.getContractFactory("AssetFactory");
    assetFactory = await AssetFactory.deploy(
      await trustToken.getAddress(),
      owner.address,
      await verificationRegistry.getAddress()
    );
    await assetFactory.waitForDeployment();
  });

  it("Should deploy all contracts successfully", async function () {
    expect(await trustToken.getAddress()).to.not.equal(ethers.ZeroAddress);
    expect(await attestorManager.getAddress()).to.not.equal(ethers.ZeroAddress);
    expect(await policyManager.getAddress()).to.not.equal(ethers.ZeroAddress);
    expect(await verificationRegistry.getAddress()).to.not.equal(ethers.ZeroAddress);
    expect(await assetFactory.getAddress()).to.not.equal(ethers.ZeroAddress);
  });

  it("Should allow staking TRUST tokens", async function () {
    const stakeAmount = ethers.parseEther("1000");
    const lockPeriod = 30 * 24 * 60 * 60; // 30 days

    await trustToken.connect(user1).stake(stakeAmount, lockPeriod);
    
    const stakingBalance = await trustToken.stakingBalances(user1.address);
    expect(stakingBalance).to.equal(stakeAmount);
  });

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

  it("Should set asset type policy", async function () {
    const assetType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
    
    await policyManager.connect(owner).setAssetTypePolicy(
      assetType,
      7500, // 75% min score
      180 * 24 * 60 * 60, // 180 days TTL
      1, // 1 required attestor
      false // no manual review
    );

    const policy = await policyManager.getAssetTypePolicy(assetType);
    expect(policy.minScore).to.equal(7500);
    expect(policy.requiredAttestors).to.equal(1);
  });

  it("Should submit and verify asset", async function () {
    const assetId = ethers.keccak256(ethers.toUtf8Bytes("test-asset-1"));
    const assetType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
    const score = 9000; // 90% score
    const evidenceRoot = ethers.keccak256(ethers.toUtf8Bytes("evidence"));
    const expiresAt = Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60;

    await verificationRegistry.connect(owner).submitVerification(
      assetId,
      assetType,
      user1.address,
      score,
      evidenceRoot,
      expiresAt,
      ["0x"], // Mock signature
      [attestor1.address]
    );

    const status = await verificationRegistry.getVerificationStatus(assetId);
    expect(status.verified).to.be.true;
    expect(status.score).to.equal(score);
  });

  it("Should tokenize verified asset", async function () {
    const assetId = ethers.keccak256(ethers.toUtf8Bytes("test-asset-1"));
    const tokenizationFee = ethers.parseEther("1000"); // 2% of $50,000 = $1,000

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
    expect(asset.isActive).to.be.true;
  });

  it("Should complete end-to-end verification and tokenization flow", async function () {
    // This test verifies the complete flow works together
    const newAssetId = ethers.keccak256(ethers.toUtf8Bytes("integration-test-asset"));
    const assetType = ethers.keccak256(ethers.toUtf8Bytes("AGRICULTURAL"));
    
    // 1. Submit verification
    await verificationRegistry.connect(owner).submitVerification(
      newAssetId,
      assetType,
      user1.address,
      9000, // 90% score
      ethers.keccak256(ethers.toUtf8Bytes("evidence")),
      Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
      ["0x"],
      [attestor1.address]
    );

    // 2. Verify it's approved
    const status = await verificationRegistry.getVerificationStatus(newAssetId);
    expect(status.verified).to.be.true;

    // 3. Tokenize the asset
    const tokenizationFee = ethers.parseEther("2000"); // 2% of $100,000 = $2,000
    await assetFactory.connect(user1).tokenizeAsset(
      "AGRICULTURAL",
      "Integration Test Farm",
      "Nairobi, Kenya",
      ethers.parseEther("100000"),
      ethers.parseEther("2000000"),
      Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
      newAssetId,
      { value: tokenizationFee }
    );

    // 4. Verify asset was tokenized
    const asset = await assetFactory.getAsset(newAssetId);
    expect(asset.owner).to.equal(user1.address);
    expect(asset.isActive).to.be.true;
    expect(asset.totalValue).to.equal(ethers.parseEther("100000"));
  });
});
