import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { TradingService, ListDigitalAssetForSaleDto, MakeOfferDto, AcceptOfferDto } from './trading.service';

@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('digital/list')
  async listDigitalAssetForSale(@Body() listingDto: ListDigitalAssetForSaleDto) {
    return this.tradingService.listDigitalAssetForSale(listingDto);
  }

  @Post('digital/offer')
  async makeOfferOnDigitalAsset(@Body() offerDto: MakeOfferDto) {
    return this.tradingService.makeOfferOnDigitalAsset(offerDto);
  }

  @Get('digital/offers/:assetId')
  async getDigitalAssetOffers(@Param('assetId') assetId: string) {
    return this.tradingService.getDigitalAssetOffers(assetId);
  }

  @Post('digital/accept-offer')
  async acceptOfferOnDigitalAsset(@Body() acceptDto: AcceptOfferDto) {
    return this.tradingService.acceptOfferOnDigitalAsset(acceptDto);
  }

  @Get('stats')
  async getTradingStats() {
    return this.tradingService.getTradingStats();
  }

  @Get('history/:assetId')
  async getAssetTradingHistory(@Param('assetId') assetId: string) {
    return this.tradingService.getAssetTradingHistory(assetId);
  }
}
