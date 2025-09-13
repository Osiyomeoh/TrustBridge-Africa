import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

interface AttestorInfo {
  name: string;
  country: string;
  stakeAmount: string;
  specialties: string[];
}

const INITIAL_ATTESTORS: AttestorInfo[] = [
  {
    name: "Kenya Agricultural Cooperative",
    country: "Kenya",
    stakeAmount: "1000", // 1000 HBAR
    specialties: ["AGRICULTURAL", "LAND_VERIFICATION"]
  },
  {
    name: "Nigeria Real Estate Board",
    country: "Nigeria", 
    stakeAmount: "2000", // 2000 HBAR
    specialties: ["REAL_ESTATE", "PROPERTY_VERIFICATION"]
  },
  {
    name: "South Africa Equipment Registry",
    country: "South Africa",
    stakeAmount: "1500", // 1500 HBAR
    specialties: ["EQUIPMENT", "MACHINERY_VERIFICATION"]
  },
  {
    name: "Ghana Financial Services",
    country: "Ghana",
    stakeAmount: "2500", // 2500 HBAR
    specialties: ["FINANCIAL", "COMPLIANCE_VERIFICATION"]
  },
  {
    name: "Ethiopia Development Agency",
    country: "Ethiopia",
    stakeAmount: "1800", // 1800 HBAR
    specialties: ["DEVELOPMENT", "INFRASTRUCTURE_VERIFICATION"]
  }
];

async function main() {
  console.log("👥 Setting up initial attestors for TrustBridge...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Load deployment info
  const networkName = await ethers.provider.getNetwork().then(n => n.name);
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log("Loaded deployment info for network:", networkName);
  
  // Connect to contracts
  const AttestorManager = await ethers.getContractFactory("AttestorManager");
  const attestorManager = AttestorManager.attach(deploymentInfo.contracts.AttestorManager.address);
  
  console.log("\n🔧 Registering initial attestors...");
  
  for (let i = 0; i < INITIAL_ATTESTORS.length; i++) {
    const attestor = INITIAL_ATTESTORS[i];
    
    // Generate a deterministic address for each attestor
    const attestorAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: await ethers.provider.getTransactionCount(deployer.address) + i
    });
    
    console.log(`\n📝 Registering ${attestor.name}...`);
    console.log(`   Address: ${attestorAddress}`);
    console.log(`   Country: ${attestor.country}`);
    console.log(`   Stake: ${attestor.stakeAmount} HBAR`);
    console.log(`   Specialties: ${attestor.specialties.join(", ")}`);
    
    try {
      const stakeAmount = ethers.parseEther(attestor.stakeAmount);
      
      const tx = await attestorManager.registerAttestor(
        attestorAddress,
        attestor.name,
        attestor.country,
        stakeAmount,
        { value: stakeAmount }
      );
      
      const receipt = await tx.wait();
      console.log(`   ✅ Registered successfully! Gas used: ${receipt?.gasUsed}`);
      
      // Verify registration
      const attestorInfo = await attestorManager.getAttestorInfo(attestorAddress);
      console.log(`   📊 Verification: Active=${attestorInfo.isActive}, Stake=${ethers.formatEther(attestorInfo.stakeAmount)} HBAR`);
      
    } catch (error) {
      console.error(`   ❌ Failed to register ${attestor.name}:`, error);
    }
  }
  
  console.log("\n🎉 Initial attestor setup completed!");
  console.log("\n📋 Summary:");
  console.log(`   Total attestors registered: ${INITIAL_ATTESTORS.length}`);
  console.log(`   Total stake committed: ${INITIAL_ATTESTORS.reduce((sum, a) => sum + parseFloat(a.stakeAmount), 0)} HBAR`);
  console.log(`   Countries covered: ${[...new Set(INITIAL_ATTESTORS.map(a => a.country))].join(", ")}`);
  
  console.log("\n🔗 Next Steps:");
  console.log("1. Verify attestors on Hedera Explorer");
  console.log("2. Set up attestor onboarding process");
  console.log("3. Create asset verification workflows");
  console.log("4. Launch TrustBridge platform!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
