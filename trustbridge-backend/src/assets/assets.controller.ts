import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Asset } from '../schemas/asset.schema';

@ApiTags('Assets')
@Controller('api/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assets with filtering' })
  @ApiResponse({ status: 200, description: 'List of assets' })
  async getAssets(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('country') country?: string,
    @Query('minValue') minValue?: number,
    @Query('maxValue') maxValue?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ success: boolean; data: Asset[] }> {
    const assets = await this.assetsService.getAssets({
      type,
      status,
      country,
      minValue,
      maxValue,
    }, limit || 20, offset || 0);

    return {
      success: true,
      data: assets,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getAssetById(@Param('id') id: string): Promise<{ success: boolean; data: Asset }> {
    const asset = await this.assetsService.getAssetById(id);
    return {
      success: true,
      data: asset,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createAsset(@Body() createAssetDto: CreateAssetDto): Promise<{ success: boolean; data: Asset }> {
    const asset = await this.assetsService.createAsset(createAssetDto);
    return {
      success: true,
      data: asset,
    };
  }

  @Post('create-with-tokenization')
  @ApiOperation({ summary: 'Create new asset with Hedera tokenization' })
  @ApiResponse({ status: 201, description: 'Asset created and tokenized successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Tokenization failed' })
  async createAssetWithTokenization(@Body() createAssetDto: CreateAssetDto): Promise<{ 
    success: boolean; 
    data: Asset; 
    tokenId?: string; 
    transactionId?: string;
    message?: string;
  }> {
    try {
      const result = await this.assetsService.createAssetWithTokenization(createAssetDto);
      return {
        success: true,
        data: result.asset,
        tokenId: result.tokenId,
        transactionId: result.transactionId,
        message: 'Asset created and tokenized successfully on Hedera network'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured assets' })
  @ApiResponse({ status: 200, description: 'List of featured assets' })
  async getFeaturedAssets(@Query('limit') limit?: number): Promise<{ success: boolean; data: Asset[] }> {
    const assets = await this.assetsService.getFeaturedAssets(limit || 10);
    return {
      success: true,
      data: assets,
    };
  }

  @Get('owner/:owner')
  @ApiOperation({ summary: 'Get assets by owner' })
  @ApiResponse({ status: 200, description: 'List of assets owned by user' })
  async getAssetsByOwner(@Param('owner') owner: string): Promise<{ success: boolean; data: Asset[] }> {
    const assets = await this.assetsService.getAssetsByOwner(owner);
    return {
      success: true,
      data: assets,
    };
  }
}
