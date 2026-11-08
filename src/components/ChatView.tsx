import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Download, 
  Settings2, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  BrainCircuit,
  Lightbulb,
  Zap
} from 'lucide-react';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

const PROMPT_SUGGESTIONS = [
  {
    title: 'Phân tích Công nghệ',
    text: 'Phân tích xu hướng phát triển của Trí tuệ nhân tạo và mô hình ngôn ngữ lớn (LLM) trong năm nay, các thách thức và ứng dụng thực tiễn.',
  },
  {
    title: 'Kiến trúc Hệ thống',
    text: 'So sánh chi tiết giữa kiến trúc Microservices và Monolithic: Khi nào nên bắt đầu với Monolith và lộ trình chuyển đổi tối ưu là gì?',
  },
  {
    title: 'Chiến lược Khởi nghiệp',
    text: 'Hãy xây dựng một kế hoạch ra mắt sản phẩm phần mềm SaaS trong 90 ngày với ngân sách hạn chế, tối ưu chuyển đổi khách hàng.',
  },
  {
    title: 'Tối ưu Hiệu năng',
    text: 'Các kỹ thuật tối ưu hóa Database SQL và Indexing nâng cao để xử lý hàng triệu bản ghi mỗi ngày mà không bị nghẽn cổ chai?',
  },
];

const SYSTEM_ROLES = [
  {
    id: 'general',
    name: 'Trợ lý Toàn năng',
    desc: 'Phản hồi chi tiết, súc tích và chính xác',
    instruction: 'Bạn là NexusAI, trợ lý trí tuệ nhân tạo cấp cao chạy trên nền tảng Gemini 3.8 Flash. Hãy giải đáp mọi câu hỏi với tư duy logic sắc bén, cấu trúc rõ ràng, chuyên sâu và thân thiện bằng tiếng Việt.',
  },
  {
    id: 'architect',
    name: 'Kiến trúc sư Phần mềm',
    desc: 'Tư vấn mã nguồn, thiết kế hệ thống chuẩn Clean Code',
    instruction: 'Bạn là Chuyên gia Kiến trúc Hệ thống & Kỹ sư Phần mềm cao cấp. Đưa ra giải pháp kỹ thuật, phân tích trade-off, cung cấp code minh họa rõ ràng, bảo mật và tuân thủ best practices.',
  },
  {
    id: 'strategist',
    name: 'Chuyên gia Chiến lược',
    desc: 'Phân tích thị trường, mô hình kinh doanh & tài chính',
    instruction: 'Bạn là Nhà tư vấn Chiến lược Doanh nghiệp và Khởi nghiệp công nghệ hàng đầu. Đưa ra các phân tích thị trường sắc bén, KPI đo lường, kế hoạch thực thi rõ ràng theo từng giai đoạn.',
  },
];

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `### Xin chào! Tôi là Hệ thống Trí tuệ Nhân tạo NexusAI 🚀

Tôi được vận hành trực tiếp bởi mô hình **Gemini 3.8 Flash** thế hệ mới với khả năng suy luận logic vượt trội, độ trễ cực thấp và xử lý đa nhiệm thông minh.

**Bạn có thể yêu cầu tôi:**
- 🧠 *Tư duy & Giải quyết vấn đề phức tạp:* Thiết kế giải pháp kỹ thuật, phân tích dữ liệu, chiến lược.
- 💻 *Hỗ trợ Lập trình & Viết code:* Cung cấp giải thuật, sửa lỗi, review cấu trúc mã nguồn.
- 📝 *Sáng tạo & Soạn thảo nội dung:* Tóm lược, dịch thuật, lập kế hoạch hành động.

*Hãy chọn một gợi ý bên dưới hoặc nhập câu hỏi bất kỳ để bắt đầu!*`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingLevel, setThinkingLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [selectedRole, setSelectedRole] = useState(SYSTEM_ROLES[0].id);
  const [customInstruction, setCustomInstruction] = useState(SYSTEM_ROLES[0].instruction);
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    const found = SYSTEM_ROLES.find((r) => r.id === roleId);
    if (found) {
      setCustomInstruction(found.instruction);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const botMessageId = Math.random().toString(36).substring(2, 9);
    const botPlaceholder: ChatMessage = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      thinkingLevel,
    };
    setMessages((prev) => [...prev, botPlaceholder]);

    try {
      // Build conversation history for API
      const conversationHistory = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          systemInstruction: customInstruction,
          thinkingLevel,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Lỗi kết nối từ máy chủ');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (!dataStr) continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  accumulatedText += parsed.chunk;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: accumulatedText }
                        : msg
                    )
                  );
                } else if (parsed.error) {
                  accumulatedText += `\n\n> ⚠️ *Lỗi:* ${parsed.error}`;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: accumulatedText }
                        : msg
                    )
                  );
                }
              } catch {
                // Ignore parse errors on split stream chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: `⚠️ **Không thể hoàn thành yêu cầu:** ${err.message || 'Lỗi mạng hoặc sự cố kết nối tới Gemini API.'}`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm mới toàn bộ cuộc trò chuyện?')) {
      setMessages([]);
    }
  };

  const exportChat = () => {
    const textContent = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'user' ? 'Người dùng' : 'NexusAI'}:\n${m.content}\n\n---`
      )
      .join('\n\n');

    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-ai-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto px-4 py-2">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          {/* Thinking Level Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
            <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Tư duy AI:</span>
            <button
              onClick={() => setThinkingLevel('LOW')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                thinkingLevel === 'LOW'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nhanh
            </button>
            <button
              onClick={() => setThinkingLevel('MEDIUM')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                thinkingLevel === 'MEDIUM'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cân bằng
            </button>
            <button
              onClick={() => setThinkingLevel('HIGH')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                thinkingLevel === 'HIGH'
                  ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sâu (Deep)
            </button>
          </div>

          {/* Settings / Prompt Instruction Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showSettings
                ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Cấu hình Vai trò & System Prompt</span>
          </button>
        </div>

        {/* Clear & Export buttons */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                onClick={exportChat}
                title="Tải về lịch sử trò chuyện (.md)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xuất</span>
              </button>
              <button
                onClick={clearChat}
                title="Xóa cuộc trò chuyện"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expandable Settings drawer */}
      {showSettings && (
        <div className="mb-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Chọn vai trò hoặc tùy chỉnh chỉ dẫn hệ thống (System Instruction):
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SYSTEM_ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role.id)}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  selectedRole === role.id
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200">{role.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{role.desc}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Chỉ dẫn chi tiết (System Instruction gửi tới API Gemini):
            </label>
            <textarea
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 font-mono"
            />
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-600/20 text-white mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                  <span className="font-semibold">{isUser ? 'Bạn' : 'NexusAI System'}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    {message.thinkingLevel && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {message.thinkingLevel}
                      </span>
                    )}
                    <span>{message.timestamp}</span>
                  </div>
                </div>

                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {message.content}
                  </p>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
              </div>

              {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs animate-pulse pl-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Mô hình Gemini 3.8 Flash đang suy luận và truyền dữ liệu thời gian thực...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      {messages.length <= 1 && (
        <div className="pt-3 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Gợi ý chủ đề kích hoạt hệ thống:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.text)}
                className="text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs transition-all group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between">
                  <span>{s.title}</span>
                  <Zap className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {s.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="pt-3">
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20 shadow-xl transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi hoặc yêu cầu cho AI (Nhấn Enter để gửi, Shift+Enter xuống dòng)..."
            rows={2}
            className="w-full bg-transparent p-3.5 pr-24 text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none"
          />

          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Gửi</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 px-1 font-mono">
          <span>Động cơ AI: Gemini 3.8 Flash • SSE Streaming Enabled</span>
          <span>Bảo mật API Server-side Proxy</span>
        </div>
      </div>
    </div>
  );
};
