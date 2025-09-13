# IPFS Integration Setup Guide

This guide explains how to set up and configure IPFS integration with Pinata for the TrustBridge platform.

## Overview

The IPFS integration provides decentralized file storage for:
- Asset verification documents
- Property photos and evidence
- Legal documents and certificates
- Any other files that need to be stored permanently and accessibly

## Prerequisites

1. **Pinata Account**: Sign up at [pinata.cloud](https://pinata.cloud)
2. **Node.js**: Version 18 or higher
3. **MongoDB**: For storing file metadata
4. **Backend Dependencies**: Already installed

## Setup Steps

### 1. Create Pinata Account

1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Verify your email address
4. Complete the onboarding process

### 2. Get API Credentials

1. Log into your Pinata dashboard
2. Go to **API Keys** section
3. Click **New Key**
4. Give it a name (e.g., "TrustBridge Production")
5. Select permissions:
   - ✅ **pinFileToIPFS** - Upload files
   - ✅ **pinByHash** - Pin existing files
   - ✅ **unpin** - Remove files
   - ✅ **pinList** - List files
6. Copy the **API Key** and **Secret Key**

### 3. Get Gateway URL

1. In your Pinata dashboard, go to **Gateways**
2. You'll see your dedicated gateway URL (e.g., `aquamarine-casual-tarantula-177.mypinata.cloud`)
3. Copy this URL

### 4. Configure Environment Variables

Add the following to your `.env` file:

```env
# IPFS/Pinata Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
PINATA_GATEWAY_URL=your_gateway_domain.mypinata.cloud
```

### 5. Update Frontend Environment

In your frontend `.env.local` file:

```env
# Pinata Configuration
VITE_PINATA_JWT=your_pinata_jwt_token_here
VITE_PINATA_GATEWAY_URL=your_gateway_domain.mypinata.cloud

# Server URL for presigned URLs
VITE_SERVER_URL=http://localhost:4001/api
```

## API Endpoints

### IPFS Management

#### Upload File
```http
POST /api/ipfs/upload
Content-Type: multipart/form-data

file: [file]
category: verification_document
description: Asset ownership document
tags: ownership,legal,verification
```

#### Get Presigned URL
```http
POST /api/ipfs/presigned-url
Content-Type: application/json

{
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "metadata": {
    "category": "verification_document",
    "description": "Asset ownership document"
  }
}
```

#### Pin File by CID
```http
POST /api/ipfs/pin
Content-Type: application/json

{
  "cid": "QmYourFileHash",
  "metadata": {
    "name": "document.pdf",
    "category": "verification_document"
  }
}
```

#### List Pinned Files
```http
GET /api/ipfs/list
Authorization: Bearer <token>
```

#### Get File Metadata
```http
GET /api/ipfs/metadata/:cid
Authorization: Bearer <token>
```

### Verification with Files

#### Submit Verification with IPFS Files
```http
POST /api/verification/submit-with-files
Content-Type: application/json
Authorization: Bearer <token>

{
  "assetId": "asset_123",
  "description": "Coffee farm verification",
  "documents": [
    {
      "cid": "QmDocumentHash",
      "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmDocumentHash",
      "fileName": "ownership.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000,
      "description": "Property ownership document",
      "category": "verification_document"
    }
  ],
  "photos": [
    {
      "cid": "QmPhotoHash",
      "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmPhotoHash",
      "fileName": "farm_photo.jpg",
      "fileType": "image/jpeg",
      "fileSize": 512000,
      "description": "Farm overview photo",
      "category": "verification_photo"
    }
  ],
  "evidence": {
    "location": {
      "lat": 6.5244,
      "lng": 3.3792
    }
  }
}
```

## File Types Supported

### Documents
- PDF files (`.pdf`)
- Word documents (`.doc`, `.docx`)
- Text files (`.txt`)
- Images (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`)

### Images
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

## File Size Limits

- **Documents**: 50MB maximum
- **Images**: 10MB maximum
- **Total per verification**: 500MB maximum

## Security Features

### Authentication
- All endpoints require JWT authentication
- User-specific file access controls
- API key validation for Pinata operations

### File Validation
- MIME type verification
- File size limits
- Malware scanning (via Pinata)

### Access Control
- Files are private by default
- Public access only through verified URLs
- IPFS hash-based addressing

## Usage Examples

### Frontend File Upload

```typescript
import { useIPFS } from '../hooks/useIPFS';

const MyComponent = () => {
  const { uploadFile, isUploading } = useIPFS({
    onUploadSuccess: (result) => {
      console.log('File uploaded:', result.cid);
    }
  });

  const handleFileUpload = async (file: File) => {
    const result = await uploadFile(file, {
      category: 'verification_document',
      description: 'Asset verification document'
    });
  };
};
```

### Backend File Processing

```typescript
import { IPFSService } from '../services/ipfs.service';

@Injectable()
export class MyService {
  constructor(private ipfsService: IPFSService) {}

  async processFile(file: Express.Multer.File) {
    const result = await this.ipfsService.uploadFile(file, {
      category: 'verification_document',
      description: 'Asset verification document'
    });
    
    return result;
  }
}
```

## Monitoring and Maintenance

### Pinata Dashboard
- Monitor file uploads and storage usage
- Track API usage and limits
- Manage API keys and permissions

### Backend Logs
- File upload success/failure logs
- IPFS operation metrics
- Error tracking and debugging

### Database
- File metadata stored in MongoDB
- Verification requests linked to IPFS files
- Audit trail for all file operations

## Troubleshooting

### Common Issues

1. **Upload fails with 401 error**
   - Check Pinata API credentials
   - Verify API key permissions

2. **Files not accessible after upload**
   - Verify gateway URL configuration
   - Check if file was pinned successfully

3. **Large files fail to upload**
   - Check file size limits
   - Verify network stability

4. **CORS errors**
   - Ensure frontend URL is whitelisted
   - Check server CORS configuration

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
```

### Health Check

Test IPFS connectivity:
```http
GET /api/ipfs/health
```

## Production Considerations

### Scaling
- Consider using multiple Pinata accounts for load balancing
- Implement file caching for frequently accessed content
- Monitor storage usage and costs

### Backup
- IPFS provides built-in redundancy
- Consider additional backup strategies for critical files
- Regular verification of file accessibility

### Security
- Rotate API keys regularly
- Implement rate limiting
- Monitor for suspicious activity

## Cost Management

### Pinata Pricing
- Free tier: 1GB storage, 1000 pins
- Paid plans: $20/month for 100GB storage
- Additional storage: $0.15/GB/month

### Optimization
- Compress images before upload
- Use appropriate file formats
- Clean up unused files regularly

## Support

### Documentation
- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [TrustBridge API Documentation](http://localhost:4001/api-docs)

### Community
- [Pinata Discord](https://discord.gg/pinata)
- [IPFS Community](https://discuss.ipfs.io/)
- [TrustBridge Support](mailto:support@trustbridge.africa)

## Next Steps

1. Set up Pinata account and get credentials
2. Configure environment variables
3. Test file upload functionality
4. Deploy to production
5. Monitor usage and performance

For additional help, contact the development team or check the troubleshooting section above.
