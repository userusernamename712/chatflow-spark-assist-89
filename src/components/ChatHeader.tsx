
import React from 'react';
import { Bot } from 'lucide-react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900 backdrop-blur-sm rounded-t-lg">
      <div className="flex items-center space-x-3">
        <div className="relative bg-zinc-800 p-2 rounded-md">
          <Bot className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <h1 className="font-mono text-sm text-zinc-300">AI Assistant</h1>
          <p className="text-xs text-zinc-500">Ready to help</p>
        </div>
      </div>
      <div className="flex items-center text-xs px-3 py-1 rounded-full bg-zinc-800">
        <span className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-zinc-500 text-xs">online</span>
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
