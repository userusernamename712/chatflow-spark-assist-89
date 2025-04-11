
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, User, Terminal, Info, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        "message-bubble my-2 max-w-full px-3 py-2 font-sans text-sm",
        isUser 
          ? "message-bubble-user ml-auto mr-2 max-w-[85%] rounded-tr-none" 
          : isTool 
            ? "message-bubble-tool rounded-tl-none" 
            : "message-bubble-assistant rounded-tl-none"
      )}
    >
      <div className="flex items-start">
        {!isUser && (
          <div className={cn("mt-1 mr-2", 
            isTool ? "text-[var(--primary-color)]" : "text-[var(--primary-color-dark)]"
          )}>
            {isTool ? <Terminal size={14} /> : <MessageSquare size={14} />}
          </div>
        )}

        <div className="space-y-1 flex-1 overflow-x-auto">
          {isTool && toolName && (
            <div className="text-xs font-medium text-[var(--primary-color)] flex items-center bg-white py-1 px-2 rounded-full shadow-sm mb-2 inline-block">
              <Terminal size={10} className="mr-1" />
              <span>{toolName}</span>
              
              {toolResult !== undefined && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="ml-2 text-[var(--neutral-color-medium)] hover:text-[var(--neutral-color-dark)] transition-colors"
                        aria-label="View result details"
                      >
                        <Info size={12} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[300px] overflow-auto">
                      <div className="text-xs whitespace-pre-wrap">
                        {typeof toolResult === 'object' 
                          ? JSON.stringify(toolResult, null, 2) 
                          : String(toolResult)}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          
          {!isTool && (
            <div className={cn(isStreaming && "typing-indicator")}>
              {isStreaming ? (
                <span className="text-[var(--neutral-color-dark)]">{content}</span>
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
            <div className="text-sm text-[var(--neutral-color-medium)]">
              <span>{content || "Looking up information..."}</span>
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="mt-1 ml-2 text-[var(--primary-color)]">
            <User size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
