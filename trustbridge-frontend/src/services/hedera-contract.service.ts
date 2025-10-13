import { 
  Client, 
  AccountId, 
  PrivateKey, 
  ContractId, 
  ContractCallQuery, 
  ContractExecuteTransaction,
  Hbar,
  TokenId,
  TransferTransaction,
  TokenMintTransaction,
  TokenBurnTransaction
} from '@hashgraph/sdk';

export interface ContractConfig {
  network: 'testnet' | 'mainnet';
  operatorId: string;
  operatorKey: string;
  exchangeContractId: string;
  burnerContractId: string;
  stakingContractId: string;
  trustTokenId: string;
  treasuryAccountId: string;
  operationsAccountId: string;
  stakingAccountId: string;
}

export class HederaContractService {
  private client: Client;
  private config: ContractConfig;

  constructor(config: ContractConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  private createClient(): Client {
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(this.config.operatorId),
      PrivateKey.fromStringECDSA(this.config.operatorKey)
    );
    return client;
  }

  private createClientWithSigner(signer: any): Client {
    const client = Client.forTestnet();
    // Don't set operator for user-signed transactions
    return client;
  }

  /**
   * Get exchange information from the contract
   */
  async getExchangeInfo(): Promise<any> {
    try {
      const contractId = ContractId.fromString(this.config.exchangeContractId);
      
      // Read the constants from the contract
      const exchangeRateQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('EXCHANGE_RATE');

      const exchangeFeeQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('EXCHANGE_FEE_RATE');

      const minExchangeQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('MIN_EXCHANGE');

      const treasuryPercentQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('TREASURY_PERCENT');

      const operationsPercentQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('OPERATIONS_PERCENT');

      const stakingPercentQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('STAKING_PERCENT');

      const feePercentQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('FEE_PERCENT');

      // Execute all queries
      const [exchangeRateRes, exchangeFeeRes, minExchangeRes, treasuryRes, operationsRes, stakingRes, feeRes] = await Promise.all([
        exchangeRateQuery.execute(this.client),
        exchangeFeeQuery.execute(this.client),
        minExchangeQuery.execute(this.client),
        treasuryPercentQuery.execute(this.client),
        operationsPercentQuery.execute(this.client),
        stakingPercentQuery.execute(this.client),
        feePercentQuery.execute(this.client)
      ]);

      return {
        exchangeRate: exchangeRateRes.getUint256(0).toNumber(),
        exchangeFeeRate: exchangeFeeRes.getUint256(0).toNumber() / 10000, // Convert from basis points
        minExchange: minExchangeRes.getUint256(0).toNumber() / 100000000, // Convert from wei to HBAR
        distribution: {
          treasury: treasuryRes.getUint256(0).toNumber() / 10000,
          operations: operationsRes.getUint256(0).toNumber() / 10000,
          staking: stakingRes.getUint256(0).toNumber() / 10000,
          fees: feeRes.getUint256(0).toNumber() / 10000
        }
      };
    } catch (error) {
      console.error('Failed to get exchange info from contract:', error);
      throw error;
    }
  }

  /**
   * Calculate exchange amount from contract
   */
  async calculateExchange(hbarAmount: number): Promise<number> {
    try {
      const exchangeInfo = await this.getExchangeInfo();
      const hbarInWei = Math.floor(hbarAmount * 100000000); // Convert HBAR to wei
      const exchangeFee = Math.floor((hbarInWei * exchangeInfo.exchangeFeeRate * 10000) / 10000);
      const netHbarAmount = hbarInWei - exchangeFee;
      const trustAmount = Math.floor((netHbarAmount * exchangeInfo.exchangeRate) / 100000000);
      
      console.log(`Calculating exchange: ${hbarAmount} HBAR -> ${trustAmount} TRUST tokens`);
      return trustAmount;
    } catch (error) {
      console.error('Failed to calculate exchange from contract:', error);
      // Fallback calculation
      return Math.floor(hbarAmount * 100 * 0.99);
    }
  }

  /**
   * Create HBAR transfer transaction for user to sign
   */
  createHbarTransferTransaction(
    fromAccountId: string,
    hbarAmount: number
  ): TransferTransaction {
    const hbarAmountObj = new Hbar(hbarAmount);
    
    return new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(fromAccountId), hbarAmountObj.negated())
      .addHbarTransfer(AccountId.fromString(this.config.treasuryAccountId), hbarAmountObj)
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(this.client);
  }

  /**
   * Create TRUST token transfer transaction for user to sign
   */
  createTrustTokenTransferTransaction(
    fromAccountId: string,
    toAccountId: string,
    amount: number
  ): TransferTransaction {
    return new TransferTransaction()
      .addTokenTransfer(
        TokenId.fromString(this.config.trustTokenId),
        AccountId.fromString(fromAccountId),
        -amount
      )
      .addTokenTransfer(
        TokenId.fromString(this.config.trustTokenId),
        AccountId.fromString(toAccountId),
        amount
      )
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(this.client);
  }

  /**
   * Execute HBAR transfer with user signature
   */
  async executeHbarTransfer(
    transaction: TransferTransaction,
    userPrivateKey: PrivateKey
  ): Promise<string> {
    try {
      transaction.sign(userPrivateKey);
      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      return response.transactionId.toString();
    } catch (error) {
      console.error('Failed to execute HBAR transfer:', error);
      throw error;
    }
  }

  /**
   * Execute TRUST token transfer with user signature
   */
  async executeTrustTokenTransfer(
    transaction: TransferTransaction,
    userPrivateKey: PrivateKey
  ): Promise<string> {
    try {
      transaction.sign(userPrivateKey);
      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      return response.transactionId.toString();
    } catch (error) {
      console.error('Failed to execute TRUST token transfer:', error);
      throw error;
    }
  }

  /**
   * Mint TRUST tokens (operator only)
   */
  async mintTrustTokens(toAccountId: string, amount: number): Promise<string> {
    try {
      // Step 1: Mint tokens (they go to treasury/operator by default)
      const mintTx = new TokenMintTransaction()
        .setTokenId(TokenId.fromString(this.config.trustTokenId))
        .setAmount(amount)
        .setMaxTransactionFee(new Hbar(5));

      const mintResponse = await mintTx.execute(this.client);
      const mintReceipt = await mintResponse.getReceipt(this.client);
      console.log(`✅ Tokens minted to treasury: ${mintResponse.transactionId.toString()}`);

      // Step 2: Transfer minted tokens from treasury to user
      const transferTx = new TransferTransaction()
        .addTokenTransfer(
          TokenId.fromString(this.config.trustTokenId),
          AccountId.fromString(this.config.operatorId),
          -amount
        )
        .addTokenTransfer(
          TokenId.fromString(this.config.trustTokenId),
          AccountId.fromString(toAccountId),
          amount
        )
        .setMaxTransactionFee(new Hbar(5));

      const transferResponse = await transferTx.execute(this.client);
      const transferReceipt = await transferResponse.getReceipt(this.client);
      console.log(`✅ Tokens transferred to user ${toAccountId}: ${transferResponse.transactionId.toString()}`);

      return transferResponse.transactionId.toString();
    } catch (error) {
      console.error('Failed to mint and transfer TRUST tokens:', error);
      throw error;
    }
  }

  /**
   * Burn TRUST tokens (operator only)
   */
  async burnTrustTokens(amount: number): Promise<string> {
    try {
      const burnTx = new TokenBurnTransaction()
        .setTokenId(TokenId.fromString(this.config.trustTokenId))
        .setAmount(amount)
        .setMaxTransactionFee(new Hbar(5));

      const response = await burnTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      return response.transactionId.toString();
    } catch (error) {
      console.error('Failed to burn TRUST tokens:', error);
      throw error;
    }
  }

  /**
   * Get TRUST token balance for an account
   */
  async getTrustTokenBalance(accountId: string): Promise<number> {
    try {
      const accountBalance = await this.client.getAccountBalance(AccountId.fromString(accountId));
      const tokenBalance = accountBalance.tokens.get(TokenId.fromString(this.config.trustTokenId));
      return tokenBalance ? tokenBalance.toNumber() : 0;
    } catch (error) {
      console.error('Failed to get TRUST token balance:', error);
      return 0;
    }
  }

  /**
   * Calculate NFT creation fee from contract
   */
  async calculateNftCreationFee(verificationLevel: string, rarity: string): Promise<number> {
    try {
      const contractId = ContractId.fromString(this.config.burnerContractId);
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('calculateBurnFee', [
          verificationLevel === 'premium' ? 1 : 0,
          rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : 1
        ]);

      const response = await query.execute(this.client);
      return response.getUint256(0).toNumber();
    } catch (error) {
      console.error('Failed to calculate NFT creation fee from contract:', error);
      // Fallback calculation
      const baseCost = 50;
      const verificationMultiplier = verificationLevel === 'premium' ? 2 : 1;
      const rarityMultiplier = rarity === 'legendary' ? 3 :
                              rarity === 'epic' ? 2 : 1;
      return baseCost * verificationMultiplier * rarityMultiplier;
    }
  }
}

// Default configuration for testnet
export const defaultContractConfig: ContractConfig = {
  network: 'testnet',
  operatorId: '0.0.6916959',
  operatorKey: '0x29b72f47916186bb1cf4b823429d99f6e5659703b0201a8381211a468a1e2a19',
  exchangeContractId: '0.0.6935003',  // Actual deployed contract ID
  burnerContractId: '0.0.6935005',    // Actual deployed contract ID
  stakingContractId: '0.0.6935008',   // Actual deployed contract ID
  trustTokenId: '0.0.6935064',
  treasuryAccountId: '0.0.6916959',
  operationsAccountId: '0.0.6916959',
  stakingAccountId: '0.0.6916959'
};

// Create default service instance
export const hederaContractService = new HederaContractService(defaultContractConfig);
