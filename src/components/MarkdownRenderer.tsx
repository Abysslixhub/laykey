import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copied, setCopied] = useState(false);

  // Configure marked for clean, safe html output
  const rawHtml = React.useMemo(() => {
    try {
      return marked.parse(content || '', {
        gfm: true,
        breaks: true,
      });
    } catch {
      return content;
    }
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
      <div
        className="ai-markdown text-slate-200 text-sm md:text-base leading-relaxed break-words"
        dangerouslySetInnerHTML={{ __html: rawHtml as string }}
      />
      <button
        onClick={handleCopy}
        title="Sao chép toàn bộ"
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded text-xs flex items-center gap-1 border border-slate-700"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Đã sao chép</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép</span>
          </>
        )}
      </button>
    </div>
  );
};
