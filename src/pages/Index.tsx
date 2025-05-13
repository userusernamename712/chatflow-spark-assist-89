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
import { useQuery } from '@tanstack/react-query';
import { fetchUserEngagement, getFullNameFromEmail } from '@/services/userEngagementService';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

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

  // Improved tools availability check with clearer error handling
  useEffect(() => {
    // Reset tool availability when customer changes or on initial load
    if (!selectedCustomerId) {
      setCustomerHasTools(true);
      return;
    }
  
    const checkTools = async () => {
      setIsCheckingMetadata(true);
      try {
        // Clear any cached state first to avoid issues on customer switch
        setCustomerHasTools(true);
        
        const metadata = await fetchApiMetadata(selectedCustomerId);
        const toolsAvailable = metadata.tools && Object.keys(metadata.tools).length > 0;
        
        console.log(`Customer ${selectedCustomerId} tools available:`, toolsAvailable);
        setCustomerHasTools(toolsAvailable);
        
        // If tools aren't available, show a toast to explain why chat is disabled
        if (!toolsAvailable) {
          toast({
            variant: "destructive",
            title: "Service Unavailable",
            description: "This customer doesn't have access to chat services.",
          });
        }
      } catch (err) {
        console.error('Failed to fetch tools metadata:', err);
        // Default to allowing chat if we can't determine tool availability
        // This prevents incorrect disabling
        setCustomerHasTools(true);
      } finally {
        setIsCheckingMetadata(false);
      }
    };
  
    // Use sessionStorage to avoid repeated API calls in same session
    const cachedStatus = sessionStorage.getItem(`customer_${selectedCustomerId}_tools`);
    
    if (cachedStatus === null) {
      // Only check if we don't have cached status
      checkTools();
    } else {
      // Use cached value if available
      setCustomerHasTools(cachedStatus === 'true');
    }
    
  }, [selectedCustomerId]);
  
  // Cache tool availability in sessionStorage (not localStorage) to expire with session
  useEffect(() => {
    if (selectedCustomerId) {
      sessionStorage.setItem(
        `customer_${selectedCustomerId}_tools`, 
        customerHasTools.toString()
      );
    }
  }, [selectedCustomerId, customerHasTools]);

  // Fetch user engagement data for Hall of Shame
  const { data: usersEngagement, isLoading: isLoadingEngagement } = useQuery({
    queryKey: ['userEngagement'],
    queryFn: fetchUserEngagement,
    enabled: isAuthenticated,
  });

  // Sort users by conversation_count (ascending for least engaged)
  const sortedUsers = usersEngagement
    ? Object.entries(usersEngagement)
        .sort(([, a], [, b]) => a.conversation_count * a.mean_user_messages - b.conversation_count * b.mean_user_messages)
        .map(([email, data], index) => ({
          email,
          fullName: getFullNameFromEmail(email),
          rank: index + 1,
          ...data
        }))
    : [];

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
      throw err; // Let the caller handle fallback
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
        user: user.email,
        customer_id: selectedCustomerId,
        prompt: content.trim(),
      },
      handleChatEvent,
      handleChatComplete,
      handleError
    );
  };

  // Function to handle chat completion with the session ID from the stream
  const handleChatComplete = (streamSessionId?: string | null) => {
    setIsProcessing(false);
    
    // If we received a session ID from the stream, use it directly
    if (streamSessionId && !sessionId) {
      localStorage.setItem('chatSessionId', streamSessionId);
      setSessionId(streamSessionId);
      
      // Still invalidate queries to keep the sidebar up to date
      // but don't fetch and reload the conversation
      queryClient.invalidateQueries({ queryKey: ['conversations', selectedCustomerId] });
    } 
    // If this was the first message and we didn't get a session ID from stream
    else if (!sessionId && !streamSessionId) {
      
      // We need to extract the session ID from the server response
      // The conversation should have been created on the server
      queryClient.invalidateQueries({ queryKey: ['conversations', selectedCustomerId] });
      
      // This is our fallback method if the stream didn't provide a session ID
      queryClient.fetchQuery({ 
        queryKey: ['conversations', selectedCustomerId],
        queryFn: async () => {
          const conversations = await fetchConversationHistory(selectedCustomerId);
          if (conversations && conversations.length > 0) {
            // Get the most recent conversation
            const newestConversation = conversations.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            
            // Set the session ID only if we didn't get one from the stream
            if (!sessionId && !streamSessionId) {
              const newSessionId = newestConversation.session_id;
              localStorage.setItem('chatSessionId', newSessionId);
              setSessionId(newSessionId);
            }
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
              messageIndex: prev.length, // Ensure messageIndex is set correctly
            },
          ];
        }
        
        return currentMessages;
      });
      
      // Store the session ID in memory but don't update state yet
      // This prevents the UI from reloading during streaming
      // We'll set it in handleChatComplete when streaming is done
      if (event.session_id && !sessionId) {
        // Just save to localStorage, but don't update state until streaming is complete
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
          messageIndex: prev.length, // Ensure messageIndex is set
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
      
      <div className="flex flex-1 max-w-6xl mx-auto gap-4 p-4">
        {/* Chat Container */}
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
              disabled={!customerHasTools || isCheckingMetadata}
            />
          )}
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isProcessing={isProcessing || isLoadingConversation || isCheckingMetadata}
            disabled={!customerHasTools} 
          />
        </div>

        {/* Hall of Shame section */}
        <div className={`${isMobile ? 'hidden' : 'flex'} flex-col w-80`}>
          <Card className="shadow-lg h-full">
            <CardHeader className="bg-primary text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold">Hall of Shame</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {isLoadingEngagement ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Mean messages</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((user) => (
                      <TableRow 
                        key={user.email}
                        className="hover:bg-purple-100 cursor-pointer transition"
                        onClick={() => {
                          toast({
                            title: `Stats for ${user.fullName}`,
                            description: `Conversations: ${user.conversation_count}, Avg. messages: ${user.mean_user_messages.toFixed(2)}`,
                          });
                        }}
                      >
                        <TableCell className="font-medium">{user.rank}</TableCell>
                        <TableCell className="max-w-[120px] truncate" title={user.email}>
                          {user.fullName}
                        </TableCell>
                        <TableCell className="text-right">{user.conversation_count}</TableCell>
                        <TableCell className="text-right">{user.mean_user_messages.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {sortedUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
