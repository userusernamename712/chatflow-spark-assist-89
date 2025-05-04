import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Terminal, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
  
  // Function to format date if available
  const formatDateRange = () => {
    if (!toolResult) return null;
    
    let startDate = null;
    let endDate = null;
    
    if (typeof toolResult === 'object') {
      startDate = toolResult.start_date;
      endDate = toolResult.end_date;
    }
    
    if (!startDate || !endDate) return null;
    
    try {
      // Format dates in a user-friendly way
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      };
      
      return {
        startFormatted: formatDate(startDate),
        endFormatted: formatDate(endDate)
      };
    } catch (error) {
      console.error("Error formatting date range:", error);
      return null;
    }
  };
  
  // Function to render content with proper handling of Markdown
  const renderContent = () => {
    if (isStreaming) return <span className="text-[#333333]">{content}</span>;
    
    // Process content to ensure tables are properly formatted as HTML
    const processedContent = preprocessMarkdownContent(content);
    
    return (
      <div className="markdown-wrapper space-y-3">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => (
              <p className="mb-3" {...props} />
            ),
            h1: ({ node, ...props }) => (
              <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-lg font-semibold mt-3 mb-2" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-medium mt-2 mb-1" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside pl-5 mb-3" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-outside pl-5 mb-3" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-1" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="border-collapse w-full" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-gray-100" {...props} />
            ),
            tbody: ({ node, ...props }) => (
              <tbody className="divide-y divide-gray-200" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr className="even:bg-gray-50" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-200" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-3 py-2 border border-gray-200" {...props} />
            ),
            code: ({ className, children, ...props }) => (
              <code 
                className={cn("bg-gray-100 px-1 py-0.5 rounded text-sm", className)} 
                {...props}
              >
                {children}
              </code>
            ),
            pre: ({ children, ...props }) => (
              <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm my-3" {...props}>
                {children}
              </pre>
            ),
            a: ({ node, ...props }) => (
              <a 
                className="text-[#1EAEDB] hover:text-[#0FA0CE] underline" 
                target="_blank" 
                rel="noopener noreferrer" 
                {...props} 
              />
            )
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  // Helper function to preprocess content and convert markdown tables to HTML
  const preprocessMarkdownContent = (text: string): string => {
    if (!text) return '';
    
    // Convert plain URLs to markdown links if they're not already in markdown format
    const urlRegex = /(https?:\/\/[^\s]+)(?![^\(]*\))(?![^\[]*\])/g;
    text = text.replace(urlRegex, (url) => {
      return `[${url}](${url})`;
    });
    
    // Process tables if present
    if (!text.includes('|')) return text;
    
    const lines = text.split('\n');
    let inTable = false;
    let tableHTML = '';
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHTML = '<table>';
          
          if (i + 1 < lines.length && lines[i + 1].includes('|-')) {
            tableHTML += '<thead><tr>';
            const cells = line.split('|').filter(cell => cell !== '');
            cells.forEach(cell => {
              tableHTML += `<th>${cell.trim()}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';
            i++;
          } else {
            tableHTML += '<tbody><tr>';
            const cells = line.split('|').filter(cell => cell !== '');
            cells.forEach(cell => {
              tableHTML += `<td>${cell.trim()}</td>`;
            });
            tableHTML += '</tr>';
          }
        } else {
          tableHTML += '<tr>';
          const cells = line.split('|').filter(cell => cell !== '');
          cells.forEach(cell => {
            tableHTML += `<td>${cell.trim()}</td>`;
          });
          tableHTML += '</tr>';
        }
      } else if (inTable) {
        tableHTML += '</tbody></table>';
        processedLines.push(tableHTML);
        inTable = false;
        processedLines.push(line);
      } else {
        processedLines.push(line);
      }
    }
    
    if (inTable) {
      tableHTML += '</tbody></table>';
      processedLines.push(tableHTML);
    }
    
    return processedLines.join('\n');
  };

  const dateRange = formatDateRange();

  return (
    <div
      className={cn(
        "message-bubble my-2 px-3 py-2 font-sans text-sm rounded-lg",
        isUser 
          ? "message-bubble-user ml-auto mr-2 max-w-[85%] bg-blue-100 text-blue-900" 
          : isTool 
            ? "message-bubble-tool bg-gray-100 text-gray-800 max-w-[85%]" 
            : "message-bubble-assistant bg-white border border-gray-200 text-gray-900 max-w-[85%]"
      )}
    >
      <div className="flex items-start">
        {!isUser && (
          <div className={cn("mt-1 mr-2", 
            isTool ? "text-purple-600" : "text-blue-600"
          )}>
            {isTool ? <Terminal size={14} /> : <MessageSquare size={14} />}
          </div>
        )}

        <div className="space-y-1 flex-1 overflow-x-auto">
          {isTool && toolName && toolResult && (
            <div className="flex flex-col bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>

                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="ml-2 underline cursor-help text-blue-600 hover:opacity-90 transition text-xs font-normal"
                      >
                        View result
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-sm break-words text-left whitespace-pre-wrap text-[11px] font-mono"
                    >
                      {typeof toolResult === 'object'
                        ? JSON.stringify(toolResult, null, 2)
                        : String(toolResult)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {dateRange && (
                <div className="mt-1 text-xs text-gray-500 italic">
                  Data from: {dateRange.startFormatted} to {dateRange.endFormatted}
                </div>
              )}
            </div>
          )}

          {!isTool && (
            <div className={cn(isStreaming && "typing-indicator", "text-gray-900")}>
              {renderContent()}
            </div>
          )}
          
          {isTool && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>Using tool to look up information...</div>
              {dateRange ? (
                <div className="text-xs text-gray-700 font-medium">
                  Data range: <span className="bg-blue-50 px-1.5 py-0.5 rounded-md">{dateRange.startFormatted}</span> to <span className="bg-blue-50 px-1.5 py-0.5 rounded-md">{dateRange.endFormatted}</span>
                </div>
              ) : (
                <div className="text-xs text-gray-700">
                  Querying data for <strong>
                    {toolArgs?.bot_ids?.length
                      ? toolArgs.bot_ids.join(', ')
                      : 'all bots'}
                  </strong>.
                </div>
              )}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="mt-1 ml-2 text-blue-600">
            <User size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
