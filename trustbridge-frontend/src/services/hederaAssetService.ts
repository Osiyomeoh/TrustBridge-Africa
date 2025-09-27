import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';

// Import ABIs from contract artifacts
import TRUSTAssetFactoryABI from '../contracts/TRUSTAssetFactory.json';
import AttestorVerificationSystemABI from '../contracts/AttestorVerificationSystem.json';

// Use imported ABIs
const TRUST_ASSET_FACTORY_ABI = TRUSTAssetFactoryABI.abi;
const ATTESTOR_VERIFICATION_SYSTEM_ABI = AttestorVerificationSystemABI.abi;

// Note: Using ATTESTOR_VERIFICATION_SYSTEM_ABI instead of PROFESSIONAL_ATTESTOR_ABI

export interface HederaAsset {
  id: string;
  assetId: string;
  owner: string;
  category: number;
  assetType: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  totalValue: string;
  maturityDate: string;
  verificationScore: number;
  isActive: boolean;
  createdAt: string;
  nftContract: string;
  tokenId: string;
  verificationLevel: number;
  evidenceHashes: string[];
  documentTypes: string[];
  createdAtDate: Date;
  valueInHbar: number;
  verification?: AssetVerificationStatus;
}

export interface AssetVerificationStatus {
  assetId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  submittedAt: string;
  completedAt?: string;
  attestorName?: string;
  score?: number;
}

class HederaAssetService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private attestorContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.hederaRpcUrl);
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESSES.trustAssetFactory,
      TRUST_ASSET_FACTORY_ABI,
      this.provider
    );
    this.attestorContract = new ethers.Contract(
      CONTRACT_ADDRESSES.attestorVerificationSystem,
      ATTESTOR_VERIFICATION_SYSTEM_ABI,
      this.provider
    );
  }

  /**
   * Get all assets for a specific wallet address
   */
  async getUserAssets(walletAddress: string): Promise<HederaAsset[]> {
    try {
      console.log('🔍 Fetching assets from Hedera for wallet:', walletAddress);
      
      // Get asset IDs for the user
      const assetIds = await this.contract.getUserAssets(walletAddress);
      console.log(`📊 Found ${assetIds.length} assets for wallet`);

      if (assetIds.length === 0) {
        return [];
      }

      const assets: HederaAsset[] = [];

      // Fetch all assets in parallel for faster loading
      const assetPromises = assetIds.map(async (assetId: string, index: number) => {
        try {
          console.log(`🔍 Fetching asset ${index + 1}/${assetIds.length}: ${assetId}`);

          // Get asset data and evidence in parallel
          const [assetData, evidenceData] = await Promise.allSettled([
            this.contract.getAsset(assetId),
            this.contract.getAssetEvidence(assetId).catch(() => ({ value: [[], []] }))
          ]);

          if (assetData.status === 'rejected') {
            throw new Error(`Failed to get asset data: ${assetData.reason}`);
          }

          const asset = assetData.value;
          const evidence = evidenceData.status === 'fulfilled' ? evidenceData.value : [[], []];

          // Convert values and create asset object
          const totalValue = asset.totalValue.toString();
          const valueInHbar = Number(totalValue) / 100000000; // Convert tinybar to HBAR

          // Parse location string into object
          let locationObj = {
            address: asset.location,
            city: 'Unknown',
            state: 'Unknown',
            country: 'Unknown'
          };

          // Try to parse location if it's JSON
          try {
            const parsedLocation = JSON.parse(asset.location);
            if (parsedLocation && typeof parsedLocation === 'object') {
              locationObj = {
                address: parsedLocation.address || asset.location,
                city: parsedLocation.city || 'Unknown',
                state: parsedLocation.state || 'Unknown',
                country: parsedLocation.country || 'Unknown'
              };
            }
          } catch (e) {
            // If parsing fails, use the string as address
            locationObj.address = asset.location;
          }

          const hederaAsset: HederaAsset = {
            id: asset.id,
            assetId: assetId,
            owner: asset.owner,
            category: asset.category,
            assetType: asset.assetType,
            name: asset.name,
            location: locationObj,
            totalValue: totalValue,
            maturityDate: asset.maturityDate.toString(),
            verificationScore: Number(asset.verificationScore),
            isActive: asset.isActive,
            createdAt: asset.createdAt.toString(),
            nftContract: asset.nftContract,
            tokenId: asset.tokenId.toString(),
            verificationLevel: Number(asset.verificationLevel),
            evidenceHashes: evidence[0] || [],
            documentTypes: evidence[1] || [],
            createdAtDate: new Date(Number(asset.createdAt) * 1000),
            valueInHbar
          };

          console.log(`✅ Asset ${index + 1}: ${hederaAsset.name} (${hederaAsset.assetType}) - ${hederaAsset.valueInHbar} HBAR`);
          return hederaAsset;

        } catch (error: unknown) {
          console.error(`❌ Error fetching asset ${index + 1}:`, error);
          return null;
        }
      });

      // Wait for all assets to load
      const assetResults = await Promise.all(assetPromises);
      
      // Filter out null results and add to assets array
      const validAssets = assetResults.filter(asset => asset !== null) as HederaAsset[];
      assets.push(...validAssets);

      console.log(`🎉 Successfully fetched ${assets.length} assets from Hedera`);
      return assets;

    } catch (error) {
      console.error('❌ Error fetching user assets:', error);
      throw new Error(`Failed to fetch assets: ${error.message}`);
    }
  }

  /**
   * Get total number of assets tokenized
   */
  async getTotalAssetsTokenized(): Promise<number> {
    try {
      const total = await this.contract.totalAssetsTokenized();
      return Number(total);
    } catch (error) {
      console.error('❌ Error getting total assets:', error);
      return 0;
    }
  }

  /**
   * Get verification status for an asset from the smart contract
   */
  async getAssetVerificationStatus(assetId: string, walletAddress?: string, forceRefresh: boolean = false): Promise<AssetVerificationStatus | null> {
    try {
      console.log('🔍 getAssetVerificationStatus called with:', { assetId, walletAddress, forceRefresh });
      
      if (!window.ethereum) {
        console.warn('Wallet not connected');
        return null;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get asset verification level from TRUSTAssetFactory
      const assetFactoryContract = new ethers.Contract(
        CONTRACT_ADDRESSES.trustAssetFactory,
        TRUST_ASSET_FACTORY_ABI,
        provider
      );

      try {
        const asset = await assetFactoryContract.getAsset(assetId);
        console.log('📋 Asset data from contract:', asset);
        
        // Check verification level (0=Basic, 1=Professional, 2=Expert, 3=Master)
        const verificationLevel = Number(asset.verificationLevel);
        console.log('🔍 Asset verification level:', verificationLevel);
        
        if (verificationLevel > 0) {
          return {
            status: 'completed',
            level: verificationLevel,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Smart Contract',
            comments: `Verified at level ${verificationLevel}`
          };
        } else {
          // Check if there are pending verification requests
          const attestorContract = new ethers.Contract(
            CONTRACT_ADDRESSES.attestorVerificationSystem,
            ATTESTOR_VERIFICATION_SYSTEM_ABI,
            provider
          );

          try {
            const userRequests = await attestorContract.getUserRequests(walletAddress || '');
            console.log('📋 User verification requests:', userRequests);
            
            // Check if this asset has a pending request
            for (const requestId of userRequests) {
              const request = await attestorContract.getVerificationRequest(requestId);
              if (request[2] === assetId) { // assetId is at index 2
                const status = Number(request[8]); // status is at index 8
                console.log('🔍 Found verification request for asset:', { requestId, status });
                
                if (status === 0) { // PENDING
                  return {
                    status: 'pending',
                    level: 0,
                    requestedAt: new Date(Number(request[6]) * 1000).toISOString(),
                    deadline: new Date(Number(request[7]) * 1000).toISOString(),
                    requestId: requestId
                  };
                } else if (status === 1) { // APPROVED
                  return {
                    status: 'completed',
                    level: 1,
                    verifiedAt: new Date(Number(request[6]) * 1000).toISOString(),
                    verifiedBy: request[11] || 'Unknown', // assignedAttestor is at index 11
                    requestId: requestId
                  };
                } else if (status === 2) { // REJECTED
                  return {
                    status: 'rejected',
                    level: 0,
                    rejectedAt: new Date(Number(request[6]) * 1000).toISOString(),
                    rejectedBy: request[11] || 'Unknown',
                    requestId: requestId
                  };
                }
              }
            }
          } catch (requestError) {
            console.warn('⚠️ Could not fetch verification requests:', requestError);
          }
        }
        
        // No verification found
        return null;
        
      } catch (assetError) {
        console.warn('⚠️ Could not fetch asset from contract:', assetError);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error fetching verification status:', error);
      return null;
    }
  }

  /**
   * Get all assets with their verification status
   */
  async getUserAssetsWithVerification(walletAddress: string): Promise<(HederaAsset & { verification?: AssetVerificationStatus })[]> {
    try {
      console.log('🔍 Fetching assets and verification status...');
      
      // Get all assets first
      const assets = await this.getUserAssets(walletAddress);
      console.log(`📊 Found ${assets.length} assets, fetching verification status...`);
      
      // Get all verification statuses in parallel with force refresh
      const verificationPromises = assets.map(asset => 
        this.getAssetVerificationStatus(asset.assetId, walletAddress, true).catch(error => {
          console.warn(`⚠️ Could not get verification for asset ${asset.assetId}:`, error);
          return null;
        })
      );
      
      const verifications = await Promise.all(verificationPromises);
      
      // Show all assets from blockchain, with verification status from smart contract
      const assetsWithVerification = assets.map((asset, index) => ({
        ...asset,
        verification: verifications[index] || undefined
      }));

      console.log(`✅ Successfully loaded ${assetsWithVerification.length} assets with verification status from smart contract`);
      return assetsWithVerification;
    } catch (error: unknown) {
      console.error('❌ Error fetching assets with verification:', error);
      throw error;
    }
  }

  /**
   * Get verification requests directly from smart contract only
   */
  async getSmartContractVerificationRequests(userAddress: string): Promise<any[]> {
    try {
      console.log('🔍 Fetching verification requests from smart contract for user:', userAddress);
      
      if (!window.ethereum) {
        console.warn('Wallet not connected');
        return [];
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const attestorContract = new ethers.Contract(
        CONTRACT_ADDRESSES.attestorVerificationSystem,
        ATTESTOR_VERIFICATION_SYSTEM_ABI,
        provider
      );

      // Get all verification requests for the user
      const requestIdsResult = await attestorContract.getUserRequests(userAddress);
      
      // Convert Result object to regular array if needed
      let requestIds = requestIdsResult;
      if (requestIdsResult && typeof requestIdsResult === 'object' && requestIdsResult.constructor.name === 'Result') {
        requestIds = Array.from(requestIdsResult);
      } else if (requestIdsResult && typeof requestIdsResult === 'object' && requestIdsResult.length !== undefined) {
        requestIds = Array.from(requestIdsResult);
      }
      
      console.log('📊 Found', requestIds.length, 'verification requests in smart contract');

      const verificationRequests = [];
      
      for (const requestId of requestIds) {
        try {
          console.log('🔍 Getting request details for:', requestId);
          const request = await attestorContract.getVerificationRequest(requestId);
          console.log('📋 Request details:', request);
          
          // The request is returned as an array, not an object
          // Structure: [requestId, assetOwner, assetId, requiredType, evidenceHashes, documentTypes, requestedAt, deadline, status, comments, fee, assignedAttestor]
          const verificationRequest = {
            requestId: requestId,
            assetId: request[2], // assetId is at index 2
            assetOwner: request[1], // assetOwner is at index 1
            requiredType: Number(request[3]), // requiredType is at index 3
            status: Number(request[8]), // status is at index 8
            requestedAt: new Date(Number(request[6]) * 1000).toISOString(), // requestedAt is at index 6
            deadline: new Date(Number(request[7]) * 1000).toISOString(), // deadline is at index 7
            fee: ethers.formatEther(request[10]), // fee is at index 10
            assignedAttestor: request[11], // assignedAttestor is at index 11
            evidenceHashes: request[4], // evidenceHashes is at index 4
            documentTypes: request[5], // documentTypes is at index 5
            comments: request[9] // comments is at index 9
          };
          
          console.log('✅ Processed verification request:', verificationRequest);
          verificationRequests.push(verificationRequest);
        } catch (error) {
          console.warn('⚠️ Error getting request details for', requestId, ':', error.message);
        }
      }
      
      console.log('✅ Returning', verificationRequests.length, 'verification requests from smart contract');
      return verificationRequests;
    } catch (error: unknown) {
      console.error('❌ Error fetching verification requests from smart contract:', error);
      return [];
    }
  }
}

export const hederaAssetService = new HederaAssetService();
