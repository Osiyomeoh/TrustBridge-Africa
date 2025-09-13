import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';

const WalletConnect: React.FC = () => {
  const { connectWallet, isLoading, error, authStep } = useAuth();
  const walletContext = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<'hashpack' | 'metamask' | null>(null);

  const handleWalletConnect = async (walletType: 'hashpack' | 'metamask') => {
    setSelectedWallet(walletType);
    try {
      await connectWallet(walletType);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'wallet':
        return <Wallet className="w-6 h-6" />;
      case 'profile':
        return <Shield className="w-6 h-6" />;
      case 'email':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  const getStepTitle = (step: string) => {
    switch (step) {
      case 'wallet':
        return 'Connect Your Wallet';
      case 'profile':
        return 'Complete Your Profile';
      case 'email':
        return 'Verify Your Email';
      default:
        return 'Welcome to TrustBridge';
    }
  };

  const getStepDescription = (step: string) => {
    switch (step) {
      case 'wallet':
        return 'Connect your wallet to access the TrustBridge platform and start investing in African assets.';
      case 'profile':
        return 'Add your personal information to complete your account setup.';
      case 'email':
        return 'Verify your email address to secure your account and enable all features.';
      default:
        return 'Your account is ready! Start exploring African investment opportunities.';
    }
  };

  if (authStep !== 'wallet') {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-neon-green/20 text-neon-green">
              {getStepIcon(authStep)}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-off-white mb-2">
            {getStepTitle(authStep)}
          </h2>
          <p className="text-medium-gray mb-6">
            {getStepDescription(authStep)}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-neon-green/20 text-neon-green">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          Connect Your Wallet
        </h2>
        
        <p className="text-text-secondary mb-6">
          Connect your wallet to access the TrustBridge platform and start investing in African assets.
        </p>

        <div className="mb-6 p-4 rounded-lg bg-background-tertiary/50 border border-border-primary/30">
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Choose Your Wallet Type:
          </h3>
          <div className="text-xs text-text-secondary space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span><strong>MetaMask:</strong> Works with Hedera EVM (browser extension)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span><strong>HashPack:</strong> Native Hedera wallet (browser extension)</span>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
            <span className="text-error text-sm">{error}</span>
          </motion.div>
        )}

        <div className="space-y-4">
          {/* MetaMask Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Button
              onClick={() => handleWalletConnect('metamask')}
              disabled={isLoading && selectedWallet === 'metamask'}
              className="w-full h-16 text-left justify-start px-6"
              variant="outline"
            >
              <div className="flex items-center gap-4">
                {isLoading && selectedWallet === 'metamask' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">MetaMask</div>
                  <div className="text-sm opacity-75">Connect with MetaMask (Hedera Testnet)</div>
                </div>
              </div>
            </Button>
          </motion.div>

          {/* HashPack Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Button
              onClick={() => handleWalletConnect('hashpack')}
              disabled={(isLoading && selectedWallet === 'hashpack') || !walletContext?.walletConnectProvider}
              className="w-full h-16 text-left justify-start px-6"
              variant="outline"
            >
              <div className="flex items-center gap-4">
                {isLoading && selectedWallet === 'hashpack' ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">H</span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">HashPack</div>
                  <div className="text-sm opacity-75">
                    Native Hedera Wallet (Testnet)
                    {!walletContext?.walletConnectProvider && (
                      <span className="text-yellow-400 ml-1">(Requires WalletConnect Project ID)</span>
                    )}
                  </div>
                </div>
              </div>
            </Button>
          </motion.div>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-dark-gray/50 border border-medium-gray/30">
          <h3 className="text-sm font-semibold text-off-white mb-2">
            Why Connect Your Wallet?
          </h3>
          <ul className="text-xs text-medium-gray space-y-1">
            <li>• Secure authentication with your private keys</li>
            <li>• Access to real African investment opportunities</li>
            <li>• Manage your portfolio and investments</li>
            <li>• Participate in asset tokenization</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletConnect;
