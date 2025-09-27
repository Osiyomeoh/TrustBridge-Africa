// BIP32 shim for browser compatibility
import * as bip32 from 'bip32';

// Export as default to match the expected import
export default bip32;

// Also export named exports
export const { BIP32Factory, fromSeed, fromBase58, fromPublicKey, fromPrivateKey } = bip32;
