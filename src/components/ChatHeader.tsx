
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-white shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="relative h-8 w-8">
          <img 
            src="/lovable-uploads/550aab05-c6c5-4d4a-8ef2-665352be8d2e.png" 
            alt="bookline.AI Logo" 
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <h1 className="font-mono text-sm text-[var(--neutral-color-dark)]">bookline.AI</h1>
          <p className="text-xs text-[var(--neutral-color-light)]">Ready to help</p>
        </div>
      </div>
      <div className="flex items-center text-xs px-3 py-1 rounded-full bg-[var(--neutral-color-background)]">
        <span className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-succes-contrast)] animate-pulse"></span>
          <span className="text-[var(--neutral-color-medium)] text-xs">online</span>
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
