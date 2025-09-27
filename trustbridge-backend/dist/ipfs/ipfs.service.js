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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var IPFSService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPFSService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
let IPFSService = IPFSService_1 = class IPFSService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(IPFSService_1.name);
        this.pinataApiKey = this.configService.get('PINATA_API_KEY') || '';
        this.pinataSecretKey = this.configService.get('PINATA_SECRET_KEY') || '';
        this.pinataJwt = this.configService.get('PINATA_JWT') || '';
        this.pinataGatewayUrl = this.configService.get('PINATA_GATEWAY_URL') || 'gateway.pinata.cloud';
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            this.logger.warn('Pinata credentials not configured. IPFS uploads will fail.');
        }
    }
    async generatePresignedUrl(fileName, fileType, metadata) {
        try {
            if (!this.pinataApiKey || !this.pinataSecretKey) {
                throw new common_1.BadRequestException('Pinata credentials not configured');
            }
            const cid = `QmPresigned${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
            const ipfsUrl = `https://${this.pinataGatewayUrl}/ipfs/${cid}`;
            const sanitizedMetadata = metadata ? Object.fromEntries(Object.entries(metadata).map(([key, value]) => [
                key,
                typeof value === 'string' || typeof value === 'number' ? value : String(value)
            ])) : {};
            return {
                presignedUrl: `https://api.pinata.cloud/pinning/pinFileToIPFS`,
                fields: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                    'pinataMetadata': JSON.stringify({
                        name: fileName,
                        keyvalues: {
                            originalName: fileName,
                            fileType: fileType,
                            uploadTime: new Date().toISOString(),
                            ...sanitizedMetadata
                        }
                    }),
                    'pinataOptions': JSON.stringify({
                        cidVersion: 1
                    })
                },
                cid,
                ipfsUrl
            };
        }
        catch (error) {
            this.logger.error('Failed to generate presigned URL:', error);
            throw new common_1.BadRequestException(`Failed to generate presigned URL: ${error.message}`);
        }
    }
    async uploadFile(file, fileName, fileType, metadata) {
        try {
            if (!this.pinataApiKey || !this.pinataSecretKey) {
                throw new common_1.BadRequestException('Pinata credentials not configured');
            }
            const formData = new form_data_1.default();
            formData.append('file', file, {
                filename: fileName,
                contentType: fileType
            });
            const sanitizedMetadata = metadata ? Object.fromEntries(Object.entries(metadata).map(([key, value]) => [
                key,
                typeof value === 'string' || typeof value === 'number' ? value : String(value)
            ])) : {};
            formData.append('pinataMetadata', JSON.stringify({
                name: fileName,
                keyvalues: {
                    originalName: fileName,
                    fileType: fileType,
                    uploadTime: new Date().toISOString(),
                    ...sanitizedMetadata
                }
            }));
            formData.append('pinataOptions', JSON.stringify({
                cidVersion: 1
            }));
            const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                    ...formData.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });
            const { IpfsHash, PinSize } = response.data;
            const ipfsUrl = `https://${this.pinataGatewayUrl}/ipfs/${IpfsHash}`;
            this.logger.log(`File uploaded to IPFS: ${IpfsHash}`);
            return {
                cid: IpfsHash,
                ipfsUrl,
                pinSize: PinSize,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('IPFS upload failed:', error);
            if (error.response) {
                this.logger.error('Pinata API error:', error.response.data);
                throw new common_1.BadRequestException(`IPFS upload failed: ${error.response.data?.error || error.response.statusText}`);
            }
            throw new common_1.BadRequestException(`IPFS upload failed: ${error.message}`);
        }
    }
    async pinFile(cid, name) {
        try {
            if (!this.pinataApiKey || !this.pinataSecretKey) {
                throw new common_1.BadRequestException('Pinata credentials not configured');
            }
            const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinByHash', {
                hashToPin: cid,
                pinataMetadata: {
                    name: name || `pinned-${cid}`,
                    keyvalues: {
                        pinnedAt: new Date().toISOString()
                    }
                }
            }, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                    'Content-Type': 'application/json'
                }
            });
            this.logger.log(`File pinned to IPFS: ${cid}`);
            return {
                cid,
                ipfsUrl: `https://${this.pinataGatewayUrl}/ipfs/${cid}`,
                pinSize: 0,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('IPFS pin failed:', error);
            if (error.response) {
                this.logger.error('Pinata API error:', error.response.data);
                throw new common_1.BadRequestException(`IPFS pin failed: ${error.response.data?.error || error.response.statusText}`);
            }
            throw new common_1.BadRequestException(`IPFS pin failed: ${error.message}`);
        }
    }
    async unpinFile(cid) {
        try {
            if (!this.pinataApiKey || !this.pinataSecretKey) {
                throw new common_1.BadRequestException('Pinata credentials not configured');
            }
            await axios_1.default.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });
            this.logger.log(`File unpinned from IPFS: ${cid}`);
            return true;
        }
        catch (error) {
            this.logger.error('IPFS unpin failed:', error);
            if (error.response) {
                this.logger.error('Pinata API error:', error.response.data);
                throw new common_1.BadRequestException(`IPFS unpin failed: ${error.response.data?.error || error.response.statusText}`);
            }
            throw new common_1.BadRequestException(`IPFS unpin failed: ${error.message}`);
        }
    }
    async getFile(cid) {
        try {
            const response = await axios_1.default.get(`https://${this.pinataGatewayUrl}/ipfs/${cid}`, {
                responseType: 'arraybuffer'
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            this.logger.error('Failed to get file from IPFS:', error);
            throw new common_1.BadRequestException(`Failed to get file from IPFS: ${error.message}`);
        }
    }
    async getFileMetadata(cid) {
        try {
            const response = await axios_1.default.get(`https://${this.pinataGatewayUrl}/ipfs/${cid}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get file metadata from IPFS:', error);
            throw new common_1.BadRequestException(`Failed to get file metadata from IPFS: ${error.message}`);
        }
    }
    async listFiles() {
        try {
            if (!this.pinataApiKey || !this.pinataSecretKey) {
                throw new common_1.BadRequestException('Pinata credentials not configured');
            }
            const response = await axios_1.default.get('https://api.pinata.cloud/data/pinList', {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });
            return response.data.rows || [];
        }
        catch (error) {
            this.logger.error('Failed to list files from IPFS:', error);
            throw new common_1.BadRequestException(`Failed to list files from IPFS: ${error.message}`);
        }
    }
    getIPFSUrl(cid) {
        return `https://${this.pinataGatewayUrl}/ipfs/${cid}`;
    }
};
exports.IPFSService = IPFSService;
exports.IPFSService = IPFSService = IPFSService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IPFSService);
//# sourceMappingURL=ipfs.service.js.map