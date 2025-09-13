import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Eye, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { usePortfolio, useInvestments } from '../hooks/useApi';
import { Portfolio as PortfolioType, Investment } from '../types/api';

const Portfolio: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');

  // Fetch real data from backend
  const { data: portfolioData, loading: portfolioLoading, error: portfolioError } = usePortfolio();
  const { data: investmentsData, loading: investmentsLoading, error: investmentsError } = useInvestments();

  // Format portfolio stats from real data
  const portfolioStats = useMemo(() => {
    if (portfolioLoading || !portfolioData?.data) {
      return {
        totalValue: '...',
        totalReturn: '...',
        totalReturnAmount: '...',
        activeInvestments: '...',
        totalDividends: '...'
      };
    }

    const data = portfolioData.data;
    return {
      totalValue: `$${data.totalValue?.toLocaleString() || '0'}`,
      totalReturn: `${data.returnPercentage >= 0 ? '+' : ''}${data.returnPercentage?.toFixed(1) || '0'}%`,
      totalReturnAmount: `${data.totalReturns >= 0 ? '+' : ''}$${Math.abs(data.totalReturns)?.toLocaleString() || '0'}`,
      activeInvestments: data.totalInvestments?.toString() || '0',
      totalDividends: `$${data.totalValue?.toLocaleString() || '0'}`
    };
  }, [portfolioData, portfolioLoading]);

  // Format investments from real data
  const investments = useMemo(() => {
    if (investmentsLoading || !investmentsData?.data) return [];
    
    return investmentsData.data.map((investment: Investment) => ({
      id: investment._id,
      name: investment.assetId, // This would ideally be the asset name
      category: 'Asset', // This would ideally be the asset type
      value: `$${investment.amount?.toLocaleString()}`,
      shares: investment.tokens,
      return: '+0%', // This would be calculated from asset performance
      returnAmount: '+$0',
      status: investment.status,
      trend: 'up' as const
    }));
  }, [investmentsData, investmentsLoading]);

  // Show loading state
  if (portfolioLoading || investmentsLoading) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-neon-green mx-auto mb-4" />
            <p className="text-lg text-off-white/70">Loading portfolio data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (portfolioError || investmentsError) {
    return (
      <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-off-white/70 mb-2">Failed to load portfolio data</p>
            <p className="text-sm text-off-white/50">{portfolioError || investmentsError}</p>
          </div>
        </div>
      </div>
    );
  }

  const timeRanges = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2">
              <span className="text-neon-green">PORTFOLIO</span>
              <br />
              <span className="text-electric-mint">OVERVIEW</span>
            </h1>
            <p className="text-base sm:text-lg text-off-white/70 max-w-2xl">
              Track your investments, monitor performance, and manage your tokenized asset portfolio across Africa.
            </p>
          </div>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range as any)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Portfolio Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card variant="floating" className="hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-neon-green" />
              <TrendingUp className="w-5 h-5 text-electric-mint" />
            </div>
            <h3 className="text-2xl font-bold text-off-white mb-1">{portfolioStats.totalValue}</h3>
            <p className="text-sm text-off-white/70">Total Portfolio Value</p>
          </CardContent>
        </Card>

        <Card variant="floating" className="hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-electric-mint" />
              <ArrowUpRight className="w-5 h-5 text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-neon-green mb-1">{portfolioStats.totalReturn}</h3>
            <p className="text-sm text-off-white/70">Total Return</p>
            <p className="text-xs text-electric-mint font-semibold">{portfolioStats.totalReturnAmount}</p>
          </CardContent>
        </Card>

        <Card variant="floating" className="hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <PieChart className="w-8 h-8 text-neon-green" />
              <div className="w-5 h-5 bg-electric-mint rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-off-white mb-1">{portfolioStats.activeInvestments}</h3>
            <p className="text-sm text-off-white/70">Active Investments</p>
          </CardContent>
        </Card>

        <Card variant="floating" className="hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-electric-mint" />
              <TrendingUp className="w-5 h-5 text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-electric-mint mb-1">{portfolioStats.totalDividends}</h3>
            <p className="text-sm text-off-white/70">Total Dividends</p>
          </CardContent>
        </Card>

        <Card variant="neon" className="hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-neon-green" />
              <div className="w-5 h-5 bg-neon-green rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-neon-green mb-1">Live</h3>
            <p className="text-sm text-off-white/70">Real-time Data</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Chart Placeholder */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card variant="floating" className="h-80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-neon-green" />
              Portfolio Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-dark-gray/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-off-white/30 mx-auto mb-4" />
                <p className="text-off-white/50">Performance chart will be integrated here</p>
                <p className="text-sm text-off-white/30">Time range: {timeRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Investment List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card variant="floating">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-6 h-6 text-neon-green" />
              Your Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.map((investment, index) => (
                <motion.div
                  key={investment.id}
                  className="flex items-center justify-between p-4 bg-dark-gray/30 rounded-xl border border-neon-green/20 hover:border-neon-green/40 transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-mint rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-lg">A</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-off-white text-lg group-hover:text-neon-green transition-colors">
                        {investment.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-electric-mint bg-electric-mint/10 px-2 py-1 rounded-full">
                          {investment.category}
                        </span>
                        <span className="text-sm text-off-white/70">
                          {investment.shares} shares
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-neon-green text-lg">{investment.value}</p>
                      <div className="flex items-center gap-1">
                        {investment.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-electric-mint" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-semibold ${
                          investment.trend === 'up' ? 'text-electric-mint' : 'text-red-400'
                        }`}>
                          {investment.return}
                        </span>
                      </div>
                      <p className="text-xs text-off-white/50">{investment.returnAmount}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Portfolio;