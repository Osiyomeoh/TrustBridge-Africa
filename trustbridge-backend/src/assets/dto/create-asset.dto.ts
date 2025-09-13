import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsDateString, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetType } from '../../schemas/asset.schema';

export class LocationDto {
  @ApiProperty({ example: 'Kenya' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Kiambu' })
  @IsString()
  region: string;

  @ApiProperty({ example: { lat: -1.2921, lng: 36.8219 }, required: false })
  @IsOptional()
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export class CreateAssetDto {
  @ApiProperty({ example: '0x1234567890123456789012345678901234567890' })
  @IsString()
  owner: string;

  @ApiProperty({ enum: AssetType, example: AssetType.AGRICULTURAL })
  @IsEnum(AssetType)
  type: AssetType;

  @ApiProperty({ example: 'Coffee Harvest Q1/2026' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Premium Arabica coffee from Kiambu region', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1000)
  totalValue: number;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  @Min(1)
  tokenSupply: number;

  @ApiProperty({ example: '2026-03-31T00:00:00Z' })
  @IsDateString()
  maturityDate: string;

  @ApiProperty({ example: 20.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  expectedAPY: number;

  @ApiProperty({ example: { crop: 'Arabica', size: '5 hectares' }, required: false })
  @IsOptional()
  metadata?: any;
}
