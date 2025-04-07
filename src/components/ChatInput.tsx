
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
};

const ChatInput = ({ onSendMessage, isProcessing }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-gradient-to-r from-card to-card/80 backdrop-blur-sm rounded-b-lg border-t border-border">
      <div className="relative flex items-end">
        <div className="absolute left-3 bottom-3 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="min-h-[60px] max-h-[150px] pr-12 pl-10 rounded-xl resize-none bg-secondary/80 text-secondary-foreground shadow-inner focus-visible:ring-primary/50"
          disabled={isProcessing}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 bottom-2 rounded-lg h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-md hover:shadow-lg"
          disabled={!message.trim() || isProcessing}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {isProcessing ? "Processing your request..." : "Press Enter to send, Shift+Enter for new line"}
      </div>
    </form>
  );
};

export default ChatInput;
