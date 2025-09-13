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
        this.pinataApiKey = this.configService.get('PINATA_API_KEY');
        this.pinataSecretKey = this.configService.get('PINATA_SECRET_KEY');
        this.pinataGateway = this.configService.get('PINATA_GATEWAY_URL') || 'gateway.pinata.cloud';
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            this.logger.warn('Pinata API credentials not configured. IPFS functionality will be limited.');
        }
    }
    async generatePresignedUrl(fileName, fileSize, fileType, metadata) {
        try {
            this.logger.log(`Generating presigned URL for file: ${fileName}`);
            return {
                url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
                fields: {
                    'pinataMetadata': JSON.stringify({
                        name: fileName,
                        keyvalues: {
                            category: metadata?.category || 'general',
                            description: metadata?.description || '',
                            tags: metadata?.tags?.join(',') || ''
                        }
                    }),
                    'pinataOptions': JSON.stringify({
                        cidVersion: 1
                    })
                }
            };
        }
        catch (error) {
            this.logger.error('Error generating presigned URL:', error);
            throw new common_1.InternalServerErrorException('Failed to generate presigned URL');
        }
    }
    async uploadFile(file, metadata) {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            throw new common_1.BadRequestException('Pinata API credentials not configured');
        }
        try {
            this.logger.log(`Uploading file to IPFS: ${file.originalname}`);
            const formData = new form_data_1.default();
            formData.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype
            });
            formData.append('pinataMetadata', JSON.stringify({
                name: file.originalname,
                keyvalues: {
                    category: metadata?.category || 'general',
                    description: metadata?.description || '',
                    tags: metadata?.tags?.join(',') || '',
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size.toString()
                }
            }));
            formData.append('pinataOptions', JSON.stringify({
                cidVersion: 1,
                wrapWithDirectory: false
            }));
            const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });
            const { IpfsHash, PinSize } = response.data;
            const ipfsUrl = `https://${this.pinataGateway}/ipfs/${IpfsHash}`;
            this.logger.log(`File uploaded successfully: ${IpfsHash}`);
            return {
                cid: IpfsHash,
                ipfsUrl,
                pinSize: PinSize,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('Error uploading file to IPFS:', error);
            if (error.response) {
                this.logger.error('Pinata API error:', error.response.data);
            }
            throw new common_1.InternalServerErrorException('Failed to upload file to IPFS');
        }
    }
    async uploadFileFromBuffer(buffer, fileName, mimeType, metadata) {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            throw new common_1.BadRequestException('Pinata API credentials not configured');
        }
        try {
            this.logger.log(`Uploading file from buffer to IPFS: ${fileName}`);
            const formData = new form_data_1.default();
            formData.append('file', buffer, {
                filename: fileName,
                contentType: mimeType
            });
            formData.append('pinataMetadata', JSON.stringify({
                name: fileName,
                keyvalues: {
                    category: metadata?.category || 'general',
                    description: metadata?.description || '',
                    tags: metadata?.tags?.join(',') || '',
                    originalName: fileName,
                    mimeType: mimeType,
                    size: buffer.length.toString()
                }
            }));
            formData.append('pinataOptions', JSON.stringify({
                cidVersion: 1,
                wrapWithDirectory: false
            }));
            const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });
            const { IpfsHash, PinSize } = response.data;
            const ipfsUrl = `https://${this.pinataGateway}/ipfs/${IpfsHash}`;
            this.logger.log(`File uploaded successfully from buffer: ${IpfsHash}`);
            return {
                cid: IpfsHash,
                ipfsUrl,
                pinSize: PinSize,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('Error uploading file from buffer to IPFS:', error);
            if (error.response) {
                this.logger.error('Pinata API error:', error.response.data);
            }
            throw new common_1.InternalServerErrorException('Failed to upload file to IPFS');
        }
    }
    async pinFile(cid, metadata) {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            throw new common_1.BadRequestException('Pinata API credentials not configured');
        }
        try {
            this.logger.log(`Pinning file to IPFS: ${cid}`);
            const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinByHash', {
                hashToPin: cid,
                pinataMetadata: {
                    name: metadata?.name || `File-${cid}`,
                    keyvalues: {
                        category: metadata?.category || 'general',
                        description: metadata?.description || '',
                        tags: metadata?.tags?.join(',') || '',
                        pinnedAt: new Date().toISOString()
                    }
                },
                pinataOptions: {
                    cidVersion: 1
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                }
            });
            this.logger.log(`File pinned successfully: ${cid}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error pinning file to IPFS:', error);
            if (error.response) {
                this.logger.error('Pinata API error:', error.response.data);
            }
            return false;
        }
    }
    async unpinFile(cid) {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            throw new common_1.BadRequestException('Pinata API credentials not configured');
        }
        try {
            this.logger.log(`Unpinning file from IPFS: ${cid}`);
            await axios_1.default.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                }
            });
            this.logger.log(`File unpinned successfully: ${cid}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error unpinning file from IPFS:', error);
            if (error.response) {
                this.logger.error('Pinata API error:', error.response.data);
            }
            return false;
        }
    }
    async getFileMetadata(cid) {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            throw new common_1.BadRequestException('Pinata API credentials not configured');
        }
        try {
            this.logger.log(`Getting file metadata: ${cid}`);
            const response = await axios_1.default.get(`https://api.pinata.cloud/data/pinList?hashContains=${cid}`, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                }
            });
            const pins = response.data.rows;
            if (pins.length === 0) {
                return null;
            }
            const pin = pins[0];
            const metadata = pin.metadata;
            return {
                name: metadata.name || `File-${cid}`,
                type: metadata.keyvalues?.mimeType || 'application/octet-stream',
                size: parseInt(metadata.keyvalues?.size || '0'),
                description: metadata.keyvalues?.description || '',
                category: metadata.keyvalues?.category || 'general',
                tags: metadata.keyvalues?.tags?.split(',') || []
            };
        }
        catch (error) {
            this.logger.error('Error getting file metadata:', error);
            return null;
        }
    }
    async listPinnedFiles() {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            throw new common_1.BadRequestException('Pinata API credentials not configured');
        }
        try {
            this.logger.log('Listing pinned files');
            const response = await axios_1.default.get('https://api.pinata.cloud/data/pinList?status=pinned', {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey,
                }
            });
            const pins = response.data.rows.map(pin => ({
                cid: pin.ipfs_pin_hash,
                ipfsUrl: `https://${this.pinataGateway}/ipfs/${pin.ipfs_pin_hash}`,
                pinSize: pin.size,
                timestamp: pin.date_pinned
            }));
            this.logger.log(`Found ${pins.length} pinned files`);
            return pins;
        }
        catch (error) {
            this.logger.error('Error listing pinned files:', error);
            throw new common_1.InternalServerErrorException('Failed to list pinned files');
        }
    }
    getFileUrl(cid) {
        return `https://${this.pinataGateway}/ipfs/${cid}`;
    }
    validateFile(file, maxSize = 50 * 1024 * 1024) {
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
            };
        }
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/json'
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return {
                valid: false,
                error: 'File type not supported'
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