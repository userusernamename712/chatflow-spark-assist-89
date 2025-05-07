import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchConversationHistory } from '@/services/conversationService';
import { Conversation } from '@/types/conversation';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertTriangle, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_CUSTOMERS } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ConversationSidebarProps {
  customerId: string;
  sessionId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  startNewChat: () => void;
  onChangeCustomer: (customerId: string) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const ConversationSidebar = ({
  customerId,
  sessionId,
  onSelectConversation,
  startNewChat,
  onChangeCustomer,
  isMobile = false,
  onCloseMobile,
}: ConversationSidebarProps) => {
  const { selectedCustomerId, selectCustomer } = useAuth();
  const { hasTools } = useCustomers();

  // Fetch conversations for the selected customer
  const {
    data: conversations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['conversations', customerId],
    queryFn: () => fetchConversationHistory(customerId),
  });

  const handleCustomerChange = (value: string) => {
    selectCustomer(value);
    startNewChat(); // Start a new chat when changing customers
    toast({
      title: "Customer Changed",
      description: `Switched to ${AVAILABLE_CUSTOMERS.find(c => c.id === value)?.name || value}`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        {isMobile && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            {onCloseMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseMobile}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="mb-4">
          <Select value={customerId} onValueChange={handleCustomerChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_CUSTOMERS.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!hasTools && (
          <Alert variant="destructive" className="mb-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Customer not supported</AlertTitle>
            <AlertDescription>
              This customer doesn't have any tools available for the chatbot.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={startNewChat}
          className="w-full flex items-center justify-center gap-2"
          disabled={!hasTools}
        >
          <PlusCircle className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <div className="w-6 h-6 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="text-center p-4 text-red-500 text-sm">
            Error loading conversations
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.session_id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  sessionId === conversation.session_id
                    ? 'bg-[#E5DEFF] text-[#6643EA]'
                    : 'hover:bg-gray-100'
                }`}
                disabled={!hasTools}
              >
                <div className="text-sm font-medium truncate">
                  {conversation.title || 'New conversation'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(conversation.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500 text-sm">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
