const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 === UPGRADING TRUST TOKEN WITH PUBLIC MINTING ===");
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    
    // Deploy new TrustToken with public minting
    console.log("🚀 Deploying updated TrustToken...");
    const TrustToken = await ethers.getContractFactory("TrustToken");
    const trustToken = await TrustToken.deploy();
    await trustToken.waitForDeployment();
    const trustTokenAddress = await trustToken.getAddress();
    
    console.log("✅ Updated TrustToken deployed at:", trustTokenAddress);
    
    // Test the public minting function
    console.log("🧪 Testing public minting...");
    
    try {
        // Test minting 100 TRUST tokens
        const mintTx = await trustToken.mintTestTokens(ethers.parseEther("100"));
        await mintTx.wait();
        console.log("✅ Public minting test successful!");
        
        const balance = await trustToken.balanceOf(deployer.address);
        console.log("💰 Deployer balance:", ethers.formatEther(balance), "TRUST");
        
    } catch (error) {
        console.log("❌ Public minting test failed:", error.message);
    }
    
    console.log("\n🎉 === TRUST TOKEN UPGRADE COMPLETE ===");
    console.log("📍 New TrustToken Address:", trustTokenAddress);
    console.log("💡 Users can now call mintTestTokens() to get up to 1000 TRUST tokens!");
    
    // Save deployment info
    const deploymentInfo = {
        network: "hedera_testnet",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        trustTokenAddress: trustTokenAddress,
        features: [
            "Public minting for testing (mintTestTokens)",
            "Up to 1000 TRUST tokens per mint",
            "No MINTER_ROLE required for test minting"
        ]
    };
    
    const fs = require('fs');
    fs.writeFileSync(
        'deployments/trust-token-upgraded.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("📄 Deployment info saved to deployments/trust-token-upgraded.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
