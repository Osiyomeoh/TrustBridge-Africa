// WalletConnect utils module shim
export const formatJsonRpcRequest = (id, method, params) => ({
  id,
  method,
  params
});

export const formatJsonRpcResponse = (id, result, error) => ({
  id,
  result,
  error
});

export const formatJsonRpcError = (id, error) => ({
  id,
  error
});

export const isJsonRpcRequest = (payload) => 
  payload && typeof payload === 'object' && 'method' in payload;

export const isJsonRpcResponse = (payload) => 
  payload && typeof payload === 'object' && ('result' in payload || 'error' in payload);

export const isJsonRpcError = (payload) => 
  payload && typeof payload === 'object' && 'error' in payload;

export const getError = (error) => ({
  code: error?.code || -32000,
  message: error?.message || 'Unknown error'
});

export const getBigIntRpcId = () => BigInt(Date.now());

export const getSdkError = (code, message) => ({
  code,
  message
});

export const parseConnectionError = (error) => ({
  code: error?.code || -32000,
  message: error?.message || 'Connection error'
});

export default {
  formatJsonRpcRequest,
  formatJsonRpcResponse,
  formatJsonRpcError,
  isJsonRpcRequest,
  isJsonRpcResponse,
  isJsonRpcError,
  getError,
  getBigIntRpcId,
  getSdkError,
  parseConnectionError
};
