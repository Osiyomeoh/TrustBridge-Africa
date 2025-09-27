import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import Navigation from './components/Layout/Navigation';
import AuthStatus from './components/Auth/AuthStatus';
import AnimatedBackground from './components/UI/AnimatedBackground';
import { Toaster } from './components/UI/Toaster';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Assets from './pages/Assets';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AssetVerification from './pages/AssetVerification';
import AttestorPortal from './pages/AttestorPortal';
import AttestorDashboard from './pages/AttestorDashboard';
import PublicAssetViewer from './pages/PublicAssetViewer';
import DashboardAssetView from './pages/DashboardAssetView';
import AssetTradingInterface from './pages/AssetTradingInterface';
import VerificationDashboard from './pages/VerificationDashboard';
import AttestorVerification from './components/Admin/AttestorVerification';
import AttestorRegistration from './components/Attestors/AttestorRegistration';
import AdminDashboard from './pages/AdminDashboard';
import AssetMarketplace from './pages/AssetMarketplace';
import Profile from './pages/Profile';
import ProfileSimple from './pages/ProfileSimple';
import CreateDigitalAsset from './pages/CreateDigitalAsset';
import DigitalAssetTrading from './pages/DigitalAssetTrading';
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
import GovernmentIdRequirements from './pages/help/GovernmentIdRequirements';
import ProofOfAddressRequirements from './pages/help/ProofOfAddressRequirements';
import ProfessionalLicenseRequirements from './pages/help/ProfessionalLicenseRequirements';
import ResumeRequirements from './pages/help/ResumeRequirements';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Component that adjusts main content margin based on sidebar state
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  
  // Don't show header for marketplace page since it has its own header
  const showHeader = !location.pathname.includes('/marketplace');
  
  return (
    <div className="min-h-screen bg-black text-off-white font-secondary relative overflow-hidden dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
      <Navigation />
      {showHeader && (
        <div className="bg-gray-900/50 border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">TB</span>
                </div>
                <span className="text-lg font-semibold text-off-white">TrustBridge</span>
              </div>

              {/* Auth Status */}
              <div className="flex items-center space-x-4">
                <AuthStatus />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`pt-20 lg:pt-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-56 xl:ml-64'
      }`}>
        {children}
      </div>
      <AnimatedBackground />
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
                  
                  {/* Authentication Page */}
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Didit KYC Callback */}
                  <Route path="/api/auth/didit/callback" element={<DiditCallback />} />
                  
                  {/* Public Asset Viewer - No Authentication Required */}
                  <Route path="/asset/:assetId" element={<PublicAssetViewer />} />
                  
                  {/* Marketplace - No Authentication Required for Browsing */}
                  <Route path="/marketplace" element={<AssetMarketplace />} />
                  
                  {/* Profile Page - Standalone */}
                  <Route path="/profile" element={<ProfileSimple />} />
                  
                  {/* Help Pages - No Authentication Required */}
                  <Route path="/help/government-id-requirements" element={<GovernmentIdRequirements />} />
                  <Route path="/help/proof-of-address-requirements" element={<ProofOfAddressRequirements />} />
                  <Route path="/help/professional-license-requirements" element={<ProfessionalLicenseRequirements />} />
                  <Route path="/help/resume-requirements" element={<ResumeRequirements />} />
                  
                  
                  {/* Dashboard Pages - Public Access */}
                  <Route path="/dashboard/*" element={
                    <DashboardLayout>
                      <Routes>
                        <Route path="/" element={<Profile />} />
                        <Route path="/marketplace" element={<AssetMarketplace />} />
                        <Route path="/assets" element={<Assets />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/verify-asset" element={<AssetVerification />} />
                        <Route path="/attestor" element={<AttestorPortal />} />
                        <Route path="/attestors" element={<AttestorPortal />} />
                        <Route path="/attestor-dashboard" element={<AttestorDashboard />} />
                        <Route path="/verification" element={<VerificationDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/attestors" element={<AttestorVerification />} />
                        <Route path="/attestor/register" element={<AttestorRegistration />} />
                        <Route path="/pools" element={<PoolDashboard />} />
                        <Route path="/trading" element={<TradingInterface />} />
                        <Route path="/staking" element={<TrustTokenStaking />} />
                        <Route path="/get-test-tokens" element={<GetTestTokens />} />
                        <Route path="/hedera-wallet-test" element={<HederaWalletTest />} />
                        <Route path="/hedera-basic-test" element={<HederaBasicTest />} />
                        <Route path="/spv" element={<SPVManagement />} />
                        <Route path="/governance" element={<DAOGovernance />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/create-digital-asset" element={<CreateDigitalAsset />} />
                        <Route path="/asset/:assetId" element={<DashboardAssetView />} />
                        <Route path="/asset/:assetId/trade" element={<AssetTradingInterface />} />
                        <Route path="/asset/:assetId/trading" element={<DigitalAssetTrading />} />
                        <Route path="/secondary-markets" element={<SecondaryMarkets />} />
          </Routes>
                    </DashboardLayout>
                  } />
                </Routes>
              </BrowserRouter>
              <Toaster />
              </SidebarProvider>
            </AdminProvider>
          </AuthProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;