
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User, AuthState, DEFAULT_CUSTOMER_ID } from '@/types/auth';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, customerId: string) => Promise<void>;
  register: (email: string, password: string, username: string, customerId: string) => Promise<void>;
  logout: () => Promise<void>;
  startNewSession: (customerId: string) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    selectedCustomerId: DEFAULT_CUSTOMER_ID,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        loadUserData(firebaseUser);
      } else {
        // User is signed out
        setAuthState({
          user: null,
          isAuthenticated: false,
          selectedCustomerId: DEFAULT_CUSTOMER_ID,
        });
        localStorage.removeItem('chatUser');
        localStorage.removeItem('chatSelectedCustomer');
        localStorage.removeItem('chatSessionId');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = (firebaseUser: FirebaseUser) => {
    const storedUser = localStorage.getItem('chatUser');
    const storedCustomerId = localStorage.getItem('chatSelectedCustomer');
    
    try {
      let userData: User;
      
      if (storedUser) {
        userData = JSON.parse(storedUser) as User;
      } else {
        // Create new user data if not found in localStorage
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          createdAt: new Date(),
        };
        localStorage.setItem('chatUser', JSON.stringify(userData));
      }
      
      setAuthState({
        user: userData,
        isAuthenticated: true,
        selectedCustomerId: storedCustomerId || DEFAULT_CUSTOMER_ID,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('chatUser');
      setError('Error loading user data. Please try again.');
    }
  };

  const register = async (email: string, password: string, username: string, customerId: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData: User = {
        id: firebaseUser.uid,
        email,
        username,
        createdAt: new Date(),
      };
      
      localStorage.setItem('chatUser', JSON.stringify(userData));
      localStorage.setItem('chatSelectedCustomer', customerId);
      
      setAuthState({
        user: userData,
        isAuthenticated: true,
        selectedCustomerId: customerId,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, customerId: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        username: firebaseUser.displayName || email.split('@')[0] || 'User',
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      };
      
      localStorage.setItem('chatUser', JSON.stringify(userData));
      localStorage.setItem('chatSelectedCustomer', customerId);
      
      setAuthState({
        user: userData,
        isAuthenticated: true,
        selectedCustomerId: customerId,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await signOut(auth);
      localStorage.removeItem('chatUser');
      localStorage.removeItem('chatSelectedCustomer');
      localStorage.removeItem('chatSessionId');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        selectedCustomerId: DEFAULT_CUSTOMER_ID,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = (customerId: string) => {
    localStorage.removeItem('chatSessionId');
    localStorage.setItem('chatSelectedCustomer', customerId);
    
    setAuthState(prev => ({
      ...prev,
      selectedCustomerId: customerId
    }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        login, 
        register, 
        logout, 
        startNewSession,
        loading,
        error
      }}
    >
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
