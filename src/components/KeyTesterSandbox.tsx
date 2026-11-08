import React, { useState } from 'react';
import { 
  Play, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Loader2, 
  Sliders, 
  Terminal, 
  ShieldCheck, 
  AlertTriangle
} from 'lucide-react';
import { ApiKeyRecord } from '../types';

interface KeyTesterSandboxProps {
  initialKey?: string;
}

export const KeyTesterSandbox: React.FC<KeyTesterSandboxProps> = ({ initialKey }) => {
  const [apiKey, setApiKey] = useState(initialKey || '');
  const [endpoint, setEndpoint] = useState<'verify' | 'chat' | 'generate'>('verify');
  const [chatMessage, setChatMessage] = useState('Hãy giới thiệu về bản thân bạn trong 2 câu ngắn gọn.');
  const [generatePrompt, setGeneratePrompt] = useState('Viết 3 tiêu chí quan trọng khi thiết kế ứng dụng di động.');
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);

  const handleRunTest = async () => {
    if (!apiKey.trim()) {
      alert('Vui lòng nhập khóa API cần kiểm tra');
      return;
    }

    setIsLoading(true);
    setResponseStatus(null);
    setLatencyMs(null);
    setResponseBody(null);
    setResponseHeaders({});

    const start = performance.now();
    try {
      let url = '/api/v1/verify';
      let method = 'GET';
      let body: any = undefined;

      if (endpoint === 'chat') {
        url = '/api/v1/chat';
        method = 'POST';
        body = JSON.stringify({
          messages: [{ role: 'user', content: chatMessage }],
          systemInstruction: 'Bạn là trợ lý AI thông minh trong ứng dụng.',
        });
      } else if (endpoint === 'generate') {
        url = '/api/v1/generate';
        method = 'POST';
        body = JSON.stringify({
          prompt: generatePrompt,
        });
      }

      const res = await fetch(url, {
        method,
        headers: {
          'x-api-key': apiKey.trim(),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body,
      });

      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setResponseStatus(res.status);

      // Collect headers
      const headersMap: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        if (key.startsWith('x-ratelimit') || key === 'content-type') {
          headersMap[key] = value;
        }
      });
      setResponseHeaders(headersMap);

      const data = await res.json();
      setResponseBody(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody({ error: err.message || 'Lỗi mạng khi gửi request' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-5">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          Trình Kiểm Tra API Key Trực Tiếp (Live Key Tester & Sandbox)
        </h2>
        <p className="text-xs text-slate-400">
          Mô phỏng chính xác cách ứng dụng của bạn gửi request và nhận phản hồi từ NexusAI API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Form: Request Builder (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">Cấu Hình Yêu Cầu (Request)</h3>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Khóa API cần kiểm tra:</span>
              <span className="text-[10px] text-cyan-400 font-mono">x-api-key header</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán key ví dụ: nx_live_a1b2c3..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Endpoint Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Endpoint muốn kiểm tra:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'verify', label: 'GET /verify', desc: 'Kiểm tra key & quota' },
                { id: 'chat', label: 'POST /chat', desc: 'Trò chuyện AI' },
                { id: 'generate', label: 'POST /generate', desc: 'Sinh văn bản' },
              ].map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setEndpoint(ep.id as any)}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    endpoint === ep.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-mono font-semibold text-[11px]">{ep.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{ep.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Payload Input */}
          {endpoint === 'chat' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Nội dung tin nhắn gửi tới AI (messages[0].content):
              </label>
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {endpoint === 'generate' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Câu lệnh prompt:
              </label>
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleRunTest}
            disabled={isLoading || !apiKey.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi HTTP Request...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Gửi Thử Nghiệm Ngay</span>
              </>
            )}
          </button>
        </div>

        {/* Right Viewer: Response Inspector (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Phản Hồi Từ Máy Chủ (Live HTTP Response)
            </span>

            {responseStatus && (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                    responseStatus === 200
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : responseStatus === 429
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {responseStatus === 200 ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>HTTP {responseStatus}</span>
                </span>

                {latencyMs !== null && (
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {latencyMs}ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Response Headers */}
          {Object.keys(responseHeaders).length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                Response Headers (RateLimit):
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                {Object.entries(responseHeaders).map(([k, v]) => (
                  <div key={k} className="p-1.5 rounded bg-slate-900/80">
                    <div className="text-slate-500 text-[9px] uppercase truncate">{k}</div>
                    <div className="text-cyan-300 font-semibold">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Body Viewer */}
          <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-3 overflow-y-auto max-h-[360px] font-mono text-xs">
            {isLoading ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-xs">Đang kiểm tra xác thực và kết nối...</span>
              </div>
            ) : responseBody ? (
              <pre className="text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-2 text-center">
                <Terminal className="w-8 h-8 text-slate-700" />
                <p className="text-xs">Chưa có dữ liệu phản hồi</p>
                <p className="text-[11px] text-slate-600 max-w-xs">
                  Nhập key vào khung bên trái và bấm "Gửi Thử Nghiệm Ngay" để kiểm tra tính hợp lệ và hạn mức.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
