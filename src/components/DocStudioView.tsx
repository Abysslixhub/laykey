import React, { useState } from 'react';
import { 
  FileText, 
  Languages, 
  Sparkles, 
  AlignLeft, 
  Sliders, 
  Loader2, 
  Clock, 
  Copy, 
  Check, 
  BookOpen
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

type DocMode = 'summarize' | 'translate' | 'rewrite' | 'generate';

const DOC_PRESETS = [
  {
    title: 'Biên bản cuộc họp dự án',
    mode: 'summarize' as DocMode,
    text: `Cuộc họp ngày 08/11/2026 về dự án NexusAI Cloud:
- Thành phần: Trưởng nhóm Tech, Product Manager, Lead Designer.
- Nội dung thảo luận:
  1. Đánh giá hiệu năng của API Gemini 3.8 Flash: Tốc độ phản hồi đạt trung bình dưới 400ms, độ chính xác cao.
  2. Vấn đề nghẽn cổ chai: Cần bổ sung cơ chế bộ đệm (cache) cho các truy vấn lặp lại và kiểm tra rate limits khi lượng truy cập tăng vọt.
  3. Kế hoạch tuần tới: Hoàn thiện giao diện Studio trước thứ Năm, tiến hành kiểm thử bảo mật API proxy và tích hợp giám sát lỗi trực tiếp.
  4. Phân công: An chịu trách nhiệm backend proxy, Bình hoàn thiện giao diện người dùng, Cường thực hiện test cases.`,
  },
  {
    title: 'Đoạn văn dịch thuật kỹ thuật',
    mode: 'translate' as DocMode,
    text: `Gemini 3.8 Flash introduces advanced native reasoning capabilities, real-time streaming tokens, and optimized multimodal comprehension. By offloading computational logic to dedicated server-side proxies, enterprises can maintain robust security perimeters while delivering sub-second response times to end-users across distributed edge networks.`,
  },
  {
    title: 'Email gửi đối tác',
    mode: 'rewrite' as DocMode,
    text: `Chào anh, bên em đã xem qua đề xuất hợp tác của bên anh rồi. Giá hơi cao một chút và thời gian giao hàng hơi chậm, bên anh có giảm giá thêm và làm nhanh hơn được không? Nếu được thì bên em ký hợp đồng luôn trong tuần này. Cảm ơn anh.`,
  },
];

export const DocStudioView: React.FC = () => {
  const [mode, setMode] = useState<DocMode>('summarize');
  const [inputText, setInputText] = useState(DOC_PRESETS[0].text);
  const [targetLang, setTargetLang] = useState('Tiếng Việt');
  const [targetTone, setTargetTone] = useState('Chuyên nghiệp, trang trọng và lịch thiệp');
  const [docType, setDocType] = useState('Email công việc chuyên nghiệp');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleApplyPreset = (preset: typeof DOC_PRESETS[0]) => {
    setMode(preset.mode);
    setInputText(preset.text);
    setResult(null);
  };

  const handleExecute = async () => {
    if (!inputText.trim()) {
      alert('Vui lòng nhập nội dung văn bản');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setDurationMs(null);

    let prompt = '';
    let systemInstruction = 'Bạn là Chuyên gia Soạn thảo & Ngôn ngữ học cao cấp của hệ thống NexusAI. Luôn cung cấp văn phong chuẩn mực, súc tích và có cấu trúc mạch lạc.';

    if (mode === 'summarize') {
      prompt = `Hãy tóm tắt văn bản sau đây một cách chuyên nghiệp:\n- Các luận điểm chính (Key Points)\n- Những phát hiện / kết luận quan trọng\n- Các đầu việc hành động cụ thể (Action Items) nếu có\n\nVăn bản đầu vào:\n"""\n${inputText}\n"""`;
    } else if (mode === 'translate') {
      prompt = `Hãy dịch chính xác, mượt mà và chuẩn ngữ cảnh văn bản sau sang ${targetLang}. Giữ nguyên thuật ngữ chuyên ngành chuẩn xác.\n\nVăn bản gốc:\n"""\n${inputText}\n"""`;
    } else if (mode === 'rewrite') {
      prompt = `Hãy viết lại văn bản sau theo phong cách: "${targetTone}". Nâng tầm ngôn từ, rõ ràng, giàu sức thuyết phục.\n\nVăn bản gốc:\n"""\n${inputText}\n"""`;
    } else if (mode === 'generate') {
      prompt = `Hãy soạn thảo một văn bản loại: "${docType}" dựa trên những thông tin, ghi chú hoặc ý tưởng sau:\n"""\n${inputText}\n"""`;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          thinkingLevel: 'MEDIUM',
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
      {/* Mode navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'summarize', label: 'Tóm Tắt & Hành Động', icon: AlignLeft },
            { id: 'translate', label: 'Dịch Thuật Chuyên Sâu', icon: Languages },
            { id: 'rewrite', label: 'Chuyển Đổi Văn Phong', icon: Sliders },
            { id: 'generate', label: 'Soạn Thảo Chuyên Nghiệp', icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id as DocMode)}
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

        {/* Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Ví dụ mẫu:</span>
          {DOC_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/30 transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Column */}
        <div className="space-y-3 flex flex-col">
          {/* Contextual Options Bar */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            {mode === 'translate' && (
              <div className="flex items-center gap-2 w-full">
                <Languages className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300 font-medium">Ngôn ngữ đích:</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 flex-1"
                >
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Tiếng Anh (English - US)">Tiếng Anh (US)</option>
                  <option value="Tiếng Nhật (日本語)">Tiếng Nhật</option>
                  <option value="Tiếng Hàn (한국어)">Tiếng Hàn</option>
                  <option value="Tiếng Trung (中文)">Tiếng Trung</option>
                  <option value="Tiếng Pháp (Français)">Tiếng Pháp</option>
                  <option value="Tiếng Đức (Deutsch)">Tiếng Đức</option>
                </select>
              </div>
            )}

            {mode === 'rewrite' && (
              <div className="flex items-center gap-2 w-full">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300 font-medium">Phong cách:</span>
                <select
                  value={targetTone}
                  onChange={(e) => setTargetTone(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 flex-1"
                >
                  <option value="Chuyên nghiệp, trang trọng và lịch thiệp">Chuyên nghiệp & Trang trọng</option>
                  <option value="Cuốn hút, kích thích chuyển đổi (Marketing Copy)">Marketing & Bán hàng</option>
                  <option value="Giản dị, dễ hiểu, tránh thuật ngữ phức tạp">Đơn giản & Dễ hiểu</option>
                  <option value="Học thuật, logic chặt chẽ, luận cứ vững chắc">Học thuật & Nghiên cứu</option>
                  <option value="Súc tích, gãy gọn, nhấn mạnh hành động">Súc tích & Trọng tâm</option>
                </select>
              </div>
            )}

            {mode === 'generate' && (
              <div className="flex items-center gap-2 w-full">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300 font-medium">Định dạng tài liệu:</span>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 flex-1"
                >
                  <option value="Email công việc chuyên nghiệp">Email công việc</option>
                  <option value="Báo cáo tóm tắt dự án & Tiến độ">Báo cáo dự án</option>
                  <option value="Tài liệu đề xuất giải pháp kỹ thuật (RFC)">Đề xuất kỹ thuật (RFC)</option>
                  <option value="Thông cáo báo chí (Press Release)">Thông cáo báo chí</option>
                  <option value="Kế hoạch tuần và chỉ số KPI">Kế hoạch công việc</option>
                </select>
              </div>
            )}

            {mode === 'summarize' && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Trích xuất luận điểm then chốt và các việc cần làm (Action Items).</span>
              </div>
            )}
          </div>

          {/* Textarea */}
          <div className="flex-1 flex flex-col rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/60 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Nội dung văn bản đầu vào:</span>
              <span className="font-mono text-[11px] text-slate-500">
                {wordCount} từ • {charCount} ký tự
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dán hoặc soạn thảo văn bản tại đây..."
              rows={12}
              className="flex-1 w-full bg-slate-950 p-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleExecute}
            disabled={isLoading || !inputText.trim()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/15 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang xử lý ngôn ngữ tự nhiên...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Thực Thi Xử Lý Văn Bản</span>
              </>
            )}
          </button>
        </div>

        {/* Output Column */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden min-h-[460px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span>Kết Quả Hoàn Chỉnh</span>
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
                    <span className="text-emerald-400">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-[580px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-16">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-sm font-medium">Hệ thống đang cấu trúc và tinh chỉnh văn bản...</p>
                <p className="text-xs text-slate-500">Mô hình: Gemini 3.8 Flash</p>
              </div>
            ) : result ? (
              <MarkdownRenderer content={result} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-20 text-center">
                <FileText className="w-10 h-10 text-slate-700" />
                <p className="text-sm">Chưa có kết quả</p>
                <p className="text-xs text-slate-600 max-w-sm">
                  Chọn chế độ xử lý bên trái và nhấn "Thực Thi Xử Lý Văn Bản" để tạo nội dung chất lượng cao.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
