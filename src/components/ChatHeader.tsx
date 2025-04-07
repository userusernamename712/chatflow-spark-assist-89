
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-card to-card/80 backdrop-blur-sm rounded-t-lg">
      <div className="flex items-center space-x-3">
        <div className="relative bg-primary/10 p-2 rounded-full">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-card animate-pulse"></span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-semibold text-lg text-foreground">SparkAssist</h1>
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">Powered by AI</p>
        </div>
      </div>
      <div className="flex items-center text-xs bg-secondary/50 px-3 py-1 rounded-full">
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Live Connection</span>
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
