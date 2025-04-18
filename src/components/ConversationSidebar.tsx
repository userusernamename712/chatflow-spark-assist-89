import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Star, StarIcon, StarOff, MessageCircle, Trash2, X, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Conversation, ConversationRating } from '@/types/conversation';
import { fetchConversationHistory, updateConversation, deleteConversation } from '@/services/conversationService';
import { toast } from '@/components/ui/use-toast';
import ProfileDialog from './ProfileDialog';
import { AVAILABLE_CUSTOMERS } from '@/types/auth';
import { fetchApiMetadata } from '@/services/apiService';

interface ConversationSidebarProps {
  customerId: string;
  sessionId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  onChangeCustomer?: (customerId: string) => void;
}

const ConversationSidebar = ({ 
  customerId, 
  sessionId,
  onSelectConversation,
  isMobile = false,
  onCloseMobile,
  onChangeCustomer
}: ConversationSidebarProps) => {
  const [feedbackDialog, setFeedbackDialog] = useState<{
    isOpen: boolean;
    conversationId: string | null;
    rating: number | null;
    feedback: string;
  }>({
    isOpen: false,
    conversationId: null,
    rating: null,
    feedback: '',
  });
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showApiDetails, setShowApiDetails] = useState<{
    type: 'tool' | 'resource' | 'template' | 'server';
    item: any;
  } | null>(null);

  const queryClient = useQueryClient();
  
  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ['conversations', customerId],
    queryFn: () => fetchConversationHistory(customerId),
    enabled: !!customerId,
    refetchInterval: 30000,
  });
  
  const { data: apiMetadata } = useQuery({
    queryKey: ['api-metadata'],
    queryFn: fetchApiMetadata
  });

  const filteredCustomers = AVAILABLE_CUSTOMERS.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: ConversationRating }) => 
      updateConversation(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', customerId] });
      toast({
        title: 'Feedback saved',
        description: 'Thank you for your feedback!',
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: 'Error saving feedback',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', customerId] });
      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been removed.',
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: 'Error deleting conversation',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  const handleOpenFeedbackDialog = (conversationId: string, currentRating: number | null) => {
    const conversation = conversations.find(c => c.session_id === conversationId);
    setFeedbackDialog({
      isOpen: true,
      conversationId,
      rating: currentRating || 0,
      feedback: conversation?.feedback || '',
    });
  };

  const handleSaveFeedback = () => {
    if (!feedbackDialog.conversationId || feedbackDialog.rating === null) return;
    
    updateMutation.mutate({
      id: feedbackDialog.conversationId,
      rating: {
        rating: feedbackDialog.rating,
        feedback: feedbackDialog.feedback || undefined,
      },
    });
    
    setFeedbackDialog({
      isOpen: false,
      conversationId: null,
      rating: null,
      feedback: '',
    });
  };

  const handleRateConversation = (conversationId: string, rating: number) => {
    updateMutation.mutate({
      id: conversationId,
      rating: { rating },
    });
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteMutation.mutate(conversationId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFirstUserMessage = (conversation: Conversation) => {
    const userMessage = conversation.messages.find(m => m.role === 'user');
    if (!userMessage) return 'New conversation';
    
    return userMessage.content.length > 30 
      ? `${userMessage.content.substring(0, 30)}...` 
      : userMessage.content;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="w-6 h-6 border-t-2 border-[#9b87f5] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading conversations: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <>
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-sm font-medium">Conversation History</h2>
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onCloseMobile}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <ScrollArea className="flex-1">
          {sortedConversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {sortedConversations.map((conversation) => (
                <Collapsible key={conversation.session_id} className="w-full">
                  <div 
                    className={`flex flex-col rounded-md border ${
                      sessionId === conversation.session_id 
                        ? 'bg-[#F1F0FB] border-[#9b87f5]' 
                        : 'bg-white border-[#E5DEFF] hover:bg-[#F9F8FF]'
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between p-2">
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => {
                          onSelectConversation(conversation);
                          if (isMobile && onCloseMobile) onCloseMobile();
                        }}
                      >
                        <div className="text-sm font-medium truncate">
                          {getFirstUserMessage(conversation)}
                        </div>
                        <div className="flex items-center text-xs text-[#8E9196]">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(conversation.updated_at)}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => handleDeleteConversation(conversation.session_id)}
                        >
                          <Trash2 className="h-4 w-4 text-[#8E9196]" />
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                          >
                            <Star className="h-4 w-4 text-[#8E9196]" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="p-2 pt-0 border-t border-[#E5DEFF]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-[#8E9196]">Rate this conversation:</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() => handleOpenFeedbackDialog(
                              conversation.session_id, 
                              conversation.rating
                            )}
                          >
                            Add feedback
                          </Button>
                        </div>
                        <div className="flex justify-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleRateConversation(conversation.session_id, rating)}
                              className="focus:outline-none"
                            >
                              {conversation.rating && rating <= conversation.rating ? (
                                <StarIcon className="h-5 w-5 text-yellow-400" />
                              ) : (
                                <StarOff className="h-5 w-5 text-gray-300" />
                              )}
                            </button>
                          ))}
                        </div>
                        {conversation.feedback && (
                          <div className="mt-2 text-xs p-2 bg-[#F9F8FF] rounded border border-[#E5DEFF]">
                            <div className="font-medium mb-1">Feedback:</div>
                            <div>{conversation.feedback}</div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsProfileOpen(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Profile & Settings
          </Button>
        </div>
      </div>

      <Dialog 
        open={feedbackDialog.isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setFeedbackDialog(prev => ({ ...prev, isOpen: false }));
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Conversation</DialogTitle>
            <DialogDescription>
              Please rate your experience and provide any feedback.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center space-x-2 py-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setFeedbackDialog(prev => ({ ...prev, rating }))}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                {feedbackDialog.rating && rating <= feedbackDialog.rating ? (
                  <StarIcon className="h-8 w-8 text-yellow-400" />
                ) : (
                  <StarOff className="h-8 w-8 text-gray-300" />
                )}
              </button>
            ))}
          </div>
          
          <Textarea
            placeholder="Add your feedback here (optional)"
            value={feedbackDialog.feedback}
            onChange={(e) => setFeedbackDialog(prev => ({ ...prev, feedback: e.target.value }))}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setFeedbackDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFeedback}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        customerId={customerId}
        onChangeCustomer={(id) => {
          onChangeCustomer?.(id);
          setIsProfileOpen(false);
        }}
      />
    </>
  );
};

export default ConversationSidebar;
