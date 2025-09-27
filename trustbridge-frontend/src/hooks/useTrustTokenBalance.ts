import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import TrustTokenABI from '../contracts/TrustToken.json';

// Use the correct TRUST Token address and ABI
const TRUST_TOKEN_ADDRESS = CONTRACT_ADDRESSES.trustToken;
const TRUST_TOKEN_ABI = TrustTokenABI.abi;

export const useTrustTokenBalance = () => {
  const { isConnected, address, provider } = useWallet();
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrustTokenBalance = async () => {
    if (!isConnected || !address || !provider) {
      setBalance("0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching TRUST token balance for address:', address);
      console.log('Using TRUST token address:', TRUST_TOKEN_ADDRESS);
      
      const contract = new ethers.Contract(TRUST_TOKEN_ADDRESS, TRUST_TOKEN_ABI, provider);
      const balance = await contract.balanceOf(address);
      const formattedBalance = ethers.formatEther(balance);
      console.log('TRUST token balance:', formattedBalance);
      setBalance(formattedBalance);
    } catch (err: any) {
      console.error('Failed to fetch TRUST token balance:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        data: err.data
      });
      setError(err.message);
      setBalance("0");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrustTokenBalance();
  }, [isConnected, address, provider]);

  return {
    balance,
    loading,
    error,
    refetch: fetchTrustTokenBalance
  };
};
