import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  async getOverview() {
    return {
      success: true,
      data: {
        totalAssets: 15,
        totalValue: 7500000,
        totalUsers: 25,
        totalAttestors: 15,
        totalPools: 3,
        totalVolume: 2500000,
        activeVerifications: 8,
        completedVerifications: 12,
        averageAssetValue: 500000,
        topCountries: ['Nigeria', 'Kenya', 'Ghana'],
        assetCategories: {
          agricultural: 12,
          realEstate: 2,
          vehicles: 1
        },
        monthlyGrowth: 15.5,
        successRate: 92.3
      },
      message: 'Analytics overview retrieved successfully'
    };
  }

  async getStats() {
    return {
      success: true,
      data: {
        system: {
          uptime: '99.9%',
          responseTime: '120ms',
          totalRequests: 15420,
          errorRate: '0.1%'
        },
        blockchain: {
          totalTransactions: 1250,
          gasUsed: '2.5M',
          averageBlockTime: '2.1s',
          networkStatus: 'healthy'
        },
        database: {
          totalRecords: 2847,
          storageUsed: '1.2GB',
          queryPerformance: 'excellent',
          connectionPool: 'healthy'
        },
        mobile: {
          activeUsers: 156,
          appVersion: '1.2.0',
          crashRate: '0.05%',
          averageSessionTime: '8.5min'
        }
      },
      message: 'System statistics retrieved successfully'
    };
  }
}