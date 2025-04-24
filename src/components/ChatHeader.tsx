
import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useCustomers } from '@/contexts/CustomerContext';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_CUSTOMERS } from '@/types/auth';

interface ChatHeaderProps {
  isHistoricalChat?: boolean;
}

const ChatHeader = ({ isHistoricalChat = false }: ChatHeaderProps) => {
  const { customers } = useCustomers();
  const { selectedCustomerId } = useAuth();
  const [customerName, setCustomerName] = useState<string | null>(null);
  
  useEffect(() => {
    // First try to find customer in the fetched customers list
    const foundCustomer = customers.find(c => c.id === selectedCustomerId);
    
    if (foundCustomer) {
      setCustomerName(foundCustomer.name);
    } else {
      // Fallback to available customers if not found in fetched list
      const availableCustomer = AVAILABLE_CUSTOMERS.find(c => c.id === selectedCustomerId);
      if (availableCustomer) {
        setCustomerName(availableCustomer.name);
      }
    }
  }, [selectedCustomerId, customers]);

  return (
    <div className="flex items-center">
      <div className="relative h-10 w-10">
        <img 
          src="/lovable-uploads/550aab05-c6c5-4d4a-8ef2-665352be8d2e.png" 
          alt="bookline.AI Logo" 
          className="h-full w-full object-contain"
        />
      </div>
      <div className="ml-3">
        <h1 className="font-bold text-md text-[#1A1F2C]">
          bookline.AI
          {customerName && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({customerName})
            </span>
          )}
        </h1>
        <div className="flex items-center text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] animate-pulse mr-1.5"></span>
          <span className="text-[#8E9196]">
            {isHistoricalChat ? 'viewing chat history' : 'online'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
