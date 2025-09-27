// Scrypt shim for browser compatibility
import * as scrypt from 'scrypt-js';

// Export as default to match the expected import
export default scrypt;

// Also export named exports
export const { scrypt: scryptFunction, scryptSync } = scrypt;
