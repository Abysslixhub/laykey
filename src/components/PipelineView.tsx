import React, { useState } from 'react';
import { 
  GitMerge, 
  Play, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  ArrowDown, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { PipelineStep, PipelineResultStep } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

const PIPELINE_TEMPLATES: {
  name: string;
  desc: string;
  initialInput: string;
  steps: PipelineStep[];
}[] = [
  {
    name: 'Khởi nghiệp & Ra mắt Sản phẩm Công nghệ',
    desc: 'Quy trình 4 bước: Ý tưởng -> Thị trường -> Kiến trúc MVP -> Kế hoạch 90 ngày',
    initialInput: 'Ứng dụng nền tảng AI hỗ trợ các bác sĩ và phòng khám tư nhân tự động hóa việc tóm tắt hồ sơ bệnh án điện tử và lên lịch tái khám thông minh.',
    steps: [
      {
        id: 's1',
        title: 'Bước 1: Đánh giá Ý tưởng & USP Cốt lõi',
        description: 'Xác định tệp khách hàng mục tiêu, vấn đề nhức nhối (pain points) và lợi thế độc bản.',
        promptTemplate: `Dựa trên ý tưởng khởi nghiệp sau:
"{{input}}"

Hãy thực hiện phân tích chuyên sâu:
1. Tệp khách hàng mục tiêu lý tưởng (ICP)
2. Top 3 vấn đề nhức nhối nhất mà thị trường đang gặp phải
3. Đề xuất giá trị độc bản (USP - Unique Selling Proposition)
4. Đánh giá tính khả thi và rủi ro tiềm ẩn`,
      },
      {
        id: 's2',
        title: 'Bước 2: Phân tích Thị trường & Đối thủ',
        description: 'Nhận diện đối thủ trực tiếp, gián tiếp và chiến lược định vị.',
        promptTemplate: `Dựa trên phân tích ở bước trước:
"""
{{input}}
"""

Hãy tiến hành nghiên cứu thị trường:
1. Bản đồ định vị đối thủ cạnh tranh (trực tiếp và gián tiếp)
2. Chiến lược tạo rào cản phòng vệ (Moat/Barriers to entry)
3. Mô hình định giá đề xuất (Pricing model & ARR target)`,
      },
      {
        id: 's3',
        title: 'Bước 3: Thiết kế Kiến trúc Kỹ thuật & MVP Scope',
        description: 'Định hình stack công nghệ, mô hình AI phù hợp và phạm vi tính năng MVP.',
        promptTemplate: `Dựa trên bài toán kinh doanh đã xác lập:
"""
{{input}}
"""

Hãy thiết kế kiến trúc kỹ thuật cho sản phẩm MVP:
1. Tech Stack khuyến nghị (Frontend, Backend, Database, Cloud)
2. Ứng dụng mô hình AI (Gemini API, pipeline bảo mật HIPAA/dữ liệu y tế)
3. Danh sách tính năng cốt lõi bắt buộc cho phiên bản MVP v1.0 (loại bỏ tính năng thừa)`,
      },
      {
        id: 's4',
        title: 'Bước 4: Bản Kế hoạch Thực thi Toàn diện 90 Ngày',
        description: 'Lộ trình hành động chi tiết theo từng tuần và KPI đo lường.',
        promptTemplate: `Tổng hợp toàn bộ phân tích từ các bước trước:
"""
{{input}}
"""

Hãy soạn thảo bản Kế hoạch Hành động Thực thi 90 ngày (Action Plan) theo 3 giai đoạn:
- Tháng 1: Thẩm định & Xây dựng MVP
- Tháng 2: Thử nghiệm Pilot & Thu thập phản hồi thực tế
- Tháng 3: Ra mắt thương mại & Tăng trưởng khách hàng ban đầu
Kèm theo 5 chỉ số KPI then chốt cần theo dõi hàng tuần.`,
      },
    ],
  },
  {
    name: 'Kiểm toán Code & Kiến trúc Bảo mật',
    desc: 'Quy trình 3 bước: Quét lỗ hổng -> Tối ưu hiệu năng -> Đề xuất tái cấu trúc',
    initialInput: `// Đoạn mã API thanh toán cần audit:
app.post('/api/checkout', async (req, res) => {
  const { userId, cartItems, cardDetails } = req.body;
  const user = await db.query('SELECT * FROM users WHERE id = ' + userId);
  let total = 0;
  for (let item of cartItems) {
    total += item.price * item.quantity;
  }
  const charge = await paymentGateway.charge(cardDetails, total);
  await db.query('INSERT INTO orders (user_id, amount) VALUES (' + userId + ', ' + total + ')');
  res.json({ success: true, charge });
});`,
    steps: [
      {
        id: 'audit_s1',
        title: 'Bước 1: Quét Lỗ hổng Bảo mật & Gian lận',
        description: 'Phát hiện SQL Injection, rủi ro thẻ tín dụng, xác thực.',
        promptTemplate: `Phân tích toàn diện các lỗ hổng bảo mật nghiêm trọng trong đoạn mã sau:
"""
{{input}}
"""
Liệt kê chi tiết từng rủi ro (SQLi, PCI-DSS compliance, Validation, Race conditions) và hậu quả nếu bị khai thác.`,
      },
      {
        id: 'audit_s2',
        title: 'Bước 2: Phân tích Hiệu năng & Cơ chế Giao dịch',
        description: 'Đánh giá tính nhất quán (ACID), race condition và database bottleneck.',
        promptTemplate: `Dựa trên các rủi ro bảo mật vừa chỉ ra:
"""
{{input}}
"""
Hãy phân tích thêm khía cạnh:
1. Xử lý Transaction (ACID) khi cổng thanh toán trừ tiền nhưng DB lỗi lưu đơn hàng
2. Tình trạng Race condition khi người dùng click thanh toán 2 lần liên tiếp
3. Khả năng chịu tải đồng thời (Concurrency)`,
      },
      {
        id: 'audit_s3',
        title: 'Bước 3: Bản Mã Nguồn Chuẩn Hóa Hoàn Chỉnh',
        description: 'Viết lại toàn bộ code với kiến trúc an toàn tuyệt đối.',
        promptTemplate: `Tổng hợp các yêu cầu bảo mật và hiệu năng từ các bước trên:
"""
{{input}}
"""
Hãy cung cấp phiên bản mã nguồn TypeScript hoàn chỉnh, sử dụng Parameterized Query / ORM, Database Transaction an toàn, Idempotency key chống double charge, và cấu trúc xử lý lỗi bài bản.`,
      },
    ],
  },
];

export const PipelineView: React.FC = () => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [initialInput, setInitialInput] = useState(PIPELINE_TEMPLATES[0].initialInput);
  const [steps, setSteps] = useState<PipelineStep[]>(PIPELINE_TEMPLATES[0].steps);
  const [results, setResults] = useState<PipelineResultStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplateIndex(idx);
    setInitialInput(PIPELINE_TEMPLATES[idx].initialInput);
    setSteps(PIPELINE_TEMPLATES[idx].steps);
    setResults([]);
    setCurrentStepIndex(null);
  };

  const handleRunPipeline = async () => {
    if (!initialInput.trim()) {
      alert('Vui lòng nhập dữ liệu đầu vào ban đầu');
      return;
    }
    if (steps.length === 0) {
      alert('Cần có ít nhất 1 bước trong quy trình');
      return;
    }

    setIsRunning(true);
    setResults([]);
    setCurrentStepIndex(0);

    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps,
          initialInput,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi thực thi Pipeline');
      }

      setResults(data.steps);
      // Auto expand the last step
      if (data.steps && data.steps.length > 0) {
        setExpandedStepId(data.steps[data.steps.length - 1].id);
      }
    } catch (err: any) {
      alert(`Lỗi thực thi Pipeline: ${err.message}`);
    } finally {
      setIsRunning(false);
      setCurrentStepIndex(null);
    }
  };

  const copyFullReport = () => {
    if (results.length === 0) return;
    const text = results
      .map((r) => `## ${r.title} (Thời gian xử lý: ${r.durationMs}ms)\n\n${r.output}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 space-y-4">
      {/* Header Info & Templates */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              Chuỗi Quy Trình Tự Động Hóa (Multi-Step Agent Pipelines)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hệ thống tự động liên kết nhiều tác nhân AI thực thi tuần tự, kế thừa kết quả của bước trước để tạo nên giải pháp hoàn chỉnh.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {PIPELINE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTemplate(idx)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  selectedTemplateIndex === idx
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Input and Step Config (5 cols) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col">
          {/* Initial Input */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Đề bài / Dữ liệu kích hoạt đầu vào:</span>
              <span className="text-[10px] text-cyan-400 font-mono">Dữ liệu gốc</span>
            </label>
            <textarea
              value={initialInput}
              onChange={(e) => setInitialInput(e.target.value)}
              placeholder="Nhập ý tưởng hoặc dữ liệu đầu vào cho chuỗi quy trình..."
              rows={4}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
            />
          </div>

          {/* Steps Timeline Visualizer */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Các giai đoạn trong chuỗi ({steps.length} bước):
              </span>
            </div>

            <div className="space-y-2 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-800">
              {steps.map((step, idx) => {
                const isExecuting = isRunning && currentStepIndex === idx;
                const isFinished = results.some((r) => r.id === step.id);
                return (
                  <div
                    key={step.id}
                    className={`relative flex items-start gap-3 p-2.5 rounded-lg border transition-all pl-7 ${
                      isExecuting
                        ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                        : isFinished
                        ? 'bg-slate-950/60 border-emerald-500/30 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    {/* Status node */}
                    <div className="absolute left-1.5 top-3 flex items-center justify-center">
                      {isExecuting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 bg-slate-950 rounded-full" />
                      ) : isFinished ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 bg-slate-950 rounded-full" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600 bg-slate-950 rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                        <span>{step.title}</span>
                        {isExecuting && (
                          <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                            Đang chạy...
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Run Pipeline Button */}
          <button
            onClick={handleRunPipeline}
            disabled={isRunning || !initialInput.trim()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/15 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Quy trình AI đang thực thi tuần tự...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Kích Hoạt Chuỗi Tự Động Hóa Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Execution results & step outputs (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden min-h-[520px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span>Nhật Ký & Báo Cáo Quy Trình</span>
              {results.length > 0 && (
                <span className="text-[11px] text-emerald-400 font-mono ml-2">
                  ✓ Hoàn thành {results.length}/{steps.length} bước
                </span>
              )}
            </div>

            {results.length > 0 && (
              <button
                onClick={copyFullReport}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép báo cáo</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép toàn bộ</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-[640px] space-y-3">
            {isRunning && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-sm font-medium">Hệ thống AI đang thực thi chuỗi tác vụ...</p>
                <p className="text-xs text-slate-500">Gemini 3.8 Flash xử lý từng mắt xích thông tin</p>
              </div>
            ) : results.length > 0 ? (
              results.map((r, idx) => {
                const isExpanded = expandedStepId === r.id;
                return (
                  <div
                    key={r.id}
                    className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedStepId(isExpanded ? null : r.id)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-900/50 hover:bg-slate-900 text-left border-b border-slate-800/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {r.title}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono ml-2">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {r.durationMs}ms
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-slate-950/80">
                        <MarkdownRenderer content={r.output} />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-24 text-center">
                <GitMerge className="w-10 h-10 text-slate-700" />
                <p className="text-sm">Chưa có quy trình nào được kích hoạt</p>
                <p className="text-xs text-slate-600 max-w-sm">
                  Chọn một kịch bản quy trình bên trái và nhấn "Kích Hoạt Chuỗi Tự Động Hóa Pipeline" để khởi chạy toàn bộ các bước liên hoàn.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
