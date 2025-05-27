
import { ChatRequest, ChatEvent } from '@/types/chat';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };

  // Get the auth token from local storage
  const token = localStorage.getItem('chatAuthToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const sendChatMessage = async (
  request: ChatRequest,
  onEvent: (event: ChatEvent) => void,
  onComplete: (sessionId?: string | null) => void,
  onError: (error: Error) => void,
  abortSignal?: AbortSignal
) => {
  try {
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let sessionIdFromResponse = null;

    const processStream = async () => {
      while (true) {
        // Check if the request was aborted
        if (abortSignal?.aborted) {
          reader.cancel();
          throw new Error('Request aborted');
        }

        const { done, value } = await reader.read();
        
        if (done) {
          if (buffer.trim()) {
            try {
              const event = JSON.parse(buffer.trim()) as ChatEvent;
              
              // Check if this event contains a session_id
              if (event.session_id && !sessionIdFromResponse) {
                sessionIdFromResponse = event.session_id;
              }
              
              // Mark this event as the final one
              const finalEvent = {
                ...event,
                finished: true
              };
              
              onEvent(finalEvent);
            } catch (e) {
              console.error('Error parsing final buffer:', e);
            }
          }
          
          // Complete the chat with the session ID obtained from the stream
          onComplete(sessionIdFromResponse);
          break;
        }

        // Append new data to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete JSON objects separated by newlines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last potentially incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const event = JSON.parse(line) as ChatEvent;
              
              // Check if this event contains a session_id
              if (event.session_id && !sessionIdFromResponse) {
                sessionIdFromResponse = event.session_id;
                event.session_id = sessionIdFromResponse;
              }
              
              onEvent(event);
            } catch (e) {
              console.error('Error parsing JSON:', e, line);
            }
          }
        }
      }
    };

    processStream().catch(onError);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was aborted');
      return;
    }
    onError(error instanceof Error ? error : new Error(String(error)));
  }
};
