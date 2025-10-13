import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { apiService } from '../services/api';

export interface User {
  _id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  phone?: string;
  country?: string;
  profileImage?: string;
  role: string;
  kycStatus: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'not_started';
  kycInquiryId?: string;
  emailVerificationStatus: 'pending' | 'verified' | 'not_verified';
  reputation: number;
  stakingBalance: number;
  totalInvested: number;
  investmentCount: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  authStep: 'wallet' | 'profile' | 'email' | 'kyc' | 'complete';
}

export interface AuthContextType extends AuthState {
  connectWallet: (walletType: 'hashpack' | 'metamask') => Promise<void>;
  completeProfile: (profileData: ProfileData) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  startKYC: () => Promise<void>;
  checkKYCStatus: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface ProfileData {
  email: string;
  name: string;
  phone?: string;
  country?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    isConnected, 
    accountId,
    address, 
    signMessage, 
    connectWallet: connectWalletContext,
    loading: walletLoading,
    error: walletError 
  } = useWallet();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    authStep: 'wallet',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | null>(null);

  // Check for existing authentication on mount only if wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      checkExistingAuth();
    }
  }, []);

  // Handle wallet connection/disconnection
  useEffect(() => {
    // Only reset auth if wallet is explicitly disconnected (not just address being null initially)
    if (!isConnected) {
      console.log('Wallet disconnected, resetting authentication...');
      setAuthState({
        isAuthenticated: false,
        user: null,
        authStep: 'wallet',
        accessToken: null,
        refreshToken: null,
      });
      // Clear tokens when wallet is actually disconnected
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setLastConnectedAddress(null);
      return;
    }

    // Check if wallet address has changed (different user connected)
    if (isConnected && address && lastConnectedAddress && address !== lastConnectedAddress) {
      console.log('Different wallet address detected, clearing previous session...');
      console.log('Previous address:', lastConnectedAddress);
      console.log('New address:', address);
      
      // Clear previous user's session
      setAuthState({
        isAuthenticated: false,
        user: null,
        authStep: 'wallet',
        accessToken: null,
        refreshToken: null,
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Update the last connected address
      setLastConnectedAddress(address);
      
      // Check auth for the new wallet
      if (!isCheckingAuth) {
        checkExistingAuth();
      }
      return;
    }

    // Wallet is connected - check authentication
    if (isConnected && address) {
      console.log('Wallet connected with address, checking authentication status...');
      
      // Update last connected address if this is a new connection
      if (!lastConnectedAddress) {
        setLastConnectedAddress(address);
      }
      
      if (!isCheckingAuth) {
        checkExistingAuth();
      }
    } else if (isConnected && !address) {
      // Wallet is connected but address not yet available - wait a bit
      console.log('Wallet connected but address not yet available, waiting...');
      const timer = setTimeout(() => {
        if (isConnected && !address) {
          console.log('Address still not available after delay, checking auth anyway...');
          if (!isCheckingAuth) {
            checkExistingAuth();
          }
        }
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, lastConnectedAddress]);

  // Debug auth state changes
  useEffect(() => {
    console.log('AuthContext - Auth state changed:', {
      isAuthenticated: authState.isAuthenticated,
      authStep: authState.authStep,
      user: authState.user ? `${authState.user.email} (${authState.user.name})` : null,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
      isConnected
    });
  }, [authState, address, isConnected]);

  // Add timeout to prevent getting stuck on wallet step
  useEffect(() => {
    if (authState.authStep === 'wallet' && !isConnected) {
      const timeoutId = setTimeout(() => {
        console.log('Wallet connection timeout - user may need to manually connect');
        // Don't auto-advance, but log for debugging
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeoutId);
    }
  }, [authState.authStep, isConnected]);

  const checkExistingAuth = async () => {
    // Prevent multiple simultaneous calls
    if (isCheckingAuth) {
      console.log('AuthContext - checkExistingAuth already in progress, skipping');
      return;
    }
    
    setIsCheckingAuth(true);
    console.log('AuthContext - checkExistingAuth called', {
      isConnected,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
      hasToken: !!localStorage.getItem('accessToken')
    });
    
    try {
      // Don't check auth if wallet is not connected
      if (!isConnected || !address) {
        console.log('AuthContext - No wallet connection, skipping auth check');
        setAuthState({
          isAuthenticated: false,
          user: null,
          authStep: 'wallet',
          accessToken: null,
          refreshToken: null,
        });
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      console.log('AuthContext - Found token:', !!token, 'Length:', token?.length);
      
      if (token) {
        try {
          console.log('AuthContext - Calling getProfile API...');
          const response = await apiService.getProfile();
          console.log('AuthContext - getProfile response:', response);
          
          if (response.success) {
            const userData = response.data;
            
            // Check if the user from token matches the currently connected wallet
            if (userData.walletAddress && address && userData.walletAddress.toLowerCase() !== address.toLowerCase()) {
              console.log('Token user wallet mismatch - clearing session');
              console.log('Token wallet:', userData.walletAddress);
              console.log('Connected wallet:', address);
              
              // Clear tokens and reset auth state
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setAuthState({
                isAuthenticated: false,
                user: null,
                authStep: 'wallet',
                accessToken: null,
                refreshToken: null,
              });
              
              // Check if new wallet has an existing account
              if (!isCheckingAuth) {
                checkExistingAuth();
              }
              return;
            }

            // Normalize user data to match frontend types
            const user: User = {
              ...userData,
              emailVerificationStatus: userData.emailVerificationStatus === 'VERIFIED' ? 'verified' : 
                                     userData.emailVerificationStatus === 'PENDING' ? 'pending' : 'not_verified',
              kycStatus: userData.kycStatus === 'PENDING' ? 'pending' :
                        userData.kycStatus === 'IN_PROGRESS' ? 'in_progress' :
                        userData.kycStatus === 'APPROVED' ? 'approved' :
                        userData.kycStatus === 'REJECTED' ? 'rejected' : 'not_started'
            };
            
            // Determine auth step based on wallet connection and user status
            let authStep: 'wallet' | 'profile' | 'email' | 'kyc' | 'complete' = 'wallet';
            
            console.log('Checking existing auth - wallet and user status:', {
              isConnected,
              accountId,
              email: user.email,
              name: user.name,
              emailVerificationStatus: user.emailVerificationStatus,
              kycStatus: user.kycStatus,
              hasEmail: !!user.email,
              hasName: !!user.name,
              isVerified: user.emailVerificationStatus === 'verified'
            });
            
            // First check if wallet is connected
            if (!isConnected || !accountId) {
              authStep = 'wallet';
              console.log('🔌 Wallet not connected, staying on wallet step');
            } else if (user.emailVerificationStatus === 'verified') {
              authStep = 'complete'; // User can access dashboard after email verification
              console.log('✅ User email verified, going to complete step');
            } else if (user.email && user.name) {
              // User has completed profile but not verified email
              authStep = 'email';
              console.log('⚠️ User profile complete, going to email verification step');
            } else {
              // User hasn't completed profile yet
              authStep = 'profile';
              console.log('❌ User profile incomplete, going to profile step');
              console.log('Missing fields:', {
                email: user.email ? '✅' : '❌',
                name: user.name ? '✅' : '❌',
                verification: user.emailVerificationStatus
              });
            }

            console.log('AuthContext - Setting auth state:', { isAuthenticated: true, authStep, kycStatus: user.kycStatus, user: user });
            setAuthState({
              isAuthenticated: true,
              user,
              accessToken: token,
              refreshToken: localStorage.getItem('refreshToken'),
              authStep,
            });
            console.log('AuthContext - Auth state set with user:', user);
          } else {
            console.log('AuthContext - getProfile failed:', response);
          }
        } catch (error) {
          console.log('AuthContext - getProfile error:', error);
          // Token is invalid, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        // Reset to wallet step if no valid auth
        setAuthState(prev => ({ ...prev, authStep: 'wallet', accessToken: null, refreshToken: null }));
        }
      } else {
        console.log('AuthContext - No token found, checking if user exists with wallet address...');
        // No token, but check if user exists with current wallet address
        if (address) {
          try {
            console.log('AuthContext - Checking for existing user with wallet address:', address);
            console.log('AuthContext - About to call apiService.checkWalletUser...');
            
            let response;
            try {
              response = await apiService.checkWalletUser(address);
              console.log('AuthContext - checkWalletUser response received:', response);
            } catch (error) {
              console.error('AuthContext - checkWalletUser failed:', error);
              // If the API call fails, assume no user exists and continue with new user flow
              response = { success: false, message: 'Error checking wallet user' };
            }
            
            if (response.success && response.data) {
              const userData = response.data;
              console.log('AuthContext - Raw userData from backend:', userData);
              // Normalize user data to match frontend types
              const user: User = {
                ...userData,
                emailVerificationStatus: userData.emailVerificationStatus === 'VERIFIED' ? 'verified' : 
                                       userData.emailVerificationStatus === 'PENDING' ? 'pending' : 'not_verified',
                kycStatus: userData.kycStatus === 'PENDING' ? 'pending' :
                          userData.kycStatus === 'IN_PROGRESS' ? 'in_progress' :
                          userData.kycStatus === 'APPROVED' ? 'approved' :
                          userData.kycStatus === 'REJECTED' ? 'rejected' : 'not_started'
              };
              
              console.log('AuthContext - Normalized user data:', {
                originalEmailStatus: userData.emailVerificationStatus,
                normalizedEmailStatus: user.emailVerificationStatus,
                originalKycStatus: userData.kycStatus,
                normalizedKycStatus: user.kycStatus
              });
              console.log('AuthContext - Found existing user:', user);
              console.log('AuthContext - User data details:', {
                email: user.email,
                name: user.name,
                emailVerificationStatus: user.emailVerificationStatus,
                hasEmail: !!user.email,
                hasName: !!user.name,
                isEmailVerified: user.emailVerificationStatus === 'verified'
              });
              
              // Determine auth step based on wallet connection and user status
              let authStep: 'wallet' | 'profile' | 'email' | 'kyc' | 'complete' = 'wallet';
              
              console.log('AuthContext - Wallet and user verification status:', {
                isConnected,
                accountId,
                emailVerificationStatus: user.emailVerificationStatus,
                email: user.email,
                name: user.name
              });
              
              // First check if wallet is connected
              if (!isConnected || !accountId) {
                authStep = 'wallet';
                console.log('🔌 Wallet not connected, staying on wallet step');
              } else if (user.emailVerificationStatus === 'verified') {
                authStep = 'complete';
                console.log('✅ Existing user email verified, going to complete step');
              } else if (!user.email || !user.name) {
                authStep = 'profile';
                console.log('❌ Existing user profile incomplete, going to profile step');
              } else if (user.email && user.name) {
                authStep = 'email';
                console.log('⚠️ Existing user profile complete, going to email verification step');
              } else {
                authStep = 'profile';
                console.log('❌ Existing user profile incomplete, going to profile step');
              }
              
              setAuthState({
                isAuthenticated: true,
                user,
                authStep,
                accessToken: null,
                refreshToken: null,
              });
              
              // If user is verified, they can access the dashboard directly
              if (authStep === 'complete') {
                console.log('AuthContext - User is verified, allowing dashboard access');
                // For verified users, we need to generate tokens for API access
                try {
                  console.log('AuthContext - Generating token for verified user...');
                  const tokenResponse = await apiService.generateToken(address);
                  
                  if (tokenResponse.success) {
                    const { user: updatedUserData, accessToken, refreshToken } = tokenResponse.data;
                    
                    // Normalize the updated user data
                    const updatedUser: User = {
                      ...updatedUserData,
                      emailVerificationStatus: updatedUserData.emailVerificationStatus === 'VERIFIED' ? 'verified' : 
                                             updatedUserData.emailVerificationStatus === 'PENDING' ? 'pending' : 'not_verified',
                      kycStatus: updatedUserData.kycStatus === 'PENDING' ? 'pending' :
                                updatedUserData.kycStatus === 'IN_PROGRESS' ? 'in_progress' :
                                updatedUserData.kycStatus === 'APPROVED' ? 'approved' :
                                updatedUserData.kycStatus === 'REJECTED' ? 'rejected' : 'not_started'
                    };
                    
                    // Store the tokens
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    
                    setAuthState({
                      isAuthenticated: true,
                      user: updatedUser,
                      authStep: 'complete',
                      accessToken,
                      refreshToken,
                    });
                    console.log('AuthContext - Verified user authenticated with backend-generated token');
                  } else {
                    throw new Error(tokenResponse.message || 'Failed to generate token');
                  }
                } catch (error) {
                  console.error('Failed to generate token for verified user:', error);
                  // Fallback to no token - user can still access dashboard but API calls will fail
                  setAuthState({
                    isAuthenticated: true,
                    user,
                    authStep: 'complete',
                    accessToken: null,
                    refreshToken: null,
                  });
                  console.log('AuthContext - Verified user authenticated without token (API calls will fail)');
                }
              }
            } else {
              console.log('AuthContext - No existing user found, creating new user object');
              // Create a basic user object for new users
              const newUser: User = {
                _id: '', // Will be set when profile is completed
                walletAddress: address,
                email: '',
                name: '',
                phone: '',
                country: '',
                role: 'user',
                kycStatus: 'not_started',
                emailVerificationStatus: 'not_verified',
                reputation: 0,
                stakingBalance: 0,
                totalInvested: 0,
                investmentCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              
              setAuthState(prev => ({ 
                ...prev, 
                authStep: 'profile',
                isAuthenticated: false,
                user: newUser,
                accessToken: null,
                refreshToken: null,
              }));
            }
          } catch (error) {
            console.log('AuthContext - Error checking user by wallet address:', error);
            console.log('AuthContext - Error details:', (error as Error).message, (error as Error).stack);
            
            // Create a basic user object when backend is not available
            const newUser: User = {
              _id: '', // Will be set when profile is completed
              walletAddress: address,
              email: '',
              name: '',
              phone: '',
              country: '',
              role: 'user',
              kycStatus: 'not_started',
              emailVerificationStatus: 'not_verified',
              reputation: 0,
              stakingBalance: 0,
              totalInvested: 0,
              investmentCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            setAuthState(prev => ({ 
              ...prev, 
              authStep: 'profile',
              isAuthenticated: false, // Not authenticated until profile is completed
              user: newUser,
              accessToken: null,
              refreshToken: null,
            }));
          }
        } else {
          console.log('AuthContext - No wallet address, starting with wallet step');
          setAuthState(prev => ({ ...prev, authStep: 'wallet', accessToken: null, refreshToken: null }));
        }
      }
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await connectWalletContext();
      // Don't automatically authenticate - let the user go through the flow
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };


  const completeProfile = async (profileData: ProfileData) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create profile completion message
      const timestamp = Date.now();
      const message = `TrustBridge Profile Completion\nAddress: ${address}\nTimestamp: ${timestamp}`;
      
      console.log('Attempting to sign message for profile completion:', {
        address,
        accountId,
        message: message.substring(0, 50) + '...'
      });
      
      // Sign the message (WalletContext will handle HashPack signature creation)
      console.log('Calling signMessage...');
      const signature = await signMessage(message);
      console.log('signMessage completed, signature received:', signature.substring(0, 20) + '...');
      
      // Send to backend - only include fields the backend expects
      const requestData = {
        walletAddress: address,
        signature,
        message,
        timestamp,
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        country: profileData.country,
      };
      
      console.log('Sending HashPack profile completion request:', {
        walletAddress: requestData.walletAddress,
        email: requestData.email,
        name: requestData.name,
        phone: requestData.phone,
        country: requestData.country,
        hasSignature: !!requestData.signature,
        hasMessage: !!requestData.message,
        timestamp: requestData.timestamp,
        signature: requestData.signature?.substring(0, 20) + '...',
        message: requestData.message?.substring(0, 50) + '...'
      });
      
      console.log('Making backend request to completeProfile...');
      const response = await apiService.completeProfile(requestData);
      console.log('Backend response received:', response);

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        console.log('Profile completion response:', { 
          success: response.success, 
          user: user.email, 
          name: user.name,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        console.log('Profile completed successfully, moving to email step:', { user: user.email, name: user.name });
        
        setAuthState({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
          authStep: 'email',
        });
        
        console.log('Auth state updated to email step');
      } else {
        console.error('Profile completion failed:', response);
      }
    } catch (err: any) {
      console.error('Profile completion failed:', err);
      console.error('Backend response:', err.response?.data);
      
      // Handle specific error cases
      let errorMessage = 'Profile completion failed';
      
      if (err.response?.data?.message) {
        // Backend error message
        errorMessage = err.response.data.message;
        console.error('Backend error message:', errorMessage);
      } else if (err.message) {
        // Generic error message
        errorMessage = err.message;
      }
      
      // Check for specific error cases
      if (errorMessage.includes('Email already registered') || errorMessage.includes('Email already in use')) {
        errorMessage = 'This email address is already registered to another account. Please use a different email address.';
      } else if (errorMessage.includes('Invalid wallet signature') || errorMessage.includes('signature verification failed')) {
        errorMessage = 'HashPack wallet verification failed. Please ensure your wallet is properly connected and try again.';
      } else if (errorMessage.includes('Wallet not connected')) {
        errorMessage = 'Please connect your HashPack wallet first.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.verifyEmail({ token });
      
      if (response.success) {
        setAuthState(prev => ({
          ...prev,
          authStep: 'complete',
          user: prev.user ? {
            ...prev.user,
            emailVerificationStatus: 'verified'
          } : prev.user,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const startKYC = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.startKYC();
      
      if (response.success) {
        // Update user with KYC inquiry ID and status
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            kycStatus: 'in_progress',
            kycInquiryId: response.data.inquiryId,
          } : null,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start KYC verification');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkKYCStatus = async () => {
    if (!authState.user?.kycInquiryId) return;

    try {
      const response = await apiService.checkKYCStatus(authState.user.kycInquiryId);
      
      if (response.success) {
        const { status } = response.data;
        
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            kycStatus: status,
          } : null,
          authStep: status === 'approved' ? 'complete' : prev.authStep,
        }));
      }
    } catch (err) {
      console.error('Failed to check KYC status:', err);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getProfile();
      
      if (response.success) {
        const user = response.data;
        
        // Normalize user data to match frontend types
        const normalizedUser: User = {
          ...user,
          emailVerificationStatus: user.emailVerificationStatus === 'VERIFIED' ? 'verified' : 
                                 user.emailVerificationStatus === 'PENDING' ? 'pending' : 'not_verified',
          kycStatus: user.kycStatus === 'PENDING' ? 'pending' :
                    user.kycStatus === 'IN_PROGRESS' ? 'in_progress' :
                    user.kycStatus === 'APPROVED' ? 'approved' :
                    user.kycStatus === 'REJECTED' ? 'rejected' : 'not_started'
        };
        
        setAuthState(prev => ({
          ...prev,
          user: normalizedUser,
        }));
        
        console.log('User data refreshed:', normalizedUser);
        console.log('KYC Status after refresh:', normalizedUser.kycStatus);
        
        // If KYC is now approved, generate a token if we don't have one
        if (normalizedUser.kycStatus === 'approved' && !authState.accessToken) {
          console.log('KYC approved but no token, generating token...');
          try {
            const tokenResponse = await apiService.generateToken(normalizedUser.walletAddress);
            if (tokenResponse.success) {
              const { accessToken, refreshToken } = tokenResponse.data;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', refreshToken);
              setAuthState(prev => ({
                ...prev,
                accessToken,
                refreshToken,
              }));
              console.log('Token generated for approved KYC user');
            }
          } catch (error) {
            console.error('Failed to generate token for approved KYC user:', error);
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const logout = async () => {
    try {
      if (authState.accessToken) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        authStep: 'wallet',
      });
      setError(null);
    }
  };

  const value: AuthContextType = {
    ...authState,
    connectWallet,
    completeProfile,
    verifyEmail,
    startKYC,
    checkKYCStatus,
    refreshUser,
    logout,
    isLoading: isLoading || walletLoading,
    error: error || walletError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
