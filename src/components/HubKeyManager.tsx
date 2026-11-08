import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Search, 
  RefreshCw, 
  Copy, 
  Check, 
  Trash2, 
  Ban, 
  RotateCcw, 
  Layers, 
  Download, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Clock, 
  FileText,
  Play,
  Gamepad2
} from 'lucide-react';
import { HubKeyRecord, KeyTier } from '../types';

interface HubKeyManagerProps {
  onTestKeyOnSimulator?: (keyString: string) => void;
}

export const HubKeyManager: React.FC<HubKeyManagerProps> = ({
  onTestKeyOnSimulator,
}) => {
  const [keys, setKeys] = useState<HubKeyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});

  // Batch modal state
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState('ABYSS');
  const [batchHubName, setBatchHubName] = useState('Abyss Hub');
  const [batchTier, setBatchTier] = useState<KeyTier>('free_24h');
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/keys/list');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch {
      // Ignore background errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const copyKey = (id: string, keyString: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetHwid = async (id: string) => {
    if (!window.confirm('Xóa liên kết HWID của key này? Người dùng sẽ có thể kích hoạt trên executor hoặc thiết bị mới.')) return;
    try {
      const res = await fetch(`/api/keys/${id}/reset-hwid`, { method: 'POST' });
      if (res.ok) fetchKeys();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleToggleBan = async (id: string) => {
    try {
      const res = await fetch(`/api/keys/${id}/toggle-ban`, { method: 'POST' });
      if (res.ok) fetchKeys();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa vĩnh viễn key này khỏi hệ thống?')) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (res.ok) fetchKeys();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleBatchGenerate = async () => {
    setIsBatchLoading(true);
    try {
      const res = await fetch('/api/keys/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: batchCount,
          prefix: batchPrefix.trim().toUpperCase(),
          hubName: batchHubName,
          tier: batchTier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo danh sách');

      setIsBatchOpen(false);
      fetchKeys();
      alert(`Đã sinh thành công ${data.count} key ngẫu nhiên!`);
    } catch (err: any) {
      alert(`Lỗi tạo hàng loạt: ${err.message}`);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const exportToTXT = () => {
    if (keys.length === 0) return;
    const content = keys.map((k) => k.key).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hub-keys-list-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.hubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.hwid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = keys.filter((k) => k.status === 'active').length;
  const bannedCount = keys.filter((k) => k.status === 'banned').length;
  const boundCount = keys.filter((k) => k.hwid && k.hwid !== '').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/unnamed_93150696.png"
            alt="Abysslix Hub"
            className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40"
          />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              Quản Lý Key & HWID (Abysslix Hub Admin)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Quản lý danh sách key tiền tố ABYSS-, kiểm tra HWID thiết bị đã bind và phân quyền.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sinh Hàng Loạt (Batch)</span>
          </button>

          <button
            onClick={exportToTXT}
            title="Xuất file TXT (Mỗi key 1 dòng, sẵn sàng chia sẻ)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xuất TXT</span>
          </button>

          <button
            onClick={fetchKeys}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Tổng số Key</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">{keys.length}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Đang hoạt động (Active)</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{activeCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Đã Bind HWID thiết bị</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">{boundCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Đã Khóa / Blacklist</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">{bannedCount}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã key, tên hub hoặc HWID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Lọc:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({keys.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('banned')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'banned'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Banned ({bannedCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Mã Key (Format Chuẩn)</th>
                <th className="py-3 px-4 font-semibold">Hub Áp Dụng</th>
                <th className="py-3 px-4 font-semibold">Mã Thiết Bị (HWID Bind)</th>
                <th className="py-3 px-4 font-semibold">Thời Hạn</th>
                <th className="py-3 px-4 font-semibold">Trạng Thái</th>
                <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredKeys.length > 0 ? (
                filteredKeys.map((k) => {
                  const isVisible = visibleKeyIds[k.id];
                  const isCopied = copiedKeyId === k.id;
                  const isExpired = k.expiresAt !== 'never' && new Date(k.expiresAt).getTime() < Date.now();

                  return (
                    <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Key serial */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-300 bg-slate-950 font-bold px-2 py-1 rounded border border-slate-800">
                            {isVisible ? k.key : k.key.slice(0, 10) + '••••-••••'}
                          </span>
                          <button
                            onClick={() => toggleVisibility(k.id)}
                            className="p-1 rounded text-slate-500 hover:text-slate-300"
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyKey(k.id, k.key)}
                            className="p-1 rounded text-slate-500 hover:text-cyan-300"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Hub Name */}
                      <td className="py-3 px-4 font-sans font-semibold text-slate-100">
                        {k.hubName}
                      </td>

                      {/* Bound HWID */}
                      <td className="py-3 px-4">
                        {k.hwid ? (
                          <span className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {k.hwid}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">
                            Chưa bind (Sẽ khóa máy đầu tiên nhập)
                          </span>
                        )}
                      </td>

                      {/* Tier / Duration */}
                      <td className="py-3 px-4 font-sans text-[11px]">
                        <span className="text-slate-200 font-semibold">{k.tierName}</span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {k.expiresAt === 'never'
                            ? 'Vĩnh viễn'
                            : new Date(k.expiresAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 font-sans">
                        {k.status === 'banned' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Banned
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-700/30 text-slate-400 border border-slate-700/50">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1">
                          {onTestKeyOnSimulator && (
                            <button
                              onClick={() => onTestKeyOnSimulator(k.key)}
                              className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 mr-1 flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Thử trên Hub</span>
                            </button>
                          )}

                          {k.hwid && (
                            <button
                              onClick={() => handleResetHwid(k.id)}
                              title="Reset HWID (Cho phép đổi máy/executor)"
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleBan(k.id)}
                            title={k.status === 'banned' ? 'Mở khóa key' : 'Blacklist / Cấm key này'}
                            className={`p-1.5 rounded hover:bg-slate-800 ${
                              k.status === 'banned'
                                ? 'text-rose-400 hover:text-emerald-400'
                                : 'text-slate-400 hover:text-rose-400'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(k.id)}
                            title="Xóa key"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-sans">
                    Không tìm thấy key nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Generator Modal */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-slate-100 text-sm">Sinh Key Hàng Loạt (Batch Generator)</h3>
              </div>
              <button
                onClick={() => setIsBatchOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Số lượng key cần sinh (1 - 100):
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tiền tố key (Format: PREFIX-XXXXX-XXXXX-XXXX):
                </label>
                <input
                  type="text"
                  value={batchPrefix}
                  maxLength={8}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  placeholder="ABYSS, DELTA..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Hub / Script:</label>
                <input
                  type="text"
                  value={batchHubName}
                  onChange={(e) => setBatchHubName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Thời hạn:</label>
                <select
                  value={batchTier}
                  onChange={(e) => setBatchTier(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                >
                  <option value="free_24h">24 Giờ (Free Key)</option>
                  <option value="free_48h">48 Giờ</option>
                  <option value="vip_30d">VIP 30 Ngày</option>
                  <option value="lifetime_vip">VIP Trọn Đời (Lifetime)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsBatchOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleBatchGenerate}
                disabled={isBatchLoading}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
              >
                {isBatchLoading ? 'Đang sinh...' : 'Bắt Đầu Sinh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
