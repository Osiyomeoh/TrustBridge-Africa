import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { AdminStatusPersistent } from './components/Admin/AdminStatusPersistent';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { ProfileCompletionProvider } from './contexts/ProfileCompletionContext';
import Navigation from './components/Layout/Navigation';
import UniversalHeader from './components/Layout/UniversalHeader';
import AnimatedBackground from './components/UI/AnimatedBackground';
import { Toaster } from './components/UI/Toaster';
import AIChatbot from './components/AI/AIChatbot';
import Landing from './pages/Landing';
import AIStudio from './pages/AIStudio';
import Auth from './pages/Auth';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AssetVerification from './pages/AssetVerification';
import PublicAssetViewer from './pages/PublicAssetViewer';
import AssetTradingInterface from './pages/AssetTradingInterface';
import VerificationDashboard from './pages/VerificationDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAssets from './pages/AdminAssets';
import HederaAdminManagement from './components/Admin/HederaAdminManagement';
import AssetMarketplace from './pages/AssetMarketplace';
import Profile from './pages/Profile';
import ProfileSimple from './pages/ProfileSimple';
import ProfileCompletionModal from './components/Auth/ProfileCompletionModal';
import CreateDigitalAsset from './pages/CreateDigitalAsset';
import RWAAssetSubmission from './components/RWA/CreateRWAAsset';
import RWATradingInterface from './components/Trading/RWATradingInterface';
import SecondaryMarkets from './pages/SecondaryMarkets';
import SPVManagement from './pages/SPVManagement';
import DAOGovernance from './pages/DAOGovernance';
import PoolDashboard from './components/Pools/PoolDashboard';
import TradingInterface from './components/Trading/TradingInterface';
import TrustTokenStaking from './components/Token/TrustTokenStaking';
import GetTestTokens from './pages/GetTestTokens';
import HederaWalletTest from './pages/HederaWalletTest';
import HederaBasicTest from './pages/HederaBasicTest';
import DiditCallback from './pages/DiditCallback';
import Collections from './pages/Collections';
import Activity from './pages/Activity';
import CreateRWAAsset from './components/RWA/CreateRWAAsset';
import SecondaryTradingInterface from './components/Trading/SecondaryTradingInterface';
import KYCCallback from './pages/KYCCallback';
import AMCDashboard from './components/RWA/AMCDashboard';
import RWAAssetManagement from './components/RWA/RWAAssetManagement';
import AMCPoolManagement from './components/AMC/AMCPoolManagement';
import PoolMarketplace from './components/AMC/PoolMarketplace';
import PoolTradingInterface from './components/Trading/PoolTradingInterface';
import PoolTradingDashboard from './components/Trading/PoolTradingDashboard';
import PoolTokenPortfolio from './components/Trading/PoolTokenPortfolio';
import DividendManagement from './components/AMC/DividendManagement';
import GovernmentIdRequirements from './pages/help/GovernmentIdRequirements';
import ProofOfAddressRequirements from './pages/help/ProofOfAddressRequirements';
import ProfessionalLicenseRequirements from './pages/help/ProfessionalLicenseRequirements';
import ResumeRequirements from './pages/help/ResumeRequirements';
import USSDDemo from './pages/USSDDemo';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Global auth guard component - now just renders children since header handles profile completion
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Component that adjusts main content margin based on sidebar state
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  
  // Don't show header for landing page since it has its own header
  const showHeader = location.pathname !== '/';
  
  return (
    <div className="min-h-screen bg-black text-off-white font-secondary relative overflow-hidden dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
      <Navigation />
      {showHeader && <UniversalHeader />}
      <div className={`pt-16 sm:pt-20 lg:pt-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-56 xl:ml-64'
      }`}>
        {children}
      </div>
      <AnimatedBackground />
      
      {/* AI Components - Available on all dashboard pages */}
      <AIChatbot />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
        <WalletProvider>
          <AuthProvider>
            <AdminProvider>
              <AdminStatusPersistent />
              <ProfileCompletionProvider>
                <SidebarProvider>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <Routes>
                  {/* Landing Page - No Navigation */}
                  <Route path="/" element={<Landing />} />
                  
                  {/* USSD Demo - Public Demo Page */}
                  <Route path="/ussd-demo" element={<USSDDemo />} />
                  
                  {/* Authentication Page */}
                  <Route path="/auth" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <Auth />
                    </div>
                  } />
                  
                  {/* Didit KYC Callback */}
                  <Route path="/api/auth/didit/callback" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <DiditCallback />
                    </div>
                  } />
                  
                  {/* Public Asset Viewer - No Authentication Required */}
                  <Route path="/asset/:assetId" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <PublicAssetViewer />
                    </div>
                  } />
                  
                  {/* Marketplace - No Authentication Required for Browsing */}
                  <Route path="/marketplace" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <AssetMarketplace />
                    </div>
                  } />
                  
                  {/* Collections - Browse NFT Collections */}
                  <Route path="/collections" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <Collections />
                    </div>
                  } />
                  
                  {/* Activity Feed - Recent Marketplace Activity */}
                  <Route path="/activity" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <Activity />
                    </div>
                  } />
                  
                  {/* Profile Page - Standalone */}
                  <Route path="/profile" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <AuthGuard>
                        <ProfileSimple />
                      </AuthGuard>
                    </div>
                  } />
                  
                  
                  {/* Help Pages - No Authentication Required */}
                  <Route path="/help/government-id-requirements" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <GovernmentIdRequirements />
                    </div>
                  } />
                  <Route path="/help/proof-of-address-requirements" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <ProofOfAddressRequirements />
                    </div>
                  } />
                  <Route path="/help/professional-license-requirements" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <ProfessionalLicenseRequirements />
                    </div>
                  } />
                  <Route path="/help/resume-requirements" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <ResumeRequirements />
                    </div>
                  } />
                  
                  {/* Isolated Test Pages - No Wallet Context */}
                  <Route path="/hedera-wallet-test" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <HederaWalletTest />
                    </div>
                  } />
                  <Route path="/hedera-basic-test" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <HederaBasicTest />
                    </div>
                  } />
                  
                  {/* KYC Callback - Public Access (No Auth Required) */}
                  <Route path="/kyc-callback" element={
                    <div className="min-h-screen bg-black text-off-white">
                      <UniversalHeader />
                      <KYCCallback />
                    </div>
                  } />
                  
                  {/* Dashboard Pages - Public Access */}
                  <Route path="/dashboard/*" element={
                    <DashboardLayout>
                      <AuthGuard>
                        <Routes>
                        <Route path="/" element={<Profile />} />
                        <Route path="/marketplace" element={<AssetMarketplace />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/verify-asset" element={<AssetVerification />} />
                        <Route path="/verification" element={<VerificationDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/assets" element={<AdminAssets />} />
                        <Route path="/admin/hedera-admins" element={<HederaAdminManagement />} />
                        <Route path="/admin/amc-pools" element={<AMCPoolManagement />} />
                        <Route path="/admin/dividend-management" element={<DividendManagement />} />
                        <Route path="/pools" element={<PoolMarketplace />} />
                        <Route path="/pool-dashboard" element={<PoolDashboard />} />
                        <Route path="/pool-trading" element={<PoolTradingInterface />} />
                        <Route path="/pool-trading-dashboard" element={<PoolTradingDashboard />} />
                        <Route path="/pool-token-portfolio" element={<PoolTokenPortfolio />} />
                        <Route path="/trading" element={<TradingInterface />} />
                        <Route path="/staking" element={<TrustTokenStaking />} />
                        <Route path="/get-test-tokens" element={<GetTestTokens />} />
                        <Route path="/spv" element={<SPVManagement />} />
                        <Route path="/governance" element={<DAOGovernance />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/create-digital-asset" element={<CreateDigitalAsset />} />
                        <Route path="/create-rwa-asset" element={<CreateRWAAsset />} />
                        <Route path="/submit-rwa-asset" element={<RWAAssetSubmission />} />
                        <Route path="/ai-studio" element={<AIStudio />} />
                        <Route path="/rwa-trading" element={<RWATradingInterface />} />
                        <Route path="/secondary-trading" element={<SecondaryTradingInterface />} />
                        <Route path="/rwa-management" element={<RWAAssetManagement />} />
                        <Route path="/amc-dashboard" element={<AMCDashboard />} />
                        <Route path="/asset/:assetId/trade" element={<AssetTradingInterface />} />
                        <Route path="/secondary-markets" element={<SecondaryMarkets />} />
                        </Routes>
                      </AuthGuard>
                    </DashboardLayout>
                  } />
                </Routes>
              </BrowserRouter>
              <Toaster />
              <ProfileCompletionModal />
              </SidebarProvider>
              </ProfileCompletionProvider>
            </AdminProvider>
          </AuthProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;