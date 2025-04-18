
import { Conversation, ConversationRating } from "@/types/conversation";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchConversationHistory = async (customerId: string): Promise<Conversation[]> => {
  try {
    const response = await fetch(`${API_URL}/customers/${customerId}/conversations`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
};

export const fetchConversation = async (conversationId: string): Promise<Conversation> => {
  try {
    const response = await fetch(`${API_URL}/conversations/${conversationId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

export const updateConversation = async (
  conversationId: string, 
  rating: ConversationRating
): Promise<Conversation> => {
  try {
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rating),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
