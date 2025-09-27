import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import FileUpload from '../components/UI/FileUpload';
import { 
  Upload, 
  Image as ImageIcon,
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  TrendingUp,
  Palette,
  Package,
  Globe,
  Music,
  BookOpen,
  Gamepad2,
  Award,
  Zap,
  Eye,
  Edit3,
  Settings,
  DollarSign,
  Tag,
  Calendar,
  MapPin,
  Users,
  Star,
  Heart,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { contractService } from '../services/contractService';
import { usePortfolio } from '../hooks/useApi';

interface DigitalAssetForm {
  name: string;
  description: string;
  category: number;
  assetType: string;
  location: string;
  totalValue: string;
  imageURI: string;
  metadataURI: string;
  royaltyPercentage: string;
  tags: string[];
  isTradeable: boolean;
  isAuctionable: boolean;
  startingPrice: string;
  reservePrice: string;
  auctionDuration: number; // in hours
  buyNowPrice: string;
  collectionName: string;
  collectionDescription: string;
  collectionImage: string;
  attributes: Array<{
    trait_type: string;
    value: string;
    rarity: string;
  }>;
}

const CreateDigitalAsset: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address, isConnected } = useWallet();
  const { user } = useAuth();
  const { data: portfolioData } = usePortfolio();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  
  const [formData, setFormData] = useState<DigitalAssetForm>({
    name: '',
    description: '',
    category: 6, // Digital Art
    assetType: '',
    location: '',
    totalValue: '',
    imageURI: '',
    metadataURI: '',
    royaltyPercentage: '2.5',
    tags: [],
    isTradeable: true,
    isAuctionable: false,
    startingPrice: '',
    reservePrice: '',
    auctionDuration: 24,
    buyNowPrice: '',
    collectionName: '',
    collectionDescription: '',
    collectionImage: '',
    attributes: []
  });

  const digitalCategories = [
    { id: 6, name: 'Digital Art', icon: Palette, description: 'Digital artwork and creative pieces', color: 'text-pink-400' },
    { id: 7, name: 'NFT', icon: Package, description: 'Non-fungible tokens', color: 'text-blue-400' },
    { id: 8, name: 'Cryptocurrency', icon: TrendingUp, description: 'Digital currencies', color: 'text-green-400' },
    { id: 9, name: 'Digital Collectibles', icon: Star, description: 'Digital collectible items', color: 'text-yellow-400' },
    { id: 10, name: 'Virtual Real Estate', icon: Globe, description: 'Virtual land and properties', color: 'text-purple-400' },
    { id: 11, name: 'Digital Music', icon: Music, description: 'Digital music and audio', color: 'text-indigo-400' },
    { id: 12, name: 'Digital Books', icon: BookOpen, description: 'Digital books and publications', color: 'text-orange-400' },
    { id: 13, name: 'Digital Games', icon: Gamepad2, description: 'Digital games and gaming assets', color: 'text-red-400' },
    { id: 14, name: 'Digital Tokens', icon: Award, description: 'Digital utility tokens', color: 'text-cyan-400' },
    { id: 15, name: 'Digital Certificates', icon: Shield, description: 'Digital certificates and credentials', color: 'text-emerald-400' }
  ];

  const rarityLevels = [
    { name: 'Common', value: 'common', color: 'text-gray-400', percentage: '40%' },
    { name: 'Uncommon', value: 'uncommon', color: 'text-green-400', percentage: '30%' },
    { name: 'Rare', value: 'rare', color: 'text-blue-400', percentage: '20%' },
    { name: 'Epic', value: 'epic', color: 'text-purple-400', percentage: '8%' },
    { name: 'Legendary', value: 'legendary', color: 'text-yellow-400', percentage: '2%' }
  ];

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Name, description, and category', icon: FileText },
    { id: 2, title: 'Media & Location', description: 'Upload image and set location', icon: ImageIcon },
    { id: 3, title: 'Pricing & Value', description: 'Set value and pricing options', icon: DollarSign },
    { id: 4, title: 'Trading Options', description: 'Configure trading and auction settings', icon: TrendingUp },
    { id: 5, title: 'Attributes & Metadata', description: 'Add traits and collection info', icon: Settings },
    { id: 6, title: 'Review & Create', description: 'Review and mint your asset', icon: CheckCircle }
  ];

  const handleInputChange = (field: keyof DigitalAssetForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilesChange = (files: any[]) => {
    setUploadedFiles(files);
    
    // Set preview image from the first completed file
    const completedFile = files.find(f => f.status === 'completed');
    if (completedFile && completedFile.ipfsUrl) {
      console.log('File uploaded to IPFS, setting imageURI:', completedFile.ipfsUrl);
      setPreviewImage(completedFile.ipfsUrl);
      handleInputChange('imageURI', completedFile.ipfsUrl);
    } else {
      // If file is uploaded but not yet processed, use local preview
      const pendingFile = files.find(f => f.status === 'pending' || f.status === 'uploading');
      if (pendingFile && pendingFile.file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreviewImage(result);
          // Don't set imageURI yet, wait for IPFS upload
        };
        reader.readAsDataURL(pendingFile.file);
      }
    }
  };

  const handleFileUpload = (result: any) => {
    console.log('File upload result:', result);
    if (result.ipfsUrl) {
      setPreviewImage(result.ipfsUrl);
      handleInputChange('imageURI', result.ipfsUrl);
    }
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '', rarity: 'common' }]
    }));
  };

  const updateAttribute = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a digital asset.',
        variant: 'destructive'
      });
      return;
    }

    // Ensure image is uploaded before submission
    if (!formData.imageURI || formData.imageURI.includes('placeholder')) {
      toast({
        title: "Image upload required",
        description: "Please wait for the image to upload to IPFS before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Upload metadata to IPFS (simulated)
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: formData.imageURI,
        external_url: `https://trustbridge.africa/asset/${Date.now()}`,
        attributes: formData.attributes,
        properties: {
          category: digitalCategories.find(c => c.id === formData.category)?.name,
          assetType: formData.assetType,
          location: formData.location,
          totalValue: formData.totalValue,
          royaltyPercentage: formData.royaltyPercentage,
          tags: formData.tags,
          isTradeable: formData.isTradeable,
          isAuctionable: formData.isAuctionable,
          collection: {
            name: formData.collectionName,
            description: formData.collectionDescription,
            image: formData.collectionImage
          }
        }
      };

      // Simulate IPFS upload
      const metadataURI = `https://ipfs.trustbridge.africa/metadata/${Date.now()}.json`;
      
      // Create digital asset
      const result = await contractService.createDigitalAsset({
        category: formData.category,
        assetType: formData.assetType,
        name: formData.name,
        location: formData.location,
        totalValue: formData.totalValue,
        imageURI: formData.imageURI,
        description: formData.description
      });

      // If trading is enabled, create listing
      if (formData.isTradeable) {
        try {
          if (formData.isAuctionable) {
            // Create auction
            await contractService.createAuction(
              result.assetId,
              formData.auctionStartingPrice || formData.startingPrice,
              formData.auctionDuration || 7,
              result.tokenId // Pass the token ID
            );
          } else {
            // Create fixed price listing
            await contractService.createListing(
              result.assetId,
              formData.fixedPrice || formData.buyNowPrice || formData.startingPrice,
              result.tokenId // Pass the token ID
            );
          }
        } catch (error) {
          console.warn('Failed to create trading listing, continuing without trading:', error);
        }
      }

      // Store asset data for later retrieval
      const assetData = {
        id: result.assetId,
        name: formData.name,
        description: formData.description,
        imageURI: formData.imageURI,
        category: formData.category,
        assetType: formData.assetType,
        location: formData.location,
        totalValue: formData.totalValue,
        owner: address,
        createdAt: new Date().toISOString(),
        isTradeable: formData.isTradeable,
        status: formData.isTradeable ? 'listed' : 'created',
        listingId: formData.isTradeable ? '2' : undefined,
        price: formData.isTradeable ? (formData.fixedPrice || formData.buyNowPrice || formData.startingPrice) : undefined,
        tokenId: result.tokenId
      };

      // Store in sessionStorage for immediate retrieval
      sessionStorage.setItem(`asset_${result.assetId}`, JSON.stringify(assetData));
      console.log('✅ Asset created with image URI:', formData.imageURI);

      toast({
        title: 'Digital Asset Created Successfully!',
        description: `Your digital asset "${formData.name}" has been created and ${formData.isTradeable ? 'listed for trading' : 'added to your portfolio'}. Asset ID: ${result.assetId}${result.transactionId.startsWith('sim_') ? ' (Simulation Mode)' : ''}`,
        variant: 'default'
      });

      // Navigate to asset page or portfolio
      navigate(`/dashboard/asset/${result.assetId}`);
    } catch (error) {
      console.error('Error creating digital asset:', error);
      toast({
        title: 'Error Creating Asset',
        description: error instanceof Error ? error.message : 'Failed to create digital asset',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    // Check if we have uploaded files even if IPFS upload is pending
    const hasUploadedFile = uploadedFiles.length > 0;
    const hasImageURI = formData.imageURI && !formData.imageURI.includes('placeholder');
    const hasImage = hasImageURI || hasUploadedFile;
    
    // Check if there are files currently uploading (only 'uploading' status, not 'pending')
    const isUploading = uploadedFiles.some(f => f.status === 'uploading');
    
    console.log('Validation check:', {
      currentStep,
      formData: {
        name: formData.name,
        description: formData.description,
        assetType: formData.assetType,
        imageURI: formData.imageURI,
        location: formData.location,
        totalValue: formData.totalValue
      },
      uploadedFiles: uploadedFiles.length,
      hasImage,
      isUploading
    });
    
    switch (currentStep) {
      case 1:
        return !!(formData.name && formData.description && formData.assetType);
      case 2:
        // Ensure image is uploaded to IPFS before proceeding
        const hasValidImage = formData.imageURI && 
          !formData.imageURI.includes('placeholder') && 
          (formData.imageURI.startsWith('https://') || formData.imageURI.startsWith('ipfs://'));
        return !!(hasValidImage && formData.location);
      case 3:
        return !!(formData.totalValue);
      case 4:
        return true; // Trading options are optional
      case 5:
        return true; // Attributes are optional
      case 6:
        return true;
      default:
        return false;
    }
  };

  const getStepIcon = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    return step?.icon || FileText;
  };

  return (
    <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-off-white mb-4"
          >
            Create Digital Asset
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-electric-mint text-sm"
          >
            Create, mint, and trade digital assets on the blockchain
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Steps */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Creation Steps</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    
                    return (
                      <motion.div
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-neon-green/20 text-neon-green border border-neon-green/40' 
                            : isCompleted
                            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                            : 'hover:bg-gray-800 text-gray-400'
                        }`}
                        onClick={() => setCurrentStep(step.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive 
                            ? 'bg-neon-green text-black' 
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{step.title}</p>
                          <p className="text-xs text-gray-400 truncate">{step.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {React.createElement(getStepIcon(currentStep), { className: "w-4 h-4 text-neon-green" })}
                      {steps[currentStep - 1].title}
                    </CardTitle>
                    <p className="text-xs text-electric-mint">{steps[currentStep - 1].description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Asset Name *
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter a unique name for your digital asset"
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Description *
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe your digital asset in detail..."
                            className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-off-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Asset Type *
                          </label>
                          <Input
                            value={formData.assetType}
                            onChange={(e) => handleInputChange('assetType', e.target.value)}
                            placeholder="e.g., Digital Painting, 3D Model, Music Track"
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Category *
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {digitalCategories.map((category) => {
                              const Icon = category.icon;
                              return (
                                <button
                                  key={category.id}
                                  onClick={() => handleInputChange('category', category.id)}
                                  className={`p-3 rounded border-2 transition-all text-left ${
                                    formData.category === category.id
                                      ? 'border-neon-green bg-neon-green/10 text-neon-green'
                                      : 'border-gray-600 hover:border-gray-500 text-gray-300'
                                  }`}
                                >
                                  <Icon className={`w-5 h-5 mb-2 ${category.color}`} />
                                  <div className="text-xs font-medium">{category.name}</div>
                                  <div className="text-xs text-gray-400">{category.description}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Media & Location */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Asset Image *
                          </label>
                          <div className="space-y-4">
                            <FileUpload
                              onFilesChange={handleFilesChange}
                              onFileUpload={handleFileUpload}
                              acceptedTypes={['image/*']}
                              allowMultiple={false}
                              maxFiles={1}
                              category="digital-asset"
                              description="Upload asset image"
                            />
                            
                            <div className="text-center text-xs text-gray-400">
                              OR
                            </div>
                            
                            <Input
                              value={formData.imageURI}
                              onChange={(e) => handleInputChange('imageURI', e.target.value)}
                              placeholder="Or enter image URL directly"
                              className="w-full text-sm"
                            />
                            
                            {previewImage && (
                              <div className="relative">
                                <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="w-full h-64 object-cover rounded-lg border border-gray-600"
                                />
                                <button
                                  onClick={() => {
                                    setPreviewImage('');
                                    handleInputChange('imageURI', '');
                                  }}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            
                            {formData.imageURI && !previewImage && (
                              <div className="relative">
                                <img
                                  src={formData.imageURI}
                                  alt="Preview"
                                  className="w-full h-64 object-cover rounded-lg border border-gray-600"
                                  onError={() => {
                                    console.error('Failed to load image from URL');
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Upload Progress Indicator */}
                            {uploadedFiles.length > 0 && uploadedFiles.some(f => f.status === 'uploading') && (
                              <div className="flex items-center justify-center p-4 bg-dark-gray rounded-lg border border-gray-600">
                                <Loader2 className="w-6 h-6 animate-spin text-neon-green mr-3" />
                                <span className="text-sm text-off-white">
                                  Uploading to IPFS... Please wait
                                </span>
                              </div>
                            )}

                            {/* Image Upload Status */}
                            {uploadedFiles.length > 0 && (
                              <div className="space-y-2">
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-dark-gray rounded-lg border border-gray-600">
                                    <div className="flex items-center space-x-3">
                                      {file.status === 'uploading' && (
                                        <Loader2 className="w-4 h-4 animate-spin text-neon-green" />
                                      )}
                                      {file.status === 'completed' && (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                      )}
                                      {file.status === 'error' && (
                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                      )}
                                      <span className="text-sm text-off-white">
                                        {file.file?.name || 'Uploading...'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {file.status === 'uploading' && 'Uploading...'}
                                      {file.status === 'completed' && 'Uploaded to IPFS'}
                                      {file.status === 'error' && 'Upload failed'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Image Validation Message */}
                            {!formData.imageURI && uploadedFiles.length === 0 && (
                              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                                  <span className="text-sm text-yellow-400">
                                    Please upload an image or enter an image URL to continue
                                  </span>
                                </div>
                              </div>
                            )}

                            {formData.imageURI && formData.imageURI.includes('placeholder') && (
                              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                                  <span className="text-sm text-yellow-400">
                                    Image is still uploading to IPFS. Please wait...
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Upload Success Indicator */}
                            {uploadedFiles.length > 0 && uploadedFiles.some(f => f.status === 'completed') && !uploadedFiles.some(f => f.status === 'uploading' || f.status === 'pending') && (
                              <div className="flex items-center justify-center p-4 bg-green-900/20 rounded-lg border border-green-500">
                                <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                                <span className="text-sm text-green-400">
                                  Image uploaded successfully to IPFS
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Location *
                          </label>
                          <Input
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="e.g., Metaverse, Virtual World, Online Platform, Blockchain"
                            className="w-full"
                          />
                          <p className="text-xs text-electric-mint mt-1">
                            Specify where this digital asset exists or will be used
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Pricing & Value */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Total Value (USD) *
                          </label>
                          <Input
                            type="number"
                            value={formData.totalValue}
                            onChange={(e) => handleInputChange('totalValue', e.target.value)}
                            placeholder="Enter the estimated value in USD"
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Royalty Percentage
                          </label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={formData.royaltyPercentage}
                              onChange={(e) => handleInputChange('royaltyPercentage', e.target.value)}
                              placeholder="2.5"
                              className="w-24"
                            />
                            <span className="text-sm text-gray-400">%</span>
                            <span className="text-xs text-electric-mint">
                              You'll earn this percentage on future sales
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Tags
                          </label>
                          <div className="space-y-2">
                            <Input
                              placeholder="Add tags (press Enter to add)"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag(e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="w-full"
                            />
                            {formData.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => removeTag(tag)}
                                      className="hover:text-red-400"
                                    >
                                      <AlertCircle className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Trading Options */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="isTradeable"
                            checked={formData.isTradeable}
                            onChange={(e) => handleInputChange('isTradeable', e.target.checked)}
                            className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                          />
                          <label htmlFor="isTradeable" className="text-sm font-medium text-off-white">
                            Enable Trading
                          </label>
                        </div>

                        {formData.isTradeable && (
                          <div className="space-y-4 pl-6 border-l-2 border-gray-700">
                            <div>
                              <label className="block text-sm font-medium text-off-white mb-2">
                                Buy Now Price (TRUST)
                              </label>
                              <Input
                                type="number"
                                value={formData.buyNowPrice}
                                onChange={(e) => handleInputChange('buyNowPrice', e.target.value)}
                                placeholder="Enter price in TRUST tokens"
                                className="w-full"
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="isAuctionable"
                                checked={formData.isAuctionable}
                                onChange={(e) => handleInputChange('isAuctionable', e.target.checked)}
                                className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                              />
                              <label htmlFor="isAuctionable" className="text-sm font-medium text-off-white">
                                Enable Auction
                              </label>
                            </div>

                            {formData.isAuctionable && (
                              <div className="space-y-4 pl-6 border-l-2 border-gray-700">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-off-white mb-2">
                                      Starting Price (TRUST)
                                    </label>
                                    <Input
                                      type="number"
                                      value={formData.startingPrice}
                                      onChange={(e) => handleInputChange('startingPrice', e.target.value)}
                                      placeholder="0.1"
                                      className="w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-off-white mb-2">
                                      Reserve Price (TRUST)
                                    </label>
                                    <Input
                                      type="number"
                                      value={formData.reservePrice}
                                      onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                                      placeholder="1.0"
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-off-white mb-2">
                                    Auction Duration (hours)
                                  </label>
                                  <Input
                                    type="number"
                                    value={formData.auctionDuration}
                                    onChange={(e) => handleInputChange('auctionDuration', parseInt(e.target.value))}
                                    placeholder="24"
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 5: Attributes & Metadata */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-off-white mb-2">
                            Collection Information
                          </label>
                          <div className="space-y-4">
                            <Input
                              value={formData.collectionName}
                              onChange={(e) => handleInputChange('collectionName', e.target.value)}
                              placeholder="Collection Name (optional)"
                              className="w-full"
                            />
                            <Input
                              value={formData.collectionDescription}
                              onChange={(e) => handleInputChange('collectionDescription', e.target.value)}
                              placeholder="Collection Description (optional)"
                              className="w-full"
                            />
                            <Input
                              value={formData.collectionImage}
                              onChange={(e) => handleInputChange('collectionImage', e.target.value)}
                              placeholder="Collection Image URL (optional)"
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-off-white">
                              Attributes
                            </label>
                            <Button
                              onClick={addAttribute}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              Add Attribute
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {formData.attributes.map((attr, index) => (
                              <div key={index} className="grid grid-cols-3 gap-2">
                                <Input
                                  value={attr.trait_type}
                                  onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                                  placeholder="Trait Type"
                                  className="text-xs"
                                />
                                <Input
                                  value={attr.value}
                                  onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                                  placeholder="Value"
                                  className="text-xs"
                                />
                                <div className="flex gap-1">
                                  <select
                                    value={attr.rarity}
                                    onChange={(e) => updateAttribute(index, 'rarity', e.target.value)}
                                    className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-off-white"
                                  >
                                    {rarityLevels.map(level => (
                                      <option key={level.value} value={level.value}>
                                        {level.name}
                                      </option>
                                    ))}
                                  </select>
                                  <Button
                                    onClick={() => removeAttribute(index)}
                                    variant="outline"
                                    size="sm"
                                    className="px-2 text-red-400 hover:text-red-300"
                                  >
                                    <AlertCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Review & Create */}
                    {currentStep === 6 && (
                      <div className="space-y-6">
                        <div className="bg-gray-800 p-6 rounded-lg">
                          <h4 className="text-sm font-medium text-off-white mb-4">Asset Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-electric-mint">Name:</span>
                              <p className="text-off-white">{formData.name}</p>
                            </div>
                            <div>
                              <span className="text-electric-mint">Type:</span>
                              <p className="text-off-white">{formData.assetType}</p>
                            </div>
                            <div>
                              <span className="text-electric-mint">Category:</span>
                              <p className="text-off-white">
                                {digitalCategories.find(c => c.id === formData.category)?.name}
                              </p>
                            </div>
                            <div>
                              <span className="text-electric-mint">Value:</span>
                              <p className="text-off-white">${formData.totalValue} USD</p>
                            </div>
                            <div>
                              <span className="text-electric-mint">Location:</span>
                              <p className="text-off-white">{formData.location}</p>
                            </div>
                            <div>
                              <span className="text-electric-mint">Royalty:</span>
                              <p className="text-off-white">{formData.royaltyPercentage}%</p>
                            </div>
                            <div>
                              <span className="text-electric-mint">Trading:</span>
                              <p className="text-off-white">{formData.isTradeable ? 'Enabled' : 'Disabled'}</p>
                            </div>
                            <div>
                              <span className="text-electric-mint">Auction:</span>
                              <p className="text-off-white">{formData.isAuctionable ? 'Enabled' : 'Disabled'}</p>
                            </div>
                          </div>
                        </div>

                        {formData.isTradeable && (
                          <div className="bg-gray-800 p-6 rounded-lg">
                            <h4 className="text-sm font-medium text-off-white mb-4">Trading Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-electric-mint">Buy Now Price:</span>
                                <p className="text-off-white">{formData.buyNowPrice || 'Not set'} TRUST</p>
                              </div>
                              {formData.isAuctionable && (
                                <>
                                  <div>
                                    <span className="text-electric-mint">Starting Price:</span>
                                    <p className="text-off-white">{formData.startingPrice} TRUST</p>
                                  </div>
                                  <div>
                                    <span className="text-electric-mint">Reserve Price:</span>
                                    <p className="text-off-white">{formData.reservePrice} TRUST</p>
                                  </div>
                                  <div>
                                    <span className="text-electric-mint">Duration:</span>
                                    <p className="text-off-white">{formData.auctionDuration} hours</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-800 p-6 rounded-lg">
                          <h4 className="text-sm font-medium text-off-white mb-4">Creation Fees</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-electric-mint">Asset Creation:</span>
                              <span className="text-off-white">10 TRUST</span>
                            </div>
                            {formData.isTradeable && (
                              <div className="flex justify-between">
                                <span className="text-electric-mint">Marketplace Listing:</span>
                                <span className="text-off-white">5 TRUST</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-gray-700 pt-2">
                              <span className="text-electric-mint font-medium">Total:</span>
                              <span className="text-off-white font-medium">
                                {formData.isTradeable ? '15' : '10'} TRUST
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                      <Button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        variant="outline"
                        className="text-xs"
                      >
                        Previous
                      </Button>

                      {currentStep === steps.length ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!canProceed() || isCreating}
                          className="bg-neon-green text-black hover:bg-electric-mint text-xs"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Creating Asset...
                            </>
                          ) : (
                            'Create Digital Asset'
                          )}
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className="bg-neon-green text-black hover:bg-electric-mint text-xs"
                          >
                            {currentStep === 2 && uploadedFiles.length > 0 && uploadedFiles.some(f => f.status === 'uploading') ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Next'
                            )}
                          </Button>
                          {!canProceed() && (
                            <p className="text-xs text-gray-400 text-center">
                              {currentStep === 1 && 'Please fill in name, description, and asset type'}
                              {currentStep === 2 && (
                                uploadedFiles.length > 0 && uploadedFiles.some(f => f.status === 'uploading')
                                  ? 'Please wait for image upload to complete' 
                                  : 'Please upload an image (or enter URL) and enter location'
                              )}
                              {currentStep === 3 && 'Please enter a total value'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDigitalAsset;
