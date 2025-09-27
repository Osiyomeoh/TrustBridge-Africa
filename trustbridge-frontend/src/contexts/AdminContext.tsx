import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { contractService } from '../services/contractService';

interface AdminContextType {
  isAdmin: boolean;
  isVerifier: boolean;
  adminRoles: { isAdmin: boolean; isVerifier: boolean };
  loading: boolean;
  error: string | null;
  checkAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { address, isConnected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifier, setIsVerifier] = useState(false);
  const [adminRoles, setAdminRoles] = useState({ isAdmin: false, isVerifier: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAdminStatus = async () => {
    if (!address || !isConnected) {
      setIsAdmin(false);
      setIsVerifier(false);
      setAdminRoles({ isAdmin: false, isVerifier: false });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const roles = await contractService.getAdminRoles(address);
      setAdminRoles(roles);
      setIsAdmin(roles.isAdmin);
      setIsVerifier(roles.isVerifier);

      console.log('Admin status checked:', {
        address,
        isAdmin: roles.isAdmin,
        isVerifier: roles.isVerifier
      });
    } catch (err) {
      console.error('Failed to check admin status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check admin status');
      setIsAdmin(false);
      setIsVerifier(false);
      setAdminRoles({ isAdmin: false, isVerifier: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address && isConnected) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setIsVerifier(false);
      setAdminRoles({ isAdmin: false, isVerifier: false });
    }
  }, [address, isConnected]);

  const value: AdminContextType = {
    isAdmin,
    isVerifier,
    adminRoles,
    loading,
    error,
    checkAdminStatus
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Admin Guard Component
interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireVerifier?: boolean; // If true, requires VERIFIER_ROLE; if false, requires either ADMIN or VERIFIER
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  fallback = <div className="p-4 text-center text-gray-500">Access Denied: Admin privileges required</div>,
  requireVerifier = false 
}) => {
  const { isAdmin, isVerifier, loading } = useAdmin();

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-500">Checking admin status...</p>
      </div>
    );
  }

  const hasAccess = requireVerifier ? isVerifier : (isAdmin || isVerifier);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
