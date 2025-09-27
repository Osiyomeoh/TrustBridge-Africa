const { ethers } = require("hardhat");

async function main() {
    console.log("🚰 === DEPLOYING TRUST FAUCET ===");
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    
    // Get TrustToken address from deployment
    const trustTokenAddress = "0xa6f8fC5b5A9B5670dF868247585bcD86eD124ba2";
    
    // Deploy TRUSTFaucet
    console.log("🚰 Deploying TRUSTFaucet...");
    const TRUSTFaucet = await ethers.getContractFactory("TRUSTFaucet");
    const faucet = await TRUSTFaucet.deploy(trustTokenAddress);
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();
    
    console.log("✅ TRUSTFaucet deployed at:", faucetAddress);
    
    // Refill the faucet with initial tokens
    console.log("💰 Refilling faucet with initial tokens...");
    const refillAmount = ethers.parseEther("100000"); // 100,000 TRUST tokens
    
    // Get TrustToken contract to transfer tokens to faucet
    const TrustToken = await ethers.getContractFactory("TrustToken");
    const trustToken = TrustToken.attach(trustTokenAddress);
    
    // Transfer tokens to faucet
    const transferTx = await trustToken.transfer(faucetAddress, refillAmount);
    await transferTx.wait();
    console.log("✅ Faucet refilled with", ethers.formatEther(refillAmount), "TRUST tokens");
    
    // Verify faucet balance
    const faucetBalance = await trustToken.balanceOf(faucetAddress);
    console.log("💰 Faucet balance:", ethers.formatEther(faucetBalance), "TRUST");
    
    // Test the faucet with a test user
    console.log("🧪 Testing faucet functionality...");
    const [, user1] = await ethers.getSigners();
    
    // Connect as user1 to test
    const userFaucet = faucet.connect(user1);
    
    try {
        const claimTx = await userFaucet.claimTokens();
        await claimTx.wait();
        console.log("✅ Test claim successful!");
        
        const userBalance = await trustToken.balanceOf(user1.address);
        console.log("💰 User1 balance after claim:", ethers.formatEther(userBalance), "TRUST");
    } catch (error) {
        console.log("❌ Test claim failed:", error.message);
    }
    
    console.log("\n🎉 === FAUCET DEPLOYMENT COMPLETE ===");
    console.log("📍 Faucet Address:", faucetAddress);
    console.log("💰 Initial Balance:", ethers.formatEther(faucetBalance), "TRUST");
    console.log("💡 Users can now claim 1000 TRUST tokens every 24 hours!");
    
    // Save deployment info
    const deploymentInfo = {
        network: "hedera_testnet",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        faucetAddress: faucetAddress,
        trustTokenAddress: trustTokenAddress,
        initialBalance: ethers.formatEther(faucetBalance),
        faucetAmount: "1000",
        cooldownPeriod: "24 hours",
        maxDailyAmount: "5000"
    };
    
    const fs = require('fs');
    fs.writeFileSync(
        'deployments/trust-faucet.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("📄 Deployment info saved to deployments/trust-faucet.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
