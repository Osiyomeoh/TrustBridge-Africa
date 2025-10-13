import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, ArrowRight, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useWallet } from '../../contexts/WalletContext';
import { useToast } from '../../hooks/useToast';
import { useTransactionBlock } from '../../hooks/useTransactionBlock';
import { TrustTokenService } from '../../services/trust-token.service';
import { trustTokenWalletService } from '../../services/trust-token-wallet.service';

interface TrustTokenPurchaseProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount?: number;
  onSuccess?: (amount: number) => void;
}

const TrustTokenPurchase: React.FC<TrustTokenPurchaseProps> = ({
  isOpen,
  onClose,
  requiredAmount = 0,
  onSuccess
}) => {
  const { accountId, balance: hbarBalance, signer } = useWallet();
  const { toast } = useToast();
  const { shouldBlockTransactions, getBlockReason, openProfileCompletionModal } = useTransactionBlock();
  
  const [trustBalance, setTrustBalance] = useState<number>(0);
  const [hbarAmount, setHbarAmount] = useState<string>('0.5');
  const [trustAmount, setTrustAmount] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [exchangeRate] = useState(100); // 1 HBAR = 100 TRUST tokens
  const [exchangeFee] = useState(0.1); // 0.1 HBAR fee

  // Fetch TRUST token balance
  useEffect(() => {
    if (accountId) {
      fetchTrustBalance();
    }
  }, [accountId]);

  const fetchTrustBalance = async () => {
    try {
      setIsRefreshingBalance(true);
      console.log('🔍 Fetching TRUST balance for account:', accountId);
      const balance = await TrustTokenService.hybridGetTrustTokenBalance(accountId!);
      console.log('📊 TRUST balance received:', balance);
      setTrustBalance(balance);
    } catch (error) {
      console.error('Failed to fetch TRUST balance:', error);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  const calculateTrustAmount = (hbar: string) => {
    const hbarNum = parseFloat(hbar) || 0;
    const trust = Math.floor((hbarNum - exchangeFee) * exchangeRate);
    return Math.max(0, trust);
  };

  const handleHbarChange = (value: string) => {
    setHbarAmount(value);
    setTrustAmount(calculateTrustAmount(value));
  };

  const handleExchange = async () => {
    if (!accountId) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first.',
        variant: 'destructive'
      });
      return;
    }

    if (shouldBlockTransactions) {
      toast({
        title: 'Transaction Blocked',
        description: getBlockReason(),
        variant: 'destructive'
      });
      // Open profile completion modal
      openProfileCompletionModal();
      return;
    }

    const hbarNum = parseFloat(hbarAmount);
    const totalCost = hbarNum + exchangeFee;
    const hbarBalanceNum = parseFloat(hbarBalance || '0');

    console.log('Exchange Debug Info:');
    console.log('- HBAR Amount to exchange:', hbarNum);
    console.log('- Exchange Fee:', exchangeFee);
    console.log('- Total Cost (HBAR + Fee):', totalCost);
    console.log('- Current HBAR Balance:', hbarBalanceNum);
    console.log('- Account ID:', accountId);

    if (totalCost > hbarBalanceNum) {
      toast({
        title: 'Insufficient HBAR Balance',
        description: `You need ${totalCost.toFixed(2)} HBAR but only have ${hbarBalanceNum.toFixed(2)} HBAR.`,
        variant: 'destructive'
      });
      return;
    }

    if (trustAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid HBAR amount.',
        variant: 'destructive'
      });
      return;
    }

    setIsExchanging(true);

    try {
      console.log(`Exchanging ${hbarAmount} HBAR for ${trustAmount} TRUST tokens for account ${accountId}`);

      // Require wallet connection for real transactions
      if (!trustTokenWalletService.isWalletConnected(accountId)) {
        throw new Error('Wallet not connected. Please connect your wallet to exchange HBAR for TRUST tokens.');
      }

      if (!signer) {
        throw new Error('Wallet signer not available. Please reconnect your wallet.');
      }

      // Use direct contract interaction with user signing
      const result = await trustTokenWalletService.exchangeHbarForTrust(
        accountId,
        parseFloat(hbarAmount),
        '0.0.6916959', // Treasury account ID
        '0.0.6916959', // Operations account ID
        '0.0.6916959', // Staking account ID
        signer
      );
      
      toast({
        title: 'Exchange Successful!',
        description: `Successfully exchanged ${hbarAmount} HBAR for ${result.trustAmount} TRUST tokens. Transaction ID: ${result.transactionId}`,
        variant: 'default'
      });

      // Update balance with a small delay to allow network to update
      console.log('🔄 Refreshing TRUST balance after successful exchange...');
      
      // Try immediate refresh first
      await fetchTrustBalance();
      
      // Then try again after 3 seconds
      setTimeout(async () => {
        console.log('🔄 Second balance refresh after 3 seconds...');
        await fetchTrustBalance();
        console.log('✅ TRUST balance refreshed (delayed)');
      }, 3000);
      
      // And one more time after 5 seconds
      setTimeout(async () => {
        console.log('🔄 Third balance refresh after 5 seconds...');
        await fetchTrustBalance();
        console.log('✅ TRUST balance refreshed (final)');
      }, 5000);
      
      // Call success callback
      onSuccess?.(trustAmount);
      
      // Close modal if we have enough tokens
      if (requiredAmount > 0 && (trustBalance + trustAmount) >= requiredAmount) {
        onClose();
      }
      
    } catch (error) {
      console.error('Exchange failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to exchange HBAR for TRUST tokens. Please try again.';
      toast({
        title: 'Exchange Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsExchanging(false);
    }
  };

  const suggestedAmounts = [0.5, 1.0, 2.0, 5.0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 min-h-screen"
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          minWidth: '100vw'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md mx-auto transform -translate-y-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-gray-900 border-gray-700 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-off-white flex items-center space-x-2">
                <Coins className="w-5 h-5 text-neon-green" />
                <span>Buy TRUST Tokens</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-off-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Current Balance */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Current Balance</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-off-white">{trustBalance} TRUST</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchTrustBalance}
                      disabled={isRefreshingBalance}
                      className="h-6 w-6 p-0"
                      title="Refresh balance"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">HBAR Balance</span>
                  <span className="text-sm font-mono text-off-white">{hbarBalance || '0'} HBAR</span>
                </div>
              </div>

              {/* Required Amount */}
              {requiredAmount > 0 && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-300">
                      You need {requiredAmount} TRUST tokens to create this asset
                    </span>
                  </div>
                </div>
              )}

              {/* Exchange Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount to Exchange (HBAR)
                  </label>
                  <Input
                    type="number"
                    value={hbarAmount}
                    onChange={(e) => handleHbarChange(e.target.value)}
                    placeholder="0.5"
                    step="0.1"
                    min="0.1"
                    className="bg-gray-800 border-gray-600 text-off-white"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex space-x-2">
                  {suggestedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => handleHbarChange(amount.toString())}
                      className="flex-1 text-xs"
                    >
                      {amount} HBAR
                    </Button>
                  ))}
                </div>

                {/* Exchange Details */}
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Exchange Rate</span>
                    <span className="text-off-white">1 HBAR = {exchangeRate} TRUST</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Exchange Fee</span>
                    <span className="text-red-400">-{exchangeFee} HBAR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">You'll Receive</span>
                    <span className="text-neon-green font-semibold">{trustAmount} TRUST</span>
                  </div>
                  
                  {/* HBAR Distribution Breakdown */}
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="text-xs text-gray-400 mb-2">HBAR Distribution:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Community Treasury</span>
                        <span className="text-blue-400">60% ({(parseFloat(hbarAmount) * 0.6).toFixed(2)} HBAR)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Platform Operations</span>
                        <span className="text-green-400">25% ({(parseFloat(hbarAmount) * 0.25).toFixed(2)} HBAR)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Staking Rewards</span>
                        <span className="text-purple-400">10% ({(parseFloat(hbarAmount) * 0.1).toFixed(2)} HBAR)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Exchange Fee</span>
                        <span className="text-orange-400">5% ({(parseFloat(hbarAmount) * 0.05).toFixed(2)} HBAR)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm font-semibold border-t border-gray-700 pt-2">
                    <span className="text-gray-300">Total Cost</span>
                    <span className="text-off-white">{(parseFloat(hbarAmount) + exchangeFee).toFixed(2)} HBAR</span>
                  </div>
                </div>

                {/* Exchange Button */}
                <Button
                  onClick={handleExchange}
                  disabled={isExchanging || trustAmount <= 0 || shouldBlockTransactions}
                  className={`w-full font-semibold ${
                    shouldBlockTransactions 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-neon-green text-black hover:bg-electric-mint'
                  }`}
                >
                  {isExchanging ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exchanging...
                    </>
                  ) : shouldBlockTransactions ? (
                    <>
                      {getBlockReason()}
                    </>
                  ) : (
                    <>
                      Exchange {hbarAmount} HBAR for {trustAmount} TRUST
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Info */}
              <div className="text-xs text-gray-400 text-center">
                TRUST tokens are used for creating and trading digital assets on TrustBridge.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrustTokenPurchase;
