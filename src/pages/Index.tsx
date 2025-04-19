import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import LoginForm from '@/components/LoginForm';
import ConversationSidebar from '@/components/ConversationSidebar';
import { Message, ChatEvent } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchConversation, fetchConversationHistory } from '@/services/conversationService';
import { Conversation } from '@/types/conversation';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, selectedCustomerId, loading } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chatSessionId'));
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sessionId) {
      loadConversation(sessionId);
    }
  }, [sessionId]);

  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoadingConversation(true);
      const conversation = await fetchConversation(conversationId);
      
      const mappedMessages: Message[] = conversation.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          id: uuidv4(),
          type: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));
      
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Silent failure - just clear the session ID without showing error
      localStorage.removeItem('chatSessionId');
      setSessionId(null);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || isProcessing || !user) return;

    const newUserMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: content.trim(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsProcessing(true);

    // Send message with current sessionId
    sendChatMessage(
      {
        session_id: sessionId,
        customer_id: selectedCustomerId,
        prompt: content.trim(),
      },
      handleChatEvent,
      handleChatComplete,
      handleError
    );
  };

  const handleChatComplete = () => {
    setIsProcessing(false);
    
    // If this was the first message in a new conversation
    if (!sessionId) {
      // We need to extract the session ID from the server response
      // The conversation should have been created on the server
      queryClient.invalidateQueries({ queryKey: ['conversations', selectedCustomerId] });
      
      // Fetch the most recent conversation to get its ID
      queryClient.fetchQuery({ 
        queryKey: ['conversations', selectedCustomerId],
        queryFn: async () => {
          const conversations = await fetchConversationHistory(selectedCustomerId);
          if (conversations && conversations.length > 0) {
            // Get the most recent conversation
            const newestConversation = conversations.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            
            // Set the session ID
            const newSessionId = newestConversation.session_id;
            localStorage.setItem('chatSessionId', newSessionId);
            setSessionId(newSessionId);
          }
          return conversations;
        }
      });
    }
  };

  const handleSendTypicalQuestion = (question: string) => {
    if (!isProcessing) {
      handleSendMessage(question);
    }
  };

  const handleChatEvent = (event: ChatEvent) => {
    if (event.type === 'text') {
      // Update messages based on streaming response
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
      
      // If this message contains a session_id and we don't have one yet, save it
      if (event.session_id && !sessionId) {
        localStorage.setItem('chatSessionId', event.session_id);
        setSessionId(event.session_id);
      }
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

  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/c/${conversation.session_id}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleStartNewChat = () => {
    startNewSession();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const startNewSession = () => {
    localStorage.removeItem('chatSessionId');
    setSessionId(null);
    setMessages([]);
  };

  const handleChangeCustomer = (customerId: string) => {
    // This will be handled by the auth context
    // Show toast in ConversationSidebar component
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
          startNewChat={handleStartNewChat}
          onChangeCustomer={handleChangeCustomer}
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
            startNewChat={handleStartNewChat}
            onChangeCustomer={handleChangeCustomer}
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
        </div>
        
        {isLoadingConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-t-2 border-[#9b87f5] rounded-full animate-spin mb-2"></div>
              <div className="text-sm text-[#403E43]">Loading conversation...</div>
            </div>
          </div>
        ) : (
          <ChatContainer 
            messages={messages} 
            isProcessing={isProcessing} 
            onSendTypicalQuestion={handleSendTypicalQuestion}
          />
        )}
        
        <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing || isLoadingConversation} />
      </div>
    </div>
  );
};

export default Index;
