import { useAuth } from '@/contexts/AuthContext';

interface ChatHeaderProps {
  isHistoricalChat?: boolean;
}

const ChatHeader = ({ isHistoricalChat = false }: ChatHeaderProps) => {
  const { selectedCustomerId } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="relative h-10 w-10">
          <img 
            src="/lovable-uploads/550aab05-c6c5-4d4a-8ef2-665352be8d2e.png" 
            alt="bookline.AI Logo" 
            className="h-full w-full object-contain"
          />
        </div>
        <div className="ml-3">
          <h1 className="font-bold text-md text-[#1A1F2C] flex items-center gap-2">
            bookline.AI
            {selectedCustomerId && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 border border-purple-300">
                Customer: {selectedCustomerId}
              </span>
            )}
          </h1>
          <div className="flex items-center text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] animate-pulse mr-1.5"></span>
            <span className="text-[#8E9196]">
              {isHistoricalChat ? 'viewing chat history' : 'online'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
