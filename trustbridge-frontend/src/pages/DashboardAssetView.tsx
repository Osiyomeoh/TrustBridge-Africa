import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { 
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  MapPin,
  Shield,
  CheckCircle,
  Clock,
  ExternalLink,
  Copy,
  Share2,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  Star,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Gavel
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../contexts/WalletContext';
import { contractService } from '../services/contractService';

interface AssetData {
  id: string;
  name: string;
  description: string;
  imageURI: string;
  category: string;
  assetType: string;
  location: string;
  totalValue: string;
  owner: string;
  createdAt: string;
  isTradeable: boolean;
  listingId?: string;
  price?: string;
  status: 'created' | 'listed' | 'sold' | 'cancelled';
}

const DashboardAssetView: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTradingOptions, setShowTradingOptions] = useState(false);

  useEffect(() => {
    if (assetId) {
      fetchAssetData(assetId);
    }
  }, [assetId]);

  const fetchAssetData = async (id: string) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching asset data for ID:', id);
      
      // First, try to fetch from sessionStorage (stored during asset creation)
      const storedAssetData = sessionStorage.getItem(`asset_${id}`);
      if (storedAssetData) {
        try {
          const assetData = JSON.parse(storedAssetData);
          console.log('✅ Found asset data in sessionStorage:', assetData);
          setAssetData(assetData);
          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Error parsing stored asset data:', parseError);
        }
      }

      // Try to get asset data from contract using tokenId
      try {
        console.log('🔍 Fetching asset data from contract for tokenId:', id);
        const nftData = await contractService.getNFTMetadata(parseInt(id), '0xa620f55Ec17bf98d9898E43878c22c10b5324069');
        
        if (nftData) {
          const assetData: AssetData = {
            id: id,
            name: nftData.metadata?.name || `Asset #${id}`,
            description: nftData.metadata?.description || 'Digital asset',
            imageURI: nftData.metadata?.image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center',
            category: 'Digital Art',
            assetType: 'Digital Asset',
            location: 'blockchain',
            totalValue: '1000',
            owner: '0xa620f55Ec17bf98d9898E43878c22c10b5324069',
            createdAt: new Date().toISOString(),
            isTradeable: true,
            status: 'created'
          };
          
          console.log('✅ Found asset data from contract:', assetData);
          setAssetData(assetData);
          setLoading(false);
          return;
        }
      } catch (contractError) {
        console.warn('Failed to fetch from contract:', contractError.message);
      }

      // Fallback: Create asset data with the provided ID
      const assetData: AssetData = {
        id: id,
        name: `Asset #${id}`,
        description: 'Digital asset',
        imageURI: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center',
        category: 'Digital Art',
        assetType: 'Digital Asset',
        location: 'blockchain',
        totalValue: '1000',
        owner: '0xa620f55Ec17bf98d9898E43878c22c10b5324069',
        createdAt: new Date().toISOString(),
        isTradeable: true,
        status: 'created'
      };
      
      console.log('✅ Using fallback asset data:', assetData);
      setAssetData(assetData);
    } catch (err) {
      console.error('Error fetching asset data:', err);
      setError('Failed to load asset data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = () => {
    toast({
      title: 'Edit Asset',
      description: 'Asset editing functionality coming soon!',
      variant: 'default'
    });
  };

  const handleDeleteAsset = () => {
    toast({
      title: 'Delete Asset',
      description: 'Asset deletion functionality coming soon!',
      variant: 'default'
    });
  };

  const handleListForTrading = async () => {
    if (!assetData) return;
    
    try {
      setLoading(true);
      
      // Create a listing for the asset
      // Pass the NFT token ID to ensure correct marketplace listing
      const result = await contractService.createListing(
        assetData.id,
        assetData.totalValue,
        assetData.tokenId // Pass the actual NFT token ID
      );
      
      toast({
        title: 'Asset Listed for Trading!',
        description: `Your asset "${assetData.name}" has been listed for trading. Listing ID: ${result.listingId}`,
        variant: 'default'
      });
      
      // Update asset status
      setAssetData(prev => prev ? {
        ...prev,
        status: 'listed',
        listingId: result.listingId,
        price: assetData.totalValue
      } : null);
      
    } catch (error) {
      console.error('Error listing asset:', error);
      toast({
        title: 'Error Listing Asset',
        description: error instanceof Error ? error.message : 'Failed to list asset for trading',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnMarketplace = () => {
    if (assetData?.listingId) {
      navigate(`/dashboard/marketplace`);
    }
  };

  const handleStartTrading = () => {
    if (assetData) {
      navigate(`/dashboard/asset/${assetData.id}/trade`);
    }
  };

  const copyAssetId = () => {
    if (assetData) {
      navigator.clipboard.writeText(assetData.id);
      toast({
        title: 'Asset ID Copied',
        description: 'Asset ID has been copied to clipboard',
        variant: 'default'
      });
    }
  };

  const shareAsset = () => {
    if (assetData) {
      const url = `${window.location.origin}/asset/${assetData.id}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'Asset Link Copied',
        description: 'Shareable link has been copied to clipboard',
        variant: 'default'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assetData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-off-white mb-4">Asset Not Found</h1>
            <p className="text-off-white/70 mb-6">{error || 'The requested asset could not be found.'}</p>
            <Button onClick={() => navigate('/dashboard/profile')}>
              Back to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/profile')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-off-white">{assetData.name}</h1>
              <p className="text-off-white/70">Asset ID: {assetData.id.slice(0, 8)}...</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={copyAssetId}
              className="flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy ID</span>
            </Button>
            <Button
              variant="outline"
              onClick={shareAsset}
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTradingOptions(!showTradingOptions)}
              className="flex items-center space-x-2"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Asset Display */}
          <div className="lg:col-span-2">
            <Card className="bg-midnight-800/50 border-medium-gray/30 mb-6">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <img
                    src={assetData.imageURI}
                    alt={assetData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      assetData.status === 'created' ? 'bg-blue-500/20 text-blue-400' :
                      assetData.status === 'listed' ? 'bg-green-500/20 text-green-400' :
                      assetData.status === 'sold' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {assetData.status === 'created' ? 'Created' :
                       assetData.status === 'listed' ? 'Listed' :
                       assetData.status === 'sold' ? 'Sold' : 'Cancelled'}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-off-white mb-2">{assetData.name}</h2>
                      <p className="text-off-white/70 text-lg">{assetData.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-electric-mint">
                        {assetData.totalValue} TRUST
                      </div>
                      <div className="text-sm text-off-white/60">Total Value</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-neon-green" />
                      <div>
                        <div className="text-sm text-off-white/60">Category</div>
                        <div className="font-medium text-off-white">{assetData.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-neon-green" />
                      <div>
                        <div className="text-sm text-off-white/60">Location</div>
                        <div className="font-medium text-off-white">{assetData.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-neon-green" />
                      <div>
                        <div className="text-sm text-off-white/60">Created</div>
                        <div className="font-medium text-off-white">
                          {new Date(assetData.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-neon-green" />
                      <div>
                        <div className="text-sm text-off-white/60">Owner</div>
                        <div className="font-medium text-off-white font-mono text-sm">
                          {assetData.owner.slice(0, 6)}...{assetData.owner.slice(-4)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Actions */}
            {showTradingOptions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="bg-midnight-800/50 border-medium-gray/30">
                  <CardHeader>
                    <CardTitle className="text-off-white">Trading Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assetData.status === 'created' && (
                      <div className="flex items-center justify-between p-4 bg-midnight-700/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-off-white">List for Trading</h3>
                          <p className="text-sm text-off-white/70">Make your asset available for purchase</p>
                        </div>
                        <Button onClick={handleListForTrading} disabled={loading}>
                          {loading ? 'Listing...' : 'List Asset'}
                        </Button>
                      </div>
                    )}
                    
                    {assetData.status === 'listed' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-green-400">Currently Listed</h3>
                            <p className="text-sm text-off-white/70">
                              Price: {assetData.price} TRUST | Listing ID: {assetData.listingId}
                            </p>
                          </div>
                          <Button onClick={handleViewOnMarketplace} variant="outline">
                            View on Marketplace
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-midnight-700/50 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-off-white">Start Trading</h3>
                            <p className="text-sm text-off-white/70">Access advanced trading features</p>
                          </div>
                          <Button onClick={handleStartTrading} className="bg-neon-green hover:bg-neon-green/80 text-midnight-900">
                            Start Trading
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-4 bg-midnight-700/50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-off-white">Edit Asset</h3>
                        <p className="text-sm text-off-white/70">Update asset details and metadata</p>
                      </div>
                      <Button onClick={handleEditAsset} variant="outline">
                        Edit
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-midnight-700/50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-off-white">Delete Asset</h3>
                        <p className="text-sm text-off-white/70">Permanently remove this asset</p>
                      </div>
                      <Button onClick={handleDeleteAsset} variant="outline" className="text-red-400 hover:text-red-300">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Asset Stats */}
            <Card className="bg-midnight-800/50 border-medium-gray/30">
              <CardHeader>
                <CardTitle className="text-off-white">Asset Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70">Views</span>
                  <span className="text-off-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70">Favorites</span>
                  <span className="text-off-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70">Shares</span>
                  <span className="text-off-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70">Offers</span>
                  <span className="text-off-white font-semibold">0</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-midnight-800/50 border-medium-gray/30">
              <CardHeader>
                <CardTitle className="text-off-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleStartTrading}
                  className="w-full justify-start bg-neon-green hover:bg-neon-green/80 text-midnight-900"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Start Trading
                </Button>
                <Button 
                  onClick={() => setShowTradingOptions(!showTradingOptions)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  Trading Options
                </Button>
                <Button 
                  onClick={() => navigate(`/asset/${assetData.id}`)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Page
                </Button>
                <Button 
                  onClick={copyAssetId}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Asset ID
                </Button>
              </CardContent>
            </Card>

            {/* Asset Details */}
            <Card className="bg-midnight-800/50 border-medium-gray/30">
              <CardHeader>
                <CardTitle className="text-off-white">Asset Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-off-white/60 mb-1">Asset Type</div>
                  <div className="text-off-white font-medium">{assetData.assetType}</div>
                </div>
                <div>
                  <div className="text-sm text-off-white/60 mb-1">Blockchain</div>
                  <div className="text-off-white font-medium">Hedera Testnet</div>
                </div>
                <div>
                  <div className="text-sm text-off-white/60 mb-1">Contract</div>
                  <div className="text-off-white font-medium font-mono text-xs">
                    CoreAssetFactory
                  </div>
                </div>
                <div>
                  <div className="text-sm text-off-white/60 mb-1">Token Standard</div>
                  <div className="text-off-white font-medium">ERC-721</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAssetView;
