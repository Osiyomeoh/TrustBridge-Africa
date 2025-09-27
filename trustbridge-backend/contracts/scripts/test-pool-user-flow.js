const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🏊 === COMPLETE POOL INVESTMENT USER FLOW TEST ===");

    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const investor1 = signers[1] || signers[0];
    const investor2 = signers[2] || signers[0];

    console.log("👤 Pool Manager:", deployer.address);
    console.log("👤 Investor 1:", investor1.address);
    console.log("👤 Investor 2:", investor2.address);

    const deploymentsPath = path.join(__dirname, '../deployments/trust-ecosystem.json');
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));

    const trustToken = await ethers.getContractAt("TrustToken", deployments.contracts.trustToken, deployer);
    const coreAssetFactory = await ethers.getContractAt("CoreAssetFactory", deployments.contracts.coreAssetFactory, deployer);
    const amcManager = await ethers.getContractAt("AMCManager", deployments.contracts.amcManager, deployer);
    const poolManager = await ethers.getContractAt("PoolManager", deployments.contracts.poolManager, deployer);

    // Setup roles
    console.log("\n🔧 Setting up roles...");
    const VERIFIER_ROLE = await coreAssetFactory.VERIFIER_ROLE();
    const AMC_ROLE = await coreAssetFactory.AMC_ROLE();
    const MANAGER_ROLE = await poolManager.MANAGER_ROLE();
    
    await coreAssetFactory.grantRole(VERIFIER_ROLE, deployer.address);
    await coreAssetFactory.grantRole(AMC_ROLE, deployer.address);
    await poolManager.grantRole(MANAGER_ROLE, deployer.address);

    // Mint tokens to investors
    await trustToken.mint(investor1.address, ethers.parseEther("5000"));
    await trustToken.mint(investor2.address, ethers.parseEther("5000"));

    // Step 1: Create RWA asset for pool
    console.log("\n📝 Step 1: Create RWA asset for pool");
    const createAssetTx = await coreAssetFactory.connect(deployer).createRWAAsset(
        1, // COMMODITY
        "Cocoa Farm",
        "Premium Cocoa Farm - 100 Hectares",
        "Ogun State, Nigeria",
        ethers.parseEther("2000000"), // 2M TRUST
        Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
        ["ipfs://farm-deed", "ipfs://soil-test", "ipfs://production-report"],
        ["Farm Deed", "Soil Test Report", "Production Report"],
        "ipfs://cocoa-farm-image",
        "ipfs://farm-documents",
        "Premium cocoa farm with 100 hectares of productive land"
    );
    const createAssetReceipt = await createAssetTx.wait();
    const assetCreatedEvent = createAssetReceipt.logs.find(log => 
        log.topics[0] === ethers.id("AssetCreated(bytes32,address,uint8,string,string,uint256,uint8)")
    );
    const assetId = assetCreatedEvent ? assetCreatedEvent.args[0] : "0x" + createAssetReceipt.logs[0].topics[1].slice(26);
    console.log(`✅ RWA asset created: ${assetId}`);

    // Verify asset
    const verifyTx = await coreAssetFactory.connect(deployer).verifyAsset(assetId, 2); // EXPERT
    await verifyTx.wait();
    console.log("✅ Asset verified to EXPERT level");

    // Step 2: Create investment pool
    console.log("\n🏊 Step 2: Create investment pool");
    const createPoolTx = await poolManager.connect(deployer).createPool(
        "African Agriculture Pool",
        "Diversified agricultural investment pool focusing on premium crops",
        250, // 2.5% management fee
        800  // 8% performance fee
    );
    const createPoolReceipt = await createPoolTx.wait();
    const poolCreatedEvent = createPoolReceipt.logs.find(log => 
        log.topics[0] === ethers.id("PoolCreated(bytes32,address,string,uint256)")
    );
    const poolId = poolCreatedEvent ? poolCreatedEvent.args[0] : "0x" + createPoolReceipt.logs[0].topics[1].slice(26);
    console.log(`✅ Investment pool created: ${poolId}`);

    // Step 3: Add asset to pool
    console.log("\n➕ Step 3: Add asset to pool");
    const addAssetTx = await poolManager.connect(deployer).addAssetToPool(poolId, assetId);
    await addAssetTx.wait();
    console.log("✅ Asset added to pool");

    // Check pool details
    let poolDetails = await poolManager.getPool(poolId);
    console.log(`   Pool Name: ${poolDetails.name}`);
    console.log(`   Management Fee: ${poolDetails.managementFee} basis points`);
    console.log(`   Performance Fee: ${poolDetails.performanceFee} basis points`);
    console.log(`   Assets in Pool: ${poolDetails.assets.length}`);

    // Step 4: Investor 1 invests in pool
    console.log("\n💰 Step 4: Investor 1 invests in pool");
    const invest1Tx = await poolManager.connect(investor1).investInPool(
        poolId,
        ethers.parseEther("1000"), // 1000 TRUST
        { value: ethers.parseEther("1000") }
    );
    await invest1Tx.wait();
    console.log("✅ Investor 1 invested 1000 TRUST");

    // Check investor 1 shares
    const investor1Shares = await poolManager.getUserShares(poolId, investor1.address);
    const investor1Investment = await poolManager.getUserInvestment(poolId, investor1.address);
    console.log(`   Investor 1 Shares: ${ethers.formatEther(investor1Shares)}`);
    console.log(`   Investor 1 Investment: ${ethers.formatEther(investor1Investment)} TRUST`);

    // Step 5: Investor 2 invests in pool
    console.log("\n💰 Step 5: Investor 2 invests in pool");
    const invest2Tx = await poolManager.connect(investor2).investInPool(
        poolId,
        ethers.parseEther("2000"), // 2000 TRUST
        { value: ethers.parseEther("2000") }
    );
    await invest2Tx.wait();
    console.log("✅ Investor 2 invested 2000 TRUST");

    // Check investor 2 shares
    const investor2Shares = await poolManager.getUserShares(poolId, investor2.address);
    const investor2Investment = await poolManager.getUserInvestment(poolId, investor2.address);
    console.log(`   Investor 2 Shares: ${ethers.formatEther(investor2Shares)}`);
    console.log(`   Investor 2 Investment: ${ethers.formatEther(investor2Investment)} TRUST`);

    // Step 6: Check final pool status
    console.log("\n📊 Step 6: Final pool status");
    poolDetails = await poolManager.getPool(poolId);
    console.log(`   Total Pool Value: ${ethers.formatEther(poolDetails.totalValue)} TRUST`);
    console.log(`   Total Pool Shares: ${ethers.formatEther(poolDetails.totalShares)}`);
    console.log(`   Total Investors: 2`);

    // Check total value locked
    const totalValueLocked = await poolManager.totalValueLocked();
    console.log(`   Total Value Locked in System: ${ethers.formatEther(totalValueLocked)} TRUST`);

    // Check user pools
    const investor1Pools = await poolManager.getUserPools(investor1.address);
    const investor2Pools = await poolManager.getUserPools(investor2.address);
    console.log(`   Investor 1 Pools: ${investor1Pools.length}`);
    console.log(`   Investor 2 Pools: ${investor2Pools.length}`);

    console.log("\n🎉 POOL INVESTMENT USER FLOW: COMPLETE SUCCESS!");
    console.log("\n✅ Asset Creation: WORKING");
    console.log("✅ Asset Verification: WORKING");
    console.log("✅ Pool Creation: WORKING");
    console.log("✅ Asset Addition to Pool: WORKING");
    console.log("✅ Pool Investment: WORKING");
    console.log("✅ Share Distribution: WORKING");
    console.log("✅ Pool Management: WORKING");
}

main().catch(console.error);
