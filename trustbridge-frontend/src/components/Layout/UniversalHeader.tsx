import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, Wallet, LogOut, User, Menu, X, ChevronDown, UserPlus } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileCompletion } from '../../contexts/ProfileCompletionContext';
import { useToast } from '../../hooks/useToast';
import TrustTokenBalance from '../TrustToken/TrustTokenBalance';
import ThemeToggle from '../UI/ThemeToggle';

interface UniversalHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  className?: string;
}

const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  showSearch = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const { user, isAuthenticated, authStep, logout } = useAuth();
  const { toast } = useToast();
  const { openProfileCompletion } = useProfileCompletion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = React.useState(false);

  const handleConnectWallet = async () => {
    try {
      console.log('🔌 UniversalHeader: handleConnectWallet called');
      
      // Add a small delay to ensure wallet context is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await connectWallet();
      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been connected successfully.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      // Logout from backend and clear auth state
      await logout();
      
      // Disconnect wallet
      await disconnectWallet();
      
      // Navigate to home page
      navigate('/');
      
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: 'Logout Failed',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCompleteProfile = () => {
    console.log('UniversalHeader - Opening profile completion popup');
    openProfileCompletion();
  };

  const isDashboardPage = location.pathname.startsWith('/dashboard');
  
  // Check if user needs to complete profile
  const needsProfileCompletion = isConnected && (!isAuthenticated || authStep === 'profile' || authStep === 'email');

  return (
    <div className={`sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - TrustBridge Theme */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
            <img 
              src="/images/tb4.png" 
              alt="TrustBridge Africa Logo" 
              className="h-12 sm:h-14 w-auto"
            />
          </Link>

          {/* Search Bar - Only show on Discovery page */}
          {showSearch && isDashboardPage && location.pathname === '/dashboard/marketplace' && (
            <div className="hidden sm:flex flex-1 max-w-md mx-4 lg:mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search TrustBridge"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-off-white placeholder-gray-400 focus:border-neon-green focus:ring-neon-green/20 text-sm"
                />
              </div>
            </div>
          )}

          {/* Right Side - Universal Wallet Connection */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* TRUST Token Balance */}
            {isConnected && (
              <TrustTokenBalance 
                className="hidden sm:flex"
                showPurchaseButton={true}
              />
            )}
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
              {isConnected ? (
                needsProfileCompletion ? (
                  <>
                    {/* Complete Profile Button */}
                    <Button
                      onClick={handleCompleteProfile}
                      variant="neon"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Complete Profile</span>
                    </Button>
                  </>
                ) : (
                <div className="relative">
                  {/* Wallet Dropdown Button */}
                  <button
                    onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                    className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-opacity bg-gray-800 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-700 hover:border-gray-600"
                  >
                    {/* Profile Image or Default Avatar */}
                    <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full overflow-hidden bg-gradient-to-br from-neon-green to-emerald-500 flex items-center justify-center">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : user?.name ? (
                        <span className="text-black font-bold text-xs lg:text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-3 h-3 lg:w-4 lg:h-4 text-black" />
                      )}
                    </div>
                    
                    {/* Username or Wallet Address */}
                    <span className="text-xs lg:text-sm text-gray-300 font-medium">
                      {user?.name || (address ? `${address.slice(0, 4)}...${address.slice(-3)}` : 'Connected')}
                    </span>
                    
                    {/* Dropdown Arrow */}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Wallet Dropdown Menu */}
                  {isWalletDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                      <div className="py-2">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-700">
                          <div className="flex items-center space-x-3">
                            {/* Profile Image */}
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-neon-green to-emerald-500 flex items-center justify-center">
                              {user?.profileImage ? (
                                <img 
                                  src={user.profileImage} 
                                  alt={user.name || 'User'} 
                                  className="w-full h-full object-cover"
                                />
                              ) : user?.name ? (
                                <span className="text-black font-bold text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-4 h-4 text-black" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-off-white">
                                {user?.name || 'User'}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate('/dashboard/profile');
                              setIsWalletDropdownOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-off-white transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              handleDisconnectWallet();
                              setIsWalletDropdownOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Backdrop to close dropdown */}
                  {isWalletDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsWalletDropdownOpen(false)}
                    />
                  )}
                </div>
                )
              ) : (
                <>
                  {/* Connect Wallet Button */}
                  <Button
                    onClick={handleConnectWallet}
                    variant="neon"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Toggle mobile sidebar if we're on a dashboard page
                  if (location.pathname.startsWith('/dashboard')) {
                    // This will be handled by the sidebar context
                    const event = new CustomEvent('toggleMobileSidebar');
                    window.dispatchEvent(event);
                  } else {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  }
                }}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-3">
              {isConnected ? (
                needsProfileCompletion ? (
                  <>
                    {/* Complete Profile Button - Mobile */}
                    <Button
                      onClick={() => {
                        handleCompleteProfile();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="neon"
                      size="sm"
                      className="flex items-center space-x-2 w-full justify-start"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Complete Profile</span>
                    </Button>
                  </>
                ) : (
                <>
                  {/* User Info - Mobile */}
                  <div className="flex items-center space-x-3 px-3 py-3 bg-gray-800 rounded-lg border border-gray-700">
                    {/* Profile Image */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-neon-green to-emerald-500 flex items-center justify-center">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : user?.name ? (
                        <span className="text-black font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-4 h-4 text-black" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-off-white">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Profile Button - Mobile */}
                  <Button
                    onClick={() => {
                      navigate('/dashboard/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 w-full justify-start"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Button>
                  
                  {/* Disconnect Button - Mobile */}
                  <Button
                    onClick={() => {
                      handleDisconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 w-full justify-start text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </Button>
                </>
                )
              ) : (
                <>
                  {/* Connect Wallet Button - Mobile */}
                  <Button
                    onClick={() => {
                      handleConnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="neon"
                    size="sm"
                    className="flex items-center space-x-2 w-full justify-start"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalHeader;