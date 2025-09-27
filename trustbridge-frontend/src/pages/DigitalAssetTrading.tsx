import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { 
  Heart, 
  Share2, 
  Copy, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Eye,
  Star,
  Tag,
  DollarSign,
  Calendar,
  Zap,
  Shield,
  Award,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Wallet,
  History,
  BarChart3,
  Activity
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
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
  currentPrice: string;
  owner: string;
  creator: string;
  royaltyPercentage: number;
  isTradeable: boolean;
  isAuctionable: boolean;
  auctionEndTime?: number;
  startingPrice?: string;
  reservePrice?: string;
  buyNowPrice?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
    rarity: string;
  }>;
  collection: {
    name: string;
    description: string;
    image: string;
  };
  stats: {
    views: number;
    likes: number;
    shares: number;
    volume: string;
    floorPrice: string;
    highestBid: string;
    totalSupply: number;
    owners: number;
  };
  history: Array<{
    type: 'mint' | 'sale' | 'bid' | 'transfer' | 'auction_start' | 'auction_end';
    price?: string;
    from?: string;
    to?: string;
    timestamp: number;
    txHash: string;
  }>;
  offers: Array<{
    id: string;
    bidder: string;
    amount: string;
    timestamp: number;
    expiresAt: number;
    status: 'active' | 'accepted' | 'rejected' | 'expired';
  }>;
}

const DigitalAssetTrading: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address, isConnected } = useWallet();
  const { user } = useAuth();
  
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'offers' | 'analytics'>('overview');
  const [showBidModal, setShowBidModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDuration, setOfferDuration] = useState(7); // days
  const [sellPrice, setSellPrice] = useState('');
  const [isAuction, setIsAuction] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState(24); // hours
  const [isProcessing, setIsProcessing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if (assetId) {
      loadAsset();
    }
  }, [assetId]);

  const loadAsset = async () => {
    setLoading(true);
    try {
      // Simulate loading asset data
      const mockAsset: AssetData = {
        id: assetId!,
        name: 'Digital Sunset #001',
        description: 'A stunning digital artwork depicting a beautiful sunset over a virtual landscape. Created using advanced AI algorithms and traditional digital art techniques.',
        imageURI: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/800x600',
        category: 'Digital Art',
        assetType: 'AI-Generated Artwork',
        location: 'Metaverse Gallery',
        totalValue: '2500',
        currentPrice: '1.5',
        owner: '0x1234...5678',
        creator: '0xabcd...efgh',
        royaltyPercentage: 2.5,
        isTradeable: true,
        isAuctionable: true,
        auctionEndTime: Date.now() + (48 * 60 * 60 * 1000), // 48 hours
        startingPrice: '0.5',
        reservePrice: '1.0',
        buyNowPrice: '2.0',
        attributes: [
          { trait_type: 'Style', value: 'Abstract', rarity: 'common' },
          { trait_type: 'Color', value: 'Sunset Orange', rarity: 'uncommon' },
          { trait_type: 'Mood', value: 'Peaceful', rarity: 'rare' },
          { trait_type: 'Resolution', value: '4K', rarity: 'epic' }
        ],
        collection: {
          name: 'Digital Dreams',
          description: 'A collection of AI-generated digital artworks',
          image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43/300x300'
        },
        stats: {
          views: 1247,
          likes: 89,
          shares: 23,
          volume: '12.5',
          floorPrice: '0.8',
          highestBid: '1.2',
          totalSupply: 1,
          owners: 1
        },
        history: [
          {
            type: 'mint',
            to: '0xabcd...efgh',
            timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
            txHash: '0x123...abc'
          },
          {
            type: 'sale',
            price: '1.0',
            from: '0xabcd...efgh',
            to: '0x1234...5678',
            timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000),
            txHash: '0x456...def'
          }
        ],
        offers: [
          {
            id: '1',
            bidder: '0x9876...5432',
            amount: '1.2',
            timestamp: Date.now() - (2 * 60 * 60 * 1000),
            expiresAt: Date.now() + (5 * 24 * 60 * 60 * 1000),
            status: 'active'
          }
        ]
      };
      
      setAsset(mockAsset);
    } catch (error) {
      console.error('Error loading asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to load asset data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to place a bid',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      await contractService.placeBid(assetId!, bidAmount);
      toast({
        title: 'Bid Placed',
        description: `Your bid of ${bidAmount} TRUST has been placed`,
        variant: 'default'
      });
      setShowBidModal(false);
      setBidAmount('');
      loadAsset(); // Refresh data
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: 'Error',
        description: 'Failed to place bid',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOffer = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to make an offer',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      await contractService.makeOffer(assetId!, offerAmount, offerDuration);
      toast({
        title: 'Offer Made',
        description: `Your offer of ${offerAmount} TRUST has been made`,
        variant: 'default'
      });
      setShowOfferModal(false);
      setOfferAmount('');
      loadAsset(); // Refresh data
    } catch (error) {
      console.error('Error making offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to make offer',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSell = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to sell',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (isAuction) {
        await contractService.createAuction(assetId!, sellPrice, auctionDuration);
        toast({
          title: 'Auction Created',
          description: `Auction started with starting price ${sellPrice} TRUST`,
          variant: 'default'
        });
      } else {
        // Note: tokenId not available in this component - fallback logic will find correct token
        await contractService.createListing(assetId!, sellPrice);
        toast({
          title: 'Listing Created',
          description: `Asset listed for ${sellPrice} TRUST`,
          variant: 'default'
        });
      }
      setShowSellModal(false);
      setSellPrice('');
      loadAsset(); // Refresh data
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to create listing',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to buy',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      await contractService.buyAsset(assetId!, asset?.buyNowPrice!);
      toast({
        title: 'Purchase Successful',
        description: `You have successfully purchased ${asset?.name}`,
        variant: 'default'
      });
      loadAsset(); // Refresh data
    } catch (error) {
      console.error('Error buying asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to purchase asset',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Implement like functionality
  };

  const handleWatch = () => {
    setWatching(!watching);
    // TODO: Implement watchlist functionality
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'Asset link copied to clipboard',
      variant: 'default'
    });
  };

  const isOwner = asset && address === asset.owner;
  const isCreator = asset && address === asset.creator;
  const canBid = asset && asset.isAuctionable && !isOwner && asset.auctionEndTime && asset.auctionEndTime > Date.now();
  const canBuy = asset && asset.isTradeable && !isOwner && asset.buyNowPrice;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-neon-green mx-auto mb-4" />
            <p className="text-sm text-off-white/70">Loading asset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-off-white/70">Asset not found</p>
            <Button
              onClick={() => navigate('/dashboard/marketplace')}
              className="mt-4"
            >
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/dashboard/marketplace')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              ← Back to Marketplace
            </Button>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{asset.collection.name}</span>
              <span>•</span>
              <span>{asset.category}</span>
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-off-white mb-2">{asset.name}</h1>
              <p className="text-sm text-electric-mint mb-4">{asset.description}</p>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{asset.stats.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{asset.stats.owners} owners</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>{asset.stats.volume} TRUST volume</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLike}
                variant="outline"
                size="sm"
                className={`text-xs ${liked ? 'text-red-400 border-red-400' : ''}`}
              >
                <Heart className={`w-3 h-3 mr-1 ${liked ? 'fill-current' : ''}`} />
                {asset.stats.likes + (liked ? 1 : 0)}
              </Button>
              <Button
                onClick={handleWatch}
                variant="outline"
                size="sm"
                className={`text-xs ${watching ? 'text-neon-green border-neon-green' : ''}`}
              >
                <Eye className="w-3 h-3 mr-1" />
                {watching ? 'Watching' : 'Watch'}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Image */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={asset.imageURI}
                    alt={asset.name}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex gap-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'history', label: 'History', icon: History },
                    { id: 'offers', label: 'Offers', icon: Tag },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded transition-colors ${
                          activeTab === tab.id
                            ? 'text-neon-green border-b-2 border-neon-green'
                            : 'text-gray-400 hover:text-off-white'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Attributes */}
                        <div>
                          <h4 className="text-sm font-medium text-off-white mb-3">Attributes</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {asset.attributes.map((attr, index) => (
                              <div key={index} className="bg-gray-800 p-3 rounded text-center">
                                <p className="text-xs text-gray-400 mb-1">{attr.trait_type}</p>
                                <p className="text-sm font-medium text-off-white mb-1">{attr.value}</p>
                                <p className="text-xs text-electric-mint">{attr.rarity}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Collection Info */}
                        <div>
                          <h4 className="text-sm font-medium text-off-white mb-3">Collection</h4>
                          <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                            <img
                              src={asset.collection.image}
                              alt={asset.collection.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h5 className="text-sm font-medium text-off-white">{asset.collection.name}</h5>
                              <p className="text-xs text-gray-400">{asset.collection.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'history' && (
                      <div className="space-y-4">
                        {asset.history.map((event, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                              {event.type === 'mint' && <Award className="w-4 h-4 text-neon-green" />}
                              {event.type === 'sale' && <DollarSign className="w-4 h-4 text-green-400" />}
                              {event.type === 'bid' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                              {event.type === 'transfer' && <ArrowUpRight className="w-4 h-4 text-purple-400" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-off-white">
                                {event.type === 'mint' && 'Minted'}
                                {event.type === 'sale' && 'Sold'}
                                {event.type === 'bid' && 'Bid placed'}
                                {event.type === 'transfer' && 'Transferred'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {event.price && `${event.price} TRUST`}
                                {event.from && ` from ${event.from}`}
                                {event.to && ` to ${event.to}`}
                              </p>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'offers' && (
                      <div className="space-y-4">
                        {asset.offers.length > 0 ? (
                          asset.offers.map((offer) => (
                            <div key={offer.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <Tag className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-off-white">{offer.amount} TRUST</p>
                                  <p className="text-xs text-gray-400">by {offer.bidder}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  Expires {new Date(offer.expiresAt).toLocaleDateString()}
                                </span>
                                {isOwner && (
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline" className="text-xs">
                                      Accept
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No offers yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'analytics' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-800 p-4 rounded-lg text-center">
                            <p className="text-xs text-gray-400 mb-1">Floor Price</p>
                            <p className="text-lg font-bold text-off-white">{asset.stats.floorPrice} TRUST</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg text-center">
                            <p className="text-xs text-gray-400 mb-1">Volume</p>
                            <p className="text-lg font-bold text-off-white">{asset.stats.volume} TRUST</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg text-center">
                            <p className="text-xs text-gray-400 mb-1">Owners</p>
                            <p className="text-lg font-bold text-off-white">{asset.stats.owners}</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg text-center">
                            <p className="text-xs text-gray-400 mb-1">Views</p>
                            <p className="text-lg font-bold text-off-white">{asset.stats.views}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Current Price</p>
                    <p className="text-2xl font-bold text-off-white">{asset.currentPrice} TRUST</p>
                    <p className="text-xs text-electric-mint">≈ ${(parseFloat(asset.currentPrice) * 0.1).toFixed(2)} USD</p>
                  </div>

                  {asset.auctionEndTime && asset.auctionEndTime > Date.now() && (
                    <div className="bg-yellow-500/20 border border-yellow-500/40 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">Auction Ending</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        {Math.floor((asset.auctionEndTime - Date.now()) / (1000 * 60 * 60))} hours left
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {isOwner ? (
                      <Button
                        onClick={() => setShowSellModal(true)}
                        className="w-full bg-neon-green text-black hover:bg-electric-mint text-sm"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Sell Asset
                      </Button>
                    ) : (
                      <>
                        {canBuy && (
                          <Button
                            onClick={handleBuyNow}
                            disabled={isProcessing}
                            className="w-full bg-neon-green text-black hover:bg-electric-mint text-sm"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 mr-2" />
                            )}
                            Buy Now
                          </Button>
                        )}
                        {canBid && (
                          <Button
                            onClick={() => setShowBidModal(true)}
                            variant="outline"
                            className="w-full text-sm"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Place Bid
                          </Button>
                        )}
                        <Button
                          onClick={() => setShowOfferModal(true)}
                          variant="outline"
                          className="w-full text-sm"
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          Make Offer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Asset Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-off-white">{asset.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-off-white">{asset.assetType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-off-white">{asset.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Royalty:</span>
                    <span className="text-off-white">{asset.royaltyPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Owner:</span>
                    <span className="text-off-white font-mono">{asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Creator:</span>
                    <span className="text-off-white font-mono">{asset.creator.slice(0, 6)}...{asset.creator.slice(-4)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {/* Bid Modal */}
          {showBidModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-off-white mb-4">Place a Bid</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Bid Amount (TRUST)
                    </label>
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Current highest bid: {asset.stats.highestBid} TRUST
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowBidModal(false)}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBid}
                      disabled={!bidAmount || isProcessing}
                      className="flex-1 bg-neon-green text-black hover:bg-electric-mint text-sm"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Place Bid
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Offer Modal */}
          {showOfferModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-off-white mb-4">Make an Offer</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Offer Amount (TRUST)
                    </label>
                    <Input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Enter offer amount"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Offer Duration (days)
                    </label>
                    <Input
                      type="number"
                      value={offerDuration}
                      onChange={(e) => setOfferDuration(parseInt(e.target.value))}
                      placeholder="7"
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowOfferModal(false)}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleOffer}
                      disabled={!offerAmount || isProcessing}
                      className="flex-1 bg-neon-green text-black hover:bg-electric-mint text-sm"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Make Offer
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Sell Modal */}
          {showSellModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-semibold text-off-white mb-4">Sell Asset</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isAuction"
                      checked={isAuction}
                      onChange={(e) => setIsAuction(e.target.checked)}
                      className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                    />
                    <label htmlFor="isAuction" className="text-sm font-medium text-off-white">
                      Create Auction
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      {isAuction ? 'Starting Price' : 'Price'} (TRUST)
                    </label>
                    <Input
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      placeholder="Enter price"
                      className="w-full"
                    />
                  </div>

                  {isAuction && (
                    <div>
                      <label className="block text-sm font-medium text-off-white mb-2">
                        Auction Duration (hours)
                      </label>
                      <Input
                        type="number"
                        value={auctionDuration}
                        onChange={(e) => setAuctionDuration(parseInt(e.target.value))}
                        placeholder="24"
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowSellModal(false)}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSell}
                      disabled={!sellPrice || isProcessing}
                      className="flex-1 bg-neon-green text-black hover:bg-electric-mint text-sm"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {isAuction ? 'Start Auction' : 'List for Sale'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DigitalAssetTrading;
