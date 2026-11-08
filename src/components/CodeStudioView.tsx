import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Wrench, 
  FileCode, 
  CheckCircle2, 
  ArrowRightLeft, 
  Loader2, 
  Clock, 
  Copy, 
  Check
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

const CODE_TEMPLATES = [
  {
    name: 'JWT Auth Middleware',
    lang: 'typescript',
    code: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};`,
    req: 'Phân tích bảo mật, xử lý edge case token hết hạn và bổ sung rate limiter.',
  },
  {
    name: 'Async Retry with Exponential Backoff',
    lang: 'typescript',
    code: `async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn(\`Thất bại, thử lại sau \${delay}ms...\`);
    await new Promise(r => setTimeout(r, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
}`,
    req: 'Viết bộ Unit Tests hoàn chỉnh với Jest/Vitest bao gồm trường hợp thành công, fail 2 lần rồi pass, và fail toàn bộ.',
  },
  {
    name: 'Python QuickSort & Analytics',
    lang: 'python',
    code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
    req: 'Chuyển đổi sang TypeScript với Generic Type T[] và so sánh hiệu năng in-place partition.',
  },
];

export const CodeStudioView: React.FC = () => {
  const [action, setAction] = useState<'generate' | 'fix' | 'explain' | 'convert' | 'tests'>('generate');
  const [language, setLanguage] = useState('TypeScript');
  const [code, setCode] = useState('');
  const [requirements, setRequirements] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleApplyTemplate = (tmpl: typeof CODE_TEMPLATES[0]) => {
    setCode(tmpl.code);
    setLanguage(tmpl.lang);
    setRequirements(tmpl.req);
  };

  const handleExecute = async () => {
    if (action === 'generate' && !requirements.trim()) {
      alert('Vui lòng nhập mô tả yêu cầu tính năng cần tạo mã nguồn.');
      return;
    }
    if (action !== 'generate' && !code.trim()) {
      alert('Vui lòng dán đoạn mã nguồn cần xử lý.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setDurationMs(null);

    try {
      const response = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          language,
          code,
          requirements,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi gọi API');
      }

      setResult(data.text);
      setDurationMs(data.durationMs);
    } catch (err: any) {
      setResult(`⚠️ Lỗi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 space-y-4">
      {/* Action Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'generate', label: 'Sinh Mã Nguồn Mới', icon: FileCode },
            { id: 'fix', label: 'Sửa Lỗi & Tối Ưu', icon: Wrench },
            { id: 'explain', label: 'Giải Thích & Review', icon: Code2 },
            { id: 'convert', label: 'Chuyển Đổi Ngôn Ngữ', icon: ArrowRightLeft },
            { id: 'tests', label: 'Viết Unit Tests', icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = action === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAction(item.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Ngôn ngữ:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="TypeScript">TypeScript</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Go">Go (Golang)</option>
            <option value="Rust">Rust</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="SQL">SQL (PostgreSQL)</option>
            <option value="HTML/Tailwind">HTML / Tailwind</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Input and Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Code input & requirements */}
        <div className="space-y-3 flex flex-col">
          {/* Quick presets */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Code mẫu thử nghiệm:</span>
            <div className="flex gap-1.5">
              {CODE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Requirements description */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {action === 'generate'
                ? 'Yêu cầu tính năng & logic cần viết:'
                : action === 'convert'
                ? 'Ngôn ngữ mục tiêu hoặc tiêu chí chuyển đổi:'
                : 'Yêu cầu bổ sung (tùy chọn):'}
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder={
                action === 'generate'
                  ? 'Ví dụ: Viết một hàm debounce và throttle trong TypeScript hỗ trợ generic và cancel function...'
                  : 'Mô tả chi tiết mong muốn hoặc yêu cầu cụ thể...'
              }
              rows={2}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Code Editor Box */}
          <div className="flex-1 flex flex-col rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/60 border-b border-slate-800 text-xs">
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                Mã nguồn đầu vào ({language})
              </span>
              {code && (
                <button
                  onClick={() => setCode('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Xóa code
                </button>
              )}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Dán mã nguồn ${language} của bạn tại đây...`}
              rows={12}
              className="flex-1 w-full bg-slate-950 p-3.5 text-xs text-slate-200 font-mono focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Execute button */}
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/15 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang phân tích và xử lý mã nguồn...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Thực thi với Gemini 3.8 Flash</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Code result & Architectural notes */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden min-h-[480px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span>Kết quả phân tích & Mã nguồn</span>
              {durationMs && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono ml-2">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {durationMs}ms
                </span>
              )}
            </div>

            {result && (
              <button
                onClick={copyResult}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép kết quả</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-[600px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-16">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-sm font-medium">Hệ thống AI đang lập trình và sinh giải pháp...</p>
                <p className="text-xs text-slate-500">Mô hình: Gemini 3.8 Flash (Thinking Mode: High)</p>
              </div>
            ) : result ? (
              <MarkdownRenderer content={result} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-20 text-center">
                <Code2 className="w-10 h-10 text-slate-700" />
                <p className="text-sm">Chưa có kết quả thực thi</p>
                <p className="text-xs text-slate-600 max-w-sm">
                  Nhập mã nguồn hoặc yêu cầu bên trái, sau đó nhấn "Thực thi" để nhận phân tích, code chuẩn và tài liệu kỹ thuật.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
