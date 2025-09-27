import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, CheckCircle, AlertCircle, Loader2, Wallet, X } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';

interface ProfileCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ProfileCompletionPopup: React.FC<ProfileCompletionPopupProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const { completeProfile, isLoading, error, user } = useAuth();
  const { address: walletAddress, walletType } = useWallet();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    country: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'email-sent'>('form');

  // Check if user is already verified
  useEffect(() => {
    if (user && (user.emailVerificationStatus === 'VERIFIED' || user.emailVerificationStatus === 'verified')) {
      onComplete();
    }
  }, [user, onComplete]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await completeProfile(formData);
      setStep('email-sent');
    } catch (error) {
      console.error('Profile completion failed:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleVerifyEmail = () => {
    // This would typically open the user's email client or redirect to email verification
    window.open('https://mail.google.com', '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-midnight-900 border border-midnight-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-off-white">Complete Profile</h3>
                <p className="text-sm text-electric-mint">Required for trading</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-midnight-800 hover:bg-midnight-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {step === 'form' ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-400 text-sm">{error}</span>
                </motion.div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-off-white mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-off-white mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your name"
                    className={`pl-10 ${validationErrors.name ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Wallet Address - Read Only */}
              {walletAddress && (
                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">
                    Connected Wallet
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                      className="pl-10 bg-midnight-800 text-gray-400 cursor-not-allowed"
                      disabled={true}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-off-white mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={`pl-10 ${validationErrors.phone ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                )}
              </div>

              {/* Country Field */}
              <div>
                <label className="block text-sm font-medium text-off-white mb-2">
                  Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter your country"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Profile
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-neon-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-off-white mb-2">
                  Check Your Email
                </h3>
                <p className="text-sm text-electric-mint">
                  We've sent a verification link to <strong>{formData.email}</strong>
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleVerifyEmail}
                  variant="outline"
                  className="w-full"
                >
                  Open Email
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                >
                  I'll verify later
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileCompletionPopup;
