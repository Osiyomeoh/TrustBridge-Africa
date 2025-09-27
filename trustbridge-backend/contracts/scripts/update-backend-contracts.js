const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🔄 Updating Backend Contract Addresses...");

    // Read current deployment addresses
    const deploymentsPath = path.join(__dirname, '../deployments/trust-ecosystem.json');
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));

    // Read current backend service
    const backendServicePath = path.join(__dirname, '../../src/hedera/hedera.service.ts');
    let backendService = fs.readFileSync(backendServicePath, 'utf8');

    // Update contract addresses in backend service
    const newContracts = {
        trustToken: deployments.contracts.trustToken,
        assetNFT: deployments.contracts.assetNFT,
        verificationRegistry: deployments.contracts.verificationRegistry,
        assetFactory: deployments.contracts.coreAssetFactory, // Updated to coreAssetFactory
        attestorManager: deployments.contracts.attestorVerificationSystem,
        tradingEngine: deployments.contracts.tradingEngine,
        poolManager: deployments.contracts.poolManager,
        poolToken: deployments.contracts.poolToken,
        feeDistribution: deployments.contracts.feeDistribution,
        spvManager: deployments.contracts.spvManager,
        amcManager: deployments.contracts.amcManager,
        // Legacy contracts (deprecated)
        policyManager: '0x0000000000000000000000000000000000000000',
        settlementEngine: '0x0000000000000000000000000000000000000000',
        verificationBuffer: '0x0000000000000000000000000000000000000000',
        poolFactory: '0x0000000000000000000000000000000000000000',
    };

    // Create new contracts object string
    const contractsString = `  private readonly contracts = {
    trustToken: '${newContracts.trustToken}',
    assetNFT: '${newContracts.assetNFT}',
    verificationRegistry: '${newContracts.verificationRegistry}',
    assetFactory: '${newContracts.assetFactory}',
    attestorManager: '${newContracts.attestorManager}',
    tradingEngine: '${newContracts.tradingEngine}',
    poolManager: '${newContracts.poolManager}',
    poolToken: '${newContracts.poolToken}',
    feeDistribution: '${newContracts.feeDistribution}',
    spvManager: '${newContracts.spvManager}',
    amcManager: '${newContracts.amcManager}',
    // Legacy contracts (deprecated)
    policyManager: '${newContracts.policyManager}',
    settlementEngine: '${newContracts.settlementEngine}',
    verificationBuffer: '${newContracts.verificationBuffer}',
    poolFactory: '${newContracts.poolFactory}',
  };`;

    // Replace the contracts object in the service
    const contractsRegex = /private readonly contracts = \{[\s\S]*?\};/;
    backendService = backendService.replace(contractsRegex, contractsString);

    // Write updated service
    fs.writeFileSync(backendServicePath, backendService);

    console.log("✅ Backend contract addresses updated!");
    console.log("\n📋 Updated Contracts:");
    Object.entries(newContracts).forEach(([name, address]) => {
        console.log(`   ${name}: ${address}`);
    });

    // Create contract addresses file for frontend
    const frontendContractsPath = path.join(__dirname, '../../frontend-contracts.json');
    fs.writeFileSync(frontendContractsPath, JSON.stringify({
        network: deployments.network,
        timestamp: new Date().toISOString(),
        contracts: newContracts,
        configuration: deployments.configuration
    }, null, 2));

    console.log(`\n✅ Frontend contract addresses saved to: ${frontendContractsPath}`);

    console.log("\n🚨 CRITICAL BACKEND CHANGES REQUIRED:");
    console.log("1. ✅ Contract addresses updated");
    console.log("2. 🔄 Update API endpoints to use new contracts");
    console.log("3. 🔄 Update database schemas for new asset types");
    console.log("4. 🔄 Update verification workflows");
    console.log("5. 🔄 Update pool management logic");
    console.log("6. 🔄 Update trading engine integration");
    console.log("7. 🔄 Update fee distribution logic");
    console.log("8. 🔄 Update AMC management workflows");
}

main().catch(console.error);
