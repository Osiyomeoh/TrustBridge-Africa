import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Wallet, LogOut, User, Settings, Menu, X } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useWallet } from '../../contexts/WalletContext';
import { useToast } from '../../hooks/useToast';

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
  const { isConnected, address, connect, disconnect } = useWallet();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleConnectWallet = async () => {
    try {
      await connect();
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
      await disconnect();
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: 'Disconnect Failed',
        description: 'Failed to disconnect wallet. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const isDashboardPage = location.pathname.startsWith('/dashboard');

  return (
    <div className={`sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - TrustBridge Theme */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">TB</span>
            </div>
            <span className="text-lg font-semibold text-off-white">TrustBridge</span>
          </div>

          {/* Search Bar - Only show on Discovery page */}
          {showSearch && isDashboardPage && location.pathname === '/dashboard/marketplace' && (
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search TrustBridge"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-off-white placeholder-gray-400 focus:border-neon-green focus:ring-neon-green/20"
                />
              </div>
            </div>
          )}

          {/* Right Side - Universal Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {isConnected ? (
                <>
                  {/* Connected Wallet Info */}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                    <span className="text-sm text-gray-300 font-mono">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                    </span>
                  </div>
                  
                  {/* Profile Button */}
                  <Button
                    onClick={() => navigate('/dashboard/profile')}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Button>
                  
                  {/* Disconnect Button */}
                  <Button
                    onClick={handleDisconnectWallet}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </Button>
                </>
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
                  
                  {/* Settings Button */}
                  <Button
                    onClick={() => navigate('/dashboard/settings')}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-3">
              {isConnected ? (
                <>
                  {/* Connected Wallet Info - Mobile */}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                    <span className="text-sm text-gray-300 font-mono">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                    </span>
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
                  
                  {/* Settings Button - Mobile */}
                  <Button
                    onClick={() => {
                      navigate('/dashboard/settings');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 w-full justify-start"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
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
