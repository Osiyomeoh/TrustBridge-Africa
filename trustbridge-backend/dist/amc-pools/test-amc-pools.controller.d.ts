import { AMCPoolsService, CreateAMCPoolDto } from './amc-pools.service';
export declare class TestAMCPoolsController {
    private readonly amcPoolsService;
    constructor(amcPoolsService: AMCPoolsService);
    createPoolTest(createPoolDto: CreateAMCPoolDto): Promise<import("../schemas/amc-pool.schema").AMCPool>;
}
