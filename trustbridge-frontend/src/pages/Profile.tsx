import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Copy, 
  MoreHorizontal, 
  Plus, 
  Settings,
  Building2,
  Globe,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Eye,
  CheckCircle,
  AlertCircle,
  Zap,
  Loader2,
  RefreshCw,
  Wallet,
  Grid3X3,
  Heart,
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import AssetDetailModal from '../components/Assets/AssetDetailModal';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../hooks/useToast';
import { usePortfolio, useInvestments, useAssetByOwner } from '../hooks/useApi';
import { contractService } from '../services/contractService';
import hederaAssetService, { HederaAsset } from '../services/hederaAssetService';

const Profile: React.FC = () => {
  const { user, authStep, isAuthenticated } = useAuth();
  const { address, isConnected, hederaClient } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('portfolio');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chainFilter, setChainFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  
  // Fetch real data from API
  const { data: portfolioData, loading: portfolioLoading, error: portfolioError } = usePortfolio();
  const { loading: investmentsLoading } = useInvestments();
  const { data: userAssetsData, loading: assetsLoading, error: assetsError } = useAssetByOwner(address || '');
  
  // State for user's NFTs from smart contracts
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  
  // State for Hedera digital assets
  const [hederaAssets, setHederaAssets] = useState<HederaAsset[]>([]);
  const [hederaAssetsLoading, setHederaAssetsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  
  // Check authentication status and redirect if needed
  useEffect(() => {
    console.log('Profile - Auth check effect triggered:', { 
      isConnected, 
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
      isAuthenticated, 
      authStep, 
      user: !!user,
      userEmail: user?.email,
      userName: user?.name
    });
    
    if (isConnected && address) {
      // Add a small delay to ensure AuthContext has completed its auth check
      const timer = setTimeout(() => {
        console.log('Profile - Delayed auth check after 500ms:', { 
          isAuthenticated, 
          authStep, 
          user: !!user 
        });
        
        // If user is not authenticated or needs to complete profile
        if (!isAuthenticated || authStep === 'wallet' || authStep === 'profile' || authStep === 'email') {
          console.log('Profile - User needs authentication, redirecting to profile completion');
          console.log('Redirecting because:', {
            notAuthenticated: !isAuthenticated,
            walletStep: authStep === 'wallet',
            profileStep: authStep === 'profile',
            emailStep: authStep === 'email',
            hasUser: !!user,
            userEmail: user?.email,
            userIncomplete: !user?.email || !user?.name
          });
          // Profile completion is handled by the centralized popup
          return;
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, isAuthenticated, authStep, user, navigate]);
  
  // Clear cache when wallet address changes
  useEffect(() => {
    if (address) {
      console.log('🔄 Wallet address changed, clearing cache for:', address);
      // Clear all NFT caches
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && typeof key === 'string' && (key.startsWith('user_nfts_') || key.startsWith('asset_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage assets
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && typeof key === 'string' && key.startsWith('asset_')) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      console.log('🧹 Cleared cache keys:', keysToRemove.length, 'localStorage,', sessionKeysToRemove.length, 'sessionStorage');
    }
  }, [address]);

  // Listen for navigation state to trigger refresh after asset creation
  useEffect(() => {
    const state = location.state as any;
    if (state?.refreshAssets) {
      console.log('🔄 Received refresh trigger from navigation, forcing asset refresh...');
      setForceRefresh(prev => !prev);
      // Clear the navigation state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    // Also check sessionStorage for refresh flag (set after buying from marketplace)
    const needsRefresh = sessionStorage.getItem('profileNeedsRefresh');
    if (needsRefresh === 'true') {
      console.log('🔄 Profile refresh flag detected (after purchase), forcing asset refresh...');
      sessionStorage.removeItem('profileNeedsRefresh');
      setForceRefresh(prev => !prev);
    }
  }, [location.state, location.pathname, navigate]);

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
        // Clear cache on force refresh
        if (forceRefresh) {
          const cacheKey = `user_nfts_${address.toLowerCase()}`;
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_timestamp`);
          console.log('🗑️ Cleared NFT cache for fresh load');
        }
        
        // Query Hedera Mirror Node directly for user's NFTs (owned + listed)
        console.log('🔍 Querying Hedera Mirror Node for NFTs...');
        const mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
        const marketplaceAccount = '0.0.6916959';
        
        // Query both user's NFTs and marketplace NFTs (to find listed assets)
        const [userResponse, marketplaceResponse] = await Promise.all([
          fetch(`${mirrorNodeUrl}/api/v1/accounts/${address}/nfts?limit=100`),
          fetch(`${mirrorNodeUrl}/api/v1/accounts/${marketplaceAccount}/nfts?limit=100`)
        ]);
        
        const response = userResponse;
        
        if (response.ok) {
          const data = await response.json();
          const userNFTs = data.nfts || [];
          console.log(`✅ Found ${userNFTs.length} NFTs owned by ${address}`);
          
          // Check marketplace for listed assets from this user
          let listedNFTs: any[] = [];
          if (marketplaceResponse.ok) {
            const marketplaceData = await marketplaceResponse.json();
            console.log(`🔍 Checking ${marketplaceData.nfts?.length || 0} marketplace NFTs for user's listings...`);
            
            // For each marketplace NFT, check if it was listed by this user
            if (marketplaceData.nfts) {
              for (const nft of marketplaceData.nfts) {
                try {
                  // Query transaction history to find who listed it
                  const txResponse = await fetch(`${mirrorNodeUrl}/api/v1/tokens/${nft.token_id}/nfts/${nft.serial_number}/transactions?limit=5&order=desc`);
                  if (txResponse.ok) {
                    const txData = await txResponse.json();
                    const listingTx = txData.transactions?.find((tx: any) => 
                      tx.receiver_account_id === marketplaceAccount && 
                      tx.sender_account_id === address
                    );
                    
                    if (listingTx) {
                      console.log(`✅ Found listed asset: ${nft.token_id}-${nft.serial_number}`);
                      listedNFTs.push({ ...nft, isListed: true, listedBy: address });
                    }
                  }
                } catch (error) {
                  console.warn(`Failed to check listing for ${nft.token_id}-${nft.serial_number}:`, error);
                }
              }
            }
          }
          
          console.log(`📊 Total: ${userNFTs.length} owned + ${listedNFTs.length} listed = ${userNFTs.length + listedNFTs.length} assets`);
          
          // Combine owned and listed NFTs
          const allNFTs = [...userNFTs, ...listedNFTs];
          
          if (allNFTs.length > 0) {
            // Process NFTs into asset format - with IPFS metadata fetching
            const processedAssetsPromises = allNFTs.map(async (nft: any) => {
              let metadata: any = {};
              let name = `NFT #${nft.serial_number}`;
              let totalValue = 100; // Default fallback
              let imageURI = '';
              
              // Try to parse metadata
              if (nft.metadata) {
                try {
                  const metadataString = atob(nft.metadata);
                  
                  // Check if it's an IPFS CID or URL
                  if (metadataString.startsWith('baf') || metadataString.startsWith('Qm')) {
                    // It's an IPFS CID, fetch the metadata
                    const ipfsUrl = `https://indigo-recent-clam-436.mypinata.cloud/ipfs/${metadataString}`;
                    try {
                      const ipfsResponse = await fetch(ipfsUrl);
                      if (ipfsResponse.ok) {
                        metadata = await ipfsResponse.json();
                        name = metadata.name || metadata.assetName || name;
                        // Try multiple fields for price/value
                        const priceStr = metadata.price || metadata.totalValue || metadata.value || '100';
                        totalValue = parseFloat(priceStr);
                        imageURI = metadata.image || metadata.imageURI || metadata.imageUrl || '';
                        console.log(`✅ Fetched metadata from IPFS for ${nft.token_id}-${nft.serial_number}:`, { name, price: priceStr, totalValue });
                      }
                    } catch (ipfsError) {
                      console.warn(`Failed to fetch IPFS metadata for ${nft.token_id}-${nft.serial_number}:`, ipfsError);
                    }
                  } else {
                    // Try to parse as JSON directly
                    metadata = JSON.parse(metadataString);
                    name = metadata.name || metadata.assetName || name;
                    const priceStr = metadata.price || metadata.totalValue || metadata.value || '100';
                    totalValue = parseFloat(priceStr);
                    imageURI = metadata.image || metadata.imageURI || metadata.imageUrl || '';
                  }
                } catch (error) {
                  console.warn(`Failed to parse metadata for ${nft.token_id}-${nft.serial_number}:`, error);
                }
              }
              
              return {
                id: `${nft.token_id}-${nft.serial_number}`,
                tokenId: nft.token_id,
                serialNumber: nft.serial_number,
                name,
                metadata,
                owner: address,
                createdAt: nft.created_timestamp,
                modified_timestamp: nft.modified_timestamp,
                totalValue,
                price: totalValue,
                imageURI,
                category: metadata.category || metadata.assetType || 'Digital Art',
                type: 'digital'
              };
            });
            
            const processedAssets = await Promise.all(processedAssetsPromises);
            
            // Log each asset's value for debugging
            console.log('✅ Processed assets with real values:');
            processedAssets.forEach((asset, i) => {
              console.log(`  ${i + 1}. ${asset.name}: ${asset.totalValue} TRUST`);
            });
            
            const totalPortfolioValue = processedAssets.reduce((sum, asset) => sum + (asset.totalValue || 0), 0);
            console.log(`💰 Total Portfolio Value: ${totalPortfolioValue} TRUST`);
            
            setHederaAssets(processedAssets);
            
            // Cache the result
            const cacheKey = `user_nfts_${address.toLowerCase()}`;
            localStorage.setItem(cacheKey, JSON.stringify(processedAssets));
            localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
            
            setNftsLoading(false);
            return; // Successfully loaded from Mirror Node
          } else {
            console.log('⚠️ No NFTs found from Mirror Node, checking cache and fallback...');
          }
        } else {
          console.warn('⚠️ Mirror Node response not OK:', response.status);
        }
      } catch (hederaError: any) {
        console.warn('⚠️ Hedera Mirror Node query failed:', hederaError?.message || hederaError);
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
              setHederaAssets(nfts);
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

  // OLD FUNCTION - NO LONGER USED (replaced by fetchUserAssetsProgressive above)
  // Fetch Hedera digital assets - DIRECTLY from Mirror Node (no localStorage)
  const fetchHederaAssets_OLD = async () => {
    if (!address) {
      console.log('⚠️ Cannot fetch assets - no address provided');
      return;
    }
    
    setHederaAssetsLoading(true);
    try {
      console.log('🔍 Fetching NFTs from Hedera Mirror Node for user:', address);
      console.log('🔗 Mirror Node URL:', `https://testnet.mirrornode.hedera.com/api/v1/accounts/${address}/nfts?limit=100`);
      
      // Query Mirror Node for user's NFTs
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${address}/nfts?limit=100`);
      
      if (!response.ok) {
        throw new Error(`Mirror Node returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`📦 Found ${data.nfts?.length || 0} NFTs for user ${address}`);
      console.log('📋 Raw NFT data:', data.nfts);
      
      // Parse NFT metadata
      const nftPromises = (data.nfts || []).map(async (nft: any) => {
        try {
          const tokenId = nft.token_id;
          const serialNumber = nft.serial_number;
          
          let metadata: any = {};
          let metadataString = '';
          let imageUrl = '';
          
          if (nft.metadata) {
            metadataString = atob(nft.metadata);
            
            try {
              metadata = JSON.parse(metadataString);
              imageUrl = metadata.image || metadata.imageURI || metadata.imageUrl || '';
            } catch {
              // Check if it's an IPFS CID
              if (metadataString.startsWith('baf') && !metadataString.includes('/')) {
                const ipfsUrl = `https://indigo-recent-clam-436.mypinata.cloud/ipfs/${metadataString}`;
                try {
                  const metadataResponse = await fetch(ipfsUrl);
                  if (metadataResponse.ok) {
                    metadata = await metadataResponse.json();
                    imageUrl = metadata.image || metadata.imageURI || metadata.imageUrl || '';
                  }
                } catch (e) {
                  console.warn(`Failed to fetch metadata from IPFS:`, e);
                }
              } else if (metadataString.startsWith('http')) {
                imageUrl = metadataString;
              }
            }
          }
          
          if (!imageUrl) {
            imageUrl = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231a1a1a"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2300ff88" text-anchor="middle" dy=".3em">${encodeURIComponent(metadata.name || 'NFT')}</text></svg>`;
          }
          
          return {
            id: `${tokenId}-${serialNumber}`,
            tokenId,
            serialNumber,
            name: metadata.name || metadata.assetName || `NFT #${serialNumber}`,
            description: metadata.description || '',
            imageURI: imageUrl,
            totalValue: metadata.price || metadata.totalValue || '100',
            value: parseFloat(metadata.price || metadata.totalValue || '100'),
            price: metadata.price || metadata.totalValue || '100',
            owner: address,
            createdAt: nft.created_timestamp || new Date().toISOString(),
            isTradeable: true,
            status: 'owned',
            category: metadata.category || 'Digital Art',
            type: 'digital'
          };
        } catch (error) {
          console.warn(`Failed to process NFT:`, error);
          return null;
        }
      });
      
      const assets = (await Promise.all(nftPromises)).filter(Boolean);
      setHederaAssets(assets);
      console.log('✅ Fetched and parsed', assets.length, 'NFTs from Hedera');
    } catch (error) {
      console.error('❌ Error fetching Hedera assets:', error);
    } finally {
      setHederaAssetsLoading(false);
    }
  };

  // Force refresh assets directly from HFS (bypass Mirror Node)
  const forceRefreshHederaAssets = async () => {
    if (!address) return;
    
    setHederaAssetsLoading(true);
    try {
      console.log('🔄 Force refreshing Hedera assets directly from HFS...');
      
      // Debug: Check Hedera client status
      console.log('🔍 Hedera client status for force refresh:', {
        hasClient: !!hederaClient,
        hasOperator: !!hederaClient?.operatorAccountId,
        operatorAccountId: hederaClient?.operatorAccountId?.toString()
      });
      
      if (!hederaClient || !hederaClient.operatorAccountId) {
        console.error('❌ No valid Hedera client with operator available for HFS queries');
        toast({
          title: 'Wallet Not Connected',
          description: 'Please ensure your HashPack wallet is properly connected.',
          variant: 'destructive'
        });
        return;
      }
      
      // Get asset references from localStorage
      const assetReferences = JSON.parse(localStorage.getItem('assetReferences') || '[]');
      const userReferences = assetReferences.filter((ref: any) => ref.owner === address);
      
      console.log(`📊 Found ${userReferences.length} asset references for force refresh`);
      
      const refreshedAssets: HederaAsset[] = [];
      
      for (const ref of userReferences) {
        try {
          console.log(`🔄 Force fetching metadata for asset ${ref.tokenId} from file ${ref.fileId}...`);
          const assetData = await hederaAssetService.getAssetDataDirectly(ref.tokenId, ref.fileId, hederaClient);
          
          if (assetData) {
            refreshedAssets.push(assetData);
            console.log(`✅ Force refreshed asset: ${assetData.name} with image: ${assetData.imageURI}`);
          } else {
            console.warn(`⚠️ Could not force fetch asset data for ${ref.tokenId}`);
          }
        } catch (error) {
          console.error(`❌ Error force fetching asset ${ref.tokenId}:`, error);
        }
      }
      
      setHederaAssets(refreshedAssets);
      console.log(`✅ Force refreshed ${refreshedAssets.length} assets from HFS`);
      
      toast({
        title: 'Assets Refreshed',
        description: `Successfully refreshed ${refreshedAssets.length} assets directly from HFS`,
        variant: 'default'
      });
    } catch (error) {
      console.error('❌ Error force refreshing Hedera assets:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh assets from HFS',
        variant: 'destructive'
      });
    } finally {
      setHederaAssetsLoading(false);
    }
  };

  // NOTE: Assets are now loaded by fetchUserAssetsProgressive above
  // which handles both owned and listed assets from Hedera Mirror Node

  // Refresh assets when component mounts (e.g., returning from CreateDigitalAsset)
  useEffect(() => {
    if (address) {
      console.log('🔄 Profile mounted, refreshing assets...');
      setForceRefresh(true);
      // Reset force refresh after a short delay
      setTimeout(() => setForceRefresh(false), 1000);
    }
  }, []);
  
  // Calculate user stats from real data
  const userStats = useMemo(() => {
    // Debug: Log all sessionStorage keys
    console.log('🔍 All sessionStorage keys:', Object.keys(sessionStorage));
    console.log('🔍 userStats calculation - nftsLoading:', nftsLoading);
    console.log('🔍 Current wallet address:', address);
    
    // Show progressive loading - update stats as NFTs load
    
    // Try to get real data from sessionStorage first
    const sessionKeys = Object.keys(sessionStorage).filter(key => typeof key === 'string' && key.startsWith('asset_'));
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

    // Also get assets from localStorage assetReferences
    const assetReferences = JSON.parse(localStorage.getItem('assetReferences') || '[]');
    console.log('🔍 localStorage assetReferences:', assetReferences);
    const localStorageAssets = assetReferences
      .filter((asset: any) => asset.owner === address) // Only show user's assets
      .map((asset: any) => {
        console.log('🔍 Processing asset from localStorage:', {
          name: asset.name,
          price: asset.price,
          totalValue: asset.totalValue,
          owner: asset.owner
        });
        return {
          id: asset.tokenId,
          name: asset.name,
          description: asset.description,
          imageURI: asset.imageURI,
          totalValue: asset.totalValue || asset.price || '100',
          value: parseFloat(asset.totalValue || asset.price || '100'),
          price: asset.price || asset.totalValue || '100',
          owner: asset.owner,
          tokenId: asset.tokenId,
          source: 'localStorage'
        };
      });
    console.log('🔍 localStorage assets after filtering:', localStorageAssets);

    // Combine sessionStorage assets with localStorage assets and Hedera NFTs
    const allAssets = [...realAssets, ...localStorageAssets];
    
    // Add NFTs from Hedera Mirror Node (the primary source)
    hederaAssets.forEach(nft => {
      // Check if this NFT is already in sessionStorage or localStorage to avoid duplicates
      const existingAsset = allAssets.find(asset => 
        asset.tokenId === nft.tokenId || asset.id === nft.id
      );
      if (!existingAsset) {
        allAssets.push({
          id: nft.id || nft.tokenId,
          name: nft.name || `Asset #${nft.serialNumber}`,
          description: nft.metadata?.description || 'Digital asset',
          imageURI: nft.imageURI || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center',
          totalValue: nft.totalValue || nft.price || '100',
          value: parseFloat(nft.totalValue || nft.price || '100'),
          price: nft.price || nft.totalValue || '100',
          owner: nft.owner || address,
          createdAt: nft.createdAt || new Date().toISOString(),
          isTradeable: true,
          status: nft.isListed ? 'listed' : 'owned',
          tokenId: nft.tokenId,
          serialNumber: nft.serialNumber,
          source: 'hedera',
          type: nft.type || 'digital',
          category: nft.category || 'Digital Asset'
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
    
    // No assets found - return zeros instead of mock data
    return {
      portfolioValue: '0 TRUST',
      usdValue: '$0',
      assetsCount: 0,
      createdCount: 0,
      collectionsCount: 0
    };
  }, [portfolioData, portfolioLoading, userAssetsData, userNFTs, nftsLoading, address, hederaAssets]);

  // Get user assets from real data - show immediately as they load
  const userAssets = useMemo(() => {
    // NO MORE localStorage or sessionStorage - query Hedera directly for user's NFTs
    // This will be populated by the fetchUserAssets function below
    const allAssets: any[] = [];
    
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

    return allAssets;
  }, [userNFTs, address]);

  // Helper function to calculate time ago - MUST be defined before recentActivity
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Get real recent activity from user's assets and transactions
  const recentActivity = useMemo(() => {
    const activities: any[] = [];
    
    console.log('🔍 Recent Activity - userNFTs:', userNFTs);
    console.log('🔍 Recent Activity - userNFTs length:', userNFTs?.length);
    
    // Add activities from user's NFTs
    if (userNFTs && userNFTs.length > 0) {
      userNFTs.forEach((nft: any) => {
        // Try multiple sources for timestamp
        const timestamp = nft.createdAt || 
                         nft.metadata?.createdAt || 
                         nft.created_timestamp ||
                         nft.modified_timestamp;
        
        if (timestamp) {
          const createdDate = new Date(timestamp);
          const timeAgo = getTimeAgo(createdDate);
          
          activities.push({
            action: 'Asset Created',
            asset: nft.name || nft.metadata?.name || `NFT #${nft.serialNumber || nft.id}`,
            time: timeAgo,
            type: 'success',
            timestamp: createdDate.getTime()
          });
        } else {
          // If no timestamp, still show the asset with "Recently"
          activities.push({
            action: 'Asset Owned',
            asset: nft.name || nft.metadata?.name || `NFT #${nft.serialNumber || nft.id}`,
            time: 'Recently',
            type: 'success',
            timestamp: Date.now()
          });
        }
      });
    }
    
    // Sort by timestamp (most recent first) and limit to 5
    return activities
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 5);
  }, [userNFTs]);

  const tabs = [
    { id: 'portfolio', label: 'All Assets', icon: Wallet },
    { id: 'digital-assets', label: 'Digital Art', icon: Grid3X3 },
    { id: 'rwa-assets', label: 'Real Estate', icon: Building2 },
    { id: 'commodities', label: 'Commodities', icon: Globe },
    { id: 'intellectual', label: 'IP & Patents', icon: Shield },
    { id: 'created', label: 'My Creations', icon: Plus },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'favorites', label: 'Favorites', icon: Heart }
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

                  {/* Portfolio Stats - Professional Layout */}
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
                      {/* Portfolio Value */}
                      <div className="space-y-2 min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide truncate">Portfolio</p>
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-neon-green truncate" title={userStats.portfolioValue}>
                          {portfolioLoading ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            userStats.portfolioValue
                          )}
                        </p>
                      </div>

                      {/* USD Value */}
                      <div className="space-y-2 min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide truncate">USD Value</p>
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-electric-mint truncate" title={userStats.usdValue}>
                          {portfolioLoading ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            userStats.usdValue
                          )}
                        </p>
                      </div>

                      {/* Assets */}
                      <div className="space-y-2 min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide truncate">Assets</p>
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-off-white truncate">
                          {assetsLoading ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            userStats.assetsCount
                          )}
                        </p>
                      </div>

                      {/* Created */}
                      <div className="space-y-2 min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide truncate">Created</p>
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-purple-400 truncate">
                          {assetsLoading ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            userStats.createdCount
                          )}
                        </p>
                      </div>

                      {/* Royalties */}
                      <div className="space-y-2 min-w-0">
                        <p className="text-[10px] sm:text-xs text-purple-300 uppercase tracking-wide flex items-center gap-1">
                          <span>👑</span>
                          <span className="truncate">Royalties</span>
                        </p>
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-purple-400 whitespace-nowrap overflow-hidden text-ellipsis">
                          0 TRUST
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="neon"
                    onClick={() => navigate('/dashboard/create-digital-asset')}
                    className="px-3 py-1.5 text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Digital Asset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCreateAsset('rwa')}
                    className="px-3 py-1.5 text-xs font-medium border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                    disabled={user?.kycStatus?.toLowerCase() !== 'approved'}
                  >
                    <Building2 className="w-3.5 h-3.5 mr-1" />
                    RWA {user?.kycStatus?.toLowerCase() !== 'approved' && '(KYC)'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCreateAMC}
                    className="px-3 py-1.5 text-xs font-medium border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                    disabled={user?.kycStatus?.toLowerCase() !== 'approved'}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1" />
                    AMC {user?.kycStatus?.toLowerCase() !== 'approved' && '(KYC)'}
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
                      onClick={() => {
                        // Clear ALL caches and force refresh
                        if (address) {
                          const cacheKey = `user_nfts_${address.toLowerCase()}`;
                          localStorage.removeItem(cacheKey);
                          localStorage.removeItem(`${cacheKey}_timestamp`);
                          console.log('🗑️ Cache cleared, forcing refresh...');
                        }
                        setForceRefresh(prev => !prev);
                      }}
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-off-white">Hedera Digital Assets</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="text-neon-green border-neon-green hover:bg-neon-green/10"
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {hederaAssetsLoading ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-16 h-16 text-neon-green animate-spin" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">Loading Hedera assets...</h3>
                    <p className="text-gray-400">
                      Please wait while we fetch your digital assets from Hedera
                    </p>
                  </CardContent>
                </Card>
              ) : hederaAssets.length === 0 ? (
                <Card variant="floating" className="text-center py-16">
                  <CardContent>
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                      <Grid3X3 className="w-16 h-16 text-neon-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-off-white mb-4">No Hedera digital assets found</h3>
                    <p className="text-gray-400 mb-6">
                      Start by creating your first digital asset on Hedera
                    </p>
                    <Button
                      variant="neon"
                      onClick={() => navigate('/create-asset')}
                      className="px-6 py-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Digital Asset
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {hederaAssets.map((asset: HederaAsset, index: number) => (
                    <motion.div
                      key={asset.id || asset.tokenId || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        variant="floating" 
                        className="overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowAssetDetail(true);
                        }}
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
                            {asset.name || `Asset #${asset.tokenId || index + 1}`}
                          </h3>
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {asset.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neon-green font-medium">
                              {asset.price || asset.totalValue ? `${asset.price || asset.totalValue} TRUST` : 'Not Listed'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {asset.status === 'active' ? 'Available' : 'Hedera'}
                            </span>
                          </div>
                          {/* Only show verification badge for RWA assets */}
                          {(asset as any).type === 'rwa' && (asset as any).verification && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                (asset as any).verification === 'VERIFIED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(asset as any).verification}
                              </span>
                            </div>
                          )}
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
                {recentActivity.length > 0 ? (
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
                ) : (
                  <div className="text-center py-16">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                      <Activity className="w-16 h-16 text-neon-green" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-off-white">No Activity Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Your transaction history will appear here once you create or trade assets
                    </p>
                    <Button
                      variant="neon"
                      onClick={() => navigate('/create-asset')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Asset
                    </Button>
                  </div>
                )}
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

      {/* Asset Detail Modal */}
      <AssetDetailModal
        isOpen={showAssetDetail}
        onClose={() => {
          setShowAssetDetail(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        onAssetUpdate={() => {
          // Trigger asset refresh by toggling forceRefresh
          setForceRefresh(prev => !prev);
        }}
      />
    </div>
  );
};

export default Profile;
