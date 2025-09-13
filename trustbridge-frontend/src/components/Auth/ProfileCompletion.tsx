import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, CheckCircle, AlertCircle, Loader2, Wallet, ArrowLeft } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Breadcrumb from '../UI/Breadcrumb';
import ProgressIndicator from '../UI/ProgressIndicator';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';

const ProfileCompletion: React.FC = () => {
  const { completeProfile, isLoading, error, user, authStep } = useAuth();
  const { address: walletAddress, walletType } = useWallet();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    country: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Redirect verified users to dashboard
  useEffect(() => {
    if (user && (user.emailVerificationStatus === 'VERIFIED' || user.emailVerificationStatus === 'verified')) {
      console.log('ProfileCompletion - User already verified, redirecting to dashboard');
      window.location.href = '/dashboard/';
    }
  }, [user]);

  // Show loading screen while checking user status
  if (authStep === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900">
        <div className="text-center">
          <div className="relative mb-8">
            {/* Animated TrustBridge Logo */}
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green to-emerald-500 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-2 bg-midnight-900 rounded-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-neon-green">🌍</span>
              </div>
            </div>
            
            {/* Animated Loading Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-midnight-700 border-t-neon-green rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>
          
          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-off-white mb-4">
            TrustBridge
          </h2>
          <p className="text-lg text-midnight-300 mb-2">
            Universal Asset Protocol for Africa
          </p>
          <p className="text-midnight-400 mb-8">
            {authStep === 'complete' ? 'Redirecting to dashboard...' : 'Checking your account status...'}
          </p>
          
          {/* Loading Steps */}
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-neon-green rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-midnight-900" />
              </div>
              <span className="text-midnight-300">Wallet Connected</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-neon-green rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-midnight-900" />
              </div>
              <span className="text-midnight-300">Verifying Account</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-neon-green rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              </div>
              <span className="text-midnight-300">Preparing Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Connect Wallet', icon: <Wallet className="w-4 h-4" /> },
            { label: 'Complete Profile', icon: <User className="w-4 h-4" />, current: true }
          ]}
          showBackButton={true}
          backButtonText="Back to Wallet"
          onBack={() => window.location.href = '/'}
        />
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <ProgressIndicator
          currentStep={2}
          totalSteps={3}
          steps={['Connect Wallet', 'Complete Profile', 'Verify Email']}
          variant="detailed"
        />
      </div>

      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-neon-green/20 text-neon-green">
            <User className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Complete Your Profile
        </h2>
        <p className="text-text-secondary">
          Add your personal information to complete your account setup.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
            <span className="text-error text-sm">{error}</span>
          </motion.div>
        )}

        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={`pl-10 ${validationErrors.email ? 'border-error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {validationErrors.email && (
              <p className="text-error text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={`pl-10 ${validationErrors.name ? 'border-error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {validationErrors.name && (
              <p className="text-error text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Wallet Address Field - Non-editable */}
          {walletAddress && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Connected Wallet Address
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <Input
                  type="text"
                  value={`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} (${walletType})`}
                  className="pl-10 bg-background-tertiary/50 border-border-primary/50 text-text-secondary cursor-not-allowed"
                  disabled={true}
                  readOnly
                />
              </div>
              <p className="text-xs text-text-tertiary mt-1">
                This address is connected from your {walletType} wallet
              </p>
            </div>
          )}

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={`pl-10 ${validationErrors.phone ? 'border-error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {validationErrors.phone && (
              <p className="text-error text-xs mt-1">{validationErrors.phone}</p>
            )}
          </div>

          {/* Country Field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Country
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
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
              Completing Profile...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Profile
            </>
          )}
        </Button>

        <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-gray-600/30 dark:bg-gray-800/50 dark:border-gray-600/30">
          <h3 className="text-sm font-semibold text-white dark:text-white mb-2">
            What happens next?
          </h3>
          <ul className="text-xs text-gray-300 dark:text-gray-300 space-y-1">
            <li>• We'll send a verification email to your address</li>
            <li>• Click the link in the email to verify your account</li>
            <li>• Once verified, you'll have full access to all features</li>
          </ul>
        </div>
      </motion.form>
      </div>
    </div>
  );
};

export default ProfileCompletion;
