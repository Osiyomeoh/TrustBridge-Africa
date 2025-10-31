import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import { ChevronRight, Book, Zap, Shield, Users, Globe, Phone, TrendingUp, Wallet, FileText, CircleHelp, CheckCircle, Coins, ArrowLeftRight, Image } from 'lucide-react';
import Button from '../components/UI/Button';
import { Link } from 'react-router-dom';

const Documentation: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('getting-started');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neon-green mb-3">Welcome to TrustBridge Africa</h3>
            <p className="text-off-white/80 mb-4">
              TrustBridge Africa is a revolutionary real-world asset (RWA) tokenization platform built on Hedera Hashgraph. 
              We enable African farmers and asset owners to tokenize their assets, making them accessible to global investors 
              through blockchain technology.
            </p>
          </div>

          <div className="bg-dark-gray/30 p-4 rounded-lg border border-neon-green/20">
            <h4 className="font-semibold text-electric-mint mb-2">🚀 Quick Start</h4>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Install HashPack wallet (required)</li>
              <li>Switch to Hedera Testnet in HashPack</li>
              <li>Get free test HBAR from faucet</li>
              <li>Connect wallet to TrustBridge</li>
              <li>Complete your profile and KYC</li>
              <li>Browse or create assets</li>
            </ol>
            <div className="mt-4 space-y-2">
              <a 
                href="https://hashpack.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neon-green hover:underline text-sm flex items-center gap-2"
              >
                Download HashPack →
              </a>
              <a 
                href="https://hashscan.io/testnet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neon-green hover:underline text-sm flex items-center gap-2"
              >
                Get Test HBAR →
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-2">🎯 Core Features</h4>
            <ul className="space-y-2 text-off-white/70 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <span>Real-World Asset Tokenization (RWAs) on Hedera</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <span>Digital Asset NFTs - Art, Music, Collectibles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <span>AMC (Asset Management Company) Pools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <span>Yield Distribution & ROI Tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <span>Trust Token Exchange - HBAR ↔ TRUST</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <span>USSD Mobile Banking Integration (Demo Available)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <span>AI-Powered Investment Analysis</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'asset-owner',
      title: 'For Asset Owners',
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neon-green mb-3">Tokenize Your Assets</h3>
            <p className="text-off-white/80 mb-4">
              Transform your real-world assets (farms, real estate, machinery) into tradeable digital tokens 
              on the Hedera blockchain.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 1: Connect & Verify</h4>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Connect your HashPack wallet to TrustBridge</li>
              <li>Complete KYC verification (via Didit)</li>
              <li>Verify your email address</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 2: Create Your Asset</h4>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Navigate to "Create RWA Asset" in the dashboard</li>
              <li>Fill in asset details (name, type, location, value)</li>
              <li>Upload supporting documents and evidence</li>
              <li>Set your expected APY (Annual Percentage Yield)</li>
              <li>Review and submit for AMC approval</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 3: AMC Approval</h4>
            <p className="text-off-white/70 text-sm mb-2">
              Your asset will be reviewed by our Asset Management Company (AMC) team. 
              Once approved:
            </p>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm">
              <li>Your asset receives a unique Hedera Token ID</li>
              <li>Metadata is stored on IPFS (decentralized storage)</li>
              <li>Asset status is updated on Hedera Consensus Service (HCS)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 4: Pool Creation</h4>
            <p className="text-off-white/70 text-sm mb-2">
              AMC may bundle your asset into a pool with other assets:
            </p>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm">
              <li>Pool tokens are created on Hedera Token Service (HTS)</li>
              <li>Pool becomes available for investment</li>
              <li>You earn royalties as investments are made</li>
            </ul>
          </div>

          <div className="bg-dark-gray/30 p-4 rounded-lg border border-neon-green/20">
            <h4 className="font-semibold text-electric-mint mb-2">💰 Earning ROI</h4>
            <p className="text-off-white/70 text-sm">
              As investors purchase tokens in pools containing your assets, you automatically earn 
              returns based on your asset's value and APY. Track your earnings in the "Portfolio" section.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'investor',
      title: 'For Investors',
      icon: Wallet,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neon-green mb-3">Invest in African Assets</h3>
            <p className="text-off-white/80 mb-4">
              Access diversified investment opportunities in African agriculture, real estate, and infrastructure 
              through blockchain-powered pools.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 1: Setup Your Account</h4>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Connect HashPack wallet</li>
              <li>Complete profile and KYC</li>
              <li>Ensure you have HBAR for gas fees</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 2: Browse Investment Opportunities</h4>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Visit the Marketplace or AMC Pools section</li>
              <li>Filter by asset type, APY, location, or risk level</li>
              <li>Review asset details and documentation</li>
              <li>Check AMC verification status</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 3: Make an Investment</h4>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Click "Invest" on a pool or asset</li>
              <li>Enter investment amount (converted to pool tokens)</li>
              <li>Review transaction details</li>
              <li>Approve the transaction in HashPack</li>
              <li>Receive pool tokens on Hedera</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 4: Track Returns</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm mb-4">
              <li>Monitor your portfolio in the dashboard</li>
              <li>Track APY and cumulative returns</li>
              <li>Receive dividends automatically as HBAR</li>
              <li>View transaction history on Hedera Explorer</li>
            </ul>
          </div>

          <div className="bg-dark-gray/30 p-4 rounded-lg border border-neon-green/20">
            <h4 className="font-semibold text-electric-mint mb-2">⚠️ Important Notes</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm">
              <li>Investments are non-refundable and subject to asset performance</li>
              <li>Returns are not guaranteed and depend on asset performance</li>
              <li>Always conduct due diligence before investing</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'mobile',
      title: 'Mobile USSD (Coming Soon)',
      icon: Phone,
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ USSD integration is currently in demo mode. Live integration requires approval from Africa's Talking.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-neon-green mb-3">Bankless Financial Inclusion</h3>
            <p className="text-off-white/80 mb-4">
              TrustBridge is building USSD integration to enable farmers and asset owners to tokenize assets 
              using just a basic mobile phone, without internet or smartphones.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">How USSD Will Work</h4>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Dial <code className="bg-dark-gray px-2 py-1 rounded">*384#</code> on any mobile phone</li>
              <li>Register with your name, state, and town</li>
              <li>Set a 4-digit PIN for security</li>
              <li>Navigate menus to tokenize your asset</li>
              <li>Pay via Paga agents or bank USSD</li>
              <li>Receive Hedera wallet address via SMS</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Demo Simulator</h4>
            <p className="text-off-white/70 text-sm mb-4">
              Try the USSD flow now using our interactive simulator. It demonstrates the complete 
              registration, asset tokenization, and portfolio viewing process.
            </p>
            <Link to="/ussd-demo">
              <Button variant="outline" size="sm">
                Try USSD Simulator
              </Button>
            </Link>
          </div>
        </div>
      )
    },
    {
      id: 'technical',
      title: 'Technical Documentation',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neon-green mb-3">Hedera Hashgraph Integration</h3>
            <p className="text-off-white/80 mb-4">
              TrustBridge is built on Hedera's enterprise-grade distributed ledger technology.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">HTS (Hedera Token Service)</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm mb-4">
              <li>NFTs: Unique tokens for individual RWA assets</li>
              <li>Fungible Tokens: Pool tokens for investments</li>
              <li>TRUST Token: Platform utility token</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">HCS (Hedera Consensus Service)</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm mb-4">
              <li>Immutable audit trail for asset creation</li>
              <li>Status updates and approvals</li>
              <li>Transaction history verification</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">IPFS (InterPlanetary File System)</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm mb-4">
              <li>Decentralized metadata storage</li>
              <li>Evidence documents and legal files</li>
              <li>Immutable content addressing (CIDs)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Wallet Integration</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm mb-4">
              <li>HashPack: Primary wallet for web interface</li>
              <li>WalletConnect: Standard protocol for connections</li>
              <li>Sponsor Account: Platform covers gas fees for USSD users</li>
            </ul>
          </div>

          <div className="bg-dark-gray/30 p-4 rounded-lg border border-neon-green/20">
            <h4 className="font-semibold text-electric-mint mb-2">🔗 Blockchain Explorer</h4>
            <p className="text-off-white/70 text-sm mb-2">
              View all transactions on Hedera Explorer:
            </p>
            <a 
              href="https://hashscan.io/testnet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neon-green hover:underline text-sm"
            >
              HashScan Testnet → 
            </a>
          </div>
        </div>
      )
    },
    {
      id: 'digital-creator',
      title: 'For Digital Creators',
      icon: Image,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neon-green mb-3">Create & Sell Digital Assets</h3>
            <p className="text-off-white/80 mb-4">
              Tokenize your digital art, music, videos, documents, and collectibles as NFTs on Hedera. 
              Earn royalties on every sale, forever.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 1: Prepare Your Content</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm mb-4">
              <li>Upload your artwork, music file, video, or document</li>
              <li>Add rich metadata (name, description, attributes)</li>
              <li>Set royalty percentage (e.g., 10% for life)</li>
              <li>Upload to IPFS for decentralized storage</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 2: Mint Your NFT</h4>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Navigate to "Create Digital Asset"</li>
              <li>Select content type (art, music, video, document)</li>
              <li>Create HTS NFT collection or single NFT</li>
              <li>Mint with IPFS CID linked to metadata</li>
              <li>Set initial sale price or enable auction</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 3: List on Marketplace</h4>
            <p className="text-off-white/70 text-sm mb-2">
              Your NFT is automatically listed on the TrustBridge marketplace where buyers can:
            </p>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm">
              <li>Browse your digital assets</li>
              <li>Make direct purchases or bid at auction</li>
              <li>View ownership history on Hedera</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Step 4: Earn Royalties Forever</h4>
            <p className="text-off-white/70 text-sm mb-2">
              Every time your NFT is resold, you automatically receive:
            </p>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm">
              <li>Your set royalty percentage (10% default)</li>
              <li>HBAR transferred directly to your wallet</li>
              <li>Complete transaction history tracked</li>
            </ul>
          </div>

          <div className="bg-dark-gray/30 p-4 rounded-lg border border-neon-green/20">
            <h4 className="font-semibold text-electric-mint mb-2">💡 Pro Tips</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm">
              <li>Create collections to organize your work</li>
              <li>Use descriptive metadata for better discoverability</li>
              <li>Set competitive pricing or use auctions</li>
              <li>Promote your work to grow your audience</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'trust-economy',
      title: 'Trust Token & Exchange',
      icon: Coins,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neon-green mb-3">TRUST Token Economy</h3>
            <p className="text-off-white/80 mb-4">
              TRUST is the native platform token powering the TrustBridge ecosystem. Use it for fees, 
              governance, staking, and more.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">What is TRUST Token?</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm mb-4">
              <li>Native utility token on Hedera blockchain</li>
              <li>Deflationary - tokens burned on transactions</li>
              <li>Governance - vote on platform proposals</li>
              <li>Staking - earn rewards by locking tokens</li>
              <li>Platform fees - pay with TRUST</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">How to Get TRUST Tokens</h4>
            <p className="text-off-white/70 text-sm mb-3">
              <strong>Option 1: Exchange HBAR for TRUST (Easiest)</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 text-off-white/70 text-sm mb-4">
              <li>Visit "Exchange" in the sidebar</li>
              <li>Select "Swap HBAR → TRUST"</li>
              <li>Enter amount to swap</li>
              <li>Review exchange rate</li>
              <li>Approve transaction in HashPack</li>
              <li>Receive TRUST tokens instantly</li>
            </ol>

            <p className="text-off-white/70 text-sm mb-3">
              <strong>Option 2: Earn Through Participation</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm">
              <li>Platform rewards and incentives</li>
              <li>Referral bonuses</li>
              <li>Early adopter programs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Using TRUST Tokens</h4>
            <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm mb-4">
              <li><strong>Platform Fees:</strong> Pay for asset creation, trading, and services</li>
              <li><strong>Governance:</strong> Vote on DAO proposals and platform changes</li>
              <li><strong>Staking:</strong> Lock tokens to earn rewards</li>
              <li><strong>Trading:</strong> Use in AMC pool investments</li>
              <li><strong>AI Services:</strong> Pay for AI analysis and insights</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Exchange Details</h4>
            <div className="bg-dark-gray/30 p-4 rounded-lg border border-neon-green/20">
              <p className="text-off-white/70 text-sm mb-2">
                <strong>HBAR ↔ TRUST Exchange:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-off-white/70 text-sm">
                <li>Market-driven exchange rates</li>
                <li>Instant swaps on Hedera</li>
                <li>Low fees (~$0.001)</li>
                <li>Secure blockchain transactions</li>
                <li>Track exchange history</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: CircleHelp,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-electric-mint mb-3">What is RWA Tokenization?</h4>
            <p className="text-off-white/70 text-sm mb-4">
              RWA (Real-World Asset) tokenization converts physical assets like farms, real estate, 
              or machinery into digital tokens on a blockchain. This allows fractional ownership and 
              global investment access.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Why Hedera?</h4>
            <p className="text-off-white/70 text-sm mb-4">
              Hedera offers 3-second finality, $0.001 transaction fees, and enterprise-grade security 
              through hashgraph consensus. It's carbon-negative and supports both fungible and 
              non-fungible tokens (HTS) plus immutable audit trails (HCS).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Do I need crypto to use TrustBridge?</h4>
            <p className="text-off-white/70 text-sm mb-4">
              For the web interface: Yes, you need HBAR in HashPack for transaction fees. For USSD 
              (coming soon): No, you can pay cash via Paga agents, and the platform sponsors your gas fees.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">How do I get HBAR?</h4>
            <p className="text-off-white/70 text-sm mb-4">
              Purchase HBAR on exchanges like Binance, Coinbase, or directly through HashPack. 
              For testnet, use our "Get Test Tokens" feature for free HBAR.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">What are the fees?</h4>
            <p className="text-off-white/70 text-sm mb-4">
              <strong className="text-electric-mint">Hedera:</strong> ~$0.001 per transaction<br />
              <strong className="text-electric-mint">IPFS:</strong> Free (via Pinata)<br />
              <strong className="text-electric-mint">Platform:</strong> TBD (subject to governance)
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Is my asset data secure?</h4>
            <p className="text-off-white/70 text-sm mb-4">
              Yes. Metadata is stored on decentralized IPFS, transactions are immutable on Hedera, 
              and your wallet keys never leave your device. We use industry-standard encryption.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-electric-mint mb-3">Can I sell my tokens?</h4>
            <p className="text-off-white/70 text-sm mb-4">
              Token liquidity depends on market demand. Pools typically have lock periods. 
              Secondary markets may develop over time.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-off-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Book className="w-8 h-8 text-neon-green" />
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="text-neon-green">TRUSTBRIDGE</span>
              <br />
              <span className="text-electric-mint">DOCUMENTATION</span>
            </h1>
          </div>
        </div>
        <p className="text-base sm:text-lg text-off-white/70 max-w-3xl">
          Complete guide to tokenizing real-world assets, investing in African opportunities, 
          and leveraging Hedera blockchain technology for financial inclusion.
        </p>
      </motion.div>

      {/* Documentation Sections */}
      <div className="max-w-5xl mx-auto space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} variant="floating">
              <CardHeader>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-neon-green" />
                    <CardTitle className="text-lg sm:text-xl">{section.title}</CardTitle>
                  </div>
                  <motion.div
                    animate={{ rotate: openSection === section.id ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-6 h-6 text-electric-mint" />
                  </motion.div>
                </button>
              </CardHeader>
              {openSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="pt-0">
                    {section.content}
                  </CardContent>
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>

      {/* CTA Section */}
      <motion.div
        className="mt-12 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card variant="floating" className="bg-gradient-to-br from-neon-green/10 to-electric-mint/10 border-2 border-neon-green/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-neon-green mb-3">Ready to Get Started?</h3>
            <p className="text-off-white/70 mb-6">
              Connect your wallet and start your journey with TrustBridge Africa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="neon" size="lg">Connect Wallet</Button>
              </Link>
              <Link to="/ussd-demo">
                <Button variant="outline" size="lg">Try USSD Demo</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <div className="mt-8 max-w-5xl mx-auto text-center">
        <p className="text-off-white/50 text-sm mb-4">Need more help?</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a 
            href="https://hashscan.io/testnet" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neon-green hover:underline text-sm"
          >
            View on HashScan →
          </a>
          <a 
            href="https://hedera.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neon-green hover:underline text-sm"
          >
            Learn About Hedera →
          </a>
          <a 
            href="https://docs.hedera.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neon-green hover:underline text-sm"
          >
            Hedera Documentation →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Documentation;

