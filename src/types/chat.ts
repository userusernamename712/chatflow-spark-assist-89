
export type Message = {
  id: string;
  type: 'user' | 'assistant' | 'tool_call' | 'error';
  content: string;
  tool?: string;
  arguments?: Record<string, any>;
  result?: any;
  isStreaming?: boolean;
};

export type ChatEvent = {
  session_id: string;
  type: string;
  message?: string;
  tool?: string;
  arguments?: Record<string, any>;
  result?: any;
  finished: boolean;
};

export type ChatRequest = {
  session_id: string | null;
  customer_id: string;
  prompt: string;
};
