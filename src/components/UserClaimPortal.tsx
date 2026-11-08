import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  Clock, 
  Crown, 
  ArrowRight, 
  Gift, 
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { AppLicenseKey, KeyPlan } from '../types';

interface UserClaimPortalProps {
  onKeyClaimed: (key: AppLicenseKey) => void;
  onOpenSimulator: (keyString: string) => void;
}

export const UserClaimPortal: React.FC<UserClaimPortalProps> = ({
  onKeyClaimed,
  onOpenSimulator,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<KeyPlan>('trial_24h');
  const [customPrefix, setCustomPrefix] = useState('APP');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [claimedKey, setClaimedKey] = useState<AppLicenseKey | null>(null);
  const [copied, setCopied] = useState(false);

  const plans: {
    id: KeyPlan;
    name: string;
    badge?: string;
    duration: string;
    devices: string;
    desc: string;
    icon: any;
    color: string;
  }[] = [
    {
      id: 'trial_24h',
      name: 'Dùng Thử 24 Giờ',
      badge: 'Miễn Phí',
      duration: '24 Giờ kể từ khi nhập vào app',
      devices: '1 Thiết bị',
      desc: 'Dành cho người dùng trải nghiệm thử ứng dụng trước khi mua bản quyền.',
      icon: Gift,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'weekly_7d',
      name: 'Gói Tuần 7 Ngày',
      duration: '7 Ngày sử dụng',
      devices: '1 Thiết bị',
      desc: 'Sử dụng ngắn hạn cho các chiến dịch hoặc dự án tuần.',
      icon: Clock,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'monthly_30d',
      name: 'Gói VIP Tháng',
      badge: 'Phổ Biến',
      duration: '30 Ngày bản quyền',
      devices: '2 Thiết bị (Đổi máy được)',
      desc: 'Mở khóa toàn bộ tính năng cao cấp trên cả điện thoại và máy tính.',
      icon: Zap,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'vip_pro',
      name: 'Gói VIP Pro 90 Ngày',
      duration: '90 Ngày (3 tháng)',
      devices: '3 Thiết bị',
      desc: 'Dành cho người dùng trung thành, hỗ trợ chạy đồng thời 3 máy.',
      icon: Crown,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'lifetime',
      name: 'Bản Quyền Vĩnh Viễn',
      badge: 'Trọn Đời',
      duration: 'Không giới hạn thời gian',
      devices: '5 Thiết bị',
      desc: 'Sở hữu trọn đời mọi bản cập nhật và tính năng mới nhất của ứng dụng.',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  const handleClaimKey = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/license/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          customPrefix: customPrefix.trim().toUpperCase(),
          note: note.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo key');

      setClaimedKey(data.key);
      onKeyClaimed(data.key);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Cổng Cấp Khóa Bản Quyền Ứng Dụng</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Lấy Mã Kích Hoạt (Key) Để Sử Dụng Ứng Dụng
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Hệ thống tự động sinh ngẫu nhiên mã khóa bản quyền (Serial License Key) để người dùng nhập vào ứng dụng trên điện thoại hoặc máy tính, tự động kích hoạt tính năng và liên kết thiết bị.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Khóa HWID theo thiết bị
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Kích hoạt tự động tức thì
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              Thời hạn tính từ khi nhập vào app
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Plan Selector & Generated Key Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Choose Plan & Generate (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Chọn Loại Khóa Bản Quyền</h3>
                <p className="text-xs text-slate-400">Hệ thống sẽ sinh mã ngẫu nhiên theo gói bạn chọn</p>
              </div>
            </div>
          </div>

          {/* Plan Selection Cards */}
          <div className="space-y-2">
            {plans.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${p.color} border`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-xs sm:text-sm">
                          {p.name}
                        </span>
                        {p.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-medium">
                        <span>⏳ {p.duration}</span>
                        <span>📱 {p.devices}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center pr-1">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-400'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Prefix Customization */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Tiền tố mã (Prefix):
              </label>
              <input
                type="text"
                value={customPrefix}
                maxLength={6}
                onChange={(e) => setCustomPrefix(e.target.value)}
                placeholder="APP, VIP, GAME..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Ghi chú nhận diện (Tùy chọn):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Cấp cho bạn A..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClaimKey}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Key className="w-4 h-4 fill-current" />
            <span>{isLoading ? 'Đang khởi tạo mã kích hoạt...' : 'Tạo & Lấy Mã Kích Hoạt Ngay'}</span>
          </button>
        </div>

        {/* Right: Claimed Key Box & How to Use (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mã Khóa Của Bạn
              </span>
              {claimedKey && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Sẵn Sàng Sử Dụng
                </span>
              )}
            </div>

            {claimedKey ? (
              <div className="mt-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Big Key Display */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 text-center space-y-2 shadow-inner">
                  <div className="text-[11px] font-medium text-slate-400">
                    Mã bản quyền: <span className="text-cyan-300 font-bold">{claimedKey.planName}</span>
                  </div>

                  <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider text-cyan-300 select-all py-1">
                    {claimedKey.licenseKey}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    *Thời hạn sẽ bắt đầu tính từ thời điểm bạn kích hoạt lần đầu trên App.
                  </p>
                </div>

                {/* Key metadata */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Giới hạn thiết bị</div>
                    <div className="font-semibold font-mono text-slate-200 mt-0.5">
                      Tối đa {claimedKey.maxDevices} máy
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Thời hạn sử dụng</div>
                    <div className="font-semibold font-mono text-slate-200 mt-0.5">
                      {claimedKey.durationDays === -1
                        ? 'Vĩnh viễn'
                        : `${claimedKey.durationDays} Ngày`}
                    </div>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(claimedKey.licenseKey)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-md"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Đã Sao Chép Mã Key!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Mã Kích Hoạt</span>
                    </>
                  )}
                </button>

                {/* Step-by-step Instructions for User */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <span className="font-semibold text-slate-300 block">
                    Cách kích hoạt trên ứng dụng của bạn:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                    <li>Mở ứng dụng của bạn trên điện thoại hoặc máy tính.</li>
                    <li>Tìm mục <strong className="text-slate-300">Cài đặt &gt; Kích hoạt bản quyền</strong>.</li>
                    <li>Dán mã key ở trên và nhấn <strong className="text-slate-300">Kích hoạt</strong> để mở khóa.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="py-14 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                <Key className="w-12 h-12 text-slate-700 stroke-[1.5]" />
                <p className="text-xs text-slate-400 font-medium">Chưa có mã nào được sinh</p>
                <p className="text-[11px] text-slate-600 max-w-xs">
                  Chọn gói bản quyền bên trái và nhấn "Tạo & Lấy Mã Kích Hoạt Ngay" để nhận key sử dụng trên ứng dụng.
                </p>
              </div>
            )}
          </div>

          {/* Test Simulator Link */}
          {claimedKey && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => onOpenSimulator(claimedKey.licenseKey)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 hover:from-indigo-950 hover:to-purple-950 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all group"
              >
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  Mở Trình Giả Lập App để thử kích hoạt ngay
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
