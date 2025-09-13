import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import Navigation from './components/Layout/Navigation';
import AnimatedBackground from './components/UI/AnimatedBackground';
import { Toaster } from './components/UI/Toaster';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AssetVerification from './pages/AssetVerification';
import AttestorDashboard from './pages/AttestorDashboard';
import DiditCallback from './pages/DiditCallback';
import ProtectedRoute from './components/Auth/ProtectedRoute';

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
  
  return (
    <div className="min-h-screen bg-black text-off-white font-secondary relative overflow-hidden dark:bg-black light:bg-light-bg dark:text-off-white light:text-light-text">
      <Navigation />
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <AuthProvider>
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
                  
                  {/* Dashboard Pages - With Navigation and Protection */}
                  <Route path="/dashboard/*" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/assets" element={<Assets />} />
                          <Route path="/portfolio" element={<Portfolio />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/verify-asset" element={<AssetVerification />} />
                          <Route path="/attestor" element={<AttestorDashboard />} />
                        </Routes>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </BrowserRouter>
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;