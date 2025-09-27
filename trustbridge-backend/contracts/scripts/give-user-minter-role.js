const { ethers } = require("hardhat");

async function main() {
    console.log("🔑 === GIVING USER MINTER_ROLE ===");
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    
    // User address from the logs
    const userAddress = "0xa620f55Ec17bf98d9898E43878c22c10b5324069";
    
    console.log("🎯 Giving MINTER_ROLE to user:", userAddress);
    
    // Get TrustToken contract
    const trustTokenAddress = "0xa6f8fC5b5A9B5670dF868247585bcD86eD124ba2";
    const TrustToken = await ethers.getContractFactory("TrustToken");
    const trustToken = TrustToken.attach(trustTokenAddress);
    
    // Check if user already has MINTER_ROLE
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    const hasMinterRole = await trustToken.hasRole(MINTER_ROLE, userAddress);
    console.log("🔍 User currently has MINTER_ROLE:", hasMinterRole);
    
    if (hasMinterRole) {
        console.log("✅ User already has MINTER_ROLE, no action needed");
        return;
    }
    
    // Grant MINTER_ROLE to user
    console.log("🔄 Granting MINTER_ROLE to user...");
    const grantRoleTx = await trustToken.grantRole(MINTER_ROLE, userAddress);
    console.log("📝 Grant role transaction:", grantRoleTx.hash);
    
    // Wait for confirmation
    const receipt = await grantRoleTx.wait();
    console.log("✅ Role granted confirmed in block:", receipt.blockNumber);
    
    // Verify the role was granted
    const hasMinterRoleAfter = await trustToken.hasRole(MINTER_ROLE, userAddress);
    console.log("🔍 User now has MINTER_ROLE:", hasMinterRoleAfter);
    
    if (hasMinterRoleAfter) {
        console.log("🎉 === MINTER_ROLE GRANTED SUCCESSFULLY ===");
        console.log("💡 User can now mint TRUST tokens using the frontend!");
    } else {
        console.log("❌ Failed to grant MINTER_ROLE");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
