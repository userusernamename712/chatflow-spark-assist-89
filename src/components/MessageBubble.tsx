import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { MessageSquare, Terminal, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MessageRating from './MessageRating';

type MessageBubbleProps = {
  type: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
  toolResult?: any;
  isStreaming?: boolean;
  conversationId?: string;
  messageIndex?: number;
  interactionsRating?: Record<string, number>;
};

const MessageBubble = ({
  type,
  content,
  toolName,
  toolArgs,
  toolResult,
  isStreaming = false,
  conversationId,
  messageIndex,
  interactionsRating = {}
}: MessageBubbleProps) => {
  const isUser = type === 'user';
  const isTool = type === 'tool';
  const existingRating = messageIndex !== undefined
    ? interactionsRating[messageIndex.toString()]
    : undefined;

  if (!content && !isTool) return null;

  /** 
   * 1) convierte \[…\] → $$…$$ (display math)
   * 2) convierte \(...\) → $…$  (inline math)
   * 3) URLs sueltas → [url](url)
   * 4) Tablas Markdown → HTML
   */
  const preprocessMarkdownContent = (text: string): string => {
    if (!text) return '';
    // 1) \[…\] → $$…$$
    text = text.replace(
      /\\\[\s*([\s\S]*?)\s*\\\]/g,
      (_m, expr) => `\n\n$$${expr}$$\n\n`
    );
    // 2) \(...\) → $…$
    text = text.replace(
      /\\\(\s*([\s\S]*?)\s*\\\)/g,
      (_match, expr) => `\n\n$${expr}$\n\n`
    );
    // 3) URLs sueltas a enlaces
    const urlRegex = /(https?:\/\/[^\s]+)(?![^\(]*\))(?![^\[]*\])/g;
    text = text.replace(urlRegex, url => `[${url}](${url})`);
    // 4) tablas
    if (!text.includes('|')) return text;
    const lines = text.split('\n');
    let inTable = false, tableHTML = '';
    const processed: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHTML = '<table>';
          // si la siguiente línea es separador de cabecera
          if (i + 1 < lines.length && /\|[- ]+\|/.test(lines[i+1])) {
            tableHTML += '<thead><tr>';
            line.split('|').filter(Boolean).forEach(cell => {
              tableHTML += `<th>${cell.trim()}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';
            i++;
          } else {
            tableHTML += '<tbody><tr>';
            line.split('|').filter(Boolean).forEach(cell => {
              tableHTML += `<td>${cell.trim()}</td>`;
            });
            tableHTML += '</tr>';
          }
        } else {
          tableHTML += '<tr>';
          line.split('|').filter(Boolean).forEach(cell => {
            tableHTML += `<td>${cell.trim()}</td>`;
          });
          tableHTML += '</tr>';
        }
      } else if (inTable) {
        tableHTML += '</tbody></table>';
        processed.push(tableHTML);
        inTable = false;
        processed.push(line);
      } else {
        processed.push(line);
      }
    }
    if (inTable) {
      tableHTML += '</tbody></table>';
      processed.push(tableHTML);
    }
    return processed.join('\n');
  };

  const renderContent = () => {
    if (isStreaming) {
      return <span className="text-[#333333]">{content}</span>;
    }
    const md = preprocessMarkdownContent(content);
    return (
      <div className="markdown-wrapper space-y-3">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            p: ({ node, ...props }) => <p className="mb-3" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-3 mb-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-base font-medium mt-2 mb-1" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3" {...props} />,
            ol: ({ node, ...props }) =>
              <ol className="list-decimal list-inside pl-4 mb-3" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="border-collapse w-full" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
            tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200" {...props} />,
            tr: ({ node, ...props }) => <tr className="even:bg-gray-50" {...props} />,
            th: ({ node, ...props }) => <th className="px-3 py-2 text-left font-medium border border-gray-200" {...props} />,
            td: ({ node, ...props }) => <td className="px-3 py-2 border border-gray-200" {...props} />,
            code: ({ className, children, ...props }) => (
              <code className={cn("bg-gray-100 px-1 py-0.5 rounded text-sm", className)} {...props}>
                {children}
              </code>
            ),
            pre: ({ children, ...props }) => (
              <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm my-3" {...props}>
                {children}
              </pre>
            ),
            a: ({ node, ...props }) => (
              <a className="text-[#1EAEDB] hover:text-[#0FA0CE] underline" target="_blank" rel="noopener noreferrer" {...props} />
            ),
          }}
        >
          {md}
        </ReactMarkdown>
      </div>
    );
  };

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
          <div className={cn("mt-1 mr-2", isTool ? "text-purple-600" : "text-blue-600")}>
            {isTool ? <Terminal size={14} /> : <MessageSquare size={14} />}
          </div>
        )}
        <div className="space-y-1 flex-1 overflow-x-auto">
          {isTool && toolName && toolResult && (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 shadow-sm">
              <span className="font-medium text-gray-900">
                {toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-2 underline cursor-help text-blue-600 hover:opacity-90 transition text-xs font-normal">
                      View result
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm break-words text-left whitespace-pre-wrap text-[11px] font-mono">
                    {typeof toolResult === 'object'
                      ? JSON.stringify(toolResult, null, 2)
                      : String(toolResult)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {!isTool && content && (
            <div className={cn(isStreaming && "typing-indicator", "text-gray-900")}>
              {renderContent()}
            </div>
          )}
          {isTool && (() => {
            let parsed: any = {};
            try { parsed = typeof toolResult === 'string' ? JSON.parse(toolResult) : toolResult || {}; }
            catch {}
            const hasDateRange = parsed.start_date && parsed.end_date;
            const hasBotIds = Array.isArray(toolArgs?.bot_ids) && toolArgs.bot_ids.length > 0;
            const hasVenueIds = Array.isArray(toolArgs?.venue_ids) && toolArgs.venue_ids.length > 0;
            return (
              <div className="text-sm text-gray-600 space-y-2">
                <div className="font-medium text-gray-800 flex items-center gap-2">
                  <Terminal size={14} className="text-purple-600" />
                  Tool execution summary
                </div>
                {hasDateRange && (
                  <div className="flex items-center flex-wrap gap-2 text-xs text-gray-700">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full border border-gray-300">
                      ⏱ From: <strong>{new Date(parsed.start_date).toLocaleString()}</strong>
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full border border-gray-300">
                      ⏱ To: <strong>{new Date(parsed.end_date).toLocaleString()}</strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-700">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200 text-xs">
                    🤖 For bots: <strong>{hasBotIds ? toolArgs.bot_ids.join(', ') : 'all bots'}</strong>
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200 text-xs">
                    📍 For venues: <strong>{hasVenueIds ? toolArgs.venue_ids.join(', ') : 'all venues'}</strong>
                  </span>
                </div>
              </div>
            );
          })()}
          {!isUser && !isTool && !isStreaming && conversationId && messageIndex !== undefined && content.trim() !== '' && (
            <div className="flex justify-end pt-2">
              <MessageRating
                conversationId={conversationId}
                messageIndex={messageIndex}
                existingRating={existingRating}
              />
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
