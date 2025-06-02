
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import ConversationSidebar from './ConversationSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types/conversation';

interface AppSidebarProps {
  sessionId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  startNewChat: () => void;
  onChangeCustomer: (customerId: string) => void;
}

const AppSidebar = ({ 
  sessionId, 
  onSelectConversation, 
  startNewChat, 
  onChangeCustomer 
}: AppSidebarProps) => {
  const { selectedCustomerId } = useAuth();

  return (
    <Sidebar>
      <SidebarContent className="p-0">
        <ConversationSidebar
          customerId={selectedCustomerId}
          sessionId={sessionId}
          onSelectConversation={onSelectConversation}
          startNewChat={startNewChat}
          onChangeCustomer={onChangeCustomer}
          isCollapsed={false}
          isMobile={false}
        />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
