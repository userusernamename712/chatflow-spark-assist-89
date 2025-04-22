
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, LogOut, Star, StarOff, Plus, User, X, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Conversation, ConversationRating } from '@/types/conversation';
import { fetchConversationHistory, updateConversation, deleteConversation } from '@/services/conversationService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_CUSTOMERS } from '@/types/auth';
import ProfileDialog from './ProfileDialog';

interface ConversationSidebarProps {
  customerId: string;
  sessionId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  startNewChat?: () => void;
  onChangeCustomer?: (customerId: string) => void;
}

const ConversationSidebar = ({ 
  customerId, 
  sessionId,
  onSelectConversation,
  isMobile = false,
  onCloseMobile,
  startNewChat,
  onChangeCustomer
}: ConversationSidebarProps) => {
  const { user, logout, startNewSession } = useAuth();
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
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    conversationId: string | null;
  }>({
    isOpen: false,
    conversationId: null,
  });

  const queryClient = useQueryClient();
  
  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ['conversations', customerId],
    queryFn: () => fetchConversationHistory(customerId),
    enabled: !!customerId,
    // Removed refetchInterval to stop frequent fetching
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

  const handleOpenDeleteDialog = (conversationId: string) => {
    setDeleteConfirmDialog({
      isOpen: true,
      conversationId
    });
  };

  const handleDeleteConversation = () => {
    if (!deleteConfirmDialog.conversationId) return;
    
    deleteMutation.mutate(deleteConfirmDialog.conversationId);
    
    if (sessionId === deleteConfirmDialog.conversationId) {
      localStorage.removeItem('chatSessionId');
      window.location.reload();
    }
    
    setDeleteConfirmDialog({
      isOpen: false,
      conversationId: null
    });
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

  const handleStartNewConversation = () => {
    if (startNewChat) {
      startNewChat();
    } else {
      startNewSession(customerId);
      localStorage.removeItem('chatSessionId');
      window.location.reload();
    }
    
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = async () => {
    await logout();
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    if (onChangeCustomer) {
      onChangeCustomer(customerId);
      setSearchQuery('');
      
      // Show toast notification when customer is selected
      const selectedCustomer = AVAILABLE_CUSTOMERS.find(c => c.id === customerId);
      toast({
        title: "Customer Selected",
        description: `Switched to ${selectedCustomer?.name}`,
        className: "bg-[#F1F0FB] border-[#9b87f5]",
      });
    }
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="text-sm font-medium">Conversation History</h2>
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={onCloseMobile}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="p-3 border-b">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStartNewConversation}
          className="w-full mb-2 border-[#E5DEFF] hover:bg-[#F1F0FB]"
        >
          <Plus className="h-4 w-4 mr-1 text-[#9b87f5]" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {sortedConversations.map((conversation) => (
              <div 
                key={conversation.session_id}
                className={`flex flex-col rounded-md border ${
                  sessionId === conversation.session_id 
                    ? 'bg-[#F1F0FB] border-[#9b87f5]' 
                    : 'bg-white border-[#E5DEFF] hover:bg-[#F9F8FF]'
                } transition-colors`}
              >
                <div className="flex items-center justify-between p-2">
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <div className="text-sm font-medium truncate">
                      {getFirstUserMessage(conversation)}
                    </div>
                    <div className="flex items-center text-xs text-[#8E9196]">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(conversation.updated_at)}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4 text-[#8E9196]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenFeedbackDialog(
                        conversation.session_id,
                        conversation.rating
                      )}>
                        Add feedback
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenDeleteDialog(conversation.session_id)}>
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center mb-3 px-2 text-sm text-[#8E9196]">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 h-6 w-6 p-0" 
            onClick={() => setIsProfileOpen(true)}
          >
            <User className="h-3.5 w-3.5 text-[#8E9196]" />
          </Button>
          <span className="truncate">{user?.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full border-[#E5DEFF] hover:bg-[#F1F0FB] text-[#9b87f5] hover:text-[#7E69AB]"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
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
                  <Star className="h-8 w-8 text-yellow-400" />
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

      <Dialog
        open={deleteConfirmDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmDialog(prev => ({ ...prev, isOpen: false }));
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConversation}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        customerId={customerId}
        onChangeCustomer={handleCustomerSelect}
      />
    </div>
  );
};

export default ConversationSidebar;
