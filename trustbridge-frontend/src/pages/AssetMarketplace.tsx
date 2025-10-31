import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Star, 
  Heart, 
  Package, 
  Building2,
  Globe,
  Users,
  DollarSign,
  CheckCircle,
  Grid3X3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Card, CardContent } from '../components/UI/Card';
import Button from '../components/UI/Button';
import MarketplaceAssetModal from '../components/Assets/MarketplaceAssetModal';
import ActivityFeed from '../components/Activity/ActivityFeed';
import { getAllCollectionStats, CollectionStats } from '../utils/collectionUtils';

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
  
  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1d');
  const [sortBy, setSortBy] = useState('floor');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState<any[]>([]);
  const [amcPools, setAmcPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [statusFilter, setStatusFilter] = useState<'all' | 'listed' | 'unlisted'>('all');
  const [viewType, setViewType] = useState<'assets' | 'collections'>('assets');
  const [collections, setCollections] = useState<CollectionStats[]>([]);

  // Fetch AMC pools
  const fetchAmcPools = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('🔑 Token for AMC pools:', token ? 'Found' : 'Not found');
      
      if (!token) {
        // Silently skip AMC pools fetch if no token - user might not be logged in
        return;
      }

      console.log('🔍 Fetching AMC pools from API...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/amc-pools`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 AMC pools response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const pools = Array.isArray(data) ? data : data.data?.pools || [];
        console.log('📊 Fetched AMC pools:', pools.length);
        console.log('📊 AMC pools data:', pools);
        
        // Log pool details
        pools.forEach((pool: any) => {
          console.log(`🏊 Pool: ${pool.name} (${pool.poolId}) - Status: ${pool.status}`);
        });
        
        setAmcPools(pools);
      } else {
        const errorText = await response.text();
        console.error('❌ AMC pools API error:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Failed to fetch AMC pools:', error);
    }
  };

  // Fetch ALL assets from Hedera network - NO localStorage!
  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching ALL NFTs from Hedera Mirror Node (NO localStorage)...');
      
      // Query Hedera Mirror Node for ALL NFTs from all known accounts
      const mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
      
      // Query multiple accounts to get all marketplace NFTs
      const accounts = [
        '0.0.6916959', // Marketplace/Treasury account
        '0.0.6923405', // Seller account 1
        '0.0.7028303', // Seller account 2 (your account)
      ];
      
      const allNFTs = [];
      
      for (const accountId of accounts) {
        try {
          console.log(`🔍 Querying NFTs for account ${accountId}...`);
          const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${accountId}/nfts?limit=100`);
          const data = await response.json();
          
          if (data.nfts && data.nfts.length > 0) {
            console.log(`✅ Found ${data.nfts.length} NFTs for ${accountId}`);
            allNFTs.push(...data.nfts);
          } else {
            console.log(`⏭️  No NFTs found for ${accountId}`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to query account ${accountId}:`, error);
        }
      }
      
      console.log(`📊 Total NFTs found across all accounts: ${allNFTs.length}`);
      
      // Process each NFT and extract metadata
      const nftPromises = allNFTs.map(async (nft: any) => {
        try {
          const tokenId = nft.token_id;
          const serialNumber = nft.serial_number;
          
          // Parse metadata
          let metadata: any = {};
          let metadataString = '';
          let imageUrl = '';
          
          if (nft.metadata) {
            metadataString = atob(nft.metadata); // Decode base64
            console.log(`📦 NFT ${tokenId}-${serialNumber} metadata:`, metadataString.substring(0, 200));
            
            try {
              // Try JSON parse first (if metadata is stored directly)
              metadata = JSON.parse(metadataString);
              imageUrl = metadata.image || metadata.imageURI || metadata.imageUrl || '';
              console.log(`🖼️ Parsed JSON - Image URL:`, imageUrl);
            } catch {
              // If not JSON, check if it's an IPFS CID or URL
              let ipfsUrlToFetch = metadataString;
              
              // If it's just a CID (starts with 'baf'), reconstruct the URL
              if (metadataString.startsWith('baf') && !metadataString.includes('/')) {
                ipfsUrlToFetch = `https://gateway.pinata.cloud/ipfs/${metadataString}`;
                console.log(`📦 Detected IPFS CID - reconstructed URL: ${ipfsUrlToFetch}`);
              } else if (metadataString.startsWith('http')) {
                console.log(`📡 Detected IPFS URL: ${ipfsUrlToFetch}`);
              }
              
              if (ipfsUrlToFetch.startsWith('http')) {
                console.log(`📡 Fetching metadata from IPFS...`);
                try {
                  // Fetch the metadata JSON from IPFS
                  const metadataResponse = await fetch(ipfsUrlToFetch);
                  if (metadataResponse.ok) {
                    const fetchedMetadata = await metadataResponse.json();
                    metadata = fetchedMetadata;
                    imageUrl = metadata.image || metadata.imageURI || metadata.imageUrl || '';
                    console.log(`✅ Fetched metadata from IPFS - Image URL:`, imageUrl);
                  } else {
                    // If it fails, assume it's a direct image URL (for old truncated URLs)
                    imageUrl = metadataString;
                    metadata = { 
                      imageURI: metadataString,
                      image: metadataString,
                      name: `NFT ${tokenId.slice(-6)}`
                    };
                    console.log(`⚠️ IPFS fetch failed (${metadataResponse.status}), using as direct image URL`);
                  }
                } catch (fetchError) {
                  console.warn(`⚠️ Error fetching IPFS metadata:`, fetchError);
                  // Fallback: treat as direct image URL
                  imageUrl = metadataString;
                  metadata = { 
                    imageURI: metadataString,
                    image: metadataString,
                    name: `NFT ${tokenId.slice(-6)}`
                  };
                }
              } else {
                // Try to extract minimal info (NFT:priceT or NFT:name format)
                const priceMatch = metadataString.match(/NFT:(\d+)T/);
                const nameMatch = metadataString.match(/NFT:(.+)/);
                
                if (priceMatch) {
                  metadata.price = priceMatch[1];
                }
                if (nameMatch && !priceMatch) {
                  metadata.name = nameMatch[1];
                }
                console.log(`📝 Minimal metadata - price:`, metadata.price, 'name:', metadata.name);
              }
            }
          }
          
          // Normalize IPFS URLs to use the public gateway (do this BEFORE setting placeholders)
          if (imageUrl && imageUrl.includes('indigo-recent-clam-436.mypinata.cloud')) {
            imageUrl = imageUrl.replace('indigo-recent-clam-436.mypinata.cloud', 'gateway.pinata.cloud');
            console.log(`🔄 Normalized old IPFS URL to: ${imageUrl}`);
          }
          
          // Use simple SVG placeholder if no valid image (AFTER normalization)
          if (!imageUrl) {
            const placeholderText = metadata.name || 'NFT';
            imageUrl = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231a1a1a"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2300ff88" text-anchor="middle" dy=".3em">${encodeURIComponent(placeholderText)}</text></svg>`;
            console.log(`🎨 Using SVG placeholder for ${tokenId}`);
          }
          
          // Verify blockchain state for this NFT
          let blockchainState = {
            owner: nft.account_id,
            isListed: false,
            isInEscrow: false,
            marketplaceAccount: '0.0.6916959'
          };
          
          try {
            const stateResponse = await fetch(`http://localhost:4001/api/assets/blockchain-state/${tokenId}/${serialNumber}`);
            if (stateResponse.ok) {
              const stateData = await stateResponse.json();
              if (stateData.success) {
                blockchainState = stateData.data;
                console.log(`✅ Verified blockchain state for ${tokenId}-${serialNumber}:`, blockchainState);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Failed to verify blockchain state for ${tokenId}-${serialNumber}:`, error);
          }
          
          const assetObj = {
            id: `${tokenId}-${serialNumber}`,
            tokenId,
            serialNumber,
            name: metadata.name || metadata.assetName || `NFT #${serialNumber}`,
            description: metadata.description || metadata.desc || '',
            imageURI: imageUrl,
            image: imageUrl,
            price: metadata.price || metadata.totalValue || '100',
            totalValue: metadata.totalValue || metadata.price || '100',
            owner: blockchainState.owner, // Use verified blockchain owner
            category: metadata.category || metadata.assetType || 'Digital Art',
            type: metadata.type || 'digital',
            status: blockchainState.isListed ? 'listed' : 'unlisted',
            isActive: true,
            isTradeable: true,
            isListed: blockchainState.isListed, // Use verified blockchain listing status
            isInEscrow: blockchainState.isInEscrow,
            royaltyPercentage: metadata.royaltyPercentage || '5',
            location: 'Hedera Testnet',
            createdAt: nft.created_timestamp || new Date().toISOString()
          };
          
          console.log(`✅ Final asset object:`, {
            id: assetObj.id,
            name: assetObj.name,
            imageURI: assetObj.imageURI?.substring(0, 100) + '...',
            image: assetObj.image?.substring(0, 100) + '...'
          });
          
          return assetObj;
        } catch (error) {
          console.warn(`⚠️ Failed to process NFT:`, error);
          return null;
        }
      });
      
      const marketplaceAssets = (await Promise.all(nftPromises)).filter(Boolean);
      
      // Fetch RWA assets from HCS topic
      try {
        console.log('🏛️ Fetching RWA assets from HCS topic...');
        const rwaResponse = await fetch(`${import.meta.env.VITE_API_URL}/hedera/rwa/trustbridge-assets`);
        if (rwaResponse.ok) {
          const rwaData = await rwaResponse.json();
          if (rwaData.success && rwaData.data?.assets) {
            const rwaAssets = rwaData.data.assets.map((asset: any) => {
              return {
                id: `rwa-${asset.rwaTokenId}`,
                tokenId: asset.rwaTokenId,
                name: asset.assetData?.name || asset.name || 'RWA Asset',
                description: asset.assetData?.description || '',
                displayImage: asset.assetData?.displayImage,
                imageURI: asset.assetData?.displayImage,
                image: asset.assetData?.displayImage,
                price: asset.assetData?.totalValue || '100',
                totalValue: asset.assetData?.totalValue || '100',
                owner: asset.creator,
                category: asset.assetData?.category || 'RWA',
                type: 'rwa',
                status: asset.status || 'SUBMITTED_FOR_APPROVAL',
                isActive: true,
                isTradeable: asset.status === 'APPROVED',
                location: asset.assetData?.location || '',
                expectedAPY: asset.assetData?.expectedAPY || 0,
                createdAt: asset.timestamp || new Date().toISOString()
              };
            });
            console.log('🏛️ RWA assets loaded:', rwaAssets.length);
            // Merge RWA assets with digital assets
            marketplaceAssets.push(...rwaAssets);
          }
        }
      } catch (rwaError) {
        console.warn('⚠️ Failed to fetch RWA assets:', rwaError);
      }
      
      // Deduplicate assets by ID to prevent React key warnings
      const uniqueAssets = marketplaceAssets.filter((asset, index, self) => {
        if (!asset || !asset.id) return false;
        return index === self.findIndex((a) => a && a.id === asset.id);
      });
      
      console.log('📊 Total marketplace assets (Digital + RWA):', marketplaceAssets.length);
      console.log('📊 Unique assets after deduplication:', uniqueAssets.length);
      setAssets(uniqueAssets);
      
      // Calculate collection stats
      const collectionStats = getAllCollectionStats(uniqueAssets);
      setCollections(collectionStats);
      console.log('📦 Collections calculated:', collectionStats.length);
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError('Failed to load marketplace data');
      setAssets([]);
      setCollections([]);
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

  // No mock data - all data comes from blockchain

  useEffect(() => {
    console.log('🔄 AssetMarketplace mounted - fetching data...');
    fetchMarketplaceData();
    fetchAmcPools();
  }, []);

  // Filter and sort assets
  const filteredAssets = React.useMemo(() => {
    let filtered = [...assets];
    
    console.log('🔍 Filtering assets - Selected category:', selectedCategory);
    console.log('🔍 Available AMC pools:', amcPools.length);
    
    // If trading pools category is selected, show AMC pools instead of assets
    if (selectedCategory === 'trading') {
      console.log('🏊 Trading category selected - mapping AMC pools...');
      console.log('🏊 AMC pools to map:', amcPools);
      
      filtered = amcPools.map(pool => ({
        id: pool.poolId,
        listingId: pool.poolId,
        name: pool.name,
        description: pool.description,
        imageUrl: pool.imageURI || pool.assets?.[0]?.imageUrl || pool.assets?.[0]?.imageURI || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231a1a1a"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2300ff88" text-anchor="middle" dy=".3em">POOL</text></svg>',
        price: pool.tokenPrice?.toString() || '0',
        currency: 'TRUST',
        assetType: 'Trading Pool',
        category: 'Trading Pool',
        verified: true,
        isTradeable: pool.isTradeable,
        isActive: pool.status === 'ACTIVE',
        currentAMC: pool.poolId,
        totalValue: pool.totalValue,
        tokenSupply: pool.tokenSupply,
        expectedAPY: pool.expectedAPY,
        totalInvested: pool.totalInvested,
        totalInvestors: pool.totalInvestors,
        hederaTokenId: pool.hederaTokenId,
        status: pool.status,
        listedAt: pool.createdAt,
        // Add pool-specific fields
        poolId: pool.poolId,
        poolType: pool.type,
        maturityDate: pool.maturityDate,
        minimumInvestment: pool.minimumInvestment
      }));
      
      console.log('🏊 Mapped trading pools:', filtered.length);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status (listed/unlisted)
    if (statusFilter === 'listed') {
      filtered = filtered.filter(asset => asset.isListed);
    } else if (statusFilter === 'unlisted') {
      filtered = filtered.filter(asset => !asset.isListed);
    }

    // Filter by price range
    if (priceFilter.min) {
      const minPrice = parseFloat(priceFilter.min);
      filtered = filtered.filter(asset => 
        parseFloat(asset.price || '0') >= minPrice
      );
    }
    if (priceFilter.max) {
      const maxPrice = parseFloat(priceFilter.max);
      filtered = filtered.filter(asset => 
        parseFloat(asset.price || '0') <= maxPrice
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => {
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

    // Sort assets - prioritize assets with images first
    filtered.sort((a, b) => {
      // Check if assets have images (not SVG placeholders)
      const aHasImage = a.imageURI && a.imageURI && 
        !a.imageURI.startsWith('data:image/svg+xml') && 
        !a.imageURI.includes('svg');
      const bHasImage = b.imageURI && b.imageURI && 
        !b.imageURI.startsWith('data:image/svg+xml') && 
        !b.imageURI.includes('svg');
      
      // Also check displayImage field
      const aHasDisplayImage = a.displayImage && 
        !a.displayImage.startsWith('data:image/svg+xml') && 
        !a.displayImage.includes('svg');
      const bHasDisplayImage = b.displayImage && 
        !b.displayImage.startsWith('data:image/svg+xml') && 
        !b.displayImage.includes('svg');
      
      const aHasValidImage = aHasImage || aHasDisplayImage;
      const bHasValidImage = bHasImage || bHasDisplayImage;
      
      // Priority 1: Assets with images come first
      if (aHasValidImage && !bHasValidImage) return -1;
      if (!aHasValidImage && bHasValidImage) return 1;
      
      // Priority 2: Sort by selected criteria (only if both have same image status)
      if (sortBy === 'floor' || sortBy === 'volume') {
        const aValue = parseFloat(a.price || a.floorPrice || '0');
        const bValue = parseFloat(b.price || b.floorPrice || '0');
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
      // Sort by date (most recent first)
      const aDate = new Date(a.listedAt || 0).getTime();
      const bDate = new Date(b.listedAt || 0).getTime();
      return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
    });

    return filtered;
  }, [assets, amcPools, selectedCategory, searchQuery, sortBy, sortOrder, statusFilter, priceFilter]);





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

  return (
    <div className="min-h-screen bg-black text-off-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Category Filters - OpenSea Style */}
        <div className="flex items-center space-x-1 mb-6 sm:mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded transition-all duration-200 text-xs font-medium whitespace-nowrap ${
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

        {/* Enhanced Filters - OpenSea Style */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-midnight-800 rounded-lg p-4 border border-gray-700">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400">Status:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                    : 'bg-gray-900 text-gray-400 hover:text-off-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('listed')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  statusFilter === 'listed'
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                    : 'bg-gray-900 text-gray-400 hover:text-off-white'
                }`}
              >
                Listed
              </button>
              <button
                onClick={() => setStatusFilter('unlisted')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  statusFilter === 'unlisted'
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                    : 'bg-gray-900 text-gray-400 hover:text-off-white'
                }`}
              >
                Not Listed
              </button>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400">Price:</span>
            <input
              type="number"
              placeholder="Min"
              value={priceFilter.min}
              onChange={(e) => setPriceFilter(prev => ({ ...prev, min: e.target.value }))}
              className="w-20 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-off-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon-green/50"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceFilter.max}
              onChange={(e) => setPriceFilter(prev => ({ ...prev, max: e.target.value }))}
              className="w-20 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-off-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon-green/50"
            />
            <span className="text-xs text-gray-400">TRUST</span>
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || priceFilter.min || priceFilter.max) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriceFilter({ min: '', max: '' });
              }}
              className="px-3 py-1.5 rounded text-xs font-medium text-red-400 hover:bg-red-400/10 transition-colors"
            >
              Clear Filters
            </button>
          )}

          {/* Results Count */}
          <div className="ml-auto text-xs text-gray-400">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div>
            {/* Featured Collection Banner */}
            {/* Removed featured collection banner - using real data only */}

            {/* Controls - OpenSea Style */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-0.5">
                  <button 
                    onClick={() => setViewType('assets')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      viewType === 'assets'
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                        : 'text-gray-400 hover:text-off-white'
                    }`}
                  >
                    <Package className="w-3 h-3 inline mr-1" />
                    Assets
                  </button>
                  <button 
                    onClick={() => setViewType('collections')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      viewType === 'collections'
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                        : 'text-gray-400 hover:text-off-white'
                    }`}
                  >
                    <Layers className="w-3 h-3 inline mr-1" />
                    Collections
                  </button>
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

            {/* Collections or Assets Grid */}
            {viewType === 'collections' ? (
              /* Collections Grid */
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {collections.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No collections found</p>
                  </div>
                ) : (
                  collections.map((collection, index) => (
                    <motion.div
                      key={collection.collectionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group cursor-pointer"
                      onClick={() => {
                        // Filter assets by this collection
                        setViewType('assets');
                        setSearchQuery(collection.collectionName);
                      }}
                    >
                      <Card className="overflow-hidden bg-gray-900 border-gray-700 hover:border-neon-green/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-green/20">
                        {/* Collection Banner */}
                        <div className="relative h-32 bg-gradient-to-br from-neon-green/20 to-emerald-500/20">
                          {collection.bannerImage && (
                            <img
                              src={collection.bannerImage}
                              alt={collection.collectionName}
                              className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                        </div>

                        <CardContent className="p-4">
                          {/* Collection Name */}
                          <h3 className="text-lg font-bold text-off-white mb-3 group-hover:text-neon-green transition-colors">
                            {collection.collectionName}
                          </h3>

                          {/* Collection Stats */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-midnight-800 rounded-lg p-2">
                              <p className="text-xs text-gray-400">Floor</p>
                              <p className="text-sm font-bold text-neon-green">
                                {collection.floorPrice > 0 ? `${collection.floorPrice.toFixed(0)} T` : '---'}
                              </p>
                            </div>
                            <div className="bg-midnight-800 rounded-lg p-2">
                              <p className="text-xs text-gray-400">Volume</p>
                              <p className="text-sm font-bold text-off-white">
                                {collection.totalVolume.toFixed(0)} T
                              </p>
                            </div>
                            <div className="bg-midnight-800 rounded-lg p-2">
                              <p className="text-xs text-gray-400">Items</p>
                              <p className="text-sm font-bold text-off-white">
                                {collection.totalItems}
                              </p>
                            </div>
                            <div className="bg-midnight-800 rounded-lg p-2">
                              <p className="text-xs text-gray-400">Owners</p>
                              <p className="text-sm font-bold text-off-white">
                                {collection.uniqueOwners}
                              </p>
                            </div>
                          </div>

                          {/* Listed Items Badge */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {collection.listedItems} listed
                            </span>
                            {collection.verified && (
                              <CheckCircle className="w-4 h-4 text-neon-green" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              /* Asset Grid */
              <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
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
                filteredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id || asset.listingId || `asset-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setShowAssetDetail(true);
                    }}
                  >
                    <Card className="overflow-hidden bg-gray-900 border-gray-700 hover:border-neon-green/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-green/20">
                                              <div className="relative">
                          <img
                            src={asset.displayImage || asset.imageURI || asset.image}
                            alt={asset.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const currentSrc = (e.target as HTMLImageElement).src;
                              // If already using fallback, don't change it
                              if (currentSrc.includes('data:image/svg+xml')) {
                                return;
                              }
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231a1a1a"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2300ff88" text-anchor="middle" dy=".3em">NFT</text></svg>';
                            }}
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
                        {/* Royalty Badge */}
                        {asset.royaltyPercentage && parseFloat(asset.royaltyPercentage) > 0 && (
                          <div className="absolute bottom-3 left-3">
                            <div className="px-2 py-1 bg-purple-600/90 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                              <span>👑</span>
                              <span>{asset.royaltyPercentage}% Royalty</span>
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
                              {asset.assetType === 'Trading Pool' ? 'Token Price' : (asset.isActive ? 'Listed' : 'Floor')}
                            </span>
                            <p className="text-sm font-medium text-off-white">
                              {formatPrice(
                                asset.price || asset.floorPrice || '0', 
                                asset.currency || 'TRUST'
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 text-xs">
                              {asset.assetType === 'Trading Pool' ? 'Status' : 'Listing'}
                            </span>
                            <p className={`text-sm font-medium ${asset.assetType === 'Trading Pool' ? (asset.status === 'ACTIVE' ? 'text-neon-green' : 'text-yellow-400') : (asset.isListed ? 'text-neon-green' : 'text-gray-400')}`}>
                              {asset.assetType === 'Trading Pool' ? asset.status : (asset.isListed ? 'For Sale' : 'Not Listed')}
                            </p>
                          </div>
                        </div>
                        {/* Additional info for trading pools */}
                        {asset.assetType === 'Trading Pool' && (
                          <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Total Value:</span>
                              <span>{formatPrice(asset.totalValue?.toString() || '0', 'TRUST')}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Expected APY:</span>
                              <span className="text-green-400">{asset.expectedAPY}%</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Investors:</span>
                              <span>{asset.totalInvestors}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Min Investment:</span>
                              <span>{formatPrice(asset.minimumInvestment?.toString() || '0', 'TRUST')}</span>
                            </div>
                          </div>
                        )}
                        {/* Additional info for regular assets */}
                        {asset.assetType !== 'Trading Pool' && asset.totalValue && (
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
                              if (asset.assetType === 'Trading Pool') {
                                // Show pool trading modal
                                setSelectedAsset(asset);
                                setShowAssetDetail(true);
                              } else {
                                setSelectedAsset(asset);
                                setShowAssetDetail(true);
                              }
                            }}
                          >
                            {asset.assetType === 'Trading Pool' 
                              ? (asset.status === 'ACTIVE' ? 'Trade Pool' : 'View Pool') 
                              : (asset.isActive ? 'View & Trade' : 'View Details')
                            }
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
            )}
          </div>

          {/* Removed sidebar - using real data only */}
        </div>

        {/* Activity Feed - Right Sidebar */}
          <div className="lg:col-span-1">
          <ActivityFeed limit={15} showStats={true} />
        </div>
      </div>

      {/* Marketplace Asset Modal - Discovery Focused */}
      <MarketplaceAssetModal
        isOpen={showAssetDetail}
        onClose={() => {
          setShowAssetDetail(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        onAssetUpdate={() => {
          // Refresh marketplace data after buying
          fetchMarketplaceData();
        }}
      />
    </div>
  );
};

export default AssetMarketplace;