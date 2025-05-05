
import { Conversation, ConversationRating, InteractionRating } from "@/types/conversation";

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

export const rateInteraction = async (
  conversationId: string,
  interactionRating: InteractionRating
): Promise<Conversation> => {
  try {
    // Step 1: Fetch the existing conversation
    const existingRes = await fetch(`${API_URL}/conversations/${conversationId}`);
    if (!existingRes.ok) {
      throw new Error(`Failed to fetch conversation: ${existingRes.status}`);
    }

    const existingConversation: Conversation = await existingRes.json();
    const existingRatings = existingConversation.interactions_rating || {};

    // Step 2: Merge the new rating into the existing object
    const updatedRatings = {
      ...existingRatings,
      [interactionRating.messageIndex]: interactionRating.rating,
    };

    const payload = {
      interactions_rating: updatedRatings,
    };

    console.log("Merged interaction rating payload:", payload);

    // Step 3: PATCH the updated interactions_rating back to the conversation
    const patchResponse = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!patchResponse.ok) {
      throw new Error(`Failed to rate interaction: ${patchResponse.status}`);
    }

    return await patchResponse.json();
  } catch (error) {
    console.error('Error rating interaction:', error);
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
