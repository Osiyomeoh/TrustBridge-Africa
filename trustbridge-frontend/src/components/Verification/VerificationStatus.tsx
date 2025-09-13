import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import { 
  Clock, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Loader2, 
  Shield,
  FileText,
  Camera,
  MapPin,
  User,
  Calendar,
  Star
} from 'lucide-react';

interface VerificationStatusProps {
  verification: {
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
  };
  showDetails?: boolean;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  verification, 
  showDetails = true 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-neon-green" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-400" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'completed':
        return 'text-neon-green';
      case 'rejected':
        return 'text-red-400';
      case 'cancelled':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
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

  const getProgressPercentage = () => {
    switch (verification.status) {
      case 'pending':
        return 25;
      case 'in_progress':
        return 60;
      case 'completed':
        return 100;
      case 'rejected':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  const getStatusMessage = () => {
    switch (verification.status) {
      case 'pending':
        return 'Your verification request is pending review. Our team will assign a qualified attestor within 24 hours.';
      case 'in_progress':
        return `Your asset is being verified by ${verification.attestorName || 'a qualified attestor'}. This process typically takes 3-5 business days.`;
      case 'completed':
        return `Verification completed successfully! Your asset has been verified with a score of ${verification.finalScore}%.`;
      case 'rejected':
        return 'Verification was not successful. Please review the feedback and resubmit with additional documentation.';
      case 'cancelled':
        return 'Verification request was cancelled. You can submit a new request at any time.';
      default:
        return 'Verification status unknown.';
    }
  };

  const progressPercentage = getProgressPercentage();

  return (
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getAssetTypeIcon(verification.assetType)}</span>
            <div>
              <CardTitle className="text-lg font-semibold text-off-white">
                {verification.assetName}
              </CardTitle>
              <p className="text-sm text-off-white/70 capitalize">
                {verification.assetType.replace('_', ' ')} • ID: {verification.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(verification.priority)}`}>
              {verification.priority.toUpperCase()}
            </span>
            <div className={`flex items-center space-x-2 ${getStatusColor(verification.status)}`}>
              {getStatusIcon(verification.status)}
              <span className="text-sm font-medium capitalize">
                {verification.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-off-white/70">Verification Progress</span>
            <span className="text-off-white font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-dark-gray rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-neon-green to-electric-mint h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-dark-gray/50 to-dark-gray/30 border border-neon-green/20">
          <p className="text-sm text-off-white/80">{getStatusMessage()}</p>
        </div>

        {/* Verification Details */}
        {showDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-off-white">Verification Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Submitted:</span>
                  </span>
                  <span className="text-off-white">
                    {new Date(verification.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Due Date:</span>
                  </span>
                  <span className="text-off-white">
                    {new Date(verification.dueDate).toLocaleDateString()}
                  </span>
                </div>
                {verification.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-off-white/70 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed:</span>
                    </span>
                    <span className="text-off-white">
                      {new Date(verification.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {verification.attestorName && (
                  <div className="flex items-center justify-between">
                    <span className="text-off-white/70 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Attestor:</span>
                    </span>
                    <span className="text-off-white">{verification.attestorName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-off-white">Asset Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70 flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location:</span>
                  </span>
                  <span className="text-off-white text-right">
                    {verification.location.city}, {verification.location.state}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Documents:</span>
                  </span>
                  <span className="text-off-white">{verification.documents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-off-white/70 flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Photos:</span>
                  </span>
                  <span className="text-off-white">{verification.photos}</span>
                </div>
                {verification.automatedScore && (
                  <div className="flex items-center justify-between">
                    <span className="text-off-white/70 flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Auto Score:</span>
                    </span>
                    <span className="text-off-white">{verification.automatedScore}%</span>
                  </div>
                )}
                {verification.finalScore && (
                  <div className="flex items-center justify-between">
                    <span className="text-off-white/70 flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Final Score:</span>
                    </span>
                    <span className="text-neon-green font-semibold">{verification.finalScore}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Attestor Notes */}
        {verification.attestorNotes && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-off-white">Attestor Notes</h4>
            <div className="p-3 rounded-lg bg-dark-gray/50 border border-gray-600/30">
              <p className="text-sm text-off-white/80">{verification.attestorNotes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {verification.status === 'rejected' && (
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button className="flex-1 px-4 py-2 bg-neon-green text-black rounded-lg font-medium hover:bg-electric-mint transition-colors">
              Resubmit for Verification
            </button>
            <button className="px-4 py-2 border border-gray-600 text-off-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              View Feedback
            </button>
          </div>
        )}

        {verification.status === 'completed' && (
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button className="flex-1 px-4 py-2 bg-neon-green text-black rounded-lg font-medium hover:bg-electric-mint transition-colors">
              Proceed to Tokenization
            </button>
            <button className="px-4 py-2 border border-gray-600 text-off-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Download Certificate
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
