const { ethers } = require("hardhat");

async function main() {
    console.log("💰 === SENDING TRUST TOKENS TO USER ===");
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    
    // User address from the logs
    const userAddress = "0xa620f55Ec17bf98d9898E43878c22c10b5324069";
    const amountToSend = ethers.parseEther("1000"); // Send 1000 TRUST tokens
    
    console.log("🎯 Sending to user:", userAddress);
    console.log("💵 Amount:", ethers.formatEther(amountToSend), "TRUST");
    
    // Get TrustToken contract
    const trustTokenAddress = "0xa6f8fC5b5A9B5670dF868247585bcD86eD124ba2";
    const TrustToken = await ethers.getContractFactory("TrustToken");
    const trustToken = TrustToken.attach(trustTokenAddress);
    
    // Check deployer's balance
    const deployerBalance = await trustToken.balanceOf(deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(deployerBalance), "TRUST");
    
    // Check user's current balance
    const userBalanceBefore = await trustToken.balanceOf(userAddress);
    console.log("💰 User balance before:", ethers.formatEther(userBalanceBefore), "TRUST");
    
    // Transfer tokens to user
    console.log("🔄 Transferring tokens...");
    const transferTx = await trustToken.transfer(userAddress, amountToSend);
    console.log("📝 Transfer transaction:", transferTx.hash);
    
    // Wait for confirmation
    const receipt = await transferTx.wait();
    console.log("✅ Transfer confirmed in block:", receipt.blockNumber);
    
    // Check user's new balance
    const userBalanceAfter = await trustToken.balanceOf(userAddress);
    console.log("💰 User balance after:", ethers.formatEther(userBalanceAfter), "TRUST");
    
    console.log("🎉 === TOKENS SENT SUCCESSFULLY ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
