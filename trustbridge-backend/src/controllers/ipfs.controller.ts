import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { IPFSService, IPFSFileMetadata, IPFSUploadResult, PresignedUrlResponse } from '../services/ipfs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('IPFS')
@Controller('ipfs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IPFSController {
  private readonly logger = new Logger(IPFSController.name);

  constructor(private readonly ipfsService: IPFSService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate presigned URL for file upload' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generatePresignedUrl(
    @Body() body: {
      fileName: string;
      fileSize: number;
      fileType: string;
      metadata?: IPFSFileMetadata;
    }
  ): Promise<PresignedUrlResponse> {
    try {
      this.logger.log(`Generating presigned URL for file: ${body.fileName}`);
      
      const result = await this.ipfsService.generatePresignedUrl(
        body.fileName,
        body.fileSize,
        body.fileType,
        body.metadata
      );

      return result;
    } catch (error) {
      this.logger.error('Error generating presigned URL:', error);
      throw new InternalServerErrorException('Failed to generate presigned URL');
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file directly to IPFS' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      category?: string;
      description?: string;
      tags?: string;
    }
  ): Promise<IPFSUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      this.logger.log(`Uploading file: ${file.originalname}`);

      // Validate file
      const validation = this.ipfsService.validateFile(file);
      if (!validation.valid) {
        throw new BadRequestException(validation.error);
      }

      // Prepare metadata
      const metadata: IPFSFileMetadata = {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        category: body.category || 'general',
        description: body.description || '',
        tags: body.tags ? body.tags.split(',').map(tag => tag.trim()) : []
      };

      const result = await this.ipfsService.uploadFile(file, metadata);
      
      this.logger.log(`File uploaded successfully: ${result.cid}`);
      return result;

    } catch (error) {
      this.logger.error('Error uploading file:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  @Get('file/:cid')
  @ApiOperation({ summary: 'Get file from IPFS by CID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFile(@Param('cid') cid: string): Promise<Buffer> {
    try {
      this.logger.log(`Getting file from IPFS: ${cid}`);

      // For now, return a redirect to the IPFS gateway
      // In a real implementation, you might want to proxy the file
      const fileUrl = this.ipfsService.getFileUrl(cid);
      
      // Return the file URL for now
      // In production, you might want to stream the file content
      throw new BadRequestException(`File available at: ${fileUrl}`);

    } catch (error) {
      this.logger.error('Error getting file:', error);
      throw new InternalServerErrorException('Failed to get file');
    }
  }

  @Post('pin')
  @ApiOperation({ summary: 'Pin file to IPFS by CID' })
  @ApiResponse({ status: 200, description: 'File pinned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async pinFile(
    @Body() body: {
      cid: string;
      metadata?: IPFSFileMetadata;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Pinning file to IPFS: ${body.cid}`);

      const success = await this.ipfsService.pinFile(body.cid, body.metadata);
      
      if (success) {
        return {
          success: true,
          message: 'File pinned successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to pin file'
        };
      }

    } catch (error) {
      this.logger.error('Error pinning file:', error);
      throw new InternalServerErrorException('Failed to pin file');
    }
  }

  @Delete('unpin/:cid')
  @ApiOperation({ summary: 'Unpin file from IPFS by CID' })
  @ApiResponse({ status: 200, description: 'File unpinned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unpinFile(@Param('cid') cid: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Unpinning file from IPFS: ${cid}`);

      const success = await this.ipfsService.unpinFile(cid);
      
      if (success) {
        return {
          success: true,
          message: 'File unpinned successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to unpin file'
        };
      }

    } catch (error) {
      this.logger.error('Error unpinning file:', error);
      throw new InternalServerErrorException('Failed to unpin file');
    }
  }

  @Get('metadata/:cid')
  @ApiOperation({ summary: 'Get file metadata by CID' })
  @ApiResponse({ status: 200, description: 'File metadata retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFileMetadata(@Param('cid') cid: string): Promise<IPFSFileMetadata | null> {
    try {
      this.logger.log(`Getting file metadata: ${cid}`);

      const metadata = await this.ipfsService.getFileMetadata(cid);
      return metadata;

    } catch (error) {
      this.logger.error('Error getting file metadata:', error);
      throw new InternalServerErrorException('Failed to get file metadata');
    }
  }

  @Get('list')
  @ApiOperation({ summary: 'List all pinned files' })
  @ApiResponse({ status: 200, description: 'Pinned files retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async listPinnedFiles(): Promise<IPFSUploadResult[]> {
    try {
      this.logger.log('Listing pinned files');

      const files = await this.ipfsService.listPinnedFiles();
      return files;

    } catch (error) {
      this.logger.error('Error listing pinned files:', error);
      throw new InternalServerErrorException('Failed to list pinned files');
    }
  }

  @Get('url/:cid')
  @ApiOperation({ summary: 'Get file URL by CID' })
  @ApiResponse({ status: 200, description: 'File URL retrieved successfully' })
  async getFileUrl(@Param('cid') cid: string): Promise<{ url: string }> {
    try {
      this.logger.log(`Getting file URL: ${cid}`);

      const url = this.ipfsService.getFileUrl(cid);
      return { url };

    } catch (error) {
      this.logger.error('Error getting file URL:', error);
      throw new InternalServerErrorException('Failed to get file URL');
    }
  }
}
