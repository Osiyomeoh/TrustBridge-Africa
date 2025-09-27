// BN.js shim for browser compatibility
import BN from 'bn.js';

// Export as default to match the expected import
export default BN;

// Also export named exports
export const { BN: BNClass } = BN;
