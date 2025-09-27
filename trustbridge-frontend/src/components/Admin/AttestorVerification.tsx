import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Eye,
  AlertCircle,
  Calendar,
  DollarSign,
  Shield,
  Award,
  Building2,
  Car,
  Palette,
  TreePine,
  Briefcase,
  Scale,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { contractService } from '../../services/contractService';
import { useWallet } from '../../contexts/WalletContext';
import { AdminGuard, useAdmin } from '../../contexts/AdminContext';

interface AttestorApplication {
  id: string;
  walletAddress: string;
  email: string;
  name: string;
  specializations: string[];
  licenseNumber: string;
  licenseType: string;
  experience: number;
  organization: string;
  selectedTier: string;
  tierRequirements: {
    stake: number;
    fee: number;
    experience: number;
    documents: string[];
  };
  uploadedDocuments: any[];
  references: any[];
  portfolio: any[];
  status: 'pending_review' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

const AttestorVerification: React.FC = () => {
  const { toast } = useToast();
  const { signer } = useWallet();
  const { isAdmin, adminRoles } = useAdmin();
  const [applications, setApplications] = useState<AttestorApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<AttestorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [contractProfiles] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      
      // Fetch all attestors from smart contract
      const attestors = await contractService.getAllAttestors();
      console.log('Loaded attestors from contract:', attestors);
      
      // Convert contract data to application format
      const applications: AttestorApplication[] = attestors.map((attestor, index) => ({
        id: `ATT-${index + 1}`,
        walletAddress: attestor.address,
        email: attestor.contactInfo || 'N/A',
        name: attestor.name,
        specializations: attestor.specializations || [],
        licenseNumber: 'N/A',
        licenseType: 'Professional',
        experience: Number(attestor.experienceYears),
        organization: attestor.organization,
        selectedTier: getTierName(attestor.tier),
        tierRequirements: {
          stake: Number(attestor.stakedAmount) / 1e18,
          fee: Number(attestor.registrationFee) / 1e18,
          experience: Number(attestor.experienceYears),
          documents: attestor.requiredDocuments || []
        },
        uploadedDocuments: attestor.uploadedDocuments || [],
        references: [],
        portfolio: [],
        status: getStatusFromContract(attestor.status),
        submittedAt: new Date(Number(attestor.createdAt) * 1000).toISOString(),
        reviewerNotes: attestor.reviewerNotes || '',
        contractProfile: attestor
      }));
      
      setApplications(applications);
      
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attestor applications"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierName = (tier: number): string => {
    switch (tier) {
      case 0: return 'Basic';
      case 1: return 'Professional';
      case 2: return 'Expert';
      case 3: return 'Master';
      default: return 'Unknown';
    }
  };

  const getStatusFromContract = (status: number): 'pending_review' | 'approved' | 'rejected' | 'under_review' => {
    switch (status) {
      case 0: return 'pending_review';
      case 1: return 'approved';
      case 2: return 'rejected';
      case 3: return 'under_review';
      default: return 'pending_review';
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setProcessing(applicationId);
      
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Connect wallet if not connected
      if (!signer) {
        const connectionResult = await contractService.connect();
        if (!connectionResult.success) {
          throw new Error(connectionResult.error || 'Failed to connect wallet');
        }
      }

      // Approve on smart contract
      const contractResult = await contractService.approveAttestor(application.walletAddress);
      if (!contractResult.success) {
        throw new Error(contractResult.error || 'Smart contract approval failed');
      }

      // Update backend
      const response = await fetch(`${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4001'}/api/attestors/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerNotes: reviewNotes,
          transactionHash: contractResult.transactionHash
        }),
      });

      if (!response.ok) {
        console.warn('Backend update failed, but smart contract approval succeeded');
      }
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'approved' as const, reviewedAt: new Date().toISOString(), reviewerNotes: reviewNotes }
          : app
      ));
      
      toast({
        variant: "success",
        title: "Application Approved! 🎉",
        description: `Attestor approved on smart contract. Transaction: ${contractResult.transactionHash?.slice(0, 10)}...`
      });
      
      setReviewNotes('');
      setSelectedApplication(null);
    } catch (error) {
      console.error('Failed to approve application:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to approve application'
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      setProcessing(applicationId);
      
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Connect wallet if not connected
      if (!signer) {
        const connectionResult = await contractService.connect();
        if (!connectionResult.success) {
          throw new Error(connectionResult.error || 'Failed to connect wallet');
        }
      }

      // Reject on smart contract
      const contractResult = await contractService.rejectAttestor(application.walletAddress);
      if (!contractResult.success) {
        throw new Error(contractResult.error || 'Smart contract rejection failed');
      }

      // Update backend
      const response = await fetch(`${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4001'}/api/attestors/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerNotes: reviewNotes,
          transactionHash: contractResult.transactionHash
        }),
      });

      if (!response.ok) {
        console.warn('Backend update failed, but smart contract rejection succeeded');
      }
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'rejected' as const, reviewedAt: new Date().toISOString(), reviewerNotes: reviewNotes }
          : app
      ));
      
      toast({
        variant: "destructive",
        title: "Application Rejected",
        description: `Attestor rejected on smart contract. Transaction: ${contractResult.transactionHash?.slice(0, 10)}...`
      });
      
      setReviewNotes('');
      setSelectedApplication(null);
    } catch (error) {
      console.error('Failed to reject application:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to reject application'
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'under_review':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSpecializationIcon = (id: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      real_estate: <Building2 className="w-4 h-4" />,
      art_collectibles: <Palette className="w-4 h-4" />,
      vehicles: <Car className="w-4 h-4" />,
      agriculture: <TreePine className="w-4 h-4" />,
      business_assets: <Briefcase className="w-4 h-4" />,
      legal: <Scale className="w-4 h-4" />,
    };
    return icons[id] || <Award className="w-4 h-4" />;
  };

  const getTierIcon = (tier: string) => {
    const icons: { [key: string]: string } = {
      tier1: '🥉',
      tier2: '🥈',
      tier3: '🥇',
      tier4: '💎'
    };
    return icons[tier] || '🏆';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AdminGuard 
      requireVerifier={true}
      fallback={
        <div className="space-y-6">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You need VERIFIER_ROLE on the smart contract to access this page.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contact the contract administrator to grant you the necessary permissions.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Clean Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Attestor Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Review and approve attestor applications
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {applications.length} applications
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {adminRoles.isAdmin ? 'Admin Access' : 'Verifier Access'}
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

      <div className="space-y-4">
        {/* Applications List - Modern Design */}
        <div className="space-y-3 max-w-4xl mx-auto">
          {applications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className={`cursor-pointer transition-all duration-300 rounded-xl border-2 p-4 ${
                  selectedApplication?.id === application.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {application.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {application.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {application.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {application.organization} • {application.experience} years experience
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {application.tierRequirements.stake.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">TRUST</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {application.uploadedDocuments.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Submitted</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Application Review - Modern Design */}
        {selectedApplication && (
          <div className="mt-6 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Review Application</h2>
                      <p className="text-blue-100">
                        {selectedApplication.name} • {selectedApplication.selectedTier.replace('tier', 'Tier ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-100">Application ID</div>
                    <div className="font-mono text-lg">{selectedApplication.id.slice(0, 8)}...</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Applicant Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applicant Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApplication.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApplication.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApplication.organization}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedApplication.experience} years</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requirements</h3>
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Stake Required</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedApplication.tierRequirements.stake.toLocaleString()} TRUST
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Fee</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ${selectedApplication.tierRequirements.fee}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Uploaded Documents ({selectedApplication.uploadedDocuments.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedApplication.uploadedDocuments.map((doc, index) => {
                      // Debug: Log the document structure
                      console.log('Document:', doc);
                      
                      // Ensure we have a valid URL - prioritize IPFS URLs
                      const documentUrl = doc.ipfsUrl || doc.url || doc.path || doc.fileUrl || doc.downloadUrl || '#';
                      const isValidUrl = documentUrl && documentUrl !== '#' && (documentUrl.startsWith('http') || documentUrl.startsWith('ipfs') || documentUrl.startsWith('/'));
                      
                      // Handle click for documents without valid URLs
                      const handleDocumentClick = () => {
                        if (isValidUrl) {
                          window.open(documentUrl, '_blank');
                        } else {
                          // Try to download or show the document
                          console.log('Document data:', doc);
                          alert('Document URL not available. Document data: ' + JSON.stringify(doc));
                        }
                      };
                      
                      return (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name || `Document ${index + 1}`}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Document {index + 1}
                                {doc.ipfsCid && (
                                  <span className="ml-2 text-blue-500">IPFS: {doc.ipfsCid.substring(0, 8)}...</span>
                                )}
                              </p>
                              {!isValidUrl && (
                                <p className="text-xs text-red-500 mt-1">No valid URL available</p>
                              )}
                            </div>
                            <button
                              onClick={handleDocumentClick}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 cursor-pointer"
                              title={isValidUrl ? "View document" : "Click to see document info"}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="mt-3">
                            <button
                              onClick={handleDocumentClick}
                              className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ${
                                isValidUrl 
                                  ? 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300' 
                                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                              }`}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              {isValidUrl ? 'Open Document' : 'View Document Info'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review Actions */}
                {selectedApplication.status === 'pending_review' && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review & Decision</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Review Notes
                        </label>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                          rows={3}
                          placeholder="Add your review notes here..."
                        />
                      </div>
                      <div className="flex space-x-4">
                        <Button
                          onClick={() => handleApprove(selectedApplication.id)}
                          disabled={processing === selectedApplication.id}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {processing === selectedApplication.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                          )}
                          Approve Application
                        </Button>
                        <Button
                          onClick={() => handleReject(selectedApplication.id)}
                          disabled={processing === selectedApplication.id}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {processing === selectedApplication.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          ) : (
                            <XCircle className="w-5 h-5 mr-2" />
                          )}
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default AttestorVerification;
