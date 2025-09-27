import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { User, Bell, Shield, Wallet, Globe, Moon, Sun, LogOut, Save, Key, Eye, EyeOff, Coins } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useTrustTokenBalance } from '../hooks/useTrustTokenBalance';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'wallet' | 'preferences'>('profile');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  
  // Wallet and token balances
  const { balance: hbarBalance, address, isConnected } = useWallet();
  const { balance: trustBalance, loading: trustLoading } = useTrustTokenBalance();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'preferences', label: 'Preferences', icon: Globe }
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2">
              <span className="text-neon-green">SETTINGS</span>
              <br />
              <span className="text-electric-mint">& PREFERENCES</span>
            </h1>
            <p className="text-base sm:text-lg text-off-white/70 max-w-2xl">
              Manage your account settings, security preferences, and wallet configuration.
            </p>
          </div>
          <Button variant="neon" className="floating">
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card variant="floating" className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                        : 'text-off-white/70 hover:text-off-white hover:bg-dark-gray/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card variant="floating">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-neon-green" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-neon-green to-electric-mint rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-black" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-sm text-off-white/70 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-off-white mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Bio</label>
                  <textarea
                    rows={4}
                    defaultValue="Real estate investor focused on African markets..."
                    className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card variant="floating">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-electric-mint" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Email Notifications', description: 'Receive updates via email', enabled: true },
                  { label: 'Push Notifications', description: 'Get real-time alerts on your device', enabled: true },
                  { label: 'Investment Updates', description: 'Updates about your investments', enabled: true },
                  { label: 'Market Alerts', description: 'Price changes and market news', enabled: false },
                  { label: 'Verification Status', description: 'Asset verification updates', enabled: true },
                  { label: 'Security Alerts', description: 'Account security notifications', enabled: true }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-dark-gray/30 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-off-white">{item.label}</h3>
                      <p className="text-sm text-off-white/70">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card variant="floating">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-neon-green" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none"
                  />
                </div>

                <div className="p-4 bg-dark-gray/30 rounded-lg">
                  <h3 className="font-semibold text-off-white mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-off-white/70 mb-4">Add an extra layer of security to your account</p>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wallet Settings */}
          {activeTab === 'wallet' && (
            <Card variant="floating">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-electric-mint" />
                  Wallet Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-dark-gray/30 rounded-lg">
                  <h3 className="font-semibold text-off-white mb-2">Connected Wallet</h3>
                  <p className="text-sm text-off-white/70 mb-4">MetaMask Wallet</p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`text-sm ${isConnected ? 'text-neon-green' : 'text-red-500'}`}>
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  
                  {/* Wallet Balances */}
                  {isConnected && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-dark-gray/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="w-4 h-4 text-electric-mint" />
                          <span className="text-xs text-off-white/70">HBAR</span>
                        </div>
                        <p className="text-lg font-semibold text-electric-mint">
                          {hbarBalance ? `${parseFloat(hbarBalance).toFixed(2)}` : '0.00'}
                        </p>
                      </div>
                      <div className="p-3 bg-dark-gray/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Coins className="w-4 h-4 text-neon-green" />
                          <span className="text-xs text-off-white/70">TRUST</span>
                        </div>
                        <p className="text-lg font-semibold text-neon-green">
                          {trustLoading ? '...' : `${parseFloat(trustBalance).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Wallet Address</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={address || 'Not connected'}
                      readOnly
                      className="flex-1 px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => address && navigator.clipboard.writeText(address)}
                      disabled={!address}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Private Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showPrivateKey ? "text" : "password"}
                      value="••••••••••••••••••••••••••••••••"
                      readOnly
                      className="flex-1 px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-off-white/50 mt-1">Never share your private key with anyone</p>
                </div>

                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <h3 className="font-semibold text-warning mb-2">Danger Zone</h3>
                  <p className="text-sm text-off-white/70 mb-4">Disconnect your wallet from TrustBridge</p>
                  <Button variant="destructive" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <Card variant="floating">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-neon-green" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Theme</label>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </Button>
                    <Button variant="outline" size="sm">
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Language</label>
                  <select className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none">
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="sw">Kiswahili</option>
                    <option value="yo">Yoruba</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Currency</label>
                  <select className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none">
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (€)</option>
                    <option value="gbp">GBP (£)</option>
                    <option value="ngn">NGN (₦)</option>
                    <option value="kes">KES (KSh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-off-white mb-2">Time Zone</label>
                  <select className="w-full px-4 py-3 bg-dark-gray border border-neon-green/30 rounded-lg text-off-white focus:border-neon-green focus:outline-none">
                    <option value="utc">UTC</option>
                    <option value="wast">West Africa Time (UTC+1)</option>
                    <option value="east">East Africa Time (UTC+3)</option>
                    <option value="cat">Central Africa Time (UTC+2)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;