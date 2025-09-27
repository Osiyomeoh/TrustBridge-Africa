// PBKDF2 shim for browser compatibility
import * as pbkdf2 from 'pbkdf2';

// Export as default to match the expected import
export default pbkdf2;

// Also export named exports
export const { pbkdf2: pbkdf2Function, pbkdf2Sync } = pbkdf2;
