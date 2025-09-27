// js-sha3 shim for browser compatibility
import * as sha3 from 'js-sha3';

// Export as default to match the expected import
export default sha3;

// Also export named exports
export const { 
  sha3_224, 
  sha3_256, 
  sha3_384, 
  sha3_512, 
  keccak_224, 
  keccak_256, 
  keccak_384, 
  keccak_512, 
  shake_128, 
  shake_256 
} = sha3;
