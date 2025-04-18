
import { ChatEvent } from './chat';

export interface Conversation {
  created_at: string;
  updated_at: string;
  messages: Array<{
    content: string;
    role: 'system' | 'user' | 'assistant';
  }>;
  customer_id: string;
  session_id: string;
  rating: number | null;
  feedback: string | null;
}

export interface ConversationRating {
  rating: number;
  feedback?: string;
}
