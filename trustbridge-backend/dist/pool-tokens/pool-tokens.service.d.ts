import { Model } from 'mongoose';
import { PoolTokenHoldings, PoolTokenHoldingsDocument, TokenTransferType } from '../schemas/pool-token-holdings.schema';
import { AMCPoolDocument } from '../schemas/amc-pool.schema';
import { HederaService } from '../hedera/hedera.service';
export interface TransferTokensDto {
    fromAddress: string;
    toAddress: string;
    amount: number;
    transferType: TokenTransferType;
    description?: string;
    referenceId?: string;
}
export interface ClaimDividendDto {
    holderAddress: string;
    poolId: string;
    dividendId: string;
}
export interface StakeTokensDto {
    holderAddress: string;
    poolId: string;
    amount: number;
    duration?: number;
}
export declare class PoolTokensService {
    private poolTokenHoldingsModel;
    private amcPoolModel;
    private hederaService;
    private readonly logger;
    constructor(poolTokenHoldingsModel: Model<PoolTokenHoldingsDocument>, amcPoolModel: Model<AMCPoolDocument>, hederaService: HederaService);
    getUserHoldings(holderAddress: string): Promise<PoolTokenHoldings[]>;
    getPoolHolding(holderAddress: string, poolId: string): Promise<PoolTokenHoldings>;
    updateHoldingsAfterInvestment(holderAddress: string, poolId: string, tokenAmount: number, pricePerToken: number, totalValue: number): Promise<PoolTokenHoldings>;
    transferTokens(transferDto: TransferTokensDto): Promise<PoolTokenHoldings>;
    updateDividendDistribution(poolId: string, dividendAmount: number, perToken: number, description: string): Promise<void>;
    claimDividends(claimDto: ClaimDividendDto): Promise<PoolTokenHoldings>;
    stakeTokens(stakeDto: StakeTokensDto): Promise<PoolTokenHoldings>;
    unstakeTokens(holderAddress: string, poolId: string, stakingId: string): Promise<PoolTokenHoldings>;
    private updateHoldingValue;
    private getCurrentPoolPrice;
    getPortfolioSummary(holderAddress: string): Promise<any>;
}
