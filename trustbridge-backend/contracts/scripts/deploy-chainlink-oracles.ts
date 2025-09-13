import { ethers } from 'hardhat';
import { Contract } from 'ethers';

interface PriceFeedConfig {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  initialPrice: number;
  updateInterval: number; // seconds
}

const PRICE_FEEDS: PriceFeedConfig[] = [
  {
    name: 'Coffee Price Feed',
    symbol: 'COFFEE',
    decimals: 8,
    description: 'Coffee commodity price in USD',
    initialPrice: 3.50, // $3.50 per pound
    updateInterval: 3600, // 1 hour
  },
  {
    name: 'Wheat Price Feed',
    symbol: 'WHEAT',
    decimals: 8,
    description: 'Wheat commodity price in USD',
    initialPrice: 6.80, // $6.80 per bushel
    updateInterval: 3600,
  },
  {
    name: 'Corn Price Feed',
    symbol: 'CORN',
    decimals: 8,
    description: 'Corn commodity price in USD',
    initialPrice: 5.20, // $5.20 per bushel
    updateInterval: 3600,
  },
  {
    name: 'USD/HBAR Price Feed',
    symbol: 'USD_HBAR',
    decimals: 8,
    description: 'HBAR price in USD',
    initialPrice: 0.08, // $0.08 per HBAR
    updateInterval: 300, // 5 minutes
  },
  {
    name: 'USD/EUR Price Feed',
    symbol: 'USD_EUR',
    decimals: 8,
    description: 'EUR price in USD',
    initialPrice: 1.10, // $1.10 per EUR
    updateInterval: 300,
  },
  {
    name: 'Real Estate Index Feed',
    symbol: 'REAL_ESTATE_INDEX',
    decimals: 8,
    description: 'Real estate index in USD',
    initialPrice: 250000, // $250,000 average property value
    updateInterval: 86400, // 24 hours
  },
];

async function deployPriceFeed(config: PriceFeedConfig): Promise<string> {
  console.log(`\n📊 Deploying ${config.name}...`);
  
  // Deploy a simple price feed contract
  const PriceFeedFactory = await ethers.getContractFactory('MockPriceFeed');
  const priceFeed = await PriceFeedFactory.deploy(
    config.name,
    config.symbol,
    config.decimals,
    ethers.utils.parseUnits(config.initialPrice.toString(), config.decimals),
    config.updateInterval
  );
  
  await priceFeed.deployed();
  
  console.log(`✅ ${config.name} deployed to: ${priceFeed.address}`);
  console.log(`   Initial Price: $${config.initialPrice}`);
  console.log(`   Update Interval: ${config.updateInterval}s`);
  
  return priceFeed.address;
}

async function deployChainlinkVRF(): Promise<string> {
  console.log(`\n🎲 Deploying Chainlink VRF...`);
  
  // Deploy VRF coordinator
  const VRFCoordinatorFactory = await ethers.getContractFactory('MockVRFCoordinator');
  const vrfCoordinator = await VRFCoordinatorFactory.deploy();
  await vrfCoordinator.deployed();
  
  console.log(`✅ VRF Coordinator deployed to: ${vrfCoordinator.address}`);
  
  return vrfCoordinator.address;
}

async function deployWeatherOracle(): Promise<string> {
  console.log(`\n🌤️ Deploying Weather Oracle...`);
  
  // Deploy weather oracle
  const WeatherOracleFactory = await ethers.getContractFactory('MockWeatherOracle');
  const weatherOracle = await WeatherOracleFactory.deploy();
  await weatherOracle.deployed();
  
  console.log(`✅ Weather Oracle deployed to: ${weatherOracle.address}`);
  
  return weatherOracle.address;
}

async function deployLocationOracle(): Promise<string> {
  console.log(`\n📍 Deploying Location Oracle...`);
  
  // Deploy location oracle
  const LocationOracleFactory = await ethers.getContractFactory('MockLocationOracle');
  const locationOracle = await LocationOracleFactory.deploy();
  await locationOracle.deployed();
  
  console.log(`✅ Location Oracle deployed to: ${locationOracle.address}`);
  
  return locationOracle.address;
}

async function main() {
  console.log('🚀 Deploying Chainlink Oracles to Hedera Testnet');
  console.log('=' .repeat(60));
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);
  console.log(`Account balance: ${ethers.utils.formatEther(await deployer.getBalance())} HBAR`);
  
  const deployments: { [key: string]: string } = {};
  
  try {
    // Deploy all price feeds
    for (const config of PRICE_FEEDS) {
      const address = await deployPriceFeed(config);
      deployments[config.symbol] = address;
    }
    
    // Deploy VRF
    const vrfAddress = await deployChainlinkVRF();
    deployments['VRF_COORDINATOR'] = vrfAddress;
    
    // Deploy Weather Oracle
    const weatherAddress = await deployWeatherOracle();
    deployments['WEATHER_ORACLE'] = weatherAddress;
    
    // Deploy Location Oracle
    const locationAddress = await deployLocationOracle();
    deployments['LOCATION_ORACLE'] = locationAddress;
    
    // Save deployment addresses
    const deploymentData = {
      network: 'hedera_testnet',
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: deployments,
      priceFeeds: PRICE_FEEDS.map(config => ({
        symbol: config.symbol,
        address: deployments[config.symbol],
        name: config.name,
        decimals: config.decimals,
        initialPrice: config.initialPrice,
        updateInterval: config.updateInterval
      }))
    };
    
    // Write to file
    const fs = require('fs');
    const path = require('path');
    const deploymentPath = path.join(__dirname, '../deployments/chainlink-oracles.json');
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
    
    console.log('\n🎉 All Chainlink Oracles Deployed Successfully!');
    console.log('=' .repeat(60));
    console.log('📄 Deployment saved to:', deploymentPath);
    console.log('\n📊 Price Feeds:');
    PRICE_FEEDS.forEach(config => {
      console.log(`   ${config.symbol}: ${deployments[config.symbol]}`);
    });
    console.log('\n🔧 Oracles:');
    console.log(`   VRF Coordinator: ${deployments['VRF_COORDINATOR']}`);
    console.log(`   Weather Oracle: ${deployments['WEATHER_ORACLE']}`);
    console.log(`   Location Oracle: ${deployments['LOCATION_ORACLE']}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
