
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setAuthState({
          user: parsedUser,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('chatUser');
      }
    }
  }, []);

  const login = (username: string) => {
    const user: User = {
      id: uuidv4(),
      username,
      createdAt: new Date(),
    };
    
    localStorage.setItem('chatUser', JSON.stringify(user));
    
    setAuthState({
      user,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('chatUser');
    localStorage.removeItem('chatSessionId');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
