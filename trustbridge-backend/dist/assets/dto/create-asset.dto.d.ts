import { AssetType } from '../../schemas/asset.schema';
export declare class LocationDto {
    country: string;
    region: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export declare class CreateAssetDto {
    owner: string;
    type: AssetType;
    name: string;
    description?: string;
    location: LocationDto;
    totalValue: number;
    tokenSupply: number;
    maturityDate: string;
    expectedAPY: number;
    metadata?: any;
}
