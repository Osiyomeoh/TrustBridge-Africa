/**
 * Activity Tracker
 * Tracks marketplace activities (sales, listings, transfers)
 */

export interface Activity {
  id: string;
  type: 'sale' | 'listing' | 'unlisting' | 'offer' | 'offer_accepted' | 'offer_rejected' | 'transfer';
  assetTokenId: string;
  assetName: string;
  assetImage?: string;
  from?: string;
  to?: string;
  price?: number;
  timestamp: string;
  transactionId?: string;
}

/**
 * Track a new activity
 * Note: Activities are now stored on HCS (Hedera Consensus Service), not localStorage
 */
export const trackActivity = (activity: Omit<Activity, 'id' | 'timestamp'>): Activity => {
  const newActivity: Activity = {
    ...activity,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };

  // Activities are submitted to HCS in the component calling this function
  // No localStorage storage needed
  console.log('📊 Activity tracked (HCS):', newActivity.type, newActivity.assetName);
  
  return newActivity;
};

/**
 * Get all activities from Hedera Mirror Node
 * Queries recent NFT transfers involving the marketplace
 */
export const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const marketplaceAccount = '0.0.6916959';
    const mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
    
    // Query recent transactions for the marketplace account
    const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${marketplaceAccount}/nfts?limit=50&order=desc`);
    
    if (!response.ok) {
      console.warn('Failed to fetch marketplace activities');
      return [];
    }
    
    const data = await response.json();
    const activities: Activity[] = [];
    
    // Process each NFT to find transfers
    for (const nft of data.nfts || []) {
      try {
        // Get transaction history for this NFT
        const txResponse = await fetch(`${mirrorNodeUrl}/api/v1/tokens/${nft.token_id}/nfts/${nft.serial_number}/transactions?limit=5&order=desc`);
        if (txResponse.ok) {
          const txData = await txResponse.json();
          
          for (const tx of txData.transactions || []) {
            // Get detailed transaction
            const detailResponse = await fetch(`${mirrorNodeUrl}/api/v1/transactions/${tx.transaction_id}`);
            if (detailResponse.ok) {
              const detail = await detailResponse.json();
              const nftTransfer = detail.transactions?.[0]?.nft_transfers?.find((t: any) =>
                t.token_id === nft.token_id && t.serial_number === nft.serial_number
              );
              
              if (nftTransfer) {
                const isListing = nftTransfer.receiver_account_id === marketplaceAccount;
                const isSale = nftTransfer.sender_account_id === marketplaceAccount;
                
                if (isListing || isSale) {
                  activities.push({
                    id: tx.transaction_id,
                    type: isListing ? 'listing' : 'sale',
                    assetTokenId: nft.token_id,
                    assetName: `NFT #${nft.serial_number}`,
                    from: nftTransfer.sender_account_id,
                    to: nftTransfer.receiver_account_id,
                    price: 100, // Default price, could be extracted from memo
                    timestamp: new Date(parseFloat(tx.consensus_timestamp) * 1000).toISOString(),
                    transactionId: tx.transaction_id
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn('Failed to process NFT activity:', error);
      }
    }
    
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Failed to fetch activities from Hedera:', error);
    return [];
  }
};

/**
 * Get recent activities (last N)
 */
export const getRecentActivities = async (limit: number = 20): Promise<Activity[]> => {
  const activities = await getAllActivities();
  return activities.slice(0, limit);
};

/**
 * Get activities for a specific asset
 */
export const getAssetActivities = async (assetTokenId: string): Promise<Activity[]> => {
  const activities = await getAllActivities();
  return activities.filter(a => a.assetTokenId === assetTokenId);
};

/**
 * Get activities by type
 */
export const getActivitiesByType = async (type: Activity['type']): Promise<Activity[]> => {
  const activities = await getAllActivities();
  return activities.filter(a => a.type === type);
};

/**
 * Get activities for a user (as buyer or seller)
 */
export const getUserActivities = async (accountId: string): Promise<Activity[]> => {
  const activities = await getAllActivities();
  return activities.filter(a => 
    a.from?.toLowerCase() === accountId.toLowerCase() || 
    a.to?.toLowerCase() === accountId.toLowerCase()
  );
};

/**
 * Get activity statistics
 */
export const getActivityStats = async () => {
  const activities = await getAllActivities();
  
  const sales = activities.filter(a => a.type === 'sale');
  const listings = activities.filter(a => a.type === 'listing');
  const offers = activities.filter(a => a.type === 'offer');
  
  const totalVolume = sales.reduce((sum, a) => sum + (a.price || 0), 0);
  const avgSalePrice = sales.length > 0 ? totalVolume / sales.length : 0;
  
  // Get unique traders
  const traders = new Set<string>();
  activities.forEach(a => {
    if (a.from) traders.add(a.from);
    if (a.to) traders.add(a.to);
  });
  
  return {
    totalSales: sales.length,
    totalListings: listings.length,
    totalOffers: offers.length,
    totalVolume,
    avgSalePrice,
    uniqueTraders: traders.size,
    last24hSales: sales.filter(a => 
      new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length
  };
};

/**
 * Format activity for display
 */
export const formatActivity = (activity: Activity): string => {
  switch (activity.type) {
    case 'sale':
      return `${activity.assetName} sold for ${activity.price} TRUST`;
    case 'listing':
      return `${activity.assetName} listed for ${activity.price} TRUST`;
    case 'unlisting':
      return `${activity.assetName} unlisted`;
    case 'offer':
      return `Offer of ${activity.price} TRUST made on ${activity.assetName}`;
    case 'offer_accepted':
      return `Offer accepted for ${activity.assetName}`;
    case 'offer_rejected':
      return `Offer rejected for ${activity.assetName}`;
    case 'transfer':
      return `${activity.assetName} transferred`;
    default:
      return `Activity on ${activity.assetName}`;
  }
};

/**
 * Get time ago string
 */
export const getTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

