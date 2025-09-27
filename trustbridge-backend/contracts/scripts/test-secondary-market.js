const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Testing Secondary Market (OpenSea + Centrifuge style)...");

    const [deployer, user1, user2, user3, inspector1] = await ethers.getSigners();
    console.log("Deployer (Admin/AMC/Legal/Inspector):", deployer.address);
    console.log("User 1 (Digital Artist):", user1.address);
    console.log("User 2 (Digital Buyer):", user2.address);
    console.log("User 3 (RWA Investor):", user3.address);
    console.log("Inspector 1 (for AMC):", inspector1.address);

    const deploymentsPath = path.join(__dirname, '../deployments/trust-ecosystem.json');
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));

    const trustTokenAddress = deployments.contracts.trustToken;
    const mandatoryAMCFactoryAddress = deployments.contracts.mandatoryAMCFactory;
    const assetNFTAddress = deployments.contracts.assetNFT;

    // Get contract instances
    const trustToken = await ethers.getContractAt("TrustToken", trustTokenAddress, deployer);
    const mandatoryAMCFactory = await ethers.getContractAt("MandatoryAMCFactory", mandatoryAMCFactoryAddress, deployer);
    const assetNFT = await ethers.getContractAt("AssetNFT", assetNFTAddress, deployer);

    // Ensure deployer has necessary roles for testing
    const VERIFIER_ROLE = await mandatoryAMCFactory.VERIFIER_ROLE();
    const AMC_ROLE = await mandatoryAMCFactory.AMC_ROLE();
    const LEGAL_ROLE = await mandatoryAMCFactory.LEGAL_ROLE();
    const INSPECTOR_ROLE = await mandatoryAMCFactory.INSPECTOR_ROLE();

    if (!(await mandatoryAMCFactory.hasRole(VERIFIER_ROLE, deployer.address))) {
        await mandatoryAMCFactory.grantRole(VERIFIER_ROLE, deployer.address);
        console.log("Granted VERIFIER_ROLE to deployer");
    }
    if (!(await mandatoryAMCFactory.hasRole(AMC_ROLE, deployer.address))) {
        await mandatoryAMCFactory.grantRole(AMC_ROLE, deployer.address);
        console.log("Granted AMC_ROLE to deployer");
    }
    if (!(await mandatoryAMCFactory.hasRole(LEGAL_ROLE, deployer.address))) {
        await mandatoryAMCFactory.grantRole(LEGAL_ROLE, deployer.address);
        console.log("Granted LEGAL_ROLE to deployer");
    }
    if (!(await mandatoryAMCFactory.hasRole(INSPECTOR_ROLE, deployer.address))) {
        await mandatoryAMCFactory.grantRole(INSPECTOR_ROLE, deployer.address);
        console.log("Granted INSPECTOR_ROLE to deployer");
    }

    // Mint TRUST tokens to users
    const mintAmount = ethers.parseEther("1000");
    await trustToken.mint(user1.address, mintAmount);
    await trustToken.mint(user2.address, mintAmount);
    await trustToken.mint(user3.address, mintAmount);
    console.log(`✅ Minted ${ethers.formatEther(mintAmount)} TRUST to all users`);

    // Users approve contract to spend TRUST tokens
    await trustToken.connect(user1).approve(mandatoryAMCFactoryAddress, ethers.parseEther("200"));
    await trustToken.connect(user2).approve(mandatoryAMCFactoryAddress, ethers.parseEther("200"));
    await trustToken.connect(user3).approve(mandatoryAMCFactoryAddress, ethers.parseEther("200"));
    console.log(`✅ Users approved contract to spend TRUST tokens`);

    // ============ DIGITAL ASSET SECONDARY MARKET (OpenSea-style) ============
    console.log("\n🎨 === DIGITAL ASSET SECONDARY MARKET (OpenSea-style) ===");

    // User 1 creates digital asset
    console.log("\n--- Step 1: Create Digital Asset ---");
    const digitalAssetData = {
        category: 6, // DIGITAL_ART
        assetTypeString: "African Digital Art",
        name: "Lagos Sunset",
        location: "Lagos, Nigeria",
        totalValue: ethers.parseEther("1000"), // 1,000 TRUST
        imageURI: "ipfs://digitalart",
        description: "A beautiful digital painting of Lagos sunset."
    };

    const createDigitalTx = await mandatoryAMCFactory.connect(user1).createDigitalAsset(
        digitalAssetData.category,
        digitalAssetData.assetTypeString,
        digitalAssetData.name,
        digitalAssetData.location,
        digitalAssetData.totalValue,
        digitalAssetData.imageURI,
        digitalAssetData.description
    );
    const createDigitalReceipt = await createDigitalTx.wait();
    const digitalAssetId = createDigitalReceipt.logs[0].args.assetId;
    console.log(`✅ Digital Asset created with ID: ${digitalAssetId} by User 1`);

    // User 1 lists digital asset for sale
    console.log("\n--- Step 2: List Digital Asset for Sale ---");
    const listingPrice = ethers.parseEther("1500"); // 1,500 TRUST
    const listingExpiry = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
    const listTx = await mandatoryAMCFactory.connect(user1).listDigitalAssetForSale(
        digitalAssetId,
        listingPrice,
        listingExpiry
    );
    await listTx.wait();
    console.log(`✅ Digital Asset ${digitalAssetId} listed for sale at ${ethers.formatEther(listingPrice)} TRUST`);

    // User 2 makes an offer
    console.log("\n--- Step 3: Make Offer on Digital Asset ---");
    const offerAmount = ethers.parseEther("1200"); // 1,200 TRUST offer
    const offerTx = await mandatoryAMCFactory.connect(user2).makeOfferOnDigitalAsset(
        digitalAssetId,
        { value: offerAmount }
    );
    await offerTx.wait();
    console.log(`✅ User 2 made offer of ${ethers.formatEther(offerAmount)} TRUST`);

    // Check offers
    const offers = await mandatoryAMCFactory.getDigitalAssetOffers(digitalAssetId);
    console.log(`   Current Buyer: ${offers.buyer}`);
    console.log(`   Current Offer: ${ethers.formatEther(offers.offer)} TRUST`);
    console.log(`   Listing Expiry: ${new Date(Number(offers.expiry) * 1000).toLocaleString()}`);

    // User 1 accepts the offer
    console.log("\n--- Step 4: Accept Offer ---");
    const acceptTx = await mandatoryAMCFactory.connect(user1).acceptOfferOnDigitalAsset(digitalAssetId);
    await acceptTx.wait();
    console.log(`✅ User 1 accepted User 2's offer`);

    // Check ownership change
    let digitalAsset = await mandatoryAMCFactory.getAsset(digitalAssetId);
    console.log(`   New Owner: ${digitalAsset.currentOwner}`);
    console.log(`   Trading Volume: ${ethers.formatEther(digitalAsset.tradingVolume)} TRUST`);
    console.log(`   Is Listed: ${digitalAsset.isListed}`);

    // User 2 lists the asset again
    console.log("\n--- Step 5: Re-list Asset ---");
    const newListingPrice = ethers.parseEther("1800"); // 1,800 TRUST
    const newListingExpiry = Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60); // 14 days from now
    const relistTx = await mandatoryAMCFactory.connect(user2).listDigitalAssetForSale(
        digitalAssetId,
        newListingPrice,
        newListingExpiry
    );
    await relistTx.wait();
    console.log(`✅ Digital Asset ${digitalAssetId} re-listed for sale at ${ethers.formatEther(newListingPrice)} TRUST`);

    // User 2 delists the asset
    console.log("\n--- Step 6: Delist Asset ---");
    const delistTx = await mandatoryAMCFactory.connect(user2).delistDigitalAsset(digitalAssetId);
    await delistTx.wait();
    console.log(`✅ Digital Asset ${digitalAssetId} delisted`);

    // Check final state
    digitalAsset = await mandatoryAMCFactory.getAsset(digitalAssetId);
    console.log(`   Is Listed: ${digitalAsset.isListed}`);
    console.log(`   Listing Price: ${ethers.formatEther(digitalAsset.listingPrice)} TRUST`);

    // ============ RWA SECONDARY MARKET (Centrifuge-style) ============
    console.log("\n🏢 === RWA SECONDARY MARKET (Centrifuge-style) ===");

    // User 1 creates RWA asset
    console.log("\n--- Step 1: Create RWA Asset ---");
    const rwaAssetData = {
        category: 0, // REAL_ESTATE
        assetTypeString: "Residential Villa",
        name: "Lagos Luxury Villa",
        location: "Lagos, Nigeria",
        totalValue: ethers.parseEther("500000"), // 500,000 TRUST
        maturityDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
        evidenceHashes: ["ipfs://hash1", "ipfs://hash2"],
        documentTypes: ["Deed", "Valuation Report"],
        imageURI: "ipfs://imagehash",
        documentURI: "ipfs://documenthash",
        description: "A luxurious villa in a prime Lagos location."
    };

    const createRWATx = await mandatoryAMCFactory.connect(user1).createRWAAsset(
        rwaAssetData.category,
        rwaAssetData.assetTypeString,
        rwaAssetData.name,
        rwaAssetData.location,
        rwaAssetData.totalValue,
        rwaAssetData.maturityDate,
        rwaAssetData.evidenceHashes,
        rwaAssetData.documentTypes,
        rwaAssetData.imageURI,
        rwaAssetData.documentURI,
        rwaAssetData.description
    );
    const createRWAReceipt = await createRWATx.wait();
    const rwaAssetId = createRWAReceipt.logs[0].args.assetId;
    console.log(`✅ RWA Asset created with ID: ${rwaAssetId} by User 1`);

    // Verify RWA asset
    console.log("\n--- Step 2: Verify RWA Asset ---");
    const verifyRWATx = await mandatoryAMCFactory.connect(deployer).verifyAsset(rwaAssetId, 1); // 1 = PROFESSIONAL
    await verifyRWATx.wait();
    console.log(`✅ RWA Asset ${rwaAssetId} verified to PROFESSIONAL level`);

    // User 1 selects AMC
    console.log("\n--- Step 3: Select AMC ---");
    const selectAMCTx = await mandatoryAMCFactory.connect(user1).selectAMC(rwaAssetId, deployer.address);
    await selectAMCTx.wait();
    console.log(`✅ User 1 selected AMC: ${deployer.address}`);

    // Complete inspection
    console.log("\n--- Step 4: Complete Inspection ---");
    const completeInspectionTx = await mandatoryAMCFactory.connect(inspector1).completeInspection(
        rwaAssetId,
        true, // passed
        "Asset matches description and documents.",
        "ipfs://inspectionreport"
    );
    await completeInspectionTx.wait();
    console.log(`✅ Inspection completed for RWA Asset ${rwaAssetId}`);

    // Initiate legal transfer
    console.log("\n--- Step 5: Initiate Legal Transfer ---");
    const initiateTransferTx = await mandatoryAMCFactory.connect(deployer).initiateLegalTransfer(rwaAssetId);
    await initiateTransferTx.wait();
    console.log(`✅ Legal transfer initiated for RWA Asset ${rwaAssetId}`);

    // Complete legal transfer
    console.log("\n--- Step 6: Complete Legal Transfer ---");
    await trustToken.connect(user1).approve(mandatoryAMCFactoryAddress, ethers.parseEther("50"));
    const completeTransferTx = await mandatoryAMCFactory.connect(deployer).completeLegalTransfer(
        rwaAssetId,
        "ipfs://legaldocument"
    );
    await completeTransferTx.wait();
    console.log(`✅ Legal transfer completed for RWA Asset ${rwaAssetId}`);

    // User 1 (now AMC) lists RWA shares for sale
    console.log("\n--- Step 7: List RWA Shares for Sale ---");
    const shares = ethers.parseEther("10000"); // 10,000 shares
    const pricePerShare = ethers.parseEther("50"); // 50 TRUST per share
    const listRWATx = await mandatoryAMCFactory.connect(user1).listRWASharesForSale(
        rwaAssetId,
        shares,
        pricePerShare
    );
    await listRWATx.wait();
    console.log(`✅ RWA shares listed: ${ethers.formatEther(shares)} shares at ${ethers.formatEther(pricePerShare)} TRUST per share`);

    // AMC approves the sale
    console.log("\n--- Step 8: AMC Approves Sale ---");
    const approveSaleTx = await mandatoryAMCFactory.connect(deployer).approveRWASale(
        rwaAssetId,
        true, // approved
        "Sale approved after review"
    );
    await approveSaleTx.wait();
    console.log(`✅ AMC approved RWA sale`);

    // User 3 buys RWA shares
    console.log("\n--- Step 9: Buy RWA Shares ---");
    const buyShares = ethers.parseEther("1000"); // 1,000 shares
    const totalPrice = buyShares * pricePerShare;
    const buyRWATx = await mandatoryAMCFactory.connect(user3).buyRWAShares(
        rwaAssetId,
        buyShares,
        pricePerShare,
        { value: totalPrice }
    );
    await buyRWATx.wait();
    console.log(`✅ User 3 bought ${ethers.formatEther(buyShares)} shares for ${ethers.formatEther(totalPrice)} TRUST`);

    // Check RWA asset state
    let rwaAsset = await mandatoryAMCFactory.getAsset(rwaAssetId);
    console.log(`   Current Owner: ${rwaAsset.currentOwner}`);
    console.log(`   Trading Volume: ${ethers.formatEther(rwaAsset.tradingVolume)} TRUST`);

    // ============ COMPARISON SUMMARY ============
    console.log("\n📊 === SECONDARY MARKET COMPARISON ===");

    console.log("\n🎨 Digital Asset Secondary Market (OpenSea-style):");
    console.log(`   Asset ID: ${digitalAssetId}`);
    console.log(`   Process: Instant listing, instant trading`);
    console.log(`   Approval: None required`);
    console.log(`   Time: Seconds`);
    console.log(`   Features: Offers, auctions, instant sales`);
    console.log(`   Target: Mass market, young users`);

    console.log("\n🏢 RWA Secondary Market (Centrifuge-style):");
    console.log(`   Asset ID: ${rwaAssetId}`);
    console.log(`   Process: AMC approval required`);
    console.log(`   Approval: Professional review`);
    console.log(`   Time: Days`);
    console.log(`   Features: Share trading, professional oversight`);
    console.log(`   Target: Serious investors, institutions`);

    console.log("\n🎯 Key Differences:");
    console.log("   • Digital: Instant, no approval, social features");
    console.log("   • RWA: Professional, AMC approval, compliance");
    console.log("   • Digital: Low fees, high volume");
    console.log("   • RWA: Higher fees, high value");
    console.log("   • Digital: Viral growth potential");
    console.log("   • RWA: Trust and credibility");

    console.log("\n🎉 Secondary Market Test Successful!");
    console.log("\n📋 Summary:");
    console.log("  ✅ Digital asset listing and trading");
    console.log("  ✅ Digital asset offers and acceptance");
    console.log("  ✅ RWA asset professional approval");
    console.log("  ✅ RWA shares listing and trading");
    console.log("  ✅ Both markets working independently");
    console.log("  ✅ Different approval processes");
    console.log("  ✅ Perfect for African market");

    console.log("\n🚀 Next Steps:");
    console.log("  1. Deploy to testnet");
    console.log("  2. Build secondary market UI");
    console.log("  3. Launch digital marketplace first");
    console.log("  4. Onboard RWA clients");
    console.log("  5. Scale both platforms");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
