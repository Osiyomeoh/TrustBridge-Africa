// AES shim for browser compatibility
import * as aes from 'aes-js';

// Export as default to match the expected import
export default aes;

// Also export named exports
export const { 
  ModeOfOperation, 
  utils, 
  padding, 
  pkcs7, 
  zero, 
  iso10126, 
  ansiX923 
} = aes;

// Export specific classes and functions that ethers needs
export const CTR = aes.ModeOfOperation.ctr;
export const CBC = aes.ModeOfOperation.cbc;
export const ECB = aes.ModeOfOperation.ecb;
export const CFB = aes.ModeOfOperation.cfb;
export const OFB = aes.ModeOfOperation.ofb;
export const pkcs7Strip = aes.padding.pkcs7.strip;
export const pkcs7Pad = aes.padding.pkcs7.pad;
