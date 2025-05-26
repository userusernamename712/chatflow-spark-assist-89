
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
};

const ChatInput = ({ onSendMessage, isProcessing, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
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

  // Auto focus when not disabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Determine if button should be disabled (message empty or chat disabled)
  const isButtonDisabled = !message.trim() || disabled;

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
            placeholder={"Ask me anything..."}
            disabled={disabled}
            className={`min-h-[50px] max-h-[150px] pr-12 pl-10 border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 font-sans text-sm
              ${disabled
                ? 'text-red-500 placeholder-red-500'
                : 'text-[#403E43] placeholder-[#8E9196]'
              }
            `}
          />
          <Button
            type="submit"
            size="icon"
            className={`absolute right-2 bottom-2 rounded-lg h-8 w-8 transition-all duration-200 ${
              disabled
                ? 'border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-50'
                : 'bg-[#9b87f5] hover:bg-[#7E69AB] text-white'
            }`}
            disabled={isButtonDisabled}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <div className={`mt-2 text-xs text-center ${
          disabled ? 'text-red-500' : 'text-[#8E9196]'
        }`}>
          {disabled
            ? "This service is not available for this customer"
            : "Type your message and press Enter to send"
          }
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
