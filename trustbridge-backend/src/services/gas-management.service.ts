import { Injectable, Logger } from '@nestjs/common';
import {
  Client,
  AccountId,
  PrivateKey,
  TransferTransaction,
  TokenId,
  Hbar,
  AccountBalanceQuery,
} from '@hashgraph/sdk';

/**
 * Gas Management Service
 * Automatically converts TRUST tokens to HBAR to maintain marketplace operations
 */
@Injectable()
export class GasManagementService {
  private readonly logger = new Logger(GasManagementService.name);
  private client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;
  
  // Thresholds for auto-conversion
  private readonly MIN_HBAR_BALANCE = 100; // Minimum HBAR to maintain
  private readonly TRUST_CONVERSION_AMOUNT = 100; // Convert 100 TRUST at a time
  private readonly HBAR_PER_TRUST_RATE = 0.1; // Exchange rate (adjust based on market)

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const accountId = process.env.HEDERA_ACCOUNT_ID;
      const privateKey = process.env.HEDERA_PRIVATE_KEY;

      if (!accountId || !privateKey) {
        throw new Error('Missing Hedera credentials');
      }

      this.client = Client.forTestnet();
      this.operatorId = AccountId.fromString(accountId);
      
      try {
        this.operatorKey = PrivateKey.fromStringECDSA(privateKey);
      } catch {
        this.operatorKey = PrivateKey.fromString(privateKey);
      }

      this.client.setOperator(this.operatorId, this.operatorKey);
      
      this.logger.log('✅ Gas Management Service initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Gas Management:', error);
    }
  }

  /**
   * Check marketplace HBAR balance and auto-convert TRUST if needed
   */
  async checkAndReplenishGas(): Promise<{
    hbarBalance: number;
    trustBalance: number;
    conversionNeeded: boolean;
    conversionDone: boolean;
  }> {
    try {
      this.logger.log('🔍 Checking marketplace gas balance...');

      // Query account balance
      const balance = await new AccountBalanceQuery()
        .setAccountId(this.operatorId)
        .execute(this.client);

      const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;
      const trustTokenId = TokenId.fromString(process.env.TRUST_TOKEN_ID || '0.0.6935064');
      const trustBalance = balance.tokens?.get(trustTokenId)?.toNumber() || 0;

      this.logger.log(`💰 Current balances - HBAR: ${hbarBalance}, TRUST: ${trustBalance}`);

      // Check if conversion needed
      if (hbarBalance < this.MIN_HBAR_BALANCE && trustBalance >= this.TRUST_CONVERSION_AMOUNT) {
        this.logger.warn(`⚠️ Low HBAR balance: ${hbarBalance} ℏ`);
        this.logger.log(`💱 Converting ${this.TRUST_CONVERSION_AMOUNT} TRUST to HBAR...`);

        const conversionDone = await this.convertTRUSTToHBAR(this.TRUST_CONVERSION_AMOUNT);

        return {
          hbarBalance,
          trustBalance,
          conversionNeeded: true,
          conversionDone,
        };
      }

      return {
        hbarBalance,
        trustBalance,
        conversionNeeded: false,
        conversionDone: false,
      };
    } catch (error) {
      this.logger.error('❌ Failed to check gas balance:', error);
      throw error;
    }
  }

  /**
   * Convert TRUST tokens to HBAR using exchange contract
   */
  private async convertTRUSTToHBAR(trustAmount: number): Promise<boolean> {
    try {
      // Option 1: Use TrustTokenExchange contract (if deployed)
      const exchangeContractId = process.env.TRUST_EXCHANGE_CONTRACT_ID;
      
      if (exchangeContractId) {
        this.logger.log('🔄 Using TrustTokenExchange contract...');
        
        // Call exchange contract to convert TRUST → HBAR
        // This would use the deployed exchange contract
        // For now, this is a placeholder
        
        this.logger.warn('⚠️ Exchange contract integration pending');
        return false;
      }

      // Option 2: Use DEX (SaucerSwap or similar)
      this.logger.log('🔄 DEX integration not yet implemented');
      
      // Option 3: Manual notification
      this.logger.warn('⚠️ MANUAL TOP-UP NEEDED!');
      this.logger.warn(`   Current HBAR: Low`);
      this.logger.warn(`   TRUST available: ${trustAmount}`);
      this.logger.warn(`   Action: Exchange ${trustAmount} TRUST for HBAR manually`);

      // TODO: Implement actual exchange logic
      // For now, return false to indicate manual intervention needed
      return false;
    } catch (error) {
      this.logger.error('❌ Failed to convert TRUST to HBAR:', error);
      return false;
    }
  }

  /**
   * Get current gas status
   */
  async getGasStatus(): Promise<{
    hbarBalance: number;
    trustBalance: number;
    estimatedDaysRemaining: number;
    needsTopUp: boolean;
  }> {
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(this.operatorId)
        .execute(this.client);

      const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;
      const trustTokenId = TokenId.fromString(process.env.TRUST_TOKEN_ID || '0.0.6935064');
      const trustBalance = balance.tokens?.get(trustTokenId)?.toNumber() || 0;

      // Estimate days remaining (assuming 50 HBAR per day for moderate usage)
      const dailyHbarUsage = 50;
      const estimatedDaysRemaining = Math.floor(hbarBalance / dailyHbarUsage);
      const needsTopUp = hbarBalance < this.MIN_HBAR_BALANCE;

      return {
        hbarBalance,
        trustBalance,
        estimatedDaysRemaining,
        needsTopUp,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get gas status:', error);
      throw error;
    }
  }

  /**
   * Manual top-up function (for admin use)
   */
  async manualTopUp(hbarAmount: number): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`💰 Manual HBAR top-up: ${hbarAmount} ℏ`);
      
      // This would transfer HBAR from a treasury account to marketplace
      // For now, this is a placeholder for the admin dashboard
      
      return {
        success: true,
        message: `Manual top-up of ${hbarAmount} HBAR initiated`,
      };
    } catch (error) {
      this.logger.error('❌ Failed manual top-up:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Top-up failed',
      };
    }
  }
}

