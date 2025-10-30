import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import FileUpload, { UploadedFile } from '../components/UI/FileUpload';
import { 
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
  Edit3,
  Settings,
  DollarSign,
  Star
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../contexts/WalletContext';
import { useTrustTokenBalance } from '../hooks/useTrustTokenBalance';
import { ipfsService } from '../services/ipfs';
import { requiresAMC } from '../utils/amcRequirements';
import TrustTokenPurchase from '../components/TrustToken/TrustTokenPurchase';
import AMCRequiredModal from '../components/ComingSoon/AMCRequiredModal';
import ProgressModal, { ProgressStep } from '../components/UI/ProgressModal';
import { trustTokenWalletService } from '../services/trust-token-wallet.service';

interface DigitalAssetForm {
  name: string;
  description: string;
  category: number;
  assetType: string;
  location: string;
  totalValue: string;
  imageURI: string;
  metadataURI: string;
  documentURI?: string;
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
  verificationLevel: 'basic' | 'premium';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: Array<{
    trait_type: string;
    value: string;
    rarity: string;
  }>;
}

const CreateDigitalAsset: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, accountId, signer, hederaClient } = useWallet();
  const { balance: trustBalance, refreshBalance } = useTrustTokenBalance();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showAMCModal, setShowAMCModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string; description: string } | null>(null);
  const [showTrustPurchase, setShowTrustPurchase] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [currentProgressStep, setCurrentProgressStep] = useState<string | undefined>();
  const [progressError, setProgressError] = useState<string | null>(null);

  
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
    verificationLevel: 'basic',
    rarity: 'common',
    attributes: []
  });

  // TRUST token cost calculation
  const getTrustTokenCost = () => {
    const baseCost = 50; // Base cost for basic NFT
    const verificationMultiplier = formData.verificationLevel === 'premium' ? 2 : 1;
    const rarityMultiplier = formData.rarity === 'legendary' ? 3 : 
                            formData.rarity === 'epic' ? 2 : 1;
    return baseCost * verificationMultiplier * rarityMultiplier;
  };

  const trustTokenCost = getTrustTokenCost();
  const hasEnoughTrust = trustBalance >= trustTokenCost;

  const digitalCategories = [
    { id: 6, name: 'Digital Art', icon: Palette, description: 'Digital artwork and creative pieces', color: 'text-pink-400' },
    { id: 7, name: 'Real Estate', icon: Globe, description: 'Tokenized real estate properties', color: 'text-blue-400' },
    { id: 8, name: 'Commodities', icon: Package, description: 'Gold, oil, agricultural products', color: 'text-yellow-400' },
    { id: 9, name: 'Intellectual Property', icon: BookOpen, description: 'Patents, trademarks, copyrights', color: 'text-purple-400' },
    { id: 10, name: 'Digital Collectibles', icon: Star, description: 'NFTs and digital collectibles', color: 'text-green-400' },
    { id: 11, name: 'Music & Media', icon: Music, description: 'Songs, videos, podcasts', color: 'text-indigo-400' },
    { id: 12, name: 'Gaming Assets', icon: Gamepad2, description: 'In-game items and virtual worlds', color: 'text-red-400' },
    { id: 13, name: 'Financial Instruments', icon: TrendingUp, description: 'Stocks, bonds, derivatives', color: 'text-cyan-400' },
    { id: 14, name: 'Certificates', icon: Shield, description: 'Educational and professional certs', color: 'text-emerald-400' },
    { id: 15, name: 'Other Assets', icon: Award, description: 'Any other tokenizable asset', color: 'text-orange-400' }
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

  const handleCategorySelect = (categoryId: number, categoryName: string, categoryDescription: string) => {
    // Check if category requires AMC
    if (requiresAMC(categoryId)) {
      setSelectedCategory({ id: categoryId, name: categoryName, description: categoryDescription });
      setShowAMCModal(true);
      return;
    }
    
    // Allow selection for digital assets
    handleInputChange('category', categoryId);
  };

  const handleFilesChange = (files: UploadedFile[]) => {
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

  // Helper function to update progress
  const updateProgress = (stepId: string, status: 'pending' | 'processing' | 'completed' | 'error', message?: string) => {
    setProgressSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status, message } : step
      )
    );
    if (status === 'processing') {
      setCurrentProgressStep(stepId);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !accountId) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your HashPack wallet to create a digital asset.',
        variant: 'destructive'
      });
      return;
    }

    // Check if wallet is still properly connected
    if (!isConnected || !accountId) {
      toast({
        title: 'Wallet Connection Lost',
        description: 'Please disconnect and reconnect your HashPack wallet, then try again.',
        variant: 'destructive'
      });
      return;
    }

    // Check TRUST token balance
    if (!hasEnoughTrust) {
      toast({
        title: 'Insufficient TRUST Tokens',
        description: `You need ${trustTokenCost} TRUST tokens to create this asset. You have ${trustBalance} TRUST tokens.`,
        variant: 'destructive'
      });
      setShowTrustPurchase(true);
      return;
    }

    // Deduct TRUST tokens as platform fee (burn them via HSCS contract)
    try {
      updateProgress('trust-payment', 'processing', `Burning ${trustTokenCost} TRUST tokens...`);
      console.log(`Burning ${trustTokenCost} TRUST tokens as platform fee...`);
      
      // Require wallet connection for real transactions
      if (!trustTokenWalletService.isWalletConnected(accountId)) {
        throw new Error('Wallet not connected. Please connect your wallet to burn TRUST tokens.');
      }

      if (!signer) {
        throw new Error('Wallet signer not available. Please reconnect your wallet.');
      }

      // Use direct contract interaction with user signing
      const result = await trustTokenWalletService.burnTrustTokens(accountId, trustTokenCost, 'NFT_CREATION', signer);
      const transactionId = result.transactionId;
      
      console.log(`✅ Successfully burned ${trustTokenCost} TRUST tokens. Transaction ID: ${transactionId}`);
      
      // Update the user's balance
      await refreshBalance();
      
      updateProgress('trust-payment', 'completed', `Paid ${trustTokenCost} TRUST tokens`);
      
      toast({
        title: 'Platform Fee Paid',
        description: `${trustTokenCost} TRUST tokens have been burned as platform fee. Transaction ID: ${transactionId}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Failed to burn TRUST tokens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process TRUST token payment. Please try again.';
      updateProgress('trust-payment', 'error', errorMessage);
      setProgressError(errorMessage);
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      setIsCreating(false);
      return;
    }
    
    console.log('Wallet connection verified:', accountId);

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
    setProgressError(null);
    
    // Initialize progress steps
    const initialSteps: ProgressStep[] = [
      { id: 'trust-payment', label: 'Paying Platform Fee', status: 'pending', message: 'Burning TRUST tokens...' },
      { id: 'metadata-upload', label: 'Uploading Metadata', status: 'pending', message: 'Preparing asset metadata...' },
      { id: 'nft-collection', label: 'Creating NFT Collection', status: 'pending', message: 'Creating token collection on Hedera...' },
      { id: 'nft-mint', label: 'Minting NFT', status: 'pending', message: 'Minting your unique NFT...' },
      { id: 'finalize', label: 'Finalizing Asset', status: 'pending', message: 'Saving asset reference...' }
    ];
    setProgressSteps(initialSteps);
    setCurrentProgressStep('trust-payment');

    try {
      let assetTokenId: string | undefined;
      let assetTopicId: string | undefined;
      let serialNumber: any;

      // Use existing WalletContext with simpler approach
      console.log('Creating digital asset using existing WalletContext...');
      
      // Import required Hedera SDK components (no HFS needed)
      // const { FileCreateTransaction } = await import('@hashgraph/sdk'); // Not needed
      
      // Debug wallet state
      console.log('Wallet state check:');
      console.log('- isConnected:', isConnected);
      console.log('- accountId:', accountId);
      console.log('- signer:', signer);
      console.log('- hederaClient:', hederaClient);
      
      // Check if we have the required components from WalletContext
      if (!isConnected || !accountId) {
        throw new Error('Wallet not properly connected. Please reconnect your HashPack wallet.');
      }
      
      // Check for signer and hederaClient - these are required for Hedera transactions
      if (!signer || !hederaClient) {
        console.warn('Signer or HederaClient not available, wallet needs to be reconnected...');
        toast({
          title: 'Wallet Reconnection Required',
          description: 'Your wallet session has expired. Please disconnect and reconnect your HashPack wallet to continue.',
          variant: 'destructive'
        });
        throw new Error('Wallet signer not available. Please disconnect and reconnect your HashPack wallet.');
      }
      
      // Debug signer state
      console.log('Signer details:');
      console.log(`- Type: ${typeof signer}`);
      console.log(`- Constructor: ${signer?.constructor?.name}`);
      console.log(`- Has signTransaction: ${typeof signer?.signTransaction}`);
      console.log(`- Account ID: ${accountId}`);
      
      // Check HBAR balance using Mirror Node API (safer than signer method)
      console.log('Checking HBAR balance for transaction fees...');
      try {
        const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
        const accountData = await response.json();
        const balance = accountData.balance?.balance || 0;
        console.log(`Account HBAR balance: ${balance / 100000000} HBAR`);
        
        if (balance < 100000000) { // Less than 1 HBAR
          console.warn('⚠️ Low HBAR balance - transaction might fail due to insufficient fees');
          console.log('Get test HBAR from: https://portal.hedera.com/faucet');
        }
      } catch (error) {
        console.warn('Could not check balance:', error);
      }

      // Step 1: Skip HFS - use direct IPFS approach like working test
      console.log('Using direct IPFS approach (no HFS needed)...');
      
      // Prepare simple asset metadata for localStorage storage
      const assetMetadata = {
        name: formData.name,
        description: formData.description,
        assetType: formData.assetType,
        category: formData.category,
        location: formData.location,
        totalValue: formData.totalValue,
        royaltyPercentage: formData.royaltyPercentage,
        isTradeable: formData.isTradeable,
        isAuctionable: formData.isAuctionable,
        collection: {
          name: formData.collectionName,
          description: formData.collectionDescription,
          image: formData.collectionImage
        },
        files: [
          // Include uploaded files
          ...uploadedFiles.map(file => ({
            id: file.id,
            name: file.file.name,
            type: file.file.type,
            size: file.file.size,
            ipfsUrl: file.ipfsUrl,
            cid: file.cid
          })),
          // Include the main image if it's not already in uploadedFiles
          ...(formData.imageURI && !uploadedFiles.some(f => f.ipfsUrl === formData.imageURI) ? [{
            id: 'main-image',
            name: 'main-image',
            type: 'image/jpeg', // Default type
            size: 0,
            ipfsUrl: formData.imageURI,
            cid: formData.imageURI.split('/').pop() || formData.imageURI
          }] : [])
        ],
        owner: accountId,
        currency: 'TRUST', // Use TRUST token for payments
        status: 'VERIFIED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('📋 Asset metadata prepared (no HFS):', {
        name: assetMetadata.name,
        description: assetMetadata.description,
        filesCount: assetMetadata.files.length,
        firstImageUrl: assetMetadata.files[0]?.ipfsUrl,
        formDataImageURI: formData.imageURI
      });

      // No HFS file creation needed - metadata will be stored in localStorage
      console.log('✅ Using direct IPFS approach - no HFS file needed');

      // Step 2: Create HTS NFT for the asset using proven working pattern
      console.log('Creating HTS NFT for digital asset...');
      
      // Import required components for NFT creation
      const { 
        TokenCreateTransaction, 
        TokenType, 
        TokenSupplyType, 
        TokenMintTransaction,
        PrivateKey,
        TokenId
      } = await import('@hashgraph/sdk');
      
      // Extract IPFS hash from image URL
      const imageUrl = formData.imageURI;
      let ipfsHash = '';
      
      if (imageUrl.includes('ipfs/')) {
        ipfsHash = imageUrl.split('ipfs/')[1];
      } else if (imageUrl.includes('bafy')) {
        ipfsHash = imageUrl.split('/').pop() || '';
      } else {
        // If it's not an IPFS URL, use a placeholder
        ipfsHash = 'bafybeiancudkc7zsdszrzv3hcnqmsd5pmogtxmpou'; // Default test image
      }
      
      console.log('🖼️ Using image URL:', imageUrl);
      console.log('🔗 Extracted IPFS hash:', ipfsHash);

      // Step 2a: Generate supply key for NFT minting
      console.log('🔑 Generating supply key for NFT collection...');
      const supplyKey = PrivateKey.generate();
      console.log(`✅ Generated supply key: ${supplyKey.publicKey.toString()}`);

      // Step 2b: Create HTS NFT Collection
      updateProgress('nft-collection', 'processing', 'Creating NFT collection on Hedera...');
      console.log('🏗️ Creating HTS NFT Collection...');
      
      const nftTokenCreateTx = new TokenCreateTransaction()
        .setTokenName(`${formData.name} Collection`)
        .setTokenSymbol(formData.assetType.toUpperCase().slice(0, 5))
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(accountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000)
        .setSupplyKey(supplyKey.publicKey) // Use PUBLIC key
        .setTokenMemo(`IPFS:${ipfsHash}`)
        .setMaxTransactionFee(5000)
        .setTransactionValidDuration(120);

      updateProgress('nft-collection', 'processing', 'Please approve the transaction in HashPack...');
      console.log('Requesting HashPack approval for NFT collection creation...');
      nftTokenCreateTx.freezeWithSigner(signer);
      const signedNftTokenTx = await signer.signTransaction(nftTokenCreateTx);
      const nftTokenResponse = await signedNftTokenTx.execute(hederaClient);
      
      if (nftTokenResponse.transactionId) {
        updateProgress('nft-collection', 'processing', 'Waiting for transaction confirmation...');
        console.log('Getting NFT collection creation receipt...');
        const nftTokenReceipt = await nftTokenResponse.getReceipt(hederaClient);
        const nftTokenId = nftTokenReceipt.tokenId?.toString();
        
        if (nftTokenId) {
          console.log(`✅ NFT Collection created: ${nftTokenId}`);
          updateProgress('nft-collection', 'completed', `Collection created: ${nftTokenId}`);
          
          // Step 2c: Mint NFT with proper dual signatures
          updateProgress('nft-mint', 'processing', 'Preparing NFT mint transaction...');
          console.log('🎨 Minting NFT with proper dual signatures...');
          console.log('💡 Note: NFT minting requires BOTH treasury account AND supply key signatures');
          console.log('💡 TrustBridge Flow: Users create NFT assets that can be traded on the platform');
          console.log('💡 Each NFT represents a unique digital asset with IPFS image stored in token memo');
          
          // Create comprehensive NFT metadata as JSON
          const assetPrice = (formData.totalValue && formData.totalValue !== '0' && formData.totalValue !== '') ? formData.totalValue : '100';
          const nftMetadata = {
            name: formData.name,
            description: formData.description,
            image: imageUrl,
            price: assetPrice,
            currency: 'TRUST',
            properties: {
              assetType: formData.assetType,
              category: formData.category,
              location: formData.location,
              royaltyPercentage: formData.royaltyPercentage || '5'
            }
          };
          
          console.log('📋 NFT Metadata to store:', nftMetadata);
          
          // Convert to JSON string
          const metadataJson = JSON.stringify(nftMetadata);
          console.log(`📏 Metadata JSON size: ${metadataJson.length} bytes`);
          
          // ALWAYS upload metadata to IPFS and store the IPFS hash in NFT
          let metadataBuffer;
          
          if (metadataJson.length > 100) {
            updateProgress('metadata-upload', 'processing', 'Uploading metadata to IPFS...');
            console.log('📤 Metadata too large - uploading to IPFS...');
            
            // Upload metadata JSON to IPFS
            const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
            const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });
            
            const metadataUploadResult = await ipfsService.uploadFile(metadataFile, {
              name: `${formData.name} - Metadata`,
              description: 'NFT Metadata JSON',
              type: 'application/json',
              size: metadataFile.size
            });
            
            // ipfsService.uploadFile returns the data object directly
            if (!metadataUploadResult?.ipfsUrl) {
              throw new Error('Failed to upload metadata to IPFS');
            }
            
            const metadataIpfsUrl = metadataUploadResult.ipfsUrl;
            const metadataCid = metadataUploadResult.cid;
            
            console.log('✅ Metadata uploaded to IPFS:', metadataIpfsUrl);
            console.log('📦 Metadata CID:', metadataCid);
            
            updateProgress('metadata-upload', 'completed', 'Metadata uploaded to IPFS');
            
            // Store only the CID (not full URL) to stay under 100 bytes limit
            metadataBuffer = Buffer.from(metadataCid);
            console.log(`📏 Using IPFS CID as metadata: ${metadataCid} (${metadataBuffer.length} bytes)`);
          } else {
            // Metadata is small enough to store directly
            updateProgress('metadata-upload', 'processing', 'Preparing metadata...');
            metadataBuffer = Buffer.from(metadataJson);
            updateProgress('metadata-upload', 'completed', 'Metadata prepared');
            console.log(`📏 Using full metadata directly (${metadataBuffer.length} bytes)`);
          }
          
          console.log(`📏 Final metadata buffer size: ${metadataBuffer.length} bytes`);
          
          // CORRECTED METHOD: Treasury signs first, then supply key
          try {
            console.log('🔧 Creating mint transaction...');
            
            const nftMintTx = new TokenMintTransaction()
              .setTokenId(TokenId.fromString(nftTokenId))
              .setMetadata([metadataBuffer])
              .setMaxTransactionFee(5000)
              .setTransactionValidDuration(120);
            
            updateProgress('nft-mint', 'processing', 'Please approve the mint transaction in HashPack...');
            console.log('🔧 Treasury account signs first (via HashPack)...');
            
            // First: Treasury account signs via HashPack
            nftMintTx.freezeWithSigner(signer);
            const treasurySignedTx = await signer.signTransaction(nftMintTx);
            
            console.log('✅ Treasury signature obtained from HashPack');
            updateProgress('nft-mint', 'processing', 'Applying supply key signature...');
            console.log('🔧 Supply key signs second (local signing)...');
            
            // Second: Supply key signs locally
            const dualSignedTx = await treasurySignedTx.sign(supplyKey);
            
            console.log('✅ Supply key signature added');
            updateProgress('nft-mint', 'processing', 'Executing transaction on Hedera...');
            console.log('🔧 Executing dual-signed transaction...');
            
            // Execute the dual-signed transaction
            const nftMintResponse = await dualSignedTx.execute(hederaClient);
            
            if (nftMintResponse.transactionId) {
              updateProgress('nft-mint', 'processing', 'Waiting for transaction confirmation...');
              console.log('🔧 Getting transaction receipt...');
              const nftMintReceipt = await nftMintResponse.getReceipt(hederaClient);
              serialNumber = nftMintReceipt.serials?.[0];
              
              if (serialNumber) {
                console.log(`✅ NFT minted successfully with serial number: ${serialNumber}`);
                console.log(`🎉 Transaction ID: ${nftMintResponse.transactionId.toString()}`);
                updateProgress('nft-mint', 'completed', `NFT minted! Serial: ${serialNumber}`);
                
                // Set the asset token ID to the NFT collection ID
                assetTokenId = nftTokenId;
                
                // Step 4: Create NFT asset reference with actual serial number
                console.log('Creating NFT asset reference with serial number...');
                console.log('💡 TrustBridge: This NFT asset can now be traded on the platform');
                console.log('💡 Users can buy/sell this NFT using TRUST tokens as payment');
                
                // Ensure price is never empty or 0
                const assetPrice = (formData.totalValue && formData.totalValue !== '0' && formData.totalValue !== '') ? formData.totalValue : '100';
                console.log('💰 Asset pricing:', {
                  formDataTotalValue: formData.totalValue,
                  formDataTotalValueType: typeof formData.totalValue,
                  isEmpty: formData.totalValue === '',
                  isZero: formData.totalValue === '0',
                  finalPrice: assetPrice
                });

                const nftAssetReference = {
                  tokenId: assetTokenId,
                  serialNumber: serialNumber.toString(), // Actual NFT serial number
                  fileId: undefined, // No HFS file - using direct IPFS approach
                  topicId: assetTopicId,
                  name: formData.name,
                  description: formData.description,
                  imageURI: imageUrl, // Use the working IPFS image URL
                  owner: accountId,
                  price: assetPrice,
                  currency: 'TRUST', // Use TRUST token for payments
                  status: 'active',
                  assetType: 'NFT', // Mark as NFT
                  category: 'Digital Art',
                  location: 'Hedera Testnet',
                  tags: formData.tags || ['nft', 'art', 'ipfs', 'hts'],
                  isTradeable: true,
                  isAuctionable: formData.isAuctionable || false,
                  royaltyPercentage: formData.royaltyPercentage || '5',
                  totalValue: assetPrice,
                  evidence: {
                    documents: assetMetadata.files?.filter((f: any) => f.type && typeof f.type === 'string' && f.type.startsWith('application/'))?.map((f: any) => f.ipfsUrl) || [],
                    images: [imageUrl] // Primary NFT image
                  },
                  evidenceHashes: [ipfsHash], // IPFS hash for verification
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                // Store NFT asset reference in localStorage for quick access
                updateProgress('finalize', 'processing', 'Saving asset reference...');
                console.log('🎯 COMPLETE NFT ASSET METADATA CAPTURED:');
                console.log('📋 NFT Asset Reference:', JSON.stringify(nftAssetReference, null, 2));
                console.log('🪙 NFT Collection ID:', assetTokenId);
                console.log('🎨 NFT Serial Number:', serialNumber);
                console.log('👤 Owner account:', accountId);
                console.log('💰 Price:', formData.totalValue, 'TRUST');
                console.log('🖼️ Image URL:', imageUrl);
                console.log('🔗 IPFS Hash:', ipfsHash);
                console.log('💡 Using direct IPFS approach - no HFS file needed');
                
                // Store reference in localStorage (metadata stored locally, image via IPFS)
                const existingReferences = JSON.parse(localStorage.getItem('assetReferences') || '[]');
                existingReferences.push(nftAssetReference);
                localStorage.setItem('assetReferences', JSON.stringify(existingReferences));
                
                console.log('✅ NFT asset reference stored with Collection ID:', assetTokenId, 'Serial:', serialNumber);
                updateProgress('finalize', 'completed', 'Asset saved successfully!');
                
                console.log('🎉 REAL HTS NFT creation completed successfully!');
                console.log('💡 This NFT can now be viewed, traded, or transferred');

              } else {
                throw new Error('No serial number in NFT minting receipt');
              }
            } else {
              throw new Error('No transaction ID in NFT minting response');
            }
            
          } catch (mintError: any) {
            console.error(`❌ NFT minting failed: ${mintError.message}`);
            updateProgress('nft-mint', 'error', mintError.message);
            setProgressError(mintError.message);
            throw mintError;
          }
          
        } else {
          throw new Error('No token ID in NFT collection receipt');
        }
      } else {
        throw new Error('No transaction ID in NFT collection response');
      }

      // Step 3: Skip HCS for now - focus on core NFT creation
      assetTopicId = 'events-logged-in-backend'; // Placeholder

      // Success message will be shown after NFT creation is complete
      toast({
        title: 'NFT Digital Asset Created Successfully!',
        description: `Your NFT "${formData.name}" has been created with Collection ID: ${assetTokenId}. Using direct IPFS approach - no HFS needed!`,
        variant: 'default'
      });

      // Wait a moment for localStorage to fully save, then navigate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to Profile page and trigger refresh
      navigate('/dashboard/profile', { state: { refreshAssets: true, timestamp: Date.now() } });
    } catch (error) {
      console.error('Error creating digital asset:', error);
      
      let errorMessage = 'Failed to create digital asset';
      if (error instanceof Error) {
        if (error.message.includes('TOKEN_HAS_NO_SUPPLY_KEY')) {
          errorMessage = 'Token creation failed: Missing supply key. Please try again.';
        } else if (error.message.includes('INSUFFICIENT_TX_FEE')) {
          errorMessage = 'Insufficient HBAR for transaction fees. Please add more HBAR to your account.';
        } else if (error.message.includes('TRANSACTION_EXPIRED')) {
          errorMessage = 'Transaction expired. Please try again.';
        } else if (error.message.includes('No matching key')) {
          errorMessage = 'HashPack wallet error: Please ensure your wallet is properly connected and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Transaction timed out. Please try again with a better network connection.';
        } else if (error.message.includes('HashPack signing timeout')) {
          errorMessage = 'HashPack signing timed out. Please ensure HashPack is open and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Mark the current step as error
      if (currentProgressStep) {
        updateProgress(currentProgressStep, 'error', errorMessage);
      }
      setProgressError(errorMessage);
      
      toast({
        title: 'Error Creating Asset',
        description: errorMessage,
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
    
    // Validation check - removed console.log to prevent spam during re-renders
    
    switch (currentStep) {
      case 1:
        return !!(formData.name && formData.description && formData.assetType);
      case 2:
        // Ensure image is uploaded to IPFS before proceeding
        const hasValidImage = formData.imageURI && 
          !formData.imageURI.includes('placeholder') && 
          (typeof formData.imageURI === 'string' && (formData.imageURI.startsWith('https://') || formData.imageURI.startsWith('ipfs://')));
        return !!(hasValidImage && formData.location);
      case 3:
        // Require a valid non-zero price
        return !!(formData.totalValue && formData.totalValue !== '0' && parseFloat(formData.totalValue) > 0);
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
      {/* Progress Modal */}
      <ProgressModal
        isOpen={isCreating}
        title="Creating Digital Asset"
        steps={progressSteps}
        currentStepId={currentProgressStep}
        error={progressError}
        onClose={() => {
          if (!progressSteps.some(s => s.status === 'processing')) {
            setIsCreating(false);
            setProgressSteps([]);
            setProgressError(null);
          }
        }}
      />
      
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
                  {steps.map((step, _) => {
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
                              const needsAMC = requiresAMC(category.id);
                              return (
                                <button
                                  key={category.id}
                                  onClick={() => handleCategorySelect(category.id, category.name, category.description)}
                                  className={`p-3 rounded border-2 transition-all text-left relative ${
                                    formData.category === category.id
                                      ? 'border-neon-green bg-neon-green/10 text-neon-green'
                                      : needsAMC
                                      ? 'border-yellow-600/50 hover:border-yellow-500/70 text-gray-300 bg-yellow-900/5'
                                      : 'border-gray-600 hover:border-gray-500 text-gray-300'
                                  }`}
                                >
                                  {needsAMC && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                      AMC
                                    </div>
                                  )}
                                  <Icon className={`w-5 h-5 mb-2 ${category.color}`} />
                                  <div className="text-xs font-medium">{category.name}</div>
                                  <div className="text-xs text-gray-400">{category.description}</div>
                                  {needsAMC && (
                                    <div className="text-[10px] text-yellow-500 mt-1">
                                      Coming Q2 2025
                                    </div>
                                  )}
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
                            Listing Price (TRUST Tokens) *
                          </label>
                          <Input
                            type="number"
                            value={formData.totalValue}
                            onChange={(e) => handleInputChange('totalValue', e.target.value)}
                            placeholder="Enter price in TRUST tokens (e.g., 100, 500, 1000)"
                            className="w-full"
                            min="1"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            This is the price buyers will pay in TRUST tokens to purchase your asset
                          </p>
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
                              <span className="text-electric-mint">Price:</span>
                              <p className="text-off-white">{formData.totalValue || '100'} TRUST</p>
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

                        {/* TRUST Token Cost */}
                        <div className="bg-gray-800 p-6 rounded-lg">
                          <h4 className="text-sm font-medium text-off-white mb-4">Creation Cost</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">Platform Fee (TRUST tokens)</span>
                              <span className="text-sm font-mono text-off-white">{trustTokenCost} TRUST</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">Gas Fees (HBAR)</span>
                              <span className="text-sm font-mono text-off-white">~2 HBAR</span>
                            </div>
                            <div className="border-t border-gray-700 pt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-300">Your TRUST Balance</span>
                                <span className={`text-sm font-mono ${hasEnoughTrust ? 'text-neon-green' : 'text-red-400'}`}>
                                  {trustBalance} TRUST
                                </span>
                              </div>
                              {!hasEnoughTrust && (
                                <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
                                  Insufficient TRUST tokens. You need {trustTokenCost - trustBalance} more TRUST tokens.
                                </div>
                              )}
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
                              {currentStep === 3 && 'Please enter a valid price greater than 0'}
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

      {/* AMC Required Modal */}
      {selectedCategory && (
        <AMCRequiredModal
          isOpen={showAMCModal}
          onClose={() => {
            setShowAMCModal(false);
            setSelectedCategory(null);
          }}
          categoryName={selectedCategory.name}
          categoryDescription={selectedCategory.description}
        />
      )}

      {/* TRUST Token Purchase Modal */}
      <TrustTokenPurchase
        isOpen={showTrustPurchase}
        onClose={() => setShowTrustPurchase(false)}
        requiredAmount={trustTokenCost}
        onSuccess={(amount) => {
          refreshBalance();
          setShowTrustPurchase(false);
          toast({
            title: 'TRUST Tokens Purchased!',
            description: `Successfully purchased ${amount} TRUST tokens. You can now create your asset.`,
            variant: 'default'
          });
        }}
      />
    </div>
  );
};

export default CreateDigitalAsset;
