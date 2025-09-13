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
    async generatePresignedUrl(fileName, fileSize, fileType, metadata) {
        try {
            const uploadUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
            const uniqueFileName = `${Date.now()}_${fileName}`;
            return {
                url: uploadUrl,
                fields: {
                    'pinataMetadata': JSON.stringify({
                        name: uniqueFileName,
                        keyvalues: {
                            originalName: fileName,
                            fileType: fileType,
                            fileSize: fileSize.toString(),
                            ...metadata
                        }
                    }),
                    'pinataOptions': JSON.stringify({
                        cidVersion: 1
                    })
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to generate presigned URL:', error);
            throw new common_1.BadRequestException('Failed to generate upload URL');
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
            formData.append('pinataMetadata', JSON.stringify({
                name: fileName,
                keyvalues: {
                    originalName: fileName,
                    fileType: fileType,
                    uploadTime: new Date().toISOString(),
                    ...metadata
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
    async pinFile(cid, metadata) {
        try {
            if (!this.pinataApiKey || !this.pinataSecretKey) {
                throw new common_1.BadRequestException('Pinata credentials not configured');
            }
            const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinByHash', {
                hashToPin: cid,
                pinataMetadata: {
                    name: `pinned_${cid}`,
                    keyvalues: metadata || {}
                }
            }, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        }
        catch (error) {
            this.logger.error('Failed to pin file:', error);
            return false;
        }
    }
    async unpinFile(cid) {
        try {
            if (!this.pinataApiKey || !this.pinataSecretKey) {
                throw new common_1.BadRequestException('Pinata credentials not configured');
            }
            const response = await axios_1.default.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });
            return response.status === 200;
        }
        catch (error) {
            this.logger.error('Failed to unpin file:', error);
            return false;
        }
    }
    async getFileMetadata(cid) {
        try {
            if (!this.pinataApiKey || !this.pinataSecretKey) {
                throw new common_1.BadRequestException('Pinata credentials not configured');
            }
            const response = await axios_1.default.get(`https://api.pinata.cloud/data/pinList?hashContains=${cid}`, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });
            const pins = response.data.rows;
            if (pins.length === 0) {
                return null;
            }
            const pin = pins[0];
            return {
                name: pin.metadata.name,
                type: pin.metadata.keyvalues?.fileType || 'unknown',
                size: pin.size,
                description: pin.metadata.keyvalues?.description,
                category: pin.metadata.keyvalues?.category,
                tags: pin.metadata.keyvalues?.tags ? pin.metadata.keyvalues.tags.split(',') : []
            };
        }
        catch (error) {
            this.logger.error('Failed to get file metadata:', error);
            return null;
        }
    }
    async listPinnedFiles() {
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
            return response.data.rows.map((pin) => ({
                cid: pin.ipfs_pin_hash,
                ipfsUrl: `https://${this.pinataGatewayUrl}/ipfs/${pin.ipfs_pin_hash}`,
                pinSize: pin.size,
                timestamp: pin.date_pinned
            }));
        }
        catch (error) {
            this.logger.error('Failed to list pinned files:', error);
            throw new common_1.BadRequestException('Failed to list files');
        }
    }
    getFileUrl(cid) {
        return `https://${this.pinataGatewayUrl}/ipfs/${cid}`;
    }
    validateFile(file, maxSize = 10 * 1024 * 1024) {
        if (file.length > maxSize) {
            return {
                valid: false,
                error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
            };
        }
        return { valid: true };
    }
};
exports.IPFSService = IPFSService;
exports.IPFSService = IPFSService = IPFSService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IPFSService);
//# sourceMappingURL=ipfs.service.js.map