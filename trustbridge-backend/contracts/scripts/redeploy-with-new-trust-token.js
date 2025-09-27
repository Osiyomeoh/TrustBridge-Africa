const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 === REDEPLOYING CONTRACTS WITH NEW TRUST TOKEN ===");
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    
    // New TrustToken address
    const newTrustTokenAddress = "0x170B35e97C217dBf63a500EaB884392F7BF6Ec34";
    const assetNFTAddress = "0x42be9627C970D40248690F010b3c2a7F8C68576C";
    const feeRecipient = deployer.address;
    
    console.log("📍 New TrustToken address:", newTrustTokenAddress);
    console.log("📍 AssetNFT address:", assetNFTAddress);
    console.log("📍 Fee recipient:", feeRecipient);
    
    const deployedContracts = {};
    
    try {
        // 1. Deploy CoreAssetFactory (most important for frontend)
        console.log("\n1️⃣ Deploying CoreAssetFactory...");
        const CoreAssetFactory = await ethers.getContractFactory("CoreAssetFactory");
        const coreAssetFactory = await CoreAssetFactory.deploy(
            newTrustTokenAddress,
            assetNFTAddress,
            feeRecipient
        );
        await coreAssetFactory.waitForDeployment();
        const coreAssetFactoryAddress = await coreAssetFactory.getAddress();
        deployedContracts.coreAssetFactory = coreAssetFactoryAddress;
        console.log("✅ CoreAssetFactory deployed at:", coreAssetFactoryAddress);
        
        // 2. Deploy TRUSTMarketplace
        console.log("\n2️⃣ Deploying TRUSTMarketplace...");
        const TRUSTMarketplace = await ethers.getContractFactory("TRUSTMarketplace");
        const trustMarketplace = await TRUSTMarketplace.deploy(
            assetNFTAddress,
            newTrustTokenAddress,
            feeRecipient
        );
        await trustMarketplace.waitForDeployment();
        const trustMarketplaceAddress = await trustMarketplace.getAddress();
        deployedContracts.trustMarketplace = trustMarketplaceAddress;
        console.log("✅ TRUSTMarketplace deployed at:", trustMarketplaceAddress);
        
        // 3. Deploy PoolManager
        console.log("\n3️⃣ Deploying PoolManager...");
        const PoolManager = await ethers.getContractFactory("PoolManager");
        const poolManager = await PoolManager.deploy(
            coreAssetFactoryAddress,
            newTrustTokenAddress
        );
        await poolManager.waitForDeployment();
        const poolManagerAddress = await poolManager.getAddress();
        deployedContracts.poolManager = poolManagerAddress;
        console.log("✅ PoolManager deployed at:", poolManagerAddress);
        
        // 4. Deploy TradingEngine
        console.log("\n4️⃣ Deploying TradingEngine...");
        const TradingEngine = await ethers.getContractFactory("TradingEngine");
        const tradingEngine = await TradingEngine.deploy(
            coreAssetFactoryAddress,
            newTrustTokenAddress
        );
        await tradingEngine.waitForDeployment();
        const tradingEngineAddress = await tradingEngine.getAddress();
        deployedContracts.tradingEngine = tradingEngineAddress;
        console.log("✅ TradingEngine deployed at:", tradingEngineAddress);
        
        // 5. Deploy AttestorVerificationSystem
        console.log("\n5️⃣ Deploying AttestorVerificationSystem...");
        const AttestorVerificationSystem = await ethers.getContractFactory("AttestorVerificationSystem");
        const attestorVerificationSystem = await AttestorVerificationSystem.deploy(
            feeRecipient,
            newTrustTokenAddress
        );
        await attestorVerificationSystem.waitForDeployment();
        const attestorVerificationSystemAddress = await attestorVerificationSystem.getAddress();
        deployedContracts.attestorVerificationSystem = attestorVerificationSystemAddress;
        console.log("✅ AttestorVerificationSystem deployed at:", attestorVerificationSystemAddress);
        
        // 6. Deploy BatchMinting
        console.log("\n6️⃣ Deploying BatchMinting...");
        const BatchMinting = await ethers.getContractFactory("BatchMinting");
        const batchMinting = await BatchMinting.deploy(
            newTrustTokenAddress,
            assetNFTAddress
        );
        await batchMinting.waitForDeployment();
        const batchMintingAddress = await batchMinting.getAddress();
        deployedContracts.batchMinting = batchMintingAddress;
        console.log("✅ BatchMinting deployed at:", batchMintingAddress);
        
        // 7. Deploy AdvancedMinting
        console.log("\n7️⃣ Deploying AdvancedMinting...");
        const AdvancedMinting = await ethers.getContractFactory("AdvancedMinting");
        const advancedMinting = await AdvancedMinting.deploy(
            newTrustTokenAddress,
            assetNFTAddress
        );
        await advancedMinting.waitForDeployment();
        const advancedMintingAddress = await advancedMinting.getAddress();
        deployedContracts.advancedMinting = advancedMintingAddress;
        console.log("✅ AdvancedMinting deployed at:", advancedMintingAddress);
        
        // Test the CoreAssetFactory
        console.log("\n🧪 Testing CoreAssetFactory...");
        try {
            // Check if we can call a view function
            const digitalCreationFee = await coreAssetFactory.DIGITAL_CREATION_FEE();
            console.log("✅ CoreAssetFactory digital creation fee:", ethers.formatEther(digitalCreationFee), "TRUST");
        } catch (error) {
            console.log("❌ CoreAssetFactory test failed:", error.message);
        }
        
        console.log("\n🎉 === REDEPLOYMENT COMPLETE ===");
        console.log("📍 Updated contract addresses:");
        Object.entries(deployedContracts).forEach(([name, address]) => {
            console.log(`   ${name}: ${address}`);
        });
        
        // Save deployment info
        const deploymentInfo = {
            network: "hedera_testnet",
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            trustTokenAddress: newTrustTokenAddress,
            assetNFTAddress: assetNFTAddress,
            feeRecipient: feeRecipient,
            contracts: {
                ...deployedContracts,
                // Keep existing contracts that don't need redeployment
                assetNFT: assetNFTAddress,
                verificationRegistry: "0xC2e5D63Da10A3139857D18Cf43eB93CE0133Ca4B",
                feeDistribution: "0xa00343B86a5531155F22d91899229124e6619843",
                spvManager: "0x10D7EfA83A38A8e37Bad40ac40aDDf7906c0cB43",
                timelock: "0x0000000000000000000000000000000000000000",
                governance: "0x0000000000000000000000000000000000000000"
            },
            configuration: {
                tokenEconomy: "TRUST",
                gasCurrency: "HBAR",
                feeRecipient: feeRecipient,
                totalSupply: "200000100.0",
                maxSupply: "1000000000.0"
            },
            note: "Redeployed with new TrustToken address supporting public minting"
        };
        
        const fs = require('fs');
        fs.writeFileSync(
            'deployments/trust-ecosystem-updated.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log("📄 Updated deployment info saved to deployments/trust-ecosystem-updated.json");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
