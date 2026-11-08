import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Link2,
  Settings,
  AlertCircle,
  HelpCircle,
  Lock,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';

interface PresetItem {
  id: string;
  name: string;
  defaultUrl: string;
  tip: string;
}

interface CheckpointConfig {
  service: string;
  serviceName: string;
  taskUrl: string;
  minDurationSeconds: number;
  requireHumanCheck: boolean;
  antiBypassEnabled: boolean;
  notes?: string;
}

interface CheckpointTaskViewProps {
  onCompleteTask: (unlockToken: string) => void;
  onBackToHome: () => void;
  initialTaskUrl?: string;
}

export const CheckpointTaskView: React.FC<CheckpointTaskViewProps> = ({
  onCompleteTask,
  onBackToHome,
}) => {
  // Session & Anti-Bypass State
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<{ id: string; question: string } | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState<string>('');
  const [minSeconds, setMinSeconds] = useState<number>(10);
  const [countdown, setCountdown] = useState<number>(10);
  const [hasClickedLink, setHasClickedLink] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Shortlink & Config State
  const [config, setConfig] = useState<CheckpointConfig>({
    service: 'linkvertise',
    serviceName: 'Linkvertise',
    taskUrl: 'https://linkvertise.com',
    minDurationSeconds: 10,
    requireHumanCheck: true,
    antiBypassEnabled: true,
  });
  const [presets, setPresets] = useState<PresetItem[]>([]);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [configSaved, setConfigSaved] = useState<boolean>(false);

  // Config Form State
  const [editService, setEditService] = useState<string>('linkvertise');
  const [editUrl, setEditUrl] = useState<string>('');
  const [editSeconds, setEditSeconds] = useState<number>(10);
  const [editAntiBypass, setEditAntiBypass] = useState<boolean>(true);
  const [editHumanCheck, setEditHumanCheck] = useState<boolean>(true);

  // Load config from server
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/checkpoint/config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setPresets(data.presets || []);
        setEditService(data.config.service || 'linkvertise');
        setEditUrl(data.config.taskUrl || '');
        setEditSeconds(data.config.minDurationSeconds || 10);
        setEditAntiBypass(data.config.antiBypassEnabled !== false);
        setEditHumanCheck(data.config.requireHumanCheck !== false);
      }
    } catch (err) {
      console.error('Không thể tải cấu hình:', err);
    }
  };

  // Start new anti-bypass session
  const startSession = async () => {
    setVerifyError(null);
    setHasClickedLink(false);
    setIsReady(false);
    setChallengeAnswer('');

    try {
      const res = await fetch('/api/checkpoint/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setTicketId(data.ticketId);
        setMinSeconds(data.minDurationSeconds || 10);
        setCountdown(data.minDurationSeconds || 10);
        setChallenge(data.challenge || null);
      }
    } catch (err) {
      console.error('Lỗi khởi tạo session:', err);
    }
  };

  useEffect(() => {
    loadConfig();
    startSession();
  }, []);

  // Timer countdown after clicking the task link
  useEffect(() => {
    let timer: any;
    if (hasClickedLink && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsReady(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasClickedLink, countdown]);

  const handleOpenTask = () => {
    setHasClickedLink(true);
    setVerifyError(null);
    const targetUrl = config.taskUrl || 'https://google.com';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVerify = async () => {
    if (!ticketId) return;

    if (challenge && !challengeAnswer.trim()) {
      setVerifyError('Vui lòng nhập kết quả xác minh bảo mật trước khi tiếp tục.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await fetch('/api/checkpoint/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          challengeAnswer: challengeAnswer.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setVerifyError(data.error || 'Xác minh thất bại. Phát hiện gian lận hoặc thao tác quá nhanh!');
        setIsReady(false);
        return;
      }

      // Valid session! Pass cryptographic single-use unlockToken
      onCompleteTask(data.unlockToken);
    } catch (err: any) {
      setVerifyError('Lỗi kết nối khi xác thực. Vui lòng thử lại!');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/checkpoint/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: editService,
          taskUrl: editUrl.trim(),
          minDurationSeconds: editSeconds,
          requireHumanCheck: editHumanCheck,
          antiBypassEnabled: editAntiBypass,
        }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2500);
        setShowConfig(false);
        // Refresh session with new duration
        startSession();
      }
    } catch (err) {
      alert('Không thể lưu cấu hình lên máy chủ.');
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setEditService(presetId);
    const p = presets.find((x) => x.id === presetId);
    if (p && !editUrl) {
      setEditUrl(p.defaultUrl);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Settings trigger */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay Lại Trang Chủ</span>
        </button>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-all shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cài Đặt Link Kiếm Tiền & Chống Bypass</span>
        </button>
      </div>

      {/* Admin / Owner Shortlink & Anti-Bypass Config Modal Panel */}
      {showConfig && (
        <form onSubmit={handleSaveConfig} className="p-5 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 space-y-4 shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold text-white">
                Cấu Hình Link Rút Gọn Kiếm Tiền & Anti-Bypass
              </span>
            </div>
            {configSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu thành công!
              </span>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Chọn Mạng Lưới Rút Gọn (Click để chọn nhanh):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold ${
                    editService === p.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-normal truncate">{p.tip}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Shortlink URL input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Đường link rút gọn kiếm tiền của bạn:</span>
              <span className="text-[10px] text-cyan-400">Tự động lưu vĩnh viễn trên server</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="VD: https://linkvertise.com/12345/abyss-key hoặc https://traffic1s.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Khi người dùng bấm "LÀM NHIỆM VỤ", họ sẽ được mở link này để vượt quảng cáo.
            </p>
          </div>

          {/* Anti-Bypass Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            {/* Min Duration */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Thời gian chờ tối thiểu:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="3"
                  max="120"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-slate-400">giây</span>
              </div>
            </div>

            {/* Anti-Bypass toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={editAntiBypass}
                onChange={(e) => setEditAntiBypass(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-950 border-slate-800"
              />
              <span className="text-xs text-slate-200 font-semibold">Chống tool bypass (F12/Curl)</span>
            </label>

            {/* Human check toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={editHumanCheck}
                onChange={(e) => setEditHumanCheck(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-950 border-slate-800"
              />
              <span className="text-xs text-slate-200 font-semibold">Câu hỏi chống Bot tự động</span>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Lưu Cấu Hình Mới
            </button>
          </div>
        </form>
      )}

      {/* Main Checkpoint Mission Box */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header with Logo */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/25 shrink-0">
            <img
              src="/assets/aistudio/unnamed_93150696.png"
              alt="Abysslix Hub Logo"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Flame className="w-3 h-3 text-cyan-400" />
                <span>CHECKPOINT XÁC MINH • ABYSSLIX HUB</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <DollarSign className="w-3 h-3 text-purple-400" />
                <span>Đối tác: {config.serviceName || 'Rút Gọn Link'}</span>
              </span>
              {config.antiBypassEnabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Anti-Bypass v2.4</span>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Nhiệm Vụ Mở Khóa Key Abysslix Hub
            </h2>
            <p className="text-xs text-slate-400">
              Vượt qua link tài trợ bên dưới để máy chủ cấp mã token mở khóa key duy nhất.
            </p>
          </div>
        </div>

        {/* Error Alert (if user tries to bypass) */}
        {verifyError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-in shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-rose-200">Cảnh Báo Gian Lận / Bypass</div>
              <p className="text-[11px] text-rose-300/90 leading-relaxed">{verifyError}</p>
              <button
                type="button"
                onClick={startSession}
                className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[10px] font-bold transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Bắt đầu lại nhiệm vụ
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Tiến trình xác thực:</span>
            <span className={isReady ? 'text-emerald-400 font-mono' : 'text-cyan-400 font-mono'}>
              {isReady 
                ? '100% Hoàn Thành' 
                : hasClickedLink 
                ? `${Math.round(((minSeconds - countdown) / minSeconds) * 100)}% (${minSeconds - countdown}/${minSeconds}s)` 
                : '0% Chưa Bắt Đầu'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-500 ${
                isReady 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400' 
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: isReady ? '100%' : hasClickedLink ? `${((minSeconds - countdown) / minSeconds) * 100}%` : '5%' }}
            ></div>
          </div>
        </div>

        {/* Step-by-Step Task Instructions */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            hasClickedLink 
              ? 'bg-slate-950/40 border-emerald-500/30' 
              : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center font-mono ${
                    hasClickedLink ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    1
                  </span>
                  <span className="font-bold text-slate-200 text-xs sm:text-sm">
                    Mở Link Nhiệm Vụ ({config.serviceName || 'Nhà Tài Trợ'})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                  Nhấn nút bên dưới để mở liên kết rút gọn. Xem và thực hiện theo hướng dẫn trên trang rút gọn trong ít nhất {minSeconds} giây.
                </p>
              </div>

              {hasClickedLink && (
                <span className="shrink-0 flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã mở liên kết
                </span>
              )}
            </div>

            <div className="mt-3 pl-7">
              <button
                onClick={handleOpenTask}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{hasClickedLink ? 'MỞ LẠI LINK NHIỆM VỤ' : 'BẮT ĐẦU LÀM NHIỆM VỤ (MỞ LINK)'}</span>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isReady 
              ? 'bg-slate-950/40 border-emerald-500/30' 
              : hasClickedLink 
              ? 'bg-slate-950/80 border-cyan-500/30' 
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center font-mono ${
                    isReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    2
                  </span>
                  <span className="font-bold text-slate-200 text-xs sm:text-sm">
                    Thời Gian Xác Minh Máy Chủ ({countdown > 0 ? `${countdown}s` : 'Hoàn tất'})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                  Máy chủ tự động ghi nhận thời gian thực tế để chống công cụ bypass gian lận.
                </p>
              </div>

              {isReady ? (
                <span className="shrink-0 flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đạt yêu cầu
                </span>
              ) : hasClickedLink ? (
                <span className="shrink-0 flex items-center gap-1 text-[11px] text-cyan-300 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> {countdown}s
                </span>
              ) : null}
            </div>
          </div>

          {/* Step 3: Anti-bot lightweight challenge if enabled */}
          {config.requireHumanCheck && challenge && isReady && (
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{challenge.question}</span>
              </div>
              <input
                type="text"
                value={challengeAnswer}
                onChange={(e) => setChallengeAnswer(e.target.value)}
                placeholder="Nhập kết quả số vào đây..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {/* Completion Confirmation Button */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          {isReady ? (
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer animate-pulse disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>ĐANG XÁC MINH VỚI MÁY CHỦ ANTI-BYPASS...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>XÁC NHẬN HOÀN THÀNH & QUAY VỀ LẤY KEY NGAY</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2 text-center">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {hasClickedLink 
                  ? `Vui lòng đợi ${countdown}s để máy chủ ghi nhận thời gian làm nhiệm vụ...` 
                  : 'Vui lòng nhấn vào nút "BẮT ĐẦU LÀM NHIỆM VỤ" ở Bước 1 để tiếp tục.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
