import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  isConnected: boolean;
  accountId: string | null;
  address: string | null; // Add address alias for compatibility
  balance: string | null;
  walletType: 'metamask' | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connectWallet: (type: 'metamask') => Promise<void>;
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
  const [walletType, setWalletType] = useState<'metamask' | 'hashpack' | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address);
      const balanceInEther = ethers.formatEther(balance);
      setBalance(balanceInEther);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('0');
    }
  };

  // No HashConnect initialization needed - using MetaMask only

  // Check for existing connections
  useEffect(() => {
    const checkExistingConnections = () => {
      // Check MetaMask
      if (window.ethereum && window.ethereum.isMetaMask) {
        const accounts = window.ethereum.selectedAddress;
        if (accounts) {
          setIsConnected(true);
          setAccountId(accounts);
          setAddress(accounts); // Set address as well
          setWalletType('metamask');
          setProvider(new ethers.BrowserProvider(window.ethereum));
        }
      }

      // HashPack disabled - using MetaMask only
    };

    checkExistingConnections();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setIsConnected(false);
        setAccountId(null);
        setAddress(null);
        setWalletType(null);
        setProvider(null);
        setSigner(null);
        setBalance(null);
      } else {
        // User switched accounts
        const newAddress = accounts[0];
        setIsConnected(true);
        setAccountId(newAddress);
        setAddress(newAddress);
        setWalletType('metamask');
        setProvider(new ethers.BrowserProvider(window.ethereum));
        // Fetch new balance
        if (window.ethereum) {
          fetchBalance(new ethers.BrowserProvider(window.ethereum), newAddress);
        }
      }
    };

    // Listen for chain changes
    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const connectWallet = async (type: 'metamask') => {
    setLoading(true);
    setError(null);

    try {
      if (type === 'metamask') {
        await connectMetaMask();
      } else {
        throw new Error('Only MetaMask is supported');
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during connection');
    } finally {
      setLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask extension.');
    }

    try {
      // Check current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const hederaChainId = '0x128'; // 296 in hex

      if (chainId !== hederaChainId) {
        // Switch to Hedera Testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hederaChainId }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: hederaChainId,
                chainName: 'Hedera Testnet',
                nativeCurrency: {
                  name: 'HBAR',
                  symbol: 'HBAR',
                  decimals: 18,
                },
                rpcUrls: ['https://testnet.hashio.io/api'],
                blockExplorerUrls: ['https://hashscan.io/testnet'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setIsConnected(true);
      setAccountId(accounts[0]);
      setAddress(accounts[0]);
      setWalletType('metamask');
      setProvider(provider);
      setSigner(signer);

      // Fetch balance
      await fetchBalance(provider, accounts[0]);

      console.log('MetaMask connected successfully to Hedera Testnet:', accounts[0]);

    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw error;
    }
  };

  // HashPack connection removed - using MetaMask only

  const disconnectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      // MetaMask doesn't have a disconnect method in the standard
      // Just clear the local state

      setIsConnected(false);
      setAccountId(null);
      setAddress(null);
      setBalance(null);
      setWalletType(null);
      setProvider(null);
      setSigner(null);

      console.log('Wallet disconnected');
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
      hasProvider: !!provider,
      isConnected,
      address
    });

    if (!signer) {
      // Try to get signer from provider if available
      if (provider) {
        console.log('No signer available, attempting to get signer from provider...');
        try {
          const newSigner = await provider.getSigner();
          console.log('Successfully obtained signer from provider:', !!newSigner);
          const signature = await newSigner.signMessage(message);
          return signature;
        } catch (err) {
          console.error('Failed to get signer from provider:', err);
          throw new Error('Unable to sign message. Please reconnect your wallet.');
        }
      } else {
        throw new Error('No signer available');
      }
    }

    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      console.error('Message signing failed:', err);
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
        provider,
        signer,
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