import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('market')
  @ApiOperation({ summary: 'Get market analytics' })
  @ApiResponse({ status: 200, description: 'Market analytics' })
  async getMarketAnalytics() {
    try {
      const data = await this.analyticsService.getMarketAnalytics();
      return {
        success: true,
        data,
        message: 'Market analytics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get market analytics'
      };
    }
  }

  @Get('real-time')
  @ApiOperation({ summary: 'Get real-time metrics' })
  @ApiResponse({ status: 200, description: 'Real-time metrics' })
  async getRealTimeMetrics() {
    try {
      const data = await this.analyticsService.getRealTimeMetrics();
      return {
        success: true,
        data,
        message: 'Real-time metrics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get real-time metrics'
      };
    }
  }
}
