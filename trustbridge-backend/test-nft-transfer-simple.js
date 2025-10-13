const { Client, PrivateKey, AccountId, TokenId, TransferTransaction, TokenAssociateTransaction, AccountAllowanceApproveTransaction, NftId } = require('@hashgraph/sdk');

// REPLACE THESE WITH YOUR ACTUAL KEYS:
const BUYER_KEY = 'PASTE_BUYER_KEY_HERE';
const SELLER_KEY = 'PASTE_SELLER_KEY_HERE';

const BUYER_ACCOUNT = '0.0.7028303';
const SELLER_ACCOUNT = '0.0.6923405';
const NFT_TOKEN = '0.0.7025544';
const NFT_SERIAL = 1;
const TRUST_TOKEN = '0.0.6916977';

async function test() {
  console.log('=== Testing NFT Transfer ===\n');
  
  if (BUYER_KEY === 'PASTE_BUYER_KEY_HERE' || SELLER_KEY === 'PASTE_SELLER_KEY_HERE') {
    console.log('❌ Please edit this file and add your private keys!');
    console.log('   BUYER_KEY for account 0.0.7028303');
    console.log('   SELLER_KEY for account 0.0.6923405');
    process.exit(1);
  }

  const sellerClient = Client.forTestnet().setOperator(AccountId.fromString(SELLER_ACCOUNT), PrivateKey.fromStringECDSA(SELLER_KEY));
  const buyerClient = Client.forTestnet().setOperator(AccountId.fromString(BUYER_ACCOUNT), PrivateKey.fromStringECDSA(BUYER_KEY));

  try {
    console.log('Step 1: Seller approves buyer...');
    const approvalTx = await (await new AccountAllowanceApproveTransaction()
      .approveTokenNftAllowance(new NftId(TokenId.fromString(NFT_TOKEN), NFT_SERIAL), AccountId.fromString(SELLER_ACCOUNT), AccountId.fromString(BUYER_ACCOUNT))
      .freezeWith(sellerClient)
      .sign(PrivateKey.fromStringECDSA(SELLER_KEY)))
      .execute(sellerClient);
    await approvalTx.getReceipt(sellerClient);
    console.log('✅', approvalTx.transactionId.toString(), '\n');

    console.log('Step 2: Buyer associates token...');
    try {
      const associateTx = await (await new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(BUYER_ACCOUNT))
        .setTokenIds([TokenId.fromString(NFT_TOKEN)])
        .freezeWith(buyerClient)
        .sign(PrivateKey.fromStringECDSA(BUYER_KEY)))
        .execute(buyerClient);
      await associateTx.getReceipt(buyerClient);
      console.log('✅', associateTx.transactionId.toString());
    } catch (e) {
      if (e.message.includes('ALREADY_ASSOCIATED')) console.log('✅ Already associated');
      else throw e;
    }
    console.log('');

    console.log('Step 3: Buyer pays TRUST...');
    const trustTx = await (await new TransferTransaction()
      .addTokenTransfer(TRUST_TOKEN, BUYER_ACCOUNT, -10)
      .addTokenTransfer(TRUST_TOKEN, SELLER_ACCOUNT, 9)
      .addTokenTransfer(TRUST_TOKEN, '0.0.6916959', 1)
      .freezeWith(buyerClient)
      .sign(PrivateKey.fromStringECDSA(BUYER_KEY)))
      .execute(buyerClient);
    await trustTx.getReceipt(buyerClient);
    console.log('✅', trustTx.transactionId.toString(), '\n');

    console.log('Step 4: Transferring NFT...');
    const nftTx = await (await new TransferTransaction()
      .addApprovedNftTransfer(TokenId.fromString(NFT_TOKEN), NFT_SERIAL, AccountId.fromString(SELLER_ACCOUNT), AccountId.fromString(BUYER_ACCOUNT))
      .freezeWith(buyerClient)
      .sign(PrivateKey.fromStringECDSA(BUYER_KEY)))
      .execute(buyerClient);
    await nftTx.getReceipt(buyerClient);
    console.log('✅', nftTx.transactionId.toString(), '\n');

    console.log('🎉 SUCCESS! NFT transferred to buyer!');
    console.log('View on Hashscan: https://hashscan.io/testnet/transaction/' + nftTx.transactionId.toString());
    
  } catch (e) {
    console.error('\n❌ FAILED:', e.message);
    if (e.status) console.error('Status:', e.status.toString());
  }
  
  sellerClient.close();
  buyerClient.close();
}

test();
