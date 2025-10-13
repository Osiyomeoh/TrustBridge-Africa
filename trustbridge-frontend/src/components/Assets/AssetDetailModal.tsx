import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ExternalLink, Copy, Tag, MapPin, Calendar, User, TrendingUp, Share2, Heart, Edit, Send, Loader2, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import { useToast } from '../../hooks/useToast';
import { useWallet } from '../../contexts/WalletContext';
import { TrustTokenService } from '../../services/trust-token.service';
import { marketplaceContractService } from '../../services/marketplace-contract.service';
import { trackActivity } from '../../utils/activityTracker';
import { apiService } from '../../services/api';
import { 
  TransferTransaction, 
  TokenId, 
  AccountId, 
  Hbar,
  AccountAllowanceApproveTransaction,
  NftId
} from '@hashgraph/sdk';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  onAssetUpdate?: () => void; // Callback to refresh assets after listing/unlisting
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ isOpen, onClose, asset, onAssetUpdate }) => {
  const { toast } = useToast();
  const { accountId, signer, hederaClient } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBuying, setIsBuying] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [isUnlisting, setIsUnlisting] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDuration, setOfferDuration] = useState('7'); // Default 7 days
  const [isMakingOffer, setIsMakingOffer] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [assetOffers, setAssetOffers] = useState<any[]>([]);
  const [showOffersSection, setShowOffersSection] = useState(false);

  // Check if asset is favorited on mount
  useEffect(() => {
    if (!asset?.tokenId || !accountId) return;
    
    const favorites = JSON.parse(localStorage.getItem('favoritedAssets') || '{}');
    const userFavorites = favorites[accountId] || [];
    setIsFavorited(userFavorites.includes(asset.tokenId));
  }, [asset?.tokenId, accountId]);

  // Load offers for this asset
  useEffect(() => {
    if (!asset?.tokenId || !isOpen) return;
    
    const allOffers = JSON.parse(localStorage.getItem('assetOffers') || '[]');
    const offersForAsset = allOffers.filter((offer: any) => 
      offer.assetTokenId === asset.tokenId && 
      offer.status === 'pending' &&
      new Date(offer.expiresAt) > new Date() // Not expired
    );
    
    // Sort by price (highest first)
    offersForAsset.sort((a: any, b: any) => b.offerPrice - a.offerPrice);
    
    setAssetOffers(offersForAsset);
    console.log('💼 Loaded offers for asset:', offersForAsset.length);
  }, [asset?.tokenId, isOpen]);
  
  // Marketplace listing state
  const [marketplaceListingStatus, setMarketplaceListingStatus] = useState<{
    isListed: boolean;
    listingId: number;
    isLoading: boolean;
  }>({
    isListed: false,
    listingId: 0,
    isLoading: true
  });
  
  // Local state for optimistic UI updates
  const [localListingStatus, setLocalListingStatus] = useState<boolean | null>(null);
  
  // Check if current user is the owner
  const isOwner = asset?.owner && accountId && 
    (asset.owner.toLowerCase() === accountId.toLowerCase() || 
     asset.owner === accountId);
  
  // Debug logging
  console.log('🔍 AssetDetailModal - Owner check:', {
    assetOwner: asset?.owner,
    currentAccount: accountId,
    isOwner,
    assetName: asset?.name
  });
  
  // Check if user is marketplace account (cannot list own assets due to SPENDER_ACCOUNT_SAME_AS_OWNER)
  const isMarketplaceAccount = accountId === '0.0.6916959';
  
  // Determine listing status (prioritize: local optimistic > marketplace contract > localStorage)
  const isListed = localListingStatus !== null 
    ? localListingStatus 
    : marketplaceListingStatus.isListed;

  // Debug logging
  console.log('🔍 Asset listing status check:', {
    assetName: asset?.name,
    localListingStatus,
    marketplaceIsListed: marketplaceListingStatus.isListed,
    marketplaceListingId: marketplaceListingStatus.listingId,
    isLoading: marketplaceListingStatus.isLoading,
    finalIsListed: isListed
  });

  // Check marketplace listing status - ALWAYS query blockchain state
  useEffect(() => {
    const checkMarketplaceStatus = async () => {
      if (!isOpen || !asset?.tokenId) {
        return;
      }

      try {
        // Reset local optimistic state when checking fresh
        setLocalListingStatus(null);
        
        console.log('🔍 Verifying blockchain state for listing status...');
        setMarketplaceListingStatus(prev => ({ ...prev, isLoading: true }));

        // Query backend for verified blockchain state
        const response = await fetch(`http://localhost:4001/api/assets/blockchain-state/${asset.tokenId}/${asset.serialNumber || '1'}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blockchain state');
        }
        
        const data = await response.json();
        if (data.success) {
          console.log('✅ Verified listing status from blockchain:', data.data);
          
          setMarketplaceListingStatus({
            isListed: data.data.isListed,
            listingId: data.data.isListed ? 1 : 0, // If in escrow, it's listed
            isLoading: false
          });
        } else {
          throw new Error('Invalid response from blockchain state API');
        }

        // No localStorage - blockchain is source of truth
      } catch (error) {
        console.error('❌ Failed to verify blockchain status:', error);
        console.warn('⚠️ Cannot verify marketplace status - blockchain query failed');
        
        // On query error, assume not listed
        setMarketplaceListingStatus({
          isListed: false,
          listingId: 0,
          isLoading: false
        });
      }
    };

    checkMarketplaceStatus();
  }, [isOpen, asset?.tokenId, asset?.serialNumber]);

  if (!isOpen || !asset) return null;

  const handleListAsset = async () => {
    try {
      setIsListing(true);
      
      if (!accountId || !signer || !hederaClient) {
        throw new Error('Please connect your wallet to list assets');
      }

      console.log('📋 Listing asset - transferring to marketplace escrow:', asset.name);

      // ESCROW MODEL: Transfer NFT to marketplace, marketplace holds it until sold
      const marketplaceAccountId = '0.0.6916959'; // Marketplace escrow account

      console.log('🏦 Transferring NFT to marketplace escrow:', {
        nft: asset.tokenId,
        serial: asset.serialNumber,
        from: accountId,
        to: marketplaceAccountId
      });

      // Transfer NFT from seller to marketplace escrow
      const transferTx = new TransferTransaction()
        .addNftTransfer(
          TokenId.fromString(asset.tokenId),
          parseInt(asset.serialNumber || '1'),
          AccountId.fromString(accountId), // From seller
          AccountId.fromString(marketplaceAccountId) // To marketplace escrow
        )
        .setTransactionMemo(`List for sale: ${asset.name}`)
        .setMaxTransactionFee(new Hbar(2));

      // Freeze the transaction before signing
      console.log('🧊 Freezing transaction...');
      transferTx.freezeWithSigner(signer);
      
      // Sign and execute the transfer
      console.log('✍️ Signing transfer to escrow...');
      let signedTx;
      try {
        signedTx = await signer.signTransaction(transferTx);
      } catch (signError: any) {
        if (signError.message?.includes('session') || signError.message?.includes('deleted')) {
          throw new Error('Wallet session expired. Please disconnect and reconnect your wallet.');
        }
        throw signError;
      }
      
      console.log('📡 Executing transfer...');
      const response = await signedTx.execute(hederaClient);
      console.log('⏳ Getting receipt...');
      const receipt = await response.getReceipt(hederaClient);

      console.log('✅ NFT transferred to marketplace escrow:', response.transactionId.toString());

      // ESCROW MODEL: Transfer to marketplace = Listed
      // No smart contract call needed - the escrow transfer IS the listing
      console.log('✅ Asset is now LISTED (in escrow)');

      // Update UI optimistically
      setLocalListingStatus(true);

      // Update marketplace status state
      setMarketplaceListingStatus({
        isListed: true,
        listingId: 1, // In escrow = listed
        isLoading: false
      });

      // No localStorage - blockchain is source of truth

      // Track activity
      trackActivity({
        type: 'listing',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        assetImage: asset.imageURI || asset.image,
        from: accountId,
        price: assetPrice,
        transactionId: response.transactionId.toString()
      });

      // Submit to HCS for immutable audit trail
      await submitToHCS({
        type: 'listing',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        from: accountId,
        price: assetPrice,
        timestamp: new Date().toISOString(),
        transactionId: response.transactionId.toString()
      });

      toast({
        title: 'Asset Listed on Marketplace!',
        description: `${asset.name} is now available for purchase on the decentralized marketplace.`,
        variant: 'default'
      });

      // Trigger asset refresh callback
      if (onAssetUpdate) {
        setTimeout(() => {
          onAssetUpdate();
          onClose(); // Close modal after update
        }, 1500);
      }

    } catch (error: any) {
      console.error('Failed to list asset:', error);
      
      let errorMessage = error instanceof Error ? error.message : 'Failed to create blockchain listing';
      let errorTitle = 'Listing Failed';
      
      // Check for session-related errors
      if (error.message?.includes('session') || error.message?.includes('deleted') || error.message?.includes('Record was recently deleted')) {
        errorTitle = '🔄 Wallet Session Expired';
        errorMessage = 'Your HashPack session has expired. Please disconnect and reconnect your wallet in the header, then try listing again.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 8000 // Show longer for session errors
      });
    } finally {
      setIsListing(false);
    }
  };

  const handleUnlistAsset = async () => {
    try {
      setIsUnlisting(true);

      if (!accountId || !signer || !hederaClient) {
        throw new Error('Please connect your wallet to unlist assets');
      }

      console.log('🔓 Unlisting asset - requesting return from marketplace escrow:', asset.name);

      // Call backend to transfer NFT back from marketplace escrow to seller
      console.log('📞 Calling backend to return NFT from escrow...');
      const cancelResult = await apiService.post('/hedera/marketplace/return-nft', {
        nftTokenId: asset.tokenId,
        serialNumber: parseInt(asset.serialNumber || '1'),
        sellerAccountId: accountId
      });

      console.log('✅ NFT returned from escrow:', cancelResult.data.transactionId);
      
      // Optimistic UI update - immediately show as unlisted after transaction executes
      setLocalListingStatus(false);

      // Update marketplace status state
      setMarketplaceListingStatus({
        isListed: false,
        listingId: 0,
        isLoading: false
      });

      // No localStorage - blockchain is source of truth

      // Track activity
      trackActivity({
        type: 'unlisting',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        assetImage: asset.imageURI || asset.image,
        from: accountId,
        transactionId: cancelResult.transactionId
      });

      // Submit to HCS for immutable audit trail
      await submitToHCS({
        type: 'unlisting',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        from: accountId,
        timestamp: new Date().toISOString(),
        transactionId: cancelResult.transactionId
      });

      toast({
        title: 'Asset Unlisted from Marketplace!',
        description: `${asset.name} is no longer for sale on the decentralized marketplace.`,
        variant: 'default'
      });

      // Trigger asset refresh callback
      if (onAssetUpdate) {
        setTimeout(() => {
          onAssetUpdate();
          onClose(); // Close modal after update
        }, 1500);
      }

    } catch (error) {
      console.error('Failed to unlist asset:', error);
      toast({
        title: 'Unlisting Failed',
        description: error instanceof Error ? error.message : 'Failed to remove blockchain listing',
        variant: 'destructive'
      });
    } finally {
      setIsUnlisting(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!accountId) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to favorite assets',
        variant: 'default'
      });
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favoritedAssets') || '{}');
    const userFavorites = favorites[accountId] || [];
    
    if (isFavorited) {
      // Remove from favorites
      favorites[accountId] = userFavorites.filter((id: string) => id !== asset.tokenId);
      setIsFavorited(false);
      toast({
        title: 'Removed from Favorites',
        description: `${asset.name} removed from your watchlist`,
        variant: 'default'
      });
    } else {
      // Add to favorites
      favorites[accountId] = [...userFavorites, asset.tokenId];
      setIsFavorited(true);
      toast({
        title: 'Added to Favorites!',
        description: `${asset.name} added to your watchlist`,
        variant: 'default'
      });
    }
    
    localStorage.setItem('favoritedAssets', JSON.stringify(favorites));
  };

  // Helper: Submit event to HCS for immutable audit trail
  const submitToHCS = async (event: any) => {
    try {
      await apiService.post('/hedera/hcs/marketplace/event', event);
      console.log('📋 Event submitted to HCS:', event.type);
    } catch (error) {
      console.warn('⚠️ Failed to submit to HCS (non-critical):', error);
      // Don't throw - HCS submission failure shouldn't block operations
    }
  };

  const handleAcceptOffer = async (offer: any) => {
    try {
      console.log('✅ Accepting offer:', offer);

      // Call marketplace buy with the offer price
      const buyResult = await marketplaceContractService.buyNFT(
        marketplaceListingStatus.listingId || 0,
        offer.buyer,
        offer.offerPrice,
        accountId!,
        signer
      );

      // Update offer status
      const allOffers = JSON.parse(localStorage.getItem('assetOffers') || '[]');
      const updatedOffers = allOffers.map((o: any) => 
        o.offerId === offer.offerId 
          ? { ...o, status: 'accepted', acceptedAt: new Date().toISOString() }
          : o
      );
      localStorage.setItem('assetOffers', JSON.stringify(updatedOffers));

      // Reload offers
      setAssetOffers(assetOffers.filter(o => o.offerId !== offer.offerId));

      // Submit to HCS for immutable audit trail
      await submitToHCS({
        type: 'offer_accepted',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        from: accountId,
        to: offer.buyer,
        price: offer.offerPrice,
        timestamp: new Date().toISOString()
      });

      toast({
        title: 'Offer Accepted!',
        description: `You accepted the offer of ${offer.offerPrice} TRUST from ${offer.buyer.slice(0, 6)}...`,
        variant: 'default'
      });

      // Trigger refresh
      if (onAssetUpdate) {
        setTimeout(() => onAssetUpdate(), 1500);
      }
    } catch (error) {
      console.error('Failed to accept offer:', error);
      toast({
        title: 'Accept Failed',
        description: error instanceof Error ? error.message : 'Failed to accept offer',
        variant: 'destructive'
      });
    }
  };

  const handleRejectOffer = async (offer: any) => {
    console.log('❌ Rejecting offer:', offer);

    // Update offer status
    const allOffers = JSON.parse(localStorage.getItem('assetOffers') || '[]');
    const updatedOffers = allOffers.map((o: any) => 
      o.offerId === offer.offerId 
        ? { ...o, status: 'rejected', rejectedAt: new Date().toISOString() }
        : o
    );
    localStorage.setItem('assetOffers', JSON.stringify(updatedOffers));

    // Reload offers
    setAssetOffers(assetOffers.filter(o => o.offerId !== offer.offerId));

    // Submit to HCS for immutable audit trail
    await submitToHCS({
      type: 'offer_rejected',
      assetTokenId: asset.tokenId,
      assetName: asset.name,
      from: accountId,
      to: offer.buyer,
      price: offer.offerPrice,
      timestamp: new Date().toISOString()
    });

    toast({
      title: 'Offer Rejected',
      description: `You rejected the offer of ${offer.offerPrice} TRUST`,
      variant: 'default'
    });
  };

  const handleMakeOffer = async () => {
    try {
      setIsMakingOffer(true);

      if (!accountId) {
        throw new Error('Please connect your wallet to make an offer');
      }

      const price = parseFloat(offerPrice);
      if (!price || price <= 0) {
        throw new Error('Please enter a valid offer price');
      }

      console.log('💼 Making offer on asset:', {
        asset: asset.name,
        offerPrice: price,
        duration: offerDuration,
        buyer: accountId
      });

      // Store offer in localStorage (will be moved to smart contract or backend)
      const offers = JSON.parse(localStorage.getItem('assetOffers') || '[]');
      const newOffer = {
        offerId: Date.now(),
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        buyer: accountId,
        seller: asset.owner,
        offerPrice: price,
        duration: parseInt(offerDuration),
        expiresAt: new Date(Date.now() + parseInt(offerDuration) * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending' // pending, accepted, rejected, expired
      };

      offers.push(newOffer);
      localStorage.setItem('assetOffers', JSON.stringify(offers));

      // Submit to HCS for immutable audit trail
      await submitToHCS({
        type: 'offer',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        from: accountId,
        to: asset.owner,
        price: price,
        timestamp: new Date().toISOString()
      });

      toast({
        title: 'Offer Submitted!',
        description: `Your offer of ${price} TRUST for ${asset.name} has been sent to the seller.`,
        variant: 'default'
      });

      setShowOfferModal(false);
      setOfferPrice('');

    } catch (error) {
      console.error('Failed to make offer:', error);
      toast({
        title: 'Offer Failed',
        description: error instanceof Error ? error.message : 'Failed to submit offer',
        variant: 'destructive'
      });
    } finally {
      setIsMakingOffer(false);
    }
  };

  const handleBuyAsset = async () => {
    try {
      setIsBuying(true);
      
      if (!accountId || !signer || !hederaClient) {
        throw new Error('Please connect your wallet to buy assets');
      }

      // Check if asset is listed for sale
      if (!asset.isListed) {
        throw new Error('This asset is not currently listed for sale');
      }

      const assetPrice = parseFloat(asset.price || asset.totalValue || '100');
      
      // Step 1: Check buyer's TRUST balance
      const buyerBalance = await TrustTokenService.hybridGetTrustTokenBalance(accountId);
      
      if (buyerBalance < assetPrice) {
        throw new Error(`Insufficient TRUST tokens. You need ${assetPrice} TRUST but only have ${buyerBalance} TRUST.`);
      }

      console.log('💰 Buying asset:', {
        asset: asset.name,
        price: assetPrice,
        from: accountId,
        to: asset.owner
      });

      // Use listing ID from marketplace contract state
      const listingId = marketplaceListingStatus.listingId;

      if (!listingId || listingId === 0) {
        throw new Error('Asset is not listed on the marketplace');
      }

      // Call marketplace contract to buy NFT
      // This handles:
      // 1. TRUST token transfer (buyer → seller + platform fee)
      // Use HTS direct transfer instead of smart contract (HTS NFTs cannot be transferred via Solidity)
      console.log('🛒 Buying NFT using HTS direct transfer:');
      console.log('   Asset:', asset.name);
      console.log('   Token ID:', asset.tokenId);
      console.log('   Serial Number:', asset.serialNumber);
      console.log('   Price:', assetPrice, 'TRUST');
      console.log('   From:', asset.owner);
      console.log('   To:', accountId);
      
      // Calculate platform fee (5%)
      const platformFeePercent = 5;
      const platformFee = Math.floor((parseFloat(assetPrice) * platformFeePercent) / 100);
      const sellerAmount = parseFloat(assetPrice) - platformFee;
      const marketplaceAccount = '0.0.6916959'; // Platform treasury
      const trustTokenId = '0.0.6935064'; // TRUST token ID (correct)
      
      console.log('💰 Payment breakdown:');
      console.log('   Total price:', assetPrice, 'TRUST');
      console.log('   Platform fee (5%):', platformFee, 'TRUST');
      console.log('   Seller receives:', sellerAmount, 'TRUST');
      
      // Step 1: Transfer TRUST tokens (buyer -> seller + marketplace)
      const trustTransferTx = new TransferTransaction()
        .addTokenTransfer(trustTokenId, accountId, -parseFloat(assetPrice)) // Debit from buyer
        .addTokenTransfer(trustTokenId, asset.owner, sellerAmount) // Credit to seller
        .addTokenTransfer(trustTokenId, marketplaceAccount, platformFee) // Platform fee
        .setTransactionMemo(`Buy: ${asset.name}`)
        .freezeWithSigner(signer);
      
      console.log('💸 Step 1/3: Transferring TRUST tokens...');
      console.log('   ⚠️ This will open HashPack for approval');
      const signedTrustTx = await signer.signTransaction(trustTransferTx);
      const trustTxResponse = await signedTrustTx.execute(hederaClient);
      await trustTxResponse.getReceipt(hederaClient);
      console.log('✅ TRUST tokens transferred:', trustTxResponse.transactionId.toString());
      console.log('   View: https://hashscan.io/testnet/transaction/' + trustTxResponse.transactionId.toString());
      
      // Step 2: Associate token if needed (buyer must be associated with the NFT token)
      console.log('🔗 Step 2/3: Associating NFT token...');
      console.log('   Token to associate:', asset.tokenId);
      try {
        const { TokenAssociateTransaction } = await import('@hashgraph/sdk');
        console.log('   ⚠️ This will open HashPack for approval');
        const associateTx = new TokenAssociateTransaction()
          .setAccountId(accountId)
          .setTokenIds([TokenId.fromString(asset.tokenId)])
          .freezeWithSigner(signer);
        
        const signedAssociateTx = await signer.signTransaction(associateTx);
        const associateResponse = await signedAssociateTx.execute(hederaClient);
        await associateResponse.getReceipt(hederaClient);
        console.log('✅ Token associated:', associateResponse.transactionId.toString());
        console.log('   View: https://hashscan.io/testnet/transaction/' + associateResponse.transactionId.toString());
      } catch (associateError: any) {
        // If already associated, that's fine
        if (associateError.message?.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
          console.log('✅ Token already associated - skipping');
        } else {
          console.error('❌ Token association FAILED:', associateError.message);
          throw new Error(`Token association failed: ${associateError.message}`);
        }
      }
      
      // Step 3: Transfer NFT (seller -> buyer using allowance)
      console.log('🎨 Step 3/3: Transferring NFT...');
      console.log('   NFT:', asset.tokenId, 'Serial:', asset.serialNumber);
      console.log('   From:', asset.owner);
      console.log('   To:', accountId);
      console.log('   ⚠️ This will open HashPack for approval');
      
      const nftTransferTx = new TransferTransaction()
        .addApprovedNftTransfer(TokenId.fromString(asset.tokenId), asset.serialNumber, AccountId.fromString(asset.owner), AccountId.fromString(accountId))
        .setTransactionMemo(`NFT Transfer: ${asset.name}`)
        .freezeWithSigner(signer);
      
      const signedNftTx = await signer.signTransaction(nftTransferTx);
      const nftTxResponse = await signedNftTx.execute(hederaClient);
      await nftTxResponse.getReceipt(hederaClient);
      console.log('✅ NFT transferred:', nftTxResponse.transactionId.toString());
      console.log('   View: https://hashscan.io/testnet/transaction/' + nftTxResponse.transactionId.toString());
      console.log('');
      console.log('🎉 BUY COMPLETED SUCCESSFULLY!');
      
      const buyResult = {
        transactionId: nftTxResponse.transactionId.toString(),
        trustTransactionId: trustTxResponse.transactionId.toString(),
        platformFee: platformFee.toString()
      };

      console.log('✅ NFT purchase completed:', buyResult);
      
      // Optimistic UI update - immediately show as unlisted after purchase
      setLocalListingStatus(false);

      // Update marketplace status state
      setMarketplaceListingStatus({
        isListed: false,
        listingId: 0,
        isLoading: false
      });

      toast({
        title: 'Purchase Successful!',
        description: `You've successfully purchased ${asset.name} for ${assetPrice} TRUST tokens! Platform fee: ${buyResult.platformFee} TRUST.`,
        variant: 'default'
      });

      // No localStorage - blockchain is source of truth

      // Track activity
      trackActivity({
        type: 'sale',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        assetImage: asset.imageURI || asset.image,
        from: asset.owner,
        to: accountId,
        price: assetPrice,
        transactionId: buyResult.transactionId
      });

      // Submit to HCS for immutable audit trail
      await submitToHCS({
        type: 'sale',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        from: asset.owner,
        to: accountId,
        price: assetPrice,
        timestamp: new Date().toISOString(),
        transactionId: buyResult.transactionId
      });

      // Trigger asset refresh callback and navigate to profile if needed
      if (onAssetUpdate) {
        // Wait longer for Mirror Node to update (5 seconds)
        setTimeout(() => {
          onAssetUpdate();
          
          // Store a flag in sessionStorage to trigger profile refresh
          sessionStorage.setItem('profileNeedsRefresh', 'true');
          
          toast({
            title: 'Asset Acquired!',
            description: 'Visit your Profile page to see your new asset.',
            variant: 'default'
          });
          
          onClose(); // Close modal after update
        }, 5000);
      }

    } catch (error) {
      console.error('Failed to buy asset:', error);
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Failed to purchase asset',
        variant: 'destructive'
      });
    } finally {
      setIsBuying(false);
    }
  };

  const handleCopyTokenId = () => {
    navigator.clipboard.writeText(asset.tokenId);
    toast({
      title: 'Copied!',
      description: 'Token ID copied to clipboard',
      variant: 'default'
    });
  };

  const handleViewOnHashscan = () => {
    window.open(`https://hashscan.io/testnet/token/${asset.tokenId}`, '_blank');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/asset/${asset.tokenId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied!',
      description: 'Asset link copied to clipboard',
      variant: 'default'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-midnight-900 border border-midnight-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-midnight-900 border-b border-midnight-700 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-off-white">{asset.name}</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-midnight-800 hover:bg-midnight-700 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Image */}
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-midnight-800">
                  {asset.imageURI ? (
                    <img
                      src={asset.imageURI}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag className="w-24 h-24 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewOnHashscan}
                    className="flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="text-xs">Hashscan</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    <span className="text-xs">Share</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className={`flex items-center justify-center gap-1 transition-all ${
                      isFavorited ? 'bg-red-500/20 border-red-500/40 text-red-400' : ''
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-400' : ''}`} />
                    <span className="text-xs">{isFavorited ? 'Favorited' : 'Favorite'}</span>
                  </Button>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Price Card */}
                <Card className="bg-gradient-to-br from-neon-green/10 to-emerald-500/10 border-neon-green/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Current Price</span>
                      <TrendingUp className="w-4 h-4 text-neon-green" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-neon-green">
                        {asset.price || asset.totalValue || '100'}
                      </span>
                      <span className="text-lg text-electric-mint">TRUST</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      ≈ ${parseFloat(asset.price || asset.totalValue || '100') * 0.01} USD
                    </p>
                  </CardContent>
                </Card>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-off-white mb-2">Description</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {asset.description || 'No description available'}
                  </p>
                </div>

                {/* Asset Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-off-white">Asset Details</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Token ID */}
                    <div className="bg-midnight-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Token ID</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-off-white truncate">
                          {asset.tokenId}
                        </span>
                        <button
                          onClick={handleCopyTokenId}
                          className="p-1 hover:bg-midnight-700 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Serial Number */}
                    {asset.serialNumber && (
                      <div className="bg-midnight-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Serial #</span>
                        </div>
                        <span className="text-xs font-mono text-off-white">
                          #{asset.serialNumber}
                        </span>
                      </div>
                    )}

                    {/* Owner */}
                    <div className="bg-midnight-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Owner</span>
                      </div>
                      <span className="text-xs font-mono text-off-white truncate">
                        {asset.owner ? `${asset.owner.slice(0, 8)}...${asset.owner.slice(-6)}` : 'Unknown'}
                      </span>
                    </div>

                    {/* Location */}
                    {asset.location && (
                      <div className="bg-midnight-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Location</span>
                        </div>
                        <span className="text-xs text-off-white">
                          {asset.location}
                        </span>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="bg-midnight-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Created</span>
                      </div>
                      <span className="text-xs text-off-white">
                        {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>

                    {/* Category */}
                    {asset.category && (
                      <div className="bg-midnight-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Category</span>
                        </div>
                        <span className="text-xs text-off-white">
                          {asset.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Properties */}
                {asset.royaltyPercentage && (
                  <div>
                    <h3 className="text-sm font-semibold text-off-white mb-2">Properties</h3>
                    <div className="bg-midnight-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Royalty</span>
                        <span className="text-xs text-off-white font-medium">
                          {asset.royaltyPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Offers Section - Only show for owners */}
                {isOwner && assetOffers.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowOffersSection(!showOffersSection)}
                      className="flex items-center justify-between w-full text-sm font-semibold text-off-white mb-2 hover:text-neon-green transition-colors"
                    >
                      <span>Offers ({assetOffers.length})</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showOffersSection ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showOffersSection && (
                      <div className="space-y-2">
                        {assetOffers.map((offer) => (
                          <div
                            key={offer.offerId}
                            className="bg-midnight-800 rounded-lg p-3 border border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-bold text-neon-green">
                                  {offer.offerPrice} TRUST
                                </p>
                                <p className="text-xs text-gray-400">
                                  from {offer.buyer.slice(0, 6)}...{offer.buyer.slice(-4)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">
                                  Expires in {Math.ceil((new Date(offer.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
                                </p>
                              </div>
                            </div>
                            
                            {/* Accept/Reject Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="neon"
                                className="flex-1 text-xs"
                                onClick={() => handleAcceptOffer(offer)}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs"
                                onClick={() => handleRejectOffer(offer)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Trading Status */}
                <div className="flex items-center gap-2">
                  {isListed ? (
                    <span className="px-3 py-1 bg-neon-green/20 text-neon-green text-xs font-medium rounded-full">
                      Listed for Sale
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full">
                      Not Listed
                    </span>
                  )}
                  {asset.status === 'active' && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {isOwner ? (
                    // Owner actions
                    <>
                      {/* Only show listing buttons for non-marketplace accounts */}
                      {!isMarketplaceAccount && (
                        <>
                          {isListed ? (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={handleUnlistAsset}
                              disabled={isUnlisting}
                            >
                              {isUnlisting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Unlisting...
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Unlist from Sale
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="neon"
                              className="flex-1"
                              onClick={handleListAsset}
                              disabled={isListing}
                            >
                              {isListing ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Listing...
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  List for Sale
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: 'Coming Soon',
                            description: 'Transfer functionality will be available soon',
                            variant: 'default'
                          });
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Transfer
                      </Button>
                    </>
                  ) : (
                    // Buyer actions
                    <>
                      <Button
                        variant="neon"
                        className="flex-1"
                        onClick={handleBuyAsset}
                        disabled={isBuying || !isListed}
                      >
                        {isBuying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Purchasing...
                          </>
                        ) : isListed ? (
                          `Buy for ${asset.price || asset.totalValue || '100'} TRUST`
                        ) : (
                          'Not Listed for Sale'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowOfferModal(true)}
                      >
                        Make Offer
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Make Offer Modal */}
      {showOfferModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-midnight-900 rounded-xl border border-gray-800 max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-off-white">Make an Offer</h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-2 hover:bg-midnight-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Asset Info */}
              <div className="bg-midnight-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Making offer on</p>
                <p className="text-lg font-semibold text-off-white">{asset.name}</p>
                {isListed && (
                  <p className="text-sm text-gray-400 mt-2">
                    Current Price: <span className="text-neon-green font-medium">{asset.price || '100'} TRUST</span>
                  </p>
                )}
              </div>

              {/* Offer Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Offer Price (TRUST)
                </label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Enter offer amount"
                  min="1"
                  className="w-full px-4 py-3 bg-midnight-800 border border-gray-700 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green"
                />
                {isListed && offerPrice && (
                  <p className="text-xs text-gray-400 mt-1">
                    {parseFloat(offerPrice) < parseFloat(asset.price || '100') 
                      ? `${(100 - (parseFloat(offerPrice) / parseFloat(asset.price || '100')) * 100).toFixed(0)}% below listing price`
                      : `${((parseFloat(offerPrice) / parseFloat(asset.price || '100')) * 100 - 100).toFixed(0)}% above listing price`
                    }
                  </p>
                )}
              </div>

              {/* Offer Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Offer Duration
                </label>
                <select
                  value={offerDuration}
                  onChange={(e) => setOfferDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-midnight-800 border border-gray-700 rounded-lg text-off-white focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green"
                >
                  <option value="1">1 Day</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                </select>
              </div>

              {/* Summary */}
              <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  Your offer of <span className="text-neon-green font-bold">{offerPrice || '0'} TRUST</span> will be valid for{' '}
                  <span className="text-neon-green font-bold">{offerDuration} days</span>.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  The seller can accept your offer at any time during this period.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOfferModal(false);
                    setOfferPrice('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="neon"
                  onClick={handleMakeOffer}
                  disabled={isMakingOffer || !offerPrice || parseFloat(offerPrice) <= 0}
                  className="flex-1"
                >
                  {isMakingOffer ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Offer'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssetDetailModal;

