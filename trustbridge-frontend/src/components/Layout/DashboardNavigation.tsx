import React, { useState, useEffect, useRef } from 'react';
import { Home, TrendingUp, Wallet, BarChart3, Settings, Menu, X, Zap, User, LogOut, ChevronLeft, ChevronRight, ChevronDown, Shield, CheckCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../UI/ThemeToggle';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';

const DashboardNavigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const { disconnectWallet } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle disconnect wallet and logout
  const handleDisconnect = async () => {
    try {
      // Close dropdown
      setIsUserDropdownOpen(false);
      
      // Disconnect wallet first
      disconnectWallet();
      
      // Then logout from auth
      await logout();
      
      // Navigate to landing page
      navigate('/');
    } catch (error) {
      console.error('Disconnect error:', error);
      // Still navigate to landing page even if disconnect fails
      navigate('/');
    }
  };


  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'assets', label: 'Assets', icon: TrendingUp, href: '/dashboard/assets' },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet, href: '/dashboard/portfolio' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const verificationItems = [
    { id: 'verify-asset', label: 'Verify Asset', icon: Shield, href: '/dashboard/verify-asset' },
    { id: 'attestor', label: 'Attestor Portal', icon: CheckCircle, href: '/dashboard/attestor' },
  ];


  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <nav className={`hidden lg:flex fixed top-0 left-0 h-screen bg-background-secondary backdrop-blur-sm border-r border-border-accent/30 shadow-2xl shadow-neon-green/10 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-56 xl:w-64'
      }`}>
        <div className={`h-full flex flex-col w-full transition-all duration-300 ease-in-out ${
          isCollapsed ? 'p-2' : 'p-4 xl:p-6'
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
          <div className={`flex items-center mb-6 xl:mb-8 ${isCollapsed ? 'justify-center' : 'gap-2 xl:gap-3'}`}>
            <div className={`bg-neon-green triangle floating ${isCollapsed ? 'w-8 h-8' : 'w-8 h-8 xl:w-10 xl:h-10'}`}></div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg xl:text-xl font-bold text-neon-green">TrustBridge</h1>
                <p className="text-xs text-electric-mint uppercase tracking-wider">Africa</p>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`group relative flex items-center rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-95
                    ${isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'}
                    ${isActive 
                      ? 'bg-gradient-to-r from-neon-green/20 to-electric-mint/10 border border-neon-green/40 text-neon-green shadow-lg shadow-neon-green/20' 
                      : 'text-text-primary hover:bg-gradient-to-r hover:from-background-tertiary/30 hover:to-background-tertiary/10 hover:text-electric-mint'
                    }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-200 group-hover:scale-110 ${isActive ? 'text-neon-green' : 'text-text-secondary group-hover:text-electric-mint'}`} />
                  {!isCollapsed && <span className="font-medium transition-all duration-200">{item.label}</span>}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  )}
                  
                  {/* Enhanced tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gradient-to-r from-dark-gray to-dark-gray/95 backdrop-blur-sm border border-neon-green/30 rounded-lg text-sm text-electric-mint whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-xl shadow-neon-green/20">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Verification Section */}
          {!isCollapsed && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-3">
                Verification
              </h3>
              <div className="space-y-1">
                {verificationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                        isActive
                          ? 'bg-gradient-to-r from-neon-green/20 to-electric-mint/10 border border-neon-green/40 text-neon-green shadow-lg shadow-neon-green/20' 
                          : 'text-text-primary hover:bg-gradient-to-r hover:from-background-tertiary/30 hover:to-background-tertiary/10 hover:text-electric-mint'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${isActive ? 'text-neon-green' : 'text-text-secondary group-hover:text-electric-mint'}`} />
                      <span className="font-medium transition-all duration-200">{item.label}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute right-2 w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapsed Verification Section */}
          {isCollapsed && (
            <div className="mt-6">
              <div className="space-y-1">
                {verificationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`group relative flex items-center justify-center p-3 rounded-lg transition-all duration-200 hover:scale-110 ${
                        isActive
                          ? 'bg-gradient-to-r from-neon-green/20 to-electric-mint/10 border border-neon-green/40 text-neon-green shadow-lg shadow-neon-green/20 dark:from-neon-green/20 dark:to-electric-mint/10' 
                          : 'text-off-white hover:bg-gradient-to-r hover:from-dark-gray/30 hover:to-dark-gray/10 hover:text-electric-mint dark:text-off-white dark:hover:from-dark-gray/30 dark:hover:to-dark-gray/10'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-6 h-6 transition-all duration-200 group-hover:scale-110 ${isActive ? 'text-neon-green' : 'text-medium-gray group-hover:text-electric-mint dark:text-medium-gray'}`} />
                      
                      {/* Enhanced tooltip for collapsed state */}
                      <div className="absolute left-full ml-3 px-3 py-2 bg-gradient-to-r from-dark-gray to-dark-gray/95 backdrop-blur-sm border border-neon-green/30 rounded-lg text-sm text-electric-mint whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-xl shadow-neon-green/20">
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="mt-auto pt-3 border-t border-gradient-to-r from-neon-green/20 via-electric-mint/10 to-neon-green/20 dark:border-gradient-to-r dark:from-neon-green/20 dark:via-electric-mint/10 dark:to-neon-green/20 light:border-gray-200">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2`}>
              {!isCollapsed && (
                <span className="text-xs font-semibold text-text-primary">Theme</span>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="pt-3">
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Trigger */}
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={`w-full flex items-center rounded-xl bg-background-tertiary/60 backdrop-blur-sm border border-border-accent/30 shadow-lg shadow-neon-green/10 transition-all duration-200 hover:shadow-neon-green/20 hover:border-neon-green/50 ${
                  isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
                  <div className={`bg-gradient-to-br from-neon-green to-electric-mint rounded-full flex items-center justify-center shadow-lg shadow-neon-green/30 ${
                    isCollapsed ? 'w-8 h-8' : 'w-8 h-8'
                  }`}>
                    <Zap className={`text-black ${isCollapsed ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  </div>
                  {!isCollapsed && (
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-text-primary">Connected</p>
                        <ChevronDown className={`w-3 h-3 text-electric-mint transition-transform duration-200 ${
                          isUserDropdownOpen ? 'rotate-180' : ''
                        }`} />
                      </div>
                      <p className="text-xs text-electric-mint font-mono tracking-wider truncate">0x8f4e...7d9f</p>
                      <p className="text-xs text-neon-green font-semibold">124.5 HBAR</p>
                    </div>
                  )}
                </div>
                {isCollapsed && (
                  <ChevronDown className={`w-3 h-3 text-electric-mint transition-transform duration-200 ${
                    isUserDropdownOpen ? 'rotate-180' : ''
                  }`} />
                )}
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className={`absolute bottom-full left-0 right-0 mb-2 bg-background-secondary/95 backdrop-blur-sm border border-border-accent/30 rounded-xl shadow-2xl shadow-neon-green/20 overflow-hidden ${
                  isCollapsed ? 'w-16' : 'w-full'
                }`}>
                  <div className="p-2 space-y-1">
                    {/* Profile */}
                    <button className="group w-full flex items-center gap-2 p-2 rounded-lg text-sm text-text-primary hover:text-electric-mint hover:bg-gradient-to-r hover:from-background-tertiary/30 hover:to-background-tertiary/10 transition-all duration-200 transform hover:scale-[1.02]">
                      <User className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 text-text-secondary group-hover:text-electric-mint" />
                      {!isCollapsed && <span className="font-medium">Profile</span>}
                    </button>
                    
                    {/* Disconnect & Logout */}
                    <button 
                      onClick={handleDisconnect}
                      className="group w-full flex items-center gap-2 p-2 rounded-lg text-sm text-text-primary hover:text-red-400 hover:bg-gradient-to-r hover:from-red-400/10 hover:to-red-400/5 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 text-text-secondary group-hover:text-red-400" />
                      {!isCollapsed && <span className="font-medium">Disconnect & Logout</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-background-secondary/95 backdrop-blur-md border-b border-border-accent/20 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-green triangle floating"></div>
          <div>
            <h1 className="text-lg font-bold text-neon-green">TrustBridge</h1>
            <p className="text-xs text-electric-mint uppercase tracking-wider">Africa</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-text-primary"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Navigation Sidebar */}
      <div className={`fixed top-0 right-0 h-screen w-64 bg-background-secondary border-l border-border-accent/20 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden`}>
        <div className="p-6 h-full flex flex-col">
          {/* Close Button */}
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-off-white dark:text-off-white light:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-neon-green/20 border border-neon-green text-neon-green shadow-neon-mint dark:bg-neon-green/20 light:bg-neon-green/10' 
                      : 'text-off-white hover:bg-dark-gray/50 hover:text-electric-mint dark:text-off-white dark:hover:bg-dark-gray/50 light:text-gray-700 light:hover:bg-gray-100'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-neon-green' : 'text-medium-gray group-hover:text-electric-mint dark:text-medium-gray light:text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>


          {/* Mobile User Profile / Wallet */}
          <div className="mt-auto pt-6 border-t border-medium-gray/30 dark:border-medium-gray/30 light:border-gray-200">
            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-gray/50 border border-neon-green/20 dark:bg-dark-gray/50 light:bg-gray-50 light:border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-neon-green to-electric-mint rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm font-medium text-off-white dark:text-off-white light:text-gray-900">Connected</p>
                  <p className="text-xs text-electric-mint font-mono">0x8f4e...7d9f</p>
                  <p className="text-xs text-neon-green">124.5 HBAR</p>
                </div>
              </div>
            </div>
            
            {/* Mobile User Actions */}
            <div className="mt-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-sm text-medium-gray hover:text-electric-mint hover:bg-dark-gray/30 transition-all duration-200 dark:text-medium-gray dark:hover:bg-dark-gray/30 light:text-gray-600 light:hover:bg-gray-100">
                <User className="w-4 h-4" />
                Profile
              </button>
              <button 
                onClick={handleDisconnect}
                className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-sm text-medium-gray hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 dark:text-medium-gray light:text-gray-600"
              >
                <LogOut className="w-4 h-4" />
                Disconnect & Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardNavigation;
