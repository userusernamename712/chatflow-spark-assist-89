import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import { Message, ChatEvent } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const customerId = "mooma"; // This would typically come from auth or user settings

  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, [sessionId]);

  const handleSendMessage = (content: string) => {
    if (!content.trim() || isProcessing) return;

    const newUserMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: content.trim(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsProcessing(true);

    sendChatMessage(
      {
        session_id: sessionId,
        customer_id: customerId,
        prompt: content.trim(),
      },
      handleChatEvent,
      () => setIsProcessing(false),
      handleError
    );
  };

  const handleChatEvent = (event: ChatEvent) => {
    if (!sessionId && event.session_id) {
      setSessionId(event.session_id);
    }

    if (event.type === 'text' && event.message) {
      const messageId = uuidv4();
      
      setMessages((prev) => {
        const streamingMsgIndex = prev.findIndex(
          (msg) => msg.type === 'assistant' && msg.isStreaming
        );
        
        if (streamingMsgIndex >= 0) {
          const updatedMessages = [...prev];
          updatedMessages[streamingMsgIndex] = {
            ...updatedMessages[streamingMsgIndex],
            content: event.message || '',
            isStreaming: !event.finished,
          };
          return updatedMessages;
        } else {
          return [
            ...prev,
            {
              id: messageId,
              type: 'assistant',
              content: event.message,
              isStreaming: !event.finished,
            },
          ];
        }
      });
    } else if (event.type === 'tool_call') {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: 'tool_call',
          content: `Using ${event.tool}...`,
          tool: event.tool,
          arguments: event.arguments,
          result: event.result,
        },
      ]);
    } else if (event.type === 'error') {
      handleError(new Error(event.message || 'Unknown error'));
    }
  };

  const handleError = (error: Error) => {
    console.error('Chat error:', error);
    setIsProcessing(false);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Something went wrong. Please try again.",
    });
  };

  const clearChat = () => {
    setMessages([]);
    // Keep the session ID to maintain connection with server
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-background/80 backdrop-blur-md shadow-xl rounded-lg overflow-hidden border border-border/50">
      <ChatHeader />
      <ChatContainer messages={messages} isProcessing={isProcessing} />
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
    </div>
  );
};

export default Index;
