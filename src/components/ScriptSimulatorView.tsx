import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Key, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Copy, 
  Check, 
  Loader2, 
  AlertTriangle,
  Lock,
  Unlock,
  Zap,
  Sword,
  MapPin,
  Eye,
  Sliders,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface ScriptSimulatorViewProps {
  initialKey?: string;
}

export const ScriptSimulatorView: React.FC<ScriptSimulatorViewProps> = ({ initialKey }) => {
  const [inputKey, setInputKey] = useState(initialKey || '');
  const [hwid, setHwid] = useState('HWID-9921-X812-FLUXUS');
  const [isChecking, setIsChecking] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unlocked Hub internal state for demo interaction
  const [hubTab, setHubTab] = useState<'farm' | 'teleport' | 'esp' | 'info'>('farm');
  const [autoFarmLevel, setAutoFarmLevel] = useState(true);
  const [fastAttack, setFastAttack] = useState(true);
  const [selectedWeapon, setSelectedWeapon] = useState('Melee (Godhuman)');
  const [playerEsp, setPlayerEsp] = useState(true);

  useEffect(() => {
    if (initialKey) {
      setInputKey(initialKey);
    }
  }, [initialKey]);

  const handleCheckKey = async () => {
    if (!inputKey.trim()) {
      alert('Vui lòng nhập Key vào ô trống');
      return;
    }

    setIsChecking(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/key/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: inputKey.trim(),
          hwid: hwid.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setErrorMessage(data.message || 'Key không hợp lệ');
        setVerifyResult(null);
      } else {
        setVerifyResult(data);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(`Lỗi mạng: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setVerifyResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          Trình Giả Lập UI Abysslix Hub Trong Game (Roblox Executor Menu)
        </h2>
        <p className="text-xs text-slate-400">
          Mô phỏng chân thực bảng giao diện nhập Key của <strong>Abysslix Hub</strong> trong game. Dán key có tiền tố <strong>ABYSS-</strong> vào để mở khóa.
        </p>
      </div>

      {/* Main Game Screen & Script UI */}
      <div className="flex justify-center">
        {/* Game Window Frame (Mockup) */}
        <div className="w-full max-w-3xl rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl p-4 sm:p-6 overflow-hidden relative min-h-[540px] flex flex-col justify-center items-center">
          {/* Background Game Ambient Canvas effect */}
          <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black pointer-events-none opacity-85"></div>
          <div className="absolute top-4 left-4 text-[10px] text-slate-600 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Blox Fruits [Sea 3] • FPS: 60 • Delta / Fluxus Executor Active</span>
          </div>

          {/* Floating Script Hub Window with Abysslix Hub Logo */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl shadow-cyan-500/15 backdrop-blur-xl overflow-hidden flex flex-col">
            {/* Hub Titlebar */}
            <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/aistudio/unnamed_93150696.png"
                  alt="Abysslix Hub"
                  className="w-7 h-7 rounded-lg object-cover border border-cyan-500/40 shadow-sm"
                />
                <div className="font-extrabold text-xs tracking-wider text-slate-100 flex items-center gap-2">
                  <span>ABYSSLIX HUB v3.4</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    {verifyResult ? 'UNLOCKED' : 'KEY SYSTEM'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              </div>
            </div>

            {/* Hub Body */}
            {verifyResult ? (
              /* UNLOCKED SCRIPT MENU */
              <div className="flex-1 flex flex-col">
                {/* Navigation Bar inside Hub */}
                <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800 text-xs">
                  {[
                    { id: 'farm', label: 'Auto Farm', icon: Sword },
                    { id: 'teleport', label: 'Teleports', icon: MapPin },
                    { id: 'esp', label: 'Visuals & ESP', icon: Eye },
                    { id: 'info', label: 'Key Info', icon: ShieldCheck },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSel = hubTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setHubTab(t.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSel
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="p-4 space-y-3 min-h-[260px] text-xs">
                  {hubTab === 'farm' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <div className="font-bold text-slate-100">Auto Farm Level (Tự Động Cày Cấp)</div>
                          <div className="text-[10px] text-slate-400">Tự động nhận quest và gom quái siêu tốc</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoFarmLevel}
                          onChange={(e) => setAutoFarmLevel(e.target.checked)}
                          className="w-4 h-4 accent-cyan-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <div className="font-bold text-slate-100">Fast Attack (Đánh Nhanh Không Delay)</div>
                          <div className="text-[10px] text-slate-400">100 đòn đánh / giây (Abysslix Bypass)</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={fastAttack}
                          onChange={(e) => setFastAttack(e.target.checked)}
                          className="w-4 h-4 accent-cyan-500"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <label className="text-slate-300 font-bold">Vũ khí trang bị:</label>
                        <select
                          value={selectedWeapon}
                          onChange={(e) => setSelectedWeapon(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-100 focus:outline-none"
                        >
                          <option value="Melee (Godhuman)">Melee (Godhuman / Sanguine Art)</option>
                          <option value="Sword (Cursed Dual Katana)">Sword (Cursed Dual Katana / Shark Anchor)</option>
                          <option value="Blox Fruit (Kitsune / Dough)">Blox Fruit (Kitsune V2 / Dough)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {hubTab === 'teleport' && (
                    <div className="space-y-2">
                      <div className="text-slate-400 text-xs">Dịch chuyển tức thời tới các đảo Sea 3:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Mansion (Dinh Thự)', 'Floating Turtle (Rùa Nổi)', 'Hydra Island', 'Haunted Castle', 'Mirage Island (Đảo Ảo)', 'Tiki Outpost'].map((island, idx) => (
                          <button
                            key={idx}
                            onClick={() => alert(`Abysslix Hub: Đang dịch chuyển tới ${island}`)}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-left text-xs transition-colors"
                          >
                            📍 {island}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {hubTab === 'esp' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <div className="font-bold text-slate-100">ESP Người Chơi (Player ESP)</div>
                          <div className="text-[10px] text-slate-400">Hiển thị vị trí người chơi và thanh máu</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={playerEsp}
                          onChange={(e) => setPlayerEsp(e.target.checked)}
                          className="w-4 h-4 accent-cyan-500"
                        />
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <div className="font-bold text-slate-100">ESP Trái Ác Quỷ (Fruit ESP)</div>
                          <div className="text-[10px] text-slate-400">Định vị trái ác quỷ spawn trên map</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
                      </div>
                    </div>
                  )}

                  {hubTab === 'info' && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Mã Key hiện tại:</span>
                        <span className="font-mono text-cyan-300 font-bold">{verifyResult.key}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Gói bản quyền:</span>
                        <span className="text-emerald-400 font-semibold">{verifyResult.tier}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Thời gian còn lại:</span>
                        <span className="text-slate-200 font-mono">{verifyResult.timeRemaining}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">HWID đã liên kết:</span>
                        <span className="text-slate-300 font-mono text-[10px]">{hwid}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer in Hub */}
                <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Abysslix Hub Active
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-200 text-[11px] underline"
                  >
                    Thử nhập key khác
                  </button>
                </div>
              </div>
            ) : (
              /* LOCKED KEY SYSTEM INPUT (Identical to Abysslix Hub) */
              <div className="p-5 space-y-4 text-center">
                {/* Hub Logo */}
                <div className="space-y-1">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-cyan-500/40 p-1 mx-auto mb-2 shadow-lg shadow-cyan-500/20">
                    <img
                      src="/assets/aistudio/unnamed_93150696.png"
                      alt="Abysslix Hub"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <h4 className="font-black text-sm text-slate-100 uppercase tracking-wide">
                    ABYSSLIX HUB • KEY SYSTEM
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Please enter your key below to execute script. (Get key at website)
                  </p>
                </div>

                {/* Key Input */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Nhập mã key ABYSS-..."
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2.5 text-xs text-cyan-300 font-mono font-bold uppercase text-center tracking-wider focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
                  />
                  <div className="text-[10px] text-slate-500 font-mono text-left pl-1">
                    HWID của bạn: {hwid}
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px] text-left flex items-start gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleCheckKey}
                    disabled={isChecking || !inputKey.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>CHECKING KEY...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>CHECK KEY (XÁC THỰC)</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => alert(`Đã sao chép link lấy key: ${window.location.origin}`)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    >
                      GET KEY (LẤY LINK)
                    </button>
                    <button
                      onClick={() => alert('Chuyển hướng tới Discord cộng đồng Abysslix Hub')}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    >
                      JOIN DISCORD
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
