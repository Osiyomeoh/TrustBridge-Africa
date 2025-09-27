import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New contract addresses
const newAddresses = {
  coreAssetFactory: '0x930131a22b9D2e060d8E4EF1aE21185d4F59F52F'
};

// Update contracts.ts
const contractsPath = path.join(__dirname, 'src/config/contracts.ts');
let contractsContent = fs.readFileSync(contractsPath, 'utf8');

// Update coreAssetFactory address
contractsContent = contractsContent.replace(
  /coreAssetFactory:\s*'[^']*'/,
  `coreAssetFactory: '${newAddresses.coreAssetFactory}'`
);

fs.writeFileSync(contractsPath, contractsContent);
console.log('✅ Updated contracts.ts with new CoreAssetFactory address');

// Create a summary file
const summary = {
  timestamp: new Date().toISOString(),
  changes: {
    coreAssetFactory: {
      old: '0xF743D30062Bc04c69fC2F07F216C0357F0bDdb76',
      new: newAddresses.coreAssetFactory,
      reason: 'Fixed transferFrom issue, now uses transfer workflow'
    }
  },
  workflowChanges: [
    'Users now send TRUST tokens to contract first using transfer()',
    'Contract then transfers fee to fee recipient using transfer()',
    'Removed approval/transferFrom workflow that was failing'
  ],
  testing: {
    status: 'PASSED',
    notes: 'Digital asset creation now works correctly'
  }
};

fs.writeFileSync(
  path.join(__dirname, 'contract-update-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log('✅ Created contract-update-summary.json');
console.log('📋 Summary:');
console.log(JSON.stringify(summary, null, 2));
