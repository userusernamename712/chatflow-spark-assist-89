
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCustomers } from '@/services/customerService';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Customer {
  id: string;
  name: string;
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: React.ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadCustomers = async () => {
      if (!isAuthenticated) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedCustomers = await fetchCustomers();
        setCustomers(fetchedCustomers);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch customers');
        setError(error);
        toast({
          variant: "destructive",
          title: "Error loading customers",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [isAuthenticated]);

  return (
    <CustomerContext.Provider value={{ customers, loading, error }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
