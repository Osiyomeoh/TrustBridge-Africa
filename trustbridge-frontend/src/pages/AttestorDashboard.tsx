import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Image as ImageIcon,
  FileText,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  ExternalLink,
  Share2,
  Copy
} from 'lucide-react';
import { hederaAssetService } from '../services/hederaAssetService';
import { useToast } from '../hooks/useToast';

interface VerificationRequest {
  requestId: string;
  assetId: string;
  assetOwner: string;
  requiredType: number;
  status: number;
  requestedAt: string;
  deadline: string;
  fee: string;
  assignedAttestor: string;
  evidenceHashes: string[];
  documentTypes: string[];
  comments: string;
}

const AttestorDashboard: React.FC = () => {
  const { toast } = useToast();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllVerificationRequests();
  }, []);

  const fetchAllVerificationRequests = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching all verification requests for attestors...');
      
      if (!window.ethereum) {
        console.warn('Wallet not connected');
        setVerificationRequests([]);
        return;
      }

      const provider = new (await import('ethers')).BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // For now, we'll get all verification requests from the smart contract
      // In a real implementation, this would be filtered by attestor role
      const allRequests = await hederaAssetService.getSmartContractVerificationRequests(userAddress);
      
      console.log('📊 Found verification requests:', allRequests.length);
      setVerificationRequests(allRequests);
      
    } catch (error) {
      console.error('❌ Error fetching verification requests:', error);
      toast({
        title: "Error",
        description: "Failed to load verification requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock };
      case 1:
        return { label: 'Approved', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle };
      case 2:
        return { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle };
      case 3:
        return { label: 'Suspended', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: AlertCircle };
      default:
        return { label: 'Unknown', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: AlertCircle };
    }
  };

  const openRequestDetails = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setShowModal(false);
  };

  const approveRequest = async (requestId: string) => {
    try {
      // TODO: Implement approval logic with smart contract
      console.log('Approving request:', requestId);
      toast({
        title: "Success",
        description: "Verification request approved",
        variant: "default"
      });
      // Refresh the list
      fetchAllVerificationRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      // TODO: Implement rejection logic with smart contract
      console.log('Rejecting request:', requestId);
      toast({
        title: "Success",
        description: "Verification request rejected",
        variant: "default"
      });
      // Refresh the list
      fetchAllVerificationRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive"
      });
    }
  };

  const shareAsset = (assetId: string) => {
    const url = `${window.location.origin}/asset/${assetId}`;
    if (navigator.share) {
      navigator.share({
        title: `Asset Verification`,
        text: `View this asset verification on TrustBridge`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gray p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-neon-green mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading Verification Requests...</h3>
            <p className="text-gray-400">Fetching requests from blockchain</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gray p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-off-white mb-2">Attestor Dashboard</h1>
          <p className="text-off-white/70">
            Review and manage asset verification requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-off-white/70">Total Requests</p>
                  <p className="text-2xl font-bold text-off-white">{verificationRequests.length}</p>
                </div>
                <Shield className="w-8 h-8 text-neon-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-off-white/70">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {verificationRequests.filter(r => r.status === 0).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-off-white/70">Approved</p>
                  <p className="text-2xl font-bold text-green-400">
                    {verificationRequests.filter(r => r.status === 1).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-off-white/70">Rejected</p>
                  <p className="text-2xl font-bold text-red-400">
                    {verificationRequests.filter(r => r.status === 2).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Requests List */}
        <div className="space-y-6">
          {verificationRequests.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Shield className="w-16 h-16 text-off-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-off-white mb-2">No Verification Requests</h3>
                <p className="text-off-white/70">
                  No verification requests are currently available for review.
                </p>
          </CardContent>
        </Card>
          ) : (
            verificationRequests.map((request, index) => {
              const statusInfo = getStatusInfo(request.status);
              const StatusIcon = statusInfo.icon;

              return (
            <motion.div
                  key={request.requestId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
            >
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-lg font-semibold text-off-white">
                              Asset {request.assetId.slice(0, 8)}...{request.assetId.slice(-4)}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                        </span>
                      </div>
                      
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-off-white/70 mb-4">
                            <div>
                              <span className="font-medium">Asset Owner:</span>
                              <p className="font-mono text-xs">{request.assetOwner}</p>
                        </div>
                            <div>
                              <span className="font-medium">Submitted:</span>
                              <p>{new Date(request.requestedAt).toLocaleDateString()}</p>
                        </div>
                            <div>
                              <span className="font-medium">Deadline:</span>
                              <p>{new Date(request.deadline).toLocaleDateString()}</p>
                        </div>
                            <div>
                              <span className="font-medium">Documents:</span>
                              <p>{request.evidenceHashes.length} files</p>
                      </div>
                            <div>
                              <span className="font-medium">Fee:</span>
                              <p>{request.fee} HBAR</p>
                        </div>
                            <div>
                              <span className="font-medium">Type:</span>
                              <p>{request.documentTypes.join(', ')}</p>
                      </div>
                    </div>
                    
                          {/* Document Preview */}
                          {request.evidenceHashes.length > 0 && (
                            <div className="mb-4">
                              <span className="font-medium text-off-white mb-2 block">Submitted Documents:</span>
                              <div className="flex gap-2 flex-wrap">
                                {request.evidenceHashes.map((hash, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg"
                                  >
                                    <ImageIcon className="w-4 h-4 text-neon-green" />
                                    <span className="text-xs font-mono text-off-white/70">
                                      {hash.slice(0, 8)}...{hash.slice(-4)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                                      onClick={() => window.open(`https://ipfs.io/ipfs/${hash}`, '_blank')}
                                      className="px-2 py-1 h-6 text-xs"
                        >
                                      <Eye className="w-3 h-3" />
                        </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            onClick={() => openRequestDetails(request)}
                            className="bg-dark-gray hover:bg-medium-gray text-off-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => shareAsset(request.assetId)}
                              variant="outline"
                              className="flex-1 bg-dark-gray hover:bg-medium-gray text-off-white text-xs"
                            >
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </Button>
                            <Button
                              onClick={() => window.open(`/asset/${request.assetId}`, '_blank')}
                              variant="outline"
                              className="flex-1 bg-dark-gray hover:bg-medium-gray text-off-white text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Public
                            </Button>
                            <Button
                              onClick={() => copyAssetId(request.assetId)}
                              variant="outline"
                              className="px-3 bg-dark-gray hover:bg-medium-gray text-off-white"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {request.status === 0 && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => approveRequest(request.requestId)}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => rejectRequest(request.requestId)}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
              );
            })
          )}
        </div>

        {/* Modal for detailed view */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-off-white">Verification Request Details</h2>
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    className="bg-dark-gray hover:bg-medium-gray text-off-white"
                  >
                    Close
            </Button>
              </div>
              
                <div className="space-y-6">
                  {/* Asset Information */}
                  <Card className="bg-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-off-white">Asset Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                          <span className="font-medium text-off-white/70">Asset ID:</span>
                          <p className="font-mono text-sm text-off-white">{selectedRequest.assetId}</p>
                  </div>
                        <div>
                          <span className="font-medium text-off-white/70">Owner:</span>
                          <p className="font-mono text-sm text-off-white">{selectedRequest.assetOwner}</p>
                  </div>
                        <div>
                          <span className="font-medium text-off-white/70">Request ID:</span>
                          <p className="font-mono text-sm text-off-white">{selectedRequest.requestId}</p>
            </div>
            <div>
                          <span className="font-medium text-off-white/70">Fee:</span>
                          <p className="text-sm text-off-white">{selectedRequest.fee} HBAR</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card className="bg-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-off-white">Submitted Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedRequest.evidenceHashes.map((hash, idx) => (
                          <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <ImageIcon className="w-5 h-5 text-neon-green" />
                              <span className="text-sm font-medium text-off-white">
                                Document {idx + 1}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-off-white/70 mb-3 break-all">
                              {hash}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`https://ipfs.io/ipfs/${hash}`, '_blank')}
                                className="flex-1"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `https://ipfs.io/ipfs/${hash}`;
                                  link.download = `document-${idx + 1}`;
                                  link.click();
                                }}
                                className="flex-1"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                  </div>
                </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  {selectedRequest.status === 0 && (
                    <div className="flex gap-4 justify-end">
                      <Button
                        onClick={() => {
                          rejectRequest(selectedRequest.requestId);
                          closeModal();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Request
                      </Button>
                      <Button
                        onClick={() => {
                          approveRequest(selectedRequest.requestId);
                          closeModal();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Request
                      </Button>
                  </div>
                  )}
                </div>
              </div>
            </motion.div>
              </div>
              )}
            </div>
    </div>
  );
};

export default AttestorDashboard;