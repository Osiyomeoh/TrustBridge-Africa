import React from 'react';
import { Crown, Shield, CheckCircle } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const AdminStatusIndicator: React.FC = () => {
  const { isAdmin, isVerifier, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span>Checking admin status...</span>
      </div>
    );
  }

  if (!isAdmin && !isVerifier) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isAdmin ? (
        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg">
          <Crown className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 font-medium">Admin</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-green-300 font-medium">Verifier</span>
        </div>
      )}
    </div>
  );
};

export default AdminStatusIndicator;
