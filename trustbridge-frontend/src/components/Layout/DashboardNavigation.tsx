import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, BarChart3, Settings, X, Zap, User, LogOut, ChevronLeft, ChevronRight, ChevronDown, Shield, Coins, Vote, BarChart3 as BarChart, Activity, Building2, Crown, TreePine, Package, PieChart, Bot, Phone, ArrowLeftRight } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../UI/ThemeToggle';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useTrustTokenBalance } from '../../hooks/useTrustTokenBalance';
import { useToast } from '../../hooks/useToast';

const DashboardNavigation: React.FC = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const { isCollapsed, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar } = useSidebar();
  
  const { logout, user } = useAuth();
  const { disconnectWallet, address, balance } = useWallet();
  const { isAdmin, isVerifier } = useAdmin();
  const { balance: trustBalance, loading: trustLoading } = useTrustTokenBalance();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside the entire sidebar
      const sidebar = document.querySelector('nav');
      if (sidebar && !sidebar.contains(target)) {
        setIsUserDropdownOpen(false);
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = (sectionId: string) => {
    console.log('🎯 Dropdown toggle clicked:', sectionId);
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
        console.log('🎯 Closing dropdown:', sectionId);
      } else {
        newSet.add(sectionId);
        console.log('🎯 Opening dropdown:', sectionId);
      }
      return newSet;
    });
  };

  // Handle navigation
  const handleNavigation = (href: string) => {
    console.log('🎯 Navigation clicked:', href);
    navigate(href);
  };

  // Handle disabled navigation (KYC required)
  const handleDisabledNavigation = (item: any) => {
    if (item.disabled) {
      toast({
        title: 'KYC Verification Required',
        description: 'Please complete your identity verification to access RWA features.',
        variant: 'destructive'
      });
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Still navigate to landing page even if disconnect fails
      navigate('/');
    }
  };

  const navItems = [
    { id: 'discovery', label: 'Discovery', icon: TrendingUp, href: '/dashboard/marketplace' },
    { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { id: 'ai-studio', label: 'AI Studio', icon: Bot, href: '/dashboard/ai-studio' },
    { id: 'ussd-demo', label: 'USSD Simulator', icon: Phone, href: '/ussd-demo' },
    { id: 'exchange', label: 'Exchange', icon: ArrowLeftRight, href: '/dashboard/exchange' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const tradingItems = [
    { id: 'trading', label: 'Trading Interface', icon: Activity, href: '/dashboard/trading' },
    { id: 'pool-trading', label: 'Pool Trading', icon: TrendingUp, href: '/pool-trading' },
    { id: 'pool-trading-dashboard', label: 'Trading Dashboard', icon: BarChart3, href: '/pool-trading-dashboard' },
    { id: 'create-digital-asset', label: 'Create Digital Asset', icon: Zap, href: '/dashboard/create-digital-asset' },
    { id: 'secondary-markets', label: 'Secondary Markets', icon: TrendingUp, href: '/dashboard/secondary-markets' },
  ];

  const investmentItems = [
    { id: 'pools', label: 'Pool Marketplace', icon: BarChart, href: '/pools' },
    { id: 'pool-dashboard', label: 'Pool Management', icon: Building2, href: '/pool-dashboard' },
    { id: 'pool-token-portfolio', label: 'Token Portfolio', icon: PieChart, href: '/pool-token-portfolio' },
    { id: 'spv', label: 'SPV Management', icon: Building2, href: '/dashboard/spv' },
    { id: 'staking', label: 'TRUST Staking', icon: Coins, href: '/dashboard/staking' },
  ];

  // Check KYC status for RWA features
  const isKYCApproved = user && user.kycStatus === 'approved';
  
  const rwaItems = [
    { 
      id: 'create-rwa-asset', 
      label: isKYCApproved ? 'Create RWA Asset' : 'Create RWA Asset (KYC Required)', 
      icon: TreePine, 
      href: '/dashboard/create-rwa-asset',
      disabled: !isKYCApproved
    },
    { id: 'secondary-trading', label: 'Secondary Trading', icon: BarChart3, href: '/dashboard/secondary-trading' },
    { id: 'rwa-trading', label: 'RWA Trading', icon: TrendingUp, href: '/dashboard/rwa-trading' },
    { id: 'rwa-management', label: 'RWA Management', icon: Package, href: '/dashboard/rwa-management' },
    { id: 'amc-dashboard', label: 'AMC Dashboard', icon: Building2, href: '/dashboard/amc-dashboard' },
  ];

  const verificationItems = [
    { id: 'verify-asset', label: 'Verify Asset', icon: Shield, href: '/dashboard/verify-asset' },
    { id: 'verification', label: 'Verification Dashboard', icon: Shield, href: '/dashboard/verification' },
  ];

  const adminItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: Crown, href: '/dashboard/admin' },
  ];

  const governanceItems = [
    { id: 'governance', label: 'DAO Governance', icon: Vote, href: '/dashboard/governance' },
  ];

  const dropdownSections = [
    { id: 'trading', label: 'Trading', icon: Activity, items: tradingItems },
    { id: 'investment', label: 'Investment', icon: BarChart, items: investmentItems },
    { id: 'rwa', label: 'Real-World Assets', icon: TreePine, items: rwaItems },
    { id: 'verification', label: 'Verification', icon: Shield, items: verificationItems },
    ...(isAdmin || isVerifier ? [{ id: 'admin', label: 'Admin', icon: Crown, items: adminItems }] : []),
    { id: 'governance', label: 'Governance', icon: Vote, items: governanceItems },
  ];

  // Helper functions
  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Not connected';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: string | null) => {
    if (!bal) return '0 HBAR';
    return `${bal} HBAR`;
  };

  return (
    <>
      {/* Mobile Sidebar Navigation */}
      <nav className={`lg:hidden fixed top-0 left-0 h-screen bg-gray-900 border-r border-gray-700 shadow-2xl shadow-black/20 z-[60] transition-all duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        <div className="h-full flex flex-col w-full overflow-y-auto p-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/" onClick={toggleMobileSidebar} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">TB</span>
              </div>
              <span className="text-lg font-semibold text-off-white">TrustBridge</span>
            </Link>
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-off-white hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation Items */}
          <div className="flex-1 space-y-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                        : 'text-gray-300 hover:text-off-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown Sections */}
            <div className="space-y-1">
              {dropdownSections.map((section) => {
                const Icon = section.icon;
                const isOpen = openDropdowns.has(section.id);
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleDropdown(section.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-off-white hover:bg-gray-800 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{section.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="ml-4 space-y-1 mt-1">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = location.pathname === item.href;
                          const isDisabled = (item as any).disabled;
                          return (
                            <button
                              key={item.id}
                              onClick={() => isDisabled ? handleDisabledNavigation(item) : handleNavigation(item.href)}
                              disabled={isDisabled}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isDisabled
                                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                                  : isActive
                                  ? 'bg-neon-green/10 text-neon-green'
                                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                              }`}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span>{item.label}</span>
                              {isDisabled && (
                                <Shield className="w-3 h-3 text-yellow-400 ml-auto" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile User Section */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="space-y-2">
              <div className="px-3 py-2 bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400">Wallet</p>
                <p className="text-sm font-mono text-off-white">{formatAddress(address)}</p>
                <p className="text-xs text-gray-400">{formatBalance(balance)}</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[50]"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Desktop Sidebar Navigation - Overlay Style */}
      <nav className={`hidden lg:flex fixed top-0 left-0 h-screen bg-gray-900 border-r border-gray-700 shadow-2xl shadow-black/20 z-[60] transition-all duration-300 ease-in-out group ${
        isCollapsed ? 'w-16 hover:w-64' : 'w-64'
      }`}>
        <div className={`h-full flex flex-col w-full transition-all duration-300 ease-in-out overflow-y-auto ${
          isCollapsed ? 'p-4 group-hover:p-6' : 'p-6'
        }`}>

          {/* Toggle Button - Professional Styling */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleSidebar}
              className="group relative p-2.5 rounded-xl bg-gradient-to-br from-neon-green/10 to-electric-mint/5 border border-neon-green/20 text-neon-green hover:from-neon-green/20 hover:to-electric-mint/10 hover:border-neon-green/40 hover:shadow-lg hover:shadow-neon-green/20 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <div className="relative z-10">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                ) : (
                  <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                )}
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-xl bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="block mb-6 xl:mb-8">
            <div className={`flex items-center transition-all duration-300 cursor-pointer group/logo ${isCollapsed ? 'justify-center group-hover:justify-start group-hover:gap-2 xl:group-hover:gap-3' : 'gap-2 xl:gap-3'}`}>
              <div className={`bg-neon-green triangle floating ${isCollapsed ? 'w-8 h-8 group-hover:w-8 group-hover:h-8 xl:group-hover:w-10 xl:group-hover:h-10' : 'w-8 h-8 xl:w-10 xl:h-10'}`}></div>
              <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 group-hover:w-auto group-hover:opacity-100' : 'w-auto opacity-100'}`}>
                <h1 className="text-lg xl:text-xl font-bold text-neon-green group-hover/logo:text-electric-mint transition-colors">TrustBridge</h1>
                <p className="text-xs text-electric-mint uppercase tracking-wider">Africa</p>
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2 flex-1">
            {/* Main Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={`group relative flex items-center rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-95 w-full text-left
                    ${isCollapsed ? 'justify-center p-3 group-hover:justify-start group-hover:gap-3' : 'gap-3 p-3'}
                    ${isActive 
                      ? 'bg-gradient-to-r from-neon-green/20 to-electric-mint/10 border border-neon-green/40 text-neon-green shadow-lg shadow-neon-green/20' 
                      : 'text-text-primary hover:bg-gradient-to-r hover:from-background-tertiary/30 hover:to-background-tertiary/10 hover:text-electric-mint'
                    }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`${isCollapsed ? 'w-6 h-6 group-hover:w-5 group-hover:h-5' : 'w-5 h-5'} transition-all duration-200 group-hover:scale-110 ${isActive ? 'text-neon-green' : 'text-text-secondary group-hover:text-electric-mint'}`} />
                  <span className={`font-medium transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 overflow-hidden' : 'w-auto opacity-100'}`}>{item.label}</span>
                  
                  {/* Enhanced tooltip for collapsed state - only show when not hovering */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gradient-to-r from-dark-gray to-dark-gray/95 backdrop-blur-sm border border-neon-green/30 rounded-lg text-sm text-electric-mint whitespace-nowrap opacity-0 group-hover:opacity-0 transition-all duration-300 pointer-events-none z-[70] shadow-xl shadow-neon-green/20">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Dropdown Sections - Only show when expanded */}
          {!isCollapsed && (
              <div className="mt-4 space-y-2">
                {dropdownSections.map((section) => {
                  const Icon = section.icon;
                  const isOpen = openDropdowns.has(section.id);
                  const hasActiveItem = section.items.some(item => location.pathname === item.href);
                  
                  return (
                    <div key={section.id} className="space-y-1">
                      {/* Dropdown Header */}
                      <button
                        onClick={() => toggleDropdown(section.id)}
                        className={`w-full flex items-center justify-between rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-95 gap-3 p-3
                          ${hasActiveItem 
                            ? 'bg-gradient-to-r from-neon-green/20 to-electric-mint/10 border border-neon-green/40 text-neon-green shadow-lg shadow-neon-green/20' 
                            : 'text-text-primary hover:bg-gradient-to-r hover:from-background-tertiary/30 hover:to-background-tertiary/10 hover:text-electric-mint'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${hasActiveItem ? 'text-neon-green' : 'text-text-secondary group-hover:text-electric-mint'}`} />
                          <span className="font-medium transition-all duration-200">{section.label}</span>
                          {isOpen && <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>}
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${hasActiveItem ? 'text-neon-green' : 'text-text-secondary'}`} />
                      </button>

                      {/* Dropdown Items */}
                      {isOpen && (
                        <div className="ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out">
                          {section.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isActive = location.pathname === item.href;
                            const isDisabled = (item as any).disabled;
                            
                            return (
                              <button
                      key={item.id}
                                onClick={() => isDisabled ? handleDisabledNavigation(item) : handleNavigation(item.href)}
                                disabled={isDisabled}
                                className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left ${
                                  isDisabled
                                    ? 'text-gray-500 cursor-not-allowed opacity-50'
                                    : isActive
                                    ? 'bg-gradient-to-r from-neon-green/20 to-electric-mint/10 border border-neon-green/40 text-neon-green shadow-lg shadow-neon-green/20 hover:scale-[1.02]' 
                                    : 'text-text-primary hover:bg-gradient-to-r hover:from-background-tertiary/30 hover:to-background-tertiary/10 hover:text-electric-mint hover:scale-[1.02]'
                      }`}
                    >
                                <ItemIcon className={`w-4 h-4 transition-all duration-200 ${isDisabled ? 'text-gray-500' : isActive ? 'text-neon-green' : 'text-text-secondary group-hover:text-electric-mint group-hover:scale-110'}`} />
                      <span className="font-medium transition-all duration-200">{item.label}</span>
                      
                      {/* KYC Required indicator */}
                      {isDisabled && (
                        <Shield className="w-3 h-3 text-yellow-400 ml-auto" />
                      )}
                      
                      {/* Active indicator */}
                      {isActive && !isDisabled && (
                        <div className="absolute right-2 w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                      )}
                              </button>
                  );
                })}
            </div>
          )}
                      </div>
                  );
                })}
            </div>
          )}

          </div>

          {/* Theme Toggle */}
          <div className="mt-6 pt-6 border-t border-border-accent/30">
            <div className={`flex items-center ${isCollapsed ? 'justify-center group-hover:justify-start group-hover:gap-3' : 'gap-3'} transition-all duration-300`}>
              <ThemeToggle />
              <span className={`text-sm text-text-secondary transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 overflow-hidden' : 'w-auto opacity-100'}`}>
                Theme
              </span>
            </div>
          </div>

          {/* User Profile / Wallet */}
          <div className="mt-6 pt-6 border-t border-border-accent/30">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group hover:scale-[1.02] ${
                  isCollapsed ? 'justify-center group-hover:justify-start group-hover:gap-3' : ''
                } bg-gradient-to-r from-background-tertiary/30 to-background-tertiary/10 hover:from-background-tertiary/50 hover:to-background-tertiary/20 border border-border-accent/30 hover:border-neon-green/40`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green to-electric-mint flex items-center justify-center">
                  <span className="text-dark-gray font-bold text-sm">
                    {address ? `${address.slice(0, 2)}...${address.slice(-2)}` : 'U'}
                  </span>
                  </div>
                <div className={`transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 overflow-hidden' : 'w-auto opacity-100'}`}>
                  <p className="text-sm font-semibold text-text-primary">
                    {address ? 'Connected' : 'Not connected'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {balance ? `${balance} HBAR` : '0 HBAR'}
                  </p>
                  {trustLoading ? (
                    <p className="text-xs text-text-secondary">
                      Loading TRUST...
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      {trustBalance ? `${trustBalance} TRUST` : '0 TRUST'}
                    </p>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''} ${isCollapsed ? 'hidden group-hover:block' : ''}`} />
              </button>

              {/* User Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-secondary/95 backdrop-blur-sm border border-border-accent/30 rounded-xl shadow-2xl shadow-neon-green/20 overflow-hidden z-[70]">
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-500/10 hover:text-red-400 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect & Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardNavigation;