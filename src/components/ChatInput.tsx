
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
};

const ChatInput = ({ onSendMessage, isProcessing }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
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

  // Auto focus when processing is complete
  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white rounded-b-lg border-t border-[var(--neutral-color-strokes)]">
      <div className="relative flex items-center">
        <div className="chat-input-container w-full">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta a la Chat..."
            className="w-full px-4 py-3 pl-10 pr-12 rounded-full bg-[var(--neutral-color-background)] text-[var(--neutral-color-dark)] border-[var(--neutral-color-strokes)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] font-sans text-sm"
            disabled={isProcessing}
          />
          <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--primary-color)]" />
        </div>
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white transition-all duration-200"
          disabled={!message.trim() || isProcessing}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      {isProcessing && (
        <div className="mt-1.5 text-xs text-[var(--neutral-color-medium)] text-center">
          Pensando...
        </div>
      )}
    </form>
  );
};

export default ChatInput;
