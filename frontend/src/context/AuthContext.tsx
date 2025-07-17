import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/authApi';


interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      console.log('Fetching user data...');
      fetchUserData();
    } 
    else {
      setIsLoading(false);
      console.log('No token found, user not authenticated');
    }
  }, []);

  

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getCurrentUser();
      const userData = (response as { data: { user: User } }).data.user;
      console.log('Fetched user data:', userData);
      setUser({
        id: userData.id,
        name: userData.username || userData.name,
        email: userData.email
      });
    } catch (error) {
      console.error('Failed to fetch user data', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (token: string) => {
    localStorage.setItem('token', token);
    await fetchUserData();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


