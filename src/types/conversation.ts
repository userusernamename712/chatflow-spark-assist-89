
import { ChatEvent } from './chat';

export interface ToolCall {
  type: string;
  index: number;
  id: string;
  function: {
    arguments: string;
    name: string;
  };
}

export interface Conversation {
  user: string;
  created_at: string;
  updated_at: string;
  messages: Array<{
    content: string | null;
    role: 'system' | 'user' | 'assistant' | 'tool';
    tool_calls?: ToolCall[];
    tool_call_id?: string;
  }>;
  customer_id: string;
  session_id: string;
  rating: number | null;
  interactions_rating: Record<string, number>;
  feedback: string | null;
}

export interface ConversationRating {
  rating: number;
  feedback?: string;
}

export interface InteractionRating {
  messageIndex: number;
  rating: number;
}
