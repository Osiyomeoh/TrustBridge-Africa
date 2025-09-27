// Elliptic shim for browser compatibility
import * as elliptic from 'elliptic';

// Export as default to match the expected import
export default elliptic;

// Also export named exports
export const { ec, eddsa, curves, rand } = elliptic;
