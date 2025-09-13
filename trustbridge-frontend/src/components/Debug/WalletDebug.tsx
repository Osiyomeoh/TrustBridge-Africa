import React, { useState, useEffect } from 'react';

const WalletDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkWallet = async () => {
      const info: any = {
        hasEthereum: !!window.ethereum,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          info.accounts = accounts;
          info.accountsLength = accounts?.length || 0;
          
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          info.chainId = chainId;
          
          const networkVersion = await window.ethereum.request({ method: 'net_version' });
          info.networkVersion = networkVersion;
        } catch (error) {
          info.error = error.message;
        }
      }

      setDebugInfo(info);
    };

    checkWallet();
  }, []);

  const testConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connection test successful:', accounts);
        alert(`Connected: ${accounts[0]}`);
      } catch (error) {
        console.error('Connection test failed:', error);
        alert(`Connection failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-dark-gray border border-neon-green p-4 rounded-lg max-w-md text-xs">
      <h3 className="text-neon-green font-bold mb-2">Wallet Debug</h3>
      <pre className="text-electric-mint overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <button
        onClick={testConnection}
        className="mt-2 px-3 py-1 bg-neon-green text-black rounded text-xs hover:bg-electric-mint"
      >
        Test Connection
      </button>
    </div>
  );
};

export default WalletDebug;
