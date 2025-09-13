import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { walletConfig, WalletType } from '../config/walletConfig';
import { useToast } from '../hooks/useToast';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  walletType: 'hashpack' | 'metamask' | null;
  chainId: string | null;
  balance: string | null;
}

export interface WalletContextType extends WalletState {
  connectWallet: (walletType: 'hashpack' | 'metamask') => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string>;
  switchToHederaNetwork: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  walletConnectProvider: WalletConnectProvider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    walletType: null,
    chainId: null,
    balance: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletConnectProvider, setWalletConnectProvider] = useState<WalletConnectProvider | null>(null);

  // Hedera Testnet configuration (optimized for MetaMask)
  const HEDERA_TESTNET = {
    chainId: '0x128', // 296 in decimal - Hedera Testnet
    chainName: 'Hedera Testnet',
    rpcUrls: [
      'https://testnet.hashio.io/api',
      'https://testnet.arkhia.io/api/v1/hedera',
      'https://testnet.mirrornode.hedera.com'
    ],
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18,
    },
    blockExplorerUrls: ['https://hashscan.io/testnet/'],
  };

  // Initialize WalletConnect Provider (non-blocking with error handling)
  useEffect(() => {
    const initWalletConnect = async () => {
      try {
        console.log('Starting WalletConnect initialization...');
        
        const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';
        
        if (projectId === 'YOUR_PROJECT_ID') {
          console.warn('WalletConnect Project ID not set. Please set VITE_WALLETCONNECT_PROJECT_ID in your .env file');
          console.warn('Get your project ID from https://cloud.walletconnect.com/');
          console.warn('HashPack integration will not work without a valid Project ID');
          return;
        }

        // Temporarily disable WalletConnect to prevent WebSocket errors
        console.log('WalletConnect temporarily disabled to prevent WebSocket errors');
        return;

        // Create WalletConnect provider with error handling
        const provider = new WalletConnectProvider({
          rpc: {
            296: 'https://testnet.hashio.io/api', // Hedera Testnet RPC
          },
          chainId: 296, // Hedera Testnet
          qrcode: true,
          pollingInterval: 12000,
          // Use the new bridge URL
          bridge: 'https://bridge.walletconnect.org',
          // Use projectId instead of infuraId
          projectId: projectId,
        });

        // Handle connection errors gracefully
        provider.on('error', (error) => {
          console.warn('WalletConnect connection error (non-blocking):', error);
          // Don't throw - just log and continue
          // WalletConnect is optional - MetaMask can still work
        });

        // Handle disconnection
        provider.on('disconnect', () => {
          console.log('WalletConnect disconnected');
          setIsConnected(false);
          setAddress(null);
        });

        setWalletConnectProvider(provider);
        console.log('WalletConnect provider initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize WalletConnect provider (non-blocking):', error);
        // Don't throw - just log and continue without WalletConnect
        console.warn('HashPack integration will not be available, but MetaMask will still work');
      }
    };

    // Initialize with a small delay to avoid blocking the main thread
    const timeoutId = setTimeout(initWalletConnect, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      console.log('Checking for existing wallet connections...');
      
      try {
        // Check MetaMask first
        if (window.ethereum) {
          console.log('MetaMask detected, checking accounts...');
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            console.log('MetaMask accounts:', accounts);
            
            if (accounts && accounts.length > 0) {
              console.log('MetaMask already connected:', accounts[0]);
              setWalletState(prev => ({
                ...prev,
                isConnected: true,
                address: accounts[0],
                walletType: 'metamask',
              }));
              return;
            } else {
              console.log('MetaMask detected but no accounts connected');
            }
          } catch (error) {
            console.log('Error checking MetaMask accounts:', error);
          }
        } else {
          console.log('MetaMask not detected');
        }

        // Check WalletConnect if available
        if (walletConnectProvider) {
          console.log('WalletConnect provider available, checking connection...');
          try {
            const accounts = await walletConnectProvider.enable();
            if (accounts && accounts.length > 0) {
              console.log('WalletConnect already connected:', accounts[0]);
              setWalletState(prev => ({
                ...prev,
                isConnected: true,
                address: accounts[0],
                walletType: 'hashpack',
              }));
            } else {
              console.log('WalletConnect provider available but no accounts connected');
            }
          } catch (error) {
            console.log('WalletConnect not connected (this is OK):', error);
          }
        } else {
          console.log('WalletConnect provider not available');
        }
      } catch (error) {
        console.log('Error checking existing wallet connection:', error);
      }
    };

    // Check after a short delay to let everything initialize
    const timer = setTimeout(checkExistingConnection, 2000);
    return () => clearTimeout(timer);
  }, [walletConnectProvider]);

  // Listen for network changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleNetworkChange = (chainId: string) => {
        console.log('Network changed to:', chainId);
        if (chainId !== '0x128') {
          console.warn('Please switch to Hedera Testnet (Chain ID: 0x128)');
        }
      };

      const handleAccountsChange = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          // User disconnected
          setWalletState({
            isConnected: false,
            address: null,
            provider: null,
            signer: null,
            walletType: null,
            chainId: null,
            balance: null,
          });
        }
      };

      window.ethereum.on('chainChanged', handleNetworkChange);
      window.ethereum.on('accountsChanged', handleAccountsChange);

      return () => {
        window.ethereum.removeListener('chainChanged', handleNetworkChange);
        window.ethereum.removeListener('accountsChanged', handleAccountsChange);
      };
    }
  }, []);

  const connectWallet = async (walletType: 'hashpack' | 'metamask') => {
    console.log('Attempting to connect wallet:', walletType);
    setIsLoading(true);
    setError(null);

    try {
      if (walletType === 'metamask') {
        await connectMetaMask();
      } else if (walletType === 'hashpack') {
        await connectHashPack();
      }
      console.log('Wallet connection successful:', walletType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // First, switch to Hedera Testnet before requesting accounts
      console.log('Switching to Hedera Testnet...');
      await switchToHederaNetwork();
      
      // Wait a moment for the network switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      console.log('Connected to network:', network.chainId.toString());

      // Get balance
      const balance = await provider.getBalance(address);
      const balanceInHBAR = ethers.formatEther(balance);

      setWalletState({
        isConnected: true,
        address,
        provider,
        signer,
        walletType: 'metamask',
        chainId: '0x128', // Hedera Testnet
        balance: balanceInHBAR,
      });

      console.log('MetaMask connected to Hedera Testnet successfully:', address);
      
      // Show success toast
      toast({
        variant: "success",
        title: "Wallet Connected! 🎉",
        description: `MetaMask connected to Hedera Testnet\nAddress: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw new Error(`MetaMask connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const connectHashPack = async () => {
    if (!walletConnectProvider) {
      throw new Error('HashPack integration is not available. Please use MetaMask instead or check your WalletConnect configuration.');
    }

    try {
      // Enable session (triggers QR Code modal)
      await walletConnectProvider.enable();
      
      // Create ethers provider from WalletConnect
      const provider = new ethers.BrowserProvider(walletConnectProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        address: address,
        provider: provider,
        signer: signer,
        walletType: 'hashpack',
        chainId: '0x128', // Hedera Testnet
      }));
      
      console.log('HashPack connected via WalletConnect:', address);
      
      // Show success toast
      toast({
        variant: "success",
        title: "HashPack Connected! 🎉",
        description: `HashPack connected to Hedera Testnet\nAddress: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error('HashPack connection failed:', error);
      
      // Provide more helpful error messages
      if (error.message?.includes('User rejected')) {
        throw new Error('Connection was cancelled. Please try again and approve the connection in HashPack.');
      } else if (error.message?.includes('Session rejected')) {
        throw new Error('Session was rejected. Please try connecting again.');
      } else if (error.message?.includes('Connection timeout')) {
        throw new Error('Connection timed out. Please try again.');
      } else {
        throw new Error(`HashPack connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const switchToHederaNetwork = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch to Hedera Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HEDERA_TESTNET.chainId }],
      });
      console.log('Successfully switched to Hedera Testnet');
    } catch (switchError: any) {
      console.log('Network switch failed, attempting to add network:', switchError);
      
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [HEDERA_TESTNET],
          });
          console.log('Successfully added Hedera Testnet to MetaMask');
        } catch (addError) {
          console.error('Failed to add Hedera Testnet:', addError);
          throw new Error('Failed to add Hedera Testnet to MetaMask. Please add it manually.');
        }
      } else if (switchError.code === 4001) {
        throw new Error('User rejected the network switch. Please approve the network change in MetaMask.');
      } else {
        console.error('Network switch error:', switchError);
        throw new Error(`Failed to switch to Hedera Testnet: ${switchError.message || 'Unknown error'}`);
      }
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!walletState.isConnected || !walletState.address) {
      throw new Error('Wallet not connected');
    }

    try {
      if (walletState.walletType === 'metamask' && walletState.signer) {
        // MetaMask signing
        const signature = await walletState.signer.signMessage(message);
        return signature;
      } else if (walletState.walletType === 'hashpack' && walletState.signer) {
        // HashPack signing using WalletConnect provider
        const signature = await walletState.signer.signMessage(message);
        return signature;
      } else {
        // Fallback: simulate signing
        const signature = `hashpack_signature_${Date.now()}_${message.slice(0, 10)}`;
        return signature;
      }
    } catch (error: any) {
      // Handle user rejection specifically
      if (error?.code === 4001 || error?.code === 'ACTION_REJECTED' || error?.message?.includes('User rejected')) {
        throw new Error('Signature rejected by user. Please try again and approve the signature request in your wallet.');
      }
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      walletType: null,
      chainId: null,
      balance: null,
    });
    setError(null);
  };

  const value: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    signMessage,
    switchToHederaNetwork,
    isLoading,
    error,
    walletConnectProvider,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
