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
  disabled?: boolean;
};

const ChatContainer = ({
  messages,
  isProcessing,
  onSendTypicalQuestion,
  conversationId,
  interactionsRating = {},
  disabled,
}: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  console.log(`Is it disabled : ${disabled}`)

  // Auto-scroll when messages change or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Scroll on each streaming content update
  useEffect(() => {
    const streamingMessage = messages.find((msg) => msg.isStreaming);
    if (streamingMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.map((m) => (m.isStreaming ? m.content : '')).join('')]);

  const handleQuestionClick = (question: string) => {
    if (onSendTypicalQuestion) {
      onSendTypicalQuestion(question);
    }
  };

  const validMessages = messages.filter(
    (msg) => msg.type !== 'assistant' || (msg.content && msg.content.trim() !== '')
  );

  return (
    <ScrollArea className="flex-1 bg-[#F6F6F7]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {validMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="rounded-full bg-[#F1F0FB] p-4 mb-4">
              <MessageSquare className="h-6 w-6 text-[#9b87f5]" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-[#403E43]">Welcome</h3>
            <p className="text-sm text-[#8E9196] max-w-md mb-6">
              I'm your AI assistant. Ask me questions or request information to get started.
            </p>

            {disabled && (
              <div className="mt-2 text-sm text-red-500 flex items-center space-x-2">
                <button
                  className="underline text-red-600 hover:text-red-800 transition"
                  onClick={() => window.location.reload()}
                >
                  Try refreshing
                </button>
              </div>
            )}
            {!disabled && (
              <div className="mt-4 flex flex-col space-y-3 w-full max-w-lg">
                <div
                  className="flex items-center p-4 rounded-lg text-sm text-[#8E9196] bg-white border border-[#E5DEFF] hover:bg-[#F9F8FF] transition-colors cursor-pointer"
                  onClick={() => handleQuestionClick('What can you help me with?')}
                >
                  <HelpCircle className="h-4 w-4 mr-3 text-[#9b87f5] flex-shrink-0" />
                  <span>Try asking "What can you help me with?"</span>
                </div>
                <div
                  className="flex items-center p-4 rounded-lg text-sm text-[#8E9196] bg-white border border-[#E5DEFF] hover:bg-[#F9F8FF] transition-colors cursor-pointer"
                  onClick={() =>
                    handleQuestionClick(
                      'How many bookings did I get from the 7th of April to the 20th of April?'
                    )
                  }
                >
                  <MessageSquare className="h-4 w-4 mr-3 text-[#9b87f5] flex-shrink-0" />
                  <span>
                    Try asking "How many bookings did I get from the 7th of April to the 20th of
                    April?"
                  </span>
                </div>
                <div
                  className="flex items-center p-4 rounded-lg text-sm text-[#8E9196] bg-white border border-[#E5DEFF] hover:bg-[#F9F8FF] transition-colors cursor-pointer"
                  onClick={() =>
                    handleQuestionClick(
                      'Compare the number of calls received during April and during March'
                    )
                  }
                >
                  <MessageSquare className="h-4 w-4 mr-3 text-[#9b87f5] flex-shrink-0" />
                  <span>Or "Compare the number of calls received during April and during March"</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
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
            {isProcessing && !validMessages.some((msg) => msg.isStreaming) && (
              <div className="flex justify-center py-4">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-[#9b87f5] rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-[#9b87f5] rounded-full animate-pulse delay-150"></div>
                  <div className="h-2 w-2 bg-[#9b87f5] rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatContainer;
