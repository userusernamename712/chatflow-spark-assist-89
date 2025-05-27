import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import { Message, ChatEvent } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { fetchConversation } from '@/services/conversationService';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ConversationSidebar from '@/components/ConversationSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ToolCall } from '@/types/conversation';

const Conversation = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, selectedCustomerId, loading } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [interactionsRating, setInteractionsRating] = useState<Record<string, number>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const maxRetries = 3;

  useEffect(() => {
    if (!isAuthenticated || !conversationId) {
      navigate('/');
      return;
    }

    const loadConversation = async () => {
      try {
        setIsLoading(true);
        const conversation = await fetchConversation(conversationId);
        
        const mappedMessages: Message[] = [];
        
        // Store the interactions ratings
        setInteractionsRating(conversation.interactions_rating || {});
        
        // Convert Firestore conversation messages to our UI Message format
        conversation.messages.forEach((m, index) => {
          // Skip system messages
          if (m.role === 'system') return;
          
          // Handle user messages
          if (m.role === 'user' && m.content) {
            mappedMessages.push({
              id: uuidv4(),
              type: 'user',
              content: m.content,
              messageIndex: index,
            });
          } 
          // Handle assistant messages with tool calls
          else if (m.role === 'assistant') {
            if (m.content) {
              mappedMessages.push({
                id: uuidv4(),
                type: 'assistant',
                content: m.content,
                messageIndex: index, // Ensure all assistant messages get an index
              });
            }
            
            // Handle tool_calls if present
            if (m.tool_calls && m.tool_calls.length > 0) {
              m.tool_calls.forEach(toolCall => {
                let args;
                try {
                  args = JSON.parse(toolCall.function.arguments);
                } catch (e) {
                  args = { error: "Could not parse arguments" };
                }
                
                mappedMessages.push({
                  id: uuidv4(),
                  type: 'tool_call',
                  content: `Using ${toolCall.function.name}...`,
                  tool: toolCall.function.name,
                  arguments: args,
                  toolCallId: toolCall.id,
                  messageIndex: index,
                  // Result will be populated when we find matching tool message
                });
              });
            }
          } 
          // Handle tool results
          else if (m.role === 'tool' && m.content && m.tool_call_id) {
            // Find the matching tool_call message
            const toolCallIndex = mappedMessages.findIndex(
              msg => msg.type === 'tool_call' && msg.toolCallId === m.tool_call_id
            );
            
            if (toolCallIndex !== -1) {
              // Parse tool result if it's a JSON string
              let result;
              try {
                result = JSON.parse(m.content);
              } catch (e) {
                // If not valid JSON, use as-is
                result = m.content;
              }
              
              // Update the existing tool call with the result
              mappedMessages[toolCallIndex] = {
                ...mappedMessages[toolCallIndex],
                result: result
              };
            }
          }
        });
        
        setMessages(mappedMessages);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Error loading conversation:', error);
        
        // Silent retry mechanism - don't show error to user
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          
          setTimeout(() => {
            loadConversation();
          }, delay);
        } else {
          // After max retries, redirect to home without showing error
          console.error('Max retries reached, redirecting to home');
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, isAuthenticated, navigate, retryCount]);

  const handleSendMessage = (content: string) => {
    if (!content.trim() || isProcessing || !user) return;

    // Store the last user message for potential retry
    setLastUserMessage(content.trim());

    const newUserMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: content.trim(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsProcessing(true);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    sendChatMessage(
      {
        session_id: conversationId || null,
        user: user.email || null,
        customer_id: selectedCustomerId,
        prompt: content.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      handleChatEvent,
      (sessionId) => {
        // Just set processing to false, we don't need to do anything with the session ID
        // since we already have it for historical conversations
        setIsProcessing(false);
        abortControllerRef.current = null;
      },
      handleError,
      abortControllerRef.current.signal
    );
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsProcessing(false);
      
      // Always add an aborted message with retry options when generation is stopped
      const abortedMessage: Message = {
        id: uuidv4(),
        type: 'aborted',
        content: 'Generation was stopped.',
        originalPrompt: lastUserMessage,
        messageIndex: messages.length,
      };
      setMessages((prev) => [...prev, abortedMessage]);
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
              messageIndex: currentMessages.length, // Ensure messageIndex is set correctly
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
    toast.error(error.message || "Something went wrong. Please try again.");
  };

  const handleSelectConversation = (conversation: any) => {
    navigate(`/c/${conversation.session_id}`);
    setSidebarOpen(false);
  };

  const handleChangeCustomer = (customerId: string) => {
    navigate('/');
  };

  const handleRetryMessage = (originalPrompt: string) => {
    if (!isProcessing && originalPrompt.trim()) {
      // Remove the aborted message first
      setMessages((prev) => prev.filter(msg => msg.type !== 'aborted'));
      // Send the original message again
      handleSendMessage(originalPrompt);
    }
  };

  const passMessagesToContainer = () => {
    return messages.map(message => ({
      ...message,
      conversationId: conversationId,
    }));
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4 bg-[#F6F6F7]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-[#9b87f5] rounded-full animate-spin mb-4"></div>
          <div className="text-[#403E43]">Loading conversation...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F6F6F7]">
      <div className="hidden md:block w-72 border-r border-[#E5DEFF] bg-white shadow-sm">
        <ConversationSidebar 
          customerId={selectedCustomerId}
          sessionId={conversationId || null}
          onSelectConversation={(conversation) => handleSelectConversation(conversation)}
          onChangeCustomer={handleChangeCustomer}
        />
      </div>
      
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[300px]">
          <ConversationSidebar 
            customerId={selectedCustomerId}
            sessionId={conversationId || null}
            onSelectConversation={(conversation) => handleSelectConversation(conversation)}
            onChangeCustomer={handleChangeCustomer}
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
            <ChatHeader isHistoricalChat={true} />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="border-[#E5DEFF] hover:bg-[#F1F0FB]"
            >
              Return to Home
            </Button>
          </div>
        </div>
        <ChatContainer 
          messages={messages} 
          isProcessing={isProcessing}
          onSendTypicalQuestion={handleSendTypicalQuestion}
          onRetryMessage={handleRetryMessage}
          conversationId={conversationId}
          interactionsRating={interactionsRating}
        />
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onStopGeneration={handleStopGeneration}
          isProcessing={isProcessing} 
        />
      </div>
    </div>
  );
};

export default Conversation;
