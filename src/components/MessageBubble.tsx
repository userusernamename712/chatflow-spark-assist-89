
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, Bot, Terminal, Code, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      className={cn(
        "message-bubble my-2 max-w-[85%] rounded-2xl p-4 shadow-lg",
        isUser 
          ? "ml-auto bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" 
          : isTool 
            ? "mr-auto bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground tool-call border border-primary/30"
            : "mr-auto bg-gradient-to-br from-card to-card/90 text-card-foreground"
      )}
    >
      <div className="flex items-start gap-2">
        {!isUser && (
          <div className={cn("mt-1 rounded-full p-1.5", 
            isTool ? "bg-primary/20" : "bg-primary/10"
          )}>
            {isTool ? <Terminal size={14} className="text-primary" /> : <Bot size={14} className="text-primary" />}
          </div>
        )}
        <div className="space-y-2 flex-1">
          {isTool && toolName && (
            <div className="text-xs font-medium text-primary flex items-center">
              <Code size={12} className="mr-1" />
              <span>Function: {toolName}</span>
            </div>
          )}
          
          <div className={cn("text-sm", isStreaming && !isTool && "typing-indicator")}>
            {content}
          </div>
          
          {isTool && toolArgs && (
            <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
              <div className="font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                <span className="flex items-center">
                  <Terminal size={12} className="mr-1" />
                  Arguments
                </span>
                {toolResult !== undefined && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-primary/80 hover:text-primary transition-colors p-1 rounded-full hover:bg-primary/10"
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
              <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                {JSON.stringify(toolArgs, null, 2)}
              </pre>
            </div>
          )}
          
          {isTool && toolResult !== undefined && expanded && (
            <div className="mt-2 rounded bg-muted/50 p-2 text-xs animate-fade-in">
              <div className="font-semibold text-muted-foreground mb-1 flex items-center">
                <Terminal size={12} className="mr-1" />
                Result
              </div>
              <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                {typeof toolResult === 'object' 
                  ? JSON.stringify(toolResult, null, 2) 
                  : String(toolResult)}
              </pre>
            </div>
          )}
        </div>
        {isUser && (
          <div className="mt-1 rounded-full bg-primary/20 p-1.5">
            <MessageCircle size={14} className="text-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
