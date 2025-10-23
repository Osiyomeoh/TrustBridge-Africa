import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { Badge } from '../UI/Badge';
import { useToast } from '@/hooks/useToast';
import { useWallet } from '@/contexts/WalletContext';
import { Loader2, Plus, Building2, Coins, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

interface RWANFT {
  nftTokenId: string;
  nftSerialNumber: string;
  propertyId: string;
  name: string;
  description: string;
  totalValue: number;
  expectedAPY: number;
  assetType: string;
  status: string;
}

interface PoolFormData {
  poolName: string;
  poolDescription: string;
  selectedNFTs: string[];
  totalPoolValue: number;
  tokenSupply: number;
  expectedAPY: number;
  tranches: {
    senior: {
      percentage: number;
      apy: number;
    };
    junior: {
      percentage: number;
      apy: number;
    };
  };
}

export default function PoolManagement() {
  const { accountId, hederaClient, signer } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rwaNFTs, setRwaNFTs] = useState<RWANFT[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [formData, setFormData] = useState<PoolFormData>({
    poolName: '',
    poolDescription: '',
    selectedNFTs: [],
    totalPoolValue: 0,
    tokenSupply: 1000000, // 1M tokens default
    expectedAPY: 10,
    tranches: {
      senior: {
        percentage: 70,
        apy: 8
      },
      junior: {
        percentage: 30,
        apy: 15
      }
    }
  });

  useEffect(() => {
    loadRwaNFTs();
    loadPools();
  }, []);

  const loadRwaNFTs = async () => {
    try {
      // Load RWA NFTs from localStorage (in production, from backend)
      const assets = JSON.parse(localStorage.getItem('assetReferences') || '[]');
      const rwaAssets = assets.filter((asset: any) => 
        asset.assetType === 'RWA' && 
        asset.nftTokenId && 
        asset.status === 'PENDING_AMC_ASSIGNMENT'
      );
      setRwaNFTs(rwaAssets);
    } catch (error) {
      console.error('Failed to load RWA NFTs:', error);
    }
  };

  const loadPools = async () => {
    try {
      const { PoolTokenService } = await import('../../services/pool-token.service');
      const poolService = new PoolTokenService(hederaClient, signer);
      const poolsData = await poolService.getAllPools();
      setPools(poolsData);
    } catch (error) {
      console.error('Failed to load pools:', error);
    }
  };

  const handleNFTSelection = (nftTokenId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        selectedNFTs: [...prev.selectedNFTs, nftTokenId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedNFTs: prev.selectedNFTs.filter(id => id !== nftTokenId)
      }));
    }
  };

  const calculatePoolValue = () => {
    const selectedAssets = rwaNFTs.filter(nft => 
      formData.selectedNFTs.includes(nft.nftTokenId)
    );
    const totalValue = selectedAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
    setFormData(prev => ({ ...prev, totalPoolValue: totalValue }));
    return totalValue;
  };

  const handleCreatePool = async () => {
    if (!hederaClient || !signer || !accountId) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create pools.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.selectedNFTs.length === 0) {
      toast({
        title: 'No Assets Selected',
        description: 'Please select at least one RWA NFT to include in the pool.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🏊 Creating pool following Centrifuge model...');

      // Import pool token service
      const { PoolTokenService } = await import('../../services/pool-token.service');
      const poolService = new PoolTokenService(hederaClient, signer);

      // Generate pool ID
      const poolId = `POOL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare pool data
      const poolData = {
        poolName: formData.poolName,
        poolDescription: formData.poolDescription,
        assetNFTs: formData.selectedNFTs,
        totalPoolValue: formData.totalPoolValue,
        tokenSupply: formData.tokenSupply,
        expectedAPY: formData.expectedAPY,
        tranches: formData.tranches,
        amcAccount: accountId,
        poolId: poolId
      };

      console.log('📊 Pool Data:', poolData);

      // Create pool tokens
      const poolResult = await poolService.createPoolTokens(poolData);

      console.log('✅ Pool Created:', poolResult);

      // Update RWA assets to mark as assigned to pool
      const assets = JSON.parse(localStorage.getItem('assetReferences') || '[]');
      const updatedAssets = assets.map((asset: any) => {
        if (formData.selectedNFTs.includes(asset.nftTokenId)) {
          return {
            ...asset,
            status: 'ASSIGNED_TO_POOL',
            poolId: poolId,
            poolTokens: {
              pool: poolResult.poolTokenId,
              senior: poolResult.seniorTokenId,
              junior: poolResult.juniorTokenId
            }
          };
        }
        return asset;
      });
      localStorage.setItem('assetReferences', JSON.stringify(updatedAssets));

      // Reload data
      await loadRwaNFTs();
      await loadPools();

      toast({
        title: 'Pool Created Successfully!',
        description: `Pool "${formData.poolName}" created with ${formData.selectedNFTs.length} RWA NFTs and ${formData.tokenSupply} pool tokens.`,
        variant: 'default'
      });

      // Reset form
      setFormData({
        poolName: '',
        poolDescription: '',
        selectedNFTs: [],
        totalPoolValue: 0,
        tokenSupply: 1000000,
        expectedAPY: 10,
        tranches: {
          senior: { percentage: 70, apy: 8 },
          junior: { percentage: 30, apy: 15 }
        }
      });

    } catch (error) {
      console.error('❌ Pool creation failed:', error);
      toast({
        title: 'Pool Creation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pool Management</h2>
          <p className="text-muted-foreground">
            Create and manage RWA pools following Centrifuge model
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          AMC Dashboard
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Pool Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Pool
            </CardTitle>
            <CardDescription>
              Create a pool with RWA NFTs and issue fungible pool tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="poolName" className="block text-sm font-medium text-gray-300">Pool Name</label>
              <Input
                id="poolName"
                value={formData.poolName}
                onChange={(e) => setFormData(prev => ({ ...prev, poolName: e.target.value }))}
                placeholder="e.g., Commercial Real Estate Pool #1"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="poolDescription" className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                id="poolDescription"
                value={formData.poolDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, poolDescription: e.target.value }))}
                placeholder="Describe the pool's investment strategy and focus..."
                rows={3}
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="tokenSupply" className="block text-sm font-medium text-gray-300">Token Supply</label>
                <Input
                  id="tokenSupply"
                  type="number"
                  value={formData.tokenSupply}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenSupply: parseInt(e.target.value) || 0 }))}
                  placeholder="1000000"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="expectedAPY" className="block text-sm font-medium text-gray-300">Expected APY (%)</label>
                <Input
                  id="expectedAPY"
                  type="number"
                  value={formData.expectedAPY}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedAPY: parseFloat(e.target.value) || 0 }))}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="border-t border-gray-600 my-4"></div>

            <div className="space-y-4">
              <h4 className="font-medium">Tranching Structure</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Shield className="h-4 w-4 text-green-600" />
                    Senior Tranche
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={formData.tranches.senior.percentage}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        tranches: {
                          ...prev.tranches,
                          senior: { ...prev.tranches.senior, percentage: parseInt(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="70"
                    />
                    <Input
                      type="number"
                      value={formData.tranches.senior.apy}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        tranches: {
                          ...prev.tranches,
                          senior: { ...prev.tranches.senior, apy: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Junior Tranche
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={formData.tranches.junior.percentage}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        tranches: {
                          ...prev.tranches,
                          junior: { ...prev.tranches.junior, percentage: parseInt(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="30"
                    />
                    <Input
                      type="number"
                      value={formData.tranches.junior.apy}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        tranches: {
                          ...prev.tranches,
                          junior: { ...prev.tranches.junior, apy: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="15"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreatePool} 
              disabled={isLoading || formData.selectedNFTs.length === 0}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Pool...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Pool
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Available RWA NFTs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Available RWA NFTs
            </CardTitle>
            <CardDescription>
              Select RWA NFTs to include in the pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rwaNFTs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No RWA NFTs available for pooling
                </div>
              ) : (
                rwaNFTs.map((nft) => (
                  <div
                    key={nft.nftTokenId}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.selectedNFTs.includes(nft.nftTokenId)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleNFTSelection(nft.nftTokenId, !formData.selectedNFTs.includes(nft.nftTokenId))}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{nft.name}</h4>
                        <p className="text-sm text-muted-foreground">{nft.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            ${nft.totalValue.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {nft.expectedAPY}% APY
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{nft.assetType}</Badge>
                        <input
                          type="checkbox"
                          checked={formData.selectedNFTs.includes(nft.nftTokenId)}
                          onChange={() => {}}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {formData.selectedNFTs.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {formData.selectedNFTs.length} NFTs selected
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Total Value: ${calculatePoolValue().toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing Pools */}
      {pools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Pools</CardTitle>
            <CardDescription>
              Manage your created pools and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pools.map((pool) => (
                <div key={pool.poolId} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{pool.poolName}</h4>
                      <p className="text-sm text-muted-foreground">{pool.poolDescription}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Assets: {pool.assetNFTs.length}</span>
                        <span>Value: ${pool.totalPoolValue.toLocaleString()}</span>
                        <span>APY: {pool.expectedAPY}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{pool.status}</Badge>
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
