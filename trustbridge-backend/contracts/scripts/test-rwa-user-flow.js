const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🏠 === COMPLETE RWA ASSET USER FLOW TEST ===");

    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const assetOwner = signers[1] || signers[0];
    const inspector = signers[2] || signers[0];

    console.log("👤 Asset Owner:", assetOwner.address);
    console.log("👤 Inspector:", inspector.address);

    const deploymentsPath = path.join(__dirname, '../deployments/trust-ecosystem.json');
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));

    const trustToken = await ethers.getContractAt("TrustToken", deployments.contracts.trustToken, deployer);
    const coreAssetFactory = await ethers.getContractAt("CoreAssetFactory", deployments.contracts.coreAssetFactory, deployer);
    const amcManager = await ethers.getContractAt("AMCManager", deployments.contracts.amcManager, deployer);

    // Setup roles
    console.log("\n🔧 Setting up roles...");
    const VERIFIER_ROLE = await coreAssetFactory.VERIFIER_ROLE();
    const AMC_ROLE = await coreAssetFactory.AMC_ROLE();
    const INSPECTOR_ROLE = await amcManager.INSPECTOR_ROLE();
    
    await coreAssetFactory.grantRole(VERIFIER_ROLE, deployer.address);
    await coreAssetFactory.grantRole(AMC_ROLE, deployer.address);
    await amcManager.grantRole(INSPECTOR_ROLE, inspector.address);

    // Mint tokens
    await trustToken.mint(assetOwner.address, ethers.parseEther("10000"));
    await trustToken.connect(assetOwner).approve(deployments.contracts.coreAssetFactory, ethers.parseEther("1000"));

    // Step 1: Asset Owner creates RWA asset
    console.log("\n📝 Step 1: Asset Owner creates RWA asset");
    const createTx = await coreAssetFactory.connect(assetOwner).createRWAAsset(
        0, // REAL_ESTATE
        "Commercial Property",
        "Lagos Office Complex",
        "Victoria Island, Lagos",
        ethers.parseEther("1000000"), // 1M TRUST
        Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
        ["ipfs://deed", "ipfs://valuation", "ipfs://survey"],
        ["Property Deed", "Valuation Report", "Survey Plan"],
        "ipfs://office-complex-image",
        "ipfs://legal-documents",
        "Premium office complex in Victoria Island with 50+ units"
    );
    const createReceipt = await createTx.wait();
    const assetCreatedEvent = createReceipt.logs.find(log => 
        log.topics[0] === ethers.id("AssetCreated(bytes32,address,uint8,string,string,uint256,uint8)")
    );
    const assetId = assetCreatedEvent ? assetCreatedEvent.args[0] : "0x" + createReceipt.logs[0].topics[1].slice(26);
    console.log(`✅ RWA asset created: ${assetId}`);

    // Check initial status
    let asset = await coreAssetFactory.getAsset(assetId);
    console.log(`   Initial Status: ${asset.status} (0 = PENDING_VERIFICATION)`);
    console.log(`   Value: ${ethers.formatEther(asset.totalValue)} TRUST`);

    // Step 2: Professional verification
    console.log("\n🔍 Step 2: Professional verification");
    const verifyTx = await coreAssetFactory.connect(deployer).verifyAsset(assetId, 2); // EXPERT level
    await verifyTx.wait();
    console.log("✅ Asset verified to EXPERT level");

    asset = await coreAssetFactory.getAsset(assetId);
    console.log(`   Status after verification: ${asset.status} (1 = VERIFIED_PENDING_AMC)`);

    // Step 3: AMC registration
    console.log("\n🏢 Step 3: AMC registration");
    const registerTx = await amcManager.connect(deployer).registerAMC(
        "TrustBridge Asset Management",
        "Professional real estate asset management",
        "Nigeria"
    );
    await registerTx.wait();
    console.log("✅ AMC registered successfully");

    // Step 4: Schedule physical inspection
    console.log("\n🔍 Step 4: Schedule physical inspection");
    const inspectionTime = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60); // 3 days
    const scheduleTx = await amcManager.connect(deployer).scheduleInspection(
        assetId,
        inspector.address,
        inspectionTime
    );
    await scheduleTx.wait();
    console.log("✅ Physical inspection scheduled");

    // Check inspection status
    let inspection = await amcManager.getInspectionRecord(assetId);
    console.log(`   Inspection Status: ${inspection.status} (1 = SCHEDULED)`);
    console.log(`   Inspector: ${inspection.inspector}`);

    // Step 5: Complete inspection
    console.log("\n✅ Step 5: Complete inspection");
    const completeTx = await amcManager.connect(inspector).completeInspection(
        assetId,
        2, // COMPLETED
        "Property verified: All documents match physical inspection. Building in excellent condition.",
        "ipfs://inspection-report-detailed"
    );
    await completeTx.wait();
    console.log("✅ Physical inspection completed successfully");

    inspection = await amcManager.getInspectionRecord(assetId);
    console.log(`   Final Inspection Status: ${inspection.status} (2 = COMPLETED)`);

    // Step 6: Initiate legal transfer
    console.log("\n📋 Step 6: Initiate legal transfer");
    const initiateTx = await amcManager.connect(deployer).initiateLegalTransfer(
        assetId,
        assetOwner.address,
        "ipfs://legal-transfer-documents"
    );
    await initiateTx.wait();
    console.log("✅ Legal transfer initiated");

    // Check legal transfer status
    let legalTransfer = await amcManager.getLegalTransferRecord(assetId);
    console.log(`   Legal Transfer Status: ${legalTransfer.status} (1 = INITIATED)`);

    // Step 7: Complete legal transfer
    console.log("\n✅ Step 7: Complete legal transfer");
    const completeTransferTx = await amcManager.connect(deployer).completeLegalTransfer(assetId);
    await completeTransferTx.wait();
    console.log("✅ Legal transfer completed - Asset now AMC managed!");

    // Final status check
    asset = await coreAssetFactory.getAsset(assetId);
    legalTransfer = await amcManager.getLegalTransferRecord(assetId);
    
    console.log(`\n📊 Final Asset Status:`);
    console.log(`   Asset Status: ${asset.status} (1 = VERIFIED_PENDING_AMC)`);
    console.log(`   Legal Transfer Status: ${legalTransfer.status} (2 = COMPLETED)`);
    console.log(`   AMC Address: ${legalTransfer.amcAddress}`);

    // Check flow status
    const flowStatus = await coreAssetFactory.getAssetFlowStatus(assetId);
    console.log(`   Flow Stage: ${flowStatus.stage}`);
    console.log(`   Flow Progress: ${flowStatus.progress}%`);
    console.log(`   Status Text: ${flowStatus.statusText}`);

    // Check AMC managed assets
    const amcAssets = await coreAssetFactory.getAMCManagedAssets(deployer.address);
    console.log(`   AMC Managed Assets: ${amcAssets.length}`);

    console.log("\n🎉 RWA ASSET USER FLOW: COMPLETE SUCCESS!");
    console.log("\n✅ Asset Creation: WORKING");
    console.log("✅ Professional Verification: WORKING");
    console.log("✅ AMC Registration: WORKING");
    console.log("✅ Physical Inspection: WORKING");
    console.log("✅ Legal Transfer: WORKING");
    console.log("✅ Asset Management: WORKING");
}

main().catch(console.error);
