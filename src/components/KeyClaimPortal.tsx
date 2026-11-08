import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  Zap, 
  Eye, 
  EyeOff, 
  Clock, 
  Sliders, 
  Layers,
  Code2
} from 'lucide-react';
import { ApiKeyRecord } from '../types';

interface KeyClaimPortalProps {
  onKeyCreated: (key: ApiKeyRecord) => void;
  onNavigateToIntegration: (keyString: string) => void;
}

export const KeyClaimPortal: React.FC<KeyClaimPortalProps> = ({
  onKeyCreated,
  onNavigateToIntegration,
}) => {
  const [appName, setAppName] = useState('');
  const [tier, setTier] = useState<'starter' | 'developer' | 'unlimited'>('starter');
  const [quota, setQuota] = useState<number>(100);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<ApiKeyRecord | null>(null);
  const [isKeyVisible, setIsKeyVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (presetName?: string, presetQuota?: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: presetName || appName.trim() || 'App Client Key',
          tier,
          quota: presetQuota || quota,
          expiresInDays,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi tạo key');
      }

      setGeneratedKey(data.key);
      onKeyCreated(data.key);
      setCopied(false);
    } catch (err: any) {
      alert(`Không thể sinh key: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEnvFile = () => {
    if (!generatedKey) return;
    const content = `# NexusAI API Credentials\nNEXUS_API_KEY="${generatedKey.key}"\nNEXUS_API_URL="${window.location.origin}"\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-40 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cổng Cấp Khóa API AI Trực Tiếp</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Tạo & Lấy API Key Ngẫu Nhiên Cho Ứng Dụng Của Bạn
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Nhận ngay khóa API bí mật bảo mật cao, kết nối trực tiếp với động cơ trí tuệ nhân tạo Gemini 3.8 Flash. Tích hợp chỉ trong 2 phút vào ứng dụng Di động (Flutter/React Native), Web, Backend hoặc Bot.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Chuẩn mã hóa 128-bit
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Phản hồi tức thì &lt; 300ms
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              Kiểm soát hạn mức & thời hạn
            </span>
          </div>
        </div>
      </div>

      {/* Main Claim / Creation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Key Generator Form (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Cấu Hình Khóa API Mới</h3>
                <p className="text-xs text-slate-400">Khóa ngẫu nhiên sẽ được sinh tự động</p>
              </div>
            </div>

            <button
              onClick={() => setIsAdvanced(!isAdvanced)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isAdvanced ? 'Thu gọn' : 'Tùy chỉnh nâng cao'}</span>
            </button>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Chọn nhanh mục đích sử dụng:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'App Mobile (Flutter/RN)', quota: 100, tier: 'starter' as const },
                { name: 'Dự án Backend / Web', quota: 500, tier: 'developer' as const },
                { name: 'Demo Test Nhanh', quota: 50, tier: 'starter' as const },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAppName(p.name);
                    setQuota(p.quota);
                    setTier(p.tier);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left text-xs transition-all group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{p.quota} requests</div>
                </button>
              ))}
            </div>
          </div>

          {/* Key Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Tên nhận diện cho Key / Ứng dụng:
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Ví dụ: App Chat Y Tế, Mobile Client v2, Telegram Bot..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-medium"
            />
          </div>

          {/* Tier & Quota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Gói định mức (Tier):
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="starter">Khởi tạo (Starter - 100 requests)</option>
                <option value="developer">Lập trình viên (Developer - 500 requests)</option>
                <option value="unlimited">Không giới hạn (Unlimited Quota)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Thời hạn hiệu lực:
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={7}>7 ngày (Thử nghiệm)</option>
                <option value={30}>30 ngày (Tiêu chuẩn 1 tháng)</option>
                <option value={90}>90 ngày (Quý)</option>
                <option value={365}>1 năm (365 ngày)</option>
                <option value={0}>Vĩnh viễn (Không hết hạn)</option>
              </select>
            </div>
          </div>

          {/* Advanced Quota Customization */}
          {isAdvanced && tier !== 'unlimited' && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 animate-in fade-in duration-150">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Số lượng lượt gọi cho phép:</span>
                <span className="font-mono font-bold text-cyan-300">{quota} requests</span>
              </div>
              <input
                type="range"
                min="20"
                max="2000"
                step="20"
                value={quota}
                onChange={(e) => setQuota(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Key className="w-4 h-4 fill-current" />
            <span>{isLoading ? 'Đang khởi tạo chuỗi khóa bí mật...' : 'Tạo Khóa API Ngẫu Nhiên Ngay'}</span>
          </button>
        </div>

        {/* Right: Generated Key Result Box (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Khóa API Của Bạn
              </span>
              {generatedKey && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Hoạt động
                </span>
              )}
            </div>

            {generatedKey ? (
              <div className="mt-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-200">{generatedKey.name}</span>
                    <button
                      onClick={() => setIsKeyVisible(!isKeyVisible)}
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {isKeyVisible ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ẩn</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Hiện</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="font-mono text-xs sm:text-sm text-cyan-300 break-all select-all bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    {isKeyVisible
                      ? generatedKey.key
                      : generatedKey.key.slice(0, 10) + '•'.repeat(24)}
                  </div>
                </div>

                {/* Key metadata chips */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Hạn mức (Quota)</div>
                    <div className="font-semibold font-mono text-slate-200 mt-0.5">
                      {generatedKey.totalQuota === -1
                        ? 'Vô hạn'
                        : `${generatedKey.totalQuota} lượt gọi`}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Hết hạn vào</div>
                    <div className="font-semibold font-mono text-slate-200 mt-0.5 line-clamp-1">
                      {generatedKey.expiresAt === 'never'
                        ? 'Vĩnh viễn'
                        : new Date(generatedKey.expiresAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => copyToClipboard(generatedKey.key)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Đã Sao Chép Khóa API!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao Chép Khóa Bí Mật</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadEnvFile}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về file cấu hình .env</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                <Key className="w-10 h-10 text-slate-700 stroke-[1.5]" />
                <p className="text-xs text-slate-400 font-medium">Chưa có khóa nào được tạo</p>
                <p className="text-[11px] text-slate-600 max-w-xs">
                  Điền tên nhận diện ứng dụng bên trái và nhấn nút "Tạo Khóa API Ngẫu Nhiên" để nhận khóa bí mật ngay.
                </p>
              </div>
            )}
          </div>

          {/* Quick next step link */}
          {generatedKey && (
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => onNavigateToIntegration(generatedKey.key)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-all group"
              >
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  Xem code tích hợp cho Flutter, JS, Python...
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
