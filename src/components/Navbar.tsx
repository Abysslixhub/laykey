import React from 'react';
import { 
  Info,
  Zap
} from 'lucide-react';

interface NavbarProps {
  isOnline: boolean;
  latencyMs: number;
  onOpenSpecs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  latencyMs,
  onOpenSpecs,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-cyan-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand with Official Abysslix Hub Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/25">
              <img
                src="/assets/aistudio/unnamed_93150696.png"
                alt="Abysslix Hub Logo"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  ABYSSLIX HUB
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Zap className="w-2.5 h-2.5 mr-1 text-cyan-400 fill-current" />
                  KEY SYSTEM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Hệ Thống Cấp Mã Key Chính Thức • Tiền Tố ABYSS- • Get Key Portal
              </p>
            </div>
          </div>

          {/* Right Status indicators & actions */}
          <div className="flex items-center gap-3">
            {/* Live API indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
              <span className="relative flex h-2 w-2">
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isOnline ? 'bg-cyan-400' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span className="text-slate-300 font-medium">
                {isOnline ? 'Hệ Thống Sẵn Sàng' : 'Đang kết nối...'}
              </span>
              {latencyMs > 0 && (
                <span className="text-cyan-400 font-mono text-[11px] border-l border-slate-700 pl-2">
                  {latencyMs}ms
                </span>
              )}
            </div>

            {/* Specs modal trigger */}
            <button
              onClick={onOpenSpecs}
              title="Thông tin hệ thống Abysslix Hub"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
