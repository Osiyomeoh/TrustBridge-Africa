import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import Button from '../UI/Button';
import { 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Calendar,
  FileText,
  Camera,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Edit,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import AssetApproval from '../AMC/AssetApproval';
import PoolManagement from '../AMC/PoolManagement';

interface AMCAsset {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string;
  value: number;
  status: 'PENDING_ASSIGNMENT' | 'ASSIGNED' | 'INSPECTION_SCHEDULED' | 'INSPECTION_COMPLETED' | 'LEGAL_TRANSFER_PENDING' | 'LEGAL_TRANSFER_COMPLETED' | 'ACTIVE' | 'REJECTED';
  owner: string;
  assignedTo: string;
  inspectionDate?: string;
  inspectionReport?: string;
  legalTransferStatus?: string;
  createdAt: string;
  documents: string[];
  photos: string[];
}

interface InspectionRecord {
  assetId: string;
  inspector: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  report?: string;
  findings?: {
    condition: string;
    documentationMatch: boolean;
    locationVerified: boolean;
    valueAssessment: number;
  };
  photos: string[];
}

const AMCDashboard: React.FC = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<AMCAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AMCAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'inspections' | 'transfers' | 'active' | 'approval' | 'pools'>('assigned');
  const [isAssigningAMC, setIsAssigningAMC] = useState(false);

  useEffect(() => {
    fetchAMCAssets();
  }, []);

  const fetchAMCAssets = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockAssets: AMCAsset[] = [
        {
          id: '1',
          name: 'Victoria Island Commercial Complex',
          type: 'Commercial Building',
          category: 'Real Estate',
          location: 'Victoria Island, Lagos, Nigeria',
          value: 250000,
          status: 'INSPECTION_SCHEDULED',
          owner: '0x1234...5678',
          assignedTo: 'AMC-001',
          inspectionDate: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-10T08:00:00Z',
          documents: ['deed.pdf', 'valuation.pdf'],
          photos: ['building1.jpg', 'building2.jpg']
        },
        {
          id: '2',
          name: 'Lekki Farmland',
          type: 'Agricultural Land',
          category: 'Farmland',
          location: 'Lekki, Lagos, Nigeria',
          value: 150000,
          status: 'LEGAL_TRANSFER_PENDING',
          owner: '0x9876...5432',
          assignedTo: 'AMC-001',
          inspectionDate: '2024-01-12T14:00:00Z',
          inspectionReport: 'ipfs://inspection-report-001',
          createdAt: '2024-01-08T10:00:00Z',
          documents: ['land-title.pdf', 'survey.pdf'],
          photos: ['farm1.jpg', 'farm2.jpg']
        },
        {
          id: '3',
          name: 'Port Harcourt Equipment',
          type: 'Mining Equipment',
          category: 'Equipment',
          location: 'Port Harcourt, Rivers, Nigeria',
          value: 75000,
          status: 'ACTIVE',
          owner: '0x5555...7777',
          assignedTo: 'AMC-001',
          inspectionDate: '2024-01-05T09:00:00Z',
          inspectionReport: 'ipfs://inspection-report-002',
          legalTransferStatus: 'COMPLETED',
          createdAt: '2024-01-01T12:00:00Z',
          documents: ['equipment-cert.pdf', 'maintenance.pdf'],
          photos: ['equipment1.jpg', 'equipment2.jpg']
        }
      ];
      setAssets(mockAssets);
    } catch (error) {
      console.error('Error fetching AMC assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch AMC assets',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_ASSIGNMENT':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'ASSIGNED':
        return 'text-blue-400 bg-blue-400/10';
      case 'INSPECTION_SCHEDULED':
        return 'text-orange-400 bg-orange-400/10';
      case 'INSPECTION_COMPLETED':
        return 'text-green-400 bg-green-400/10';
      case 'LEGAL_TRANSFER_PENDING':
        return 'text-purple-400 bg-purple-400/10';
      case 'LEGAL_TRANSFER_COMPLETED':
        return 'text-green-400 bg-green-400/10';
      case 'ACTIVE':
        return 'text-neon-green bg-neon-green/10';
      case 'REJECTED':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_ASSIGNMENT':
        return <Clock className="w-4 h-4" />;
      case 'ASSIGNED':
        return <Building2 className="w-4 h-4" />;
      case 'INSPECTION_SCHEDULED':
        return <Calendar className="w-4 h-4" />;
      case 'INSPECTION_COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'LEGAL_TRANSFER_PENDING':
        return <FileText className="w-4 h-4" />;
      case 'LEGAL_TRANSFER_COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'ACTIVE':
        return <TrendingUp className="w-4 h-4" />;
      case 'REJECTED':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const scheduleInspection = async (assetId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, status: 'INSPECTION_SCHEDULED' as const, inspectionDate: new Date().toISOString() }
          : asset
      ));
      
      toast({
        title: 'Inspection Scheduled',
        description: 'Physical inspection has been scheduled for this asset.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule inspection',
        variant: 'destructive'
      });
    }
  };

  const completeInspection = async (assetId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { 
              ...asset, 
              status: 'INSPECTION_COMPLETED' as const,
              inspectionReport: 'ipfs://inspection-report-completed'
            }
          : asset
      ));
      
      toast({
        title: 'Inspection Completed',
        description: 'Physical inspection has been completed successfully.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete inspection',
        variant: 'destructive'
      });
    }
  };

  const initiateLegalTransfer = async (assetId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, status: 'LEGAL_TRANSFER_PENDING' as const }
          : asset
      ));
      
      toast({
        title: 'Legal Transfer Initiated',
        description: 'Legal transfer process has been initiated.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate legal transfer',
        variant: 'destructive'
      });
    }
  };

  const completeLegalTransfer = async (assetId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { 
              ...asset, 
              status: 'ACTIVE' as const,
              legalTransferStatus: 'COMPLETED'
            }
          : asset
      ));
      
      toast({
        title: 'Legal Transfer Completed',
        description: 'Asset is now active and ready for trading.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete legal transfer',
        variant: 'destructive'
      });
    }
  };

  const assignAMCWithChainlinkVRF = async (assetId: string) => {
    try {
      setIsAssigningAMC(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      if (!apiUrl) return;
      
      const response = await fetch(`${apiUrl}/assets/rwa/${assetId}/assign-amc-vrf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to assign AMC with Chainlink VRF');
      }

      const result = await response.json();
      
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { 
              ...asset, 
              status: 'ASSIGNED' as const,
              assignedTo: result.amcId
            }
          : asset
      ));
      
      toast({
        title: 'AMC Assigned Successfully!',
        description: `Asset assigned to ${result.amcId} using Chainlink VRF. ${result.assignmentReason}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error assigning AMC with VRF:', error);
      toast({
        title: 'AMC Assignment Failed',
        description: 'Failed to assign AMC using Chainlink VRF. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAssigningAMC(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    switch (activeTab) {
      case 'assigned':
        return ['ASSIGNED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED'].includes(asset.status);
      case 'inspections':
        return ['INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED'].includes(asset.status);
      case 'transfers':
        return ['LEGAL_TRANSFER_PENDING', 'LEGAL_TRANSFER_COMPLETED'].includes(asset.status);
      case 'active':
        return asset.status === 'ACTIVE';
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
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
          <h1 className="text-3xl font-bold text-off-white mb-2">AMC Dashboard</h1>
          <p className="text-electric-mint">Manage and verify real-world assets</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Assets</p>
                  <p className="text-2xl font-bold text-off-white">{assets.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-neon-green" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Inspection</p>
                  <p className="text-2xl font-bold text-off-white">
                    {assets.filter(a => a.status === 'INSPECTION_SCHEDULED').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Assets</p>
                  <p className="text-2xl font-bold text-off-white">
                    {assets.filter(a => a.status === 'ACTIVE').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-off-white">
                    ${assets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'assigned', label: 'Assigned Assets', count: assets.filter(a => ['ASSIGNED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED'].includes(a.status)).length },
            { id: 'inspections', label: 'Inspections', count: assets.filter(a => ['INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED'].includes(a.status)).length },
            { id: 'transfers', label: 'Legal Transfers', count: assets.filter(a => ['LEGAL_TRANSFER_PENDING', 'LEGAL_TRANSFER_COMPLETED'].includes(a.status)).length },
            { id: 'active', label: 'Active Assets', count: assets.filter(a => a.status === 'ACTIVE').length },
            { id: 'approval', label: 'Asset Approval', count: 0 },
            { id: 'pools', label: 'Pool Management', count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-neon-green text-black'
                  : 'text-gray-400 hover:text-off-white hover:bg-gray-800'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'approval' && <AssetApproval />}
        {activeTab === 'pools' && <PoolManagement />}
        
        {/* Assets List - Only show for other tabs */}
        {!['approval', 'pools'].includes(activeTab) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-off-white mb-1">{asset.name}</CardTitle>
                    <p className="text-sm text-gray-400">{asset.type}</p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(asset.status)}`}>
                    {getStatusIcon(asset.status)}
                    <span className="capitalize">{asset.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{asset.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">${asset.value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Owner: {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {asset.status === 'PENDING_ASSIGNMENT' && (
                    <Button
                      onClick={() => assignAMCWithChainlinkVRF(asset.id)}
                      disabled={isAssigningAMC}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      size="sm"
                    >
                      {isAssigningAMC ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Assigning AMC...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Assign AMC (Chainlink VRF)
                        </>
                      )}
                    </Button>
                  )}
                  
                  {asset.status === 'ASSIGNED' && (
                    <Button
                      onClick={() => scheduleInspection(asset.id)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Inspection
                    </Button>
                  )}
                  
                  {asset.status === 'INSPECTION_SCHEDULED' && (
                    <Button
                      onClick={() => completeInspection(asset.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Inspection
                    </Button>
                  )}
                  
                  {asset.status === 'INSPECTION_COMPLETED' && (
                    <Button
                      onClick={() => initiateLegalTransfer(asset.id)}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      size="sm"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Initiate Legal Transfer
                    </Button>
                  )}
                  
                  {asset.status === 'LEGAL_TRANSFER_PENDING' && (
                    <Button
                      onClick={() => completeLegalTransfer(asset.id)}
                      className="w-full bg-neon-green text-black hover:bg-electric-mint"
                      size="sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Complete Legal Transfer
                    </Button>
                  )}
                  
                  {asset.status === 'ACTIVE' && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setSelectedAsset(asset)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {!['approval', 'pools'].includes(activeTab) && filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No assets found</h3>
            <p className="text-gray-500">No assets match the current filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AMCDashboard;
