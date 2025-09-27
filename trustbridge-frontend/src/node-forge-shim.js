// Node-forge browser shim for Hedera SDK compatibility
const forge = {
  // Basic crypto utilities
  util: {
    bytesToHex: (bytes) => {
      return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    },
    hexToBytes: (hex) => {
      const bytes = [];
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
      }
      return new Uint8Array(bytes);
    },
    createBuffer: (data) => {
      if (data instanceof Uint8Array) {
        return data;
      }
      if (typeof data === 'string') {
        return new TextEncoder().encode(data);
      }
      return new Uint8Array(data);
    }
  },
  
  // Mock crypto functions
  crypto: {
    createHash: (algorithm) => ({
      update: (data) => ({
        digest: (encoding) => {
          // Simple hash simulation
          const hash = new Uint8Array(32);
          for (let i = 0; i < data.length; i++) {
            hash[i % 32] ^= data[i];
          }
          return encoding === 'hex' ? 
            Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('') :
            hash;
        }
      })
    }),
    createHmac: (algorithm, key) => ({
      update: (data) => ({
        digest: (encoding) => {
          // Simple HMAC simulation
          const hash = new Uint8Array(32);
          for (let i = 0; i < data.length; i++) {
            hash[i % 32] ^= data[i] ^ key[i % key.length];
          }
          return encoding === 'hex' ? 
            Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('') :
            hash;
        }
      })
    })
  },
  
  // Mock RSA functionality
  rsa: {
    generateKeyPair: (bits, e) => {
      // Return mock key pair
      return {
        privateKey: 'mock-private-key',
        publicKey: 'mock-public-key'
      };
    },
    setPublicKey: (n, e) => ({
      encrypt: (data) => data, // Mock encryption
      verify: (data, signature) => true // Mock verification
    }),
    setPrivateKey: (n, e, d, p, q, dp, dq, qi) => ({
      decrypt: (data) => data, // Mock decryption
      sign: (data) => 'mock-signature' // Mock signing
    })
  },
  
  // Mock pki functionality
  pki: {
    publicKeyFromPem: (pem) => ({
      encrypt: (data) => data,
      verify: (data, signature) => true
    }),
    privateKeyFromPem: (pem) => ({
      decrypt: (data) => data,
      sign: (data) => 'mock-signature'
    }),
    rsa: {
      generateKeyPair: (bits, e) => ({
        privateKey: 'mock-private-key',
        publicKey: 'mock-public-key'
      })
    }
  },
  
  // Mock asn1 functionality
  asn1: {
    fromDer: (der) => ({
      value: der
    }),
    toDer: (obj) => obj.value || new Uint8Array(0)
  },
  
  // Mock md functionality
  md: {
    sha1: {
      create: () => ({
        update: (data) => ({
          digest: () => new Uint8Array(20)
        })
      })
    },
    sha256: {
      create: () => ({
        update: (data) => ({
          digest: () => new Uint8Array(32)
        })
      })
    }
  }
};

// Export both default and named exports
export default forge;
export { forge };
