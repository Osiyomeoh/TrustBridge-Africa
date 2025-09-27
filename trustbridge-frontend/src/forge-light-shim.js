// forge-light shim for browser compatibility
// This provides a minimal implementation of forge-light functionality

// Mock PEM functionality
export const pem = {
  encode: (obj) => {
    // Simple PEM encoding mock
    const header = `-----BEGIN ${obj.type || 'CERTIFICATE'}-----`;
    const footer = `-----END ${obj.type || 'CERTIFICATE'}-----`;
    const body = obj.body || '';
    return `${header}\n${body}\n${footer}`;
  },
  decode: (str) => {
    // Simple PEM decoding mock
    const lines = str.split('\n');
    const type = lines[0].replace('-----BEGIN ', '').replace('-----', '');
    const body = lines.slice(1, -1).join('');
    return { type, body };
  }
};

// Mock other forge-light exports
export const util = {
  encode64: (str) => btoa(str),
  decode64: (str) => atob(str),
  bytesToHex: (bytes) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''),
  hexToBytes: (hex) => {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  }
};

export const asn1 = {
  fromDer: (der) => ({ value: der }),
  toDer: (obj) => obj.value || new Uint8Array(0)
};

export const pki = {
  publicKeyFromPem: (pem) => ({ n: new Uint8Array(256), e: new Uint8Array(4) }),
  privateKeyFromPem: (pem) => ({ n: new Uint8Array(256), e: new Uint8Array(4), d: new Uint8Array(256) }),
  publicKeyToPem: (key) => pem.encode({ type: 'PUBLIC KEY', body: 'mock' }),
  privateKeyToPem: (key) => pem.encode({ type: 'PRIVATE KEY', body: 'mock' })
};

export const md = {
  sha1: { create: () => ({ update: () => {}, digest: () => new Uint8Array(20) }) },
  sha256: { create: () => ({ update: () => {}, digest: () => new Uint8Array(32) }) },
  sha512: { create: () => ({ update: () => {}, digest: () => new Uint8Array(64) }) }
};

export const random = {
  getBytesSync: (count) => new Uint8Array(count).map(() => Math.floor(Math.random() * 256))
};

// Default export
export default {
  pem,
  util,
  asn1,
  pki,
  md,
  random
};
