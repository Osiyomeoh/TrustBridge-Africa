import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Tag, MapPin, Calendar, User, TrendingUp, Share2, Heart, Loader2 } from 'lucide-react';
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
} from '@hashgraph/sdk';

/**
 * Marketplace Asset Modal
 * Optimized for DISCOVERY - focused on buying, viewing, and making offers
 * Used in AssetMarketplace.tsx
 */

interface MarketplaceAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  onAssetUpdate?: () => void;
}

const MarketplaceAssetModal: React.FC<MarketplaceAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  onAssetUpdate
}) => {
  const { toast } = useToast();
  const { accountId, signer, hederaClient } = useWallet();
  
  const [isBuying, setIsBuying] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDuration, setOfferDuration] = useState('7');
  const [isMakingOffer, setIsMakingOffer] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [marketplaceListingStatus, setMarketplaceListingStatus] = useState<{
    isListed: boolean;
    listingId: number;
    isLoading: boolean;
    seller?: string;
  }>({ isListed: false, listingId: 0, isLoading: true });
  const [actualOwner, setActualOwner] = useState<string | null>(null);

  // Use owner from blockchain data only (no localStorage)
  useEffect(() => {
    if (!asset?.tokenId || !isOpen) return;
    setActualOwner(asset.owner);
  }, [asset?.tokenId, asset?.owner, isOpen]);

  // Check if current user is the owner or seller
  // If listed: check against seller (who listed it)
  // If not listed: check against current owner
  const isOwner = accountId && (
    (marketplaceListingStatus.isListed && marketplaceListingStatus.seller && 
     (marketplaceListingStatus.seller.toLowerCase() === accountId.toLowerCase() || 
      marketplaceListingStatus.seller === accountId)) ||
    (!marketplaceListingStatus.isListed && actualOwner && 
     (actualOwner.toLowerCase() === accountId.toLowerCase() || 
      actualOwner === accountId))
  );

  // Check marketplace listing status - ALWAYS query blockchain state
  useEffect(() => {
    const checkMarketplaceStatus = async () => {
      if (!asset?.tokenId || !isOpen) return;
      
      try {
        setMarketplaceListingStatus(prev => ({ ...prev, isLoading: true }));
        
        // Query backend for verified blockchain state
        const response = await fetch(`http://localhost:4001/api/assets/blockchain-state/${asset.tokenId}/${asset.serialNumber || '1'}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blockchain state');
        }
        
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Verified listing status from blockchain:`, data.data);
          
          // Update actual owner based on blockchain
          setActualOwner(data.data.owner);
          
          setMarketplaceListingStatus({
            isListed: data.data.isListed,
            listingId: data.data.isListed ? 1 : 0, // If in escrow, it's listed
            seller: data.data.seller, // Track who listed it
            isLoading: false
          });
        } else {
          throw new Error('Invalid response from blockchain state API');
        }
      } catch (error) {
        console.error('Failed to check marketplace status:', error);
        setMarketplaceListingStatus({
          isListed: false,
          listingId: 0,
          isLoading: false
        });
      }
    };
    
    checkMarketplaceStatus();
  }, [isOpen, asset?.tokenId, asset?.serialNumber]);

  // Check if favorited
  useEffect(() => {
    // TODO: Load favorites from backend/Hedera (not localStorage)
    setIsFavorited(false);
  }, [asset?.tokenId, accountId]);

  // Helper: Submit event to HCS
  const submitToHCS = async (event: any) => {
    try {
      await apiService.post('/hedera/hcs/marketplace/event', event);
      console.log('📋 Event submitted to HCS:', event.type);
    } catch (error) {
      console.warn('⚠️ Failed to submit to HCS (non-critical):', error);
    }
  };

  const handleToggleFavorite = () => {
    // TODO: Store favorites on backend/Hedera (not localStorage)
    toast({
      title: 'Coming Soon',
      description: 'Favorites feature will be implemented with blockchain storage',
      variant: 'default'
    });
  };

  const handleBuyAsset = async () => {
    try {
      setIsBuying(true);
      
      if (!accountId || !signer || !hederaClient) {
        throw new Error('Please connect your wallet to buy assets');
      }

      // Check if asset is actually listed on marketplace
      if (!marketplaceListingStatus.isListed || marketplaceListingStatus.listingId === 0) {
        throw new Error('This asset is not currently listed for sale on the marketplace.');
      }

      // Prevent seller from buying their own listing
      if (marketplaceListingStatus.seller && 
          (marketplaceListingStatus.seller.toLowerCase() === accountId.toLowerCase() || 
           marketplaceListingStatus.seller === accountId)) {
        throw new Error('You cannot buy your own listing. Please unlist it first if you want to remove it from sale.');
      }

      const assetPrice = parseFloat(asset.price || asset.totalValue || '100');
      const listingId = marketplaceListingStatus.listingId;
      
      // Check buyer's TRUST balance
      const buyerBalance = await TrustTokenService.hybridGetTrustTokenBalance(accountId);
      
      console.log('🔍 Balance check:', {
        buyerBalance: buyerBalance,
        assetPrice: assetPrice,
        hasEnough: buyerBalance >= assetPrice
      });
      
      if (buyerBalance < assetPrice) {
        throw new Error(`Insufficient TRUST tokens. You need ${assetPrice} TRUST but only have ${buyerBalance} TRUST.`);
      }

      console.log('💰 Buying asset:', {
        asset: asset.name,
        price: assetPrice,
        listingId: listingId,
        from: accountId,
        to: asset.owner
      });

      // Use HTS direct transfer (marketplace contract doesn't work for HTS NFTs)
      console.log('🛒 Executing buy with HTS direct transfer:');
      console.log('   Token:', asset.tokenId, 'Serial:', asset.serialNumber);
      console.log('   From:', asset.owner, 'To:', accountId);
      
      const { TransferTransaction, TokenId, AccountId, TokenAssociateTransaction } = await import('@hashgraph/sdk');
      
      // Calculate fees and royalties
      const platformFeePercent = 2.5; // 2.5% platform fee
      const royaltyPercentage = parseFloat(asset.royaltyPercentage || asset.metadata?.royaltyPercentage || '0');
      const totalPrice = parseFloat(assetPrice);
      
      const marketplaceAccount = '0.0.6916959';
      const trustTokenId = '0.0.6935064';
      
      // Step 1: Transfer TRUST tokens
      console.log('💸 Step 1/3: Transferring TRUST tokens...');
      
      const { Hbar } = await import('@hashgraph/sdk');
      
      // Create TRUST token transfers with royalty distribution
      // Use toFixed(8) to ensure exactly 8 decimal places
      const exactPlatformFee = Number.parseFloat(((totalPrice * platformFeePercent) / 100).toFixed(8));
      const exactRoyaltyAmount = Number.parseFloat(((totalPrice * royaltyPercentage) / 100).toFixed(8));
      
      // Calculate seller amount as exact remainder to guarantee zero-sum
      const exactSellerAmount = Number.parseFloat((totalPrice - exactPlatformFee - exactRoyaltyAmount).toFixed(8));
      
      // Debug transfer amounts
      console.log('🔍 Transfer amounts:', {
        fromBuyer: -totalPrice,
        toSeller: exactSellerAmount,
        toSellerRoyalty: exactRoyaltyAmount,
        toPlatform: exactPlatformFee,
        sum: -totalPrice + exactSellerAmount + exactRoyaltyAmount + exactPlatformFee,
        zeroSumCheck: {
          totalPrice: totalPrice,
          exactPlatformFee: exactPlatformFee,
          exactRoyaltyAmount: exactRoyaltyAmount,
          exactSellerAmount: exactSellerAmount,
          calculated: totalPrice - exactPlatformFee - exactRoyaltyAmount,
          remainder: totalPrice - exactPlatformFee - exactRoyaltyAmount - exactSellerAmount,
          isExactlyZero: (-totalPrice + exactSellerAmount + exactRoyaltyAmount + exactPlatformFee) === 0
        },
        percentageCheck: {
          royaltyPercentage: royaltyPercentage + '%',
          platformFeePercent: platformFeePercent + '%',
          royaltyCalculation: `${totalPrice} * ${royaltyPercentage} / 100 = ${exactRoyaltyAmount}`,
          platformCalculation: `${totalPrice} * ${platformFeePercent} / 100 = ${exactPlatformFee}`
        }
      });
      
      // Use separate transfers to avoid zero-sum validation
      // Transfer 1: From buyer to seller (base payment + royalty)
      const sellerTransferTx = new TransferTransaction()
        .addTokenTransfer(trustTokenId, accountId, -(exactSellerAmount + exactRoyaltyAmount)) // From buyer
        .addTokenTransfer(trustTokenId, asset.owner, exactSellerAmount + exactRoyaltyAmount) // To seller
        .setMaxTransactionFee(new Hbar(2));

      // Transfer 2: From buyer to platform
      const platformTransferTx = new TransferTransaction()
        .addTokenTransfer(trustTokenId, accountId, -exactPlatformFee) // From buyer
        .addTokenTransfer(trustTokenId, marketplaceAccount, exactPlatformFee) // To platform
        .setMaxTransactionFee(new Hbar(2));

      if (exactRoyaltyAmount > 0) {
        const totalSellerAmount = exactSellerAmount + exactRoyaltyAmount;
        console.log(`👑 Seller receives ${exactSellerAmount.toFixed(8)} TRUST base + ${exactRoyaltyAmount.toFixed(8)} TRUST royalty = ${totalSellerAmount.toFixed(8)} TRUST total`);
        sellerTransferTx.setTransactionMemo(`Buy: ${asset.name} | Seller: ${exactSellerAmount.toFixed(8)} + Royalty: ${exactRoyaltyAmount.toFixed(8)}`);
        platformTransferTx.setTransactionMemo(`Buy: ${asset.name} | Platform: ${exactPlatformFee.toFixed(8)}`);
      } else {
        console.log(`💵 Seller receives ${exactSellerAmount.toFixed(8)} TRUST (no royalty)`);
        sellerTransferTx.setTransactionMemo(`Buy: ${asset.name} | Seller: ${exactSellerAmount.toFixed(8)}`);
        platformTransferTx.setTransactionMemo(`Buy: ${asset.name} | Platform: ${exactPlatformFee.toFixed(8)}`);
      }
      
      // Execute seller transfer
      sellerTransferTx.freezeWithSigner(signer);
      const signedSellerTx = await signer.signTransaction(sellerTransferTx);
      const sellerTxResponse = await signedSellerTx.execute(hederaClient);
      await sellerTxResponse.getReceipt(hederaClient);
      
      // Execute platform transfer
      platformTransferTx.freezeWithSigner(signer);
      const signedPlatformTx = await signer.signTransaction(platformTransferTx);
      const platformTxResponse = await signedPlatformTx.execute(hederaClient);
      await platformTxResponse.getReceipt(hederaClient);
      console.log('✅ TRUST paid:', sellerTxResponse.transactionId.toString(), platformTxResponse.transactionId.toString());
      
      // Step 2: Associate token
      console.log('🔗 Step 2/3: Associating NFT token...');
      try {
        const associateTx = new TokenAssociateTransaction()
          .setAccountId(accountId)
          .setTokenIds([TokenId.fromString(asset.tokenId)])
          .setMaxTransactionFee(new Hbar(2));
        
        associateTx.freezeWithSigner(signer);
        const signedAssociateTx = await signer.signTransaction(associateTx);
        const associateResponse = await signedAssociateTx.execute(hederaClient);
        await associateResponse.getReceipt(hederaClient);
        console.log('✅ Token associated:', associateResponse.transactionId.toString());
      } catch (associateError: any) {
        if (associateError.message?.includes('TOKEN_ALREADY_ASSOCIATED')) {
          console.log('✅ Token already associated');
        } else {
          console.error('❌ Association failed:', associateError.message);
          throw new Error(`Token association failed: ${associateError.message}`);
        }
      }
      
      // Step 3: Call backend to transfer NFT from marketplace escrow to buyer
      console.log('🎨 Step 3/3: Requesting NFT transfer from marketplace escrow...');
      console.log('   NFT is held by marketplace (0.0.6916959)');
      console.log('   Backend will transfer from marketplace → buyer');
      
      const nftTransferResult = await apiService.post('/hedera/marketplace/transfer-nft', {
        nftTokenId: asset.tokenId,
        serialNumber: asset.serialNumber,
        buyerAccountId: accountId,
        listingId: listingId
      });
      
      console.log('✅ NFT transferred from escrow:', nftTransferResult.data.transactionId);
      
      const buyResult = {
        transactionId: nftTransferResult.data.transactionId,
        sellerTransactionId: sellerTxResponse.transactionId.toString(),
        platformTransactionId: platformTxResponse.transactionId.toString(),
        platformFee: exactPlatformFee.toString()
      };

      console.log('🎉 Purchase completed:', buyResult);
      
      // Show royalty information in console
      if (exactRoyaltyAmount > 0) {
        const totalSellerAmount = exactSellerAmount + exactRoyaltyAmount;
        console.log(`👑 Royalty included: ${exactRoyaltyAmount.toFixed(2)} TRUST in seller payment`);
        console.log(`💵 Seller received: ${exactSellerAmount.toFixed(2)} TRUST base + ${exactRoyaltyAmount.toFixed(2)} TRUST royalty = ${totalSellerAmount.toFixed(2)} TRUST total`);
      } else {
        console.log(`💵 Seller received: ${exactSellerAmount.toFixed(2)} TRUST`);
      }
      console.log(`💰 Platform fee: ${exactPlatformFee.toFixed(2)} TRUST`);

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

      // Submit to HCS
      await submitToHCS({
        type: 'sale',
        assetTokenId: asset.tokenId,
        assetName: asset.name,
        from: asset.owner,
        to: accountId,
        price: assetPrice,
        royalty: exactRoyaltyAmount,
        timestamp: new Date().toISOString(),
        transactionId: buyResult.transactionId
      });

      // No localStorage - blockchain is source of truth
      
      // Update actualOwner state immediately
      setActualOwner(accountId);

      toast({
        title: 'Purchase Successful! 🎉',
        description: exactRoyaltyAmount > 0 
          ? `You've successfully purchased ${asset.name}! ${royaltyPercentage}% royalty (${exactRoyaltyAmount.toFixed(2)} TRUST) was sent to the creator.`
          : `You've successfully purchased ${asset.name} for ${assetPrice} TRUST tokens!`,
        variant: 'default'
      });

      // Close modal immediately
      onClose();
      
      // Refresh marketplace after modal closes
      if (onAssetUpdate) {
        setTimeout(() => {
          onAssetUpdate();
        }, 500);
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

      // Store offer on HCS only (no localStorage)

      // Submit to HCS
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

  if (!isOpen || !asset) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-off-white">{asset.name}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorited
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'bg-gray-800 text-gray-400 hover:text-pink-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-off-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
                  <img
                    src={asset.imageURI || asset.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231a1a1a"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2300ff88" text-anchor="middle" dy=".3em">NFT</text></svg>'}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231a1a1a"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2300ff88" text-anchor="middle" dy=".3em">NFT</text></svg>';
                    }}
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-midnight-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Owner</p>
                    <p className="text-sm font-bold text-off-white truncate">
                      {actualOwner?.slice(0, 6)}...{actualOwner?.slice(-4) || ''}
                    </p>
                  </div>
                  <div className="bg-midnight-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Token ID</p>
                    <p className="text-sm font-bold text-neon-green truncate">
                      {asset.tokenId?.slice(4, 10)}
                    </p>
                  </div>
                  <div className="bg-midnight-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className={`text-sm font-bold ${marketplaceListingStatus.isListed ? 'text-neon-green' : 'text-gray-400'}`}>
                      {marketplaceListingStatus.isLoading ? '...' : marketplaceListingStatus.isListed ? 'For Sale' : 'Not Listed'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Details & Actions */}
              <div className="space-y-4">
                {/* Price */}
                <div className="bg-gradient-to-br from-neon-green/10 to-emerald-500/10 rounded-xl p-4 border border-neon-green/30">
                  <p className="text-sm text-gray-400 mb-1">Price</p>
                  <p className="text-3xl font-bold text-neon-green">
                    {asset.price || asset.totalValue || '100'} TRUST
                  </p>
                </div>

                {/* Description */}
                {asset.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-off-white mb-2">Description</h3>
                    <p className="text-sm text-gray-400">{asset.description}</p>
                  </div>
                )}

                {/* Details */}
                <div>
                  <h3 className="text-sm font-semibold text-off-white mb-2">Details</h3>
                  <div className="space-y-2">
                    {asset.category && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Category</span>
                        <span className="text-off-white">{asset.category}</span>
                      </div>
                    )}
                    {asset.location && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Location</span>
                        <span className="text-off-white">{asset.location}</span>
                      </div>
                    )}
                    {asset.createdAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Created</span>
                        <span className="text-off-white">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - BUYER FOCUSED */}
                <div className="flex flex-col gap-3 pt-4">
                  {isOwner ? (
                    // If owner, show minimal message
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-xs text-blue-400 text-center">
                        You own this asset. Go to your Profile to manage it.
                      </p>
                    </div>
                  ) : (
                    // Buyer actions
                    <>
                      <Button
                        variant="neon"
                        className="w-full"
                        onClick={handleBuyAsset}
                        disabled={isBuying || !marketplaceListingStatus.isListed || marketplaceListingStatus.isLoading}
                      >
                        {isBuying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Buying...
                          </>
                        ) : marketplaceListingStatus.isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Checking availability...
                          </>
                        ) : !marketplaceListingStatus.isListed ? (
                          'Not Listed for Sale'
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Buy Now for {asset.price || asset.totalValue || '100'} TRUST
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowOfferModal(true)}
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        Make Offer
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const publicUrl = `${window.location.origin}/asset/${asset.tokenId}`;
                            navigator.clipboard.writeText(publicUrl);
                            toast({
                              title: 'Link Copied!',
                              description: 'Asset link copied to clipboard',
                              variant: 'default'
                            });
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>

                        <a
                          href={`https://hashscan.io/testnet/token/${asset.tokenId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Hashscan
                          </Button>
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Offer Modal */}
            {showOfferModal && (
              <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700">
                  <h3 className="text-xl font-bold text-off-white mb-4">Make an Offer</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Offer Price (TRUST)
                      </label>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        className="w-full px-4 py-2 bg-midnight-800 border border-gray-700 rounded-lg text-off-white"
                        placeholder="Enter offer amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Offer Duration
                      </label>
                      <select
                        value={offerDuration}
                        onChange={(e) => setOfferDuration(e.target.value)}
                        className="w-full px-4 py-2 bg-midnight-800 border border-gray-700 rounded-lg text-off-white"
                      >
                        <option value="1">1 Day</option>
                        <option value="3">3 Days</option>
                        <option value="7">7 Days</option>
                        <option value="14">14 Days</option>
                        <option value="30">30 Days</option>
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowOfferModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="neon"
                        className="flex-1"
                        onClick={handleMakeOffer}
                        disabled={isMakingOffer}
                      >
                        {isMakingOffer ? 'Submitting...' : 'Submit Offer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MarketplaceAssetModal;

