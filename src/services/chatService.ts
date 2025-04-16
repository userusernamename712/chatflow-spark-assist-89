
import { ChatRequest, ChatEvent } from '@/types/chat';

const API_URL = 'http://0.0.0.0:8080';

export const sendChatMessage = async (
  request: ChatRequest,
  onEvent: (event: ChatEvent) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) => {
  try {
    // Add user information to the request for tracking
    console.log('Sending chat request:', JSON.stringify(request));
    
    // Ensure request includes customer_id for identification
    if (!request.customer_id) {
      throw new Error('Customer ID is required');
    }
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(request),
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

    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          if (buffer.trim()) {
            try {
              const event = JSON.parse(buffer.trim()) as ChatEvent;
              onEvent(event);
            } catch (e) {
              console.error('Error parsing final buffer:', e);
            }
          }
          onComplete();
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
              // Log each received event with session and user info
              console.log('Received event:', JSON.stringify(event));
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
    onError(error instanceof Error ? error : new Error(String(error)));
  }
};
