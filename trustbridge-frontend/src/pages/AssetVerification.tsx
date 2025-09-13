import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import FileUpload from '../components/UI/FileUpload';
import FilePreview from '../components/UI/FilePreview';
import Breadcrumb from '../components/UI/Breadcrumb';
import StepNavigation from '../components/UI/StepNavigation';
import ProgressIndicator from '../components/UI/ProgressIndicator';
import { 
  Upload, 
  MapPin, 
  Camera, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Building2,
  TreePine,
  Factory,
  Home,
  Loader2,
  X,
  Shield,
  TrendingUp,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ipfsService, IPFSUploadResult, IPFSFileMetadata } from '../services/ipfs';
import { apiService } from '../services/api';
import VerificationTiers from '../components/Verification/VerificationTiers';

interface AssetDocument {
  id: string;
  file: File;
  type: 'ownership' | 'survey' | 'valuation' | 'insurance' | 'other';
  description: string;
  cid?: string;
  ipfsUrl?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface AssetPhoto {
  id: string;
  file: File;
  description: string;
  location?: { lat: number; lng: number };
  cid?: string;
  ipfsUrl?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

const AssetVerification: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [photos, setPhotos] = useState<AssetPhoto[]>([]);
  const [tokenizationResult, setTokenizationResult] = useState<{
    tokenId?: string;
    transactionId?: string;
    success: boolean;
    verificationTier?: string;
    processingTime?: number;
  } | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    cid: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    assetType: '',
    assetName: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      coordinates: { lat: 0, lng: 0 }
    },
    valuation: {
      estimatedValue: '',
      currency: 'NGN',
      valuationDate: '',
      valuator: ''
    },
    ownership: {
      ownerName: '',
      ownershipType: 'individual',
      ownershipPercentage: '100',
      legalEntity: ''
    },
    specifications: {
      size: '',
      unit: 'sqm',
      condition: 'excellent',
      yearBuilt: '',
      features: []
    }
  });

  const assetTypes = [
    { value: 'real_estate', label: 'Real Estate', icon: Building2, description: 'Residential, commercial, or industrial properties' },
    { value: 'agricultural', label: 'Agricultural Land', icon: TreePine, description: 'Farms, plantations, or agricultural facilities' },
    { value: 'industrial', label: 'Industrial Asset', icon: Factory, description: 'Manufacturing facilities, warehouses, or industrial equipment' },
    { value: 'residential', label: 'Residential Property', icon: Home, description: 'Houses, apartments, or residential complexes' }
  ];

  const documentTypes = [
    { value: 'ownership', label: 'Ownership Document', description: 'Title deed, certificate of occupancy, or ownership certificate' },
    { value: 'survey', label: 'Survey Plan', description: 'Official survey plan or land survey document' },
    { value: 'valuation', label: 'Valuation Report', description: 'Professional property valuation report' },
    { value: 'insurance', label: 'Insurance Policy', description: 'Property insurance policy document' },
    { value: 'other', label: 'Other Document', description: 'Any other relevant legal or technical document' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'photo') => {
    const files = Array.from(event.target.files || []);
    
    if (type === 'document') {
      const newDocuments = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: 'other' as const,
        description: '',
        status: 'pending' as const
      }));
      setDocuments(prev => [...prev, ...newDocuments]);
    } else {
      const newPhotos = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        description: '',
        status: 'pending' as const
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleDocumentUpload = async (file: File, metadata: IPFSFileMetadata): Promise<IPFSUploadResult> => {
    return await ipfsService.uploadFile(file, {
      ...metadata,
      category: 'verification_document'
    });
  };

  const handlePhotoUpload = async (file: File, metadata: IPFSFileMetadata): Promise<IPFSUploadResult> => {
    return await ipfsService.uploadFile(file, {
      ...metadata,
      category: 'verification_photo'
    });
  };

  const uploadDocument = async (document: AssetDocument) => {
    try {
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, status: 'uploading' as const }
          : doc
      ));

      const metadata: IPFSFileMetadata = {
        name: document.file.name,
        type: document.file.type,
        size: document.file.size,
        description: document.description,
        category: 'verification_document',
        tags: [document.type, 'asset_verification']
      };

      const result = await handleDocumentUpload(document.file, metadata);
      
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { 
              ...doc, 
              status: 'completed' as const,
              cid: result.cid,
              ipfsUrl: result.ipfsUrl
            }
          : doc
      ));

    } catch (error) {
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { 
              ...doc, 
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : doc
      ));
    }
  };

  const uploadPhoto = async (photo: AssetPhoto) => {
    try {
      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { ...p, status: 'uploading' as const }
          : p
      ));

      const metadata: IPFSFileMetadata = {
        name: photo.file.name,
        type: photo.file.type,
        size: photo.file.size,
        description: photo.description,
        category: 'verification_photo',
        tags: ['asset_photo', 'verification']
      };

      const result = await handlePhotoUpload(photo.file, metadata);
      
      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { 
              ...p, 
              status: 'completed' as const,
              cid: result.cid,
              ipfsUrl: result.ipfsUrl
            }
          : p
      ));

    } catch (error) {
      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { 
              ...p, 
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : p
      ));
    }
  };

  const uploadAllFiles = async () => {
    const pendingDocs = documents.filter(doc => doc.status === 'pending');
    const pendingPhotos = photos.filter(photo => photo.status === 'pending');

    await Promise.all([
      ...pendingDocs.map(uploadDocument),
      ...pendingPhotos.map(uploadPhoto)
    ]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const updateDocument = (id: string, updates: Partial<AssetDocument>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  };

  const updatePhoto = (id: string, updates: Partial<AssetPhoto>) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, ...updates } : photo
    ));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }
          }));
          toast({
            variant: "success",
            title: "Location Captured",
            description: "GPS coordinates have been automatically captured."
          });
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not capture location. Please enter manually."
          });
        }
      );
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload all files to IPFS first
      await uploadAllFiles();
      
      // Prepare asset data for Hedera tokenization
      const assetData = {
        owner: formData.ownership.ownerName, // Using owner name as identifier
        type: formData.assetType.toUpperCase(),
        name: formData.assetName,
        description: formData.description,
        location: {
          country: formData.location.country,
          region: formData.location.state,
          coordinates: formData.location.coordinates
        },
        totalValue: parseFloat(formData.valuation.estimatedValue) || 0,
        tokenSupply: Math.floor((parseFloat(formData.valuation.estimatedValue) || 0) / 100), // 1 token per $100
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        expectedAPY: 15.0, // Default APY
        metadata: {
          ownership: formData.ownership,
          valuation: formData.valuation,
          specifications: formData.specifications,
          documents: documents.map(doc => ({
            type: doc.type,
            description: doc.description,
            cid: doc.cid,
            ipfsUrl: doc.ipfsUrl
          })),
          photos: photos.map(photo => ({
            description: photo.description,
            location: photo.location,
            cid: photo.cid,
            ipfsUrl: photo.ipfsUrl
          }))
        }
      };

      // Move to tokenization step
      setCurrentStep(7);
      setIsTokenizing(true);

      // Call the Hedera-integrated API
      const response = await apiService.createAssetWithTokenization(assetData);
      
      if (response.success) {
        setTokenizationResult({
          success: true,
          tokenId: response.tokenId,
          transactionId: response.transactionId,
          verificationTier: response.verificationTier,
          processingTime: response.processingTime
        });
        
        toast({
          variant: "success",
          title: "Asset Created & Tokenized! 🎉",
          description: `Your asset has been created and tokenized on Hedera network. Token ID: ${response.tokenId}`
        });
        
        // Reset form
        setFormData({
          assetType: '',
          assetName: '',
          description: '',
          location: {
            address: '',
            city: '',
            state: '',
            country: 'Nigeria',
            coordinates: { lat: 0, lng: 0 }
          },
          valuation: {
            estimatedValue: '',
            currency: 'NGN',
            valuationDate: '',
            valuator: ''
          },
          ownership: {
            ownerName: '',
            ownershipType: 'individual',
            ownershipPercentage: '100',
            legalEntity: ''
          },
          specifications: {
            size: '',
            unit: 'sqm',
            condition: 'excellent',
            yearBuilt: '',
            features: []
          }
        });
        setDocuments([]);
        setPhotos([]);
        setCurrentStep(1);
      } else {
        throw new Error(response.message || 'Failed to create asset');
      }
    } catch (error) {
      console.error('Asset creation error:', error);
      setTokenizationResult({
        success: false,
        tokenId: undefined,
        transactionId: undefined
      });
      
      toast({
        variant: "destructive",
        title: "Tokenization Failed",
        description: error.message || "There was an error creating your asset on Hedera network. Please try again."
      });
    } finally {
      setIsSubmitting(false);
      setIsTokenizing(false);
    }
  };

  const steps = [
    { number: 1, title: 'Asset Type', description: 'Select the type of asset to verify' },
    { number: 2, title: 'Basic Information', description: 'Provide asset details and location' },
    { number: 3, title: 'Ownership & Valuation', description: 'Ownership details and valuation information' },
    { number: 4, title: 'Documents & Photos', description: 'Upload supporting documents and photos' },
    { number: 5, title: 'Verification Tiers', description: 'Choose your verification speed and security level' },
    { number: 6, title: 'Review & Submit', description: 'Review all information and submit for verification' },
    { number: 7, title: 'Hedera Tokenization', description: 'Create blockchain token for your asset' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-off-white mb-4">Select Asset Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assetTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          formData.assetType === type.value
                            ? 'border-neon-green bg-neon-green/10'
                            : 'border-medium-gray hover:border-neon-green/50'
                        }`}
                        onClick={() => handleInputChange('assetType', type.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <IconComponent className="w-6 h-6 text-electric-mint mt-1" />
                            <div>
                              <h4 className="font-semibold text-off-white">{type.label}</h4>
                              <p className="text-sm text-off-white/70 mt-1">{type.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-off-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Asset Name *
                  </label>
                  <Input
                    value={formData.assetName}
                    onChange={(e) => handleInputChange('assetName', e.target.value)}
                    placeholder="Enter asset name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Size *
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.specifications.size}
                      onChange={(e) => handleNestedInputChange('specifications', 'size', e.target.value)}
                      placeholder="Enter size"
                      className="flex-1"
                    />
                    <select
                      value={formData.specifications.unit}
                      onChange={(e) => handleNestedInputChange('specifications', 'unit', e.target.value)}
                      className="px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white"
                    >
                      <option value="sqm">Sq M</option>
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-off-white/80 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your asset in detail..."
                  rows={4}
                  className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white placeholder:text-light-gray focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent dark:placeholder:text-light-gray light:placeholder:text-light-text-secondary"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-off-white mb-4">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Full Address *
                  </label>
                  <Input
                    value={formData.location.address}
                    onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                    placeholder="Enter full address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    City *
                  </label>
                  <Input
                    value={formData.location.city}
                    onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    State *
                  </label>
                  <Input
                    value={formData.location.state}
                    onChange={(e) => handleNestedInputChange('location', 'state', e.target.value)}
                    placeholder="Enter state"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Country
                  </label>
                  <select
                    value={formData.location.country}
                    onChange={(e) => handleNestedInputChange('location', 'country', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Capture Current Location
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-off-white mb-4">Ownership Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Owner Name *
                  </label>
                  <Input
                    value={formData.ownership.ownerName}
                    onChange={(e) => handleNestedInputChange('ownership', 'ownerName', e.target.value)}
                    placeholder="Enter owner name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Ownership Type
                  </label>
                  <select
                    value={formData.ownership.ownershipType}
                    onChange={(e) => handleNestedInputChange('ownership', 'ownershipType', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="joint">Joint Ownership</option>
                    <option value="corporate">Corporate</option>
                    <option value="government">Government</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Ownership Percentage
                  </label>
                  <Input
                    type="number"
                    value={formData.ownership.ownershipPercentage}
                    onChange={(e) => handleNestedInputChange('ownership', 'ownershipPercentage', e.target.value)}
                    placeholder="100"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Legal Entity (if applicable)
                  </label>
                  <Input
                    value={formData.ownership.legalEntity}
                    onChange={(e) => handleNestedInputChange('ownership', 'legalEntity', e.target.value)}
                    placeholder="Company name or legal entity"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-off-white mb-4">Valuation Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Estimated Value *
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={formData.valuation.estimatedValue}
                      onChange={(e) => handleNestedInputChange('valuation', 'estimatedValue', e.target.value)}
                      placeholder="Enter estimated value"
                      required
                    />
                    <select
                      value={formData.valuation.currency}
                      onChange={(e) => handleNestedInputChange('valuation', 'currency', e.target.value)}
                      className="px-3 py-2 bg-dark-gray border border-medium-gray rounded-md text-off-white"
                    >
                      <option value="NGN">NGN</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Valuation Date
                  </label>
                  <Input
                    type="date"
                    value={formData.valuation.valuationDate}
                    onChange={(e) => handleNestedInputChange('valuation', 'valuationDate', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-off-white/80 mb-2">
                    Valuator/Appraiser
                  </label>
                  <Input
                    value={formData.valuation.valuator}
                    onChange={(e) => handleNestedInputChange('valuation', 'valuator', e.target.value)}
                    placeholder="Name of professional valuator or appraiser"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-off-white mb-4">Supporting Documents</h3>
              <p className="text-sm text-off-white/70 mb-4">
                Upload ownership documents, survey plans, valuation reports, and other supporting documents. 
                Files will be stored securely on IPFS.
              </p>
              
              <FileUpload
                onFilesChange={(uploadedFiles) => {
                  const newDocs = uploadedFiles.map(uf => ({
                    id: uf.id,
                    file: uf.file,
                    type: 'other' as const,
                    description: uf.metadata?.description || '',
                    cid: uf.cid,
                    ipfsUrl: uf.ipfsUrl,
                    status: uf.status,
                    error: uf.error
                  }));
                  setDocuments(prev => [...prev, ...newDocs]);
                }}
                onFileUpload={(result) => {
                  toast({
                    variant: "success",
                    title: "Document Uploaded",
                    description: "Document uploaded successfully to IPFS"
                  });
                }}
                maxFiles={10}
                maxSize={50 * 1024 * 1024} // 50MB
                acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png']}
                category="verification_document"
                description="Upload verification documents"
              />

              {documents.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-md font-semibold text-off-white">Uploaded Documents</h4>
                  {documents.map((doc) => (
                    <Card key={doc.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-electric-mint" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-off-white">{doc.file.name}</p>
                            <div className="flex space-x-2 mt-2">
                              <select
                                value={doc.type}
                                onChange={(e) => updateDocument(doc.id, { type: e.target.value as any })}
                                className="px-2 py-1 bg-dark-gray border border-medium-gray rounded text-xs text-off-white"
                              >
                                {documentTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                              <Input
                                value={doc.description}
                                onChange={(e) => updateDocument(doc.id, { description: e.target.value })}
                                placeholder="Description (optional)"
                                className="text-xs"
                              />
                            </div>
                            {doc.status === 'completed' && doc.cid && (
                              <p className="text-xs text-neon-green mt-1">
                                ✓ Uploaded to IPFS: {doc.cid}
                              </p>
                            )}
                            {doc.status === 'error' && (
                              <p className="text-xs text-red-400 mt-1">
                                ✗ {doc.error}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.status === 'completed' && doc.cid && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewFile({
                                cid: doc.cid!,
                                fileName: doc.file.name,
                                fileType: doc.file.type,
                                fileSize: doc.file.size
                              })}
                              className="text-electric-mint hover:text-neon-green"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-off-white mb-4">Asset Photos</h3>
              <p className="text-sm text-off-white/70 mb-4">
                Upload clear photos of your asset from different angles. 
                Photos will be stored securely on IPFS.
              </p>
              
              <FileUpload
                onFilesChange={(uploadedFiles) => {
                  const newPhotos = uploadedFiles.map(uf => ({
                    id: uf.id,
                    file: uf.file,
                    description: uf.metadata?.description || '',
                    cid: uf.cid,
                    ipfsUrl: uf.ipfsUrl,
                    status: uf.status,
                    error: uf.error
                  }));
                  setPhotos(prev => [...prev, ...newPhotos]);
                }}
                onFileUpload={(result) => {
                  toast({
                    variant: "success",
                    title: "Photo Uploaded",
                    description: "Photo uploaded successfully to IPFS"
                  });
                }}
                maxFiles={20}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/*']}
                category="verification_photo"
                description="Upload asset photos"
              />

              {photos.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-md font-semibold text-off-white">Uploaded Photos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <Card key={photo.id} className="p-4">
                        <div className="space-y-3">
                          <div className="aspect-square bg-dark-gray rounded-lg flex items-center justify-center overflow-hidden">
                            {photo.status === 'completed' && photo.ipfsUrl ? (
                              <img
                                src={photo.ipfsUrl}
                                alt={photo.description}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <img
                                src={URL.createObjectURL(photo.file)}
                                alt={photo.description}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-off-white truncate">{photo.file.name}</p>
                            <Input
                              value={photo.description}
                              onChange={(e) => updatePhoto(photo.id, { description: e.target.value })}
                              placeholder="Photo description"
                              className="text-xs"
                            />
                            {photo.status === 'completed' && photo.cid && (
                              <p className="text-xs text-neon-green">
                                ✓ Uploaded to IPFS
                              </p>
                            )}
                            {photo.status === 'error' && (
                              <p className="text-xs text-red-400">
                                ✗ {photo.error}
                              </p>
                            )}
                            <div className="flex space-x-2">
                              {photo.status === 'completed' && photo.cid && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewFile({
                                    cid: photo.cid!,
                                    fileName: photo.file.name,
                                    fileType: photo.file.type,
                                    fileSize: photo.file.size
                                  })}
                                  className="flex-1 text-electric-mint hover:text-neon-green"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePhoto(photo.id)}
                                className="flex-1 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload All Button */}
            {(documents.some(d => d.status === 'pending') || photos.some(p => p.status === 'pending')) && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={uploadAllFiles}
                  className="bg-neon-green hover:bg-electric-mint text-black"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload All Files to IPFS
                </Button>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <VerificationTiers 
              assetValue={parseFloat(formData.valuation.estimatedValue) || 0}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-off-white mb-4">Review Your Submission</h3>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-off-white mb-2">Asset Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-off-white/70">Type:</span>
                      <span className="ml-2 text-off-white">
                        {assetTypes.find(t => t.value === formData.assetType)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-off-white/70">Name:</span>
                      <span className="ml-2 text-off-white">{formData.assetName}</span>
                    </div>
                    <div>
                      <span className="text-off-white/70">Size:</span>
                      <span className="ml-2 text-off-white">
                        {formData.specifications.size} {formData.specifications.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-off-white/70">Location:</span>
                      <span className="ml-2 text-off-white">
                        {formData.location.city}, {formData.location.state}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-off-white mb-2">Ownership & Valuation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-off-white/70">Owner:</span>
                      <span className="ml-2 text-off-white">{formData.ownership.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-off-white/70">Ownership:</span>
                      <span className="ml-2 text-off-white">
                        {formData.ownership.ownershipPercentage}% {formData.ownership.ownershipType}
                      </span>
                    </div>
                    <div>
                      <span className="text-off-white/70">Estimated Value:</span>
                      <span className="ml-2 text-off-white">
                        {formData.valuation.estimatedValue} {formData.valuation.currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-off-white/70">Valuator:</span>
                      <span className="ml-2 text-off-white">{formData.valuation.valuator || 'Not specified'}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-off-white mb-2">Supporting Materials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-off-white/70">Documents:</span>
                      <span className="ml-2 text-off-white">{documents.length} files</span>
                    </div>
                    <div>
                      <span className="text-off-white/70">Photos:</span>
                      <span className="ml-2 text-off-white">{photos.length} files</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-neon-green mt-0.5" />
                <div>
                  <h4 className="font-semibold text-neon-green">Ready to Submit</h4>
                  <p className="text-sm text-off-white/70 mt-1">
                    Your asset verification request is complete. Once submitted, our team of professional attestors will review your asset and provide verification within 3-5 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <TrendingUp className="w-16 h-16 text-neon-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-off-white mb-2">Hedera Tokenization</h3>
              <p className="text-off-white/70">Creating blockchain token for your asset on Hedera network</p>
            </div>

            {!tokenizationResult ? (
              <div className="text-center">
                <div className="mb-6">
                  <Loader2 className="w-12 h-12 text-neon-green mx-auto animate-spin mb-4" />
                  <h4 className="text-xl font-semibold text-off-white mb-2">Tokenizing Asset...</h4>
                  <p className="text-off-white/70">This may take a few moments while we create your token on the Hedera network</p>
                </div>
                
                <div className="max-w-md mx-auto">
                  <div className="bg-dark-card/50 border border-neon-green/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-off-white/70">Asset Name:</span>
                      <span className="text-off-white font-semibold">{formData.assetName}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-off-white/70">Token Supply:</span>
                      <span className="text-neon-green font-semibold">{formData.valuation.estimatedValue?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-off-white/70">Total Value:</span>
                      <span className="text-neon-green font-semibold">{formData.valuation.estimatedValue?.toLocaleString()} {formData.valuation.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : tokenizationResult.success ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-neon-green mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-neon-green mb-2">
                  {tokenizationResult.verificationTier === 'INSTANT' ? 'Instant Tokenization Complete!' : 'Tokenization Successful!'}
                </h4>
                <p className="text-off-white/70 mb-6">
                  {tokenizationResult.verificationTier === 'INSTANT' 
                    ? 'Your asset was instantly verified and tokenized on the Hedera network'
                    : 'Your asset has been successfully tokenized on the Hedera network'
                  }
                </p>
                
                <div className="max-w-lg mx-auto space-y-4">
                  <Card className="bg-dark-card/50 border-neon-green/20">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-off-white/70">Token ID:</span>
                          <span className="text-neon-green font-mono text-sm">{tokenizationResult.tokenId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-off-white/70">Transaction ID:</span>
                          <span className="text-off-white font-mono text-sm">{tokenizationResult.transactionId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-off-white/70">Status:</span>
                          <span className="text-neon-green font-semibold">Active</span>
                        </div>
                        {tokenizationResult.verificationTier && (
                          <div className="flex items-center justify-between">
                            <span className="text-off-white/70">Verification Tier:</span>
                            <span className="text-neon-green font-semibold">
                              {tokenizationResult.verificationTier}
                            </span>
                          </div>
                        )}
                        {tokenizationResult.processingTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-off-white/70">Processing Time:</span>
                            <span className="text-neon-green font-semibold">
                              {tokenizationResult.processingTime < 1 
                                ? `${Math.round(tokenizationResult.processingTime * 60)} seconds`
                                : `${Math.round(tokenizationResult.processingTime)} minutes`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => window.location.href = '/dashboard/assets'}
                      className="px-6 py-3"
                    >
                      View My Assets
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/dashboard'}
                      className="px-6 py-3"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-red-500 mb-2">Tokenization Failed</h4>
                <p className="text-off-white/70 mb-6">There was an error creating your token on the Hedera network</p>
                
                <Button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.assetType !== '';
      case 2:
        return formData.assetName !== '' && formData.description !== '' && formData.location.address !== '';
      case 3:
        return formData.ownership.ownerName !== '' && formData.valuation.estimatedValue !== '';
      case 4:
        return documents.length > 0 || photos.length > 0;
      case 5:
        return true; // Verification tiers step - always can proceed
      case 6:
        return true; // Review step - always can proceed
      case 7:
        return tokenizationResult !== null;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-off-white font-secondary relative overflow-hidden dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,255,255,0.05),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Dashboard', icon: <Home className="w-4 h-4" />, href: '/dashboard' },
              { label: 'Assets', icon: <TrendingUp className="w-4 h-4" />, href: '/dashboard/assets' },
              { label: 'Verify Asset', icon: <Shield className="w-4 h-4" />, current: true }
            ]}
            showBackButton={true}
            backButtonText="Back to Assets"
            onBack={() => window.history.back()}
          />
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-off-white mb-4"
          >
            Create & Tokenize Asset
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-off-white/70"
          >
            Submit your asset for professional verification and tokenization
          </motion.p>
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <StepNavigation
            steps={steps.map(step => ({
              id: step.number.toString(),
              title: step.title,
              description: step.description,
              completed: currentStep > step.number,
              current: currentStep === step.number,
              disabled: false
            }))}
            onStepClick={(stepId) => {
              const stepNumber = parseInt(stepId);
              if (stepNumber <= currentStep || canProceed()) {
                setCurrentStep(stepNumber);
              }
            }}
            className="justify-center"
          />
        </div>

        {/* Main Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-off-white">
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
              <p className="text-off-white/70">
                {steps[currentStep - 1].description}
              </p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < 6 ? (
            <Button
              onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : currentStep === 6 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-neon-green hover:bg-electric-mint text-black"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Create & Tokenize Asset'
              )}
            </Button>
          ) : (
            <Button
              onClick={() => window.location.href = '/dashboard/assets'}
              className="px-8 py-3"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View My Assets
            </Button>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview
          cid={previewFile.cid}
          fileName={previewFile.fileName}
          fileType={previewFile.fileType}
          fileSize={previewFile.fileSize}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default AssetVerification;
