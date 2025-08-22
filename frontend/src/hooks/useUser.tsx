import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserContext as UserContextType } from '@miniapp-template/shared';

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async (): Promise<void> => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '/defaultbasepath/defaultapp/api';
      const response = await fetch(`${apiBase}/me`, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };


  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/miniappsdev/auth/logout';
  };

  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    logout,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

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