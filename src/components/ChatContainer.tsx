
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, MessageSquare, User } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { Message } from '@/types/chat';

type ChatContainerProps = {
  messages: Message[];
  isProcessing: boolean;
  onSendTypicalQuestion?: (question: string) => void;
  conversationId?: string;
  interactionsRating?: Record<string, number>;
};

const ChatContainer = ({ 
  messages, 
  isProcessing, 
  onSendTypicalQuestion,
  conversationId,
  interactionsRating = {}
}: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if any message is streaming, and scroll on each streaming update
  useEffect(() => {
    const streamingMessage = messages.find(msg => msg.isStreaming);
    if (streamingMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.map(m => m.isStreaming ? m.content : '').join('')]);

  const handleQuestionClick = (question: string) => {
    if (onSendTypicalQuestion) {
      onSendTypicalQuestion(question);
    }
  };

  // Filter out empty assistant messages before rendering
  const validMessages = messages.filter(msg => 
    msg.type !== 'assistant' || (msg.content && msg.content.trim() !== '')
  );

  return (
    <ScrollArea className="flex-1 p-2 bg-white">
      {validMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="rounded-full bg-[var(--primary--color-medium)] p-4 mb-4">
          <MessageSquare className="h-6 w-6 text-[var(--primary-color)]" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-[var(--neutral-color-dark)]">Welcome</h3>
        <p className="text-sm text-[var(--neutral-color-medium)] max-w-md mb-6">
          I'm your AI assistant. Ask me questions or request information to get started.
        </p>
        <div className="mt-4 flex flex-col space-y-3">
          <div 
            className="flex items-center card-darken-hover p-3 rounded-sm text-sm text-[var(--neutral-color-medium)] border-l-2 border-[var(--primary-color)] cursor-pointer"
            onClick={() => handleQuestionClick("What can you help me with?")}
          >
            <HelpCircle className="h-3 w-3 mr-2 text-[var(--primary-color)]" />
            <span>Try asking "What can you help me with?"</span>
          </div>
          <div 
            className="flex items-center card-darken-hover p-3 rounded-sm text-sm text-[var(--neutral-color-medium)] border-l-2 border-[var(--primary-color)] cursor-pointer"
            onClick={() => handleQuestionClick("How many bookings did I get from the 7th of April to the 20th of April?")}
          >
            <MessageSquare className="h-3 w-3 mr-2 text-[var(--primary-color)]" />
            <span>Try asking "How many bookings did I get from the 7th of April to the 20th of April?"</span>
          </div>
          <div 
            className="flex items-center card-darken-hover p-3 rounded-sm text-sm text-[var(--neutral-color-medium)] border-l-2 border-[var(--primary-color)] cursor-pointer"
            onClick={() => handleQuestionClick("Compare the number of calls received during April and during March")}
          >
            <MessageSquare className="h-3 w-3 mr-2 text-[var(--primary-color)]" />
            <span>Or "Compare the number of calls received during April and during March"</span>
          </div>
        </div>
      </div>
      ) : (
        <div className="space-y-1 px-1">
          {validMessages.map((message) => {
            if (message.type === 'user') {
              return (
                <MessageBubble
                  key={message.id}
                  type="user"
                  content={message.content}
                  messageIndex={message.messageIndex}
                />
              );
            } else if (message.type === 'tool_call') {
              return (
                <MessageBubble
                  key={message.id}
                  type="tool"
                  content="Looking up information for you..."
                  toolName={message.tool}
                  toolArgs={message.arguments}
                  toolResult={message.result}
                  messageIndex={message.messageIndex}
                />
              );
            } else {
              return (
                <MessageBubble
                  key={message.id}
                  type="assistant"
                  content={message.content}
                  isStreaming={message.isStreaming}
                  conversationId={conversationId}
                  messageIndex={message.messageIndex}
                  interactionsRating={interactionsRating}
                />
              );
            }
          })}
          {isProcessing && !validMessages.some(msg => msg.isStreaming) && (
            <div className="flex space-x-2 p-2 items-center justify-center">
              <div className="h-1.5 w-1.5 bg-[var(--primary-color)] rounded-full animate-pulse"></div>
              <div className="h-1.5 w-1.5 bg-[var(--primary-color)] rounded-full animate-pulse delay-150"></div>
              <div className="h-1.5 w-1.5 bg-[var(--primary-color)] rounded-full animate-pulse delay-300"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
};

export default ChatContainer;
