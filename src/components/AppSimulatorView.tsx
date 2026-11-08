import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Key, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Laptop, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  Check, 
  Loader2, 
  AlertTriangle,
  Lock,
  Unlock,
  Zap,
  Layers,
  Crown
} from 'lucide-react';

interface AppSimulatorViewProps {
  initialKey?: string;
}

export const AppSimulatorView: React.FC<AppSimulatorViewProps> = ({ initialKey }) => {
  const [licenseKey, setLicenseKey] = useState(initialKey || '');
  const [selectedDevice, setSelectedDevice] = useState<'phone_a' | 'phone_b' | 'pc_c'>('phone_a');
  const [isActivating, setIsActivating] = useState(false);
  const [activationResult, setActivationResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulated devices
  const devices = {
    phone_a: {
      name: 'iPhone 15 Pro (Thiết bị chính)',
      id: 'ios_hwid_98a7bc12',
      icon: Smartphone,
    },
    phone_b: {
      name: 'Samsung Galaxy S24 (Máy thứ hai)',
      id: 'android_hwid_55f2de34',
      icon: Smartphone,
    },
    pc_c: {
      name: 'Máy tính Windows (Máy thứ ba)',
      id: 'win_hwid_8812fa90',
      icon: Laptop,
    },
  };

  useEffect(() => {
    if (initialKey) {
      setLicenseKey(initialKey);
    }
  }, [initialKey]);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      alert('Vui lòng nhập mã key kích hoạt');
      return;
    }

    setIsActivating(true);
    setErrorMessage(null);

    const dev = devices[selectedDevice];

    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          deviceId: dev.id,
          deviceName: dev.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Kích hoạt thất bại');
        setActivationResult(null);
      } else {
        setActivationResult(data);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(`Lỗi mạng: ${err.message}`);
    } finally {
      setIsActivating(false);
    }
  };

  const handleVerifyCheck = async () => {
    const dev = devices[selectedDevice];
    try {
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          deviceId: dev.id,
        }),
      });
      const data = await res.json();
      alert(`Trạng thái xác thực từ App: ${data.valid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'} - Còn ${data.daysRemaining} ngày.`);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleResetSimulator = () => {
    setActivationResult(null);
    setErrorMessage(null);
  };

  const currentDev = devices[selectedDevice];

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          Trình Giả Lập Màn Hình Kích Hoạt Ứng Dụng (In-App Activation Simulator)
        </h2>
        <p className="text-xs text-slate-400">
          Mô phỏng trải nghiệm thực tế khi người dùng mở ứng dụng di động hoặc phần mềm của bạn và nhập mã key để mở khóa tính năng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Device & Test Controls (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              Thiết Lập Môi Trường Giả Lập
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn máy ảo để kiểm thử tính năng khóa theo thiết bị (HWID)
            </p>
          </div>

          {/* Device Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Chọn thiết bị mô phỏng mở app:
            </label>
            <div className="space-y-1.5">
              {Object.entries(devices).map(([key, d]) => {
                const isSelected = selectedDevice === key;
                const Icon = d.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedDevice(key as any);
                      setActivationResult(null);
                      setErrorMessage(null);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-slate-200">{d.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">HWID: {d.id}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Hint */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Mẹo kiểm thử giới hạn máy (Max Devices):
            </span>
            <p className="text-[11px] leading-relaxed">
              Hãy kích hoạt key trên <strong>iPhone 15 Pro</strong>, sau đó chuyển sang chọn <strong>Samsung S24</strong> và <strong>Máy tính Windows</strong> để xem hệ thống xử lý khi số máy vượt quá giới hạn gói!
            </p>
          </div>
        </div>

        {/* Right: Realistic Phone Mockup (7 cols) */}
        <div className="lg:col-span-7 flex justify-center">
          {/* Smartphone Shell Mockup */}
          <div className="w-full max-w-sm rounded-[36px] bg-slate-900 border-[6px] border-slate-800 shadow-2xl p-4 flex flex-col relative overflow-hidden min-h-[580px]">
            {/* Phone Speaker & Notch */}
            <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800/80 mr-2"></div>
              <div className="w-10 h-1.5 bg-slate-800/80 rounded-full"></div>
            </div>

            {/* In-App Screen Content */}
            <div className="flex-1 flex flex-col justify-between rounded-2xl bg-slate-950 p-4 border border-slate-800/60 text-slate-100">
              {/* App Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-cyan-500/20">
                    APP
                  </div>
                  <div>
                    <div className="text-xs font-bold">Ứng Dụng Của Bạn</div>
                    <div className="text-[9px] text-slate-500 font-mono">{currentDev.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {activationResult ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Unlock className="w-2.5 h-2.5" /> VIP
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Khóa
                    </span>
                  )}
                </div>
              </div>

              {/* Body Screen */}
              <div className="py-4 flex-1 flex flex-col justify-center">
                {activationResult ? (
                  /* UNLOCKED STATE */
                  <div className="space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1">
                        <Crown className="w-4 h-4 text-amber-400 fill-current" />
                        Đã Kích Hoạt Bản Quyền!
                      </h4>
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                        {activationResult.planName}
                      </p>
                    </div>

                    {/* Unlocked Features List */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mở khóa toàn bộ chức năng Pro</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Không chứa quảng cáo làm phiền</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Còn lại: <strong className="text-cyan-300">{activationResult.daysRemaining} ngày</strong> sử dụng</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={handleVerifyCheck}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Mô phỏng mở app lần sau (Verify)
                      </button>

                      <button
                        onClick={handleResetSimulator}
                        className="w-full py-1.5 text-slate-500 hover:text-slate-300 text-[11px] transition-colors"
                      >
                        Thử nhập key khác
                      </button>
                    </div>
                  </div>
                ) : (
                  /* LOCKED STATE: KEY INPUT */
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-2">
                        <Key className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">Kích Hoạt Ứng Dụng</h4>
                      <p className="text-[11px] text-slate-400">
                        Vui lòng nhập mã key bạn đã lấy trên website để mở khóa sử dụng.
                      </p>
                    </div>

                    {/* Input Field */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-slate-400 font-medium">
                        Mã bản quyền (License Key):
                      </label>
                      <input
                        type="text"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        placeholder="VD: VIP-8F92-K4M9-2026"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-cyan-300 font-mono uppercase text-center font-bold tracking-wider focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Error Box if any */}
                    {errorMessage && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-2 animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Activate Button */}
                    <button
                      onClick={handleActivate}
                      disabled={isActivating || !licenseKey.trim()}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isActivating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang kiểm tra bản quyền...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Kích Hoạt Ngay</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Phone Bar */}
              <div className="pt-2 text-center text-[10px] text-slate-600 font-mono">
                NexusApp License Engine v2.4
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
