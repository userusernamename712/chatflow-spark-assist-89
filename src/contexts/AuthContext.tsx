
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  connectAuthEmulator
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User, AuthState, DEFAULT_CUSTOMER_ID } from '@/types/auth';

// Check if we're in development/demo mode
const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
                   import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDemoKeyForDevelopmentPurposesOnly";

// In demo mode, configure auth emulator
if (isDemoMode) {
  try {
    // This will throw in the browser environment if not properly set up,
    // so we catch and log errors
    connectAuthEmulator(auth, "http://localhost:9099");
  } catch (error) {
    console.log("Auth emulator not available, continuing with demo mode");
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, customerId: string) => Promise<void>;
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
    // In demo mode, simulate a logged-in user
    if (isDemoMode) {
      const demoUser: User = {
        id: "demo-user-id",
        email: "demo@example.com",
        username: "Demo User",
        createdAt: new Date(),
      };
      
      localStorage.setItem('chatUser', JSON.stringify(demoUser));
      localStorage.setItem('chatSelectedCustomer', DEFAULT_CUSTOMER_ID);
      
      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        selectedCustomerId: DEFAULT_CUSTOMER_ID,
      });
      setLoading(false);
      return;
    }

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
    
    // In demo mode, simulate successful login
    if (isDemoMode) {
      const demoUser: User = {
        id: "demo-user-id",
        email: email,
        username: email.split('@')[0] || 'Demo User',
        createdAt: new Date(),
      };
      
      localStorage.setItem('chatUser', JSON.stringify(demoUser));
      localStorage.setItem('chatSelectedCustomer', customerId);
      
      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        selectedCustomerId: customerId,
      });
      
      setLoading(false);
      return;
    }
    
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
    
    // In demo mode, simulate logout
    if (isDemoMode) {
      localStorage.removeItem('chatUser');
      localStorage.removeItem('chatSelectedCustomer');
      localStorage.removeItem('chatSessionId');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        selectedCustomerId: DEFAULT_CUSTOMER_ID,
      });
      
      setLoading(false);
      return;
    }
    
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
