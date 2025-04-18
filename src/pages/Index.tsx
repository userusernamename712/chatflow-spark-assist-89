import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import LoginForm from '@/components/LoginForm';
import ConversationSidebar from '@/components/ConversationSidebar';
import { Message, ChatEvent } from '@/types/chat';
import { Conversation } from '@/types/conversation';
import { sendChatMessage } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Menu, X } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_CUSTOMERS } from '@/types/auth';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { updateConversation } from '@/services/conversationService';
import ApiCapabilitiesSidebar from '@/components/ApiCapabilitiesSidebar';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      handleStartNewSession(customerId);
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

  const handleSelectConversation = (conversation: Conversation) => {
    if (conversation.customer_id !== selectedCustomerId) {
      handleChangeCustomer(conversation.customer_id);
    }
    
    setSessionId(conversation.session_id);
    
    const mappedMessages: Message[] = conversation.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        id: uuidv4(),
        type: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
    
    setMessages(mappedMessages);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4 bg-[#F6F6F7]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-[#9b87f5] rounded-full animate-spin mb-4"></div>
          <div className="text-[#403E43]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4 bg-gradient-to-b from-[#F1F0FB] to-white">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F6F6F7]">
      <div className="hidden md:block w-72 border-r border-[#E5DEFF] bg-white shadow-sm">
        <ConversationSidebar 
          customerId={selectedCustomerId}
          sessionId={sessionId}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[300px]">
          <ConversationSidebar 
            customerId={selectedCustomerId}
            sessionId={sessionId}
            onSelectConversation={handleSelectConversation}
            isMobile={true}
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
      
      <div className="flex flex-col flex-1 max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-[#E5DEFF]">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <ChatHeader />
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedCustomerId} onValueChange={handleChangeCustomer}>
              <SelectTrigger className="w-[180px] border-[#E5DEFF] bg-[#F1F0FB]">
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
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStartNewSession()}
              className="border-[#E5DEFF] hover:bg-[#F1F0FB]"
            >
              <Plus className="h-4 w-4 mr-1 text-[#9b87f5]" />
              New Chat
            </Button>
            
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-[#1A1F2C]">{user?.username}</span>
              <span className="text-xs text-[#8E9196]">{user?.email}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="hover:bg-[#F1F0FB]"
            >
              <LogOut className="h-4 w-4 mr-1 text-[#7E69AB]" />
              <span className="hidden md:inline">Logout</span>
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

      <ApiCapabilitiesSidebar />
    </div>
  );
};

export default Index;
