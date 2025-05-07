
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCustomers } from '@/services/customerService';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import { fetchApiMetadata } from '@/services/apiService';

interface Customer {
  id: string;
  name: string;
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  hasTools: boolean;
  checkingTools: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: React.ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasTools, setHasTools] = useState(true);
  const [checkingTools, setCheckingTools] = useState(false);
  const { isAuthenticated, selectedCustomerId } = useAuth();

  // Load customers
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

  // Check if customer has tools
  useEffect(() => {
    const checkCustomerTools = async () => {
      if (!selectedCustomerId || !isAuthenticated) {
        setHasTools(true); // Default to true to avoid blocking unnecessarily
        return;
      }

      try {
        setCheckingTools(true);
        const apiMetadata = await fetchApiMetadata(selectedCustomerId);
        
        // Check if the customer has any tools
        const toolsAvailable = Array.isArray(apiMetadata.tools) && apiMetadata.tools.length > 0;
        setHasTools(toolsAvailable);
        
        if (!toolsAvailable) {
          console.log('No tools available for customer:', selectedCustomerId);
        }
      } catch (err) {
        console.error('Error checking tools for customer:', err);
        // Default to true in case of error to avoid blocking unnecessarily
        setHasTools(true);
      } finally {
        setCheckingTools(false);
      }
    };

    checkCustomerTools();
  }, [selectedCustomerId, isAuthenticated]);

  return (
    <CustomerContext.Provider 
      value={{ 
        customers, 
        loading, 
        error, 
        hasTools,
        checkingTools
      }}
    >
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
