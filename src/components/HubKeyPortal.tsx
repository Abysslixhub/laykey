import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  Clock, 
  ArrowRight, 
  Terminal, 
  Smartphone,
  ExternalLink,
  Flame,
  CheckCircle2,
  Gamepad2
} from 'lucide-react';
import { HubKeyRecord, KeyTier } from '../types';

interface HubKeyPortalProps {
  onKeyGenerated?: (key: HubKeyRecord) => void;
  onGoToTask: () => void;
  isTaskCompleted: boolean;
  onResetTask: () => void;
  unlockToken?: string | null;
}

export const HubKeyPortal: React.FC<HubKeyPortalProps> = ({
  onKeyGenerated,
  onGoToTask,
  isTaskCompleted,
  onResetTask,
  unlockToken,
}) => {
  const [tier, setTier] = useState<KeyTier>('free_24h');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [generatedKey, setGeneratedKey] = useState<HubKeyRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateKey = async () => {
    setIsLoading(true);
    setCountdown(3);

    // 3-second security ticket clearance
    let timer = 3;
    const interval = setInterval(async () => {
      timer -= 1;
      setCountdown(timer);
      if (timer <= 0) {
        clearInterval(interval);
        setCountdown(null);

        try {
          const res = await fetch('/api/key/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hubName: 'Abysslix Hub',
              prefix: 'ABYSS',
              hwid: 'ALL_EXECUTORS',
              tier,
              unlockToken: unlockToken || localStorage.getItem('abyss_unlock_token') || '',
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo key');

          setGeneratedKey(data.key);
          onKeyGenerated?.(data.key);
          setCopied(false);
        } catch (err: any) {
          alert(`Lỗi xác thực: ${err.message}`);
          onResetTask();
        } finally {
          setIsLoading(false);
        }
      }
    }, 700);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Hero Banner with Official Abysslix Hub Logo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-20 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Logo showcase */}
          <div className="relative flex-shrink-0 group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[2px] shadow-2xl shadow-cyan-500/30 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/assets/aistudio/unnamed_93150696.png"
                alt="Abysslix Hub Logo"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>CỔNG LẤY KEY CHÍNH THỨC • ABYSSLIX HUB</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Lấy Mã Key Kích Hoạt Abysslix Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mã Key được tạo tự động với tiền tố <code className="text-cyan-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/40">ABYSS-</code> và chuỗi ký tự ngẫu nhiên. Hỗ trợ trên mọi executor.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Hỗ trợ trên mọi executor
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Xác thực tức thì trong game
              </span>
              <span className="flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                Delta, Fluxus, Codex, Arceus X, Hydrogen
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Hub Options & Generated Key Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hub Options (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Cấu Hình Lấy Key Abysslix Hub</h3>
                <p className="text-xs text-slate-400">Tiền tố mặc định: <strong className="text-cyan-300 font-mono">ABYSS-</strong></p>
              </div>
            </div>
          </div>

          {/* Universal Executor Support Banner (Hỗ trợ trên mọi executor) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-xs sm:text-sm">Hỗ Trợ Trên Mọi Executor</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tương thích 100%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tương thích hoàn toàn trên tất cả các executor: Delta, Fluxus, Codex, Arceus X, Hydrogen, KRNL, Synapse... Sử dụng trực tiếp không yêu cầu khóa HWID.
              </p>
            </div>
          </div>

          {/* Tier / Duration */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Chọn thời hạn Key Abysslix Hub:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'free_24h' as KeyTier, label: 'Key 24 Giờ', desc: 'Miễn phí (Free)' },
                { id: 'free_48h' as KeyTier, label: 'Key 48 Giờ', desc: 'Dùng 2 ngày' },
                { id: 'lifetime_vip' as KeyTier, label: 'VIP Vĩnh Viễn', desc: 'Không cần get key' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    tier === t.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">{t.label}</div>
                  <div className="text-[10px] text-slate-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Key Format preview */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">Định dạng key sẽ tạo:</span>
            <span className="font-mono text-cyan-300 font-bold">ABYSS-XXXXX-XXXXX-XXXX</span>
          </div>

          {/* Mission Status Notice & Action Button */}
          {!isTaskCompleted ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-300">Yêu cầu hoàn thành nhiệm vụ (Checkpoint)</div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    Nhấn nút bên dưới để chuyển sang trang làm nhiệm vụ. Sau khi hoàn thành xong, hệ thống sẽ mở khóa cho bạn nhận key.
                  </p>
                </div>
              </div>

              <button
                onClick={onGoToTask}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer group"
              >
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>BƯỚC 1: LÀM NHIỆM VỤ ĐỂ MỞ KHÓA KEY</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-300">Nhiệm Vụ Đã Hoàn Thành Thành Công!</div>
                  <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                    Quyền nhận key đã được cấp. Hãy nhấn nút bên dưới để nhận mã key Abysslix Hub của bạn.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateKey}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Đang tạo key ngẫu nhiên ({countdown}s)...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 fill-current text-slate-950" />
                    <span>BƯỚC 2: NHẬN MÃ KEY ABYSSLIX HUB NGAY</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Key Result Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Abysslix Hub Của Bạn
              </span>
              {generatedKey ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Hoạt Động (Active)
                </span>
              ) : isTaskCompleted ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Sẵn sàng nhận
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Chưa mở khóa
                </span>
              )}
            </div>

            {generatedKey ? (
              <div className="mt-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Highlighted Key Output Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border-2 border-cyan-500/50 text-center space-y-2 shadow-2xl shadow-cyan-500/10">
                  <div className="flex items-center justify-center gap-2">
                    <img
                      src="/assets/aistudio/unnamed_93150696.png"
                      alt="Logo"
                      className="w-5 h-5 rounded object-cover"
                    />
                    <span className="text-[11px] font-bold text-slate-300">Abysslix Hub Official</span>
                  </div>

                  {/* ABYSSLIX HUB GENERATED KEY */}
                  <div className="font-mono text-xl sm:text-2xl font-black tracking-wider text-cyan-300 select-all py-1 break-all bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-inner">
                    {generatedKey.key}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Thời hạn: {generatedKey.tierName}</span>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(generatedKey.key)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">ĐÃ SAO CHÉP MÃ KEY!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>SAO CHÉP KEY NÀY</span>
                    </>
                  )}
                </button>

                {/* Instructions */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-slate-200 block">
                    Cách kích hoạt trong game Blox Fruits:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed font-sans">
                    <li>Quay trở lại game Roblox (Delta, Fluxus, Codex...).</li>
                    <li>Dán mã key <strong className="text-cyan-300 font-mono">{generatedKey.key}</strong> vào ô Enter Key.</li>
                    <li>Nhấn nút <strong className="text-slate-200">"CHECK KEY"</strong> để mở menu Abysslix Hub!</li>
                  </ol>
                </div>

                {/* Reset / Get Another Key */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={onResetTask}
                    className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium border border-slate-800 transition-colors"
                  >
                    Làm nhiệm vụ mới để lấy key khác
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-14 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center mb-1">
                  <img
                    src="/assets/aistudio/unnamed_93150696.png"
                    alt="Logo"
                    className="w-full h-full object-cover rounded-lg opacity-40"
                  />
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {isTaskCompleted ? 'Đã sẵn sàng tạo mã key!' : 'Chưa mở khóa mã key'}
                </p>
                <p className="text-[11px] text-slate-600 max-w-xs">
                  {isTaskCompleted
                    ? 'Nhấn nút "Bước 2: Nhận Mã Key Abysslix Hub Ngay" ở bên trái để nhận key.'
                    : 'Hãy hoàn thành nhiệm vụ ở Bước 1 để mở khóa mã key có tiền tố ABYSS-.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
