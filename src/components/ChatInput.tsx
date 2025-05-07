
import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useCustomers } from '@/contexts/CustomerContext';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
}

const ChatInput = ({ onSendMessage, isProcessing }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const { hasTools, checkingTools } = useCustomers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasTools) {
      return; // Prevent sending if no tools available
    }
    
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (!hasTools) {
        return; // Prevent sending if no tools available
      }
      
      if (inputValue.trim() && !isProcessing) {
        onSendMessage(inputValue);
        setInputValue('');
      }
    }
  };

  return (
    <div className="p-4 border-t bg-white">
      {!hasTools && (
        <Alert variant="destructive" className="mb-3">
          <Info className="h-4 w-4" />
          <AlertTitle>Customer not supported</AlertTitle>
          <AlertDescription>
            This customer doesn't have any tools available. Please contact support or switch to a different customer.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasTools ? "Type your message..." : "Chat is disabled for this customer"}
          disabled={isProcessing || !hasTools || checkingTools}
          className="flex-1 resize-none min-h-[60px] max-h-[180px]"
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={isProcessing || !inputValue.trim() || !hasTools || checkingTools}
          className="rounded-full h-10 w-10 flex items-center justify-center bg-[var(--primary-color)] hover:bg-[var(--primary-color-dark)] disabled:opacity-50"
        >
          <SendHorizontal className="h-5 w-5 text-white" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
