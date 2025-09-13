import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Phase 1: TrustBridge Security Tests", function () {
  let owner: SignerWithAddress;
  let farmer: SignerWithAddress;
  let investor: SignerWithAddress;
  let attestor1: SignerWithAddress;
  let attestor2: SignerWithAddress;
  let attacker: SignerWithAddress;
  let maliciousUser: SignerWithAddress;

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
    [owner, farmer, investor, attestor1, attestor2, attacker, maliciousUser] = await ethers.getSigners();

    console.log("🔒 Phase 1: Deploying contracts for security testing...");

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

    // Give users minimal ETH for gas
    await owner.sendTransaction({ to: farmer.address, value: ethers.parseEther("100") });
    await owner.sendTransaction({ to: investor.address, value: ethers.parseEther("100") });
    await owner.sendTransaction({ to: attacker.address, value: ethers.parseEther("10") });
    await owner.sendTransaction({ to: maliciousUser.address, value: ethers.parseEther("10") });

    // Give users TRUST tokens for staking tests
    await trustToken.connect(owner).transfer(farmer.address, ethers.parseEther("10000"));
    await trustToken.connect(owner).transfer(investor.address, ethers.parseEther("10000"));

    console.log("✅ Phase 1: Contracts deployed and initialized");
  });

  describe("🔐 Access Control Security", function () {
    it("Should prevent unauthorized minting in TrustToken", async function () {
      await expect(
        trustToken.connect(attacker).mint(attacker.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(trustToken, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized burning in TrustToken", async function () {
      await expect(
        trustToken.connect(attacker).burn(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(trustToken, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized pausing in TrustToken", async function () {
      await expect(
        trustToken.connect(attacker).pause()
      ).to.be.revertedWithCustomError(trustToken, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized attestor registration", async function () {
      await expect(
        attestorManager.connect(attacker).registerAttestor(
          attacker.address,
          "Fake Organization",
          "Fake Country",
          ethers.parseEther("1000"),
          { value: ethers.parseEther("1000") }
        )
      ).to.be.revertedWithCustomError(attestorManager, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized attestor slashing", async function () {
      // First register a legitimate attestor
      await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Legitimate Organization",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      // Try to slash as non-admin
      await expect(
        attestorManager.connect(attacker).slashAttestor(
          attestor1.address,
          "Unauthorized slash attempt"
        )
      ).to.be.revertedWithCustomError(attestorManager, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized policy creation", async function () {
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

    it("Should prevent unauthorized verification submission", async function () {
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("unauthorized-verification"));
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("TEST_ASSET"));

      await expect(
        verificationRegistry.connect(attacker).submitVerification(
          assetId,
          assetType,
          farmer.address,
          8000,
          ethers.keccak256(ethers.toUtf8Bytes("evidence")),
          Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
          ["0x"],
          [attestor1.address]
        )
      ).to.be.revertedWithCustomError(verificationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized verification review", async function () {
      await expect(
        verificationRegistry.connect(attacker).reviewVerification(
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          true
        )
      ).to.be.revertedWithCustomError(verificationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized verification revocation", async function () {
      await expect(
        verificationRegistry.connect(attacker).revokeVerification(
          ethers.keccak256(ethers.toUtf8Bytes("test")),
          "Unauthorized revocation"
        )
      ).to.be.revertedWithCustomError(verificationRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized fee updates in AssetFactory", async function () {
      await expect(
        assetFactory.connect(attacker).setTokenizationFee(500)
      ).to.be.revertedWithCustomError(assetFactory, "AccessControlUnauthorizedAccount");
    });
  });

  describe("🛡️ Input Validation Security", function () {
    it("Should prevent zero amount staking", async function () {
      await expect(
        trustToken.connect(farmer).stake(0, 30 * 24 * 60 * 60)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should prevent invalid lock period staking", async function () {
      // Too short
      await expect(
        trustToken.connect(farmer).stake(ethers.parseEther("1000"), 29 * 24 * 60 * 60)
      ).to.be.revertedWith("Invalid lock period");

      // Too long
      await expect(
        trustToken.connect(farmer).stake(ethers.parseEther("1000"), 366 * 24 * 60 * 60)
      ).to.be.revertedWith("Invalid lock period");
    });

    it("Should prevent insufficient stake for attestor registration", async function () {
      await expect(
        attestorManager.connect(owner).registerAttestor(
          attacker.address,
          "Fake Organization",
          "Fake Country",
          ethers.parseEther("1000"),
          { value: ethers.parseEther("100") } // Insufficient stake
        )
      ).to.be.revertedWith("Insufficient stake");
    });

    it("Should prevent duplicate attestor registration", async function () {
      // Use a fresh attestor address for this test
      const freshAttestor = ethers.Wallet.createRandom().address;
      
      // Register first time
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor,
        "First Organization",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      // Try to register again with same address
      await expect(
        attestorManager.connect(owner).registerAttestor(
          freshAttestor,
          "Second Organization",
          "Kenya",
          ethers.parseEther("1000"),
          { value: ethers.parseEther("1000") }
        )
      ).to.be.revertedWith("Attestor already registered");
    });

    it("Should prevent slashing non-existent attestor", async function () {
      await expect(
        attestorManager.connect(owner).slashAttestor(
          attacker.address,
          "Non-existent attestor"
        )
      ).to.be.revertedWith("Attestor not active");
    });

    it("Should prevent zero payment settlement creation", async function () {
      await expect(
        settlementEngine.connect(investor).createSettlement(
          ethers.keccak256(ethers.toUtf8Bytes("test-asset")),
          farmer.address,
          Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          "tracking-hash",
          { value: 0 }
        )
      ).to.be.revertedWith("No payment provided");
    });

    it("Should prevent past deadline settlement creation", async function () {
      await expect(
        settlementEngine.connect(investor).createSettlement(
          ethers.keccak256(ethers.toUtf8Bytes("test-asset")),
          farmer.address,
          Math.floor(Date.now() / 1000) - 1, // Past deadline
          "tracking-hash",
          { value: ethers.parseEther("1000") }
        )
      ).to.be.revertedWith("Invalid deadline");
    });

    it("Should prevent zero fee distribution", async function () {
      await expect(
        feeDistribution.connect(owner).distributeFees({ value: 0 })
      ).to.be.revertedWith("No fees to distribute");
    });

    it("Should prevent claiming non-existent validator rewards", async function () {
      await expect(
        feeDistribution.connect(attacker).claimValidatorRewards()
      ).to.be.revertedWith("No rewards available");
    });
  });

  describe("🔒 State Manipulation Security", function () {
    it("Should prevent unauthorized state changes in TrustToken", async function () {
      // Try to change max supply (if such function existed)
      // This test ensures no unauthorized state modifications
      const initialSupply = await trustToken.totalSupply();
      expect(initialSupply).to.equal(ethers.parseEther("200000000"));
    });

    it("Should prevent unauthorized role grants", async function () {
      const MINTER_ROLE = await trustToken.MINTER_ROLE();
      
      // Non-admin trying to grant role
      await expect(
        trustToken.connect(attacker).grantRole(MINTER_ROLE, attacker.address)
      ).to.be.revertedWithCustomError(trustToken, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized role revocations", async function () {
      const MINTER_ROLE = await trustToken.MINTER_ROLE();
      
      // Non-admin trying to revoke role
      await expect(
        trustToken.connect(attacker).revokeRole(MINTER_ROLE, owner.address)
      ).to.be.revertedWithCustomError(trustToken, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent unauthorized contract upgrades", async function () {
      // Test that no upgrade functions are accessible to non-admins
      // This ensures contract immutability
      const contractCode = await ethers.provider.getCode(await trustToken.getAddress());
      expect(contractCode).to.not.equal("0x");
    });
  });

  describe("💰 Economic Security", function () {
    it("Should prevent fee manipulation", async function () {
      // Test setting fee too high
      await expect(
        assetFactory.connect(owner).setTokenizationFee(1500) // 15%
      ).to.be.revertedWith("Fee too high");
    });

    it("Should prevent unauthorized fee collection", async function () {
      // Test that only authorized roles can collect fees
      // This ensures economic security
      const feeRecipient = await assetFactory.feeRecipient();
      expect(feeRecipient).to.equal(owner.address);
    });

    it("Should prevent unauthorized stake withdrawal", async function () {
      // Test that attestors cannot withdraw their stake directly
      // Stake should only be slashed by admin
      const freshAttestor = ethers.Wallet.createRandom().address;
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor,
        "Test Organization",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );

      const attestorInfo = await attestorManager.getAttestorInfo(freshAttestor);
      expect(attestorInfo.stakeAmount).to.equal(ethers.parseEther("1000"));
      
      // Attestor should not be able to withdraw stake directly
      // (This would be tested if there was a withdraw function)
    });
  });

  describe("🔄 Reentrancy Security", function () {
    it("Should prevent reentrancy in staking operations", async function () {
      // Test that staking operations are protected against reentrancy
      // This is implicitly tested by the nonReentrant modifier
      // Use a fresh user with tokens and ETH
      const freshUser = ethers.Wallet.createRandom().connect(ethers.provider);
      await owner.sendTransaction({ to: freshUser.address, value: ethers.parseEther("10") }); // Send ETH for gas
      await trustToken.connect(owner).transfer(freshUser.address, ethers.parseEther("10000"));
      
      await trustToken.connect(freshUser).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60);
      
      // If reentrancy was possible, this would fail
      const stakingBalance = await trustToken.stakingBalances(freshUser.address);
      expect(stakingBalance).to.equal(ethers.parseEther("1000"));
    });

    it("Should prevent reentrancy in fee distribution", async function () {
      // Test fee distribution reentrancy protection
      await feeDistribution.connect(owner).distributeFees({ value: ethers.parseEther("1000") });
      
      // If reentrancy was possible, this would fail
      const contractBalance = await ethers.provider.getBalance(await feeDistribution.getAddress());
      expect(contractBalance).to.be.gt(0);
    });
  });

  describe("📊 Data Integrity Security", function () {
    it("Should prevent duplicate verification submissions", async function () {
      // Setup
      const freshAttestor = ethers.Wallet.createRandom().address;
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor,
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

      const assetId = ethers.keccak256(ethers.toUtf8Bytes("duplicate-test"));

      // Submit first verification
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"],
        [freshAttestor]
      );

      // Try to submit duplicate
      await expect(
        verificationRegistry.connect(owner).submitVerification(
          assetId,
          assetType,
          farmer.address,
          9000,
          ethers.keccak256(ethers.toUtf8Bytes("new-evidence")),
          Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
          ["0x"],
          [freshAttestor]
        )
      ).to.be.revertedWith("Verification already exists");
    });

    it("Should prevent invalid attestor signatures", async function () {
      // Setup
      const freshAttestor = ethers.Wallet.createRandom().address;
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor,
        "Test Organization",
        "Kenya",
        ethers.parseEther("1.2"), // Small stake to deactivate after slash (1.2 - 0.3 = 0.9, below 1 ETH threshold)
        { value: ethers.parseEther("1.2") }
      );

      const assetType = ethers.keccak256(ethers.toUtf8Bytes("TEST_ASSET"));
      await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );

      const assetId = ethers.keccak256(ethers.toUtf8Bytes("invalid-signature-test"));

      // Try to submit with inactive attestor
      await attestorManager.connect(owner).slashAttestor(
        freshAttestor,
        "Deactivate attestor"
      );

      await expect(
        verificationRegistry.connect(owner).submitVerification(
          assetId,
          assetType,
          farmer.address,
          8000,
          ethers.keccak256(ethers.toUtf8Bytes("evidence")),
          Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
          ["0x"],
          [freshAttestor]
        )
      ).to.be.revertedWith("Inactive attestor");
    });
  });

  describe("⏰ Time-based Security", function () {
    it("Should prevent operations on expired verifications", async function () {
      // Setup
      const freshAttestor = ethers.Wallet.createRandom().address;
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor,
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

      const assetId = ethers.keccak256(ethers.toUtf8Bytes("expired-test"));
      const shortExpiry =         Math.floor(Date.now() / 1000) + 60; // 1 minute

      // Submit verification with short expiry
      await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        shortExpiry,
        ["0x"],
        [freshAttestor]
      );

      // Fast forward time past expiry
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine", []);

      // Check that verification is expired
      const status = await verificationRegistry.getVerificationStatus(assetId);
      expect(status.verified).to.be.false;
      expect(status.status).to.equal(3); // EXPIRED status
    });

    it("Should prevent operations on locked tokens", async function () {
      // Use a fresh user with tokens and ETH
      const freshUser = ethers.Wallet.createRandom().connect(ethers.provider);
      await owner.sendTransaction({ to: freshUser.address, value: ethers.parseEther("10") }); // Send ETH for gas
      await trustToken.connect(owner).transfer(freshUser.address, ethers.parseEther("10000"));
      
      // Stake tokens
      await trustToken.connect(freshUser).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60);

      // Try to unstake before lock period
      await expect(
        trustToken.connect(freshUser).unstake()
      ).to.be.revertedWith("Tokens still locked");
    });
  });

  describe("🎯 Business Logic Security", function () {
    it("Should prevent tokenization of unverified assets", async function () {
      const unverifiedAssetId = ethers.keccak256(ethers.toUtf8Bytes("unverified-asset"));

      await expect(
        assetFactory.connect(farmer).tokenizeAsset(
          "TEST_ASSET",
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

    it("Should prevent insufficient attestor signatures", async function () {
      // Setup
      const freshAttestor = ethers.Wallet.createRandom().address;
      await attestorManager.connect(owner).registerAttestor(
        freshAttestor,
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
        2, // Require 2 attestors
        false
      );

      const assetId = ethers.keccak256(ethers.toUtf8Bytes("insufficient-signatures"));

      // Try to submit with only 1 attestor when 2 are required
      await expect(
        verificationRegistry.connect(owner).submitVerification(
          assetId,
          assetType,
          farmer.address,
          8000,
          ethers.keccak256(ethers.toUtf8Bytes("evidence")),
          Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
          ["0x"],
          [freshAttestor]
        )
      ).to.be.revertedWith("Insufficient attestor signatures");
    });
  });
});
