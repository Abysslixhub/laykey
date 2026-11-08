import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Eye, 
  FileSearch, 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  Clock, 
  Layers,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

// Built-in presets for quick testing
const SAMPLE_PRESETS = [
  {
    name: 'Biểu đồ Kiến trúc',
    desc: 'Lưu đồ vi dịch vụ và CSDL',
    prompt: 'Phân tích cấu trúc hệ thống trong sơ đồ này: xác định các thành phần (Services, Database, Cache), luồng dữ liệu chính và đánh giá độ tin cậy.',
    // Base64 svg data url or sample
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" fill="%230b0f19"><rect width="600" height="350" fill="%230b0f19"/><rect x="40" y="130" width="110" height="70" rx="8" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><text x="95" y="170" fill="%23ffffff" font-family="sans-serif" font-size="14" text-anchor="middle">API Gateway</text><line x1="150" y1="165" x2="220" y2="165" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="4"/><rect x="220" y="80" width="130" height="60" rx="8" fill="%231e293b" stroke="%23818cf8" stroke-width="2"/><text x="285" y="115" fill="%23ffffff" font-family="sans-serif" font-size="13" text-anchor="middle">Auth Service</text><rect x="220" y="180" width="130" height="60" rx="8" fill="%231e293b" stroke="%23c084fc" stroke-width="2"/><text x="285" y="215" fill="%23ffffff" font-family="sans-serif" font-size="13" text-anchor="middle">Data Processor</text><ellipse cx="450" cy="110" rx="60" ry="30" fill="%231e293b" stroke="%2334d399" stroke-width="2"/><text x="450" y="115" fill="%23ffffff" font-family="sans-serif" font-size="13" text-anchor="middle">Redis Cache</text><ellipse cx="450" cy="210" rx="60" ry="35" fill="%231e293b" stroke="%23f43f5e" stroke-width="2"/><text x="450" y="215" fill="%23ffffff" font-family="sans-serif" font-size="13" text-anchor="middle">PostgreSQL DB</text></svg>',
  },
  {
    name: 'Giao diện Dashboard',
    desc: 'Bản thiết kế UI Analytics',
    prompt: 'Đánh giá giao diện người dùng này: cấu trúc layout, độ tương phản màu sắc, điểm nổi bật và đề xuất 3 giải pháp cải thiện UX.',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" fill="%230f172a"><rect width="600" height="350" fill="%230f172a"/><rect x="30" y="30" width="120" height="290" rx="8" fill="%231e293b"/><text x="90" y="65" fill="%2338bdf8" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle">Nexus Dashboard</text><rect x="170" y="30" width="120" height="80" rx="8" fill="%231e293b"/><text x="185" y="60" fill="%2394a3b8" font-family="sans-serif" font-size="11">Total Revenue</text><text x="185" y="90" fill="%2334d399" font-family="sans-serif" font-weight="bold" font-size="18">$84,320</text><rect x="310" y="30" width="120" height="80" rx="8" fill="%231e293b"/><text x="325" y="60" fill="%2394a3b8" font-family="sans-serif" font-size="11">Active Users</text><text x="325" y="90" fill="%2338bdf8" font-family="sans-serif" font-weight="bold" font-size="18">12,450</text><rect x="450" y="30" width="120" height="80" rx="8" fill="%231e293b"/><text x="465" y="60" fill="%2394a3b8" font-family="sans-serif" font-size="11">Conversion</text><text x="465" y="90" fill="%23f59e0b" font-family="sans-serif" font-weight="bold" font-size="18">4.82%</text><rect x="170" y="130" width="400" height="190" rx="8" fill="%231e293b"/><polyline points="200,280 260,220 320,240 380,180 440,210 500,160 540,170" fill="none" stroke="%2338bdf8" stroke-width="3"/></svg>',
  },
  {
    name: 'Hóa đơn / Bảng tính',
    desc: 'Trích xuất văn bản & số liệu',
    prompt: 'Thực hiện OCR trích xuất toàn bộ thông tin trong tài liệu này và cấu trúc lại dưới dạng bảng Markdown rõ ràng.',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" fill="%23ffffff"><rect width="600" height="350" fill="%23ffffff"/><text x="50" y="50" fill="%230f172a" font-family="sans-serif" font-weight="bold" font-size="18">HOÁ ĐƠN DỊCH VỤ ĐIỆN TOÁN CLOUD</text><text x="50" y="80" fill="%23475569" font-family="sans-serif" font-size="12">Số: INV-2026-8941 | Ngày: 08/11/2026</text><line x1="50" y1="100" x2="550" y2="100" stroke="%23cbd5e1" stroke-width="1"/><text x="50" y="130" fill="%230f172a" font-family="sans-serif" font-size="12">1. Gemini Flash API Enterprise (10M Tokens)</text><text x="480" y="130" fill="%230f172a" font-family="sans-serif" font-size="12">$35.00</text><text x="50" y="165" fill="%230f172a" font-family="sans-serif" font-size="12">2. Cloud SQL Developer Instance (1 Month)</text><text x="480" y="165" fill="%230f172a" font-family="sans-serif" font-size="12">$18.50</text><text x="50" y="200" fill="%230f172a" font-family="sans-serif" font-size="12">3. Storage &amp; Egress Bandwidth (250GB)</text><text x="480" y="200" fill="%230f172a" font-family="sans-serif" font-size="12">$12.00</text><line x1="50" y1="230" x2="550" y2="230" stroke="%23cbd5e1" stroke-width="1"/><text x="350" y="260" fill="%230f172a" font-family="sans-serif" font-weight="bold" font-size="14">Tổng cộng: $65.50</text></svg>',
  },
];

export const VisionView: React.FC = () => {
  const [imageBase64, setImageBase64] = useState<string>(SAMPLE_PRESETS[0].dataUrl);
  const [mimeType, setMimeType] = useState<string>('image/svg+xml');
  const [prompt, setPrompt] = useState<string>(SAMPLE_PRESETS[0].prompt);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh dung lượng dưới 20MB.');
      return;
    }

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setImageBase64(preset.dataUrl);
    setMimeType('image/svg+xml');
    setPrompt(preset.prompt);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      alert('Vui lòng chọn hoặc tải ảnh lên.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setDurationMs(null);

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageBase64,
          mimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi gọi API phân tích hình ảnh');
      }

      setResult(data.text);
      setDurationMs(data.durationMs);
    } catch (err: any) {
      setResult(`⚠️ Lỗi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            Thị Giác Máy Tính & Nhận Diện Đa Phương Thức (Gemini Multimodal)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Phân tích hình ảnh, OCR trích xuất chữ viết, phát hiện lỗi giao diện, và giải thích sơ đồ phức tạp.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Mẫu thử:</span>
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Image viewer & Prompt */}
        <div className="space-y-3 flex flex-col">
          {/* Image Preview Box */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                Hình ảnh đang chọn
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Tải ảnh lên từ máy</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="relative rounded-lg bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[340px] p-2">
              {imageBase64 ? (
                <img
                  src={imageBase64}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded"
                />
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-600" />
                  <span>Kéo thả hoặc tải ảnh lên để bắt đầu phân tích</span>
                </div>
              )}
            </div>
          </div>

          {/* Prompt input */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Yêu cầu phân tích hình ảnh (Prompt):
              </label>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Đọc toàn bộ văn bản trong ảnh, phân tích chi tiết bố cục, hoặc tìm các điểm bất thường..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />

            {/* Quick Prompt Ideas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Trích xuất văn bản (OCR)',
                'Phân tích kiến trúc & luồng',
                'Kiểm tra lỗi giao diện UI',
                'Chuyển dữ liệu sang bảng Markdown',
              ].map((tip, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(tip)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
                >
                  + {tip}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !imageBase64}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/15 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang phân tích hình ảnh qua Gemini Multimodal...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Bắt Đầu Phân Tích Hình Ảnh</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Analysis Result */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden min-h-[460px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span>Kết Quả Phân Tích & Bóc Tách Dữ Liệu</span>
              {durationMs && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono ml-2">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {durationMs}ms
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-[580px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-16">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-sm font-medium">Gemini 3.8 Flash đang xử lý đa phương thức...</p>
                <p className="text-xs text-slate-500">Trích xuất đặc trưng thị giác, nhận dạng mẫu và ngữ cảnh</p>
              </div>
            ) : result ? (
              <MarkdownRenderer content={result} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-20 text-center">
                <FileSearch className="w-10 h-10 text-slate-700" />
                <p className="text-sm">Chưa có kết quả phân tích</p>
                <p className="text-xs text-slate-600 max-w-sm">
                  Chọn một ảnh mẫu hoặc tải ảnh của bạn lên, sau đó nhấn "Bắt Đầu Phân Tích Hình Ảnh" để trải nghiệm năng lực thị giác máy tính của Gemini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
