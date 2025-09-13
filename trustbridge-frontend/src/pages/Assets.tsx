import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import AssetGallery from '../components/UI/AssetGallery';
import VerificationList from '../components/Verification/VerificationList';
import { Search, Grid, List, Loader2, AlertCircle, Shield, Plus } from 'lucide-react';
import { useAssets, useMarketAnalytics } from '../hooks/useApi';
import { Asset } from '../types/api';

const Assets: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'my-assets' | 'verifications'>('browse');

  // Fetch real data from backend
  const { data: assetsData, loading: assetsLoading, error: assetsError } = useAssets();
  const { data: analyticsData, loading: analyticsLoading } = useMarketAnalytics();

  // Filter assets based on search and filters
  const filteredAssets = useMemo(() => {
    if (!assetsData || typeof assetsData !== 'object' || !('data' in assetsData) || !Array.isArray(assetsData.data)) return [];
    
    return assetsData.data.filter((asset: Asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || asset.type.toLowerCase() === selectedType.toLowerCase();
      const matchesCountry = selectedCountry === 'all' || 
                            asset.location.country.toLowerCase() === selectedCountry.toLowerCase();
      
      return matchesSearch && matchesType && matchesCountry;
    });
  }, [assetsData, searchTerm, selectedType, selectedCountry]);

  // Format stats from real data
  const stats = useMemo(() => {
    if (analyticsLoading || !analyticsData || typeof analyticsData !== 'object' || !('data' in analyticsData) || !analyticsData.data) {
      return [
        { label: 'Total Assets', value: '...', change: '...' },
        { label: 'Total Value', value: '...', change: '...' },
        { label: 'Active Investors', value: '...', change: '...' },
        { label: 'Average APY', value: '...', change: '...' }
      ];
    }

    const data = analyticsData.data as any;
    return [
      { 
        label: 'Total Assets', 
        value: data.totalAssets?.toString() || '0', 
        change: '+12%' 
      },
      { 
        label: 'Total Value', 
        value: `$${(data.totalValueLocked / 1000000).toFixed(1)}M`, 
        change: '+34.2%' 
      },
      { 
        label: 'Active Investors', 
        value: data.activeUsers?.toString() || '0', 
        change: '+18.5%' 
      },
      { 
        label: 'Average APY', 
        value: `${data.averageAPY?.toFixed(1)}%`, 
        change: 'New' 
      }
    ];
  }, [analyticsData, analyticsLoading]);

  const assetTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'agricultural', label: 'Agricultural' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'mining', label: 'Mining' },
    { value: 'manufacturing', label: 'Manufacturing' }
  ];

  const countries = [
    { value: 'all', label: 'All Countries' },
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'kenya', label: 'Kenya' },
    { value: 'south africa', label: 'South Africa' },
    { value: 'ghana', label: 'Ghana' },
    { value: 'ethiopia', label: 'Ethiopia' }
  ];

  // Show loading state
  if (assetsLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8 dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-neon-green mx-auto mb-4" />
            <p className="text-lg text-off-white/70">Loading African assets...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (assetsError) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8 dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-off-white/70 mb-2">Failed to load assets</p>
            <p className="text-sm text-off-white/50">{assetsError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8 dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
            <span className="text-neon-green dark:text-neon-green light:text-neon-green">AFRICAN</span>
            <br />
            <span className="text-electric-mint dark:text-electric-mint light:text-electric-mint">ASSETS</span>
          </h1>
          <p className="text-lg sm:text-xl text-off-white/70 max-w-3xl dark:text-off-white/70 light:text-gray-700">
            Discover and invest in tokenized real-world assets across Africa. From farms to infrastructure, 
            find opportunities that match your investment goals.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'browse'
                  ? 'bg-neon-green text-black'
                  : 'bg-dark-gray text-off-white hover:bg-medium-gray'
              }`}
            >
              Browse Assets
            </button>
            <button
              onClick={() => setActiveTab('my-assets')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'my-assets'
                  ? 'bg-neon-green text-black'
                  : 'bg-dark-gray text-off-white hover:bg-medium-gray'
              }`}
            >
              My Assets
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'verifications'
                  ? 'bg-neon-green text-black'
                  : 'bg-dark-gray text-off-white hover:bg-medium-gray'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Verifications</span>
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'verifications' ? (
          <VerificationList 
            showCreateButton={true}
            showFilters={true}
          />
        ) : activeTab === 'my-assets' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-off-white">My Assets</h2>
              <button
                onClick={() => window.location.href = '/verify-asset'}
                className="px-4 py-2 bg-neon-green text-black rounded-lg font-medium hover:bg-electric-mint transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Asset</span>
              </button>
            </div>
            <VerificationList 
              showCreateButton={false}
              showFilters={true}
              limit={10}
            />
          </div>
        ) : (
          <>
            {/* Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat) => (
            <Card key={stat.label} variant="floating" className="text-center">
              <h3 className="text-3xl font-bold text-neon-green mb-2 dark:text-neon-green light:text-neon-green">{stat.value}</h3>
              <p className="text-sm text-off-white/70 mb-1 dark:text-off-white/70 light:text-gray-600">{stat.label}</p>
              <p className="text-xs text-electric-mint font-semibold dark:text-electric-mint light:text-electric-mint">{stat.change}</p>
            </Card>
          ))}
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray w-5 h-5 dark:text-medium-gray light:text-gray-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-gray border border-medium-gray rounded-xl text-off-white placeholder:text-light-gray focus:border-neon-green focus:outline-none transition-colors dark:bg-dark-gray dark:border-medium-gray dark:text-off-white dark:placeholder:text-light-gray light:bg-white light:border-gray-300 light:text-gray-900 light:placeholder:text-gray-500"
            />
          </div>

          {/* Type Filter */}
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-dark-gray border border-medium-gray rounded-xl text-off-white focus:border-neon-green focus:outline-none transition-colors dark:bg-dark-gray dark:border-medium-gray dark:text-off-white light:bg-white light:border-gray-300 light:text-gray-900"
          >
            {assetTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Country Filter */}
          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-3 bg-dark-gray border border-medium-gray rounded-xl text-off-white focus:border-neon-green focus:outline-none transition-colors dark:bg-dark-gray dark:border-medium-gray dark:text-off-white light:bg-white light:border-gray-300 light:text-gray-900"
          >
            {countries.map(country => (
              <option key={country.value} value={country.value}>{country.label}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-dark-gray rounded-xl p-1 dark:bg-dark-gray light:bg-gray-100">
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'gallery' 
                  ? 'bg-neon-green text-black' 
                  : 'text-medium-gray hover:text-off-white dark:text-medium-gray dark:hover:text-off-white light:text-gray-600 light:hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              Gallery
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'grid' 
                  ? 'bg-neon-green text-black' 
                  : 'text-medium-gray hover:text-off-white dark:text-medium-gray dark:hover:text-off-white light:text-gray-600 light:hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              Grid
            </button>
          </div>
        </motion.div>

        {/* Assets Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {viewMode === 'gallery' ? (
            <AssetGallery 
              assets={filteredAssets}
              loading={assetsLoading}
              error={assetsError}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Grid view content would go here */}
              <div className="col-span-full text-center py-12">
                <p className="text-off-white/70 dark:text-off-white/70 light:text-gray-600">
                  Grid view coming soon. Currently showing gallery view.
                </p>
              </div>
            </div>
          )}
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Assets;