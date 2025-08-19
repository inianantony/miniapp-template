import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserContext as UserContextType } from '@shared/types/user';
import { tokenManager } from '../services/TokenManager';

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get user info from window object (injected by backend)
    if (window.__USER__) {
      setUser(window.__USER__ as User);
      setIsAuthenticated(true);
    }

    // Initialize token on app start
    initializeToken();
  }, []);

  const initializeToken = async (): Promise<void> => {
    try {
      const token = await tokenManager.getToken();
      setToken(token);
      
      // Decode token to get user info if not available from window
      if (!user) {
        const decoded = tokenManager.decodeToken();
        if (decoded) {
          setUser({
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            roles: decoded.roles || ['user']
          });
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize token:', error);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const newToken = await tokenManager.getToken();
      setToken(newToken);
      console.log('✅ Token refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
      // On token refresh failure, logout user
      logout();
    }
  };

  const logout = (): void => {
    tokenManager.clearToken();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    console.log('👋 User logged out');
  };

  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    token,
    refreshToken,
    logout,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __USER__?: User;
  }
}