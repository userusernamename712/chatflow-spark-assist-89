
export interface ChatRequest {
  session_id: string | null;
  user: string | null;
  customer_id: string;
  prompt: string;
  timezone: string;
}

export interface ChatEvent {
  type: 'text' | 'tool_call' | 'error' | 'meta';
  message?: string;
  finished?: boolean;
  tool?: string;
  arguments?: Record<string, any>;
  result?: any;
  session_id?: string;
}

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'tool_call' | 'aborted';
  content: string;
  isStreaming?: boolean;
  tool?: string;
  arguments?: Record<string, any>;
  result?: any;
  toolCallId?: string;
  messageIndex?: number;
  originalPrompt?: string; // For aborted messages to allow retry
}
