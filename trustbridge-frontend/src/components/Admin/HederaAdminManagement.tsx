import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Users, 
  Crown, 
  Building, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { useWallet } from '../../contexts/WalletContext';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface HederaAdminAccount {
  accountId: string;
  role: string;
  balance?: string;
  isActive?: boolean;
}

interface HederaAdminAccounts {
  superAdmins: string[];
  platformAdmins: string[];
  amcAdmins: string[];
  regularAdmins: string[];
}

const HederaAdminManagement: React.FC = () => {
  const { isSuperAdmin, isPlatformAdmin } = useAdmin();
  const { address } = useWallet();
  const [accounts, setAccounts] = useState<HederaAdminAccounts>({
    superAdmins: [],
    platformAdmins: [],
    amcAdmins: [],
    regularAdmins: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    adminName: '',
    role: 'ADMIN'
  });

  // Check if user has permission to manage Hedera admins
  const canManageAdmins = isSuperAdmin || isPlatformAdmin;

  useEffect(() => {
    if (canManageAdmins) {
      loadHederaAdminAccounts();
    }
  }, [canManageAdmins]);

  const loadHederaAdminAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/hedera/admin-accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load Hedera admin accounts');
      }

      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  };

  const createHederaAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/hedera/create-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdminForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin account');
      }

      setSuccess(`Admin account created successfully: ${data.accountId}`);
      setNewAdminForm({ adminName: '', role: 'ADMIN' });
      setShowCreateForm(false);
      await loadHederaAdminAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  const removeHederaAdmin = async (accountId: string) => {
    if (!confirm(`Are you sure you want to remove admin account ${accountId}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/hedera/remove-admin', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove admin account');
      }

      setSuccess('Admin account removed successfully');
      await loadHederaAdminAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove admin account');
    } finally {
      setLoading(false);
    }
  };

  const createInitialSuperAdmin = async () => {
    if (!confirm('This will create the initial Hedera super admin account. Are you sure?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/hedera/create-initial-super-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create initial super admin');
      }

      setSuccess(`Initial super admin created successfully! Account ID: ${data.accountId}`);
      await loadHederaAdminAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create initial super admin');
    } finally {
      setLoading(false);
    }
  };

  const setupHederaAdminAccounts = async () => {
    if (!confirm('This will create multiple admin accounts. Are you sure?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/hedera/setup-admin-accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to setup admin accounts');
      }

      setSuccess('All admin accounts created successfully!');
      await loadHederaAdminAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup admin accounts');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'PLATFORM_ADMIN':
        return <Building className="w-4 h-4 text-blue-500" />;
      case 'AMC_ADMIN':
        return <Shield className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PLATFORM_ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AMC_ADMIN':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!canManageAdmins) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center text-gray-500">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <span>You don't have permission to manage Hedera admin accounts</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
            Hedera Admin Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage Hedera native admin accounts and permissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            onClick={createInitialSuperAdmin}
            className="flex items-center justify-center space-x-2 text-sm"
            variant="primary"
            disabled={loading}
          >
            <Crown className="w-4 h-4" />
            <span>Create Super Admin</span>
          </Button>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center justify-center space-x-2 text-sm"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            <span>Create Admin</span>
          </Button>
          <Button
            onClick={setupHederaAdminAccounts}
            className="flex items-center justify-center space-x-2 text-sm"
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Setup All</span>
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
        >
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-800">{success}</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
        >
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-800">{error}</span>
        </motion.div>
      )}

      {/* Create Admin Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Hedera Admin</h3>
          <form onSubmit={createHederaAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Name
              </label>
              <input
                type="text"
                value={newAdminForm.adminName}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, adminName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={newAdminForm.role}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADMIN">Regular Admin</option>
                <option value="AMC_ADMIN">AMC Admin</option>
                <option value="PLATFORM_ADMIN">Platform Admin</option>
                {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
              </select>
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Admin'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Admin Accounts List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Super Admins */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500" />
              Super Admins
            </h3>
            <span className="text-xs sm:text-sm text-gray-500">
              {accounts.superAdmins.length} account(s)
            </span>
          </div>
          <div className="space-y-2">
            {accounts.superAdmins.map((accountId) => (
              <div
                key={accountId}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  {getRoleIcon('SUPER_ADMIN')}
                  <span className="font-mono text-xs sm:text-sm truncate">{accountId}</span>
                </div>
                <Button
                  onClick={() => removeHederaAdmin(accountId)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            ))}
            {accounts.superAdmins.length === 0 && (
              <p className="text-gray-500 text-xs sm:text-sm">No super admin accounts</p>
            )}
          </div>
        </Card>

        {/* Platform Admins */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
              Platform Admins
            </h3>
            <span className="text-xs sm:text-sm text-gray-500">
              {accounts.platformAdmins.length} account(s)
            </span>
          </div>
          <div className="space-y-2">
            {accounts.platformAdmins.map((accountId) => (
              <div
                key={accountId}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  {getRoleIcon('PLATFORM_ADMIN')}
                  <span className="font-mono text-xs sm:text-sm truncate">{accountId}</span>
                </div>
                <Button
                  onClick={() => removeHederaAdmin(accountId)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            ))}
            {accounts.platformAdmins.length === 0 && (
              <p className="text-gray-500 text-xs sm:text-sm">No platform admin accounts</p>
            )}
          </div>
        </Card>

        {/* AMC Admins */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
              AMC Admins
            </h3>
            <span className="text-xs sm:text-sm text-gray-500">
              {accounts.amcAdmins.length} account(s)
            </span>
          </div>
          <div className="space-y-2">
            {accounts.amcAdmins.map((accountId) => (
              <div
                key={accountId}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  {getRoleIcon('AMC_ADMIN')}
                  <span className="font-mono text-xs sm:text-sm truncate">{accountId}</span>
                </div>
                <Button
                  onClick={() => removeHederaAdmin(accountId)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            ))}
            {accounts.amcAdmins.length === 0 && (
              <p className="text-gray-500 text-xs sm:text-sm">No AMC admin accounts</p>
            )}
          </div>
        </Card>

        {/* Regular Admins */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold flex items-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
              Regular Admins
            </h3>
            <span className="text-xs sm:text-sm text-gray-500">
              {accounts.regularAdmins.length} account(s)
            </span>
          </div>
          <div className="space-y-2">
            {accounts.regularAdmins.map((accountId) => (
              <div
                key={accountId}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  {getRoleIcon('ADMIN')}
                  <span className="font-mono text-xs sm:text-sm truncate">{accountId}</span>
                </div>
                <Button
                  onClick={() => removeHederaAdmin(accountId)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            ))}
            {accounts.regularAdmins.length === 0 && (
              <p className="text-gray-500 text-xs sm:text-sm">No regular admin accounts</p>
            )}
          </div>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">
          🚀 Fully Hedera Native Admin System
        </h3>
        <div className="text-purple-800 space-y-2">
          <p>
            <strong>TrustBridge is now fully Hedera native!</strong> All admin accounts are created as native Hedera accounts with proper key management.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Super Admins:</strong> Full system control and can manage all admin accounts</li>
            <li><strong>Platform Admins:</strong> Can manage users, assets, and platform settings</li>
            <li><strong>AMC Admins:</strong> Can manage asset-backed securities and AMC operations</li>
            <li><strong>Regular Admins:</strong> Basic admin privileges for platform operations</li>
          </ul>
          <div className="mt-4 p-3 bg-purple-100 rounded-lg">
            <p className="text-sm font-medium">
              💡 <strong>First Time Setup:</strong> Click "Create Super Admin" to create your first Hedera native admin account.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HederaAdminManagement;
