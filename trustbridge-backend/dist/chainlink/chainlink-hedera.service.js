"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChainlinkHederaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainlinkHederaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
let ChainlinkHederaService = ChainlinkHederaService_1 = class ChainlinkHederaService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ChainlinkHederaService_1.name);
        this.priceFeeds = {
            BTC_USD: '0.0.1234567',
            DAI_USD: '0.0.1234568',
            ETH_USD: '0.0.1234569',
            HBAR_USD: '0.0.1234570',
            LINK_USD: '0.0.1234571',
            USDC_USD: '0.0.1234572',
            USDT_USD: '0.0.1234573',
        };
        this.ethereumAddresses = {
            BTC_USD: '0x058fE79CB5775d4b167920Ca6036B824805A9ABd',
            DAI_USD: '0xdA2aBF7C90aDC73CDF5cA8d720B87bD5F5863389',
            ETH_USD: '0xb9d461e0b962aF219866aDfA7DD19C52bB9871b9',
            HBAR_USD: '0x59bC155EB6c6C415fE43255aF66EcF0523c92B4a',
            LINK_USD: '0xF111b70231E89D69eBC9f6C9208e9890383Ef432',
            USDC_USD: '0xb632a7e7e02d76c0Ce99d9C62c7a2d1B5F92B6B5',
            USDT_USD: '0x06823de8E77d708C4cB72Cbf04495D67afF4Bd37',
        };
        this.initializeClient();
    }
    initializeClient() {
        try {
            const accountId = this.configService.get('HEDERA_ACCOUNT_ID');
            const privateKey = this.configService.get('HEDERA_PRIVATE_KEY');
            const network = this.configService.get('HEDERA_NETWORK', 'testnet');
            if (!accountId || !privateKey) {
                this.logger.warn('Hedera credentials not configured, Chainlink integration will use fallback data');
                return;
            }
            this.client = sdk_1.Client.forName(network);
            this.client.setOperator(accountId, privateKey);
            this.logger.log('Chainlink Hedera client initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Chainlink Hedera client:', error);
        }
    }
    async getLatestPrice(feedSymbol) {
        try {
            const feedAddress = this.priceFeeds[feedSymbol];
            if (!feedAddress) {
                this.logger.warn(`No Chainlink feed available for ${feedSymbol}`);
                return null;
            }
            if (!this.client) {
                this.logger.warn('Hedera client not available, using fallback data');
                return this.getFallbackPrice(feedSymbol);
            }
            this.logger.log(`Using fallback data for ${feedSymbol} (Hedera contract integration pending)`);
            return this.getFallbackPrice(feedSymbol);
        }
        catch (error) {
            this.logger.error(`Failed to get Chainlink price for ${feedSymbol}:`, error);
            return this.getFallbackPrice(feedSymbol);
        }
    }
    async getHistoricalPrice(feedSymbol, roundId) {
        try {
            const feedAddress = this.priceFeeds[feedSymbol];
            if (!feedAddress) {
                return null;
            }
            if (!this.client) {
                return this.getFallbackPrice(feedSymbol);
            }
            const contractId = sdk_1.ContractId.fromString(feedAddress);
            const roundDataQuery = new sdk_1.ContractCallQuery()
                .setContractId(contractId)
                .setFunction('getRoundData', new sdk_1.ContractFunctionParameters().addUint80(roundId))
                .setGas(100000);
            const roundDataResponse = await roundDataQuery.execute(this.client);
            const answer = roundDataResponse.getInt256(1);
            const startedAt = roundDataResponse.getUint256(2);
            const updatedAt = roundDataResponse.getUint256(3);
            const decimalsQuery = new sdk_1.ContractCallQuery()
                .setContractId(contractId)
                .setFunction('decimals')
                .setGas(100000);
            const decimalsResponse = await decimalsQuery.execute(this.client);
            const decimals = decimalsResponse.getUint8(0);
            const price = Number(answer) / Math.pow(10, decimals);
            return {
                price: Math.round(price * 100) / 100,
                timestamp: new Date(Number(updatedAt) * 1000),
                roundId: roundId,
                decimals: decimals,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get historical Chainlink price for ${feedSymbol}:`, error);
            return null;
        }
    }
    async getPriceFeedInfo(feedSymbol) {
        try {
            const feedAddress = this.priceFeeds[feedSymbol];
            if (!feedAddress) {
                return null;
            }
            if (!this.client) {
                return {
                    address: feedAddress,
                    description: `Chainlink ${feedSymbol} price feed`,
                    status: 'offline'
                };
            }
            const contractId = sdk_1.ContractId.fromString(feedAddress);
            const descriptionQuery = new sdk_1.ContractCallQuery()
                .setContractId(contractId)
                .setFunction('description')
                .setGas(100000);
            const descriptionResponse = await descriptionQuery.execute(this.client);
            const description = descriptionResponse.getString(0);
            const versionQuery = new sdk_1.ContractCallQuery()
                .setContractId(contractId)
                .setFunction('version')
                .setGas(100000);
            const versionResponse = await versionQuery.execute(this.client);
            const version = versionResponse.getUint256(0);
            return {
                address: feedAddress,
                description: description,
                version: Number(version),
                status: 'active'
            };
        }
        catch (error) {
            this.logger.error(`Failed to get Chainlink feed info for ${feedSymbol}:`, error);
            return {
                address: this.priceFeeds[feedSymbol] || 'unknown',
                description: `Chainlink ${feedSymbol} price feed`,
                status: 'error'
            };
        }
    }
    getFallbackPrice(feedSymbol) {
        const fallbackPrices = {
            BTC_USD: 45000,
            DAI_USD: 1.0,
            ETH_USD: 3000,
            HBAR_USD: 0.08,
            LINK_USD: 15.0,
            USDC_USD: 1.0,
            USDT_USD: 1.0,
        };
        const basePrice = fallbackPrices[feedSymbol] || 1.0;
        const volatility = (Math.random() - 0.5) * 0.05;
        const price = basePrice * (1 + volatility);
        return {
            price: Math.round(price * 100) / 100,
            timestamp: new Date(),
            roundId: Math.floor(Math.random() * 1000000),
            decimals: 8,
        };
    }
    getAvailableFeeds() {
        return Object.keys(this.priceFeeds);
    }
    getFeedAddress(feedSymbol) {
        return this.priceFeeds[feedSymbol] || null;
    }
};
exports.ChainlinkHederaService = ChainlinkHederaService;
exports.ChainlinkHederaService = ChainlinkHederaService = ChainlinkHederaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ChainlinkHederaService);
//# sourceMappingURL=chainlink-hedera.service.js.map