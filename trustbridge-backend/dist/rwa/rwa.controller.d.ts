import { RWAService } from './rwa.service';
export declare class RWAController {
    private readonly rwaService;
    constructor(rwaService: RWAService);
    createRWAAsset(createAssetDto: any, req: any): Promise<import("./rwa.service").RWAAsset>;
    getRWAAssets(status?: string): Promise<{
        assets: import("./rwa.service").RWAAsset[];
        total: number;
        page: number;
        limit: number;
    }>;
    getRWAAsset(id: string): Promise<import("./rwa.service").RWAAsset>;
    updateRWAAsset(id: string, updateAssetDto: any): Promise<import("./rwa.service").RWAAsset>;
    deleteRWAAsset(id: string): Promise<import("./rwa.service").RWAAsset>;
}
