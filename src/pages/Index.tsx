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
import { LogOut, Plus, RefreshCw } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_CUSTOMERS } from '@/types/auth';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user, isAuthenticated, logout, selectedCustomerId, startNewSession, loading } = useAuth();

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
        customer_id: selectedCustomerId,
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

  const handleStartNewSession = (customerId?: string) => {
    const newCustomerId = customerId || selectedCustomerId;
    startNewSession(newCustomerId);
    setMessages([]);
    setSessionId(null);
    toast({
      title: "New session started",
      description: `You've started a new conversation with ${
        AVAILABLE_CUSTOMERS.find(c => c.id === newCustomerId)?.name || newCustomerId
      }.`,
    });
  };

  const handleChangeCustomer = (customerId: string) => {
    if (customerId !== selectedCustomerId) {
      if (messages.length > 0) {
        if (confirm("Changing the client will start a new conversation. Continue?")) {
          handleStartNewSession(customerId);
        }
      } else {
        handleStartNewSession(customerId);
      }
    }
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

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-[var(--neutral-color-strokes)]">
      <div className="flex items-center justify-between p-4 border-b">
        <ChatHeader />
        <div className="flex items-center gap-2">
          <Select value={selectedCustomerId} onValueChange={handleChangeCustomer}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_CUSTOMERS.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={() => handleStartNewSession()}>
            <Plus className="h-4 w-4 mr-1" />
            New Session
          </Button>
          
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">{user?.username}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
          
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
