
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, Bot, Terminal } from 'lucide-react';

type MessageBubbleProps = {
  type: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
  toolResult?: any;
  isStreaming?: boolean;
};

const MessageBubble = ({
  type,
  content,
  toolName,
  toolArgs,
  toolResult,
  isStreaming = false
}: MessageBubbleProps) => {
  const isUser = type === 'user';
  const isTool = type === 'tool';

  return (
    <div
      className={cn(
        "message-bubble my-2 max-w-[85%] rounded-2xl p-4",
        isUser 
          ? "ml-auto bg-primary text-primary-foreground" 
          : isTool 
            ? "mr-auto bg-secondary text-secondary-foreground tool-call border border-primary/30"
            : "mr-auto bg-card text-card-foreground"
      )}
    >
      <div className="flex items-start gap-2">
        {!isUser && (
          <div className="mt-1 rounded-full bg-primary/10 p-1">
            {isTool ? <Terminal size={14} /> : <Bot size={14} />}
          </div>
        )}
        <div className="space-y-2">
          {isTool && toolName && (
            <div className="text-xs font-medium text-primary">
              Function call: {toolName}
            </div>
          )}
          
          <div className={cn("text-sm", isStreaming && !isTool && "typing-indicator")}>
            {content}
          </div>
          
          {isTool && toolArgs && (
            <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
              <div className="font-semibold text-muted-foreground mb-1">Arguments:</div>
              <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                {JSON.stringify(toolArgs, null, 2)}
              </pre>
            </div>
          )}
          
          {isTool && toolResult !== undefined && (
            <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
              <div className="font-semibold text-muted-foreground mb-1">Result:</div>
              <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                {typeof toolResult === 'object' 
                  ? JSON.stringify(toolResult, null, 2) 
                  : String(toolResult)}
              </pre>
            </div>
          )}
        </div>
        {isUser && (
          <div className="mt-1 rounded-full bg-primary/20 p-1">
            <MessageCircle size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
