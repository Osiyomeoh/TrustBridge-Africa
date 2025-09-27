// WalletConnect types module shim
export const CHAIN_NAMESPACES = {
  EIP155: 'eip155',
  COSMOS: 'cosmos',
  SOLANA: 'solana',
  POLKADOT: 'polkadot',
  MULTIVERSX: 'multiversx',
  TRON: 'tron',
  TEZOS: 'tezos',
  KADENA: 'kadena',
  NEAR: 'near',
  CARDANO: 'cardano',
  HEDERA: 'hedera'
};

export const METHODS = {
  ETH_SEND_TRANSACTION: 'eth_sendTransaction',
  ETH_SIGN_TRANSACTION: 'eth_signTransaction',
  ETH_SIGN: 'eth_sign',
  PERSONAL_SIGN: 'personal_sign',
  ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4'
};

export const EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  MESSAGE: 'message'
};

export const RELAYER_EVENTS = {
  MESSAGE: 'relayer_message',
  CONNECT: 'relayer_connect',
  DISCONNECT: 'relayer_disconnect',
  ERROR: 'relayer_error'
};

export const SESSION_EVENTS = {
  PROPOSAL: 'session_proposal',
  CREATED: 'session_created',
  UPDATED: 'session_updated',
  DELETED: 'session_deleted',
  EXPIRED: 'session_expired',
  EVENT: 'session_event',
  REQUEST: 'session_request',
  RESPONSE: 'session_response',
  PING: 'session_ping',
  PONG: 'session_pong'
};

export const PROPOSAL_EVENTS = {
  CREATED: 'proposal_created',
  UPDATED: 'proposal_updated',
  DELETED: 'proposal_deleted',
  EXPIRED: 'proposal_expired'
};

export const AUTH_EVENTS = {
  REQUEST: 'auth_request',
  RESPONSE: 'auth_response'
};

export default {
  CHAIN_NAMESPACES,
  METHODS,
  EVENTS,
  RELAYER_EVENTS,
  SESSION_EVENTS,
  PROPOSAL_EVENTS,
  AUTH_EVENTS
};
