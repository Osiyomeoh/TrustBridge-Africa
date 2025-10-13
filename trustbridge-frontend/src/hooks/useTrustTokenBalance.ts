import { useState, useEffect } from 'react';
import { TrustTokenService } from '../services/trust-token.service';
import { useWallet } from '../contexts/WalletContext';

export const useTrustTokenBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accountId, isConnected } = useWallet();
  
  const fetchBalance = async () => {
    if (!accountId || !isConnected) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trustBalance = await TrustTokenService.hybridGetTrustTokenBalance(accountId);
      setBalance(trustBalance);
    } catch (err) {
      console.error('Failed to fetch TRUST token balance:', err);
      setError('Failed to fetch TRUST token balance');
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = () => {
    fetchBalance();
  };

  useEffect(() => {
    fetchBalance();
  }, [accountId, isConnected]);

  return {
    balance,
    loading,
    error,
    refreshBalance
  };
};