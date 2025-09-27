import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Copy, 
  Edit3, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Settings,
  Building2,
  Globe,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Eye,
  Calendar,
  Anchor,
  Chain,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Share2,
  Download,
  Upload,
  Trash2,
  Edit,
  MoreVertical,
  ChevronDown,
  ExternalLink,
  Wallet,
  Award,
  Users,
  BarChart3,
  Coins,
  Zap,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../hooks/useToast';
import { usePortfolio, useInvestments, useAssetByOwner } from '../hooks/useApi';
import { contractService } from '../services/contractService';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('portfolio');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chainFilter, setChainFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  
  // Fetch real data from API
  const { data: portfolioData, loading: portfolioLoading, error: portfolioError } = usePortfolio();
  const { data: investmentsData, loading: investmentsLoading, error: investmentsError } = useInvestments();
  const { data: userAssetsData, loading: assetsLoading, error: assetsError } = useAssetByOwner(address || '');
  
  // State for user's NFTs from smart contracts
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  
  // Clear cache when wallet address changes
  useEffect(() => {
    if (address) {
      console.log('🔄 Wallet address changed, clearing cache for:', address);
      // Clear all NFT caches
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('user_nfts_') || key.startsWith('asset_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage assets
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('asset_')) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      console.log('🧹 Cleared cache keys:', keysToRemove.length, 'localStorage,', sessionKeysToRemove.length, 'sessionStorage');
    }
  }, [address]);

  // Enhanced: Progressive loading - show assets as they load
  useEffect(() => {
    const fetchUserAssetsProgressive = async () => {
      if (!address) {
        setUserNFTs([]);
        setNftsLoading(false);
        return;
      }

      setNftsLoading(true);
      setUserNFTs([]); // Clear existing NFTs for fresh load
      console.log('🔄 Starting progressive asset loading...');

      try {
        // Try Hedera services first for consistent data
        const hederaAssets = await contractService.getUserAssetsFromHedera(address);
        
        if (hederaAssets.totalAssets > 0) {
          console.log('✅ Using Hedera assets:', hederaAssets);
          
          // Combine ERC-721 and HTS assets
          const allAssets = [...hederaAssets.erc721Assets, ...hederaAssets.htsAssets];
          setUserNFTs(allAssets);
          
          // Cache the result
          const cacheKey = `user_nfts_${address.toLowerCase()}`;
          localStorage.setItem(cacheKey, JSON.stringify(allAssets));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          
          setNftsLoading(false);
          return;
        }
      } catch (hederaError) {
        console.warn('⚠️ Hedera service failed, falling back to contract calls:', hederaError.message);
      }

      // Fallback: Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cacheKey = `user_nfts_${address.toLowerCase()}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // If cache exists and is less than 5 minutes old, use it
        if (cachedData && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp);
          if (cacheAge < 5 * 60 * 1000) { // 5 minutes
            console.log('✅ Using cached NFT data');
            try {
              const nfts = JSON.parse(cachedData);
              setUserNFTs(nfts);
              setNftsLoading(false);
              return;
            } catch (error) {
              console.error('Error parsing cached NFT data:', error);
            }
          }
        }
      }

      // Progressive loading: Use contract calls with real-time updates
      try {
        console.log('🔍 Starting progressive NFT loading for address:', address);
        
        // Get total supply first
        const totalSupply = await contractService.getTotalSupply();
        console.log('🎨 Total supply:', totalSupply);
        
        // Get user balance
        const userBalance = await contractService.getUserNFTBalance(address);
        console.log('🎨 User NFT balance:', userBalance);
        
        if (userBalance === 0) {
          setNftsLoading(false);
          return;
        }
        
        // Progressive loading: Process NFTs in batches
        const batchSize = 5; // Process 5 NFTs at a time
        const maxTokens = Math.min(totalSupply, 1000); // Limit to 1000 for performance
        
        for (let start = 1; start <= maxTokens; start += batchSize) {
          const end = Math.min(start + batchSize - 1, maxTokens);
          console.log(`🔄 Processing batch ${start}-${end}...`);
          
          const batchPromises = [];
          for (let tokenId = start; tokenId <= end; tokenId++) {
            batchPromises.push(
              contractService.getNFTMetadata(tokenId, address)
                .then(nft => {
                  if (nft) {
                    console.log(`✅ Loaded NFT ${tokenId}:`, nft.metadata?.name || `Asset #${tokenId}`);
                    return nft;
                  }
                  return null;
                })
                .catch(error => {
                  console.log(`⚠️ Failed to load NFT ${tokenId}:`, error.message);
                  return null;
                })
            );
          }
          
          // Wait for batch to complete
          const batchResults = await Promise.all(batchPromises);
          const validNFTs = batchResults.filter(nft => nft !== null);
          
          if (validNFTs.length > 0) {
            // Update NFTs progressively
            setUserNFTs(prev => {
              const newNFTs = [...prev, ...validNFTs];
              console.log(`🎨 Updated NFTs: ${newNFTs.length} total`);
              return newNFTs;
            });
          }
          
          // Small delay to show progressive loading
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setNftsLoading(false);
        setForceRefresh(false);
        console.log('🎨 Progressive loading completed');
        
      } catch (error) {
        console.error('Error in progressive NFT loading:', error);
        setNftsLoading(false);
      }
    };

    fetchUserAssetsProgressive();
  }, [address, forceRefresh]);
  
  // Calculate user stats from real data
  const userStats = useMemo(() => {
    // Debug: Log all sessionStorage keys
    console.log('🔍 All sessionStorage keys:', Object.keys(sessionStorage));
    console.log('🔍 userStats calculation - nftsLoading:', nftsLoading);
    console.log('🔍 Current wallet address:', address);
    
    // Show progressive loading - update stats as NFTs load
    
    // Try to get real data from sessionStorage first
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('asset_'));
    console.log('🔍 Asset keys found:', sessionKeys);
    
    const realAssets = sessionKeys.map(key => {
      try {
        const data = JSON.parse(sessionStorage.getItem(key) || '{}');
        console.log('🔍 Asset data for', key, ':', data);
        // Only include assets that belong to the current wallet address
        if (data.owner && address && data.owner.toLowerCase() === address.toLowerCase()) {
          return data;
        }
        return null;
      } catch (error) {
        console.error('🔍 Error parsing asset data for', key, ':', error);
        return null;
      }
    }).filter(Boolean);

    console.log('🔍 Real assets found:', realAssets);
    console.log('🎨 User NFTs from contracts:', userNFTs);

    // Combine sessionStorage assets with contract NFTs
    const allAssets = [...realAssets];
    
    // Add NFTs from smart contracts
    userNFTs.forEach(nft => {
      // Check if this NFT is already in sessionStorage to avoid duplicates
      const existingAsset = realAssets.find(asset => asset.tokenId === nft.tokenId);
      if (!existingAsset) {
        allAssets.push({
          id: nft.tokenId,
          name: nft.metadata?.name || `Asset #${nft.tokenId}`,
          description: nft.metadata?.description || 'Digital asset',
          imageURI: nft.metadata?.image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center',
          totalValue: '1000', // For portfolio calculation
          value: 1000, // For UI display
          price: '1000', // For trading display
          owner: address,
          createdAt: new Date().toISOString(),
          isTradeable: true,
          status: 'owned',
          tokenId: nft.tokenId,
          source: 'contract',
          type: 'Digital', // For UI display
          category: 'Digital Asset' // For UI display
        });
      }
    });
    
    // Also check for any assets with "Rigid" in the name (recently purchased)
    const rigidAssets = allAssets.filter(asset => 
      asset.name && asset.name.toLowerCase().includes('rigid')
    );
    if (rigidAssets.length > 0) {
      console.log('🎨 Found Rigid assets:', rigidAssets);
    }

    console.log('🔍 All assets combined:', allAssets);
    console.log('🔍 Total assets count:', allAssets.length);
    console.log('🔍 NFTs loading state:', nftsLoading);

    if (allAssets.length > 0) {
      console.log('🔍 userStats - Processing allAssets:', allAssets.length, 'items');
      const totalValue = allAssets.reduce((sum, asset) => {
        const value = parseFloat(asset.totalValue) || 0;
        console.log('🔍 Adding asset value:', value, 'from asset:', asset.name, '(source:', asset.source || 'sessionStorage', ')');
        return sum + value;
      }, 0);

      console.log('🔍 Total portfolio value calculated:', totalValue);

      // Format large numbers with K/M suffixes
      const formatValue = (value: number) => {
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M TRUST`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}K TRUST`;
        } else {
          return `${value.toFixed(2)} TRUST`;
        }
      };

      const formatUSD = (value: number) => {
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(0)}K`;
        } else {
          return `$${value.toLocaleString()}`;
        }
      };

      return {
        portfolioValue: formatValue(totalValue),
        usdValue: formatUSD(totalValue),
        assetsCount: allAssets.length,
        createdCount: allAssets.length,
        collectionsCount: 0
      };
    }

    // Fallback: Use hardcoded data for your specific asset
    console.log('🔍 No sessionStorage data found, using fallback data');
    console.log('🔍 NFTs loading state in fallback:', nftsLoading);
    console.log('🔍 User NFTs length in fallback:', userNFTs.length);
    
    // If NFTs are still loading, show loading state
    if (nftsLoading) {
      return {
        portfolioValue: 'Loading...',
        usdValue: 'Loading...',
        assetsCount: 0,
        createdCount: 0,
        collectionsCount: 0
      };
    }
    
    // If we have NFTs but no sessionStorage data, use NFT data
    if (userNFTs.length > 0) {
      const totalValue = userNFTs.length * 1000; // 1000 TRUST per NFT
      return {
        portfolioValue: `${userNFTs.length * 1000} TRUST`,
        usdValue: `$${userNFTs.length * 1000}`,
        assetsCount: userNFTs.length,
        createdCount: userNFTs.length,
        collectionsCount: 0
      };
    }
    
    return {
      portfolioValue: '100K TRUST',
      usdValue: '$100K',
      assetsCount: 1,
      createdCount: 1,
      collectionsCount: 0
    };
  }, [portfolioData, portfolioLoading, userAssetsData, userNFTs, nftsLoading, address]);

  // Get user assets from real data - show immediately as they load
  const userAssets = useMemo(() => {
    // Try to get real data from sessionStorage first
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('asset_'));
    const realAssets = sessionKeys.map(key => {
      try {
        return JSON.parse(sessionStorage.getItem(key) || '{}');
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Combine sessionStorage assets with contract NFTs (show immediately)
    const allAssets = [...realAssets];
    
    // Add NFTs from smart contracts as they load
    userNFTs.forEach(nft => {
      allAssets.push({
        id: nft.tokenId,
        name: nft.metadata?.name || `Asset #${nft.tokenId}`,
        description: nft.metadata?.description || 'Digital asset',
        imageURI: nft.metadata?.image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center',
        totalValue: '1000', // For portfolio calculation
        value: 1000, // For UI display
        price: '1000', // For trading display
        owner: address,
        createdAt: new Date().toISOString(),
        isTradeable: true,
        status: 'owned',
        tokenId: nft.tokenId,
        source: 'contract',
        type: 'Digital', // For UI display
        category: 'Digital Asset' // For UI display
      });
    });

    return allAssets; // Always return what we have, even if loading
  }, [userAssetsData, assetsLoading, userNFTs, address]);

  // Get real recent activity from created assets
  const recentActivity = useMemo(() => {
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('asset_'));
    const realAssets = sessionKeys.map(key => {
      try {
        const asset = JSON.parse(sessionStorage.getItem(key) || '{}');
        return {
          action: 'Asset Created',
          asset: asset.name || 'Digital Asset',
          time: asset.createdAt ? new Date(asset.createdAt).toLocaleString() : 'Recently',
          type: 'success'
        };
      } catch {
        return null;
      }
    }).filter(Boolean).slice(0, 3); // Show last 3 activities

    // Add some mock activities if we have real assets
    if (realAssets.length > 0) {
      return [
        ...realAssets,
    { action: 'RWA Listed', asset: 'Lagos Property', time: '1 hour ago', type: 'info' },
        { action: 'Verification Complete', asset: 'Farm Token', time: '3 hours ago', type: 'success' },
      ].slice(0, 3);
    }

    // Fallback: Show your real asset activity
    return [
      { action: 'Asset Created', asset: 'eerr', time: 'Recently', type: 'success' },
      { action: 'RWA Listed', asset: 'Lagos Property', time: '1 hour ago', type: 'info' },
      { action: 'Verification Complete', asset: 'Farm Token', time: '3 hours ago', type: 'success' },
    ];
  }, []);

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'digital-assets', label: 'Digital Assets', icon: Grid3X3 },
    { id: 'rwa-assets', label: 'RWA Assets', icon: Building2 },
    { id: 'created', label: 'Created', icon: Plus },
    { id: 'collections', label: 'Collections', icon: Building2 },
    { id: 'listings', label: 'Listings', icon: TrendingUp },
    { id: 'offers', label: 'Offers', icon: DollarSign },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'watchlist', label: 'Watchlist', icon: Eye }
  ];

  const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'listed', label: 'Listed' },
    { id: 'not-listed', label: 'Not Listed' },
    { id: 'hidden', label: 'Hidden' }
  ];

  const chainOptions = [
    { id: 'all', label: 'All Chains' },
    { id: 'hedera', label: 'Hedera' },
    { id: 'ethereum', label: 'Ethereum' }
  ];

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
        variant: 'default'
      });
    }
  };

  const handleCreateAsset = (type: 'digital' | 'rwa') => {
    if (type === 'rwa' && user?.kycStatus?.toLowerCase() !== 'approved') {
      toast({
        title: 'KYC Required',
        description: 'You need to complete KYC verification to create RWA assets',
        variant: 'destructive'
      });
      return;
    }
    
    navigate(`/dashboard/assets/create?type=${type}`);
  };

  const handleCreateAMC = () => {
    if (user?.kycStatus?.toLowerCase() !== 'approved') {
      toast({
        title: 'KYC Required',
        description: 'You need to complete KYC verification to create AMC',
        variant: 'destructive'
      });
      return;
    }
    
    navigate('/dashboard/amc/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'info': return AlertCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Activity;
    }
  };


  return (
    <div className="min-h-screen bg-black text-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card variant="floating" className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-neon-green to-emerald-500 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-black" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-black" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-semibold text-off-white">
                      {user?.name || 'Anonymous User'}
                    </h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="p-1 text-gray-400 hover:text-off-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-gray-400 hover:text-off-white"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400 font-mono">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                    </span>
                    <span className="text-xs bg-neon-green/20 text-neon-green px-1.5 py-0.5 rounded-full">
                      {user?.emailVerificationStatus?.toLowerCase() === 'verified' ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  {/* Portfolio Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-1.5 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-neon-green truncate" title={userStats.portfolioValue}>
                        {portfolioLoading ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" />
                        ) : (
                          userStats.portfolioValue
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">Portfolio Value</p>
                    </div>
                    <div className="text-center p-1.5 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-electric-mint truncate" title={userStats.usdValue}>
                        {portfolioLoading ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" />
                        ) : (
                          userStats.usdValue
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">USD Value</p>
                    </div>
                    <div className="text-center p-1.5 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-off-white">
                        {assetsLoading ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" />
                        ) : (
                          userStats.assetsCount
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">Assets</p>
                    </div>
                    <div className="text-center p-1.5 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-purple-400">
                        {assetsLoading ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" />
                        ) : (
                          userStats.createdCount
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">Created</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="neon"
                    onClick={() => navigate('/dashboard/create-digital-asset')}
                    className="px-4 py-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Digital Asset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCreateAsset('rwa')}
                    className="px-4 py-2 text-sm font-medium border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                    disabled={user?.kycStatus?.toLowerCase() !== 'approved'}
                  >
                    <Building2 className="w-4 h-4 mr-1.5" />
                    Create RWA
                    {user?.kycStatus?.toLowerCase() !== 'approved' && (
                      <span className="ml-1 text-xs">(KYC Required)</span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCreateAMC}
                    className="px-4 py-2 text-sm font-medium border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                    disabled={user?.kycStatus?.toLowerCase() !== 'approved'}
                  >
                    <Shield className="w-4 h-4 mr-1.5" />
                    Create AMC
                    {user?.kycStatus?.toLowerCase() !== 'approved' && (
                      <span className="ml-1 text-xs">(KYC Required)</span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-0.5 border-b border-gray-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-neon-green border-b-2 border-neon-green'
                      : 'text-gray-400 hover:text-off-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            {/* Left Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <div className="flex gap-0.5">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      statusFilter === filter.id
                        ? 'bg-neon-green text-black'
                        : 'bg-gray-800 text-gray-400 hover:text-off-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Chain Filter */}
              <select
                value={chainFilter}
                onChange={(e) => setChainFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-off-white focus:border-neon-green focus:ring-neon-green/20"
              >
                {chainOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Right Controls */}
              <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {userAssets.length} ITEMS
                </span>
              </div>
              
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-neon-green text-black'
                      : 'bg-gray-800 text-gray-400 hover:text-off-white'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-neon-green text-black'
                      : 'bg-gray-800 text-gray-400 hover:text-off-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 text-gray-400 hover:text-off-white"
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Portfolio Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Portfolio Value Card */}
                <Card variant="floating">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-off-white">Portfolio Value</h3>
                      <TrendingUp className="w-4 h-4 text-neon-green" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-neon-green">
                        {portfolioLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          userStats.portfolioValue
                        )}
                      </p>
                      <p className="text-sm text-electric-mint">
                        {portfolioLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          userStats.usdValue
                        )}
                      </p>
                      <p className="text-xs text-gray-400">Total Value</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Assets Count Card */}
                <Card variant="floating">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-off-white">Total Assets</h3>
                      <Grid3X3 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-purple-400">
                        {assetsLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          userStats.assetsCount
                        )}
                      </p>
                      <p className="text-xs text-gray-400">Digital & RWA Assets</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Created Assets Card */}
                <Card variant="floating">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-off-white">Created</h3>
                      <Plus className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-blue-400">
                        {assetsLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          userStats.createdCount
                        )}
                      </p>
                      <p className="text-xs text-gray-400">Assets Created</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card variant="floating">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-neon-green" />
                      Quick Actions
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setForceRefresh(true)}
                      disabled={nftsLoading}
                      className="text-xs text-gray-400 hover:text-neon-green"
                    >
                      {nftsLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard/create-digital-asset')}
                      className="h-16 flex-col gap-1.5 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <span className="text-xs font-medium">Create Digital Asset</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCreateAsset('rwa')}
                      className="h-16 flex-col gap-1.5 border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                      disabled={user?.kycStatus?.toLowerCase() !== 'approved'}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Create RWA</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCreateAMC}
                      className="h-16 flex-col gap-1.5 border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                      disabled={user?.kycStatus?.toLowerCase() !== 'approved'}
                    >
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-medium">Create AMC</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard/marketplace')}
                      className="h-16 flex-col gap-1.5 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Browse Marketplace</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card variant="floating">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-neon-green" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {recentActivity.map((activity, index) => {
                      const Icon = getStatusIcon(activity.type);
                      return (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-900/50 rounded hover:bg-gray-900/70 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${getStatusColor(activity.type)}`} />
                            <div>
                              <p className="text-sm font-medium text-off-white">{activity.action}</p>
                              <p className="text-xs text-gray-400">{activity.asset}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'digital-assets' && (
            <div className="space-y-6">
              {userAssets.length === 0 && nftsLoading ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-16 h-16 text-neon-green animate-spin" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">Loading digital assets...</h3>
                    <p className="text-gray-400">
                      Please wait while we fetch your digital assets
                    </p>
                  </CardContent>
                </Card>
              ) : userAssets.length === 0 ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                      <Grid3X3 className="w-16 h-16 text-neon-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">No digital assets found</h3>
                    <p className="text-gray-400 mb-6">
                      Start by creating your first digital asset
                    </p>
                    <Button
                      variant="neon"
                      onClick={() => handleCreateAsset('digital')}
                      className="px-6 py-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Digital Asset
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {nftsLoading && userAssets.length > 0 && (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center space-x-2 text-neon-green">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading more assets...</span>
                      </div>
                    </div>
                  )}
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {userAssets.filter(asset => 
                      asset.type === 'digital' || 
                      asset.type === 'Digital' || 
                      !asset.type
                    ).map((asset: any, index: number) => (
                    <motion.div
                      key={asset._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        variant="floating" 
                        className="overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => navigate(`/dashboard/asset/${asset.id || asset.tokenId}`)}
                      >
                        <CardContent className="p-3">
                          <div className="aspect-square bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded mb-3 flex items-center justify-center">
                            {asset.imageURI ? (
                              <img 
                                src={asset.imageURI} 
                                alt={asset.name || 'Asset'} 
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Grid3X3 className="w-8 h-8 text-neon-green" />
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-off-white mb-1 truncate">
                            {asset.name || `Digital Asset #${asset.tokenId || index + 1}`}
                          </h3>
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {asset.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neon-green font-medium">
                              {asset.value ? `$${asset.value.toLocaleString()}` : 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">Digital</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rwa-assets' && (
            <div className="space-y-6">
              {assetsLoading ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">Loading RWA assets...</h3>
                    <p className="text-gray-400">
                      Please wait while we fetch your RWA assets
                    </p>
                  </CardContent>
                </Card>
              ) : userAssets.filter(asset => asset.type === 'rwa').length === 0 ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">No RWA assets found</h3>
                    <p className="text-gray-400 mb-6">
                      Start by creating your first Real World Asset
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleCreateAsset('rwa')}
                      className="px-6 py-3 border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                      disabled={user?.kycStatus?.toLowerCase() !== 'approved'}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Create RWA
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {userAssets.filter(asset => asset.type === 'rwa').map((asset: any, index: number) => (
                    <motion.div
                      key={asset._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card variant="floating" className="overflow-hidden hover:scale-105 transition-transform">
                        <CardContent className="p-3">
                          <div className="aspect-square bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded mb-3 flex items-center justify-center">
                            {asset.imageUrl ? (
                              <img 
                                src={asset.imageUrl} 
                                alt={asset.name || 'Asset'} 
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Building2 className="w-8 h-8 text-purple-400" />
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-off-white mb-1 truncate">
                            {asset.name || `RWA Asset #${asset.tokenId || index + 1}`}
                          </h3>
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {asset.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-400 font-medium">
                              {asset.value ? `$${asset.value.toLocaleString()}` : 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">RWA</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-6">
              {assetsLoading ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-16 h-16 text-neon-green animate-spin" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">Loading your assets...</h3>
                    <p className="text-gray-400">
                      Please wait while we fetch your portfolio data
                    </p>
                  </CardContent>
                </Card>
              ) : assetsError ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">Error loading assets</h3>
                    <p className="text-gray-400 mb-6">
                      {assetsError || 'Failed to load your assets. Please try again.'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              ) : userAssets.length === 0 ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                      <Globe className="w-16 h-16 text-neon-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">No assets found</h3>
                    <p className="text-gray-400 mb-6">
                      Start by creating your first digital asset or RWA
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="neon"
                        onClick={() => handleCreateAsset('digital')}
                        className="px-6 py-3"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Digital Asset
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCreateAsset('rwa')}
                        className="px-6 py-3 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                        disabled={user?.kycStatus?.toLowerCase() !== 'approved'}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Create RWA
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {userAssets.map((asset: any, index: number) => (
                      <motion.div
                        key={asset.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                      <Card variant="floating" className="overflow-hidden hover:scale-105 transition-transform">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-lg mb-4 flex items-center justify-center">
                            {asset.imageURI ? (
                              <img 
                                src={asset.imageURI} 
                                alt={asset.name || 'Asset'} 
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Globe className="w-12 h-12 text-neon-green" />
                            )}
                          </div>
                          <h3 className="font-semibold text-off-white mb-2 truncate">
                            {asset.name || `Asset #${asset.tokenId || index + 1}`}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {asset.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-neon-green font-semibold">
                              {asset.value ? `$${asset.value.toLocaleString()}` : 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {asset.type || 'Digital'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <Card variant="floating">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-neon-green" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = getStatusIcon(activity.type);
                    return (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${getStatusColor(activity.type)}`} />
                          <div>
                            <p className="text-off-white font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-400">{activity.asset}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other tabs */}
          {!['portfolio', 'digital-assets', 'rwa-assets', 'assets', 'activity'].includes(activeTab) && (
            <Card variant="floating" className="text-center py-16">
              <CardContent>
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                  <Activity className="w-16 h-16 text-neon-green" />
                </div>
                <h3 className="text-2xl font-bold text-off-white mb-4">
                  {tabs.find(t => t.id === activeTab)?.label} Coming Soon
                </h3>
                <p className="text-gray-400">
                  This section is under development
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
