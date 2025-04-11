
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, User, Terminal, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
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
        "message-bubble my-2 max-w-full px-3 py-2 font-sans text-sm rounded-sm",
        isUser 
          ? "message-bubble-user ml-auto mr-2 max-w-[85%]" 
          : isTool 
            ? "message-bubble-tool" 
            : "message-bubble-assistant"
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
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 text-[var(--neutral-color-medium)] hover:text-[var(--neutral-color-dark)] transition-colors"
                  aria-label={expanded ? "Hide details" : "Show details"}
                >
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
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
              <span>Looking up information...</span>
            </div>
          )}
          
          {isTool && expanded && (
            <div className="mt-2 tool-result">
              <div className="font-medium text-[var(--neutral-color-medium)] mb-1 flex items-center">
                <Terminal size={10} className="mr-1" />
                Results
              </div>
              <pre className="whitespace-pre-wrap break-all text-[var(--primary-color)] text-xs overflow-x-auto">
                {typeof toolResult === 'object' 
                  ? JSON.stringify(toolResult, null, 2) 
                  : String(toolResult)}
              </pre>
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
