const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Testing Trading Engine functionality...");
  
  const [deployer] = await ethers.getSigners();
  const userAddress = deployer.address;
  
  // Load deployment data
  const deployments = require('../deployments/trust-ecosystem.json');
  
  // Get contract addresses
  const trustTokenAddress = deployments.contracts.trustToken;
  const tradingEngineAddress = deployments.contracts.tradingEngine;
  const marketplaceAddress = deployments.contracts.trustMarketplace;
  
  console.log("User address:", userAddress);
  console.log("Trading Engine address:", tradingEngineAddress);
  console.log("Marketplace address:", marketplaceAddress);
  
  // Create contract instances
  const trustToken = await ethers.getContractAt("TrustToken", trustTokenAddress);
  const tradingEngine = await ethers.getContractAt("TradingEngine", tradingEngineAddress);
  const marketplace = await ethers.getContractAt("TRUSTMarketplace", marketplaceAddress);
  
  // Check if user has TRADER_ROLE
  const TRADER_ROLE = await tradingEngine.TRADER_ROLE();
  const hasTraderRole = await tradingEngine.hasRole(TRADER_ROLE, userAddress);
  console.log("User has TRADER_ROLE:", hasTraderRole);
  
  // Check TRUST token balance
  const balance = await trustToken.balanceOf(userAddress);
  console.log("TRUST balance:", ethers.formatEther(balance), "TRUST");
  
  // Get a known asset from marketplace (if any exist)
  console.log("\n🔍 Checking for existing marketplace listings...");
  
  // For now, let's try to create a simple order without asset ID
  console.log("\n🔄 Testing order creation...");
  
  try {
    // Create a test order with a dummy asset ID
    const testAssetId = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const orderPrice = ethers.parseEther("100000"); // 100K TRUST
    const orderQuantity = 1000; // Must be >= minOrderAmount (100)
    const orderExpiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    
    console.log("Creating order with parameters:");
    console.log("- Asset ID:", testAssetId);
    console.log("- Price:", ethers.formatEther(orderPrice), "TRUST");
    console.log("- Quantity:", orderQuantity);
    console.log("- Expiry:", new Date(orderExpiry * 1000).toISOString());
    
    // Deposit TRUST tokens into trading engine
    const depositAmount = BigInt(orderQuantity) * orderPrice; // Total amount needed
    const approveTx = await trustToken.approve(tradingEngineAddress, depositAmount);
    await approveTx.wait();
    console.log("✅ TRUST tokens approved for trading");
    
    const depositTx = await tradingEngine.deposit(trustTokenAddress, depositAmount);
    await depositTx.wait();
    console.log("✅ TRUST tokens deposited into trading engine");
    
    // Check balance after deposit
    const balance = await tradingEngine.balances(userAddress, trustTokenAddress);
    console.log("Balance in trading engine:", ethers.formatEther(balance), "TRUST");
    console.log("Required balance:", ethers.formatEther(depositAmount), "TRUST");
    console.log("Balance sufficient:", balance >= depositAmount);
    
    // Try to create order with correct parameters
    const createOrderTx = await tradingEngine.createOrder(
      trustTokenAddress, // tokenContract
      orderQuantity, // amount
      orderPrice, // price
      true, // isBuy
      orderExpiry // expiry
    );
    await createOrderTx.wait();
    console.log("✅ Order created successfully!");
    
    // Get order details
    const orderId = await tradingEngine.getOrderId(trustTokenAddress, userAddress, true);
    console.log("Order ID:", orderId);
    
    const order = await tradingEngine.orders(orderId);
    console.log("Order details:");
    console.log("- Token Contract:", order.tokenContract);
    console.log("- Trader:", order.trader);
    console.log("- Price:", ethers.formatEther(order.price), "TRUST");
    console.log("- Amount:", order.amount.toString());
    console.log("- Is Buy:", order.isBuy);
    console.log("- Is Active:", order.isActive);
    
  } catch (error) {
    console.error("❌ Order creation failed:", error.message);
    
    // Check if it's a provider issue
    if (error.message.includes("resolveName")) {
      console.log("\n🔍 This appears to be a provider compatibility issue");
      console.log("The TradingEngine might be using ENS resolution which isn't supported in Hardhat");
    }
    
    // Check if it's a contract issue
    if (error.message.includes("execution reverted")) {
      console.log("\n🔍 This appears to be a contract execution issue");
      console.log("The TradingEngine contract might have validation requirements");
    }
  }
  
  console.log("\n📊 Trading Engine Test Complete");
}

main().catch(console.error);
