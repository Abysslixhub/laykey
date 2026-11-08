import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Globe, 
  FileCode, 
  Key, 
  Gamepad2, 
  Sparkles,
  Zap
} from 'lucide-react';

interface LuaScriptDocsProps {
  currentKey?: string;
}

export const LuaScriptDocs: React.FC<LuaScriptDocsProps> = ({ currentKey }) => {
  const [selectedKey, setSelectedKey] = useState(currentKey || '');
  const [activeTab, setActiveTab] = useState<'roblox' | 'python' | 'curl' | 'js'>('roblox');
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.app';

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const luaCode = `-- [[ ABYSSLIX HUB - LUA SCRIPT KEY VERIFICATION ]]
-- Hỗ trợ tất cả Executor: Delta, Fluxus, Codex, Arceus X, Hydrogen

local HttpService = game:GetService("HttpService")
local AnalyticsService = game:GetService("RbxAnalyticsService")

-- 1. Lấy HWID độc nhất của máy người chơi
local HWID = AnalyticsService:GetClientId()
local Key = "${selectedKey}" -- Key do người chơi dán vào ô Enter Key
local ApiUrl = "${baseUrl}/api/key/verify?key=" .. Key .. "&hwid=" .. HWID

-- 2. Gọi API xác thực thông qua game:HttpGet
local success, response = pcall(function()
    return game:HttpGet(ApiUrl)
end)

if success and response then
    local data = HttpService:JSONDecode(response)
    if data.valid == true then
        print("==========================================")
        print("ABYSSLIX HUB: XÁC THỰC KEY THÀNH CÔNG!")
        print("Hub: " .. tostring(data.hub))
        print("Thời hạn: " .. tostring(data.timeRemaining))
        print("==========================================")
        
        -- Mở khóa và tải script chính của Abysslix Hub:
        -- loadstring(game:HttpGet("https://raw.githubusercontent.com/.../abysslix_hub.lua"))()
        
        game:GetService("StarterGui"):SetCore("SendNotification", {
            Title = "Abysslix Hub",
            Text = "Key Hợp Lệ! Chào mừng bạn vào script.",
            Duration = 5
        })
    else
        warn("Lỗi xác thực Abysslix Hub: " .. tostring(data.message))
        game:GetService("StarterGui"):SetCore("SendNotification", {
            Title = "Abysslix Hub Error",
            Text = data.message or "Key không hợp lệ!",
            Duration = 5
        })
    end
else
    warn("Không thể kết nối đến máy chủ Abysslix Hub!")
end`;

  const pythonCode = `# Script Python tự động kiểm tra Key Abysslix Hub & HWID
import requests

KEY = "${selectedKey}"
HWID = "HWID-USER-TEST-2026"
URL = f"${baseUrl}/api/key/verify?key={KEY}&hwid={HWID}"

r = requests.get(URL)
data = r.json()

if data.get("valid"):
    print("Abysslix Hub: Key hợp lệ! Gói:", data.get("tier"))
    print("Thời hạn còn lại:", data.get("timeRemaining"))
else:
    print("Key không hợp lệ:", data.get("message"))`;

  const curlCode = `# Kiểm tra trực tiếp trên Terminal bằng cURL
curl -X GET "${baseUrl}/api/key/verify?key=${selectedKey}&hwid=HWID-9921-X812-FLUXUS"`;

  const jsCode = `// Tích hợp trong Web hoặc Node.js
async function checkAbysslixKey(key, hwid) {
  const res = await fetch(\`${baseUrl}/api/key/verify?key=\${key}&hwid=\${hwid}\`);
  const data = await res.json();
  if (data.valid) {
    console.log("Xác thực Abysslix Hub thành công:", data);
  } else {
    console.warn("Lỗi:", data.message);
  }
}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/unnamed_93150696.png"
              alt="Abysslix Hub"
              className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                Mã Nguồn Lua Script Tích Hợp Cho Abysslix Hub
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhúng đoạn mã Lua này vào script Roblox của bạn để tự động gọi API xác thực key.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <Key className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 font-medium">Mã key mẫu:</span>
            <input
              type="text"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="bg-transparent text-xs text-cyan-300 font-mono font-bold focus:outline-none w-52 truncate uppercase"
            />
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'roblox', label: 'Lua Script (Roblox / Executor)', icon: Gamepad2 },
              { id: 'python', label: 'Python Script', icon: FileCode },
              { id: 'curl', label: 'cURL Terminal', icon: Terminal },
              { id: 'js', label: 'JavaScript', icon: Globe },
            ].map((t) => {
              const Icon = t.icon;
              const isSel = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSel
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              copyCode(
                activeTab === 'roblox'
                  ? luaCode
                  : activeTab === 'python'
                  ? pythonCode
                  : activeTab === 'curl'
                  ? curlCode
                  : jsCode
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-cyan-200 leading-relaxed select-all">
            <code>
              {activeTab === 'roblox'
                ? luaCode
                : activeTab === 'python'
                ? pythonCode
                : activeTab === 'curl'
                ? curlCode
                : jsCode}
            </code>
          </pre>
        </div>
      </div>

      {/* HTTP GET Verification Documentation */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <h4 className="font-bold text-slate-200 uppercase tracking-wide">
          Cơ chế xác thực qua đường dẫn (HTTP GET API):
        </h4>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300">
          GET {baseUrl}/api/key/verify?key={selectedKey}&hwid=DEVICE_HWID
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Đường dẫn trên tương thích 100% với hàm <code className="text-cyan-300 font-mono">game:HttpGet</code> trên mọi Executor (Delta, Fluxus, Codex, Arceus X), trả về JSON trạng thái ngay tức thì.
        </p>
      </div>
    </div>
  );
};
