import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserContext as UserContextType } from '@miniapp-template/shared';

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (window.__USER__) {
      setUser(window.__USER__ as User);
      setIsAuthenticated(true);
    }
  }, []);

  const refreshToken = async (): Promise<void> => {
    console.log('Token refresh is now handled by the backend');
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/miniappsdev/auth/logout';
  };

  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    token: null,
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