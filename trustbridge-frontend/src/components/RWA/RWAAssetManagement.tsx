import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import Button from '../UI/Button';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  BarChart3,
  Eye,
  Edit,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Camera,
  Download,
  Upload,
  RefreshCw,
  Activity,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useWallet } from '../../contexts/WalletContext';
import { RWANFTService } from '../../services/rwa-nft.service';

interface RWAPortfolio {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercent: number;
  activeAssets: number;
  totalTokens: number;
  monthlyIncome: number;
  yearlyProjectedIncome: number;
  totalEarnings: number; // Total earnings from assets
}

interface RWAAsset {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string | { country?: string; region?: string; address?: string; city?: string; state?: string; coordinates?: any };
  totalValue: number;
  tokenPrice: number;
  tokensOwned: number;
  valueOwned: number;
  expectedAPY: number;
  maturityDate: string;
  status: 'ACTIVE' | 'MATURED' | 'SUSPENDED';
  amcName: string;
  amcRating: number;
  earnings?: number; // Total earnings/ROI received
  performance: {
    currentValue: number;
    valueChange: number;
    valueChangePercent: number;
    totalReturn: number;
    totalReturnPercent: number;
    monthlyReturn: number;
    yearlyReturn: number;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  liquidity: 'HIGH' | 'MEDIUM' | 'LOW';
  lastUpdated: string;
  nextPaymentDate: string;
  paymentAmount: number;
  documents: string[];
  reports: {
    monthly: string;
    quarterly: string;
    yearly: string;
  };
  nftTokenId?: string; // Hedera NFT token ID
  nftSerialNumber?: string; // Hedera NFT serial number
  memo?: string; // Hedera NFT memo/metadata
}

interface PerformanceMetric {
  period: string;
  value: number;
  return: number;
  returnPercent: number;
}

const RWAAssetManagement: React.FC = () => {
  const { toast } = useToast();
  const { accountId, isConnected, hederaClient, signer } = useWallet();
  const [portfolio, setPortfolio] = useState<RWAPortfolio | null>(null);
  const [assets, setAssets] = useState<RWAAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<RWAAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'performance' | 'reports' | 'settings'>('overview');
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    if (isConnected && accountId) {
      fetchPortfolioData();
    }
  }, [isConnected, accountId]);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      
      if (!accountId) {
        console.log('No account ID available');
        return;
      }

      console.log('🔍 Fetching RWA assets for account:', accountId);
      console.log('🔍 Account ID type:', typeof accountId);
      console.log('🔍 Account ID length:', accountId ? accountId.length : 'undefined');
      console.log('🔍 Hedera client:', hederaClient);
      console.log('🔍 Signer:', signer);
      
      // Fetch real asset earnings from database FIRST
      let dbAssetsWithEarnings: any[] = [];
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';
        const assetsResponse = await fetch(`${apiUrl}/api/assets/owner/${accountId}`);
        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json();
          dbAssetsWithEarnings = assetsData.data || [];
          console.log('📊 DB assets with earnings:', dbAssetsWithEarnings);
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch assets from database:', error);
      }
      
      // Create RWA NFT service instance
      const rwaNFTService = new RWANFTService(hederaClient, signer);
      
      // Fetch RWA NFTs from Hedera
      console.log('🔍 About to fetch RWA NFTs with account ID:', accountId);
      const rwaNFTs = await rwaNFTService.getAMCRWANFTs(accountId);
      console.log('📊 RWA NFTs fetched:', rwaNFTs);
      console.log('📊 RWA NFTs count:', rwaNFTs.length);
      
      // If no RWA NFTs found, let's check all NFTs for debugging
      if (rwaNFTs.length === 0) {
        console.log('🔍 No RWA NFTs found, checking all NFTs for debugging...');
        try {
          const response = await fetch(
            `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/nfts?limit=100`
          );
          
          if (!response.ok) {
            console.error('❌ Failed to fetch NFTs:', response.status, response.statusText);
            return;
          }
          
          const allNFTsData = await response.json();
          console.log('📊 All NFTs on account:', allNFTsData);
          
          if (allNFTsData.nfts && allNFTsData.nfts.length > 0) {
            console.log('📊 Total NFTs on account:', allNFTsData.nfts.length);
            allNFTsData.nfts.forEach((nft: any, index: number) => {
              const isRWA = nft.metadata && nft.metadata.startsWith('RWA:');
              console.log(`📊 NFT ${index + 1}:`, {
                tokenId: nft.token_id,
                serialNumber: nft.serial_number,
                metadata: nft.metadata,
                isRWA,
                memoStartsWithRWA: nft.metadata ? nft.metadata.startsWith('RWA:') : false,
                memoLength: nft.metadata ? nft.metadata.length : 0,
                fullNftData: nft
              });
              
              if (isRWA) {
                console.log('🎯 FOUND RWA NFT!', nft);
              }
            });
          } else {
            console.log('📊 No NFTs found on account at all');
          }
          
          // Also try to fetch the specific NFT that was just created (0.0.7091437)
          console.log('🔍 Trying to fetch specific NFT 0.0.7091437...');
          try {
            const specificResponse = await fetch(
              `https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.7091437/nfts/1`
            );
            if (specificResponse.ok) {
              const specificNFT = await specificResponse.json();
              console.log('🎯 Specific NFT found:', specificNFT);
            } else {
              console.log('❌ Specific NFT not found:', specificResponse.status);
            }
          } catch (error) {
            console.error('❌ Error fetching specific NFT:', error);
          }
        } catch (error) {
          console.error('❌ Error fetching all NFTs for debugging:', error);
        }
      }
      
      // Process RWA NFTs into asset format
      console.log('🔄 Processing RWA NFTs into asset format...');
      console.log('📊 RWA NFTs to process:', rwaNFTs.length);
      
      const processedAssets: RWAAsset[] = [];
      let totalValue = 0;
      let totalInvested = 0;
      let totalReturn = 0;
      let totalEarnings = 0;
      
      for (const nft of rwaNFTs) {
        try {
          console.log('🔍 Processing RWA NFT:', nft);
          
          // Decode memo to get basic info
          const memo = nft.metadata || '';
          const isRWA = memo.startsWith('RWA:');
          
          console.log('🔍 Memo analysis:', {
            memo,
            isRWA,
            memoLength: memo.length
          });
          
          if (isRWA) {
            // Find matching asset in database for earnings
            const dbAsset = dbAssetsWithEarnings.find(
              (db: any) => db.assetId === nft.token_id || db._id === nft.token_id
            );
            const realEarnings = dbAsset?.earnings || 0;
            
            console.log(`💰 Earnings for ${nft.token_id}: ${realEarnings}`, dbAsset);
            
            // Parse basic info from memo or use defaults
            const asset: RWAAsset = {
              id: `${nft.token_id}-${nft.serial_number}`,
              name: dbAsset?.name || `RWA Asset ${nft.serial_number}`,
              type: 'Real World Asset',
              category: 'RWA',
              location: dbAsset?.location || 'Location TBD',
              totalValue: dbAsset?.totalValue || 100000,
              tokenPrice: 100,
              tokensOwned: 1000,
              valueOwned: 100000,
              expectedAPY: 12.0,
              maturityDate: '2025-12-31',
              status: 'ACTIVE',
              amcName: 'TrustBridge AMC',
              amcRating: 4.8,
              earnings: realEarnings, // Real earnings from database
              performance: {
                currentValue: 110000,
                valueChange: 10000,
                valueChangePercent: 10.0,
                totalReturn: 20000,
                totalReturnPercent: 20.0,
                monthlyReturn: 1000,
                yearlyReturn: 12000
              },
              riskLevel: 'MEDIUM',
              liquidity: 'MEDIUM',
              lastUpdated: new Date().toISOString(),
              nextPaymentDate: '2024-02-01',
              paymentAmount: 1000,
              documents: ['deed.pdf', 'valuation.pdf'],
              reports: {
                monthly: 'ipfs://monthly-report',
                quarterly: 'ipfs://quarterly-report',
                yearly: 'ipfs://yearly-report'
              },
              nftTokenId: nft.token_id,
              nftSerialNumber: nft.serial_number,
              memo: memo
            };
            
            processedAssets.push(asset);
            totalValue += asset.totalValue;
            totalInvested += asset.valueOwned;
            totalReturn += asset.performance.totalReturn;
            totalEarnings += realEarnings; // Add real earnings to total
          }
        } catch (error) {
          console.error('Error processing NFT:', nft, error);
        }
      }
      
      console.log('✅ Processing complete!');
      console.log('📊 Processed assets:', processedAssets.length);
      console.log('📊 Assets array:', processedAssets);
      console.log('💰 Total earnings:', totalEarnings);
      
      setAssets(processedAssets);
      
      // Calculate portfolio totals
      const portfolio: RWAPortfolio = {
        totalValue: totalValue,
        totalInvested: totalInvested,
        totalReturn: totalReturn,
        totalReturnPercent: totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0,
        activeAssets: processedAssets.length,
        totalTokens: processedAssets.reduce((sum, asset) => sum + asset.tokensOwned, 0),
        monthlyIncome: processedAssets.reduce((sum, asset) => sum + asset.performance.monthlyReturn, 0),
        yearlyProjectedIncome: processedAssets.reduce((sum, asset) => sum + asset.performance.yearlyReturn, 0),
        totalEarnings: totalEarnings // Total earnings from all assets
      };
      
      setPortfolio(portfolio);
      
      // Mock performance data for now
      const mockPerformanceData: PerformanceMetric[] = [
        { period: 'Jan', value: 100000, return: 5.2, returnPercent: 5.2 },
        { period: 'Feb', value: 105000, return: 5.0, returnPercent: 5.0 },
        { period: 'Mar', value: 110000, return: 4.8, returnPercent: 4.8 },
        { period: 'Apr', value: 115000, return: 4.5, returnPercent: 4.5 },
        { period: 'May', value: 120000, return: 4.3, returnPercent: 4.3 },
        { period: 'Jun', value: 125000, return: 4.2, returnPercent: 4.2 }
      ];
      
      setPerformanceData(mockPerformanceData);
      
      console.log('✅ Portfolio data fetched successfully:', { portfolio, assets: processedAssets });
      
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolio data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchPortfolioData();
  };

  const handleAssetClick = (asset: RWAAsset) => {
    setSelectedAsset(asset);
  };

  const handleCloseAssetDetails = () => {
    setSelectedAsset(null);
  };

  const handleTabChange = (tab: 'overview' | 'assets' | 'performance' | 'reports' | 'settings') => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
              <p className="text-electric-mint">Loading RWA portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-300 mb-2">No RWA Assets Found</h2>
            <p className="text-gray-400 mb-6">Start by creating your first Real World Asset</p>
            <Button
              onClick={() => window.location.href = '/create-rwa'}
              className="bg-neon-green text-black hover:bg-electric-mint"
            >
              Create RWA Asset
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-off-white mb-2">RWA Portfolio</h1>
            <p className="text-electric-mint">Manage your Real World Asset investments</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button
              onClick={refreshData}
              variant="outline"
              className="border-electric-mint text-electric-mint hover:bg-electric-mint hover:text-black"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => window.location.href = '/create-rwa'}
              className="bg-neon-green text-black hover:bg-electric-mint"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Create RWA Asset
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-off-white">${portfolio.totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-neon-green" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-electric-mint">+{portfolio.totalReturnPercent.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Assets</p>
                  <p className="text-2xl font-bold text-off-white">{portfolio.activeAssets}</p>
                </div>
                <Building2 className="w-8 h-8 text-electric-mint" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-400">{portfolio.totalTokens} tokens</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Monthly Income</p>
                  <p className="text-2xl font-bold text-off-white">${portfolio.monthlyIncome.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-neon-green" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-electric-mint">${portfolio.yearlyProjectedIncome.toLocaleString()}/year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Return</p>
                  <p className="text-2xl font-bold text-off-white">${portfolio.totalReturn.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-electric-mint" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-neon-green">+{portfolio.totalReturnPercent.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 border-2 border-electric-mint">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-electric-mint">₦{portfolio.totalEarnings.toLocaleString()}</p>
                </div>
                <Zap className="w-8 h-8 text-electric-mint" />
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-400">From investments</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets List */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-neon-green" />
              RWA Assets ({assets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No RWA Assets Found</h3>
                <p className="text-gray-400 mb-6">Start by creating your first Real World Asset</p>
                <Button
                  onClick={() => window.location.href = '/create-rwa'}
                  className="bg-neon-green text-black hover:bg-electric-mint"
                >
                  Create RWA Asset
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="bg-gray-800 border-gray-600 hover:border-electric-mint transition-colors cursor-pointer"
                    onClick={() => handleAssetClick(asset)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-off-white mb-1">{asset.name}</h3>
                          <p className="text-sm text-gray-400">{asset.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          asset.status === 'ACTIVE' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Value</span>
                          <span className="text-sm text-off-white">${asset.totalValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">APY</span>
                          <span className="text-sm text-neon-green">{asset.expectedAPY}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Location</span>
                          <span className="text-sm text-gray-300">
                            {typeof asset.location === 'string' 
                              ? asset.location 
                              : asset.location?.address || `${asset.location?.region || ''}, ${asset.location?.country || ''}`.trim() || 'N/A'}
                          </span>
                        </div>
                        {asset.earnings !== undefined && asset.earnings > 0 && (
                          <div className="flex justify-between border-t border-electric-mint/30 pt-2 mt-2">
                            <span className="text-sm text-gray-400">💰 Earnings</span>
                            <span className="text-sm font-bold text-electric-mint">₦{asset.earnings.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-400">Created {new Date(asset.maturityDate).toLocaleDateString()}</span>
                        </div>
                        <Eye className="w-4 h-4 text-electric-mint" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RWAAssetManagement;
