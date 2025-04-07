
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card rounded-t-lg">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-card"></span>
        </div>
        <div>
          <h1 className="font-semibold text-lg text-foreground">SparkAssist</h1>
          <p className="text-xs text-muted-foreground">Powered by AI</p>
        </div>
      </div>
      <div className="flex items-center text-xs text-muted-foreground">
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span>Live</span>
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
