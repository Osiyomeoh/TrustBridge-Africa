// crypto-js shim for browser compatibility
import * as CryptoJS from 'crypto-js';

// Export as default to match the expected import
export default CryptoJS;

// Also export named exports
export const { 
  AES, 
  DES, 
  TripleDES, 
  Rabbit, 
  RC4, 
  MD5, 
  SHA1, 
  SHA256, 
  SHA224, 
  SHA512, 
  SHA384, 
  SHA3, 
  RIPEMD160, 
  enc, 
  mode, 
  pad, 
  format, 
  lib 
} = CryptoJS;
