import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useToast } from '../../hooks/useToast';
import { contractService, AttestorType, AttestorData, AttestorTier, TierRequirements } from '../../services/contractService';
import { useWallet } from '../../contexts/WalletContext';
import { 
  User, 
  Building, 
  Award, 
  Globe, 
  Calendar,
  Mail,
  FileText,
  CheckCircle,
  Upload,
  X,
  Shield,
  DollarSign,
  Clock,
  AlertCircle,
  Info,
  Download,
  Eye,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  hash?: string;
}

const AttestorRegistration: React.FC = () => {
  const { toast } = useToast();
  const { isConnected, address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tierRequirements, setTierRequirements] = useState<TierRequirements | null>(null);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [formData, setFormData] = useState<AttestorData>({
    name: '',
    organization: '',
    attestorType: AttestorType.LEGAL_EXPERT,
    tier: AttestorTier.BASIC,
    specializations: [],
    countries: [],
    experienceYears: 0,
    contactInfo: '',
    credentials: '',
    uploadedDocuments: []
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const attestorTypes = [
    { value: AttestorType.LEGAL_EXPERT, label: 'Legal Expert', description: 'Legal documentation and compliance' },
    { value: AttestorType.FINANCIAL_AUDITOR, label: 'Financial Auditor', description: 'Financial analysis and auditing' },
    { value: AttestorType.TECHNICAL_SPECIALIST, label: 'Technical Specialist', description: 'Technical evaluation and assessment' },
    { value: AttestorType.REAL_ESTATE_APPRAISER, label: 'Real Estate Appraiser', description: 'Property valuation and assessment' },
    { value: AttestorType.AGRICULTURAL_EXPERT, label: 'Agricultural Expert', description: 'Agricultural and farming expertise' },
    { value: AttestorType.ART_APPRAISER, label: 'Art Appraiser', description: 'Art and collectibles valuation' },
    { value: AttestorType.VEHICLE_INSPECTOR, label: 'Vehicle Inspector', description: 'Vehicle inspection and evaluation' },
    { value: AttestorType.BUSINESS_VALUATOR, label: 'Business Valuator', description: 'Business valuation and assessment' }
  ];

  const tierInfo = [
    { 
      value: AttestorTier.BASIC, 
      label: 'Basic Attestor', 
      description: 'Entry-level professional verification',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      emoji: '🥉'
    },
    { 
      value: AttestorTier.PROFESSIONAL, 
      label: 'Professional Attestor', 
      description: 'Mid-level professional with verified credentials',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      emoji: '🥈'
    },
    { 
      value: AttestorTier.EXPERT, 
      label: 'Expert Attestor', 
      description: 'Senior professional with advanced credentials',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      emoji: '🥇'
    },
    { 
      value: AttestorTier.MASTER, 
      label: 'Master Attestor', 
      description: 'Industry leader with extensive experience',
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      emoji: '💎'
    }
  ];

  // Fallback requirements when contract call fails
  const getFallbackRequirements = (tier: AttestorTier): TierRequirements => {
    const fallbackMap = {
      [AttestorTier.BASIC]: {
        stakingRequirement: '1000',
        registrationFee: '25',
        experienceRequirement: 1,
        documentRequirements: ['Professional License', 'ID Verification', 'Background Check', 'Reference Letter']
      },
      [AttestorTier.PROFESSIONAL]: {
        stakingRequirement: '5000',
        registrationFee: '50',
        experienceRequirement: 3,
        documentRequirements: ['Professional License', 'ID Verification', 'Background Check', 'Reference Letter']
      },
      [AttestorTier.EXPERT]: {
        stakingRequirement: '10000',
        registrationFee: '100',
        experienceRequirement: 5,
        documentRequirements: ['Professional License', 'ID Verification', 'Background Check', 'Reference Letter', 'Advanced Certification']
      },
      [AttestorTier.MASTER]: {
        stakingRequirement: '25000',
        registrationFee: '250',
        experienceRequirement: 10,
        documentRequirements: ['Professional License', 'ID Verification', 'Background Check', 'Reference Letter', 'Advanced Certification', 'Industry Recognition']
      }
    };
    
    return fallbackMap[tier] || fallbackMap[AttestorTier.BASIC];
  };

  // Load tier requirements when tier changes
  useEffect(() => {
    const loadTierRequirements = async () => {
      setLoadingRequirements(true);
      try {
        console.log('🔄 Loading tier requirements for tier:', formData.tier);
        const requirements = await contractService.getTierRequirements(formData.tier);
        console.log('✅ Tier requirements loaded:', requirements);
        setTierRequirements(requirements);
      } catch (error) {
        console.error('❌ Failed to load tier requirements:', error);
        // Set fallback requirements based on tier
        const fallbackRequirements = getFallbackRequirements(formData.tier);
        console.log('🔄 Using fallback requirements:', fallbackRequirements);
        setTierRequirements(fallbackRequirements);
      } finally {
        setLoadingRequirements(false);
      }
    };
    
    if (formData.tier !== undefined) {
      loadTierRequirements();
    }
  }, [formData.tier]);

  const handleInputChange = (field: keyof AttestorData, value: any) => {
    console.log('Input change:', field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Validate file type and size
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: 'File Too Large',
            description: `${file.name} is too large. Maximum size is 10MB.`,
            type: 'error'
          });
          continue;
        }

        // Create file object
        const fileObj: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size
        };

        // In a real implementation, you would upload to IPFS here
        // For now, we'll simulate the upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUploadedFiles(prev => [...prev, fileObj]);
        setFormData(prev => ({
          ...prev,
          uploadedDocuments: [...prev.uploadedDocuments, fileObj.id]
        }));
      }

      toast({
        title: 'Files Uploaded',
        description: `${files.length} file(s) uploaded successfully`,
        type: 'success'
      });
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload files. Please try again.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setFormData(prev => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter(id => id !== fileId)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        console.log('Moving to step:', newStep);
        return newStep;
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceedToNext = useMemo(() => {
    const result = (() => {
      switch (currentStep) {
        case 1:
          return formData.name && formData.organization;
        case 2:
          const attestorTypeValid = formData.attestorType !== undefined && formData.attestorType !== null;
          const tierValid = formData.tier !== undefined && formData.tier !== null;
          const step2Result = attestorTypeValid && tierValid;
          
          console.log('Step 2 validation:', {
            attestorType: formData.attestorType,
            tier: formData.tier,
            attestorTypeValid,
            tierValid,
            result: step2Result
          });
          return step2Result;
        case 3:
          return formData.experienceYears > 0 && formData.specializations.length > 0;
        case 4:
          return formData.contactInfo && formData.credentials;
        case 5:
          return uploadedFiles.length > 0;
        default:
          return false;
      }
    })();
    
    console.log('Validation check:', {
      currentStep,
      formData: {
        name: formData.name,
        organization: formData.organization,
        attestorType: formData.attestorType,
        tier: formData.tier,
        experienceYears: formData.experienceYears,
        specializations: formData.specializations,
        contactInfo: formData.contactInfo,
        credentials: formData.credentials
      },
      uploadedFiles: uploadedFiles.length,
      canProceed: result
    });
    
    return result;
  }, [currentStep, formData, uploadedFiles.length]);

  const handleSpecializationAdd = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const handleSpecializationRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const handleCountryAdd = () => {
    if (newCountry.trim() && !formData.countries.includes(newCountry.trim())) {
      setFormData(prev => ({
        ...prev,
        countries: [...prev.countries, newCountry.trim()]
      }));
      setNewCountry('');
    }
  };

  const handleCountryRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.filter((_, i) => i !== index)
    }));
  };

  const handleSpecializationKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSpecializationAdd();
    }
  };

  const handleCountryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCountryAdd();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Submit button clicked, current step:', currentStep);
    
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to register as an attestor',
        type: 'error'
      });
      return;
    }

    // Ensure user is on the last step
    if (currentStep !== totalSteps) {
      toast({
        title: 'Complete All Steps',
        description: `Please complete all ${totalSteps} steps before submitting`,
        type: 'error'
      });
      return;
    }

    // Debug: Log current form data
    console.log('🔍 Form validation debug:', {
      name: formData.name,
      organization: formData.organization,
      experienceYears: formData.experienceYears,
      tier: formData.tier,
      contactInfo: formData.contactInfo,
      credentials: formData.credentials,
      specializations: formData.specializations,
      countries: formData.countries,
      uploadedFiles: uploadedFiles.length
    });

    if (!formData.name || !formData.organization || formData.experienceYears === 0 || formData.tier === undefined || formData.tier === null) {
      console.log('❌ Basic validation failed:', {
        name: !!formData.name,
        organization: !!formData.organization,
        experienceYears: formData.experienceYears > 0,
        tier: formData.tier !== undefined && formData.tier !== null
      });
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields and complete all steps',
        type: 'error'
      });
      return;
    }

    // Additional validation for contact and credentials
    if (!formData.contactInfo || !formData.credentials) {
      console.log('❌ Contact/Credentials validation failed:', {
        contactInfo: !!formData.contactInfo,
        credentials: !!formData.credentials
      });
      toast({
        title: 'Missing Information',
        description: 'Please fill in contact information and professional credentials',
        type: 'error'
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: 'Documents Required',
        description: 'Please upload at least one document (certificate, license, etc.)',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the complete form data
      const completeFormData = {
        ...formData,
        uploadedDocuments: uploadedFiles.map(file => file.hash || file.id), // Use hash (CID) if available, fallback to id
        documentTypes: uploadedFiles.map(file => file.type || 'other') // Map file types to document types
      };
      
      console.log('🔍 AttestorRegistration - Complete form data:', completeFormData);
      console.log('🔍 Uploaded files:', uploadedFiles);
      
      const result = await contractService.registerAttestor(completeFormData);
      
      if (result.success) {
        toast({
          title: 'Registration Submitted! 🎉',
          description: `Your attestor registration has been submitted for review. Transaction: ${result.transactionHash?.slice(0, 10)}...`,
          type: 'success'
        });
        
        // Reset form
        setFormData({
          name: '',
          organization: '',
          attestorType: AttestorType.LEGAL_EXPERT,
          tier: AttestorTier.BASIC,
          specializations: [],
          countries: [],
          experienceYears: 0,
          contactInfo: '',
          credentials: '',
          uploadedDocuments: []
        });
        setUploadedFiles([]);
        setCurrentStep(1);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto flex-1 space-y-4 px-4">
        {/* Header */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-off-white mb-2">Become a Professional Attestor</h2>
          <p className="text-medium-gray text-sm">
            Join our network of verified professionals and help verify tokenized assets
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step <= currentStep
                    ? 'bg-neon-green text-midnight-900'
                    : 'bg-medium-gray text-off-white/50'
                }`}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-neon-green' : 'bg-medium-gray'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Debug: Current Step Indicator */}
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-2 bg-electric-mint/20 text-electric-mint rounded-full text-sm font-semibold">
            Step {currentStep} of {totalSteps}
          </div>
          {currentStep === 2 && (
            <div className="mt-2 space-y-2">
              <div className="inline-block px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-semibold">
                Selected Tier: {tierInfo.find(t => t.value === formData.tier)?.label || 'None'}
              </div>
              {tierRequirements && (
                <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                  Requirements Loaded: {tierRequirements.stakingRequirement} HBAR stake, ${tierRequirements.registrationFee} fee
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-dark-gray/50 border-medium-gray">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-off-white mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-neon-green" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-off-white/80 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-off-white/80 mb-2">
                      Organization *
                    </label>
                    <Input
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      placeholder="Enter your organization"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Professional Type & Tier */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <Card className="bg-dark-gray/50 border-medium-gray">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-off-white mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-neon-green" />
                  Professional Type
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {attestorTypes.map((type) => (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          formData.attestorType === type.value
                            ? 'border-neon-green bg-neon-green/10'
                            : 'border-medium-gray hover:border-neon-green/50'
                        }`}
                        onClick={() => handleInputChange('attestorType', type.value)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-off-white">{type.label}</h4>
                          <p className="text-sm text-off-white/70 mt-1">{type.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-medium-gray/30 pt-6 mt-6">
                  <h4 className="text-lg font-semibold text-off-white mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-electric-mint" />
                    Select Your Attestor Tier
                  </h4>
                  <p className="text-sm text-off-white/70 mb-6">
                    Choose the tier that best matches your experience and credentials.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {tierInfo.map((tier) => (
                    <motion.div
                      key={tier.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 h-full min-h-[200px] transform hover:scale-105 ${
                          formData.tier === tier.value
                            ? 'border-electric-mint bg-gradient-to-br from-electric-mint/20 to-electric-mint/10 ring-2 ring-electric-mint/50 shadow-lg shadow-electric-mint/20'
                            : 'border-medium-gray hover:border-electric-mint/50 bg-dark-gray/30 hover:bg-dark-gray/50'
                        }`}
                        onClick={() => handleInputChange('tier', tier.value)}
                      >
                        <CardContent className="p-4 h-full flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{tier.emoji}</span>
                              <h4 className="font-semibold text-off-white text-sm">{tier.label}</h4>
                            </div>
                            {formData.tier === tier.value && (
                              <div className="flex items-center justify-center w-6 h-6 bg-electric-mint rounded-full">
                                <CheckCircle className="w-4 h-4 text-black" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-off-white/70 mb-4 flex-grow">{tier.description}</p>
                          <div className="text-xs text-off-white/60 space-y-2">
                            <div className="flex justify-between">
                              <span>Stake:</span>
                              <span className="font-mono text-xs font-semibold">
                                {tier.value === AttestorTier.BASIC ? '1,000 TRUST' :
                                 tier.value === AttestorTier.PROFESSIONAL ? '5,000 TRUST' :
                                 tier.value === AttestorTier.EXPERT ? '10,000 TRUST' :
                                 '25,000 TRUST'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fee:</span>
                              <span className="font-mono text-xs font-semibold">
                                {tier.value === AttestorTier.BASIC ? '$25' :
                                 tier.value === AttestorTier.PROFESSIONAL ? '$50' :
                                 tier.value === AttestorTier.EXPERT ? '$100' :
                                 '$250'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Exp:</span>
                              <span className="font-mono text-xs font-semibold">
                                {tier.value === AttestorTier.BASIC ? '1+ years' :
                                 tier.value === AttestorTier.PROFESSIONAL ? '3+ years' :
                                 tier.value === AttestorTier.EXPERT ? '5+ years' :
                                 '10+ years'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Docs:</span>
                              <span className="font-mono text-xs font-semibold">
                                {tier.value === AttestorTier.BASIC ? '4 req' :
                                 tier.value === AttestorTier.PROFESSIONAL ? '4 req' :
                                 tier.value === AttestorTier.EXPERT ? '5 req' :
                                 '6 req'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Selected indicator */}
                          {formData.tier === tier.value && (
                            <div className="mt-3 pt-3 border-t border-electric-mint/30">
                              <div className="flex items-center justify-center text-electric-mint text-xs font-semibold">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                SELECTED
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Tier Requirements */}
                {loadingRequirements ? (
                  <div className="bg-midnight-800/50 rounded-lg p-4 border border-electric-mint/20">
                    <h5 className="font-semibold text-electric-mint mb-3 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Loading Tier Requirements...
                    </h5>
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-electric-mint"></div>
                    </div>
                  </div>
                ) : tierRequirements ? (
                  <div className="bg-midnight-800/50 rounded-lg p-4 border border-electric-mint/20">
                    <h5 className="font-semibold text-electric-mint mb-3 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Tier Requirements
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                        <span className="text-off-white/80">Stake: {tierRequirements.stakingRequirement} HBAR</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-off-white/80">Fee: {tierRequirements.registrationFee} HBAR</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-400" />
                        <span className="text-off-white/80">Experience: {tierRequirements.experienceRequirement} years</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-off-white/80 text-sm mb-2">Required Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {tierRequirements.documentRequirements.map((doc, index) => (
                          <span key={index} className="px-2 py-1 bg-electric-mint/20 text-electric-mint text-xs rounded">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Experience & Specializations */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-dark-gray/50 border-medium-gray">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-off-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-neon-green" />
                  Experience & Specializations
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-off-white/80 mb-2">
                      Years of Experience *
                    </label>
                    <Input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                      placeholder="Enter years of experience"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-off-white/80 mb-2">
                      Specializations *
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-neon-green/20 text-neon-green border border-neon-green/30"
                        >
                          {spec}
                          <button
                            type="button"
                            onClick={() => handleSpecializationRemove(index)}
                            className="ml-2 text-neon-green hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        onKeyPress={handleSpecializationKeyPress}
                        placeholder="Enter specialization (e.g., Real Estate Law)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleSpecializationAdd}
                        variant="outline"
                        className="border-neon-green text-neon-green hover:bg-neon-green/10"
                        disabled={!newSpecialization.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-off-white/80 mb-2">
                      Countries of Operation
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.countries.map((country, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-electric-mint/20 text-electric-mint border border-electric-mint/30"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => handleCountryRemove(index)}
                            className="ml-2 text-electric-mint hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        onKeyPress={handleCountryKeyPress}
                        placeholder="Enter country (e.g., United States)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleCountryAdd}
                        variant="outline"
                        className="border-electric-mint text-electric-mint hover:bg-electric-mint/10"
                        disabled={!newCountry.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Contact & Credentials */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-dark-gray/50 border-medium-gray">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-off-white mb-6 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-neon-green" />
                  Contact & Credentials
                </h3>
                
                <div className="space-y-6">
                  {/* Contact Information Section */}
                  <div className="bg-midnight-800/30 rounded-lg p-4 border border-medium-gray/30">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center mr-3">
                        <Mail className="w-4 h-4 text-neon-green" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-off-white">
                          Contact Information *
                        </label>
                        <p className="text-xs text-off-white/60">How can we reach you for verification?</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => {
                        console.log('Contact info changing:', e.target.value);
                        handleInputChange('contactInfo', e.target.value);
                      }}
                      placeholder="Enter your email, phone number, or preferred contact method"
                      className="w-full px-4 py-3 bg-dark-gray border border-medium-gray/50 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 focus:outline-none transition-all duration-200"
                      required
                    />
                    <div className="mt-2 text-xs text-gray-300">
                      Examples: john@example.com, +1 (555) 123-4567, or LinkedIn profile
                    </div>
                  </div>

                  {/* Professional Credentials Section */}
                  <div className="bg-midnight-800/30 rounded-lg p-4 border border-medium-gray/30">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-electric-mint/20 rounded-full flex items-center justify-center mr-3">
                        <Award className="w-4 h-4 text-electric-mint" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-off-white">
                          Professional Credentials *
                        </label>
                        <p className="text-xs text-off-white/60">List your qualifications and certifications</p>
                      </div>
                    </div>
                    <textarea
                      value={formData.credentials}
                      onChange={(e) => {
                        console.log('Credentials changing:', e.target.value);
                        handleInputChange('credentials', e.target.value);
                      }}
                      placeholder="• Licensed Attorney (State Bar #12345)&#10;• Certified Public Accountant (CPA)&#10;• Real Estate Appraiser License&#10;• Professional Engineer (PE)&#10;• Other relevant certifications..."
                      className="w-full px-4 py-3 bg-dark-gray border border-medium-gray/50 rounded-lg text-white placeholder-gray-400 focus:border-electric-mint focus:ring-2 focus:ring-electric-mint/20 focus:outline-none resize-none transition-all duration-200"
                      rows={6}
                      required
                    />
                    <div className="mt-2 text-xs text-gray-300">
                      Include license numbers, certification dates, and issuing organizations
                    </div>
                  </div>

                  {/* Character Count */}
                  <div className="flex justify-between text-xs text-gray-300">
                    <div>
                      Contact: {formData.contactInfo.length} characters
                    </div>
                    <div>
                      Credentials: {formData.credentials.length} characters
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Document Upload */}
        {currentStep === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-dark-gray/50 border-medium-gray">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-off-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-neon-green" />
                  Document Upload
                </h3>
                
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-medium-gray rounded-lg p-8 text-center hover:border-neon-green/50 transition-colors">
                    <Upload className="w-12 h-12 text-medium-gray mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-off-white mb-2">Upload Documents</h4>
                    <p className="text-off-white/70 mb-4">
                      Upload your certificates, licenses, and other professional documents
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 bg-neon-green text-midnight-900 rounded-lg hover:bg-neon-green/80 cursor-pointer transition-colors"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-midnight-900 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </>
                      )}
                    </label>
                    <p className="text-xs text-off-white/50 mt-2">
                      Max 10MB per file. Supported: PDF, DOC, DOCX, JPG, PNG
                    </p>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-off-white mb-3">Uploaded Documents</h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-midnight-800/50 rounded-lg border border-medium-gray/30"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-neon-green" />
                              <div>
                                <p className="text-off-white font-medium">{file.name}</p>
                                <p className="text-xs text-off-white/60">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-electric-mint text-electric-mint hover:bg-electric-mint/10"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleFileRemove(file.id)}
                                className="border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Documents Info */}
                  {tierRequirements && (
                    <div className="bg-midnight-800/50 rounded-lg p-4 border border-electric-mint/20">
                      <h5 className="font-semibold text-electric-mint mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Required Documents for {tierInfo.find(t => t.value === formData.tier)?.label}
                      </h5>
                      <div className="space-y-3">
                        {tierRequirements.documentRequirements.map((doc, index) => {
                          // Create detailed document info based on the document type
                          const getDocumentInfo = (documentType: string) => {
                            switch (documentType.toLowerCase()) {
                              case 'government id':
                                return {
                                  title: 'Government ID',
                                  description: 'Passport, Driver\'s License, or National ID',
                                  link: '/help/government-id-requirements',
                                  linkText: 'What\'s accepted?'
                                };
                              case 'professional license':
                                return {
                                  title: 'Professional License',
                                  description: 'Current professional certification or license',
                                  link: '/help/professional-license-requirements',
                                  linkText: 'What\'s accepted?'
                                };
                              case 'proof of address':
                                return {
                                  title: 'Proof of Address',
                                  description: 'Utility bill, Bank statement, or official correspondence',
                                  link: '/help/proof-of-address-requirements',
                                  linkText: 'What\'s accepted?'
                                };
                              case 'basic resume':
                                return {
                                  title: 'Basic Resume',
                                  description: 'Professional CV highlighting relevant experience',
                                  link: '/help/resume-requirements',
                                  linkText: 'What\'s required?'
                                };
                              default:
                                return {
                                  title: doc,
                                  description: 'Required document for verification',
                                  link: '/help/document-requirements',
                                  linkText: 'Learn more'
                                };
                            }
                          };

                          const docInfo = getDocumentInfo(doc);

                          return (
                            <div key={index} className="flex items-start justify-between p-3 bg-dark-gray/50 rounded-lg border border-medium-gray/30">
                              <div className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-off-white">{docInfo.title}</div>
                                  <div className="text-xs text-off-white/60 mt-1">
                                    {docInfo.description}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => window.open(docInfo.link, '_blank')}
                                className="text-xs text-electric-mint hover:text-electric-mint/80 underline flex items-center"
                              >
                                {docInfo.linkText} <ExternalLink className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        </div>
      </div>

      {/* Sticky Navigation Footer */}
      <div className="sticky bottom-0 bg-dark-gray/95 backdrop-blur-sm border-t border-medium-gray/30 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="border-medium-gray text-off-white hover:bg-medium-gray/20"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              {/* Debug info */}
              <div className="text-xs text-off-white/60">
                Step {currentStep}/{totalSteps} - {canProceedToNext ? '✅ Ready' : '❌ Incomplete'}
              </div>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNext}
                  className={`px-6 py-2 ${
                    canProceedToNext 
                      ? 'bg-neon-green hover:bg-neon-green/80 text-midnight-900' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isConnected || !canProceedToNext}
                  className={`px-8 py-3 text-lg ${
                    canProceedToNext && !loading && isConnected
                      ? 'bg-neon-green hover:bg-neon-green/80 text-midnight-900' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-midnight-900 mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Registration
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="text-center mt-2">
              <p className="text-sm text-medium-gray">
                Please connect your wallet to register as an attestor
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttestorRegistration;
