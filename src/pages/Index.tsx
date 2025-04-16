
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import LoginForm from '@/components/LoginForm';
import { Message, ChatEvent } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user, isAuthenticated, login, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const savedSessionId = localStorage.getItem('chatSessionId');
      if (savedSessionId) {
        setSessionId(savedSessionId);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, [sessionId]);

  const handleSendMessage = (content: string) => {
    if (!content.trim() || isProcessing || !user) return;

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
        customer_id: user.id, // This will be overridden in the service with the fixed CUSTOMER_ID
        prompt: content.trim(),
      },
      handleChatEvent,
      () => setIsProcessing(false),
      handleError
    );
  };

  const handleSendTypicalQuestion = (question: string) => {
    if (!isProcessing) {
      handleSendMessage(question);
    }
  };

  const handleChatEvent = (event: ChatEvent) => {
    if (!sessionId && event.session_id) {
      setSessionId(event.session_id);
    }

    if (event.type === 'text') {
      setMessages((prev) => {
        const currentMessages = [...prev];
        const lastMessage = currentMessages[currentMessages.length - 1];
        
        if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isStreaming) {
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + (event.message || ''),
            isStreaming: !event.finished,
          };
          return [...currentMessages.slice(0, -1), updatedMessage];
        } else if (lastMessage?.type !== 'assistant' || !lastMessage.isStreaming) {
          return [
            ...currentMessages,
            {
              id: uuidv4(),
              type: 'assistant',
              content: event.message || '',
              isStreaming: !event.finished,
            },
          ];
        }
        
        return currentMessages;
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

  const handleLogin = (username: string) => {
    login(username);
    toast({
      title: "Welcome!",
      description: `You've logged in as ${username}. You're now connected to the Grosso Napoletano client data.`,
    });
  };

  const handleLogout = () => {
    logout();
    setMessages([]);
    setSessionId(null);
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-[var(--neutral-color-strokes)]">
      <div className="flex items-center justify-between p-4 border-b">
        <ChatHeader />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            <strong>{user?.username}</strong> | Client: Grosso Napoletano
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
      <ChatContainer 
        messages={messages} 
        isProcessing={isProcessing} 
        onSendTypicalQuestion={handleSendTypicalQuestion}
      />
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
    </div>
  );
};

export default Index;
