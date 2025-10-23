/**
 * Yield Dashboard Component
 * Displays yield distribution, tracking, and management
 * Integrates with existing pool system
 */

import React, { useState, useEffect } from 'react';
import { yieldDistributionService, YieldHistory, UserYieldPosition } from '../../services/YieldDistributionService';
import { useWallet } from '../../contexts/WalletContext';
import { useToast } from '../../hooks/useToast';
import { TrendingUp, Calendar, DollarSign, Users, Clock, CheckCircle } from 'lucide-react';
import { TransferTransaction, TokenId, AccountId, Hbar, Long } from '@hashgraph/sdk';
import { apiService } from '../../services/api';

interface YieldDashboardProps {
  poolId: string;
  poolName: string;
}

export const YieldDashboard: React.FC<YieldDashboardProps> = ({
  poolId,
  poolName
}) => {
  const { accountId, isConnected, signer, hederaClient } = useWallet();
  const { toast } = useToast();
  
  const [yieldHistory, setYieldHistory] = useState<YieldHistory | null>(null);
  const [userPosition, setUserPosition] = useState<UserYieldPosition | null>(null);
  const [yieldMetrics, setYieldMetrics] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (poolId) {
      loadYieldData();
    }
  }, [poolId, accountId]);

  const loadYieldData = () => {
    const history = yieldDistributionService.getYieldHistory(poolId);
    setYieldHistory(history);

    if (accountId) {
      const positions = yieldDistributionService.getUserYieldPositions(accountId);
      const position = positions.find(p => p.poolId === poolId);
      setUserPosition(position || null);
    }

    const metrics = yieldDistributionService.getYieldMetrics(poolId);
    setYieldMetrics(metrics);
  };

  const handleClaimYield = async () => {
    if (!accountId || !userPosition || !signer) return;

    setIsClaiming(true);
    try {
      console.log('🔧 Yield Dashboard: Claiming yield with REAL user signing...');
      console.log('🔧 Claim amount:', userPosition.pendingYield);

      // Real Hedera transaction for yield claiming
      const trustTokenId = TokenId.fromString(process.env.REACT_APP_TRUST_TOKEN_ID || '0.0.6935064');
      const treasuryAccountId = AccountId.fromString(process.env.REACT_APP_TREASURY_ACCOUNT_ID || '0.0.6916959');
      const userAccountId = AccountId.fromString(accountId);

      const claimTransaction = new TransferTransaction()
        .addTokenTransfer(trustTokenId, treasuryAccountId, -Math.floor(userPosition.pendingYield))
        .addTokenTransfer(trustTokenId, userAccountId, Math.floor(userPosition.pendingYield))
        .setTransactionMemo(`Yield claim for pool: ${poolId}`)
        .setMaxTransactionFee(new Hbar(5));

      console.log('🔧 Freezing yield claim transaction with signer...');
      const frozenTx = await claimTransaction.freezeWithSigner(signer);
      
      console.log('🔧 Requesting signature for yield claim...');
      const signedTx = await signer.signTransaction(frozenTx);
      
      console.log('🔧 Executing yield claim transaction...');
      const response = await signedTx.execute(hederaClient);
      
      console.log('🔧 Getting yield claim receipt...');
      const receipt = await response.getReceipt(hederaClient);
      
      console.log('✅ Yield claim successful:', receipt.transactionId.toString());

      // Record yield claim on HCS for audit trail
      try {
        await apiService.post('/hedera/hcs/marketplace/event', {
          type: 'yield_claimed',
          poolId,
          amount: userPosition.pendingYield,
          userId: accountId,
          transactionId: receipt.transactionId.toString(),
          timestamp: new Date().toISOString()
        });
        console.log('✅ Yield claim recorded on HCS');
      } catch (hcsError) {
        console.warn('⚠️ Failed to record yield claim on HCS (non-critical):', hcsError);
      }

      // Update local yield position
      const result = await yieldDistributionService.claimYield(accountId, poolId);
      
      if (result.success) {
        toast({
          title: 'Yield Claimed Successfully!',
          description: `Claimed ${result.amount.toFixed(2)} TRUST tokens. Transaction: ${receipt.transactionId.toString()}`,
          variant: 'default'
        });
        loadYieldData(); // Refresh data
      } else {
        toast({
          title: 'Claim Failed',
          description: result.error || 'Failed to claim yield',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Yield claim failed:', error);
      toast({
        title: 'Claim Failed',
        description: `Failed to claim yield: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Yield Dashboard - {poolName}</h3>
        <div className="flex items-center gap-2 text-green-400">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">Active Yield Generation</span>
        </div>
      </div>

      {/* Yield Metrics Overview */}
      {yieldMetrics && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-sm">Total Distributed</span>
            </div>
            <div className="text-white text-lg font-semibold">
              {formatCurrency(yieldMetrics.totalYieldDistributed)}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">Avg Yield Rate</span>
            </div>
            <div className="text-white text-lg font-semibold">
              {yieldMetrics.averageYieldRate.toFixed(2)}%
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400 text-sm">Total Holders</span>
            </div>
            <div className="text-white text-lg font-semibold">
              {yieldMetrics.totalHolders}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-400 text-sm">Yield Per Token</span>
            </div>
            <div className="text-white text-lg font-semibold">
              {formatCurrency(yieldMetrics.yieldPerToken)}
            </div>
          </div>
        </div>
      )}

      {/* User Position */}
      {userPosition && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">Your Yield Position</h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-gray-400 text-sm">Token Balance</div>
              <div className="text-white text-lg font-semibold">{userPosition.tokenBalance.toLocaleString()}</div>
            </div>
            
            <div>
              <div className="text-gray-400 text-sm">Total Yield Earned</div>
              <div className="text-green-400 text-lg font-semibold">
                {formatCurrency(userPosition.totalYieldEarned)}
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 text-sm">Pending Yield</div>
              <div className="text-yellow-400 text-lg font-semibold">
                {formatCurrency(userPosition.pendingYield)}
              </div>
            </div>
          </div>

          {userPosition.pendingYield > 0 && (
            <button
              onClick={handleClaimYield}
              disabled={isClaiming}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? 'Claiming...' : `Claim ${formatCurrency(userPosition.pendingYield)}`}
            </button>
          )}

          {userPosition.lastYieldClaimed && (
            <div className="mt-4 text-sm text-gray-400">
              Last claimed: {formatDate(userPosition.lastYieldClaimed)}
            </div>
          )}
        </div>
      )}

      {/* Yield History */}
      {yieldHistory && yieldHistory.distributions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Yield Distribution History</h4>
          
          <div className="space-y-3">
            {yieldHistory.distributions
              .sort((a, b) => b.distributionDate.getTime() - a.distributionDate.getTime())
              .slice(0, 10)
              .map((distribution) => (
                <div key={distribution.id} className="flex justify-between items-center bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      distribution.status === 'DISTRIBUTED' ? 'bg-green-400' :
                      distribution.status === 'PENDING' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                    
                    <div>
                      <div className="text-white font-semibold">
                        {formatCurrency(distribution.amount)} TRUST
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatDate(distribution.distributionDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">
                      {distribution.yieldRate.toFixed(2)}% APY
                    </div>
                    <div className="text-gray-400 text-sm">
                      {distribution.totalHolders} holders
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Upcoming Distributions */}
      {yieldMetrics?.nextDistributionDate && (
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h4 className="text-lg font-semibold text-white mb-4">Upcoming Distribution</h4>
          
          <div className="flex items-center gap-4">
            <Calendar className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-white font-semibold">
                Next Distribution
              </div>
              <div className="text-gray-400 text-sm">
                {formatDate(yieldMetrics.nextDistributionDate)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
