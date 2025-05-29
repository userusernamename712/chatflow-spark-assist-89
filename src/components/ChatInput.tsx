
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Send, MessageSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchApiMetadata } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
  isProcessing: boolean;
  disabled?: boolean;
};

const ChatInput = ({ onSendMessage, onStopGeneration, isProcessing, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [customerHasTools, setCustomerHasTools] = useState(true);
  const [isCheckingTools, setIsCheckingTools] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedCustomerId } = useAuth();
  const lastCheckedCustomerRef = useRef<string | null>(null);

  // Check tools availability when customer changes or component mounts
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerHasTools(false);
      setIsCheckingTools(false);
      return;
    }

    // If customer changed, force immediate recheck
    if (lastCheckedCustomerRef.current !== selectedCustomerId) {
      lastCheckedCustomerRef.current = selectedCustomerId;
      checkToolsImmediately();
    }
  }, [selectedCustomerId]);

  const checkToolsImmediately = async () => {
    if (!selectedCustomerId || isCheckingTools) return;

    console.log('Checking tool availability for customer:', selectedCustomerId);
    setIsCheckingTools(true);
    
    try {
      // Add cache-busting timestamp to ensure fresh data
      const timestamp = new Date().getTime();
      const metadata = await fetchApiMetadata(selectedCustomerId + `&_t=${timestamp}`);
      
      const hasTools = metadata.tools && Object.keys(metadata.tools).length > 0;
      console.log('Tool availability result:', hasTools, 'Tools found:', Object.keys(metadata.tools || {}));
      
      setCustomerHasTools(hasTools);
    } catch (err) {
      console.error('Failed to fetch tools metadata:', err);
      // On error, assume tools are not available
      setCustomerHasTools(false);
    } finally {
      setIsCheckingTools(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isProcessing) {
      onStopGeneration();
    } else if (message.trim() && !disabled && !isCheckingTools && customerHasTools) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  // Auto focus when processing is complete
  useEffect(() => {
    if (!isProcessing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isProcessing]);

  // Determine if input should be disabled
  const isInputDisabled = disabled || isCheckingTools || !customerHasTools;
  
  // Determine if button should be disabled
  const isButtonDisabled = (!isProcessing && !message.trim()) || isInputDisabled;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="bg-white rounded-xl shadow-lg border border-[#E5DEFF] p-4">
        <div className="relative flex items-end">
          <div className="absolute left-3 bottom-3 text-[#9b87f5]">
            <MessageSquare className="h-4 w-4" />
          </div>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isCheckingTools ? "Checking availability..." : "Ask me anything..."}
            disabled={isInputDisabled}
            className={`min-h-[50px] max-h-[150px] pr-12 pl-10 border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 font-sans text-sm
              ${isInputDisabled
                ? 'text-red-500 placeholder-red-500'
                : 'text-[#403E43] placeholder-[#8E9196]'
              }
            `}
          />
          <Button
            type="submit"
            size="icon"
            className={`absolute right-2 bottom-2 rounded-lg h-8 w-8 transition-all duration-200 ${
              isInputDisabled
                ? 'border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-50'
                : isProcessing
                  ? 'bg-[#9b87f5] hover:bg-[#7E69AB] text-white'
                  : 'bg-[#9b87f5] hover:bg-[#7E69AB] text-white'
            }`}
            disabled={isButtonDisabled}
          >
            {isProcessing ? (
              <Square className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">{isProcessing ? 'Stop' : 'Send'}</span>
          </Button>
        </div>
        <div className={`mt-2 text-xs text-center ${
          isInputDisabled && !isProcessing ? 'text-red-500' : 'text-[#8E9196]'
        }`}>
          {isProcessing
            ? "Click stop to interrupt generation..."
            : isCheckingTools
              ? "Checking service availability..."
              : !customerHasTools
                ? "This service is not available for this customer"
                : "Type your message and press Enter to send"
          }
        </div>
        {!customerHasTools && !isCheckingTools && !isProcessing && (
          <div className="mt-1 text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={checkToolsImmediately}
              className="text-xs text-[#9b87f5] hover:text-[#7E69AB] hover:bg-[#F1F0FB]"
            >
              Try refreshing
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default ChatInput;
