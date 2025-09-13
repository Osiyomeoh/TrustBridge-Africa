import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import Button from '../UI/Button';
import VerificationStatus from './VerificationStatus';
import { 
  Plus, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
  Shield
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface VerificationRequest {
  id: string;
  assetName: string;
  assetType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  submittedAt: string;
  completedAt?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  automatedScore?: number;
  finalScore?: number;
  attestorName?: string;
  attestorNotes?: string;
  documents: number;
  photos: number;
  location: {
    address: string;
    city: string;
    state: string;
  };
}

interface VerificationListProps {
  showCreateButton?: boolean;
  limit?: number;
  showFilters?: boolean;
  statusFilter?: string;
  onVerificationClick?: (verification: VerificationRequest) => void;
}

const VerificationList: React.FC<VerificationListProps> = ({
  showCreateButton = true,
  limit,
  showFilters = true,
  statusFilter,
  onVerificationClick
}) => {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'rejected'>(
    statusFilter as any || 'all'
  );

  // Mock data - replace with API call
  useEffect(() => {
    const mockVerifications: VerificationRequest[] = [
      {
        id: 'VER-001',
        assetName: 'Luxury Apartment Complex',
        assetType: 'real_estate',
        status: 'completed',
        submittedAt: '2024-01-10T10:30:00Z',
        completedAt: '2024-01-15T14:20:00Z',
        dueDate: '2024-01-17T17:00:00Z',
        priority: 'high',
        automatedScore: 85,
        finalScore: 92,
        attestorName: 'Dr. Sarah Johnson',
        attestorNotes: 'Excellent documentation and property condition. All requirements met.',
        documents: 5,
        photos: 12,
        location: {
          address: '123 Victoria Island',
          city: 'Lagos',
          state: 'Lagos'
        }
      },
      {
        id: 'VER-002',
        assetName: 'Agricultural Farm Land',
        assetType: 'agricultural',
        status: 'in_progress',
        submittedAt: '2024-01-14T14:20:00Z',
        dueDate: '2024-01-21T17:00:00Z',
        priority: 'medium',
        automatedScore: 72,
        attestorName: 'Prof. Michael Adebayo',
        documents: 3,
        photos: 8,
        location: {
          address: 'Farm Road, Ogun State',
          city: 'Abeokuta',
          state: 'Ogun'
        }
      },
      {
        id: 'VER-003',
        assetName: 'Industrial Warehouse',
        assetType: 'industrial',
        status: 'pending',
        submittedAt: '2024-01-16T09:15:00Z',
        dueDate: '2024-01-23T17:00:00Z',
        priority: 'low',
        automatedScore: 68,
        documents: 4,
        photos: 6,
        location: {
          address: 'Industrial Area, Kano',
          city: 'Kano',
          state: 'Kano'
        }
      },
      {
        id: 'VER-004',
        assetName: 'Residential Property',
        assetType: 'residential',
        status: 'rejected',
        submittedAt: '2024-01-12T11:45:00Z',
        dueDate: '2024-01-19T17:00:00Z',
        priority: 'medium',
        automatedScore: 45,
        attestorName: 'Eng. Fatima Hassan',
        attestorNotes: 'Insufficient documentation. Please provide updated property survey and ownership documents.',
        documents: 2,
        photos: 4,
        location: {
          address: '456 GRA, Abuja',
          city: 'Abuja',
          state: 'FCT'
        }
      }
    ];

    setTimeout(() => {
      setVerifications(mockVerifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredVerifications = verifications
    .filter(verification => {
      if (filter !== 'all' && verification.status !== filter) return false;
      if (searchTerm && !verification.assetName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !verification.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'status':
          const statusOrder = { completed: 4, in_progress: 3, pending: 2, rejected: 1, cancelled: 0 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    })
    .slice(0, limit);

  const getStatusCounts = () => {
    const counts = {
      all: verifications.length,
      pending: verifications.filter(v => v.status === 'pending').length,
      in_progress: verifications.filter(v => v.status === 'in_progress').length,
      completed: verifications.filter(v => v.status === 'completed').length,
      rejected: verifications.filter(v => v.status === 'rejected').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="h-2 bg-gray-700 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-off-white">Verification Requests</h2>
          <p className="text-off-white/70">
            Track and manage your asset verification requests
          </p>
        </div>
        
        {showCreateButton && (
          <Button
            onClick={() => window.location.href = '/verify-asset'}
            className="bg-neon-green hover:bg-electric-mint text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit New Asset
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-off-white/50" />
                  <input
                    type="text"
                    placeholder="Search by asset name or verification ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white placeholder:text-off-white/50 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white"
                >
                  <option value="all">All ({statusCounts.all})</option>
                  <option value="pending">Pending ({statusCounts.pending})</option>
                  <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
                  <option value="completed">Completed ({statusCounts.completed})</option>
                  <option value="rejected">Rejected ({statusCounts.rejected})</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="status">Sort by Status</option>
                  <option value="priority">Sort by Priority</option>
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
      )}

      {/* Verification List */}
      <div className="space-y-4">
        {filteredVerifications.length > 0 ? (
          filteredVerifications.map((verification, index) => (
            <motion.div
              key={verification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <VerificationStatus
                verification={verification}
                showDetails={true}
              />
            </motion.div>
          ))
        ) : (
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-off-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-off-white mb-2">No Verification Requests</h3>
              <p className="text-off-white/70 mb-6">
                {filter === 'all' 
                  ? "You haven't submitted any asset verification requests yet."
                  : `No ${filter} verification requests found.`
                }
              </p>
              {showCreateButton && (
                <Button
                  onClick={() => window.location.href = '/verify-asset'}
                  className="bg-neon-green hover:bg-electric-mint text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Asset
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Load More Button */}
      {limit && filteredVerifications.length >= limit && (
        <div className="text-center">
          <Button variant="outline" onClick={() => {/* TODO: Load more */}}>
            Load More Verifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerificationList;
