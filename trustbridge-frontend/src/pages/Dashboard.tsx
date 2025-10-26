import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { TrendingUp, DollarSign, Activity, Users, Globe, ArrowUpRight, Sparkles, Loader2, AlertCircle, Settings, ShoppingCart, Award, Building2, Shield, Coins, BarChart3, Vote, Building, User } from 'lucide-react';
import { useMarketAnalytics, useHederaStatus, useAssets } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useTrustTokenBalance } from '../hooks/useTrustTokenBalance';
import KYCBanner from '../components/UI/KYCBanner';
import { IntegrationTest } from '../components/Debug/IntegrationTest';
import { contractService } from '../services/contractService';
import { useToast } from '../hooks/useToast';

const Dashboard: React.FC = () => {
  const { user, startKYC, authStep, isAuthenticated } = useAuth();
  const { balance: trustBalance, loading: trustLoading } = useTrustTokenBalance();
  const [showKYCBanner, setShowKYCBanner] = useState(true);
  const [showIntegrationTest, setShowIntegrationTest] = useState(false);
  const [mintingTokens, setMintingTokens] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check authentication status and redirect if needed
  useEffect(() => {
    console.log('Dashboard - Auth check:', { isAuthenticated, authStep, user: !!user });
    
    // If user is not authenticated or needs to complete profile
    if (!isAuthenticated || authStep === 'wallet' || authStep === 'profile' || authStep === 'email') {
      console.log('Dashboard - User needs authentication, redirecting to profile completion');
      // Profile completion is handled by the centralized popup
      return;
    }
  }, [isAuthenticated, authStep, user, navigate]);
  
  // Fetch real data from backend
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useMarketAnalytics();
  const { data: hederaData, loading: hederaLoading } = useHederaStatus();
  const { data: assetsData, loading: assetsLoading } = useAssets();

  // Check if KYC is required - only require KYC if user exists and KYC is not approved
  const isKYCRequired = user ? user.kycStatus?.toLowerCase() !== 'approved' : false;
  
  // Debug logging
  console.log('Dashboard Debug:', {
    user: user?.name,
    kycStatus: user?.kycStatus,
    isKYCRequired,
    hasUser: !!user
  });

  const handleStartKYC = async () => {
    try {
      await startKYC();
      // Banner will update automatically when KYC status changes
    } catch (error) {
      console.error('Failed to start KYC:', error);
    }
  };

  const handleDismissBanner = () => {
    setShowKYCBanner(false);
  };

  const handleMintTrustTokens = async (amount: string) => {
    console.log('🚀 === STARTING TRUST TOKEN MINTING ===');
    console.log('💰 Amount to mint:', amount, 'TRUST');
    console.log('👤 User wallet:', address);
    console.log('🌐 Network:', window.ethereum?.chainId);
    
    setMintingTokens(true);
    try {
      console.log('📞 Calling contractService.mintTrustTokens...');
      await contractService.mintTrustTokens(amount);
      console.log('✅ mintTrustTokens completed successfully');
      
      toast({
        title: 'TRUST Tokens Minted!',
        description: `Successfully minted ${amount} TRUST tokens to your wallet.`,
        variant: 'default'
      });
      
      console.log('🔄 Refreshing page to update balances...');
      // Refresh balance
      window.location.reload();
    } catch (error) {
      console.error('❌ Error minting TRUST tokens:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      toast({
        title: 'Minting Failed',
        description: `Failed to mint TRUST tokens: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      console.log('🏁 Minting process completed');
      setMintingTokens(false);
    }
  };


  // Format analytics data for display
  const stats = useMemo(() => {
    if (analyticsLoading || !analyticsData) {
      return [
        { title: 'Total Value Locked', value: '$0.0M', change: '+0%', icon: DollarSign, color: 'text-neon-green', trend: 'stable' },
        { title: 'Active Assets', value: '0', change: '+0%', icon: Activity, color: 'text-electric-mint', trend: 'stable' },
        { title: 'Total Users', value: '0', change: '+0%', icon: Users, color: 'text-neon-green', trend: 'stable' },
        { title: 'Network Status', value: 'Offline', change: '0%', icon: Globe, color: 'text-red-500', trend: 'down' }
      ];
    }

    const data = (analyticsData as any)?.data || analyticsData;
    const hederaStatus = (hederaData as any)?.status || 'disconnected';
    
    return [
      {
        title: 'Total Value Locked',
        value: `$${((data as any).totalValueLocked / 1000000).toFixed(1)}M`,
        change: '+34.2%',
        icon: DollarSign,
        color: 'text-neon-green',
        trend: 'up'
      },
      {
        title: 'Active Assets',
        value: (data as any).totalAssets?.toString() || '0',
        change: '+12%',
        icon: Activity,
        color: 'text-electric-mint',
        trend: 'up'
      },
      {
        title: 'Total Users',
        value: (data as any).activeUsers?.toLocaleString() || '0',
        change: '+8.5%',
        icon: Users,
        color: 'text-neon-green',
        trend: 'up'
      },
      {
        title: 'Hedera Status',
        value: hederaStatus === 'connected' ? 'Online' : 'Offline',
        change: hederaStatus === 'connected' ? '99.9%' : '0%',
        icon: Globe,
        color: hederaStatus === 'connected' ? 'text-electric-mint' : 'text-red-500',
        trend: hederaStatus === 'connected' ? 'stable' : 'down'
      }
    ];
  }, [analyticsData, analyticsLoading, hederaData]);

  // Show loading state
  if (analyticsLoading || hederaLoading || assetsLoading) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-neon-green mx-auto mb-3" />
              <p className="text-sm text-off-white/70">Loading dashboard data...</p>
            </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (analyticsError) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-off-white/70 mb-2">Failed to load dashboard data</p>
            <p className="text-xs text-off-white/50">{analyticsError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show integration test if toggled
  if (showIntegrationTest) {
    return <IntegrationTest />;
  }

  return (
    <div className="min-h-screen bg-black text-off-white relative overflow-hidden p-4 sm:p-6 lg:p-8">

      {/* KYC Banner - Only show for authenticated users */}
      {isAuthenticated && isKYCRequired && showKYCBanner && user?.kycStatus && (
        <KYCBanner
          kycStatus={user.kycStatus}
          onStartKYC={handleStartKYC}
          onDismiss={handleDismissBanner}
        />
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-neon-green/20 rounded-full floating opacity-30"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-electric-mint/20 morphing-shape opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-neon-green/10 triangle floating opacity-50"></div>
        <div className="absolute top-1/2 right-20 w-20 h-20 border border-neon-green/30 rotating opacity-25"></div>
        
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
             }}>
        </div>
      </div>

      <div className="relative z-10">
        {/* Professional Header Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Live Dashboard Badge */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              <Sparkles className="w-4 h-4 text-neon-green" />
              <span className="text-xs font-medium text-neon-green uppercase tracking-wider">Live Dashboard</span>
            </div>
          </motion.div>

          {/* Quick Actions Bar */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button 
              variant="neon" 
              size="lg" 
              className="floating group px-6 py-3 text-sm"
              onClick={() => navigate('/marketplace')}
            >
              <Globe className="w-4 h-4 mr-2" />
              Browse Marketplace
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-6 py-3 text-sm border-neon-green/30 text-neon-green hover:bg-neon-green/10 hover:border-neon-green/50"
              onClick={() => navigate('/dashboard/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              My Profile
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Core Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Digital Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card variant="floating" className="hover:scale-105 transition-all duration-300 group shadow-md hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <Globe className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Digital Assets</CardTitle>
                    <p className="text-xs text-text-secondary">NFTs & Digital Art</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-3">
                  Create, mint, and trade digital assets including NFTs, digital art, and collectibles.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-sm border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50"
                  onClick={() => navigate('/marketplace?category=digital')}
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                  Browse Digital Assets
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Real World Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Card variant="floating" className="hover:scale-105 transition-all duration-300 group shadow-md hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <Building2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Real World Assets</CardTitle>
                    <p className="text-xs text-text-secondary">Tokenized Physical Assets</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-3">
                  Tokenize and trade real estate, vehicles, commodities, and other physical assets with full verification.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-sm border-green-400/30 text-green-400 hover:bg-green-400/10 hover:border-green-400/50"
                  onClick={() => navigate('/marketplace?category=rwa')}
                >
                  <Building2 className="w-3.5 h-3.5 mr-1.5" />
                  Browse RWA Assets
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio & Investments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <Card variant="floating" className="hover:scale-105 transition-all duration-300 group shadow-md hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Portfolio & Investments</CardTitle>
                    <p className="text-xs text-text-secondary">Track your investments</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-3">
                  Monitor your asset portfolio, track performance, and manage your investments across digital and RWA assets.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-sm border-purple-400/30 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400/50"
                  onClick={() => navigate('/dashboard/portfolio')}
                >
                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                  View Portfolio
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* TRUST Token Minting Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <Card variant="floating" className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Coins className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Get TRUST Tokens</CardTitle>
                  <p className="text-xs text-text-secondary">Mint TRUST tokens to create and trade assets</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-text-secondary">Current Balance</p>
                  <p className="text-lg font-bold text-neon-green">
                    {trustLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `${trustBalance || '0'} TRUST`
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Required for Asset Creation</p>
                  <p className="text-sm font-medium text-orange-400">10 TRUST</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleMintTrustTokens('100')}
                  disabled={mintingTokens}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  {mintingTokens ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Coins className="w-3 h-3 mr-1" />
                  )}
                  Mint 100 TRUST
                </Button>
                <Button
                  onClick={() => handleMintTrustTokens('1000')}
                  disabled={mintingTokens}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  {mintingTokens ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Coins className="w-3 h-3 mr-1" />
                  )}
                  Mint 1000 TRUST
                </Button>
              </div>
              
              <p className="text-xs text-text-secondary mt-3">
                TRUST tokens are required to create digital assets and participate in the ecosystem.
                <br />
                <span className="text-orange-400">Note: You need MINTER_ROLE to mint tokens. Contact the contract administrator or use a faucet.</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>


        {/* AI Studio Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
        </motion.div>

        {/* Simple Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
              >
                <Card variant="floating" className="text-center group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className={`inline-flex p-2 rounded-lg mb-3 ${stat.color.replace('text-', 'bg-').replace('-400', '-500/20')}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <h3 className="text-sm font-medium text-off-white mb-1">{stat.title}</h3>
                    <p className="text-lg font-bold text-neon-green mb-1">{stat.value}</p>
                    <p className={`text-xs ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
