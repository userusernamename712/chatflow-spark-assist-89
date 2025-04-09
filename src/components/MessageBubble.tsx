
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, Bot, Terminal, Code, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        "message-bubble my-2 max-w-[85%] rounded-lg p-4 shadow-sm",
        isUser 
          ? "ml-auto bg-primary text-primary-foreground" 
          : isTool 
            ? "mr-auto bg-secondary text-secondary-foreground tool-call border border-primary/30"
            : "mr-auto bg-card text-card-foreground border border-border"
      )}
    >
      <div className="flex items-start gap-2">
        {!isUser && (
          <div className={cn("mt-1 rounded-full p-1.5", 
            isTool ? "bg-primary/10" : "bg-primary/10"
          )}>
            {isTool ? <Terminal size={12} className="text-primary" /> : <Bot size={12} className="text-primary" />}
          </div>
        )}
        <div className="space-y-2 flex-1">
          {isTool && toolName && (
            <div className="text-xs font-medium text-primary/80 flex items-center">
              <Code size={10} className="mr-1" />
              <span>Function: {toolName}</span>
            </div>
          )}
          
          {!isTool && (
            <div className={cn(isStreaming && "typing-indicator")}>
              {isStreaming ? (
                <span>{content}</span>
              ) : (
                <ReactMarkdown 
                  className="markdown" 
                  remarkPlugins={[remarkGfm]}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>
          )}
          
          {isTool && (
            <div className="text-sm">
              {content}
            </div>
          )}
          
          {isTool && toolArgs && (
            <div className="mt-2 rounded bg-background/50 p-2 text-xs">
              <div className="font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                <span className="flex items-center">
                  <Terminal size={10} className="mr-1" />
                  Arguments
                </span>
                {toolResult !== undefined && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-primary/80 hover:text-primary transition-colors p-1 rounded-full hover:bg-background/50"
                  >
                    {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>
              <pre className="whitespace-pre-wrap break-all text-muted-foreground text-xs">
                {JSON.stringify(toolArgs, null, 2)}
              </pre>
            </div>
          )}
          
          {isTool && toolResult !== undefined && expanded && (
            <div className="mt-2 rounded bg-background/50 p-2 text-xs animate-fade-in">
              <div className="font-semibold text-muted-foreground mb-1 flex items-center">
                <Terminal size={10} className="mr-1" />
                Result
              </div>
              <pre className="whitespace-pre-wrap break-all text-muted-foreground text-xs">
                {typeof toolResult === 'object' 
                  ? JSON.stringify(toolResult, null, 2) 
                  : String(toolResult)}
              </pre>
            </div>
          )}
        </div>
        {isUser && (
          <div className="mt-1 rounded-full bg-primary-foreground/10 p-1.5">
            <MessageCircle size={12} className="text-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
