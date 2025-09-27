import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VerificationList from '../components/Verification/VerificationList';
import { Card, CardContent } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Loader2, AlertCircle, Shield, Plus, RefreshCw, MapPin, DollarSign, Eye, Share2, ExternalLink, Copy, QrCode } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { hederaAssetService, HederaAsset } from '../services/hederaAssetService';
import { useToast } from '../hooks/useToast';
import QRCodeGenerator from '../components/UI/QRCodeGenerator';

const Assets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-assets' | 'verifications'>('my-assets');
  
  // Hedera assets state
  const [hederaAssets, setHederaAssets] = useState<(HederaAsset & { verification?: any })[]>([]);
  const [hederaLoading, setHederaLoading] = useState(false);
  const [hederaError, setHederaError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<HederaAsset | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeTitle, setQrCodeTitle] = useState('');
  // const [totalAssets, setTotalAssets] = useState(0);

  // Wallet context
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const openAssetDetails = (asset: HederaAsset) => {
    setSelectedAsset(asset);
    setShowAssetModal(true);
  };

  const closeAssetModal = () => {
    setSelectedAsset(null);
    setShowAssetModal(false);
  };

  const shareAsset = (asset: HederaAsset) => {
    const url = `${window.location.origin}/asset/${asset.assetId}`;
    if (navigator.share) {
      navigator.share({
        title: `Asset: ${asset.name}`,
        text: `View this verified asset on TrustBridge`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Asset link copied to clipboard",
        variant: "default"
      });
    }
  };

  const copyAssetId = (assetId: string) => {
    navigator.clipboard.writeText(assetId);
    toast({
      title: "Copied!",
      description: "Asset ID copied to clipboard",
      variant: "default"
    });
  };

  const generateQRCode = (asset: HederaAsset) => {
    const url = `${window.location.origin}/asset/${asset.assetId}`;
    setQrCodeUrl(url);
    setQrCodeTitle(asset.name);
    setShowQRCode(true);
  };

  // Fetch Hedera assets
  const fetchHederaAssets = async () => {
    if (!address || !isConnected) {
      setHederaAssets([]);
      return;
    }

    setHederaLoading(true);
    setHederaError(null);
    setLoadingProgress(0);

    try {
      console.log('🔍 Fetching assets from Hedera for wallet:', address);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Get assets with verification status
      console.log('🔍 Calling getUserAssetsWithVerification with force refresh...');
      const assetsWithVerification = await hederaAssetService.getUserAssetsWithVerification(address);
      console.log('🔍 Received assets with verification:', assetsWithVerification.length);
      
      // Log verification status for debugging
      assetsWithVerification.forEach((asset, index) => {
        console.log(`Asset ${index + 1}: ${asset.name} - Verification:`, asset.verification);
      });
      
      // Complete the progress
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        setHederaAssets(assetsWithVerification);
        setHederaLoading(false);
        console.log('🔍 Assets set in state, loading complete');
      }, 300);
      
      console.log(`✅ Fetched ${assetsWithVerification.length} assets from Hedera`);
      
      toast({
        title: "Assets Loaded! 🎉",
        description: `Found ${assetsWithVerification.length} assets on Hedera blockchain`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('❌ Error fetching Hedera assets:', error);
      setHederaError(error instanceof Error ? error.message : 'Failed to fetch assets');
      setHederaLoading(false);
      
      toast({
        title: "Error Loading Assets",
        description: "Failed to fetch assets from Hedera blockchain",
        variant: 'destructive'
      });
    }
  };

  // Load Hedera assets on mount and when wallet changes
  useEffect(() => {
    if (address && isConnected) {
      fetchHederaAssets();
    } else {
      setHederaAssets([]);
    }
  }, [address, isConnected]);


  // Show error state for Hedera assets
  if (hederaError && activeTab === 'my-assets') {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8 dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-off-white/70 mb-2">Failed to load assets from Hedera</p>
            <p className="text-sm text-off-white/50 mb-4">{hederaError}</p>
            <button
              onClick={fetchHederaAssets}
              className="px-4 py-2 bg-neon-green text-black rounded-lg font-medium hover:bg-electric-mint transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8 dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            <span className="text-neon-green dark:text-neon-green light:text-neon-green">AFRICAN</span>
            <br />
            <span className="text-electric-mint dark:text-electric-mint light:text-electric-mint">ASSETS</span>
          </h1>
          <p className="text-lg sm:text-xl text-off-white/70 max-w-3xl dark:text-off-white/70 light:text-gray-700">
            Discover and invest in tokenized real-world assets across Africa. From farms to infrastructure, 
            find opportunities that match your investment goals.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('my-assets')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'my-assets'
                  ? 'bg-neon-green text-black'
                  : 'bg-dark-gray text-off-white hover:bg-medium-gray'
              }`}
            >
              My Assets
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'verifications'
                  ? 'bg-neon-green text-black'
                  : 'bg-dark-gray text-off-white hover:bg-medium-gray'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Verification Requests</span>
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'verifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-off-white">Verification Requests</h2>
                <p className="text-sm text-off-white/70 mt-1">
                  Track and manage your asset verification requests
                </p>
              </div>
            </div>
          <VerificationList 
            showCreateButton={true}
            showFilters={true}
          />
          </div>
        )}

        {activeTab === 'my-assets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
              <h2 className="text-2xl font-bold text-off-white">My Assets</h2>
                <p className="text-sm text-off-white/70 mt-1">
                  {hederaAssets.length} assets on Hedera blockchain • Each asset shows its verification status
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchHederaAssets}
                  disabled={hederaLoading}
                  className="px-4 py-2 bg-dark-gray text-off-white rounded-lg font-medium hover:bg-medium-gray transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${hederaLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              <button
                onClick={() => navigate('/dashboard/verify-asset')}
                className="px-4 py-2 bg-neon-green text-black rounded-lg font-medium hover:bg-electric-mint transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Asset</span>
              </button>
            </div>
            </div>

            {/* Hedera Assets Display */}
            {hederaLoading ? (
              <div className="text-center py-12">
                <div className="bg-gray-800/50 rounded-lg p-8 max-w-md mx-auto">
                  <Loader2 className="w-12 h-12 text-neon-green mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-white mb-2">Loading Assets...</h3>
                  <p className="text-gray-400 mb-4">
                    Fetching your assets from Hedera blockchain
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-neon-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {loadingProgress}% complete
                  </p>
                </div>
              </div>
            ) : hederaAssets.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-800/50 rounded-lg p-8 max-w-md mx-auto">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Assets Found</h3>
                  <p className="text-gray-400 mb-4">
                    {!isConnected 
                      ? "Connect your wallet to view your assets"
                      : "You haven't created any assets yet"
                    }
                  </p>
                  {isConnected && (
                    <button
                      onClick={() => navigate('/dashboard/verify-asset')}
                      className="px-4 py-2 bg-neon-green text-black rounded-lg font-medium hover:bg-electric-mint transition-colors"
                    >
                      Create Your First Asset
                    </button>
                  )}
                </div>
          </div>
        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hederaAssets.map((asset, index) => (
        <motion.div
                    key={asset.assetId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-neon-green/10 max-w-full overflow-hidden">
                      <CardContent className="p-0">
                        {/* NFT Image/Preview */}
                        <div className="relative h-48 bg-gradient-to-br from-neon-green/20 to-electric-mint/20 rounded-t-lg overflow-hidden">
                          {/* Display actual uploaded image if available */}
                          {asset.evidenceHashes && asset.evidenceHashes.length > 0 ? (
                            <img
                              src={`https://ipfs.io/ipfs/${asset.evidenceHashes[0]}`}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          
                          {/* Fallback icon display */}
                          <div 
                            className={`absolute inset-0 flex items-center justify-center ${asset.evidenceHashes && asset.evidenceHashes.length > 0 ? 'hidden' : 'flex'}`}
                            style={{ display: asset.evidenceHashes && asset.evidenceHashes.length > 0 ? 'none' : 'flex' }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50" />
                            <div className="relative z-10 text-center">
                              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                                <Shield className="w-8 h-8 text-neon-green" />
                              </div>
                              <p className="text-sm font-medium text-off-white/80">Asset NFT</p>
                            </div>
                          </div>
                          
                          {/* Verification Status Badge */}
                          <div className="absolute top-3 right-3 z-20">
                            {asset.verification && asset.verification.status === 'completed' ? (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                                Verified
                              </span>
                            ) : asset.verification && asset.verification.status === 'pending' ? (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                                Pending
                              </span>
                            ) : asset.verification && asset.verification.status === 'rejected' ? (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
                                Rejected
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
                                Not Verified
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Asset Details */}
                        <div className="p-4 min-w-0">
                          <div className="mb-3 min-w-0">
                            <h3 className="text-lg font-semibold text-off-white mb-1 break-words">
                              {asset.name}
                            </h3>
                            <p className="text-sm text-off-white/70 capitalize break-words">
                              {asset.assetType}
                            </p>
                          </div>

                          <div className="space-y-2 mb-4 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-off-white/70 min-w-0">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{asset.location.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-off-white/70">
                              <DollarSign className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{asset.valueInHbar} HBAR</span>
                            </div>
          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 min-w-0">
                            <div className="flex gap-2 min-w-0">
                              <Button
                                onClick={() => {
                                  // Helper function to safely convert BigInt values to strings
                                  const safeStringify = (obj: any): any => {
                                    return JSON.parse(JSON.stringify(obj, (key, value) =>
                                      typeof value === 'bigint' ? value.toString() : value
                                    ));
                                  };

                                  const assetData = encodeURIComponent(JSON.stringify({
                                    assetId: asset.assetId,
                                    name: asset.name,
                                    assetType: asset.assetType,
                                    location: asset.location.address || asset.location,
                                    value: asset.valueInHbar,
                                    totalValue: asset.totalValue || asset.valueInHbar.toString(),
                                    category: asset.category || 0,
                                    verificationLevel: 0
                                  }, (key, value) => typeof value === 'bigint' ? value.toString() : value));
                                  navigate(`/dashboard/verify-asset?asset=${assetData}`);
                                }}
                                className="flex-1 bg-neon-green hover:bg-electric-mint text-black text-sm"
                              >
                                {asset.verification ? 'View Details' : 'Request Verification'}
                              </Button>
                              <Button
                                onClick={() => openAssetDetails(asset)}
                                variant="outline"
                                className="px-3 bg-dark-gray hover:bg-medium-gray text-off-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() => shareAsset(asset)}
                                variant="outline"
                                className="flex-1 min-w-0 bg-dark-gray hover:bg-medium-gray text-off-white text-xs"
                              >
                                <Share2 className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">Share</span>
                              </Button>
                              <Button
                                onClick={() => window.open(`/asset/${asset.assetId}`, '_blank')}
                                variant="outline"
                                className="flex-1 min-w-0 bg-dark-gray hover:bg-medium-gray text-off-white text-xs"
                              >
                                <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">Public</span>
                              </Button>
                              <Button
                                onClick={() => generateQRCode(asset)}
                                variant="outline"
                                className="px-3 bg-dark-gray hover:bg-medium-gray text-off-white flex-shrink-0"
                              >
                                <QrCode className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => copyAssetId(asset.assetId)}
                                variant="outline"
                                className="px-3 bg-dark-gray hover:bg-medium-gray text-off-white flex-shrink-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Asset Details Modal */}
        {showAssetModal && selectedAsset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-off-white">Asset Details</h2>
                  <Button
                    variant="outline"
                    onClick={closeAssetModal}
                    className="bg-dark-gray hover:bg-medium-gray text-off-white"
                  >
                    Close
                  </Button>
          </div>
                
                <div className="space-y-6">
                  {/* Asset Header */}
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-mint/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-16 h-16 text-neon-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-off-white mb-2">{selectedAsset.name}</h3>
                      <p className="text-lg text-off-white/70 capitalize mb-4">{selectedAsset.assetType}</p>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedAsset.verification && selectedAsset.verification.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : selectedAsset.verification && selectedAsset.verification.status === 'pending'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : selectedAsset.verification && selectedAsset.verification.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {selectedAsset.verification && selectedAsset.verification.status === 'completed' ? 'Verified' :
                           selectedAsset.verification && selectedAsset.verification.status === 'pending' ? 'Pending' :
                           selectedAsset.verification && selectedAsset.verification.status === 'rejected' ? 'Rejected' :
                           'Not Verified'}
                        </span>
                        <span className="text-2xl font-bold text-neon-green">
                          {selectedAsset.valueInHbar} HBAR
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Asset Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800/50">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-off-white mb-4">Basic Information</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-off-white/70">Asset ID:</span>
                            <p className="font-mono text-sm text-off-white break-all">{selectedAsset.assetId}</p>
                          </div>
                          <div>
                            <span className="font-medium text-off-white/70">Token ID:</span>
                            <p className="font-mono text-sm text-off-white">{selectedAsset.tokenId}</p>
                          </div>
                          <div>
                            <span className="font-medium text-off-white/70">Created:</span>
                            <p className="text-sm text-off-white">{new Date(selectedAsset.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-off-white mb-4">Location Details</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-off-white/70">Address:</span>
                            <p className="text-sm text-off-white">{selectedAsset.location.address}</p>
                          </div>
                          <div>
                            <span className="font-medium text-off-white/70">City:</span>
                            <p className="text-sm text-off-white">{selectedAsset.location.city}</p>
                          </div>
                          <div>
                            <span className="font-medium text-off-white/70">State:</span>
                            <p className="text-sm text-off-white">{selectedAsset.location.state}</p>
                          </div>
                          <div>
                            <span className="font-medium text-off-white/70">Country:</span>
                            <p className="text-sm text-off-white">{selectedAsset.location.country}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Verification Details */}
                  {selectedAsset.verification && (
                    <Card className="bg-gray-800/50">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-off-white mb-4">Verification Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-off-white/70">Status:</span>
                            <p className="text-sm text-green-400">Verified</p>
                          </div>
                          <div>
                            <span className="font-medium text-off-white/70">Submitted:</span>
                            <p className="text-sm text-off-white">
                              {new Date(selectedAsset.verification.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-off-white/70">Completed:</span>
                            <p className="text-sm text-off-white">
                              {selectedAsset.verification.completedAt 
                                ? new Date(selectedAsset.verification.completedAt).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-off-white/70">Attestor:</span>
                            <p className="text-sm text-off-white">
                              {selectedAsset.verification.attestorName || 'N/A'}
                </p>
              </div>
            </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end">
                    <Button
                      onClick={() => {
                        const assetData = encodeURIComponent(JSON.stringify({
                          assetId: selectedAsset.assetId,
                          name: selectedAsset.name,
                          assetType: selectedAsset.assetType,
                          location: selectedAsset.location,
                          value: selectedAsset.valueInHbar
                        }));
                        navigate(`/dashboard/verify-asset?asset=${assetData}`);
                      }}
                      className="bg-neon-green hover:bg-electric-mint text-black"
                    >
                      {selectedAsset.verification ? 'View Verification' : 'Request Verification'}
                    </Button>
                  </div>
                </div>
              </div>
        </motion.div>
          </div>
        )}

        {/* QR Code Generator Modal */}
        {showQRCode && (
          <QRCodeGenerator
            url={qrCodeUrl}
            title={qrCodeTitle}
            onClose={() => setShowQRCode(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Assets;