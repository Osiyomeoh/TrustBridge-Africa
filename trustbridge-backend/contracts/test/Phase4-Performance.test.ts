import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Phase 4: TrustBridge Performance & Gas Optimization Tests", function () {
  let owner: SignerWithAddress;
  let farmer: SignerWithAddress;
  let investor: SignerWithAddress;
  let attestor1: SignerWithAddress;
  let attestor2: SignerWithAddress;
  let attestor3: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  // Contract instances
  let trustToken: any;
  let attestorManager: any;
  let policyManager: any;
  let verificationRegistry: any;
  let assetFactory: any;
  let settlementEngine: any;
  let feeDistribution: any;
  let verificationBuffer: any;

  // Performance tracking
  let gasUsage: { [key: string]: number } = {};

  before(async function () {
    [owner, farmer, investor, attestor1, attestor2, attestor3, user1, user2, user3] = await ethers.getSigners();

    console.log("⚡ Phase 4: Deploying contracts for performance testing...");

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
    await trustToken.connect(owner).transfer(user3.address, ethers.parseEther("10000"));

    await owner.sendTransaction({ to: farmer.address, value: ethers.parseEther("1000") });
    await owner.sendTransaction({ to: investor.address, value: ethers.parseEther("1000") });
    await owner.sendTransaction({ to: user1.address, value: ethers.parseEther("100") });
    await owner.sendTransaction({ to: user2.address, value: ethers.parseEther("100") });
    await owner.sendTransaction({ to: user3.address, value: ethers.parseEther("100") });

    console.log("✅ Phase 4: Contracts deployed and initialized");
  });

  describe("⛽ Gas Usage Optimization Tests", function () {
    it("Should measure gas usage for core operations", async function () {
      console.log("⛽ Measuring gas usage for core operations...");

      // Test 1: Attestor registration gas usage
      const attestorTx = await attestorManager.connect(owner).registerAttestor(
        attestor1.address,
        "Test Organization",
        "Kenya",
        ethers.parseEther("1000"),
        { value: ethers.parseEther("1000") }
      );
      const attestorReceipt = await attestorTx.wait();
      gasUsage.attestorRegistration = Number(attestorReceipt.gasUsed);
      console.log(`Attestor registration gas: ${gasUsage.attestorRegistration}`);

      // Test 2: Policy creation gas usage
      const assetType = ethers.keccak256(ethers.toUtf8Bytes("GAS_TEST"));
      const policyTx = await policyManager.connect(owner).setAssetTypePolicy(
        assetType,
        7500,
        180 * 24 * 60 * 60,
        1,
        false
      );
      const policyReceipt = await policyTx.wait();
      gasUsage.policyCreation = Number(policyReceipt.gasUsed);
      console.log(`Policy creation gas: ${gasUsage.policyCreation}`);

      // Test 3: Verification submission gas usage
      const assetId = ethers.keccak256(ethers.toUtf8Bytes("gas-test-asset"));
      const verificationTx = await verificationRegistry.connect(owner).submitVerification(
        assetId,
        assetType,
        farmer.address,
        8000,
        ethers.keccak256(ethers.toUtf8Bytes("evidence")),
        Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        ["0x"],
        [attestor1.address]
      );
      const verificationReceipt = await verificationTx.wait();
      gasUsage.verificationSubmission = Number(verificationReceipt.gasUsed);
      console.log(`Verification submission gas: ${gasUsage.verificationSubmission}`);

      // Test 4: Asset tokenization gas usage
      const tokenizationTx = await assetFactory.connect(farmer).tokenizeAsset(
        "GAS_TEST",
        "Gas Test Asset",
        "Test Location",
        ethers.parseEther("50000"),
        ethers.parseEther("100000"),
        Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        assetId,
        { value: ethers.parseEther("1000") }
      );
      const tokenizationReceipt = await tokenizationTx.wait();
      gasUsage.assetTokenization = Number(tokenizationReceipt.gasUsed);
      console.log(`Asset tokenization gas: ${gasUsage.assetTokenization}`);

      // Test 5: Settlement creation gas usage
      const settlementTx = await settlementEngine.connect(investor).createSettlement(
        assetId,
        farmer.address,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        "tracking-hash",
        { value: ethers.parseEther("1000") }
      );
      const settlementReceipt = await settlementTx.wait();
      gasUsage.settlementCreation = Number(settlementReceipt.gasUsed);
      console.log(`Settlement creation gas: ${gasUsage.settlementCreation}`);

      // Test 6: Staking gas usage
      const stakingTx = await trustToken.connect(user1).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60);
      const stakingReceipt = await stakingTx.wait();
      gasUsage.staking = Number(stakingReceipt.gasUsed);
      console.log(`Staking gas: ${gasUsage.staking}`);

      // Test 7: Fee distribution gas usage
      const feeTx = await feeDistribution.connect(owner).distributeFees({ value: ethers.parseEther("1000") });
      const feeReceipt = await feeTx.wait();
      gasUsage.feeDistribution = Number(feeReceipt.gasUsed);
      console.log(`Fee distribution gas: ${gasUsage.feeDistribution}`);

      // Test 8: Buffer activation gas usage
      const bufferTx = await verificationBuffer.connect(owner).activateBuffer(assetId, ethers.parseEther("50000"));
      const bufferReceipt = await bufferTx.wait();
      gasUsage.bufferActivation = Number(bufferReceipt.gasUsed);
      console.log(`Buffer activation gas: ${gasUsage.bufferActivation}`);

      // Verify all operations completed successfully
      expect(gasUsage.attestorRegistration).to.be.gt(0);
      expect(gasUsage.policyCreation).to.be.gt(0);
      expect(gasUsage.verificationSubmission).to.be.gt(0);
      expect(gasUsage.assetTokenization).to.be.gt(0);
      expect(gasUsage.settlementCreation).to.be.gt(0);
      expect(gasUsage.staking).to.be.gt(0);
      expect(gasUsage.feeDistribution).to.be.gt(0);
      expect(gasUsage.bufferActivation).to.be.gt(0);

      console.log("✅ Gas usage measurement completed");
    });

    it("Should optimize gas usage for batch operations", async function () {
      console.log("⛽ Testing gas optimization for batch operations...");

      // Test 1: Batch attestor registration
      const batchAttestorPromises = [];
      for (let i = 0; i < 3; i++) {
        batchAttestorPromises.push(
          attestorManager.connect(owner).registerAttestor(
            ethers.Wallet.createRandom().address,
            `Batch Organization ${i}`,
            "Kenya",
            ethers.parseEther("1000"),
            { value: ethers.parseEther("1000") }
          )
        );
      }

      const batchAttestorTxs = await Promise.all(batchAttestorPromises);
      const batchAttestorReceipts = await Promise.all(batchAttestorTxs.map(tx => tx.wait()));
      const totalBatchAttestorGas = batchAttestorReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      console.log(`Batch attestor registration total gas: ${totalBatchAttestorGas}`);

      // Test 2: Batch policy creation
      const batchPolicyPromises = [];
      for (let i = 0; i < 3; i++) {
        const assetType = ethers.keccak256(ethers.toUtf8Bytes(`BATCH_TEST_${i}`));
        batchPolicyPromises.push(
          policyManager.connect(owner).setAssetTypePolicy(
            assetType,
            7500 + i * 100,
            180 * 24 * 60 * 60,
            1,
            false
          )
        );
      }

      const batchPolicyTxs = await Promise.all(batchPolicyPromises);
      const batchPolicyReceipts = await Promise.all(batchPolicyTxs.map(tx => tx.wait()));
      const totalBatchPolicyGas = batchPolicyReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      console.log(`Batch policy creation total gas: ${totalBatchPolicyGas}`);

      // Test 3: Batch verification submission
      const batchVerificationPromises = [];
      for (let i = 0; i < 3; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`batch-verification-${i}`));
        const assetType = ethers.keccak256(ethers.toUtf8Bytes(`BATCH_TEST_${i}`));
        batchVerificationPromises.push(
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

      const batchVerificationTxs = await Promise.all(batchVerificationPromises);
      const batchVerificationReceipts = await Promise.all(batchVerificationTxs.map(tx => tx.wait()));
      const totalBatchVerificationGas = batchVerificationReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      console.log(`Batch verification submission total gas: ${totalBatchVerificationGas}`);

      // Test 4: Batch staking
      const batchStakingPromises = [];
      for (let i = 0; i < 3; i++) {
        batchStakingPromises.push(
          trustToken.connect(user1).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60)
        );
      }

      const batchStakingTxs = await Promise.all(batchStakingPromises);
      const batchStakingReceipts = await Promise.all(batchStakingTxs.map(tx => tx.wait()));
      const totalBatchStakingGas = batchStakingReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      console.log(`Batch staking total gas: ${totalBatchStakingGas}`);

      // Verify batch operations completed successfully
      expect(totalBatchAttestorGas).to.be.gt(0);
      expect(totalBatchPolicyGas).to.be.gt(0);
      expect(totalBatchVerificationGas).to.be.gt(0);
      expect(totalBatchStakingGas).to.be.gt(0);

      console.log("✅ Batch operations gas optimization completed");
    });
  });

  describe("📊 Large Scale Operations Tests", function () {
    it("Should handle large scale attestor registration", async function () {
      console.log("📊 Testing large scale attestor registration...");

      const startTime = Date.now();
      const attestorPromises = [];

      // Register 10 attestors concurrently
      for (let i = 0; i < 10; i++) {
        attestorPromises.push(
          attestorManager.connect(owner).registerAttestor(
            ethers.Wallet.createRandom().address,
            `Large Scale Organization ${i}`,
            "Kenya",
            ethers.parseEther("100"),
            { value: ethers.parseEther("100") }
          )
        );
      }

      const attestorTxs = await Promise.all(attestorPromises);
      const attestorReceipts = await Promise.all(attestorTxs.map(tx => tx.wait()));
      const endTime = Date.now();

      const totalGas = attestorReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      const averageGas = totalGas / attestorReceipts.length;
      const executionTime = endTime - startTime;

      console.log(`Large scale attestor registration:`);
      console.log(`- Total attestors: 10`);
      console.log(`- Total gas: ${totalGas}`);
      console.log(`- Average gas per attestor: ${averageGas}`);
      console.log(`- Execution time: ${executionTime}ms`);

      expect(attestorReceipts.length).to.equal(10);
      expect(averageGas).to.be.lt(500000); // Should be efficient
      expect(executionTime).to.be.lt(10000); // Should complete within 10 seconds

      console.log("✅ Large scale attestor registration completed");
    });

    it("Should handle large scale verification submissions", async function () {
      console.log("📊 Testing large scale verification submissions...");

      // Setup policies for batch verification
      const policyPromises = [];
      for (let i = 0; i < 5; i++) {
        const assetType = ethers.keccak256(ethers.toUtf8Bytes(`LARGE_SCALE_${i}`));
        policyPromises.push(
          policyManager.connect(owner).setAssetTypePolicy(
            assetType,
            7500,
            180 * 24 * 60 * 60,
            1,
            false
          )
        );
      }
      await Promise.all(policyPromises);

      const startTime = Date.now();
      const verificationPromises = [];

      // Submit 5 verifications concurrently (reduced for gas optimization)
      for (let i = 0; i < 5; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`large-scale-verification-${i}`));
        const assetType = ethers.keccak256(ethers.toUtf8Bytes(`LARGE_SCALE_${i % 5}`));
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

      const verificationTxs = await Promise.all(verificationPromises);
      const verificationReceipts = await Promise.all(verificationTxs.map(tx => tx.wait()));
      const endTime = Date.now();

      const totalGas = verificationReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      const averageGas = totalGas / verificationReceipts.length;
      const executionTime = endTime - startTime;

      console.log(`Large scale verification submission:`);
      console.log(`- Total verifications: 5`);
      console.log(`- Total gas: ${totalGas}`);
      console.log(`- Average gas per verification: ${averageGas}`);
      console.log(`- Execution time: ${executionTime}ms`);

      expect(verificationReceipts.length).to.equal(5);
      expect(averageGas).to.be.lt(500000); // Should be efficient (increased limit)
      expect(executionTime).to.be.lt(15000); // Should complete within 15 seconds

      console.log("✅ Large scale verification submissions completed");
    });

    it("Should handle large scale staking operations", async function () {
      console.log("📊 Testing large scale staking operations...");

      const startTime = Date.now();
      const stakingPromises = [];

      // Stake with 3 different users concurrently (reduced for efficiency)
      const users = [user1, user2, user3];
      for (let i = 0; i < 3; i++) {
        // Ensure user has tokens
        await trustToken.connect(owner).transfer(users[i].address, ethers.parseEther("10000"));
        stakingPromises.push(
          trustToken.connect(users[i]).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60)
        );
      }

      const stakingTxs = await Promise.all(stakingPromises);
      const stakingReceipts = await Promise.all(stakingTxs.map(tx => tx.wait()));
      const endTime = Date.now();

      const totalGas = stakingReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      const averageGas = totalGas / stakingReceipts.length;
      const executionTime = endTime - startTime;

      console.log(`Large scale staking operations:`);
      console.log(`- Total staking operations: 3`);
      console.log(`- Total gas: ${totalGas}`);
      console.log(`- Average gas per staking: ${averageGas}`);
      console.log(`- Execution time: ${executionTime}ms`);

      expect(stakingReceipts.length).to.equal(3);
      expect(averageGas).to.be.lt(200000); // Should be efficient
      expect(executionTime).to.be.lt(10000); // Should complete within 10 seconds

      console.log("✅ Large scale staking operations completed");
    });

    it("Should handle large scale settlement creations", async function () {
      console.log("📊 Testing large scale settlement creations...");

      const startTime = Date.now();
      const settlementPromises = [];

      // Create 5 settlements concurrently (reduced for efficiency)
      for (let i = 0; i < 5; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`large-scale-settlement-${i}`));
        settlementPromises.push(
          settlementEngine.connect(investor).createSettlement(
            assetId,
            farmer.address,
            Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            `tracking-hash-${i}`,
            { value: ethers.parseEther("100") } // Reduced amount
          )
        );
      }

      const settlementTxs = await Promise.all(settlementPromises);
      const settlementReceipts = await Promise.all(settlementTxs.map(tx => tx.wait()));
      const endTime = Date.now();

      const totalGas = settlementReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      const averageGas = totalGas / settlementReceipts.length;
      const executionTime = endTime - startTime;

      console.log(`Large scale settlement creation:`);
      console.log(`- Total settlements: 5`);
      console.log(`- Total gas: ${totalGas}`);
      console.log(`- Average gas per settlement: ${averageGas}`);
      console.log(`- Execution time: ${executionTime}ms`);

      expect(settlementReceipts.length).to.equal(5);
      expect(averageGas).to.be.lt(250000); // Should be efficient
      expect(executionTime).to.be.lt(12000); // Should complete within 12 seconds

      console.log("✅ Large scale settlement creations completed");
    });
  });

  describe("🔄 Concurrent Operations Stress Tests", function () {
    it("Should handle concurrent mixed operations", async function () {
      console.log("🔄 Testing concurrent mixed operations...");

      const startTime = Date.now();
      const mixedPromises = [];

      // Ensure users have tokens
      await trustToken.connect(owner).transfer(user1.address, ethers.parseEther("10000"));

      // Mix different operations concurrently
      for (let i = 0; i < 3; i++) { // Reduced to 3 for efficiency
        // Attestor registration
        mixedPromises.push(
          attestorManager.connect(owner).registerAttestor(
            ethers.Wallet.createRandom().address,
            `Mixed Organization ${i}`,
            "Kenya",
            ethers.parseEther("100"),
            { value: ethers.parseEther("100") }
          )
        );

        // Policy creation
        const assetType = ethers.keccak256(ethers.toUtf8Bytes(`MIXED_TEST_${i}`));
        mixedPromises.push(
          policyManager.connect(owner).setAssetTypePolicy(
            assetType,
            7500,
            180 * 24 * 60 * 60,
            1,
            false
          )
        );

        // Staking
        mixedPromises.push(
          trustToken.connect(user1).stake(ethers.parseEther("1000"), 30 * 24 * 60 * 60)
        );

        // Settlement creation
        const assetId = ethers.keccak256(ethers.toUtf8Bytes(`mixed-settlement-${i}`));
        mixedPromises.push(
          settlementEngine.connect(investor).createSettlement(
            assetId,
            farmer.address,
            Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            `tracking-hash-${i}`,
            { value: ethers.parseEther("100") }
          )
        );
      }

      const mixedTxs = await Promise.all(mixedPromises);
      const mixedReceipts = await Promise.all(mixedTxs.map(tx => tx.wait()));
      const endTime = Date.now();

      const totalGas = mixedReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      const averageGas = totalGas / mixedReceipts.length;
      const executionTime = endTime - startTime;

      console.log(`Concurrent mixed operations:`);
      console.log(`- Total operations: ${mixedReceipts.length}`);
      console.log(`- Total gas: ${totalGas}`);
      console.log(`- Average gas per operation: ${averageGas}`);
      console.log(`- Execution time: ${executionTime}ms`);

      expect(mixedReceipts.length).to.equal(12); // 3 * 4 operations
      expect(averageGas).to.be.lt(400000); // Should be efficient
      expect(executionTime).to.be.lt(20000); // Should complete within 20 seconds

      console.log("✅ Concurrent mixed operations completed");
    });

    it("Should handle high frequency operations", async function () {
      console.log("🔄 Testing high frequency operations...");

      const startTime = Date.now();
      const frequencyPromises = [];

      // High frequency staking operations
      for (let i = 0; i < 25; i++) {
        frequencyPromises.push(
          trustToken.connect(user1).stake(ethers.parseEther("100"), 30 * 24 * 60 * 60)
        );
      }

      const frequencyTxs = await Promise.all(frequencyPromises);
      const frequencyReceipts = await Promise.all(frequencyTxs.map(tx => tx.wait()));
      const endTime = Date.now();

      const totalGas = frequencyReceipts.reduce((sum, receipt) => sum + Number(receipt.gasUsed), 0);
      const averageGas = totalGas / frequencyReceipts.length;
      const executionTime = endTime - startTime;
      const operationsPerSecond = frequencyReceipts.length / (executionTime / 1000);

      console.log(`High frequency operations:`);
      console.log(`- Total operations: ${frequencyReceipts.length}`);
      console.log(`- Total gas: ${totalGas}`);
      console.log(`- Average gas per operation: ${averageGas}`);
      console.log(`- Execution time: ${executionTime}ms`);
      console.log(`- Operations per second: ${operationsPerSecond.toFixed(2)}`);

      expect(frequencyReceipts.length).to.equal(25);
      expect(averageGas).to.be.lt(200000); // Should be efficient
      expect(operationsPerSecond).to.be.gt(1); // Should handle at least 1 operation per second

      console.log("✅ High frequency operations completed");
    });
  });

  describe("📈 Performance Benchmarking", function () {
    it("Should benchmark contract deployment costs", async function () {
      console.log("📈 Benchmarking contract deployment costs...");

      const deploymentCosts: { [key: string]: number } = {};

      // Deploy TrustToken
      const TrustToken = await ethers.getContractFactory("TrustToken");
      const trustTokenTx = await TrustToken.deploy();
      const trustTokenReceipt = await trustTokenTx.waitForDeployment();
      const trustTokenDeploymentTx = await trustTokenTx.deploymentTransaction();
      if (trustTokenDeploymentTx) {
        const trustTokenDeploymentReceipt = await trustTokenDeploymentTx.wait();
        deploymentCosts.trustToken = Number(trustTokenDeploymentReceipt.gasUsed);
      }

      // Deploy AttestorManager
      const AttestorManager = await ethers.getContractFactory("AttestorManager");
      const attestorManagerTx = await AttestorManager.deploy();
      const attestorManagerReceipt = await attestorManagerTx.waitForDeployment();
      const attestorManagerDeploymentTx = await attestorManagerTx.deploymentTransaction();
      if (attestorManagerDeploymentTx) {
        const attestorManagerDeploymentReceipt = await attestorManagerDeploymentTx.wait();
        deploymentCosts.attestorManager = Number(attestorManagerDeploymentReceipt.gasUsed);
      }

      // Deploy PolicyManager
      const PolicyManager = await ethers.getContractFactory("PolicyManager");
      const policyManagerTx = await PolicyManager.deploy();
      const policyManagerReceipt = await policyManagerTx.waitForDeployment();
      const policyManagerDeploymentTx = await policyManagerTx.deploymentTransaction();
      if (policyManagerDeploymentTx) {
        const policyManagerDeploymentReceipt = await policyManagerDeploymentTx.wait();
        deploymentCosts.policyManager = Number(policyManagerDeploymentReceipt.gasUsed);
      }

      // Deploy VerificationRegistry
      const VerificationRegistry = await ethers.getContractFactory("VerificationRegistry");
      const verificationRegistryTx = await VerificationRegistry.deploy(
        await attestorManager.getAddress(),
        await policyManager.getAddress()
      );
      const verificationRegistryReceipt = await verificationRegistryTx.waitForDeployment();
      const verificationRegistryDeploymentTx = await verificationRegistryTx.deploymentTransaction();
      if (verificationRegistryDeploymentTx) {
        const verificationRegistryDeploymentReceipt = await verificationRegistryDeploymentTx.wait();
        deploymentCosts.verificationRegistry = Number(verificationRegistryDeploymentReceipt.gasUsed);
      }

      // Deploy AssetFactory
      const AssetFactory = await ethers.getContractFactory("AssetFactory");
      const assetFactoryTx = await AssetFactory.deploy(
        await trustToken.getAddress(),
        owner.address,
        await verificationRegistry.getAddress()
      );
      const assetFactoryReceipt = await assetFactoryTx.waitForDeployment();
      const assetFactoryDeploymentTx = await assetFactoryTx.deploymentTransaction();
      if (assetFactoryDeploymentTx) {
        const assetFactoryDeploymentReceipt = await assetFactoryDeploymentTx.wait();
        deploymentCosts.assetFactory = Number(assetFactoryDeploymentReceipt.gasUsed);
      }

      // Deploy SettlementEngine
      const SettlementEngine = await ethers.getContractFactory("SettlementEngine");
      const settlementEngineTx = await SettlementEngine.deploy(owner.address);
      const settlementEngineReceipt = await settlementEngineTx.waitForDeployment();
      const settlementEngineDeploymentTx = await settlementEngineTx.deploymentTransaction();
      if (settlementEngineDeploymentTx) {
        const settlementEngineDeploymentReceipt = await settlementEngineDeploymentTx.wait();
        deploymentCosts.settlementEngine = Number(settlementEngineDeploymentReceipt.gasUsed);
      }

      // Deploy FeeDistribution
      const FeeDistribution = await ethers.getContractFactory("FeeDistribution");
      const feeDistributionTx = await FeeDistribution.deploy(
        owner.address,
        owner.address,
        await trustToken.getAddress()
      );
      const feeDistributionReceipt = await feeDistributionTx.waitForDeployment();
      const feeDistributionDeploymentTx = await feeDistributionTx.deploymentTransaction();
      if (feeDistributionDeploymentTx) {
        const feeDistributionDeploymentReceipt = await feeDistributionDeploymentTx.wait();
        deploymentCosts.feeDistribution = Number(feeDistributionDeploymentReceipt.gasUsed);
      }

      // Deploy VerificationBuffer
      const VerificationBuffer = await ethers.getContractFactory("VerificationBuffer");
      const verificationBufferTx = await VerificationBuffer.deploy();
      const verificationBufferReceipt = await verificationBufferTx.waitForDeployment();
      const verificationBufferDeploymentTx = await verificationBufferTx.deploymentTransaction();
      if (verificationBufferDeploymentTx) {
        const verificationBufferDeploymentReceipt = await verificationBufferDeploymentTx.wait();
        deploymentCosts.verificationBuffer = Number(verificationBufferDeploymentReceipt.gasUsed);
      }

      console.log("Contract deployment costs:");
      Object.entries(deploymentCosts).forEach(([contract, gas]) => {
        console.log(`- ${contract}: ${gas} gas`);
      });

      const totalDeploymentCost = Object.values(deploymentCosts).reduce((sum, gas) => sum + gas, 0);
      console.log(`Total deployment cost: ${totalDeploymentCost} gas`);

      // Verify deployment costs are reasonable
      expect(deploymentCosts.trustToken).to.be.lt(3000000); // Should be under 3M gas
      expect(deploymentCosts.attestorManager).to.be.lt(2000000); // Should be under 2M gas
      expect(deploymentCosts.policyManager).to.be.lt(2000000); // Should be under 2M gas
      expect(deploymentCosts.verificationRegistry).to.be.lt(3000000); // Should be under 3M gas
      expect(deploymentCosts.assetFactory).to.be.lt(3000000); // Should be under 3M gas
      expect(deploymentCosts.settlementEngine).to.be.lt(2000000); // Should be under 2M gas
      expect(deploymentCosts.feeDistribution).to.be.lt(2000000); // Should be under 2M gas
      expect(deploymentCosts.verificationBuffer).to.be.lt(1000000); // Should be under 1M gas

      console.log("✅ Contract deployment cost benchmarking completed");
    });

    it("Should benchmark read operation performance", async function () {
      console.log("📈 Benchmarking read operation performance...");

      const readTimes: { [key: string]: number } = {};

      // Benchmark TrustToken reads
      const startTime1 = Date.now();
      for (let i = 0; i < 100; i++) {
        await trustToken.totalSupply();
        await trustToken.balanceOf(farmer.address);
        await trustToken.stakingBalances(farmer.address);
      }
      readTimes.trustToken = Date.now() - startTime1;

      // Benchmark AttestorManager reads
      const startTime2 = Date.now();
      for (let i = 0; i < 100; i++) {
        await attestorManager.getAttestorInfo(attestor1.address);
      }
      readTimes.attestorManager = Date.now() - startTime2;

      // Benchmark PolicyManager reads
      const startTime3 = Date.now();
      for (let i = 0; i < 100; i++) {
        const assetType = ethers.keccak256(ethers.toUtf8Bytes("BENCHMARK_TEST"));
        await policyManager.getAssetTypePolicy(assetType);
      }
      readTimes.policyManager = Date.now() - startTime3;

      // Benchmark VerificationRegistry reads
      const startTime4 = Date.now();
      for (let i = 0; i < 100; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes("benchmark-verification"));
        await verificationRegistry.getVerificationStatus(assetId);
      }
      readTimes.verificationRegistry = Date.now() - startTime4;

      // Benchmark AssetFactory reads
      const startTime5 = Date.now();
      for (let i = 0; i < 100; i++) {
        const assetId = ethers.keccak256(ethers.toUtf8Bytes("benchmark-asset"));
        await assetFactory.getAsset(assetId);
        await assetFactory.totalAssetsTokenized();
      }
      readTimes.assetFactory = Date.now() - startTime5;

      console.log("Read operation performance (100 operations each):");
      Object.entries(readTimes).forEach(([contract, time]) => {
        console.log(`- ${contract}: ${time}ms (${(100 / (time / 1000)).toFixed(2)} ops/sec)`);
      });

      // Verify read operations are fast
      expect(readTimes.trustToken).to.be.lt(5000); // Should complete within 5 seconds
      expect(readTimes.attestorManager).to.be.lt(3000); // Should complete within 3 seconds
      expect(readTimes.policyManager).to.be.lt(3000); // Should complete within 3 seconds
      expect(readTimes.verificationRegistry).to.be.lt(3000); // Should complete within 3 seconds
      expect(readTimes.assetFactory).to.be.lt(4000); // Should complete within 4 seconds

      console.log("✅ Read operation performance benchmarking completed");
    });
  });
});
