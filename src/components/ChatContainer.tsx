
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CircleDashed } from 'lucide-react';
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
    <ScrollArea className="flex-1 p-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <CircleDashed className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Start the conversation by asking a question about conversion rates or any other data insights.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
                  content={`Using tool to fetch data...`}
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
            <div className="flex space-x-2 p-4 items-center justify-center">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
};

export default ChatContainer;
