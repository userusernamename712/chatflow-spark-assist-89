
import { ApiResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL;

export interface UserEngagement {
  conversation_count: number;
  mean_user_messages: number;
}

export interface UserEngagementResponse {
  [email: string]: UserEngagement;
}

// List of all users that should appear in the Hall of Shame
const allUsers = [
  "adria@bookline.ai",
  "alex@bookline.ai",
  "almudena@bookline.ai",
  "antonio@bookline.ai",
  "ariadna.ros@bookline.ai",
  "bea@bookline.ai",
  "bernat@bookline.ai",
  "blanca@bookline.ai",
  "bruno@bookline.ai",
  "carlos@bookline.ai",
  "carlos.framis@bookline.ai",
  "carlos.sarrias@bookline.ai",
  "clara@bookline.ai",
  "clara.segura@bookline.ai",
  "dani@bookline.ai",
  "dani.romances@bookline.ai",
  "dani.milan@bookline.ai",
  "dani.toro@bookline.ai",
  "diana@bookline.ai",
  "ferran@bookline.ai",
  "florian@bookline.ai",
  "gabriela@bookline.ai",
  "gloria@bookline.ai",
  "gonzalo@bookline.ai",
  "ines@bookline.ai",
  "jaime@bookline.ai",
  "javi@bookline.ai",
  "javi.sanchez@bookline.ai",
  "joan@bookline.ai",
  "joan.sanz@bookline.ai",
  "joancami@bookline.ai",
  "jose@bookline.ai",
  "josemi@bookline.ai",
  "judit@bookline.ai",
  "laia@bookline.ai",
  "luis@bookline.ai",
  "lydia@bookline.ai",
  "marc.camps1@bookline.ai",
  "maria@bookline.ai",
  "mercedes@bookline.ai",
  "merce@bookline.ai",
  "meri@bookline.ai",
  "miguel@bookline.ai",
  "pablo.mayor@bookline.ai",
  "pablo@bookline.ai",
  "pablo.gil@bookline.ai",
  "paula@bookline.ai",
  "pedro@bookline.ai",
  "quique@bookline.ai",
  "sergi@bookline.ai",
  "tomas@bookline.ai",
  "victor@bookline.ai"
];

export const fetchUserEngagement = async (): Promise<UserEngagementResponse> => {
  try {
    const response = await fetch(`${API_URL}/conversations/count-by-user`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user engagement data: ${response.status}`);
    }
    
    const apiData = await response.json();
    
    // Create a complete list including all users (with zero values for missing users)
    const completeData: UserEngagementResponse = {};
    
    // Add all hardcoded users with zero values
    allUsers.forEach(email => {
      completeData[email] = {
        conversation_count: 0,
        mean_user_messages: 0
      };
    });
    
    // Override with actual data from API for users that have conversations
    Object.entries(apiData).forEach(([email, data]) => {
      if (email && typeof email === 'string') {
        completeData[email] = data as UserEngagement;
      }
    });
    
    return completeData;
  } catch (error) {
    console.error('Error fetching user engagement data:', error);
    throw error;
  }
};

// Helper function to extract user name from email
export const extractUserNameFromEmail = (email: string): string => {
  return email.split('@')[0];
};
