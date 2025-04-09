
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

  // Auto focus when processing is complete
  useEffect(() => {
    if (!isProcessing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isProcessing]);

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-zinc-900 rounded-b-lg border-t border-zinc-800">
      <div className="relative flex items-end">
        <div className="absolute left-3 bottom-3 text-zinc-600">
          <Sparkles className="h-4 w-4" />
        </div>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="$ ai run..."
          className="min-h-[50px] max-h-[150px] pr-12 pl-10 rounded-md resize-none bg-zinc-800/80 text-zinc-300 focus-visible:ring-zinc-700 font-mono text-sm border-zinc-700"
          disabled={isProcessing}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 bottom-2 rounded-md h-8 w-8 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-all duration-200"
          disabled={!message.trim() || isProcessing}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      <div className="mt-1.5 text-xs text-zinc-600 text-center font-mono">
        {isProcessing ? "Processing request..." : "Press Enter to send, Shift+Enter for new line"}
      </div>
    </form>
  );
};

export default ChatInput;
