# TrustBridge Setup Guide

## 🆓 FREE SERVICES SETUP

### 1. MongoDB Atlas (FREE - 512MB)

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose FREE tier (M0)
3. **Get Connection String**:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/trustbridge?retryWrites=true&w=majority
   ```
4. **Update Config**: Replace in `config.atlas-gdrive.env`

### 2. Google Drive API (FREE - 15GB)

1. **Create Project**: Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Enable APIs**:
   - Google Drive API
   - Google Vision API (for OCR)
   - Google Geocoding API
3. **Create Credentials**:
   - OAuth 2.0 Client ID
   - Download JSON file
4. **Get Refresh Token**:
   ```bash
   # Install Google APIs CLI
   npm install -g googleapis
   
   # Get refresh token
   node scripts/get-google-refresh-token.js
   ```
5. **Create Folder**: Create a folder in Google Drive for TrustBridge files
6. **Update Config**: Add credentials to `config.atlas-gdrive.env`

### 3. Hedera Testnet (FREE)

1. **Create Account**: Go to [Hedera Portal](https://portal.hedera.com)
2. **Get Testnet Account**: 
   - Account ID: `0.0.xxxxxx`
   - Private Key: `302e020100300506032b657004220420...`
3. **Get Test HBAR**: Use [Hedera Testnet Faucet](https://portal.hedera.com/faucet)
4. **Update Config**: Add to `config.atlas-gdrive.env`

### 4. OpenWeatherMap (FREE - 1,000 calls/day)

1. **Sign Up**: Go to [OpenWeatherMap](https://openweathermap.org/api)
2. **Get API Key**: Free tier available
3. **Update Config**: Add to `config.atlas-gdrive.env`

## 🚀 QUICK START

```bash
# 1. Copy configuration
cp config.atlas-gdrive.env .env

# 2. Install dependencies
npm install

# 3. Start MongoDB (if using local)
mongod --dbpath ./data/db

# 4. Start the server
npm run start:dev

# 5. Test the API
curl http://localhost:4000/api/hedera/status
```

## 📊 COST BREAKDOWN

| Service | Cost | Limits |
|---------|------|--------|
| MongoDB Atlas | FREE | 512MB, shared cluster |
| Google Drive | FREE | 15GB storage |
| Hedera Testnet | FREE | Unlimited test transactions |
| OpenWeatherMap | FREE | 1,000 calls/day |
| Google Vision API | FREE | 1,000 requests/month |
| Google Geocoding | FREE | $200 credit/month |
| **TOTAL** | **$0** | **Perfect for development** |

## 🔧 PRODUCTION UPGRADES

When ready for production, consider:

1. **MongoDB Atlas**: Upgrade to M10+ ($57/month)
2. **Google Drive**: Upgrade to Google Workspace ($6/user/month)
3. **Hedera**: Switch to Mainnet (pay per transaction)
4. **Payment Processing**: Add Stripe/PayPal (2.9% per transaction)
5. **Notifications**: Add SendGrid ($14.95/month)

## 📱 API ENDPOINTS

### Hedera
- `GET /api/hedera/status` - Check Hedera connection
- `POST /api/hedera/tokenize` - Tokenize asset
- `POST /api/hedera/kyc/grant` - Grant KYC

### File Upload
- `POST /api/file-upload/upload` - Upload file to Google Drive
- `GET /api/file-upload/:id` - Get file info
- `DELETE /api/file-upload/:id` - Delete file

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset
- `GET /api/assets/:id` - Get asset details

### Verification
- `POST /api/verification/submit` - Submit for verification
- `GET /api/verification/status/:assetId` - Check verification status

## 🧪 TESTING

```bash
# Test Hedera connection
curl http://localhost:4000/api/hedera/status

# Test file upload
curl -X POST -F "file=@test.pdf" http://localhost:4000/api/file-upload/upload

# Test asset creation
curl -X POST http://localhost:4000/api/assets \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Asset","type":"AGRICULTURAL","value":10000}'
```

## 🐛 TROUBLESHOOTING

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/trustbridge"

# Test connection
npm run test:db
```

### Google Drive Issues
```bash
# Check credentials
node scripts/test-google-drive.js

# Refresh token
node scripts/refresh-google-token.js
```

### Hedera Issues
```bash
# Check account balance
node scripts/check-hedera-balance.js

# Test transaction
node scripts/test-hedera-tx.js
```

## 📞 SUPPORT

- **MongoDB Atlas**: [Support Center](https://support.mongodb.com)
- **Google Cloud**: [Support](https://cloud.google.com/support)
- **Hedera**: [Discord](https://discord.gg/hedera)
- **TrustBridge**: Create issue in repository
