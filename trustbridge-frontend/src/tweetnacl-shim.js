// TweetNacl shim for browser compatibility
import * as nacl from 'tweetnacl';

// Export as default to match the expected import
export default nacl;

// Also export named exports
export const {
  randomBytes,
  secretbox,
  box,
  sign,
  hash,
  verify,
  open,
  seal,
  signDetached,
  verifyDetached
} = nacl;
