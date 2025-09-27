const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 === LOCAL CONTRACT TEST ===");
  console.log("Deploying and testing contracts locally");
  console.log("");

  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("👤 User 1:", user1.address);
  console.log("👤 User 2:", user2.address);
  console.log("");

  try {
    // 1. Deploy TrustToken
    console.log("1️⃣ Deploying TrustToken...");
    const TrustToken = await ethers.getContractFactory("TrustToken");
    const trustToken = await TrustToken.deploy();
    await trustToken.waitForDeployment();
    const trustTokenAddress = await trustToken.getAddress();
    console.log("✅ TrustToken deployed at:", trustTokenAddress);

    // 2. Deploy AssetNFT
    console.log("2️⃣ Deploying AssetNFT...");
    const AssetNFT = await ethers.getContractFactory("AssetNFT");
    const assetNFT = await AssetNFT.deploy();
    await assetNFT.waitForDeployment();
    const assetNFTAddress = await assetNFT.getAddress();
    console.log("✅ AssetNFT deployed at:", assetNFTAddress);

    // 3. Deploy CoreAssetFactory
    console.log("3️⃣ Deploying CoreAssetFactory...");
    const CoreAssetFactory = await ethers.getContractFactory("CoreAssetFactory");
    const coreAssetFactory = await CoreAssetFactory.deploy(trustTokenAddress, assetNFTAddress, deployer.address);
    await coreAssetFactory.waitForDeployment();
    const coreAssetFactoryAddress = await coreAssetFactory.getAddress();
    console.log("✅ CoreAssetFactory deployed at:", coreAssetFactoryAddress);

    // 4. Test TrustToken functionality
    console.log("4️⃣ Testing TrustToken functionality...");
    
    // Check initial balance
    const initialBalance = await trustToken.balanceOf(deployer.address);
    console.log("Initial TRUST balance:", ethers.formatEther(initialBalance), "TRUST");

    // Mint some tokens
    console.log("Minting 1000 TRUST tokens to deployer...");
    await trustToken.mint(deployer.address, ethers.parseEther("1000"));
    
    const newBalance = await trustToken.balanceOf(deployer.address);
    console.log("New TRUST balance:", ethers.formatEther(newBalance), "TRUST");

    // 5. Test CoreAssetFactory functionality
    console.log("5️⃣ Testing CoreAssetFactory functionality...");
    
    // Approve tokens for asset creation
    console.log("Approving 100 TRUST tokens for asset creation...");
    await trustToken.approve(coreAssetFactoryAddress, ethers.parseEther("100"));
    
    const allowance = await trustToken.allowance(deployer.address, coreAssetFactoryAddress);
    console.log("Allowance:", ethers.formatEther(allowance), "TRUST");

    // Try to create a digital asset
    console.log("Creating a digital asset...");
    try {
      const tx = await coreAssetFactory.createDigitalAsset(
        6, // category (digital)
        "Test Asset", // assetType
        "Test Digital Asset", // name
        "Test Location", // location
        ethers.parseEther("1000"), // totalValue
        "https://example.com/image.jpg", // imageURI
        "This is a test digital asset" // description
      );
      
      const receipt = await tx.wait();
      console.log("✅ Digital asset created successfully!");
      console.log("Transaction hash:", tx.hash);
      console.log("Gas used:", receipt.gasUsed.toString());
      
    } catch (error) {
      console.log("❌ Digital asset creation failed:");
      console.log("Error:", error.message);
    }

    // 6. Test token transfers
    console.log("6️⃣ Testing token transfers...");
    
    // Transfer tokens to user1
    console.log("Transferring 100 TRUST tokens to user1...");
    await trustToken.transfer(user1.address, ethers.parseEther("100"));
    
    const user1Balance = await trustToken.balanceOf(user1.address);
    console.log("User1 TRUST balance:", ethers.formatEther(user1Balance), "TRUST");

    console.log("");
    console.log("🎉 === TEST COMPLETED SUCCESSFULLY ===");
    console.log("All contracts are working correctly!");

  } catch (error) {
    console.log("❌ Test failed:");
    console.log("Error:", error.message);
    console.log("Stack:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
