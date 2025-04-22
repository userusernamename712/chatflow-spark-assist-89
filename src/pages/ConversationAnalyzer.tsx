import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChatContainer from '@/components/ChatContainer';
import { Loader2 } from 'lucide-react';
import { fetchConversation } from '@/services/conversationService';
import { Message } from '@/types/chat';
import { Conversation } from '@/types/conversation';

const ConversationAnalyzer = () => {
  const { conversation_id } = useParams<{ conversation_id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
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

        const formattedMessages: Message[] = conversation.messages
          .filter(msg => msg.role !== 'system')
          .map((msg, index) => ({
            id: `${conversation.session_id}-${index}`,
            type: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }));

        setMessages(formattedMessages);
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
      {customerId && (
        <div className="p-4 bg-[#F9F8FF] text-sm text-gray-600 border-b">
          <span className="font-semibold">Customer ID:</span> {customerId}
        </div>
      )}
      <ChatContainer messages={messages} isProcessing={false} />
    </div>
  );
};

export default ConversationAnalyzer;
