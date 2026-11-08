import React from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Gamepad2, 
  Sparkles, 
  Server, 
  Flame,
  CheckCircle2
} from 'lucide-react';

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelInfoModal: React.FC<ModelInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Flame className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                Cơ Chế Abysslix Hub Key System
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  v3.4
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Hệ Thống Lấy Key Chính Thức Của Abysslix Hub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Key Format Example */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Định Dạng Mã Key Chuẩn:</span>
            </div>
            <div className="font-mono text-lg font-black text-cyan-300 tracking-wider bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
              ABYSS-XXXXX-XXXXX-XXXX
            </div>
            <p className="text-slate-400 text-xs">
              Cấu trúc gồm: <strong>[TIỀN TỐ ABYSS-] - [5 KÝ TỰ] - [5 KÝ TỰ] - [4 KÝ TỰ]</strong>, tương thích 100% với giao thức xác thực của Abysslix Hub trên các Executor như Delta, Fluxus, Codex, Arceus X, Hydrogen.
            </p>
          </div>

          {/* Workflow */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider text-slate-400">
              Quy trình hoạt động hoàn chỉnh:
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <div className="font-bold text-slate-200">Người chơi chạy Script trong Executor</div>
                  <div className="text-slate-400 text-[11px]">Bảng Key System hiện lên, người chơi bấm "Get Key" để sao chép link website.</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <div className="font-bold text-slate-200">Truy cập Website làm nhiệm vụ & lấy Key</div>
                  <div className="text-slate-400 text-[11px]">Người chơi vượt qua link nhiệm vụ ngắn, sau đó hệ thống mở khóa cấp mã key ngẫu nhiên.</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <div className="font-bold text-slate-200">Dán vào Script - Hỗ trợ trên mọi Executor</div>
                  <div className="text-slate-400 text-[11px]">Dán mã key vào bảng UI trong game. Tương thích trực tiếp với Delta, Fluxus, Codex, Arceus X, Hydrogen và mọi executor khác.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Endpoints */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Server className="w-4 h-4" />
              <span>API Dành Cho Executor:</span>
            </div>
            <code className="text-cyan-300 font-mono text-xs block bg-slate-900 p-2 rounded border border-slate-800">
              GET /api/key/verify?key=YOUR_ABYSS_KEY
            </code>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Đóng thông tin
          </button>
        </div>
      </div>
    </div>
  );
};
