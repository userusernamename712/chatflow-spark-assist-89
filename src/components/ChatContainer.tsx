
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Terminal, MessageSquare } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { Message } from '@/types/chat';

type ChatContainerProps = {
  messages: Message[];
  isProcessing: boolean;
};

const ChatContainer = ({ messages, isProcessing }: ChatContainerProps) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-2 bg-zinc-900 backdrop-blur-sm">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="rounded-full bg-zinc-800 p-4 mb-4">
            <Terminal className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-mono font-semibold mb-2 text-zinc-300">AI Terminal</h3>
          <p className="text-sm text-zinc-500 max-w-md font-mono">
            Type a command to begin interacting with the AI assistant.
          </p>
          <div className="mt-8 flex flex-col space-y-2">
            <div className="flex items-center bg-zinc-800/50 p-2 px-3 rounded-sm text-sm font-mono text-zinc-400 border-l-2 border-zinc-700">
              <Bot className="h-3 w-3 mr-2 text-green-500" />
              <span>$ ai run "What's my conversion rate?"</span>
            </div>
            <div className="flex items-center bg-zinc-800/50 p-2 px-3 rounded-sm text-sm font-mono text-zinc-400 border-l-2 border-zinc-700">
              <Terminal className="h-3 w-3 mr-2 text-green-500" />
              <span>$ ai run "Show me recent stats"</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1 px-1">
          {messages.map((message) => {
            if (message.type === 'user') {
              return (
                <MessageBubble
                  key={message.id}
                  type="user"
                  content={message.content}
                />
              );
            } else if (message.type === 'tool_call') {
              return (
                <MessageBubble
                  key={message.id}
                  type="tool"
                  content={`Executing tool...`}
                  toolName={message.tool}
                  toolArgs={message.arguments}
                  toolResult={message.result}
                />
              );
            } else {
              return (
                <MessageBubble
                  key={message.id}
                  type="assistant"
                  content={message.content}
                  isStreaming={message.isStreaming}
                />
              );
            }
          })}
          {isProcessing && !messages[messages.length - 1]?.isStreaming && (
            <div className="flex space-x-2 p-2 items-center justify-center">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse delay-150"></div>
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse delay-300"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
};

export default ChatContainer;
