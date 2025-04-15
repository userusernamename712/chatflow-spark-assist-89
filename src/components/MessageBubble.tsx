
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
  
  // Function to detect if string is a LaTeX block
  const isLaTeXBlock = (text: string) => {
    // Check for document class and typical LaTeX structure
    return (
      text.includes('\\documentclass') ||
      (text.includes('\\begin{document}') && text.includes('\\end{document}'))
    );
  };
  
  // Function to render content with proper handling of LaTeX and Markdown
  const renderContent = () => {
    if (isStreaming) return <span className="text-[var(--neutral-color-black)]">{content}</span>;
    
    // Check if the entire content is a LaTeX document
    if (isLaTeXBlock(content)) {
      return (
        <div className="latex-document bg-neutral-50 p-4 rounded-md font-mono text-sm overflow-auto">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      );
    }
    
    // Process markdown with LaTeX support
    // First, split by potential LaTeX delimiters
    const segments = content.split(/((?:\$\$[\s\S]*?\$\$)|(?:\$[^\$\n]+?\$))/g);
    
    return segments.map((segment, index) => {
      // Block math: $$...$$
      if (segment.startsWith('$$') && segment.endsWith('$$')) {
        try {
          return <BlockMath key={index} math={segment.slice(2, -2)} />;
        } catch (error) {
          console.error("LaTeX rendering error:", error);
          return <code key={index} className="text-red-500">{segment}</code>;
        }
      } 
      // Inline math: $...$
      else if (segment.startsWith('$') && segment.endsWith('$') && segment.length > 2) {
        try {
          return <InlineMath key={index} math={segment.slice(1, -1)} />;
        } catch (error) {
          console.error("LaTeX rendering error:", error);
          return <code key={index} className="text-red-500">{segment}</code>;
        }
      } 
      // Regular markdown
      else if (segment) {
        return (
          <ReactMarkdown 
            key={index} 
            className="markdown inline" 
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({node, inline, className, children, ...props}) => {
                if (inline) {
                  // Check if this is LaTeX inside inline code
                  const text = String(children);
                  if (text.startsWith('$') && text.endsWith('$')) {
                    try {
                      return <InlineMath math={text.slice(1, -1)} />;
                    } catch (error) {
                      return <code className={className} {...props}>{children}</code>;
                    }
                  }
                }
                return <code className={className} {...props}>{children}</code>;
              }
            }}
          >
            {segment}
          </ReactMarkdown>
        );
      }
      
      return null;
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
            <div className={cn(isStreaming && "typing-indicator", "text-[var(--neutral-color-black)]")}>
              {renderContent()}
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
