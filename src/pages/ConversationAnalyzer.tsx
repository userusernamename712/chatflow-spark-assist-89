import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatContainer from '@/components/ChatContainer';
import { Loader2 } from 'lucide-react';
import { fetchConversation } from '@/services/conversationService';
import { Message } from '@/types/chat';
import { Conversation } from '@/types/conversation';
import { Button } from '@/components/ui/button';

const ConversationAnalyzer = () => {
  const { conversation_id } = useParams<{ conversation_id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [interactionsRating, setInteractionsRating] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!conversation_id) throw new Error("No conversation ID found");

        const conversation: Conversation = await fetchConversation(conversation_id);
        setCustomerId(conversation.customer_id);
        setInteractionsRating(conversation.interactions_rating || {});

        const mappedMessages: Message[] = [];

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
                  messageIndex: index,
                });
              });
            }
          } else if (m.role === 'tool' && m.content && m.tool_call_id) {
            const targetIndex = mappedMessages.findIndex(
              msg => msg.type === 'tool_call' && msg.toolCallId === m.tool_call_id
            );

            if (targetIndex !== -1) {
              let result;
              try {
                result = JSON.parse(m.content);
              } catch {
                result = m.content;
              }

              mappedMessages[targetIndex] = {
                ...mappedMessages[targetIndex],
                result,
              };
            }
          }
        });

        setMessages(mappedMessages);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversation_id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary-color)]" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-[#F9F8FF]">
        {customerId && (
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Customer ID:</span> {customerId}
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="border-[#E5DEFF] hover:bg-[#F1F0FB]"
          onClick={() => navigate('/')}
        >
          Go Back to Chat
        </Button>
      </div>

      <ChatContainer 
        messages={messages} 
        isProcessing={false} 
        interactionsRating={interactionsRating}
        conversationId={conversation_id}
      />
    </div>
  );
};

export default ConversationAnalyzer;
