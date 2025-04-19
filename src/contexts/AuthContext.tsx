
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User, AuthState, DEFAULT_CUSTOMER_ID } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, customerId: string) => Promise<void>;
  logout: () => Promise<void>;
  startNewSession: (customerId: string) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we're in demo mode (no Firebase API key)
const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    selectedCustomerId: DEFAULT_CUSTOMER_ID,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, check for stored user in localStorage
      const storedUser = localStorage.getItem('chatUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User;
          const storedCustomerId = localStorage.getItem('chatSelectedCustomer') || DEFAULT_CUSTOMER_ID;
          
          setAuthState({
            user: userData,
            isAuthenticated: true,
            selectedCustomerId: storedCustomerId,
          });
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('chatUser');
        }
      }
      setLoading(false);
      return;
    }

    // Normal Firebase authentication flow
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

  const login = async (email: string, password: string, customerId: string) => {
    setError(null);
    setLoading(true);
    
    try {
      if (isDemoMode) {
        // In demo mode, create a dummy user
        const userData: User = {
          id: 'demo-user-id',
          email: email,
          username: email.split('@')[0] || 'Demo User',
          createdAt: new Date(),
        };
        
        localStorage.setItem('chatUser', JSON.stringify(userData));
        localStorage.setItem('chatSelectedCustomer', customerId);
        
        setAuthState({
          user: userData,
          isAuthenticated: true,
          selectedCustomerId: customerId,
        });
      } else {
        // Normal Firebase login
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
      }
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
      if (!isDemoMode) {
        await signOut(auth);
      }
      
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
