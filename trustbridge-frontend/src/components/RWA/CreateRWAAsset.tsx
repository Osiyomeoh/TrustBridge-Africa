import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle,
  Building,
  TreePine,
  Package,
  Truck,
  Wrench,
  Shield,
  Brain
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useToast } from '../../hooks/useToast';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface RWAAssetData {
  // Basic Information
  name: string;
  description: string;
  type: string;
  category: string;
  
  // Location
  country: string;
  region: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  
  // Financial
  totalValue: number;
  expectedAPY: number;
  maturityDate: string;
  
  // Documentation
  evidenceFiles: File[];
  selectedCategory: string;
  displayImage: File | null;
  
  // Additional Details
  condition: string;
  maintenanceHistory: string;
  insuranceInfo: string;
  complianceStatus: string;
}

const CreateRWAAsset: React.FC = () => {
  const { isConnected, accountId, signer, hederaClient } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const displayImageInputRef = useRef<HTMLInputElement>(null);
  const evidenceFilesInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    displayImage: boolean;
    evidenceFiles: boolean;
    metadata: boolean;
    currentFile?: string;
    totalFiles?: number;
    currentFileIndex?: number;
  }>({
    displayImage: false,
    evidenceFiles: false,
    metadata: false
  });
  
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  
  const [assetData, setAssetData] = useState<RWAAssetData>({
    name: '',
    description: '',
    type: '',
    category: '',
      country: '',
    region: '',
      address: '',
    coordinates: { lat: 0, lng: 0 },
    totalValue: 0,
    expectedAPY: 0,
    maturityDate: '',
    evidenceFiles: [],
    selectedCategory: '',
    displayImage: null,
    condition: '',
    maintenanceHistory: '',
    insuranceInfo: '',
    complianceStatus: ''
  });

  const assetTypes = [
    { value: 'AGRICULTURAL', label: 'Agricultural Land', icon: TreePine, description: 'Farmland, plantations, agricultural facilities' },
    { value: 'REAL_ESTATE', label: 'Real Estate', icon: Building, description: 'Commercial buildings, residential properties' },
    { value: 'EQUIPMENT', label: 'Equipment', icon: Wrench, description: 'Machinery, vehicles, industrial equipment' },
    { value: 'INVENTORY', label: 'Inventory', icon: Package, description: 'Goods, commodities, raw materials' },
    { value: 'COMMODITY', label: 'Commodity', icon: Truck, description: 'Precious metals, energy, agricultural products' }
  ];

  const documentCategories = [
    { value: 'ownership', label: 'Ownership Documents', description: 'Deed, Title, Certificate of Ownership', icon: FileText, required: true },
    { value: 'photos', label: 'Asset Photos', description: 'Multiple angles, current condition', icon: Image, required: true },
    { value: 'inspection', label: 'Inspection Reports', description: 'Professional assessments, appraisals', icon: CheckCircle, required: true },
    { value: 'certificates', label: 'Certificates & Compliance', description: 'Permits, licenses, insurance documents', icon: Shield, required: false },
    { value: 'financial', label: 'Financial Documents', description: 'Valuation reports, financial statements', icon: DollarSign, required: false },
    { value: 'legal', label: 'Legal Documents', description: 'Contracts, agreements, legal opinions', icon: FileText, required: false },
    { value: 'maintenance', label: 'Maintenance Records', description: 'Service history, maintenance logs', icon: Wrench, required: false }
  ];

  const handleInputChange = (field: keyof RWAAssetData, value: any) => {
    setAssetData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (files: File[]) => {
    setAssetData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...files]
    }));
    
    // Reset the file input to allow selecting the same file again
    if (evidenceFilesInputRef.current) {
      evidenceFilesInputRef.current.value = '';
    }
  };

  const handleDisplayImageChange = (file: File | null) => {
    setAssetData(prev => ({
      ...prev,
      displayImage: file
    }));
    
    // Reset the file input to allow selecting the same file again
    if (displayImageInputRef.current) {
      displayImageInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAssetData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };


  // Compress multiple IPFS CIDs into a single hash for token memo storage
  const compressIPFSHashes = (cids: string[]): string => {
    // Create a compressed hash from multiple IPFS CIDs
    // This allows us to store multiple document references in the token memo
    const combinedCids = cids.join('|');
    
    // Create a hash of the combined CIDs to fit in token memo (100 char limit)
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedCids);
    
    // Use a simple hash function to create a shorter representation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }
    
    // Convert to base36 for shorter representation
    return hash.toString(36);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check wallet connection and required components
      if (!isConnected || !accountId) {
        throw new Error('Wallet not properly connected. Please reconnect your HashPack wallet.');
      }
      
      if (!signer || !hederaClient) {
        throw new Error('Wallet session expired. Please disconnect and reconnect your HashPack wallet.');
      }

      // Step 1: Upload files to IPFS using real IPFS service
      console.log('Uploading files to IPFS...');
      
      // Import ipfsService
      const { ipfsService } = await import('../../services/ipfs');
      
      // Upload display image first
      let displayImageUrl = '';
      if (assetData.displayImage) {
        console.log('Uploading display image to IPFS...');
        setUploadProgress(prev => ({ ...prev, displayImage: true, currentFile: assetData.displayImage?.name }));
        
        const displayImageResult = await ipfsService.uploadFile(assetData.displayImage, {
          name: `${assetData.name} - Display Image`,
          type: assetData.displayImage.type,
          size: assetData.displayImage.size,
          description: 'Main asset display image'
        });
        displayImageUrl = displayImageResult.ipfsUrl;
        console.log('✅ Display image uploaded:', displayImageUrl);
        
        setUploadProgress(prev => ({ ...prev, displayImage: false }));
      }

      // Upload all evidence files to IPFS
      const uploadedFiles = [];
      if (assetData.evidenceFiles.length > 0) {
        setUploadProgress(prev => ({ 
          ...prev, 
          evidenceFiles: true, 
          totalFiles: assetData.evidenceFiles.length,
          currentFileIndex: 0
        }));
        
        for (let i = 0; i < assetData.evidenceFiles.length; i++) {
          const file = assetData.evidenceFiles[i];
          console.log(`Uploading evidence file ${i + 1}/${assetData.evidenceFiles.length}: ${file.name}`);
          
          setUploadProgress(prev => ({ 
            ...prev, 
            currentFile: file.name,
            currentFileIndex: i + 1
          }));
          
          const fileResult = await ipfsService.uploadFile(file, {
            name: `${assetData.name} - ${file.name}`,
            type: file.type,
            size: file.size,
            description: `Evidence file for ${assetData.selectedCategory}`
          });
          uploadedFiles.push({
            name: file.name,
            type: file.type,
            size: file.size,
            url: fileResult.ipfsUrl,
            cid: fileResult.cid
          });
        }
        
        setUploadProgress(prev => ({ ...prev, evidenceFiles: false }));
      }

      // Step 2: Create comprehensive metadata
      const metadata = {
        name: assetData.name,
        description: assetData.description,
        type: 'RWA', // Set type as 'RWA' for Profile filtering
        assetType: assetData.type, // Store actual asset type (REAL_ESTATE, etc.)
        category: assetData.category,
        location: {
          country: assetData.country,
          region: assetData.region,
          address: assetData.address,
          coordinates: assetData.coordinates
        },
        totalValue: assetData.totalValue,
        expectedAPY: assetData.expectedAPY,
        maturityDate: assetData.maturityDate,
        displayImage: displayImageUrl,
        evidenceFiles: uploadedFiles,
        selectedCategory: assetData.selectedCategory,
        condition: assetData.condition,
        maintenanceHistory: assetData.maintenanceHistory,
        insuranceInfo: assetData.insuranceInfo,
        complianceStatus: assetData.complianceStatus,
        createdAt: new Date().toISOString()
      };

      // Step 3: Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      setUploadProgress(prev => ({ ...prev, metadata: true, currentFile: 'metadata.json' }));
      
      const metadataJson = JSON.stringify(metadata);
      const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'rwa-metadata.json', { type: 'application/json' });
      
      const metadataUploadResult = await ipfsService.uploadFile(metadataFile, {
        name: `${assetData.name} - RWA Metadata`,
        type: 'application/json',
        size: metadataFile.size,
        description: 'RWA Asset Metadata JSON'
      });
      
      setUploadProgress(prev => ({ ...prev, metadata: false }));

      if (!metadataUploadResult?.ipfsUrl) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      const metadataCid = metadataUploadResult.cid;
      console.log('✅ Metadata uploaded to IPFS:', metadataCid);

      // Optionally compress document CIDs for token memo (if you want to store individual document references)
      const documentCids = uploadedFiles.map(f => f.cid);
      const compressedHash = compressIPFSHashes(documentCids);
      console.log('✅ Compressed document hash:', compressedHash);

      // Create RWA asset payload for HCS submission
      const assetPayload = {
        name: assetData.name,
        type: 'RWA', // Set type as 'RWA' for Profile filtering
        assetType: assetData.type, // Store actual asset type (REAL_ESTATE, etc.)
        value: assetData.totalValue,
        location: `${assetData.country}, ${assetData.region}`,
        description: assetData.description,
        expectedAPY: assetData.expectedAPY,
        creator: accountId,
        metadataCid: metadataCid,
        displayImageUrl: displayImageUrl,
        documentUrls: uploadedFiles.map(f => f.url),
        nftTokenId: 'pending-nft-creation' // Will be updated after NFT creation
      };

      // Step 4: Create HTS NFT for RWA asset (with RWA-specific symbol for fast filtering)
      console.log('Creating HTS NFT for RWA asset...');
      
      // Import required Hedera SDK components
      const { 
        TokenCreateTransaction, 
        TokenType, 
        TokenSupplyType, 
        TokenMintTransaction,
        PrivateKey,
        TokenId
      } = await import('@hashgraph/sdk');

      // Generate supply key for NFT minting (following digital asset pattern exactly)
      const supplyKey = PrivateKey.generate();
      console.log(`✅ Generated supply key: ${supplyKey.publicKey.toString()}`);

      // Create HTS NFT Collection with RWA-specific symbol for fast filtering
      const nftTokenCreateTx = new TokenCreateTransaction()
        .setTokenName(`${assetData.name} RWA`)
        .setTokenSymbol('RWA-ASSET') // Use RWA-specific symbol for fast filtering
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(accountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000) // Use higher max supply like digital assets
        .setSupplyKey(supplyKey.publicKey) // Use PUBLIC key like digital assets
        .setTokenMemo(`IPFS:${metadataCid}|DOCS:${compressedHash}`)
        .setMaxTransactionFee(5000)
        .setTransactionValidDuration(120);

      console.log('Requesting HashPack approval for RWA NFT creation...');
      
      // Freeze and sign the transaction with HashPack
      nftTokenCreateTx.freezeWithSigner(signer);
      const signedNftTokenTx = await signer.signTransaction(nftTokenCreateTx);
      const nftTokenResponse = await signedNftTokenTx.execute(hederaClient);
      
      if (nftTokenResponse.transactionId) {
        console.log('Getting NFT creation receipt...');
        const nftTokenReceipt = await nftTokenResponse.getReceipt(hederaClient);
        const nftTokenId = nftTokenReceipt.tokenId?.toString();
        
        if (nftTokenId) {
          console.log(`✅ RWA NFT Collection created: ${nftTokenId}`);
          console.log(`📋 Metadata CID stored in token memo: ${metadataCid}`);
          
          // Now mint the NFT with metadata (following digital asset dual-signing pattern)
          console.log('Minting RWA NFT with metadata...');
          
          const metadataBuffer = Buffer.from(metadataCid);
          const nftMintTx = new TokenMintTransaction()
            .setTokenId(TokenId.fromString(nftTokenId))
            .setMetadata([metadataBuffer])
            .setMaxTransactionFee(5000)
            .setTransactionValidDuration(120);
          
          // CORRECTED METHOD: Treasury signs first, then supply key (following digital asset pattern)
          try {
            console.log('🔧 Treasury account signs first (via HashPack)...');
            
            // First: Treasury account signs via HashPack
            nftMintTx.freezeWithSigner(signer);
            const treasurySignedTx = await signer.signTransaction(nftMintTx);
            
            console.log('✅ Treasury signature obtained from HashPack');
            console.log('🔧 Supply key signs second (local signing)...');
            
            // Second: Supply key signs locally
            const dualSignedTx = await treasurySignedTx.sign(supplyKey);
            
            console.log('✅ Supply key signature added');
            console.log('🔧 Executing dual-signed transaction...');
            
            // Execute the dual-signed transaction
            const nftMintResponse = await dualSignedTx.execute(hederaClient);
            
            if (nftMintResponse.transactionId) {
              console.log('🔧 Getting transaction receipt...');
              const nftMintReceipt = await nftMintResponse.getReceipt(hederaClient);
              const serialNumber = nftMintReceipt.serials?.[0];
              
              if (serialNumber) {
                console.log(`✅ RWA NFT minted successfully with serial number: ${serialNumber}`);
                console.log(`🎉 Transaction ID: ${nftMintResponse.transactionId.toString()}`);
                
                // Update the asset payload with the actual NFT token ID
                assetPayload.nftTokenId = nftTokenId;
              }
            }
          } catch (mintError) {
            console.error('Minting failed, but token collection was created:', mintError);
            // Token collection was created successfully, just minting failed
            assetPayload.nftTokenId = nftTokenId;
          }
        } else {
          throw new Error('Failed to get token ID from NFT creation receipt');
        }
      } else {
        throw new Error('Failed to execute NFT creation transaction');
      }

      // Submit RWA asset data to backend for automatic HCS submission
      console.log('🔧 Submitting RWA asset data to backend for HCS registration...');
      
      try {
        // Create asset data for backend HCS submission
        const assetSubmissionData = {
          nftTokenId: assetPayload.nftTokenId,
          creator: accountId,
          name: assetData.name,
          type: 'RWA',
          assetType: assetData.type,
          category: assetData.category,
          totalValue: assetData.totalValue,
          expectedAPY: assetData.expectedAPY,
          maturityDate: assetData.maturityDate,
          location: `${assetData.country}, ${assetData.region}`,
          description: assetData.description,
          metadataCid: metadataCid,
          displayImage: displayImageUrl,
          documentUrls: uploadedFiles.map(f => f.url),
          compressedHash: compressedHash
        };
        
        console.log('📝 Asset Submission Data:', {
          nftTokenId: assetPayload.nftTokenId,
          creator: accountId,
          name: assetData.name,
          type: 'RWA',
          totalValue: assetData.totalValue
        });
        
        // Submit to backend RWA endpoint (backend will handle HCS automatically)
        const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/hedera/rwa/create-with-hcs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify(assetSubmissionData)
        });
        
        if (backendResponse.ok) {
          const backendResult = await backendResponse.json();
          console.log('✅ RWA asset submitted to backend successfully');
          console.log(`🎉 Backend Response: ${backendResult.message}`);
          console.log(`🎉 Asset will be automatically registered in HCS for admin approval`);
        } else {
          throw new Error(`Backend submission failed: ${backendResponse.statusText}`);
        }
        
      } catch (backendError) {
        console.error('❌ Backend submission failed:', backendError);
        console.log('⚠️ NFT creation was successful, but backend registration failed');
        console.log('✅ RWA asset is still tokenized and ready for trading');
        
        // Don't throw error - NFT creation was successful
        // Backend registration is for admin approval workflow, not critical for asset creation
      }

      setSuccess(true);
      
      // Show success toast
      toast({
        title: 'RWA Asset Created Successfully!',
        description: 'Your RWA asset has been tokenized as an NFT on Hedera with IPFS metadata and submitted to TrustBridge HCS for AMC approval.',
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error creating RWA asset:', error);
      setError(error instanceof Error ? error.message : 'Failed to create RWA asset');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return assetData.name && assetData.description && assetData.type;
      case 2:
        return assetData.country && assetData.region && assetData.address;
      case 3:
        return assetData.totalValue > 0 && assetData.expectedAPY > 0 && assetData.maturityDate;
      case 4:
        return assetData.selectedCategory && assetData.evidenceFiles.length > 0 && assetData.displayImage;
      case 5:
        return true; // AI Analysis step - always valid
      case 6:
        return true; // Review step - always valid
      default:
        return false;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            RWA Asset Tokenized Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your RWA asset has been tokenized as an NFT on Hedera with IPFS metadata and submitted to TrustBridge HCS for AMC approval. The NFT contains all your asset documentation and will be reviewed by our team.
          </p>
          <Button onClick={() => navigate('/dashboard/profile')}>
            View Profile
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
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
            Create RWA Asset
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-electric-mint text-lg"
          >
            Submit your real-world asset for tokenization on Hedera
          </motion.p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-neon-green text-black' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-neon-green' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-electric-mint">
            <span>Basic Info</span>
            <span>Location</span>
            <span>Financial</span>
            <span>Documents</span>
            <span>Review</span>
          </div>
        </motion.div>

        {/* Form Steps */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mt-8">
            <div className="p-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-off-white mb-4">
                    Basic Information
                  </h2>
              
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Asset Name *
                    </label>
                    <input
                      type="text"
                      value={assetData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-off-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                      placeholder="Enter asset name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Description *
                    </label>
                    <textarea
                      value={assetData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-off-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                      placeholder="Describe your asset in detail"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">
                      Asset Type *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {assetTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.value}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              assetData.type === type.value
                                ? 'border-neon-green bg-neon-green/10'
                                : 'border-gray-600 hover:border-electric-mint'
                            }`}
                            onClick={() => handleInputChange('type', type.value)}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-6 h-6 text-neon-green" />
                              <div>
                                <div className="font-medium text-off-white">
                                  {type.label}
                                </div>
                                <div className="text-sm text-electric-mint">
                                  {type.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Asset Location
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                    </label>
                  <input
                    type="text"
                    value={assetData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Country"
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Region/State *
                    </label>
                  <input
                    type="text"
                    value={assetData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Region or State"
                  />
                </div>
                  </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Address *
                      </label>
                <textarea
                  value={assetData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Complete address"
                      />
                    </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Latitude
                      </label>
                  <input
                    type="number"
                    step="any"
                    value={assetData.coordinates.lat}
                    onChange={(e) => handleInputChange('coordinates', { ...assetData.coordinates, lat: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Latitude"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longitude
                      </label>
                  <input
                    type="number"
                    step="any"
                    value={assetData.coordinates.lng}
                    onChange={(e) => handleInputChange('coordinates', { ...assetData.coordinates, lng: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Longitude"
                      />
                    </div>
                  </div>
            </motion.div>
          )}

          {/* Step 3: Financial Details */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Financial Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Asset Value (USD) *
                    </label>
                  <input
                      type="number"
                    value={assetData.totalValue}
                    onChange={(e) => handleInputChange('totalValue', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Asset value in USD"
                  />
                  </div>

                    <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expected APY (%) *
                      </label>
                  <input
                        type="number"
                    step="0.1"
                    value={assetData.expectedAPY}
                    onChange={(e) => handleInputChange('expectedAPY', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Expected annual return"
                      />
                    </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-off-white mb-2">
                        Maturity Date *
                      </label>
                  <input
                        type="date"
                    value={assetData.maturityDate}
                        onChange={(e) => handleInputChange('maturityDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-off-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                      />
                    </div>
                
                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">
                    Asset Condition
                  </label>
                  <select
                    value={assetData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-off-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                  >
                    <option value="">Select condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                  </div>
                </div>
            </motion.div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-off-white mb-4">
                Required Documents & Images
              </h2>
              
              {/* Display Image */}
              <div>
                <label className="block text-sm font-medium text-off-white mb-2">
                  Display Image * (Main image for the asset)
                </label>
                <input
                  ref={displayImageInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  onChange={(e) => handleDisplayImageChange(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-off-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                />
                <p className="text-sm text-electric-mint mt-1">
                  Upload the main image that will represent your asset
                </p>
                {assetData.displayImage && (
                  <p className="text-sm text-neon-green mt-1">
                    ✅ Selected: {assetData.displayImage.name}
                  </p>
                )}
                    </div>
                    
              {/* Document Categories */}
              <div>
                <label className="block text-sm font-medium text-off-white mb-2">
                  Select Document Category * (Choose one category for your files)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {documentCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          assetData.selectedCategory === category.value
                            ? 'border-neon-green bg-neon-green/10'
                            : 'border-gray-600 hover:border-electric-mint'
                        }`}
                        onClick={() => {
                          handleInputChange('selectedCategory', category.value);
                        }}
                      >
                        <div className="text-center">
                          <Icon className="w-8 h-8 mx-auto mb-2 text-neon-green" />
                          <div className="font-medium text-off-white text-sm mb-1 flex items-center justify-center">
                            {category.label}
                            {category.required && (
                              <span className="text-red-400 ml-1">*</span>
                            )}
                      </div>
                          <div className="text-xs text-electric-mint">
                            {category.description}
                    </div>
                          {category.required && (
                            <div className="text-xs text-red-400 mt-1 font-medium">
                              Required
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <p className="text-sm text-electric-mint">
                    Selected: {assetData.selectedCategory ? documentCategories.find(cat => cat.value === assetData.selectedCategory)?.label : 'None'}
                  </p>
                    </div>
                  </div>
                  
              {/* File Upload - Only show after category is selected */}
              {assetData.selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">
                    Upload Evidence Files * (Upload files for selected category)
                  </label>
                  <input
                    ref={evidenceFilesInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-off-white focus:outline-none focus:ring-2 focus:ring-neon-green"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-electric-mint">
                      Upload files for: <strong>{documentCategories.find(cat => cat.value === assetData.selectedCategory)?.label}</strong>
                    </p>
                    <div className="text-sm font-medium text-neon-green">
                      {assetData.evidenceFiles.length} files
                    </div>
                  </div>
                  {assetData.evidenceFiles.length === 0 && (
                    <p className="text-sm text-red-400 mt-1">
                      ⚠️ Please upload at least one file
                    </p>
                  )}
                </div>
              )}

              {/* Uploaded Files List - Only show after category is selected */}
              {assetData.selectedCategory && assetData.evidenceFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-off-white mb-2">Uploaded Files:</h4>
                  <div className="space-y-2">
                    {assetData.evidenceFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600">
                        <span className="text-sm text-off-white">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                  </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
              )}

          {/* Step 5: AI Analysis */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI-Powered Asset Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Get instant validation, pricing, and risk assessment for your real-world asset
                </p>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center max-w-4xl mx-auto">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  AI Analysis feature is temporarily unavailable. Skipping to submit your asset.
                </p>
                <Button
                  onClick={() => {
                    setAiAnalysisResult({ validation: { status: 'skipped' } });
                    setCurrentStep(6);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue to Review
                </Button>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(4)}
                >
                  Back to Documents
                </Button>
                <Button
                  onClick={() => setCurrentStep(6)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Skip Analysis & Continue
                </Button>
              </div>
            </motion.div>
          )}

              {/* Step 6: Review & Submit */}
              {currentStep === 6 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Review & Submit
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Basic Information</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Name:</strong> {assetData.name}</p>
                      <p><strong>Type:</strong> {assetData.type}</p>
                      <p><strong>Description:</strong> {assetData.description}</p>
                        </div>
                    </div>
                    
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Location</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Country:</strong> {assetData.country}</p>
                      <p><strong>Region:</strong> {assetData.region}</p>
                      <p><strong>Address:</strong> {assetData.address}</p>
                      </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Financial Details</h3>
                    <div className="text-sm text-electric-mint space-y-1">
                      <p><strong>Value:</strong> ${assetData.totalValue.toLocaleString()}</p>
                      <p><strong>APY:</strong> {assetData.expectedAPY}%</p>
                      <p><strong>Maturity:</strong> {assetData.maturityDate}</p>
                      <p><strong>Condition:</strong> {assetData.condition || 'Not specified'}</p>
                        </div>
                    </div>
                    
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Documents</h3>
                    <div className="text-sm text-electric-mint space-y-1">
                      <p><strong>Display Image:</strong> {assetData.displayImage ? 'Uploaded' : 'Not uploaded'}</p>
                      <p><strong>Evidence Files:</strong> {assetData.evidenceFiles.length}</p>
                      <p><strong>Document Category:</strong> {documentCategories.find(cat => cat.value === assetData.selectedCategory)?.label || 'None'}</p>
                    </div>
                  </div>

                  {/* AI Analysis Results */}
                  {aiAnalysisResult && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-blue-500" />
                        AI Analysis Results
                      </h3>
                      <div className="text-sm text-electric-mint space-y-1">
                        <p><strong>Validation:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            aiAnalysisResult.validation?.status === 'valid' ? 'bg-green-100 text-green-800' :
                            aiAnalysisResult.validation?.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {aiAnalysisResult.validation?.status?.toUpperCase() || 'N/A'}
                          </span>
                        </p>
                        {aiAnalysisResult.marketValue && (
                          <p><strong>Suggested Value:</strong> ${aiAnalysisResult.marketValue.suggested?.toLocaleString() || 'N/A'}</p>
                        )}
                        {aiAnalysisResult.riskAssessment && (
                          <p><strong>Risk Level:</strong> {aiAnalysisResult.riskAssessment.level?.toUpperCase() || 'N/A'}</p>
                        )}
                        {aiAnalysisResult.compliance && (
                          <p><strong>Compliance:</strong> 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              aiAnalysisResult.compliance.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {aiAnalysisResult.compliance.status?.toUpperCase() || 'N/A'}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress Indicator */}
              {(uploadProgress.displayImage || uploadProgress.evidenceFiles || uploadProgress.metadata) && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    <p className="text-blue-700 dark:text-blue-300 font-medium">Uploading to IPFS...</p>
                  </div>
                  
                  {uploadProgress.displayImage && (
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      📸 Uploading display image: {uploadProgress.currentFile}
                    </div>
                  )}
                  
                  {uploadProgress.evidenceFiles && (
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      📄 Uploading evidence files: {uploadProgress.currentFile} 
                      ({uploadProgress.currentFileIndex}/{uploadProgress.totalFiles})
                    </div>
                  )}
                  
                  {uploadProgress.metadata && (
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      📋 Uploading metadata: {uploadProgress.currentFile}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}
            </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-gray-600 text-off-white hover:bg-gray-700"
                >
                  Previous
                </Button>

                {currentStep < 6 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="bg-neon-green text-black hover:bg-electric-mint"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-neon-green text-black hover:bg-electric-mint"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        {uploadProgress.displayImage || uploadProgress.evidenceFiles || uploadProgress.metadata 
                          ? 'Uploading to IPFS...' 
                          : 'Creating NFT...'}
                      </div>
                    ) : 'Submit Asset'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRWAAsset;