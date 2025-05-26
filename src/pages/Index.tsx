import React, { useState, useEffect } from 'react';
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
import { fetchApiMetadata } from '@/services/apiService';
import { Conversation } from '@/types/conversation';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, selectedCustomerId, loading } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chatSessionId'));
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [interactionsRating, setInteractionsRating] = useState<Record<string, number>>({});
  const [customerHasTools, setCustomerHasTools] = useState(true);
  const [isCheckingMetadata, setIsCheckingMetadata] = useState(false);

  useEffect(() => {
    if (!selectedCustomerId) return;

    const checkTools = async () => {
      setIsCheckingMetadata(true);
      try {
        const metadata = await fetchApiMetadata(selectedCustomerId);
        setCustomerHasTools(metadata.tools && Object.keys(metadata.tools).length > 0);
      } catch (err) {
        console.error('Failed to fetch tools metadata:', err);
        setCustomerHasTools(false);
      } finally {
        setIsCheckingMetadata(false);
      }
    };

    checkTools();
  }, [selectedCustomerId]);

  useEffect(() => {
    if (sessionId) {
      loadConversation(sessionId);
    }
  }, [sessionId]);

  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoadingConversation(true);
      const conversation = await fetchConversation(conversationId);

      const mappedMessages: Message[] = [];
      setInteractionsRating(conversation.interactions_rating || {});

      conversation.messages.forEach((m, index) => {
        if (m.role === 'system') return;

        if (m.role === 'user' && m.content) {
          mappedMessages.push({
            id: uuidv4(),
            type: 'user',
            content: m.content,
            messageIndex: index,
          });
        } else if (m.role === 'assistant') {
          if (m.content) {
            mappedMessages.push({
              id: uuidv4(),
              type: 'assistant',
              content: m.content,
              messageIndex: index,
            });
          }

          if (m.tool_calls?.length) {
            m.tool_calls.forEach(toolCall => {
              let args;
              try {
                args = JSON.parse(toolCall.function.arguments);
              } catch {
                args = { error: 'Could not parse arguments' };
              }

              mappedMessages.push({
                id: uuidv4(),
                type: 'tool_call',
                content: `Using ${toolCall.function.name}...`,
                tool: toolCall.function.name,
                arguments: args,
                toolCallId: toolCall.id,
              });
            });
          }
        } else if (m.role === 'tool' && m.content && m.tool_call_id) {
          const toolCallIndex = mappedMessages.findIndex(
            msg => msg.type === 'tool_call' && msg.toolCallId === m.tool_call_id
          );

          if (toolCallIndex !== -1) {
            let result;
            try {
              result = JSON.parse(m.content);
            } catch {
              result = m.content;
            }

            mappedMessages[toolCallIndex] = {
              ...mappedMessages[toolCallIndex],
              result,
            };
          }
        }
      });

      setMessages(mappedMessages);
      setSessionId(conversationId);
      setRetryCount(0);
    } catch (err) {
      localStorage.removeItem('chatSessionId');
      throw err;
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

    sendChatMessage(
      {
        session_id: sessionId,
        user: user.email,
        customer_id: selectedCustomerId,
        prompt: content.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      handleChatEvent,
      handleChatComplete,
      handleError
    );
  };

  const handleChatComplete = (streamSessionId?: string | null) => {
    setIsProcessing(false);

    if (streamSessionId && !sessionId) {
      localStorage.setItem('chatSessionId', streamSessionId);
      setSessionId(streamSessionId);
      queryClient.invalidateQueries({ queryKey: ['conversations', selectedCustomerId] });
    } else if (!sessionId && !streamSessionId) {
      queryClient.invalidateQueries({ queryKey: ['conversations', selectedCustomerId] });

      queryClient.fetchQuery({
        queryKey: ['conversations', selectedCustomerId],
        queryFn: async () => {
          const conversations = await fetchConversationHistory(selectedCustomerId);
          if (conversations && conversations.length > 0) {
            const newestConversation = conversations.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            if (!sessionId && !streamSessionId) {
              const newSessionId = newestConversation.session_id;
              localStorage.setItem('chatSessionId', newSessionId);
              setSessionId(newSessionId);
            }
          }
          return conversations;
        },
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
              messageIndex: prev.length,
            },
          ];
        }

        return currentMessages;
      });

      if (event.session_id && !sessionId) {
        localStorage.setItem('chatSessionId', event.session_id);
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
          messageIndex: prev.length,
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
      variant: 'destructive',
      title: 'Error',
      description: error.message || 'Something went wrong. Please try again.',
    });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    localStorage.setItem('chatSessionId', conversation.session_id);
    setSessionId(conversation.session_id);
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
    // Handled by auth context
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
      <div className="flex flex-col h-screen items-center justify-center p-4 bg-white">
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

      <div className="flex flex-1 max-w-6xl mx-auto gap-4 p-4">
        <div className="flex flex-col flex-1 bg-white shadow-lg rounded-lg overflow-hidden border border-[#E5DEFF]">
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
              conversationId={sessionId}
              interactionsRating={interactionsRating}
              disabled={!customerHasTools}
            />
          )}

          <ChatInput
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing || isLoadingConversation}
            disabled={!customerHasTools}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
