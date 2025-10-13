import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import FileUpload from '../components/UI/FileUpload';
import { UploadedFile } from '../components/UI/FileUpload';
import Breadcrumb from '../components/UI/Breadcrumb';
import StepNavigation from '../components/UI/StepNavigation';
import { 
  FileText, 
  CheckCircle, 
  Building2,
  TreePine,
  Loader2,
  Shield,
  TrendingUp,
  Package,
  Palette,
  Car
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  TokenCreateTransaction, 
  FileCreateTransaction, 
  TopicCreateTransaction, 
  TopicMessageSubmitTransaction,
  AccountId,
  TokenType,
  TokenSupplyType
} from '@hashgraph/sdk';
import { TrustTokenService } from '../services/trust-token.service';
import KYCRequired from '../components/Auth/KYCRequired';

const CreateAsset: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accountId, isConnected, signer, hederaClient } = useWallet();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Asset form data - Updated for dual asset system
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 0,
    assetType: '',
    location: '', // Simplified to string for both digital and RWA
    totalValue: '',
    imageURI: '',
    documentURI: '',
    maturityDate: '',
    evidenceFiles: [] as File[],
    evidenceHashes: [] as string[],
    documentTypes: [] as string[]
  });

  // Asset type selection
  const [selectedAssetType, setSelectedAssetType] = useState<'digital' | 'rwa'>('digital');

  // RWA Categories (0-5)
  const rwaCategories = [
    { id: 0, name: 'Farm Produce', icon: TreePine, description: 'Agricultural products and crops' },
    { id: 1, name: 'Farmland', icon: TreePine, description: 'Agricultural land and properties' },
    { id: 2, name: 'Real Estate', icon: Building2, description: 'Residential and commercial properties' },
    { id: 3, name: 'Vehicles', icon: Car, description: 'Cars, trucks, and other vehicles' },
    { id: 4, name: 'Art & Collectibles', icon: Palette, description: 'Artwork, antiques, and collectibles' },
    { id: 5, name: 'Commodities', icon: Package, description: 'Gold, oil, and other commodities' }
  ];

  // Digital Categories (6+)
  const digitalCategories = [
    { id: 6, name: 'Digital Art', icon: Palette, description: 'Digital artwork and NFTs' },
    { id: 7, name: 'NFT', icon: Package, description: 'Non-fungible tokens' },
    { id: 8, name: 'Cryptocurrency', icon: TrendingUp, description: 'Digital currencies' },
    { id: 9, name: 'Digital Collectibles', icon: Package, description: 'Digital collectible items' },
    { id: 10, name: 'Virtual Real Estate', icon: Building2, description: 'Virtual land and properties' },
    { id: 11, name: 'Digital Music', icon: FileText, description: 'Digital music and audio' },
    { id: 12, name: 'Digital Books', icon: FileText, description: 'Digital books and publications' },
    { id: 13, name: 'Digital Games', icon: Package, description: 'Digital games and gaming assets' },
    { id: 14, name: 'Digital Tokens', icon: Package, description: 'Digital utility tokens' },
    { id: 15, name: 'Digital Certificates', icon: Shield, description: 'Digital certificates and credentials' }
  ];

  const categories = selectedAssetType === 'digital' ? digitalCategories : rwaCategories;

  const verificationLevels = [
    { id: 0, name: 'Basic', description: 'Basic verification with minimal documentation', fee: '100 TRUST' },
    { id: 1, name: 'Professional', description: 'Professional verification with comprehensive documentation', fee: '200 TRUST' },
    { id: 2, name: 'Expert', description: 'Expert verification with detailed analysis', fee: '300 TRUST' },
    { id: 3, name: 'Master', description: 'Master verification with full due diligence', fee: '500 TRUST' }
  ];

  const steps = selectedAssetType === 'digital' ? [
    { id: '1', title: 'Asset Details', description: 'Basic information about your digital asset' },
    { id: '2', title: 'Location & Value', description: 'Where is it located and what is it worth?' },
    { id: '3', title: 'Image & Description', description: 'Add image and describe your digital asset' },
    { id: '4', title: 'Ready to Create', description: 'Your digital asset is ready for instant creation' },
    { id: '5', title: 'Review & Submit', description: 'Review and create your digital asset' }
  ] : [
    { id: '1', title: 'Asset Details', description: 'Basic information about your real-world asset' },
    { id: '2', title: 'Location & Value', description: 'Where is it located and what is it worth?' },
    { id: '3', title: 'Evidence Upload', description: 'Upload supporting documents and images' },
    { id: '4', title: 'Maturity & Verification', description: 'Set maturity date and verification level' },
    { id: '5', title: 'Review & Submit', description: 'Review and submit for verification' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleFileUpload = (uploadedFiles: UploadedFile[]) => {
    const files = uploadedFiles.map(uf => uf.file);
    setFormData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!isConnected || !accountId || !signer || !hederaClient) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your HashPack wallet to create an asset.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      let assetTokenId: string | undefined;
      let assetFileId: string | undefined;
      let assetTopicId: string | undefined;

      // Step 1: Upload asset metadata to HFS (small JSON file)
      // Note: Images are stored on IPFS, only metadata goes to HFS
      const assetMetadata = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        assetType: formData.assetType,
        location: formData.location,
        totalValue: formData.totalValue,
        maturityDate: selectedAssetType === 'rwa' ? formData.maturityDate : undefined,
        imageURI: formData.imageURI, // This is an IPFS URL from file upload
        documentURI: formData.documentURI,
        evidenceFiles: formData.evidenceFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })),
        createdBy: accountId,
        createdAt: new Date().toISOString(),
      };

      // Upload metadata to HFS
      const metadataContent = new TextEncoder().encode(JSON.stringify(assetMetadata));
      const fileCreateTx = new FileCreateTransaction()
        .setContents(metadataContent)
        .setMaxTransactionFee(1000);

      fileCreateTx.freezeWithSigner(signer);
      const signedFileTx = await signer.signTransaction(fileCreateTx);
      const fileResponse = await signedFileTx.execute(hederaClient);
      const fileReceipt = await fileResponse.getReceipt(hederaClient);
      assetFileId = fileReceipt.fileId?.toString();

      // Step 2: Create HTS NFT for the asset
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(formData.name)
        .setTokenSymbol(formData.assetType.toUpperCase().slice(0, 5))
        .setTokenType(TokenType.NonFungibleUnique) // NON_FUNGIBLE_UNIQUE
        .setInitialSupply(0) // NFT tokens start with 0 supply
        .setTreasuryAccountId(AccountId.fromString(accountId))
        .setSupplyType(TokenSupplyType.Infinite) // Allow unlimited minting
        .setMaxTransactionFee(1000);

      tokenCreateTx.freezeWithSigner(signer);
      const signedTokenTx = await signer.signTransaction(tokenCreateTx);
      const tokenResponse = await signedTokenTx.execute(hederaClient);
      const tokenReceipt = await tokenResponse.getReceipt(hederaClient);
      assetTokenId = tokenReceipt.tokenId?.toString();

      // Step 3: Create HCS topic for asset events
      const topicCreateTx = new TopicCreateTransaction()
        .setTopicMemo(`Asset events for ${formData.name}`)
        .setMaxTransactionFee(1000);

      topicCreateTx.freezeWithSigner(signer);
      const signedTopicTx = await signer.signTransaction(topicCreateTx);
      const topicResponse = await signedTopicTx.execute(hederaClient);
      const topicReceipt = await topicResponse.getReceipt(hederaClient);
      assetTopicId = topicReceipt.topicId?.toString();

      // Step 4: Submit asset creation event to HCS
      const assetEvent = {
        event: 'AssetCreated',
        assetId: assetTokenId,
        assetType: selectedAssetType,
        owner: accountId,
        metadataFileId: assetFileId,
        topicId: assetTopicId,
        timestamp: new Date().toISOString()
      };

      const messageContent = new TextEncoder().encode(JSON.stringify(assetEvent));
      const messageSubmitTx = new TopicMessageSubmitTransaction()
        .setTopicId(topicReceipt.topicId!)
        .setMessage(messageContent)
        .setMaxTransactionFee(1000);

      messageSubmitTx.freezeWithSigner(signer);
      const signedMessageTx = await signer.signTransaction(messageSubmitTx);
      await signedMessageTx.execute(hederaClient);

      // Step 5: Get TRUST token ID for trading
      const trustTokenInfo = await TrustTokenService.getTrustTokenInfo();
      if (!trustTokenInfo.tokenId) {
        throw new Error('TRUST token not initialized. Please contact support.');
      }

      // Step 6: Store asset data in backend
      const assetData = {
        tokenId: assetTokenId,
        fileId: assetFileId,
        topicId: assetTopicId,
        trustTokenId: trustTokenInfo.tokenId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        assetType: selectedAssetType,
        location: formData.location,
        totalValue: formData.totalValue,
        maturityDate: selectedAssetType === 'rwa' ? formData.maturityDate : undefined,
        imageURI: formData.imageURI,
        documentURI: formData.documentURI,
        owner: accountId,
        status: selectedAssetType === 'digital' ? 'VERIFIED' : 'PENDING'
      };

      // Store in backend database
      const response = await fetch('http://localhost:4001/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData)
      });

      if (!response.ok) {
        throw new Error('Failed to store asset data');
      }

      toast({
        title: 'Asset Created Successfully!',
        description: `Your ${selectedAssetType} asset has been created with Hedera token ID: ${assetTokenId}`,
        variant: 'default'
      });

      // Navigate to assets page
      navigate('/dashboard/assets');
    } catch (error) {
      console.error('Error creating asset:', error);
      
      let errorMessage = 'Failed to create asset';
      if (error instanceof Error) {
        if (error.message.includes('TOKEN_HAS_NO_SUPPLY_KEY')) {
          errorMessage = 'Token creation failed: Missing supply key. Please try again.';
        } else if (error.message.includes('INSUFFICIENT_TX_FEE')) {
          errorMessage = 'Insufficient HBAR for transaction fees. Please add more HBAR to your account.';
        } else if (error.message.includes('TRANSACTION_EXPIRED')) {
          errorMessage = 'Transaction expired. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error Creating Asset',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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
    switch (currentStep) {
      case 1:
        return formData.name && formData.assetType;
      case 2:
        return formData.location && formData.totalValue;
      case 3:
        return selectedAssetType === 'digital' || formData.evidenceFiles.length > 0;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Check if KYC is required for RWA creation
  const requiresKYC = selectedAssetType === 'rwa' && user && user.kycStatus !== 'approved';
  
  // Show KYC required modal if needed
  if (requiresKYC) {
    return (
      <KYCRequired 
        onStartKYC={() => navigate('/auth')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assets', href: '/dashboard/assets' },
            { label: 'Create Asset' }
          ]}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-off-white mb-4"
          >
            Create New Asset
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-electric-mint text-lg"
          >
            Choose your asset type and tokenize on the blockchain
          </motion.p>
        </motion.div>

        {/* Asset Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-neon-green" />
                Choose Asset Type
              </CardTitle>
              <p className="text-electric-mint">Select whether you want to create a digital asset or a real-world asset (RWA)</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Digital Asset Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAssetType === 'digital'
                      ? 'border-neon-green bg-neon-green/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedAssetType('digital')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center">
                      <Palette className="w-8 h-8 text-neon-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-off-white mb-2">Digital Asset</h3>
                    <p className="text-electric-mint text-sm mb-4">
                      Create digital assets like NFTs, digital art, or virtual items. Instant creation and verification.
                    </p>
                    <div className="text-xs text-gray-400">
                      <div>✓ Instant creation</div>
                      <div>✓ No verification needed</div>
                      <div>✓ Lower fees (10 TRUST)</div>
                    </div>
                  </div>
                </motion.div>

                {/* RWA Asset Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAssetType === 'rwa'
                      ? 'border-neon-green bg-neon-green/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedAssetType('rwa')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-neon-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-off-white mb-2">Real-World Asset (RWA)</h3>
                    <p className="text-electric-mint text-sm mb-4">
                      Tokenize physical assets like real estate, vehicles, or commodities. Requires verification.
                    </p>
                    <div className="text-xs text-gray-400 mb-2">
                      <div>✓ Physical asset backing</div>
                      <div>✓ Professional verification</div>
                      <div>✓ Higher fees (100 TRUST)</div>
                    </div>
                    <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                      <Shield className="w-3 h-3 inline mr-1" />
                      KYC Required
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step Navigation */}
        <StepNavigation
          steps={steps}
          onStepClick={(stepId) => setCurrentStep(parseInt(stepId))}
        />

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-neon-green" />
                {steps[currentStep - 1].title}
              </CardTitle>
              <p className="text-electric-mint">{steps[currentStep - 1].description}</p>
            </CardHeader>
            <CardContent>
              {/* Step 1: Asset Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Asset Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter asset name"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Asset Type *
                    </label>
                    <Input
                      value={formData.assetType}
                      onChange={(e) => handleInputChange('assetType', e.target.value)}
                      placeholder="e.g., Commercial Building, Farm Land, Vehicle"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Category *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleInputChange('category', category.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              formData.category === category.id
                                ? 'border-neon-green bg-neon-green/10 text-neon-green'
                                : 'border-gray-600 hover:border-electric-mint text-gray-300'
                            }`}
                          >
                            <Icon className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-sm font-medium">{category.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Value */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Location *
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder={selectedAssetType === 'digital' ? 'e.g., Metaverse, Virtual World, Online Platform' : 'e.g., 123 Main St, Lagos, Nigeria'}
                      className="w-full"
                    />
                    <p className="text-sm text-electric-mint mt-1">
                      {selectedAssetType === 'digital' 
                        ? 'Specify the virtual location or platform where this digital asset exists'
                        : 'Enter the physical address where this asset is located'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-off-white mb-2">
                        Total Value (USD) *
                      </label>
                      <Input
                        type="number"
                        value={formData.totalValue}
                        onChange={(e) => handleInputChange('totalValue', e.target.value)}
                        placeholder="Enter value in USD"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-off-white mb-2">
                        Maturity Date
                      </label>
                      <Input
                        type="date"
                        value={formData.maturityDate}
                        onChange={(e) => handleInputChange('maturityDate', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Evidence Upload (RWA) or Image Upload (Digital) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {selectedAssetType === 'digital' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-off-white mb-2">
                          Asset Image *
                        </label>
                        <Input
                          value={formData.imageURI}
                          onChange={(e) => handleInputChange('imageURI', e.target.value)}
                          placeholder="https://example.com/your-asset-image.jpg"
                          className="w-full"
                        />
                        <p className="text-sm text-electric-mint mt-1">
                          Enter the URL of your digital asset image or upload to IPFS
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-off-white mb-2">
                          Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe your digital asset..."
                          className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-off-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-off-white mb-2">
                          Upload Evidence Documents *
                        </label>
                        <FileUpload
                          onFilesChange={handleFileUpload}
                          acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
                          allowMultiple={true}
                        />
                      </div>

                      {formData.evidenceFiles.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-off-white mb-2">Uploaded Files:</h4>
                          <div className="space-y-2">
                            {formData.evidenceFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                <span className="text-sm text-off-white">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-off-white mb-2">
                          Asset Image
                        </label>
                        <Input
                          value={formData.imageURI}
                          onChange={(e) => handleInputChange('imageURI', e.target.value)}
                          placeholder="https://example.com/your-asset-image.jpg"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-off-white mb-2">
                          Document Bundle URI
                        </label>
                        <Input
                          value={formData.documentURI}
                          onChange={(e) => handleInputChange('documentURI', e.target.value)}
                          placeholder="https://example.com/your-documents.zip"
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
                          placeholder="Describe your real-world asset..."
                          className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-off-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Verification Level (RWA only) or Maturity Date (RWA) */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {selectedAssetType === 'digital' ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-neon-green" />
                      </div>
                      <h3 className="text-xl font-semibold text-off-white mb-2">Digital Asset Ready</h3>
                      <p className="text-electric-mint">
                        Your digital asset will be created instantly with automatic verification. No additional steps required.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-off-white mb-2">
                          Maturity Date *
                        </label>
                        <Input
                          type="date"
                          value={formData.maturityDate}
                          onChange={(e) => handleInputChange('maturityDate', e.target.value)}
                          className="w-full"
                        />
                        <p className="text-sm text-electric-mint mt-1">
                          When will this asset mature or reach its expected value?
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-off-white mb-2">
                          Choose Verification Level
                        </label>
                        <div className="space-y-4">
                          {verificationLevels.map((level) => (
                            <div
                              key={level.id}
                              className="p-4 rounded-lg border-2 border-gray-600 hover:border-electric-mint transition-all cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-off-white">{level.name}</h4>
                                  <p className="text-sm text-electric-mint">{level.description}</p>
                                </div>
                                <div className="text-neon-green font-medium">{level.fee}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <h4 className="font-medium text-off-white mb-4">Review Your {selectedAssetType === 'digital' ? 'Digital' : 'RWA'} Asset</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-electric-mint">Asset Type:</span> {selectedAssetType === 'digital' ? 'Digital Asset' : 'Real-World Asset'}</div>
                      <div><span className="text-electric-mint">Name:</span> {formData.name}</div>
                      <div><span className="text-electric-mint">Type:</span> {formData.assetType}</div>
                      <div><span className="text-electric-mint">Category:</span> {categories[formData.category]?.name}</div>
                      <div><span className="text-electric-mint">Location:</span> {formData.location}</div>
                      <div><span className="text-electric-mint">Value:</span> ${formData.totalValue}</div>
                      {selectedAssetType === 'rwa' && (
                        <>
                          <div><span className="text-electric-mint">Maturity Date:</span> {formData.maturityDate}</div>
                          <div><span className="text-electric-mint">Documents:</span> {formData.evidenceFiles.length} files</div>
                        </>
                      )}
                      {selectedAssetType === 'digital' && (
                        <div><span className="text-electric-mint">Image URI:</span> {formData.imageURI || 'Not provided'}</div>
                      )}
                      <div><span className="text-electric-mint">Description:</span> {formData.description || 'Not provided'}</div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                      <h5 className="font-medium text-off-white mb-2">Creation Summary</h5>
                      <div className="text-sm space-y-1">
                        <div><span className="text-electric-mint">Creation Fee:</span> {selectedAssetType === 'digital' ? '10 TRUST' : '100 TRUST'}</div>
                        <div><span className="text-electric-mint">Verification:</span> {selectedAssetType === 'digital' ? 'Instant (Automatic)' : 'Required (Attestor Review)'}</div>
                        <div><span className="text-electric-mint">Trading:</span> {selectedAssetType === 'digital' ? 'Immediate' : 'After Verification'}</div>
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
                >
                  Previous
                </Button>

                {currentStep === steps.length ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isLoading}
                    className="bg-neon-green text-black hover:bg-electric-mint"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Asset...
                      </>
                    ) : (
                      'Create Asset'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="bg-neon-green text-black hover:bg-electric-mint"
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAsset;
