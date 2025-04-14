
import React from 'react';
import { Phone } from 'lucide-react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-black text-white shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="relative bg-black p-2 rounded-full border border-white">
          <img 
            src="/lovable-uploads/4436ecd0-aa4c-4af4-9378-97eb0aa6604b.png" 
            alt="bookline.AI" 
            className="h-6 w-6"
          />
        </div>
        <div>
          <h1 className="font-mono text-sm">bookline.AI</h1>
          <p className="text-xs text-gray-300">Ready to assist you</p>
        </div>
      </div>
      <div className="flex items-center text-xs px-3 py-1 rounded-full bg-gray-800">
        <span className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
          <span className="text-gray-300 text-xs">online</span>
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
