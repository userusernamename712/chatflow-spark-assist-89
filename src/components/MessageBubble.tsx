
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
        "message-bubble my-2 max-w-full px-3 py-2 font-sans text-sm",
        isUser 
          ? "text-zinc-300 border-l-2 border-zinc-700 pl-3 pr-0" 
          : isTool 
            ? "bg-zinc-800/40 border-l-2 border-green-800/50 rounded-sm" 
            : "text-zinc-300"
      )}
    >
      <div className="flex items-start">
        {!isUser && (
          <div className={cn("mt-1 mr-2", 
            isTool ? "text-green-500" : "text-green-500"
          )}>
            {isTool ? <Terminal size={12} /> : <Bot size={12} />}
          </div>
        )}

        <div className="space-y-1 flex-1 overflow-x-auto">
          {isTool && toolName && (
            <div className="text-xs font-medium text-green-400/80 flex items-center">
              <Code size={10} className="mr-1" />
              <span>Using {toolName}</span>
              {toolResult !== undefined && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={expanded ? "Hide result" : "Show result"}
                >
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>
          )}
          
          {!isTool && (
            <div className={cn(isStreaming && "typing-indicator")}>
              {isStreaming ? (
                <span className="text-zinc-300">{content}</span>
              ) : (
                <ReactMarkdown 
                  className="markdown text-zinc-300" 
                  remarkPlugins={[remarkGfm]}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>
          )}
          
          {isTool && (
            <div className="text-sm text-zinc-400">
              {content}
            </div>
          )}
          
          {isTool && expanded && (
            <div className="mt-1 rounded bg-zinc-800/50 p-1.5 text-xs animate-fade-in">
              <div className="font-medium text-zinc-500 mb-1 flex items-center">
                <Terminal size={10} className="mr-1" />
                Results
              </div>
              <pre className="whitespace-pre-wrap break-all text-green-400/80 text-xs overflow-x-auto">
                {typeof toolResult === 'object' 
                  ? JSON.stringify(toolResult, null, 2) 
                  : String(toolResult)}
              </pre>
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="mt-1 ml-2 text-zinc-500">
            <MessageCircle size={12} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
