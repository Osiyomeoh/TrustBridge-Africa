import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  TrendingUp, 
  Star, 
  Heart, 
  Package, 
  Zap,
  Building2,
  Palette,
  Globe,
  Users,
  DollarSign,
  CheckCircle,
  Grid3X3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { contractService } from '../services/contractService';
import AuthStatus from '../components/Auth/AuthStatus';

// TrustBridge categories matching our contract flow
const CATEGORIES = [
  { id: 'all', name: 'All Assets', icon: Package },
  { id: 'digital', name: 'Digital Assets', icon: Globe },
  { id: 'rwa', name: 'Real World Assets', icon: Building2 },
  { id: 'verified', name: 'Verified Assets', icon: CheckCircle },
  { id: 'trading', name: 'Trading Pools', icon: TrendingUp },
  { id: 'spv', name: 'SPV Investments', icon: Users }
];

// Time filters
const TIME_FILTERS = [
  { id: 'all', name: 'All' },
  { id: '30d', name: '30d' },
  { id: '7d', name: '7d' },
  { id: '1d', name: '1d' },
  { id: '1h', name: '1h' },
  { id: '15m', name: '15m' },
  { id: '5m', name: '5m' },
  { id: '1m', name: '1m' }
];

// Sort options
const SORT_OPTIONS = [
  { id: 'floor', name: 'Floor Price', icon: DollarSign },
  { id: 'volume', name: 'Volume', icon: TrendingUp },
  { id: 'sales', name: 'Sales', icon: Star },
  { id: 'items', name: 'Items', icon: Package }
];

const AssetMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1d');
  const [sortBy, setSortBy] = useState('floor');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced: Fetch marketplace data using Hedera services for consistency
  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching marketplace data from Hedera services...');
      
      // Try Hedera services first for consistent data
      try {
        const hederaMarketplaceData = await contractService.getMarketplaceDataFromHedera();
        
        if (hederaMarketplaceData.totalListings > 0) {
          console.log('✅ Using Hedera marketplace data:', hederaMarketplaceData);
          setAssets(hederaMarketplaceData.assets);
          setLoading(false);
          return;
        }
      } catch (hederaError) {
        console.warn('⚠️ Hedera service failed, falling back to contract calls:', hederaError.message);
      }
      
      // Fallback: Use existing contract calls
      console.log('🔍 Fetching marketplace data from contracts... [v2.1 - NO MOCK FALLBACK]');
      console.warn('🚨 FILTERING FIX APPLIED - If you see mock data, please hard refresh (Ctrl+Shift+R)');
      console.log('🕐 Timestamp:', new Date().toISOString());
      console.log('🚨 CACHE BUSTER:', Date.now());
      console.log('🚨 FILTERING FIX v2.8 - NETWORK ERROR FIX - ALL LISTINGS INVALID');
      console.warn('🔥 CACHE CLEAR REQUIRED - Normal browser needs hard refresh!');
      console.log('📱 Incognito works = Code is correct, browser cache is the issue');
      
      const marketplaceAssets = await contractService.getAllActiveListings();
      console.log('📊 Marketplace assets fetched:', marketplaceAssets.length);
      console.log('🔍 Assets data:', marketplaceAssets);
      
      setAssets(marketplaceAssets);
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError('Failed to load marketplace data');
      // Don't use fallback data - show empty state instead
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh marketplace data
  const refreshMarketplaceData = async () => {
    setRefreshing(true);
    await fetchMarketplaceData();
    setRefreshing(false);
  };

  // Mock data for OpenSea-style collections
  const mockCollections = [
    {
      id: 'dx-terminal',
      name: 'DX Terminal',
      logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=40&h=40&fit=crop&crop=center',
      floorPrice: '0.0052',
      currency: 'ETH',
      change: '+25.8%',
      changeType: 'positive',
      volume: '560.81',
      sales: '114,136',
      owners: '6',
      verified: true,
      category: 'gaming',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=300&fit=crop&crop=center',
      description: 'Welcome to Terminal City! This collection is where each of your AI Trader NFT\'s will appear.'
    },
    {
      id: 'universe-heroes',
      name: 'UNIOVERSE HEROES',
      logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=40&h=40&fit=crop&crop=center',
      floorPrice: '0.0076',
      currency: 'ETH',
      change: '+136.1%',
      changeType: 'positive',
      volume: '283.94',
      sales: '48,568',
      owners: '3',
      verified: true,
      category: 'gaming',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/300x300/7C3AED?w=300&h=300&fit=crop&crop=centerUNIOVERSE',
      description: 'Heroes from across the universe unite in this epic collection.'
    },
    {
      id: 'pudgy-penguins',
      name: 'Pudgy Penguins',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center059669?w=300&h=300&fit=crop&crop=centerPP',
      floorPrice: '10.2899',
      currency: 'ETH',
      change: '-0.3%',
      changeType: 'negative',
      volume: '265.12',
      sales: '26',
      owners: '4',
      verified: true,
      category: 'pfps',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/300x300/059669?w=300&h=300&fit=crop&crop=centerPudgy+Penguins',
      description: 'A collection of 8,888 cute penguins with proof of ownership stored on Ethereum.'
    },
    {
      id: 'moonbirds',
      name: 'Moonbirds',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=centerDC2626?w=300&h=300&fit=crop&crop=centerMB',
      floorPrice: '2.7188',
      currency: 'ETH',
      change: '+1.6%',
      changeType: 'positive',
      volume: '225.94',
      sales: '84',
      owners: '5',
      verified: true,
      category: 'pfps',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/300x300/DC2626?w=300&h=300&fit=crop&crop=centerMoonbirds',
      description: 'A collection of 10,000 utility-enabled PFPs that feature a richly diverse and unique pool of rarity-powered traits.'
    },
    {
      id: 'farworld-creatures',
      name: 'FARWORLD // Creatures',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center7C2D12?w=300&h=300&fit=crop&crop=centerFW',
      floorPrice: '0.004',
      currency: 'ETH',
      change: '+53%',
      changeType: 'positive',
      volume: '182.51',
      sales: '53,454',
      owners: '3',
      verified: true,
      category: 'gaming',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/300x300/7C2D12?w=300&h=300&fit=crop&crop=centerFARWORLD',
      description: 'Mystical creatures from the far reaches of the digital universe.'
    },
    {
      id: 'cryptopunks',
      name: 'CryptoPunks',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center1F2937?w=300&h=300&fit=crop&crop=centerCP',
      floorPrice: '46.57',
      currency: 'ETH',
      change: '-4.8%',
      changeType: 'negative',
      volume: '137.25',
      sales: '3',
      owners: '3',
      verified: true,
      category: 'pfps',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/300x300/1F2937?w=300&h=300&fit=crop&crop=centerCryptoPunks',
      description: '10,000 unique collectible characters with proof of ownership stored on the Ethereum blockchain.'
    },
    {
      id: 'milady-maker',
      name: 'Milady Maker',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=centerEC4899?w=300&h=300&fit=crop&crop=centerMM',
      floorPrice: '1.68',
      currency: 'ETH',
      change: '-5.1%',
      changeType: 'negative',
      volume: '122.20',
      sales: '61',
      owners: '5',
      verified: true,
      category: 'pfps',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/300x300/EC4899?w=300&h=300&fit=crop&crop=centerMilady',
      description: 'A collection of 10,000 generative pfpNFTs in a neochibi aesthetic.'
    },
    {
      id: 'basepaint',
      name: 'BasePaint',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center3B82F6?w=300&h=300&fit=crop&crop=centerBP',
      floorPrice: '0.004',
      currency: 'ETH',
      change: '+3.4%',
      changeType: 'positive',
      volume: '98.45',
      sales: '12,345',
      owners: '4',
      verified: true,
      category: 'art',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/300x300/3B82F6?w=300&h=300&fit=crop&crop=centerBasePaint',
      description: 'Collaborative art creation on Base blockchain.'
    }
  ];

  // Featured collection for banner
  const featuredCollection = {
    id: 'meridian',
    name: 'Meridian by Matt DesLauriers',
    creator: 'Art_Blocks',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=center4F46E5?w=300&h=300&fit=crop&crop=centerMeridian+by+Matt+DesLauriers',
    floorPrice: '4.00',
    currency: 'ETH',
    items: '1,000',
    totalVolume: '22.2K',
    listed: '6%',
    verified: true,
    description: 'A generative art collection exploring the intersection of digital and physical landscapes.'
  };

  useEffect(() => {
    console.log('🔄 AssetMarketplace mounted - fetching data...');
    console.log('🚨 CACHE BUSTER:', Date.now());
    fetchMarketplaceData();
  }, []);

  // Filter and sort assets when filters change
  useEffect(() => {
    if (assets.length === 0) return;

    let filteredAssets = [...assets];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filteredAssets = filteredAssets.filter(asset => {
        switch (selectedCategory) {
          case 'digital':
            return asset.assetType === 'Digital' || asset.category === 'Digital Art' || asset.category === 6 || asset.category === 7;
          case 'rwa':
            return asset.assetType !== 'Digital' && asset.category !== 'Digital Art' && asset.category !== 6 && asset.category !== 7;
          case 'verified':
            return asset.verified === true;
          case 'trading':
            return asset.isTradeable === true || asset.isActive === true;
          case 'spv':
            return asset.currentAMC !== null;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      filteredAssets = filteredAssets.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort assets
    filteredAssets.sort((a, b) => {
      const aValue = parseFloat(a.price || a.floorPrice || '0');
      const bValue = parseFloat(b.price || b.floorPrice || '0');
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    setAssets(filteredAssets);
  }, [selectedCategory, searchQuery, sortBy, sortOrder]);


  const handleCollectionClick = (collectionId: string) => {
    navigate(`/dashboard/collection/${collectionId}`);
  };



  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    if (currency === 'TRUST') {
      if (numPrice < 1) {
        return `${numPrice.toFixed(2)} TRUST`;
      } else if (numPrice < 1000) {
        return `${numPrice.toFixed(0)} TRUST`;
      } else if (numPrice < 1000000) {
        return `${(numPrice / 1000).toFixed(1)}K TRUST`;
      } else {
        return `${(numPrice / 1000000).toFixed(1)}M TRUST`;
      }
    } else {
      if (numPrice < 0.01) {
        return `< 0.01 ${currency}`;
      }
      return `${numPrice.toFixed(4)} ${currency}`;
    }
  };

  const getChangeColor = (changeType: string) => {
    return changeType === 'positive' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-black text-off-white">
      {/* Original Discovery Header */}
      <div className="bg-gray-900/50 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">TB</span>
              </div>
              <span className="text-lg font-semibold text-off-white">TrustBridge</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search TrustBridge"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-off-white placeholder-gray-400 focus:border-neon-green focus:ring-neon-green/20"
                />
              </div>
            </div>

            {/* Auth Status */}
            <div className="flex items-center space-x-4">
              <AuthStatus />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters - OpenSea Style */}
        <div className="flex items-center space-x-1 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all duration-200 text-xs font-medium ${
                selectedCategory === category.id
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                  : 'text-gray-400 hover:text-off-white hover:bg-gray-800'
              }`}
            >
              <category.icon className="w-3.5 h-3.5" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Collection Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
                <div className="relative h-64">
                  <img
                    src={featuredCollection.image}
                    alt={featuredCollection.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-xl font-bold">{featuredCollection.name}</h2>
                      {featuredCollection.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-gray-300 mb-3 text-sm">By {featuredCollection.creator}</p>
                    <div className="flex items-center space-x-6 text-xs">
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider">FLOOR PRICE</span>
                        <p className="text-lg font-bold">{featuredCollection.floorPrice} {featuredCollection.currency}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider">ITEMS</span>
                        <p className="text-lg font-bold">{featuredCollection.items}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider">TOTAL VOLUME</span>
                        <p className="text-lg font-bold">{featuredCollection.totalVolume} {featuredCollection.currency}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider">LISTED</span>
                        <p className="text-lg font-bold">{featuredCollection.listed}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Controls - OpenSea Style */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-0.5">
                  <button className="px-2 py-1 rounded text-xs font-medium bg-neon-green/20 text-neon-green border border-neon-green/40">NFTs</button>
                  <button className="px-2 py-1 rounded text-xs font-medium text-gray-400 hover:text-off-white">Tokens</button>
                </div>
                <div className="flex items-center space-x-1">
                  {TIME_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedTimeFilter(filter.id)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedTimeFilter === filter.id
                          ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                          : 'text-gray-400 hover:text-off-white'
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Refresh Button */}
                <button
                  onClick={refreshMarketplaceData}
                  disabled={refreshing}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-off-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'}`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm text-off-white"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1 text-gray-400 hover:text-off-white"
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Marketplace Stats */}
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-off-white">Discovery Marketplace</h3>
                  <p className="text-sm text-gray-400">
                    {loading ? 'Loading assets...' : `${assets.length} assets available for trading`}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <p className="text-neon-green font-semibold">
                      {loading ? '...' : assets.filter(a => a.isActive).length}
                    </p>
                    <p className="text-gray-400">Active Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-electric-mint font-semibold">
                      {loading ? '...' : assets.filter(a => a.verified).length}
                    </p>
                    <p className="text-gray-400">Verified</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-400 font-semibold">
                      {loading ? '...' : assets.filter(a => a.currency === 'TRUST').length}
                    </p>
                    <p className="text-gray-400">TRUST Assets</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Collections Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse bg-gray-900 border-gray-700">
                    <div className="h-48 bg-gray-800 rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-800 rounded mb-2" />
                      <div className="h-3 bg-gray-800 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-red-400 mb-4">
                    <Package className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">Failed to load assets</p>
                    <p className="text-sm text-gray-400">{error}</p>
                  </div>
                  <Button onClick={refreshMarketplaceData} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : assets.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Package className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">No assets found</p>
                    <p className="text-sm">No valid assets are currently available for trading</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Old listings with invalid token IDs have been filtered out. Create new listings to see them here.
                    </p>
                  </div>
                  <Button onClick={refreshMarketplaceData} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              ) : (
                assets.map((asset, index) => (
                  <motion.div
                    key={asset.listingId || asset.id || `asset-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => handleCollectionClick(asset.assetId || asset.id)}
                  >
                    <Card className="overflow-hidden bg-gray-900 border-gray-700 hover:border-neon-green/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-green/20">
                      <div className="relative">
                        <img
                          src={asset.imageURI || asset.image}
                          alt={asset.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          <button className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                            <Heart className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        {/* Verification Badge */}
                        {asset.verificationLevel && asset.verificationLevel !== 'UNVERIFIED' && (
                          <div className="absolute top-3 left-3">
                            <div className="px-2 py-1 bg-neon-green/90 text-black text-xs font-semibold rounded-full">
                              {asset.verificationLevel}
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-green to-electric-mint flex items-center justify-center">
                            <span className="text-black font-bold text-xs">
                              {asset.name ? asset.name.charAt(0).toUpperCase() : 'A'}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-off-white group-hover:text-neon-green transition-colors">
                            {asset.name}
                          </h3>
                          {asset.verificationLevel && asset.verificationLevel !== 'UNVERIFIED' && (
                            <CheckCircle className="w-3.5 h-3.5 text-neon-green" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-400 text-xs">
                              {asset.isActive ? 'Listed' : 'Floor'}
                            </span>
                            <p className="text-sm font-medium text-off-white">
                              {formatPrice(
                                asset.price || asset.floorPrice || '0', 
                                asset.currency || 'TRUST'
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-xs">Status</span>
                            <p className={`text-sm font-medium ${asset.isActive ? 'text-neon-green' : 'text-gray-400'}`}>
                              {asset.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                        {/* Additional info for contract assets */}
                        {asset.totalValue && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Total Value:</span>
                              <span>{parseFloat(asset.totalValue).toLocaleString()} TRUST</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Seller and trading info */}
                        {asset.seller && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Seller:</span>
                              <span className="font-mono text-gray-300">
                                {asset.seller.slice(0, 6)}...{asset.seller.slice(-4)}
                              </span>
                            </div>
                            {asset.listingId && (
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Listing ID:</span>
                                <span className="font-mono text-gray-300">#{asset.listingId}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Trading button */}
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="neon"
                            className="w-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/asset/${asset.assetId || asset.id}/trade`);
                            }}
                          >
                            {asset.isActive ? 'View & Trade' : 'View Details'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar - Trending Collections - OpenSea Style */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700 sticky top-24">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-off-white uppercase tracking-wider">COLLECTION</h3>
                  <h3 className="text-xs font-medium text-off-white uppercase tracking-wider">FLOOR</h3>
                </div>
                <div className="space-y-2">
                  {mockCollections.slice(0, 10).map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleCollectionClick(collection.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={collection.logo}
                          alt={collection.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div className="flex items-center space-x-1">
                          <p className="text-xs font-medium text-off-white">{collection.name}</p>
                          {collection.verified && (
                            <CheckCircle className="w-3 h-3 text-blue-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-off-white">
                          {formatPrice(collection.floorPrice, collection.currency)}
                        </p>
                        <p className={`text-xs ${getChangeColor(collection.changeType)}`}>
                          {collection.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetMarketplace;