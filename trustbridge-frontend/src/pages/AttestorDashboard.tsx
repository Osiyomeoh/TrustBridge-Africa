import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  X, 
  Eye, 
  MapPin, 
  Calendar,
  Star,
  TrendingUp,
  FileText,
  Camera,
  AlertCircle,
  Loader2,
  Filter,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface VerificationRequest {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  ownerName: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  estimatedValue: {
    amount: number;
    currency: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  dueDate: string;
  documents: number;
  photos: number;
  automatedScore?: number;
  attestorNotes?: string;
  evidence: {
    documents: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
    }>;
    photos: Array<{
      id: string;
      name: string;
      url: string;
      description: string;
    }>;
  };
}

interface AttestorStats {
  totalAssignments: number;
  completedVerifications: number;
  pendingVerifications: number;
  averageScore: number;
  reputationScore: number;
  monthlyEarnings: number;
}

const AttestorDashboard: React.FC = () => {
  const { toast } = useToast();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const [attestorStats] = useState<AttestorStats>({
    totalAssignments: 24,
    completedVerifications: 18,
    pendingVerifications: 6,
    averageScore: 87.5,
    reputationScore: 4.8,
    monthlyEarnings: 12500
  });

  // Mock data - replace with API calls
  useEffect(() => {
    const mockRequests: VerificationRequest[] = [
      {
        id: '1',
        assetId: 'AST-001',
        assetName: 'Luxury Apartment Complex',
        assetType: 'real_estate',
        ownerName: 'John Adebayo',
        location: {
          address: '123 Victoria Island',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria'
        },
        estimatedValue: {
          amount: 250000000,
          currency: 'NGN'
        },
        status: 'pending',
        priority: 'high',
        submittedAt: '2024-01-15T10:30:00Z',
        dueDate: '2024-01-22T17:00:00Z',
        documents: 5,
        photos: 12,
        automatedScore: 78,
        evidence: {
          documents: [
            { id: '1', name: 'Title Deed.pdf', type: 'ownership', url: '#' },
            { id: '2', name: 'Survey Plan.pdf', type: 'survey', url: '#' },
            { id: '3', name: 'Valuation Report.pdf', type: 'valuation', url: '#' }
          ],
          photos: [
            { id: '1', name: 'exterior_1.jpg', url: '#', description: 'Front view of the building' },
            { id: '2', name: 'interior_1.jpg', url: '#', description: 'Living room' }
          ]
        }
      },
      {
        id: '2',
        assetId: 'AST-002',
        assetName: 'Agricultural Farm Land',
        assetType: 'agricultural',
        ownerName: 'Mary Okafor',
        location: {
          address: 'Farm Road, Ogun State',
          city: 'Abeokuta',
          state: 'Ogun',
          country: 'Nigeria'
        },
        estimatedValue: {
          amount: 45000000,
          currency: 'NGN'
        },
        status: 'in_progress',
        priority: 'medium',
        submittedAt: '2024-01-14T14:20:00Z',
        dueDate: '2024-01-21T17:00:00Z',
        documents: 3,
        photos: 8,
        automatedScore: 65,
        attestorNotes: 'Need to verify soil quality and crop yield data',
        evidence: {
          documents: [
            { id: '1', name: 'Land Certificate.pdf', type: 'ownership', url: '#' },
            { id: '2', name: 'Soil Test Report.pdf', type: 'other', url: '#' }
          ],
          photos: [
            { id: '1', name: 'farm_overview.jpg', url: '#', description: 'Aerial view of the farm' },
            { id: '2', name: 'crops.jpg', url: '#', description: 'Current crop cultivation' }
          ]
        }
      },
      {
        id: '3',
        assetId: 'AST-003',
        assetName: 'Industrial Warehouse',
        assetType: 'industrial',
        ownerName: 'Ahmed Hassan',
        location: {
          address: 'Industrial Area, Kano',
          city: 'Kano',
          state: 'Kano',
          country: 'Nigeria'
        },
        estimatedValue: {
          amount: 180000000,
          currency: 'NGN'
        },
        status: 'completed',
        priority: 'low',
        submittedAt: '2024-01-10T09:15:00Z',
        dueDate: '2024-01-17T17:00:00Z',
        documents: 7,
        photos: 15,
        automatedScore: 92,
        attestorNotes: 'Verified - Excellent condition, all documents in order',
        evidence: {
          documents: [
            { id: '1', name: 'Property Deed.pdf', type: 'ownership', url: '#' },
            { id: '2', name: 'Building Permit.pdf', type: 'other', url: '#' }
          ],
          photos: [
            { id: '1', name: 'warehouse_exterior.jpg', url: '#', description: 'External view' },
            { id: '2', name: 'warehouse_interior.jpg', url: '#', description: 'Internal structure' }
          ]
        }
      }
    ];

    setTimeout(() => {
      setVerificationRequests(mockRequests);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = verificationRequests
    .filter(request => {
      if (filter !== 'all' && request.status !== filter) return false;
      if (searchTerm && !request.assetName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !request.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'value':
          comparison = a.estimatedValue.amount - b.estimatedValue.amount;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'real_estate':
        return '🏢';
      case 'agricultural':
        return '🌾';
      case 'industrial':
        return '🏭';
      case 'residential':
        return '🏠';
      default:
        return '📦';
    }
  };

  const handleStartVerification = (request: VerificationRequest) => {
    setSelectedRequest(request);
    toast({
      variant: "success",
      title: "Verification Started",
      description: `You are now reviewing ${request.assetName}. Please complete your assessment.`
    });
  };

  const handleCompleteVerification = async (requestId: string, approved: boolean, notes: string, score: number) => {
    try {
      // TODO: Implement API call to submit verification result
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: approved ? 'completed' : 'rejected', attestorNotes: notes }
            : req
        )
      );
      
      setSelectedRequest(null);
      
      toast({
        variant: approved ? "success" : "destructive",
        title: approved ? "Verification Approved" : "Verification Rejected",
        description: `Your verification has been submitted successfully.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your verification. Please try again."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-off-white font-secondary relative overflow-hidden dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-electric-mint mx-auto mb-4" />
            <p className="text-lg text-off-white/70">Loading verification requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-off-white font-secondary relative overflow-hidden dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,255,255,0.05),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-off-white mb-4"
          >
            Attestor Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-off-white/70"
          >
            Review and verify asset tokenization requests
          </motion.p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-off-white/70">Total Assignments</p>
                  <p className="text-2xl font-bold text-off-white">{attestorStats.totalAssignments}</p>
                </div>
                <Shield className="w-8 h-8 text-electric-mint" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-off-white/70">Completed</p>
                  <p className="text-2xl font-bold text-neon-green">{attestorStats.completedVerifications}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-off-white/70">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{attestorStats.pendingVerifications}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-off-white/70">Reputation Score</p>
                  <p className="text-2xl font-bold text-off-white">{attestorStats.reputationScore}/5.0</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-off-white/50" />
                  <input
                    type="text"
                    placeholder="Search by asset name or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white placeholder:text-off-white/50 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="value">Sort by Value</option>
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Requests */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-neon-green/30 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{getAssetTypeIcon(request.assetType)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-off-white">{request.assetName}</h3>
                          <p className="text-sm text-off-white/70">Asset ID: {request.assetId}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-electric-mint" />
                          <span className="text-sm text-off-white/70">
                            {request.location.city}, {request.location.state}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-electric-mint" />
                          <span className="text-sm text-off-white/70">
                            {request.estimatedValue.amount.toLocaleString()} {request.estimatedValue.currency}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-electric-mint" />
                          <span className="text-sm text-off-white/70">
                            Due: {new Date(request.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-off-white/70">
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{request.documents} docs</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Camera className="w-4 h-4" />
                          <span>{request.photos} photos</span>
                        </div>
                        {request.automatedScore && (
                          <div className="flex items-center space-x-1">
                            <Shield className="w-4 h-4" />
                            <span>Auto Score: {request.automatedScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-medium text-off-white capitalize">
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartVerification(request)}
                          >
                            Start Verification
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-off-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-off-white mb-2">No Verification Requests</h3>
              <p className="text-off-white/70">
                {filter === 'all' 
                  ? "You don't have any verification requests assigned to you yet."
                  : `No ${filter} verification requests found.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verification Detail Modal */}
      {selectedRequest && (
        <VerificationDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onComplete={handleCompleteVerification}
        />
      )}
    </div>
  );
};

// Verification Detail Modal Component
interface VerificationDetailModalProps {
  request: VerificationRequest;
  onClose: () => void;
  onComplete: (requestId: string, approved: boolean, notes: string, score: number) => void;
}

const VerificationDetailModal: React.FC<VerificationDetailModalProps> = ({
  request,
  onClose,
  onComplete
}) => {
  const [notes, setNotes] = useState(request.attestorNotes || '');
  const [score, setScore] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await onComplete(request.id, approved, notes, score);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-gray-900/95 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-off-white">
                {request.assetName}
              </CardTitle>
              <p className="text-off-white/70">Asset ID: {request.assetId}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Asset Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-off-white mb-3">Asset Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-off-white/70">Type:</span>
                    <span className="text-off-white capitalize">{request.assetType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-off-white/70">Owner:</span>
                    <span className="text-off-white">{request.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-off-white/70">Location:</span>
                    <span className="text-off-white">{request.location.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-off-white/70">Value:</span>
                    <span className="text-off-white">
                      {request.estimatedValue.amount.toLocaleString()} {request.estimatedValue.currency}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-off-white mb-3">Verification Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-off-white/70">Status:</span>
                    <span className="text-off-white capitalize">{request.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-off-white/70">Priority:</span>
                    <span className="text-off-white capitalize">{request.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-off-white/70">Due Date:</span>
                    <span className="text-off-white">
                      {new Date(request.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {request.automatedScore && (
                    <div className="flex justify-between">
                      <span className="text-off-white/70">Auto Score:</span>
                      <span className="text-off-white">{request.automatedScore}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Evidence Review */}
            <div>
              <h3 className="text-lg font-semibold text-off-white mb-3">Evidence Review</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-off-white mb-2">Documents ({request.evidence.documents.length})</h4>
                  <div className="space-y-2">
                    {request.evidence.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-dark-gray rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-electric-mint" />
                          <span className="text-sm text-off-white">{doc.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-off-white mb-2">Photos ({request.evidence.photos.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {request.evidence.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square bg-dark-gray rounded overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            {request.status === 'pending' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-off-white">Verification Assessment</h3>
                
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Confidence Score (0-100)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-off-white/70 mt-1">
                    <span>0%</span>
                    <span className="font-medium">{score}%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your verification notes and observations..."
                    rows={4}
                    className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white placeholder:text-off-white/50 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {request.status === 'pending' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      'Reject Verification'
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      'Approve Verification'
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AttestorDashboard;
