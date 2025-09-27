import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X, 
  Upload,
  FileText
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useWallet } from '../../contexts/WalletContext';
import { contractService, AttestorTier, AttestorType, TierRequirements } from '../../services/contractService';

interface AttestorApplicationProps {
  onComplete: (sessionId: string, status: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

const AttestorApplication: React.FC<AttestorApplicationProps> = ({
  onComplete,
  onError,
  onClose,
}) => {
  const { toast } = useToast();
  const { address, signer } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specializations: [] as string[],
    licenseNumber: '',
    licenseType: '',
    experience: 0,
    organization: '',
    walletAddress: address || '',
    selectedTier: AttestorTier.BASIC,
    attestorType: AttestorType.LEGAL_EXPERT,
    uploadedDocuments: [] as any[],
    references: [] as any[],
    portfolio: [] as any[],
    contactInfo: '',
    credentials: ''
  });

  // Tier requirements from contract
  const [tierRequirements, setTierRequirements] = useState<TierRequirements[]>([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(true);

  const [availableSpecializations] = useState([
    { id: 'real_estate', name: 'Real Estate', description: 'Property valuation and verification', icon: '🏠', requiredLicense: 'Real Estate License' },
    { id: 'art_collectibles', name: 'Art & Collectibles', description: 'Artwork and collectible authentication', icon: '🎨', requiredLicense: 'Art Appraiser License' },
    { id: 'vehicles', name: 'Vehicles', description: 'Automotive valuation and inspection', icon: '🚗', requiredLicense: 'Vehicle Inspector License' },
    { id: 'agriculture', name: 'Agriculture', description: 'Farmland and agricultural asset verification', icon: '🌾', requiredLicense: 'Agricultural Expert License' },
    { id: 'business_assets', name: 'Business Assets', description: 'Commercial asset valuation', icon: '🏢', requiredLicense: 'Business Valuation License' },
    { id: 'legal', name: 'Legal', description: 'Legal document verification', icon: '⚖️', requiredLicense: 'Legal License' }
  ]);

  // Tier names and icons for display
  const tierNames = ['Basic', 'Professional', 'Expert', 'Master'];
  const tierIcons = ['🥉', '🥈', '🥇', '💎'];
  const tierDescriptions = [
    'Entry-level professional verification',
    'Mid-level professional with verified credentials', 
    'Senior professional with advanced credentials',
    'Industry leader with extensive experience'
  ];

  useEffect(() => {
    if (address) {
      setFormData(prev => ({ ...prev, walletAddress: address }));
    }
  }, [address]);

  // Load tier requirements from contract
  useEffect(() => {
    const loadTierRequirements = async () => {
      try {
        setIsLoadingRequirements(true);
        const requirements = await Promise.all([
          contractService.getTierRequirements(AttestorTier.BASIC),
          contractService.getTierRequirements(AttestorTier.PROFESSIONAL),
          contractService.getTierRequirements(AttestorTier.EXPERT),
          contractService.getTierRequirements(AttestorTier.MASTER)
        ]);
        setTierRequirements(requirements);
      } catch (error) {
        console.error('Failed to load tier requirements:', error);
        toast({
          title: "Error",
          description: "Failed to load tier requirements from contract",
          variant: "destructive"
        });
      } finally {
        setIsLoadingRequirements(false);
      }
    };

    loadTierRequirements();
  }, [toast]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecializationToggle = (specializationId: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specializationId)
        ? prev.specializations.filter(id => id !== specializationId)
        : [...prev.specializations, specializationId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate form data
      if (!formData.name || !formData.email || formData.specializations.length === 0) {
        throw new Error('Please fill in all required fields');
      }

      // Get selected tier requirements from contract
      const selectedTierRequirements = tierRequirements[formData.selectedTier];
      if (!selectedTierRequirements) {
        throw new Error('Please select a valid tier');
      }

      // Check if user meets tier requirements
      if (formData.experience < selectedTierRequirements.experienceRequirement) {
        throw new Error(`You need at least ${selectedTierRequirements.experienceRequirement} years of experience for this tier`);
      }

      // Connect to wallet if not connected
      if (!signer) {
        const connectionResult = await contractService.connect();
        if (!connectionResult.success) {
          throw new Error(connectionResult.error || 'Failed to connect wallet');
        }
      }

      // Prepare attestor data for smart contract
      const attestorData = {
        name: formData.name,
        organization: formData.organization,
        attestorType: formData.attestorType,
        tier: formData.selectedTier,
        specializations: formData.specializations,
        countries: ['Global'], // Default to global
        experienceYears: formData.experience,
        contactInfo: formData.contactInfo || formData.email,
        credentials: formData.credentials || formData.licenseNumber,
        uploadedDocuments: formData.uploadedDocuments.map(doc => doc.cid || doc.url || '')
      };

      console.log('🚀 Registering attestor with smart contract...');
      console.log('Attestor data:', attestorData);
      console.log('Tier requirements:', selectedTierRequirements);

      // Register with smart contract
      const contractResult = await contractService.registerAttestor(attestorData);
      
      if (!contractResult.success) {
        throw new Error(contractResult.error || 'Smart contract registration failed');
      }

      // Also submit to backend for tracking
      const applicationData = {
        walletAddress: formData.walletAddress,
        email: formData.email,
        name: formData.name,
        specializations: formData.specializations,
        licenseNumber: formData.licenseNumber,
        licenseType: formData.licenseType,
        experience: formData.experience,
        organization: formData.organization,
        selectedTier: formData.selectedTier,
        tierRequirements: {
          stake: selectedTierRequirements.stakingRequirement,
          fee: selectedTierRequirements.registrationFee,
          experience: selectedTierRequirements.experienceRequirement,
          documents: selectedTierRequirements.documentRequirements
        },
        uploadedDocuments: formData.uploadedDocuments,
        references: formData.references,
        portfolio: formData.portfolio,
        verificationType: 'smart_contract',
        status: 'pending_review',
        transactionHash: contractResult.transactionHash
      };

      try {
        const response = await fetch(`${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4001'}/api/attestors/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationData),
        });

        if (!response.ok) {
          console.warn('Failed to submit to backend, but smart contract registration succeeded');
        }
      } catch (backendError) {
        console.warn('Backend submission failed, but smart contract registration succeeded:', backendError);
      }
      
      toast({
        variant: "success",
        title: "Registration Successful! 🎉",
        description: `Your attestor registration has been submitted to the smart contract. Transaction: ${contractResult.transactionHash?.slice(0, 10)}...`,
      });
      
      onComplete(contractResult.transactionHash || 'smart_contract', 'pending_review');
    } catch (err) {
      console.error('Attestor registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Become a Professional Attestor
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Join our network of verified professionals and earn fees by verifying real-world assets.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Requirements:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enhanced KYC Verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Professional License</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">10,000 TRUST Token Stake</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">1+ Years Experience</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization (Optional)
                </label>
                <Input
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="Enter your organization name"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select Your Specializations
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose the areas where you have professional expertise and licenses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSpecializations.map((spec) => (
                <motion.div
                  key={spec.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.specializations.includes(spec.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => handleSpecializationToggle(spec.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{spec.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {spec.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {spec.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Required: {spec.requiredLicense}
                          </p>
                        </div>
                        {formData.specializations.includes(spec.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Professional Credentials
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Provide your professional license and experience details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Number *
                </label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  placeholder="Enter your professional license number"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Type *
                </label>
                <Input
                  value={formData.licenseType}
                  onChange={(e) => handleInputChange('licenseType', e.target.value)}
                  placeholder="e.g., Real Estate Appraiser License"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Years of Experience *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                  placeholder="Enter years of professional experience"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        if (isLoadingRequirements) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Loading Tier Requirements...
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Fetching latest requirements from smart contract.
                </p>
              </div>
            </div>
          );
        }


        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select Your Attestor Tier
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose the tier that best matches your experience and credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tierRequirements.map((tier, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.selectedTier === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => handleInputChange('selectedTier', index)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{tierIcons[index]}</div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {tierNames[index]} Attestor
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {tierDescriptions[index]}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Stake:</span>
                            <span className="font-semibold">{parseFloat(tier.stakingRequirement).toLocaleString()} TRUST</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                            <span className="font-semibold">${parseFloat(tier.registrationFee).toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                            <span className="font-semibold">{tier.experienceRequirement}+ years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Documents:</span>
                            <span className="font-semibold">{tier.documentRequirements.length} required</span>
                          </div>
                        </div>
                        {formData.selectedTier === index && (
                          <CheckCircle className="w-5 h-5 text-blue-500 mx-auto mt-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 5:
        const docTierRequirements = tierRequirements[formData.selectedTier];
        const docTierName = tierNames[formData.selectedTier] || 'Unknown';
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload Required Documents
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload all required documents for {docTierName} verification.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Required Documents:</h4>
              <div className="space-y-2">
                {docTierRequirements?.documentRequirements.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supported formats: PDF, JPG, PNG (Max 10MB each)
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        const reviewTierRequirements = tierRequirements[formData.selectedTier];
        const reviewTierName = tierNames[formData.selectedTier] || 'Unknown';
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Review & Submit Application
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Review your application details before submitting to the smart contract.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Application Summary:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-semibold">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tier:</span>
                  <span className="font-semibold">{reviewTierName} Attestor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Stake Required:</span>
                  <span className="font-semibold">{parseFloat(reviewTierRequirements?.stakingRequirement || '0').toLocaleString()} TRUST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Registration Fee:</span>
                  <span className="font-semibold">${parseFloat(reviewTierRequirements?.registrationFee || '0').toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Experience Required:</span>
                  <span className="font-semibold">{reviewTierRequirements?.experienceRequirement || 0}+ years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Specializations:</span>
                  <span className="font-semibold">{formData.specializations.length} selected</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Your application will be submitted to the smart contract and reviewed by our team.
              </p>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting to Smart Contract...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Submit to Smart Contract
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Verification Error
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {error}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setError(null)}
                className="w-full"
                size="lg"
              >
                Try Again
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-500" />
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Attestor Application
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Step {currentStep} of 6
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
              >
                Previous
              </Button>
              
              {currentStep < 6 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!formData.name || !formData.email)) ||
                    (currentStep === 2 && formData.specializations.length === 0) ||
                    (currentStep === 3 && (!formData.licenseNumber || !formData.licenseType || formData.experience < 1)) ||
                    (currentStep === 4 && !formData.selectedTier) ||
                    (currentStep === 5 && formData.uploadedDocuments.length === 0)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || isVerifying}
                >
                  {isLoading || isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {isVerifying ? 'Verifying...' : 'Starting...'}
                    </>
                  ) : (
                    'Start Verification'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AttestorApplication;
