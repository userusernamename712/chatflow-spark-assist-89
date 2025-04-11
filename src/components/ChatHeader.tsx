
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-white shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="relative bg-[var(--primary--color-medium)] p-2 rounded-md">
          <MessageSquare className="h-4 w-4 text-[var(--primary-color)]" />
        </div>
        <div>
          <h1 className="font-mono text-sm text-[var(--neutral-color-dark)]">AI Assistant</h1>
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
