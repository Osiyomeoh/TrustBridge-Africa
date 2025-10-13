import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Plus, Loader2 } from 'lucide-react';
import { useTrustTokenBalance } from '../../hooks/useTrustTokenBalance';
import TrustTokenPurchase from './TrustTokenPurchase';

interface TrustTokenBalanceProps {
  className?: string;
  showPurchaseButton?: boolean;
}

const TrustTokenBalance: React.FC<TrustTokenBalanceProps> = ({
  className = '',
  showPurchaseButton = true
}) => {
  const { balance, loading, refreshBalance } = useTrustTokenBalance();
  const [showPurchase, setShowPurchase] = useState(false);

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(1)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`;
    }
    return balance.toString();
  };

  return (
    <>
      <motion.div
        className={`flex items-center space-x-2 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* TRUST Token Icon */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <Coins className="w-3 h-3 text-black" />
        </div>

        {/* Balance */}
        <div className="flex items-center space-x-1">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <>
              <span className="text-sm font-mono text-gray-300">
                {formatBalance(balance)}
              </span>
              <span className="text-xs text-gray-500">TRUST</span>
            </>
          )}
        </div>

        {/* Purchase Button */}
        {showPurchaseButton && (
          <button
            onClick={() => setShowPurchase(true)}
            className="w-5 h-5 rounded-full bg-neon-green/20 hover:bg-neon-green/30 flex items-center justify-center transition-colors"
            title="Buy TRUST tokens"
          >
            <Plus className="w-3 h-3 text-neon-green" />
          </button>
        )}
      </motion.div>

      {/* Purchase Modal */}
      <TrustTokenPurchase
        isOpen={showPurchase}
        onClose={() => setShowPurchase(false)}
        onSuccess={() => {
          // Refresh the balance in the header
          setTimeout(() => {
            refreshBalance();
          }, 2000); // Wait 2 seconds for network propagation
        }}
      />
    </>
  );
};

export default TrustTokenBalance;
