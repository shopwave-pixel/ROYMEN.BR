import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import authService from '../services/authService';
import { getToken, setToken, removeToken } from '../utils/token';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  sendOtp: (email: string, purpose: 'login' | 'registration') => Promise<void>;
  verifyOtp: (
    email: string,
    otpCode: string,
    purpose: 'login' | 'registration',
    name?: string,
    phone?: string
  ) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Starts true to evaluate session persistence on load
  const [error, setError] = useState<string | null>(null);

  // Check storage token on startup to perform Auto-Login Persistence
  useEffect(() => {
    const initializeAuth = async () => {
      const persistedToken = getToken();
      if (persistedToken) {
        try {
          const profileData = await authService.getUserProfile();
          if (profileData.success && profileData.user) {
            setUser({
              _id: profileData.user.id,
              name: profileData.user.name,
              email: profileData.user.email,
              phone: profileData.user.phone || '',
              role: profileData.user.role,
            });
          }
        } catch (err: any) {
          console.warn('[AUTH_INIT] Stored session could not be authenticated:', err.message);
          removeToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to global auth-expired events dispatched from api interceptor
    const handleAuthExpired = () => {
      setUser(null);
      setError('Your secure login session has expired. Please log in again.');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-expired', handleAuthExpired);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-expired', handleAuthExpired);
      }
    };
  }, []);

  const sendOtp = async (email: string, purpose: 'login' | 'registration'): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.requestOtp(email, purpose);
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch verification OTP.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (
    email: string,
    otpCode: string,
    purpose: 'login' | 'registration',
    name?: string,
    phone?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.verifyOtp(email, otpCode, purpose, name, phone);
      if (data.success && data.token) {
        setToken(data.token);
        setUser({
          _id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || phone || '',
          role: data.user.role,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || 'OTP Verification / Login operational failure.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    removeToken();
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        sendOtp,
        verifyOtp,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
