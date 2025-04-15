
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, User, Terminal, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MessageBubbleProps = {
  type: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
  toolResult?: any;
  isStreaming?: boolean;
};

// Custom renderer for LaTeX
const LatexRenderer = ({children}: {children: string}) => {
  // Check if content is a block math ($$...$$ format)
  if (children.startsWith('$$') && children.endsWith('$$')) {
    return <BlockMath math={children.slice(2, -2)} />;
  }
  
  // Check if content is inline math ($...$ format)
  if (children.startsWith('$') && children.endsWith('$')) {
    return <InlineMath math={children.slice(1, -1)} />;
  }
  
  return <>{children}</>;
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

  // Process content to handle LaTeX outside of markdown
  const processContent = (text: string) => {
    if (isStreaming) return text;
    
    // Split by potential LaTeX expressions
    const segments = text.split(/((?:\$\$[\s\S]*?\$\$)|(?:\$[^\$\n]+?\$))/g);
    
    if (segments.length === 1) {
      return null; // No LaTeX, will use normal markdown renderer
    }
    
    return segments.map((segment, index) => {
      if (segment.startsWith('$$') && segment.endsWith('$$')) {
        return <BlockMath key={index} math={segment.slice(2, -2)} />;
      } else if (segment.startsWith('$') && segment.endsWith('$')) {
        return <InlineMath key={index} math={segment.slice(1, -1)} />;
      } else if (segment) {
        return (
          <ReactMarkdown 
            key={index} 
            className="markdown inline" 
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                return inline ? 
                  <LatexRenderer>{String(children)}</LatexRenderer> : 
                  <code className={className} {...props}>{children}</code>;
              }
            }}
          >
            {segment}
          </ReactMarkdown>
        );
      } else {
        return null;
      }
    });
  };

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
          {isTool && toolName && toolResult && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs font-medium text-[var(--primary-color)] flex items-center bg-white py-1 px-2 rounded-full shadow-sm mb-2 inline-block tool-pill">
                    <Terminal size={10} className="mr-1" />
                    <span>{toolName}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="tool-tooltip">
                  <div className="text-xs font-medium border-b border-[var(--neutral-color-strokes)] pb-1 mb-2">Tool Result</div>
                  <pre className="whitespace-pre-wrap break-all text-xs overflow-x-auto max-h-[300px] overflow-y-auto">
                    {typeof toolResult === 'object' 
                      ? JSON.stringify(toolResult, null, 2) 
                      : String(toolResult)}
                  </pre>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!isTool && (
            <div className={cn(isStreaming && "typing-indicator")}>
              {isStreaming ? (
                <span className="text-[var(--neutral-color-dark)]">{content}</span>
              ) : (
                processContent(content) || (
                  <ReactMarkdown 
                    className="markdown" 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return inline ? 
                          <LatexRenderer>{String(children)}</LatexRenderer> : 
                          <code className={className} {...props}>{children}</code>;
                      }
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                )
              )}
            </div>
          )}
          
          {isTool && (
            <div className="text-sm text-[var(--neutral-color-medium)]">
              <span>Using tool to look up information...</span>
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
