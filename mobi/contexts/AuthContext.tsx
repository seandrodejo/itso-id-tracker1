import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, apiUtils, User } from '../src/config/api';

// Remove duplicate User interface since it's imported from api.ts

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, studentNumber: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedUser = await apiUtils.getStoredUser();
      const token = await apiUtils.getStoredToken();
      
      if (storedUser && token) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, studentNumber: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 Attempting login with:', { email, studentNumber, password });
      const response = await authAPI.login(email, studentNumber, password);
      console.log('✅ Login successful:', response);
      
      // Store auth data
      await apiUtils.storeAuthData(response.token, response.user);
      setUser(response.user);
      
      return true;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Re-throw the error so the component can handle specific error messages
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiUtils.clearAuthData();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
