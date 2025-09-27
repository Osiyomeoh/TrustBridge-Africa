import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Shield, 
  UserCheck, 
  Users, 
  BarChart3, 
  Settings, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useWallet } from '../contexts/WalletContext';
import { AdminGuard } from '../contexts/AdminContext';
import { contractService } from '../services/contractService';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isVerifier, adminRoles, loading } = useAdmin();
  const { address } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAttestors: 0,
    pendingApplications: 0,
    approvedAttestors: 0,
    rejectedAttestors: 0,
    totalVerifications: 0,
    activeVerifications: 0
  });

  useEffect(() => {
    // Load admin statistics
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // Fetch real data from smart contract
      const attestors = await contractService.getAllAttestors();
      
      const stats = {
        totalAttestors: attestors.length,
        pendingApplications: attestors.filter(a => a.status === 0).length,
        approvedAttestors: attestors.filter(a => a.status === 1).length,
        rejectedAttestors: attestors.filter(a => a.status === 2).length,
        totalVerifications: attestors.reduce((sum, a) => sum + Number(a.totalVerifications), 0),
        activeVerifications: attestors.filter(a => a.isActive).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      // Set empty stats on error
      setStats({
        totalAttestors: 0,
        pendingApplications: 0,
        approvedAttestors: 0,
        rejectedAttestors: 0,
        totalVerifications: 0,
        activeVerifications: 0
      });
    }
  };

  const adminActions = [
    {
      id: 'attestor-verification',
      title: 'Attestor Verification',
      description: 'Review and approve attestor applications',
      icon: UserCheck,
      href: '/dashboard/admin/attestors',
      color: 'from-blue-500 to-purple-500',
      available: isVerifier || isAdmin
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      href: '/dashboard/admin/users',
      color: 'from-green-500 to-emerald-500',
      available: isAdmin
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure platform settings and parameters',
      icon: Settings,
      href: '/dashboard/admin/settings',
      color: 'from-orange-500 to-red-500',
      available: isAdmin
    },
    {
      id: 'analytics',
      title: 'Admin Analytics',
      description: 'View platform analytics and reports',
      icon: BarChart3,
      href: '/dashboard/admin/analytics',
      color: 'from-purple-500 to-pink-500',
      available: isAdmin || isVerifier
    }
  ];

  const statCards = [
    {
      title: 'Total Attestors',
      value: stats.totalAttestors,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      title: 'Approved Attestors',
      value: stats.approvedAttestors,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Active Verifications',
      value: stats.activeVerifications,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard 
      requireVerifier={true}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Admin privileges required to access this page.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Crown className="w-8 h-8 text-purple-500" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage and monitor the TrustBridge platform
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Connected as
            </div>
            <div className="font-mono text-sm text-gray-900 dark:text-white">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="text-xs text-purple-500 font-medium">
              {adminRoles.isAdmin ? 'ADMIN' : 'VERIFIER'}
            </div>
          </div>
        </div>

        {/* Admin Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Access Active
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isAdmin 
                    ? 'Full administrative access granted. You can manage all platform functions.'
                    : 'Verifier access granted. You can review and approve attestor applications.'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-500">
                {adminRoles.isAdmin ? 'ADMIN' : 'VERIFIER'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Smart Contract Role
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.borderColor} border`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Admin Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`p-6 transition-all duration-200 ${
                      action.available 
                        ? 'hover:shadow-lg hover:scale-105 cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                      onClick={() => {
                        if (action.available) {
                          navigate(action.href);
                        }
                      }}
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
                      {action.available ? (
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
                      ) : (
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Admin Only</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <UserCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Review Applications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {stats.pendingApplications} pending review
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    navigate('/dashboard/admin/attestors');
                  }}
                >
                  Review
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Platform Analytics
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    View detailed reports
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    navigate('/dashboard/admin/analytics');
                  }}
                >
                  View
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    System Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Configure platform
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    navigate('/dashboard/admin/settings');
                  }}
                >
                  Configure
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
