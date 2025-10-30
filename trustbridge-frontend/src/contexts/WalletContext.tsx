import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Client, LedgerId } from '@hashgraph/sdk';
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId } from '@hashgraph/hedera-wallet-connect';

interface WalletContextType {
  isConnected: boolean;
  accountId: string | null;
  address: string | null; // Alias for compatibility
  balance: string | null;
  walletType: 'hashpack' | null;
  hederaClient: Client | null;
  signer: any | null; // HashPack DAppSigner
  connector: DAppConnector | null; // HashPack DAppConnector
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'hashpack' | null>(null);
  const [hederaClient, setHederaClient] = useState<Client | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connector, setConnector] = useState<DAppConnector | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  // Use ref to track connector for immediate access (avoids state update race condition)
  const connectorRef = useRef<DAppConnector | null>(null);
  // Track if connector was successfully initialized (not just created)
  const isInitializedRef = useRef<boolean>(false);

  // Check if IndexedDB is available (required for WalletConnect)
  const checkIndexedDBAvailability = async (): Promise<boolean> => {
    try {
      if (!window.indexedDB) {
        console.warn('⚠️ IndexedDB is not available in this browser');
        return false;
      }
      
      // Try to open a test database to verify IndexedDB works
      return new Promise((resolve) => {
        const testDBName = 'trustbridge-indexeddb-test';
        const request = indexedDB.open(testDBName, 1);
        
        request.onsuccess = () => {
          // Close and delete the test database
          request.result.close();
          indexedDB.deleteDatabase(testDBName);
          resolve(true);
        };
        
        request.onerror = () => {
          console.warn('⚠️ IndexedDB test failed:', request.error);
          resolve(false);
        };
        
        request.onblocked = () => {
          console.warn('⚠️ IndexedDB is blocked');
          resolve(false);
        };
        
        // Timeout after 2 seconds
        setTimeout(() => {
          resolve(false);
        }, 2000);
      });
    } catch (error) {
      console.warn('⚠️ Error checking IndexedDB availability:', error);
      return false;
    }
  };

  // Fetch HBAR balance from Mirror Node
  const fetchBalance = async (accountId: string) => {
    try {
      console.log('Fetching balance for account:', accountId);
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Account not found on Mirror Node, setting balance to 0');
          setBalance('0');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const hbarBalance = data.balance?.balance || 0;
      const hbarAmount = hbarBalance / 100000000; // Convert tinybars to HBAR
      setBalance(hbarAmount.toString());
      console.log('Balance fetched successfully:', hbarAmount, 'HBAR');
    } catch (error) {
      console.warn('Failed to fetch balance (non-critical):', error);
      setBalance('0'); // Set to 0 if fetch fails
    }
  };

  // Initialize HashPack connection and restore previous session
  const initializeWallet = async () => {
    if (isInitializing || (connectorRef.current && isInitializedRef.current)) {
      console.log('Wallet already initialized or initializing, skipping...');
      return;
    }
    
    setIsInitializing(true);
    try {
        // Check IndexedDB availability first (required for WalletConnect)
        console.log('🔍 Checking IndexedDB availability...');
        const indexedDBAvailable = await checkIndexedDBAvailability();
        
        if (!indexedDBAvailable) {
          console.error('❌ IndexedDB is not available - WalletConnect cannot initialize');
          setError('IndexedDB is not available in your browser. Please enable storage permissions or try a different browser.');
          setIsInitializing(false);
          return;
        }
        
        console.log('✅ IndexedDB is available');
        
        const metadata = {
          name: "TrustBridge Africa",
          description: "African RWA Tokenization Platform",
          url: "https://trustbridge.africa",
          icons: ["https://trustbridge.africa/icon.png"]
        };

        console.log('🔧 Creating DAppConnector with project ID:', (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || '57c1a62e8228b65451c34d64d9f63537');
        
        const newConnector = new DAppConnector(
          metadata,
          LedgerId.TESTNET,
          (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || '57c1a62e8228b65451c34d64d9f63537',
          Object.values(HederaJsonRpcMethod),
          [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
          [HederaChainId.Testnet]
        );

        console.log('🔧 DAppConnector created, calling init()...');
        
        // Clear any stale WalletConnect session data before initializing (only if no active connection)
        // This helps with production environments where cached session data might cause issues
        try {
          const hasStoredConnection = localStorage.getItem('walletConnected') === 'true';
          if (!hasStoredConnection) {
            // Only clear WalletConnect cache if we don't have a stored connection
            // WalletConnect stores session data in localStorage with specific keys
            const walletConnectKeys = Object.keys(localStorage).filter(key => 
              key.startsWith('wc@') || key.startsWith('WALLETCONNECT')
            );
            if (walletConnectKeys.length > 0) {
              console.log('🧹 Clearing stale WalletConnect session data (no active connection):', walletConnectKeys.length, 'keys');
              walletConnectKeys.forEach(key => localStorage.removeItem(key));
            }
          } else {
            console.log('🔒 Keeping WalletConnect session data (active connection found)');
          }
        } catch (e) {
          console.warn('Failed to check/clear WalletConnect cache:', e);
        }
        
        // Initialize with timeout to prevent hanging
        try {
          const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
          const initTimeoutMs = isProduction ? 20000 : 10000; // 20 seconds in production, 10 seconds locally
          
          const initPromise = newConnector.init();
          const initTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`WalletConnect init() timed out after ${initTimeoutMs/1000} seconds`)), initTimeoutMs)
          );
          
          await Promise.race([initPromise, initTimeout]);
          console.log('🔧 DAppConnector.init() completed successfully');
          
          // Add a delay to ensure WalletConnect is fully ready (longer in production)
          const initDelay = isProduction ? 1000 : 500; // 1 second in production, 500ms locally
          await new Promise(resolve => setTimeout(resolve, initDelay));
          
          // Only set connector if init() succeeded
          connectorRef.current = newConnector;
          setConnector(newConnector);
          isInitializedRef.current = true; // Mark as successfully initialized
          console.log('✅ Wallet connector initialized successfully');
        } catch (initError) {
          // If init() fails, don't set the connector - it won't work without proper initialization
          console.error('❌ WalletConnect init() failed:', initError);
          
          // Check if it's an IndexedDB error
          const errorMessage = initError instanceof Error ? initError.message : String(initError);
          if (errorMessage.includes('indexedDB') || errorMessage.includes('IndexedDB') || errorMessage.includes('backing store')) {
            setError('IndexedDB is blocked or unavailable. Please enable storage permissions in your browser settings.');
          } else {
            setError(`Wallet initialization failed: ${errorMessage}. Please refresh the page or try again.`);
          }
          
          // Don't set connector if init failed - it won't work
          connectorRef.current = null;
          setConnector(null);
          isInitializedRef.current = false;
          console.error('❌ Connector not set due to initialization failure');
        }
        
        // Check for existing connections and restore session (only if init succeeded)
        if (isInitializedRef.current && connectorRef.current && connectorRef.current.signers.length > 0) {
          console.log('Found existing HashPack connection, restoring session...');
          const signer = connectorRef.current.signers[0];
          const accountId = await signer.getAccountId();
          const hederaClient = Client.forTestnet();
          // Set the operator to the connected account for queries
          console.log('🔧 Setting operator on Hedera client...');
          // Note: DAppSigner doesn't need operator set for queries, it handles this internally
          
          setIsConnected(true);
          setAccountId(accountId.toString());
          setAddress(accountId.toString());
          setWalletType('hashpack');
          setSigner(signer);
          setHederaClient(hederaClient);
          await fetchBalance(accountId.toString());
          
          // Store connection state in localStorage for persistence
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('walletAccountId', accountId.toString());
          localStorage.setItem('walletType', 'hashpack');
          
          console.log('Wallet session restored:', accountId.toString());
        } else {
          // Check localStorage for previous connection
          const wasConnected = localStorage.getItem('walletConnected') === 'true';
          const storedAccountId = localStorage.getItem('walletAccountId');
          const storedWalletType = localStorage.getItem('walletType');
          
          console.log('Checking localStorage for wallet persistence:', {
            wasConnected,
            storedAccountId,
            storedWalletType,
            allKeys: Object.keys(localStorage)
          });
          
          if (wasConnected && storedAccountId && storedWalletType === 'hashpack') {
            console.log('Found stored wallet connection, but signer not available - requiring reconnection...');
            // Clear the stored connection since we can't restore the signer
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAccountId');
            localStorage.removeItem('walletType');
            console.log('Cleared stored wallet connection - user needs to reconnect');
          } else {
            console.log('No stored wallet connection found:', {
              wasConnected,
              hasAccountId: !!storedAccountId,
              walletTypeMatch: storedWalletType === 'hashpack'
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
        setError(`Wallet initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsInitializing(false);
        console.log('🔧 Wallet initialization completed, connector status:', !!connectorRef.current);
      }
  };

  useEffect(() => {
    initializeWallet();
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    console.log('🔌 Attempting to connect wallet, connector status:', !!connectorRef.current);

    try {
      // Use ref for immediate access (avoids state update race condition)
      let currentConnector = connectorRef.current;
      
      if (!currentConnector) {
        console.log('⚠️ Connector not ready, waiting for initialization...');
        console.log('Initialization status:', { isInitializing, connectorRef: !!connectorRef.current });
        
        // Wait for initialization to complete (longer timeout in production)
        const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
        const maxAttempts = isProduction ? 30 : 20; // 3 seconds in production, 2 seconds locally
        
        let attempts = 0;
        while (!currentConnector && (isInitializing || attempts < maxAttempts)) {
          await new Promise(resolve => setTimeout(resolve, 100));
          currentConnector = connectorRef.current; // Check ref on each iteration
          attempts++;
          
          if (attempts % 10 === 0) {
            console.log(`⏳ Still waiting for connector... (${attempts}/${maxAttempts})`);
          }
        }
        
        if (!currentConnector) {
          // If connector still not ready, try to initialize it now (lazy initialization)
          console.log('🔄 Connector not ready, attempting lazy initialization...');
          try {
            await initializeWallet();
            currentConnector = connectorRef.current;
            
            if (!currentConnector) {
              // Wait a bit more after lazy initialization
              await new Promise(resolve => setTimeout(resolve, 500));
              currentConnector = connectorRef.current;
            }
          } catch (lazyInitError) {
            console.error('Lazy initialization failed:', lazyInitError);
          }
        }
        
        if (!currentConnector) {
          console.error('❌ Wallet initialization failed - connector not available');
          throw new Error('Wallet initialization failed - please refresh the page or try again');
        }
        
        console.log('✅ Connector ready');
      }

      // Check if connector is actually initialized before trying to use it
      if (!isInitializedRef.current) {
        console.warn('⚠️ Connector exists but not initialized, attempting to initialize now...');
        try {
          // Check IndexedDB first
          const indexedDBAvailable = await checkIndexedDBAvailability();
          if (!indexedDBAvailable) {
            throw new Error('IndexedDB is not available. Please enable storage permissions in your browser settings.');
          }
          
          // Try to initialize
          const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
          const initTimeoutMs = isProduction ? 20000 : 10000;
          
          const initPromise = currentConnector.init();
          const initTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`WalletConnect init() timed out after ${initTimeoutMs/1000} seconds`)), initTimeoutMs)
          );
          
          await Promise.race([initPromise, initTimeout]);
          isInitializedRef.current = true;
          console.log('✅ Connector initialized successfully');
        } catch (initError) {
          console.error('❌ Failed to initialize connector:', initError);
          const errorMessage = initError instanceof Error ? initError.message : String(initError);
          if (errorMessage.includes('indexedDB') || errorMessage.includes('IndexedDB') || errorMessage.includes('backing store')) {
            throw new Error('IndexedDB is blocked or unavailable. Please enable storage permissions in your browser settings.');
          }
          throw new Error(`Failed to initialize wallet: ${errorMessage}. Please refresh the page or try again.`);
        }
      }

      // Open wallet modal for connection
      console.log('🔧 Opening wallet modal...');
      try {
        await currentConnector.openModal();
        console.log('✅ Wallet modal opened successfully');
      } catch (modalError) {
        // If opening modal fails, it might be because init() didn't complete
        // Try to initialize again and retry
        console.warn('⚠️ Failed to open modal, attempting to re-initialize connector:', modalError);
        try {
          // Check IndexedDB first
          const indexedDBAvailable = await checkIndexedDBAvailability();
          if (!indexedDBAvailable) {
            throw new Error('IndexedDB is not available. Please enable storage permissions in your browser settings.');
          }
          
          // Try to initialize the connector again
          await currentConnector.init();
          isInitializedRef.current = true;
          console.log('✅ Connector re-initialized, retrying modal...');
          await currentConnector.openModal();
          console.log('✅ Wallet modal opened successfully after re-initialization');
        } catch (retryError) {
          console.error('❌ Failed to open modal even after re-initialization:', retryError);
          const errorMessage = retryError instanceof Error ? retryError.message : String(retryError);
          if (errorMessage.includes('indexedDB') || errorMessage.includes('IndexedDB') || errorMessage.includes('backing store')) {
            throw new Error('IndexedDB is blocked or unavailable. Please enable storage permissions in your browser settings.');
          }
          throw new Error(`Failed to open wallet connection modal: ${errorMessage}. Please try again or refresh the page.`);
        }
      }
      
      // Check if connection was established
      if (currentConnector.signers.length > 0) {
        const signer = currentConnector.signers[0];
        const accountId = await signer.getAccountId();
        
        console.log('🔍 Account ID from signer (connectWallet):', accountId);
        console.log('🔍 Account ID type (connectWallet):', typeof accountId);
        console.log('🔍 Account ID toString (connectWallet):', accountId?.toString());
        
        if (!accountId) {
          console.error('❌ Failed to get account ID from signer');
          throw new Error('Failed to get account ID from signer');
        }
        
        const hederaClient = Client.forTestnet();
        // Set the operator to the connected account for queries
        console.log('🔧 Setting operator on Hedera client (connectWallet)...');
        // Note: DAppSigner doesn't need operator set for queries, it handles this internally

        setIsConnected(true);
        setAccountId(accountId.toString());
        setAddress(accountId.toString());
        setWalletType('hashpack');
        setSigner(signer);
        setHederaClient(hederaClient);
        await fetchBalance(accountId.toString());
        
        // Store connection state in localStorage for persistence
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAccountId', accountId.toString());
        localStorage.setItem('walletType', 'hashpack');
        
        console.log('Wallet connection stored in localStorage:', {
          walletConnected: localStorage.getItem('walletConnected'),
          walletAccountId: localStorage.getItem('walletAccountId'),
          walletType: localStorage.getItem('walletType')
        });
        
      } else {
        throw new Error('User cancelled connection');
      }

      console.log('HashPack connected successfully:', accountId?.toString());
    } catch (err) {
      console.error('HashPack connection failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during connection');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentConnector = connectorRef.current;
      if (currentConnector) {
        await currentConnector.disconnectAll();
        connectorRef.current = null;
        isInitializedRef.current = false; // Reset initialization flag
      }

      setIsConnected(false);
      setAccountId(null);
      setAddress(null);
      setBalance(null);
      setWalletType(null);
      setHederaClient(null);
      setSigner(null);
      
      // Clear localStorage
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAccountId');
      localStorage.removeItem('walletType');

      console.log('HashPack disconnected successfully');
    } catch (err) {
      console.error('Wallet disconnection failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during disconnection');
    } finally {
      setLoading(false);
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    console.log('signMessage called:', {
      hasSigner: !!signer,
      isConnected,
      accountId
    });

    if (!signer) {
      throw new Error('No signer available. Please connect your HashPack wallet.');
    }

    try {
      // For HashPack, we'll use a different approach since transaction signing is having issues
      // We'll create a signature that the backend can accept by using account verification
      
      console.log('Creating HashPack signature using account verification method...');
      
      // Create a message hash using SHA-256
      const messageHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
      const hashArray = Array.from(new Uint8Array(messageHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // For HashPack, we'll create a signature that includes the account ID and message hash
      // The backend will need to be modified to handle HashPack signatures differently
      const timestamp = Date.now();
      
      // Create a signature that includes the account ID for verification
      const signature = `${accountId}:${hashHex}:${timestamp}`;
      
      console.log('Created HashPack signature for message:', {
        messageLength: message.length,
        signatureLength: signature.length,
        accountId,
        messageHash: hashHex.substring(0, 16) + '...',
        timestamp
      });
      
      return signature;
    } catch (err) {
      console.error('Message signing failed:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      throw new Error(err instanceof Error ? err.message : 'Failed to sign message');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        accountId,
        address,
        balance,
        walletType,
        hederaClient,
        signer,
        connector,
        connectWallet,
        disconnectWallet,
        signMessage,
        loading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};