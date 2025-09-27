import React, { useState, useEffect } from 'react';
import { Client, AccountId, AccountBalanceQuery, AccountInfoQuery, LedgerId, TransferTransaction, TokenId, TokenAssociateTransaction } from '@hashgraph/sdk';
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId } from '@hashgraph/hedera-wallet-connect';
// import { Web3Modal } from '@walletconnect/modal';

// Test configuration
const WALLETCONNECT_PROJECT_ID = "377d75bb6f86a2ffd427d032ff6ea7d3";
const HEDERA_NETWORK = "testnet";
const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com";

interface TestResult {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface TokenInfo {
  token_id: string;
  balance: number;
  name?: string;
  symbol?: string;
  type?: string;
  decimals?: string;
}

const HederaWalletTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<TestResult>({ type: 'info', message: 'Ready to test Hedera WalletConnect integration...' });
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [dappConnector, setDappConnector] = useState<DAppConnector | null>(null);
  const [hederaClient, setHederaClient] = useState<Client | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const updateStatus = (message: string, type: TestResult['type'] = 'info') => {
    setStatus({ type, message });
  };

  // Test 1: Library Loading
  const testLibraries = () => {
    addLog('Testing library loading...');
    
    try {
      // Test Hedera SDK
      if (typeof Client !== 'undefined') {
        addLog('✅ Hedera SDK: Loaded successfully');
        addLog(`   - Client: ${typeof Client}`);
        addLog(`   - AccountId: ${typeof AccountId}`);
      } else {
        addLog('❌ Hedera SDK: Failed to load');
        updateStatus('Hedera SDK failed to load', 'error');
        return;
      }

      // Test WalletConnect
      if (typeof DAppConnector !== 'undefined') {
        addLog('✅ Hedera WalletConnect: Loaded successfully');
        addLog(`   - DAppConnector: ${typeof DAppConnector}`);
      } else {
        addLog('❌ Hedera WalletConnect: Failed to load');
        updateStatus('Hedera WalletConnect failed to load', 'error');
        return;
      }

      // Web3Modal is not needed for basic Hedera operations
      addLog('ℹ️ Web3Modal: Not needed for basic Hedera operations');

      // Create Hedera client
      try {
        const client = Client.forTestnet();
        setHederaClient(client);
        addLog('✅ Hedera Client: Created successfully');
        updateStatus('All libraries loaded successfully!', 'success');
      } catch (error: any) {
        addLog(`❌ Hedera Client: ${error.message}`);
        updateStatus(`Hedera Client failed: ${error.message}`, 'error');
      }

    } catch (error: any) {
      addLog(`❌ Library test failed: ${error.message}`);
      updateStatus(`Library test failed: ${error.message}`, 'error');
    }
  };

  // Test 2: Configuration
  const testConfig = () => {
    addLog('Testing configuration...');
    
    const configs = [
      { name: 'WalletConnect Project ID', value: WALLETCONNECT_PROJECT_ID },
      { name: 'Hedera Network', value: HEDERA_NETWORK },
      { name: 'Mirror Node URL', value: MIRROR_NODE_URL }
    ];

    configs.forEach(config => {
      if (config.value) {
        addLog(`✅ ${config.name}: ${config.value}`);
      } else {
        addLog(`❌ ${config.name}: Missing`);
      }
    });

    addLog('Configuration test completed');
  };

  // Test 3: Mirror Node API
  const testMirrorNode = async () => {
    addLog('Testing Mirror Node API...');
    
    try {
      const testAccountId = '0.0.2'; // Hedera treasury account
      const response = await fetch(`${MIRROR_NODE_URL}/api/v1/accounts/${testAccountId}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Mirror Node API: Working`);
        addLog(`   Account: ${data.account}`);
        addLog(`   Balance: ${data.balance?.balance || 'N/A'}`);
        updateStatus('Mirror Node API working!', 'success');
      } else {
        addLog(`❌ Mirror Node API: HTTP ${response.status}`);
        updateStatus(`Mirror Node API failed: HTTP ${response.status}`, 'error');
      }
    } catch (error: any) {
      addLog(`❌ Mirror Node API: ${error.message}`);
      updateStatus(`Mirror Node API failed: ${error.message}`, 'error');
    }
  };

  // Test 4: Initialize WalletConnect
  const initWalletConnect = async () => {
    try {
      addLog('Initializing WalletConnect...');
      
      const metadata = {
        name: "Hedera WalletConnect Test",
        description: "Test application for Hedera wallet connection",
        url: window.location.origin,
        icons: [window.location.origin + "/logo192.png"],
      };

      const connector = new DAppConnector(
        metadata,
        LedgerId.fromString(HEDERA_NETWORK),
        WALLETCONNECT_PROJECT_ID,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [HederaChainId.Testnet]
      );

      await connector.init();
      setDappConnector(connector);
      
      addLog('✅ WalletConnect initialized successfully');
      updateStatus('WalletConnect initialized successfully!', 'success');
      
    } catch (error: any) {
      addLog(`❌ WalletConnect initialization failed: ${error.message}`);
      updateStatus(`WalletConnect initialization failed: ${error.message}`, 'error');
    }
  };

  // Test 5: Open Wallet Modal
  const openWalletModal = async () => {
    if (!dappConnector) {
      addLog('❌ WalletConnect not initialized');
      updateStatus('WalletConnect not initialized', 'error');
      return;
    }

    try {
      addLog('Opening wallet modal...');
      updateStatus('Opening wallet modal...', 'info');
      
      await dappConnector.openModal();
      addLog('✅ Wallet modal opened');
      
    } catch (error: any) {
      addLog(`❌ Failed to open wallet modal: ${error.message}`);
      updateStatus(`Failed to open wallet modal: ${error.message}`, 'error');
    }
  };

  // Test 6: Test Connection
  const testConnection = () => {
    addLog('Testing connection...');
    
    if (dappConnector && dappConnector.signers.length > 0) {
      const currentAccountId = dappConnector.signers[0].getAccountId().toString();
      setAccountId(currentAccountId);
      setIsConnected(true);
      
      addLog(`✅ Connected! Account: ${currentAccountId}`);
      updateStatus(`Connected! Account: ${currentAccountId}`, 'success');
    } else {
      addLog('❌ No active connection');
      updateStatus('No active connection', 'warning');
    }
  };

  // Test 7: Disconnect
  const disconnect = async () => {
    if (!dappConnector) return;

    try {
      addLog('Disconnecting...');
      updateStatus('Disconnecting...', 'info');
      
      await dappConnector.disconnectAll();
      
      setIsConnected(false);
      setAccountId(null);
      setAccountInfo(null);
      setTokens([]);
      
      addLog('✅ Disconnected successfully');
      updateStatus('Disconnected from wallet', 'info');
      
    } catch (error: any) {
      addLog(`❌ Disconnection failed: ${error.message}`);
      updateStatus(`Disconnection failed: ${error.message}`, 'error');
    }
  };

  // Test 8: Get Account Info
  const getAccountInfo = async () => {
    if (!accountId) return;

    try {
      addLog('Getting account information from Mirror Node...');
      
      // Use Mirror Node API instead of Hedera client to avoid operator requirement
      const response = await fetch(`${MIRROR_NODE_URL}/api/v1/accounts/${accountId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        const info = {
          accountId: data.account,
          balance: data.balance?.balance || '0',
          key: data.key ? (typeof data.key === 'string' ? data.key : JSON.stringify(data.key)) : 'Unknown',
          memo: data.memo || 'None',
          isDeleted: data.deleted || false,
          autoRenewPeriod: data.auto_renew_period || 'Unknown'
        };
        
        setAccountInfo(info);
        addLog('✅ Account information retrieved successfully from Mirror Node');
        updateStatus(`Account info retrieved for ${accountId}`, 'success');
      } else {
        addLog(`❌ Failed to get account info: HTTP ${response.status}`);
        updateStatus(`Failed to get account info: HTTP ${response.status}`, 'error');
      }
      
    } catch (error: any) {
      addLog(`❌ Failed to get account info: ${error.message}`);
      updateStatus(`Failed to get account info: ${error.message}`, 'error');
    }
  };

  // Test 9: Get Token Balances
  const getTokenBalances = async () => {
    if (!accountId) return;

    try {
      addLog('Getting token balances from Mirror Node...');
      
      const response = await fetch(`${MIRROR_NODE_URL}/api/v1/accounts/${accountId}/tokens?limit=100`);
      const data = await response.json();
      
      if (data.tokens && data.tokens.length > 0) {
        const tokenPromises = data.tokens.map(async (token: any) => {
          try {
            const tokenInfoResponse = await fetch(`${MIRROR_NODE_URL}/api/v1/tokens/${token.token_id}`);
            const tokenInfo = await tokenInfoResponse.json();
            
            return {
              token_id: token.token_id,
              balance: token.balance,
              name: tokenInfo.name || 'Unknown',
              symbol: tokenInfo.symbol || 'N/A',
              type: tokenInfo.type || 'Unknown',
              decimals: tokenInfo.decimals
            };
          } catch (error) {
            return {
              token_id: token.token_id,
              balance: token.balance,
              name: 'Unknown',
              symbol: 'N/A',
              type: 'Unknown'
            };
          }
        });
        
        const tokenInfos = await Promise.all(tokenPromises);
        setTokens(tokenInfos);
        addLog(`✅ Found ${tokenInfos.length} tokens`);
      } else {
        setTokens([]);
        addLog('No tokens found');
      }
      
    } catch (error: any) {
      addLog(`❌ Failed to get token balances: ${error.message}`);
      updateStatus(`Failed to get token balances: ${error.message}`, 'error');
    }
  };

  // Test 10: Test HBAR Transfer (simulation)
  const testTransfer = () => {
    if (!accountId) return;

    try {
      addLog('Testing HBAR transfer (simulation)...');
      
      const toAddress = AccountId.fromString("0.0.2"); // Treasury account
      const amount = 1; // 1 tinybar
      
      const transferTransaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(accountId), -amount)
        .addHbarTransfer(toAddress, amount);
      
      addLog(`✅ Transfer transaction created: ${amount} tinybar to ${toAddress.toString()}`);
      addLog('Note: This is a simulation. In production, you would sign and execute the transaction.');
      
      updateStatus('Transfer simulation completed', 'success');
      
    } catch (error: any) {
      addLog(`❌ Transfer test failed: ${error.message}`);
      updateStatus(`Transfer test failed: ${error.message}`, 'error');
    }
  };

  // Auto-run library test on mount
  useEffect(() => {
    testLibraries();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1>🔗 Hedera WalletConnect Integration Test</h1>
        <p>Test Hedera wallet connection using your existing WalletConnect implementation with local libraries.</p>
        
        <div style={{ 
          padding: '15px', 
          borderRadius: '6px', 
          margin: '10px 0', 
          fontWeight: 'bold',
          backgroundColor: status.type === 'success' ? '#d4edda' : 
                          status.type === 'error' ? '#f8d7da' : 
                          status.type === 'warning' ? '#fff3cd' : '#d1ecf1',
          color: status.type === 'success' ? '#155724' : 
                 status.type === 'error' ? '#721c24' : 
                 status.type === 'warning' ? '#856404' : '#0c5460',
          border: `1px solid ${status.type === 'success' ? '#c3e6cb' : 
                              status.type === 'error' ? '#f5c6cb' : 
                              status.type === 'warning' ? '#ffeaa7' : '#bee5eb'}`
        }}>
          {status.message}
        </div>
        
        <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '15px', margin: '10px 0' }}>
          <h4>1. Library & Environment Tests</h4>
          <button 
            onClick={testLibraries}
            style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', margin: '5px' }}
          >
            Test Library Loading
          </button>
          <button 
            onClick={testConfig}
            disabled={!hederaClient}
            style={{ background: hederaClient ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: hederaClient ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Test Configuration
          </button>
          <button 
            onClick={testMirrorNode}
            disabled={!hederaClient}
            style={{ background: hederaClient ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: hederaClient ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Test Mirror Node
          </button>
        </div>
        
        <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '15px', margin: '10px 0' }}>
          <h4>2. WalletConnect Integration Tests</h4>
          <button 
            onClick={initWalletConnect}
            disabled={!hederaClient}
            style={{ background: hederaClient ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: hederaClient ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Initialize WalletConnect
          </button>
          <button 
            onClick={openWalletModal}
            disabled={!dappConnector}
            style={{ background: dappConnector ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: dappConnector ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Open Wallet Modal
          </button>
          <button 
            onClick={testConnection}
            disabled={!dappConnector}
            style={{ background: dappConnector ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: dappConnector ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Test Connection
          </button>
          <button 
            onClick={disconnect}
            disabled={!isConnected}
            style={{ background: isConnected ? '#dc3545' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: isConnected ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Disconnect
          </button>
        </div>
        
        <div style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '15px', margin: '10px 0' }}>
          <h4>3. Hedera Operations Tests</h4>
          <button 
            onClick={getAccountInfo}
            disabled={!isConnected}
            style={{ background: isConnected ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: isConnected ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Get Account Info
          </button>
          <button 
            onClick={getTokenBalances}
            disabled={!isConnected}
            style={{ background: isConnected ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: isConnected ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Get Token Balances
          </button>
          <button 
            onClick={testTransfer}
            disabled={!isConnected}
            style={{ background: isConnected ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: isConnected ? 'pointer' : 'not-allowed', margin: '5px' }}
          >
            Test HBAR Transfer
          </button>
        </div>
        
        {accountInfo && (
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', margin: '10px 0' }}>
            <h3>Account Information</h3>
            <div>
              <strong>Account ID:</strong> {accountInfo.accountId}<br/>
              <strong>Balance:</strong> {accountInfo.balance} HBAR<br/>
              <strong>Key:</strong> {accountInfo.key}<br/>
              <strong>Memo:</strong> {accountInfo.memo}<br/>
              <strong>Is Deleted:</strong> {accountInfo.isDeleted ? 'Yes' : 'No'}<br/>
              <strong>Auto Renew Period:</strong> {accountInfo.autoRenewPeriod}
            </div>
          </div>
        )}
        
        {tokens.length > 0 && (
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', margin: '10px 0' }}>
            <h3>Token Balances</h3>
            {tokens.map((token, index) => (
              <div key={index} style={{ background: '#e9ecef', padding: '10px', margin: '5px 0', borderRadius: '4px', borderLeft: '4px solid #007bff' }}>
                <strong>{token.name}</strong> ({token.symbol})
                <br/>Token ID: {token.token_id}
                <br/>Balance: {token.balance}
                <br/>Type: {token.type}
                {token.decimals && <><br/>Decimals: {token.decimals}</>}
              </div>
            ))}
          </div>
        )}
        
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', margin: '10px 0' }}>
          <h3>Debug Logs</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '6px', 
            fontFamily: 'monospace', 
            whiteSpace: 'pre-wrap', 
            maxHeight: '300px', 
            overflowY: 'auto',
            fontSize: '12px'
          }}>
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HederaWalletTest;
