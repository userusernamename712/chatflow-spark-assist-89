
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm rounded-t-lg">
      <div className="flex items-center space-x-3">
        <div className="relative bg-primary/10 p-2 rounded-full">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary rounded-full border-2 border-card animate-pulse"></span>
        </div>
        <div>
          <h1 className="font-semibold text-lg text-foreground">Minimal Chat</h1>
          <p className="text-xs text-muted-foreground">AI Assistant</p>
        </div>
      </div>
      <div className="flex items-center text-xs bg-secondary px-3 py-1 rounded-full">
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-muted-foreground">Connected</span>
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
