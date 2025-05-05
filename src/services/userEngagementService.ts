
import { ApiResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL;

export interface UserEngagement {
  conversation_count: number;
  mean_user_messages: number;
}

export interface UserEngagementResponse {
  [email: string]: UserEngagement;
}

export const fetchUserEngagement = async (): Promise<UserEngagementResponse> => {
  try {
    const response = await fetch(`${API_URL}/conversations/count-by-user`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user engagement data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user engagement data:', error);
    throw error;
  }
};
