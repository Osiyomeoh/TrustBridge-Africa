import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  User, 
  Mail, 
  CheckCircle, 
  X, 
  Loader2,
  UserCheck,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';

interface UnifiedAuthFlowProps {
  onComplete?: () => void;
  showAsModal?: boolean;
  trigger?: React.ReactNode;
}

const UnifiedAuthFlow: React.FC<UnifiedAuthFlowProps> = ({ 
  showAsModal = false,
  trigger 
}) => {
  const navigate = useNavigate();
  const { isConnected, connectWallet, disconnectWallet, address, accountId, loading: walletLoading } = useWallet();
  const { 
    user, 
    authStep,
    completeProfile, 
    verifyEmail, 
    refreshUser, 
    error: authError 
  } = useAuth();
  const { toast } = useToast();

  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    country: ''
  });
  const [hasHashpack, setHasHashpack] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Use authStep from AuthContext instead of local state
  const currentStep = authStep;
  const [emailToken, setEmailToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if HashPack is installed
  useEffect(() => {
    const checkHashpack = async () => {
      try {
        // Check if HashPack provider is available
        const hashpack = (window as any).hashpack;
        setHasHashpack(!!hashpack);
      } catch (error) {
        setHasHashpack(false);
      }
    };
    
    checkHashpack();
  }, []);

  // Check auth status on mount and when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    console.log('UnifiedAuthFlow - Modal opened, determining step:', {
      isConnected,
      address,
      accountId,
      hasUser: !!user,
      userEmail: user?.email,
      userName: user?.name,
      emailVerificationStatus: user?.emailVerificationStatus,
      hasEmail: !!user?.email,
      hasName: !!user?.name,
      currentStep,
      authStep
    });
    
    // AuthContext now manages the authStep, so we don't need to set it here
    console.log('UnifiedAuthFlow - Current authStep from context:', authStep);
  }, [isOpen, isConnected, accountId, user?.email, user?.name, user?.emailVerificationStatus, currentStep, authStep]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      console.log('🔌 UnifiedAuthFlow: handleConnectWallet called');
      
      // Check if HashPack is installed
      if (!hasHashpack) {
        setShowInstallPrompt(true);
        return;
      }
      
      // Add a small delay to ensure wallet context is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await connectWallet();
      toast({
        title: 'Wallet Connected',
        description: 'HashPack wallet connected successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect HashPack wallet. Please make sure HashPack is installed.',
        variant: 'destructive'
      });
    }
  };

  // Handle profile completion
  const handleCompleteProfile = async () => {
    if (!profileData.name || !profileData.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name and email address.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await completeProfile(profileData);
      await refreshUser(); // Refresh user data
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully!',
        variant: 'default'
      });
      // AuthContext will handle the step transition
    } catch (error: any) {
      console.error('Profile completion failed:', error);
      
      // Get the error message from the error object
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      
      toast({
        title: 'Profile Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email verification
  const handleVerifyEmail = async () => {
    if (!emailToken) {
      toast({
        title: 'Verification Code Required',
        description: 'Please enter the verification code sent to your email.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(emailToken);
      await refreshUser(); // Refresh user data
      toast({
        title: 'Email Verified',
        description: 'Your email has been verified successfully!',
        variant: 'default'
      });
      // AuthContext will handle the step transition
          // Redirect to profile page after email verification
          console.log('Email verification completed, redirecting to profile');
          
          // Close modal and redirect to profile
          setTimeout(() => {
            console.log('Closing modal and redirecting to profile');
            setIsOpen(false);
            navigate('/dashboard/profile');
          }, 1500);
    } catch (error) {
      console.error('Email verification failed:', error);
      toast({
        title: 'Verification Failed',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend verification email
  const handleResendEmail = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'No email address found. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Resending verification email to:', user.email);
      const { apiService } = await import('../../services/api');
      await apiService.resendVerification(user.email);
      
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification email has been sent to your inbox.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Get current step info
  const getStepInfo = () => {
    switch (currentStep) {
      case 'wallet':
        return {
          title: 'Connect Your Wallet',
          description: 'Connect your HashPack wallet to get started',
          icon: Wallet,
          color: 'text-blue-400'
        };
      case 'profile':
        return {
          title: 'Complete Your Profile',
          description: 'Add your personal information to continue',
          icon: User,
          color: 'text-purple-400'
        };
      case 'email':
        return {
          title: 'Verify Your Email',
          description: 'Check your email for a verification code',
          icon: Mail,
          color: 'text-orange-400'
        };
      case 'complete':
        return {
          title: 'Authentication Complete',
          description: 'You are now fully authenticated',
          icon: CheckCircle,
          color: 'text-green-400'
        };
      default:
        return {
          title: 'Connect Your Wallet',
          description: 'Connect your HashPack wallet to get started',
          icon: Wallet,
          color: 'text-blue-400'
        };
    }
  };

  const stepInfo = getStepInfo();
  const StepIcon = stepInfo.icon;

  // Debug logging for current step
  console.log('UnifiedAuthFlow - Current step:', currentStep);
  console.log('UnifiedAuthFlow - Step info:', stepInfo);

  // If user is fully authenticated, show connected status
  if (currentStep === 'complete' && user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green to-electric-mint flex items-center justify-center">
          {user.name ? (
            <span className="text-black font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <UserCheck className="w-4 h-4 text-black" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-off-white">
            {user.name || 'User'}
          </span>
          <span className="text-xs text-gray-400">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Render trigger button or modal
  const content = (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-700 shadow-2xl max-h-[80vh] overflow-y-auto">
      <CardHeader className="text-center relative">
        {showAsModal && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-off-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center ${stepInfo.color}`}>
            <StepIcon className="w-8 h-8" />
          </div>
        </div>
        <CardTitle className="text-xl text-off-white">{stepInfo.title}</CardTitle>
        <p className="text-gray-400 text-sm">{stepInfo.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Step 1: Connect Wallet */}
        {currentStep === 'wallet' && (
          <div className="space-y-4">
            {showInstallPrompt ? (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">HashPack Wallet Required</h4>
                      <p className="text-sm text-yellow-300/80">
                        You need to install HashPack wallet to use TrustBridge. It's free and takes less than 2 minutes.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => window.open('https://hashpack.app', '_blank')}
                    className="w-full"
                    variant="neon"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download HashPack
                  </Button>
                  
                  <Button
                    onClick={() => window.open('https://hashpack.app', '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit hashpack.app
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setShowInstallPrompt(false);
                      window.location.reload();
                    }}
                    variant="ghost"
                    className="w-full text-xs"
                  >
                    I've Installed HashPack - Continue
                  </Button>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-300">📱 Quick Setup:</p>
                  <ol className="text-xs text-gray-400 space-y-1 ml-4">
                    <li>1. Download HashPack from hashpack.app</li>
                    <li>2. Create a new wallet or import existing</li>
                    <li>3. Switch to <strong className="text-neon-green">Testnet</strong> mode</li>
                    <li>4. Come back and click "Continue" above</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleConnectWallet}
                  disabled={walletLoading}
                  className="w-full"
                  variant="neon"
                >
                  {walletLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  Connect HashPack Wallet
                </Button>
                
                {!hasHashpack && (
                  <button
                    onClick={() => setShowInstallPrompt(true)}
                    className="w-full text-xs text-yellow-400 hover:text-yellow-300 underline"
                  >
                    Don't have HashPack? Install it here
                  </button>
                )}
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By connecting your wallet, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Complete Profile */}
        {currentStep === 'profile' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number (Optional)</label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Country (Optional)</label>
                <Input
                  value={profileData.country}
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter your country"
                />
              </div>
            </div>
            
            <Button
              onClick={handleCompleteProfile}
              disabled={isSubmitting || !profileData.name || !profileData.email}
              className="w-full"
              variant="neon"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <User className="w-4 h-4 mr-2" />
              )}
              Complete Profile
            </Button>
          </div>
        )}

        {/* Step 3: Verify Email */}
        {currentStep === 'email' && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Mail className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-blue-300">
                We've sent a verification code to:
              </p>
              <p className="font-semibold text-blue-200">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Verification Code</label>
              <Input
                value={emailToken}
                onChange={(e) => setEmailToken(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={handleVerifyEmail}
                disabled={isSubmitting || !emailToken}
                className="w-full"
                variant="neon"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Verify Email
              </Button>
              
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full text-xs"
              >
                Resend Verification Email
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {authError && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">{authError}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (showAsModal) {
    return (
      <>
        {trigger && (
          <div onClick={() => {
            console.log('Trigger clicked, opening modal');
            setIsOpen(true);
          }}>
            {trigger}
          </div>
        )}
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-20"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md max-h-[75vh] overflow-y-auto"
              >
                {content}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return content;
};

export default UnifiedAuthFlow;
