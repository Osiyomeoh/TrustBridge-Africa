import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

export interface IPFSUploadResult {
  cid: string;
  ipfsUrl: string;
  pinSize: number;
  timestamp: string;
}

export interface IPFSFileMetadata {
  name: string;
  type: string;
  size: number;
  description?: string;
  category?: string;
  tags?: string[];
}

@Injectable()
export class IPFSService {
  private readonly logger = new Logger(IPFSService.name);
  private readonly pinataApiKey: string;
  private readonly pinataSecretKey: string;
  private readonly pinataJwt: string;
  private readonly pinataGatewayUrl: string;

  constructor(private configService: ConfigService) {
    this.pinataApiKey = this.configService.get<string>('PINATA_API_KEY') || '';
    this.pinataSecretKey = this.configService.get<string>('PINATA_SECRET_KEY') || '';
    this.pinataJwt = this.configService.get<string>('PINATA_JWT') || '';
    this.pinataGatewayUrl = this.configService.get<string>('PINATA_GATEWAY_URL') || 'gateway.pinata.cloud';

    if (!this.pinataApiKey || !this.pinataSecretKey) {
      this.logger.warn('Pinata credentials not configured. IPFS uploads will fail.');
    }
  }

  /**
   * Generate presigned URL for file upload
   */
  async generatePresignedUrl(
    fileName: string,
    fileSize: number,
    fileType: string,
    metadata?: IPFSFileMetadata
  ): Promise<{ url: string; fields: Record<string, string> }> {
    try {
      // For now, we'll use direct Pinata API upload
      // In production, you might want to implement actual presigned URLs
      const uploadUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
      
      // Generate a unique filename
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
    } catch (error) {
      this.logger.error('Failed to generate presigned URL:', error);
      throw new BadRequestException('Failed to generate upload URL');
    }
  }

  /**
   * Upload file to IPFS using Pinata
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    fileType: string,
    metadata?: IPFSFileMetadata
  ): Promise<IPFSUploadResult> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        throw new BadRequestException('Pinata credentials not configured');
      }

      const formData = new FormData();
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

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      const { IpfsHash, PinSize } = response.data;
      const ipfsUrl = `https://${this.pinataGatewayUrl}/ipfs/${IpfsHash}`;

      this.logger.log(`File uploaded to IPFS: ${IpfsHash}`);

      return {
        cid: IpfsHash,
        ipfsUrl,
        pinSize: PinSize,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('IPFS upload failed:', error);
      if (error.response) {
        this.logger.error('Pinata API error:', error.response.data);
        throw new BadRequestException(`IPFS upload failed: ${error.response.data?.error || error.response.statusText}`);
      }
      throw new BadRequestException(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Pin a file by CID
   */
  async pinFile(cid: string, metadata?: IPFSFileMetadata): Promise<boolean> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        throw new BadRequestException('Pinata credentials not configured');
      }

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinByHash',
        {
          hashToPin: cid,
          pinataMetadata: {
            name: `pinned_${cid}`,
            keyvalues: metadata || {}
          }
        },
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      this.logger.error('Failed to pin file:', error);
      return false;
    }
  }

  /**
   * Unpin a file by CID
   */
  async unpinFile(cid: string): Promise<boolean> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        throw new BadRequestException('Pinata credentials not configured');
      }

      const response = await axios.delete(
        `https://api.pinata.cloud/pinning/unpin/${cid}`,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      this.logger.error('Failed to unpin file:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(cid: string): Promise<IPFSFileMetadata | null> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        throw new BadRequestException('Pinata credentials not configured');
      }

      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?hashContains=${cid}`,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

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
    } catch (error) {
      this.logger.error('Failed to get file metadata:', error);
      return null;
    }
  }

  /**
   * List all pinned files
   */
  async listPinnedFiles(): Promise<IPFSUploadResult[]> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        throw new BadRequestException('Pinata credentials not configured');
      }

      const response = await axios.get(
        'https://api.pinata.cloud/data/pinList',
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      return response.data.rows.map((pin: any) => ({
        cid: pin.ipfs_pin_hash,
        ipfsUrl: `https://${this.pinataGatewayUrl}/ipfs/${pin.ipfs_pin_hash}`,
        pinSize: pin.size,
        timestamp: pin.date_pinned
      }));
    } catch (error) {
      this.logger.error('Failed to list pinned files:', error);
      throw new BadRequestException('Failed to list files');
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(cid: string): string {
    return `https://${this.pinataGatewayUrl}/ipfs/${cid}`;
  }

  /**
   * Validate file
   */
  validateFile(file: Buffer, maxSize: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
    if (file.length > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
      };
    }

    return { valid: true };
  }
}
