import React from 'react';
import { motion } from 'framer-motion';
import { Shield, UserCheck, BarChart3, Settings } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import AttestorStatus from '../components/AttestorStatus';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const AttestorPortal: React.FC = () => {
  const { address } = useWallet();
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'verification-requests',
      title: 'Verification Requests',
      description: 'Review and process asset verification requests',
      icon: UserCheck,
      href: '/dashboard/verification',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'analytics',
      title: 'Attestor Analytics',
      description: 'View your performance metrics and earnings',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'settings',
      title: 'Attestor Settings',
      description: 'Manage your attestor profile and preferences',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'from-orange-500 to-red-500'
    }
  ];

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Wallet Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your wallet to access the attestor portal.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            Attestor Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your professional attestor activities and track your status
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Connected as
          </div>
          <div className="font-mono text-sm text-gray-900 dark:text-white">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
      </div>

      {/* Attestor Status */}
      <AttestorStatus />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="p-6 hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200"
                  onClick={() => navigate(action.href)}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {action.description}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(action.href);
                      }}
                    >
                      Access
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Registration CTA */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Not Registered as an Attestor?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Join our network of professional attestors and start earning by verifying assets.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/attestor-registration')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Register Now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AttestorPortal;