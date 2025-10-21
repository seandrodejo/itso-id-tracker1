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
      // Silently handle auth state check errors
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
      // Re-throw the error so the component can handle specific error messages
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔍 AuthContext: Starting logout process...');
      
      // Clear stored auth data
      await apiUtils.clearAuthData();
      console.log('✅ AuthContext: Auth data cleared from storage');
      
      // Clear user state
      setUser(null);
      console.log('✅ AuthContext: User state cleared');
      
      console.log('✅ AuthContext: Logout completed successfully');
    } catch (error) {
      // Even if clearing storage fails, we should still clear the user state
      // to prevent the user from being stuck in a logged-in state
      setUser(null);
      
      // Re-throw the error so the calling component knows something went wrong
      throw error;
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
