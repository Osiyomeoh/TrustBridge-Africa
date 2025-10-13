import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Tag, X, Heart, ArrowRightLeft, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../UI/Card';
import { 
  getRecentActivities, 
  getActivityStats, 
  formatActivity, 
  getTimeAgo,
  Activity 
} from '../../utils/activityTracker';

interface ActivityFeedProps {
  limit?: number;
  showStats?: boolean;
  assetTokenId?: string; // Filter by specific asset
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  limit = 20, 
  showStats = true,
  assetTokenId 
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadActivities();
  }, [limit, assetTokenId, refreshKey]);

  const loadActivities = async () => {
    try {
      let loadedActivities = await getRecentActivities(limit);
      
      // Filter by asset if specified
      if (assetTokenId) {
        loadedActivities = loadedActivities.filter(a => a.assetTokenId === assetTokenId);
      }
      
      setActivities(loadedActivities);
      
      if (showStats) {
        const statsData = await getActivityStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
      setActivities([]);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'sale':
        return <TrendingUp className="w-4 h-4 text-neon-green" />;
      case 'listing':
        return <Tag className="w-4 h-4 text-blue-400" />;
      case 'unlisting':
        return <X className="w-4 h-4 text-gray-400" />;
      case 'offer':
        return <Heart className="w-4 h-4 text-pink-400" />;
      case 'offer_accepted':
        return <Heart className="w-4 h-4 text-neon-green" />;
      case 'offer_rejected':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'sale':
        return 'border-l-neon-green';
      case 'listing':
        return 'border-l-blue-400';
      case 'unlisting':
        return 'border-l-gray-400';
      case 'offer':
      case 'offer_accepted':
        return 'border-l-pink-400';
      case 'offer_rejected':
        return 'border-l-red-400';
      case 'transfer':
        return 'border-l-purple-400';
      default:
        return 'border-l-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Section */}
      {showStats && stats && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-off-white mb-3">Marketplace Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-midnight-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">Total Sales</p>
                <p className="text-lg font-bold text-neon-green">{stats.totalSales}</p>
              </div>
              <div className="bg-midnight-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">Volume</p>
                <p className="text-lg font-bold text-off-white">{stats.totalVolume.toFixed(0)} T</p>
              </div>
              <div className="bg-midnight-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">Avg Price</p>
                <p className="text-lg font-bold text-off-white">{stats.avgSalePrice.toFixed(0)} T</p>
              </div>
              <div className="bg-midnight-800 rounded-lg p-3">
                <p className="text-xs text-gray-400">24h Sales</p>
                <p className="text-lg font-bold text-neon-green">{stats.last24hSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-off-white">Recent Activity</h3>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="text-xs text-neon-green hover:text-neon-green/80 transition-colors"
            >
              Refresh
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start gap-3 p-3 bg-midnight-800 rounded-lg border-l-2 ${getActivityColor(activity.type)} hover:bg-midnight-700 transition-colors`}
                >
                  {/* Activity Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-off-white">
                      {formatActivity(activity)}
                    </p>
                    
                    {/* From/To addresses */}
                    {(activity.from || activity.to) && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        {activity.from && (
                          <span>
                            from {activity.from.slice(0, 6)}...{activity.from.slice(-4)}
                          </span>
                        )}
                        {activity.from && activity.to && (
                          <span>→</span>
                        )}
                        {activity.to && (
                          <span>
                            to {activity.to.slice(0, 6)}...{activity.to.slice(-4)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Transaction link */}
                    {activity.transactionId && (
                      <a
                        href={`https://hashscan.io/testnet/transaction/${activity.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-xs text-neon-green hover:text-neon-green/80 transition-colors"
                      >
                        View on Hashscan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Asset Image */}
                  {activity.assetImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={activity.assetImage}
                        alt={activity.assetName}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%231a1a1a"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="%2300ff88" text-anchor="middle" dy=".3em">NFT</text></svg>';
                        }}
                      />
                    </div>
                  )}

                  {/* Time */}
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {getTimeAgo(activity.timestamp)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityFeed;

