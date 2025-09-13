import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { HederaService } from './hedera.service';
import { TokenizationRequestDto } from './dto/tokenization-request.dto';

export class SettlementRequestDto {
  assetId: string;
  buyer: string;
  seller: string;
  amount: number;
  deliveryDeadline: Date;
}

export class KYCRequestDto {
  @ApiProperty({ example: '0.0.1234567' })
  @IsString()
  accountId: string;

  @ApiProperty({ example: '0.0.9876543' })
  @IsString()
  tokenId: string;

  @ApiProperty({ example: 'GRANT', enum: ['GRANT', 'REVOKE'] })
  @IsString()
  kycStatus: 'GRANT' | 'REVOKE';

  @ApiProperty({ example: 'KYC verification completed', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class FreezeRequestDto {
  @ApiProperty({ example: '0.0.1234567' })
  @IsString()
  accountId: string;

  @ApiProperty({ example: '0.0.9876543' })
  @IsString()
  tokenId: string;

  @ApiProperty({ example: 'FREEZE', enum: ['FREEZE', 'UNFREEZE'] })
  @IsString()
  freezeStatus: 'FREEZE' | 'UNFREEZE';

  @ApiProperty({ example: 'Compliance violation', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class TokenAssociationRequestDto {
  @ApiProperty({ example: '0.0.1234567' })
  @IsString()
  accountId: string;

  @ApiProperty({ example: '0.0.9876543' })
  @IsString()
  tokenId: string;

  @ApiProperty({ example: 'ASSOCIATE', enum: ['ASSOCIATE', 'DISSOCIATE'] })
  @IsString()
  action: 'ASSOCIATE' | 'DISSOCIATE';
}

@ApiTags('Hedera')
@Controller('api/hedera')
export class HederaController {
  constructor(private readonly hederaService: HederaService) {}

  @Get()
  @ApiOperation({ summary: 'Get Hedera services overview' })
  @ApiResponse({ status: 200, description: 'Hedera services overview' })
  async getHederaOverview() {
    return {
      success: true,
      data: {
        status: 'Hedera services are running',
        availableEndpoints: [
          'GET /api/hedera/status - Get network status',
          'POST /api/hedera/tokenize - Create asset token',
          'POST /api/hedera/mint/:tokenId - Mint tokens',
          'POST /api/hedera/transfer - Transfer tokens',
          'GET /api/hedera/balance/:accountId - Get account balance',
          'GET /api/hedera/token-balance/:accountId/:tokenId - Get token balance',
          'POST /api/hedera/kyc/grant - Grant KYC status',
          'POST /api/hedera/kyc/revoke - Revoke KYC status',
          'POST /api/hedera/freeze - Freeze account',
          'POST /api/hedera/unfreeze - Unfreeze account'
        ]
      },
      message: 'Hedera services are operational'
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Hedera services status' })
  @ApiResponse({ status: 200, description: 'Hedera services status' })
  async getStatus() {
    const status = await this.hederaService.getNetworkStatus();
    return {
      success: true,
      data: status,
      message: 'Hedera services status'
    };
  }

  @Post('tokenize')
  @ApiOperation({ summary: 'Create asset token on Hedera' })
  @ApiBody({ type: TokenizationRequestDto })
  @ApiResponse({ status: 201, description: 'Asset tokenized successfully' })
  async tokenizeAsset(@Body() tokenizationRequest: TokenizationRequestDto) {
    const result = await this.hederaService.createAssetToken(tokenizationRequest);
    return {
      success: true,
      data: result,
      message: 'Asset tokenized successfully'
    };
  }

  @Post('mint/:tokenId')
  @ApiOperation({ summary: 'Mint tokens for asset' })
  @ApiResponse({ status: 200, description: 'Tokens minted successfully' })
  async mintTokens(
    @Param('tokenId') tokenId: string,
    @Body() body: { amount: number; recipient: string }
  ) {
    const transactionId = await this.hederaService.mintTokens(
      tokenId,
      body.amount,
      body.recipient
    );
    return {
      success: true,
      data: { transactionId },
      message: 'Tokens minted successfully'
    };
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer tokens between accounts' })
  @ApiResponse({ status: 200, description: 'Tokens transferred successfully' })
  async transferTokens(@Body() body: {
    tokenId: string;
    from: string;
    to: string;
    amount: number;
  }) {
    const transactionId = await this.hederaService.transferTokens(
      body.tokenId,
      body.from,
      body.to,
      body.amount
    );
    return {
      success: true,
      data: { transactionId },
      message: 'Tokens transferred successfully'
    };
  }

  @Post('settlement')
  @ApiOperation({ summary: 'Create settlement on Hedera' })
  @ApiBody({ type: SettlementRequestDto })
  @ApiResponse({ status: 201, description: 'Settlement created successfully' })
  async createSettlement(@Body() settlementRequest: SettlementRequestDto) {
    const transactionId = await this.hederaService.createSettlement(settlementRequest);
    return {
      success: true,
      data: { transactionId },
      message: 'Settlement created successfully'
    };
  }

  @Get('balance/:accountId')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Account balance retrieved' })
  async getAccountBalance(@Param('accountId') accountId: string) {
    const balance = await this.hederaService.getAccountBalance(accountId);
    return {
      success: true,
      data: { accountId, balance },
      message: 'Account balance retrieved'
    };
  }

  @Get('token-balance/:accountId/:tokenId')
  @ApiOperation({ summary: 'Get token balance for account' })
  @ApiResponse({ status: 200, description: 'Token balance retrieved' })
  async getTokenBalance(
    @Param('accountId') accountId: string,
    @Param('tokenId') tokenId: string
  ) {
    const balance = await this.hederaService.getTokenBalance(accountId, tokenId);
    return {
      success: true,
      data: { accountId, tokenId, balance },
      message: 'Token balance retrieved'
    };
  }

  @Post('hcs/message')
  @ApiOperation({ summary: 'Submit message to HCS topic' })
  @ApiResponse({ status: 200, description: 'Message submitted successfully' })
  async submitHCSMessage(@Body() body: { topicId: string; message: any }) {
    const transactionId = await this.hederaService.createHCSMessage(
      body.topicId,
      body.message
    );
    return {
      success: true,
      data: { transactionId },
      message: 'HCS message submitted successfully'
    };
  }

  @Post('hfs/upload')
  @ApiOperation({ summary: 'Upload file to HFS' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(@Body() body: { content: string; fileName: string }) {
    const contentBuffer = Buffer.from(body.content, 'base64');
    const fileId = await this.hederaService.storeFileOnHFS(contentBuffer, body.fileName);
    return {
      success: true,
      data: { fileId },
      message: 'File uploaded successfully'
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for Hedera services' })
  @ApiResponse({ status: 200, description: 'Health status' })
  async healthCheck() {
    const isHealthy = await this.hederaService.healthCheck();
    return {
      success: true,
      data: { healthy: isHealthy },
      message: isHealthy ? 'Hedera services are healthy' : 'Hedera services are not responding'
    };
  }

  // KYC Management Endpoints
  @Post('kyc/grant')
  @ApiOperation({ summary: 'Grant KYC status for account on token' })
  @ApiBody({ type: KYCRequestDto })
  @ApiResponse({ status: 200, description: 'KYC granted successfully' })
  async grantKYC(@Body() kycRequest: KYCRequestDto) {
    const transactionId = await this.hederaService.grantKYC(kycRequest);
    return {
      success: true,
      data: { transactionId },
      message: 'KYC granted successfully'
    };
  }

  @Post('kyc/revoke')
  @ApiOperation({ summary: 'Revoke KYC status for account on token' })
  @ApiBody({ type: KYCRequestDto })
  @ApiResponse({ status: 200, description: 'KYC revoked successfully' })
  async revokeKYC(@Body() kycRequest: KYCRequestDto) {
    const transactionId = await this.hederaService.revokeKYC(kycRequest);
    return {
      success: true,
      data: { transactionId },
      message: 'KYC revoked successfully'
    };
  }


  // Freeze Management Endpoints
  @Post('freeze')
  @ApiOperation({ summary: 'Freeze account for token' })
  @ApiBody({ type: FreezeRequestDto })
  @ApiResponse({ status: 200, description: 'Account frozen successfully' })
  async freezeAccount(@Body() freezeRequest: FreezeRequestDto) {
    const transactionId = await this.hederaService.freezeAccount(freezeRequest);
    return {
      success: true,
      data: { transactionId },
      message: 'Account frozen successfully'
    };
  }

  @Post('unfreeze')
  @ApiOperation({ summary: 'Unfreeze account for token' })
  @ApiBody({ type: FreezeRequestDto })
  @ApiResponse({ status: 200, description: 'Account unfrozen successfully' })
  async unfreezeAccount(@Body() freezeRequest: FreezeRequestDto) {
    const transactionId = await this.hederaService.unfreezeAccount(freezeRequest);
    return {
      success: true,
      data: { transactionId },
      message: 'Account unfrozen successfully'
    };
  }

  @Post('freeze/token')
  @ApiOperation({ summary: 'Freeze or unfreeze token' })
  @ApiBody({ type: FreezeRequestDto })
  @ApiResponse({ status: 200, description: 'Token freeze status updated successfully' })
  async freezeToken(@Body() freezeRequest: FreezeRequestDto) {
    const transactionId = await this.hederaService.freezeToken(freezeRequest);
    return {
      success: true,
      data: { transactionId },
      message: `Token ${freezeRequest.freezeStatus === 'FREEZE' ? 'frozen' : 'unfrozen'} successfully`
    };
  }

  // Token Association Endpoints
  @Post('associate')
  @ApiOperation({ summary: 'Associate token with account' })
  @ApiBody({ type: TokenAssociationRequestDto })
  @ApiResponse({ status: 200, description: 'Token associated successfully' })
  async associateToken(@Body() associationRequest: TokenAssociationRequestDto) {
    const transactionId = await this.hederaService.associateToken(associationRequest);
    return {
      success: true,
      data: { transactionId },
      message: 'Token associated successfully'
    };
  }

  @Post('dissociate')
  @ApiOperation({ summary: 'Dissociate token from account' })
  @ApiBody({ type: TokenAssociationRequestDto })
  @ApiResponse({ status: 200, description: 'Token dissociated successfully' })
  async dissociateToken(@Body() associationRequest: TokenAssociationRequestDto) {
    const transactionId = await this.hederaService.dissociateToken(associationRequest);
    return {
      success: true,
      data: { transactionId },
      message: 'Token dissociated successfully'
    };
  }

  // Token Information Endpoints
  @Get('token-info/:tokenId')
  @ApiOperation({ summary: 'Get token information' })
  @ApiResponse({ status: 200, description: 'Token information retrieved' })
  async getTokenInfo(@Param('tokenId') tokenId: string) {
    const tokenInfo = await this.hederaService.getTokenInfo(tokenId);
    return {
      success: true,
      data: tokenInfo,
      message: 'Token information retrieved'
    };
  }

  @Get('account-info/:accountId')
  @ApiOperation({ summary: 'Get account information' })
  @ApiResponse({ status: 200, description: 'Account information retrieved' })
  async getAccountInfo(@Param('accountId') accountId: string) {
    const accountInfo = await this.hederaService.getAccountInfo(accountId);
    return {
      success: true,
      data: accountInfo,
      message: 'Account information retrieved'
    };
  }

  // Compliance Workflow Endpoints
  @Post('compliance/kyc-workflow')
  @ApiOperation({ summary: 'Complete KYC workflow (associate + grant/revoke KYC)' })
  @ApiResponse({ status: 200, description: 'KYC workflow completed' })
  async completeKYCWorkflow(@Body() body: {
    accountId: string;
    tokenId: string;
    kycStatus: 'GRANT' | 'REVOKE';
  }) {
    const result = await this.hederaService.completeKYCWorkflow(
      body.accountId,
      body.tokenId,
      body.kycStatus
    );
    return {
      success: true,
      data: result,
      message: 'KYC workflow completed successfully'
    };
  }

  @Post('compliance/freeze-workflow')
  @ApiOperation({ summary: 'Complete freeze workflow (freeze/unfreeze account)' })
  @ApiResponse({ status: 200, description: 'Freeze workflow completed' })
  async completeFreezeWorkflow(@Body() body: {
    accountId: string;
    tokenId: string;
    freezeStatus: 'FREEZE' | 'UNFREEZE';
  }) {
    const result = await this.hederaService.completeFreezeWorkflow(
      body.accountId,
      body.tokenId,
      body.freezeStatus
    );
    return {
      success: true,
      data: result,
      message: 'Freeze workflow completed successfully'
    };
  }
}
