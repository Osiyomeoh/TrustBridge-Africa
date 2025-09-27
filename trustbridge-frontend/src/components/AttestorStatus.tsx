import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './UI/Card';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  Shield,
  Award,
  Building2,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';
import { contractService } from '../services/contractService';
import { useWallet } from '../contexts/WalletContext';

interface AttestorProfile {
  attestorAddress: string;
  name: string;
  organization: string;
  attestorType: number;
  tier: number;
  specializations: string[];
  countries: string[];
  experienceYears: number;
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  reputationScore: number;
  stakedAmount: string;
  registrationFee: string;
  requiredDocuments: string[];
  uploadedDocuments: string[];
  status: number; // 0: Pending, 1: Approved, 2: Rejected, 3: Suspended
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
  contactInfo: string;
  credentials: string;
  reviewerNotes: string;
}

const AttestorStatus: React.FC = () => {
  const { address } = useWallet();
  const [profile, setProfile] = useState<AttestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      loadAttestorProfile();
    }
  }, [address]);

  const loadAttestorProfile = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const profile = await contractService.getAttestorProfile(address);
      console.log('Attestor profile loaded:', profile);
      
      if (profile && profile.attestorAddress && profile.attestorAddress !== '0x0000000000000000000000000000000000000000') {
        // Convert the struct result to object format
        const profileData: AttestorProfile = {
          attestorAddress: profile.attestorAddress,
          name: profile.name,
          organization: profile.organization,
          attestorType: Number(profile.attestorType),
          tier: Number(profile.tier),
          specializations: profile.specializations || [],
          countries: profile.countries || [],
          experienceYears: Number(profile.experienceYears),
          totalVerifications: Number(profile.totalVerifications),
          successfulVerifications: Number(profile.successfulVerifications),
          failedVerifications: Number(profile.failedVerifications),
          reputationScore: Number(profile.reputationScore),
          stakedAmount: profile.stakedAmount.toString(),
          registrationFee: profile.registrationFee.toString(),
          requiredDocuments: profile.requiredDocuments || [],
          uploadedDocuments: profile.uploadedDocuments || [],
          status: Number(profile.status),
          isActive: profile.isActive,
          createdAt: profile.createdAt.toString(),
          lastActivity: profile.lastActivity.toString(),
          contactInfo: profile.contactInfo || '',
          credentials: profile.credentials || '',
          reviewerNotes: profile.reviewerNotes || ''
        };
        
        setProfile(profileData);
      } else {
        setError('No attestor profile found for this address.');
      }
    } catch (error) {
      console.error('Failed to load attestor profile:', error);
      setError('Failed to load attestor profile. You may not be registered as an attestor.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { 
          text: 'Pending Review', 
          color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
          icon: Clock
        };
      case 1:
        return { 
          text: 'Approved', 
          color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
          icon: CheckCircle
        };
      case 2:
        return { 
          text: 'Rejected', 
          color: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
          icon: XCircle
        };
      case 3:
        return { 
          text: 'Suspended', 
          color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
          icon: AlertCircle
        };
      default:
        return { 
          text: 'Unknown', 
          color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400',
          icon: AlertCircle
        };
    }
  };

  const getTierInfo = (tier: number) => {
    switch (tier) {
      case 0: return { name: 'Basic', color: 'text-blue-600', icon: Shield };
      case 1: return { name: 'Professional', color: 'text-purple-600', icon: Award };
      case 2: return { name: 'Expert', color: 'text-orange-600', icon: Building2 };
      case 3: return { name: 'Master', color: 'text-red-600', icon: Shield };
      default: return { name: 'Unknown', color: 'text-gray-600', icon: Shield };
    }
  };

  const getAttestorTypeInfo = (type: number) => {
    switch (type) {
      case 0: return 'Legal Expert';
      case 1: return 'Financial Auditor';
      case 2: return 'Real Estate Appraiser';
      case 3: return 'Art & Collectibles Expert';
      case 4: return 'Technology Specialist';
      case 5: return 'Environmental Consultant';
      case 6: return 'General Business Advisor';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading attestor status...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Attestor Profile Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <button
            onClick={loadAttestorProfile}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Not Registered as Attestor
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You haven't registered as an attestor yet.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/attestor-registration'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Register as Attestor
          </button>
        </div>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(profile.status);
  const tierInfo = getTierInfo(profile.tier);
  const StatusIcon = statusInfo.icon;
  const TierIcon = tierInfo.icon;

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                Attestor Status
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Your professional attestor application status
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-2`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.text}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TierIcon className={`w-8 h-8 ${tierInfo.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {tierInfo.name} Attestor
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {getAttestorTypeInfo(profile.attestorType)}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.experienceYears}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Years Experience
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.reputationScore}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Reputation Score
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
              <p className="text-gray-900 dark:text-white">{profile.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Organization</label>
              <p className="text-gray-900 dark:text-white">{profile.organization}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Specializations</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.specializations.map((spec, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Countries of Operation</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.countries.map((country, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Staked Amount</label>
              <p className="text-gray-900 dark:text-white">
                {parseFloat(profile.stakedAmount) / 1e18} TRUST
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration Fee</label>
              <p className="text-gray-900 dark:text-white">
                {parseFloat(profile.registrationFee) / 1e18} TRUST
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Verifications</label>
              <p className="text-gray-900 dark:text-white">{profile.totalVerifications}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</label>
              <p className="text-gray-900 dark:text-white">
                {profile.totalVerifications > 0 
                  ? ((profile.successfulVerifications / profile.totalVerifications) * 100).toFixed(1)
                  : 0
                }%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Registration Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration Date</label>
              <p className="text-gray-900 dark:text-white">
                {new Date(parseInt(profile.createdAt) * 1000).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Activity</label>
              <p className="text-gray-900 dark:text-white">
                {new Date(parseInt(profile.lastActivity) * 1000).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Status</label>
              <p className={`font-medium ${profile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet Address</label>
              <p className="text-gray-900 dark:text-white font-mono text-sm">
                {profile.attestorAddress.slice(0, 6)}...{profile.attestorAddress.slice(-4)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviewer Notes (if any) */}
      {profile.reviewerNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Reviewer Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {profile.reviewerNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttestorStatus;
