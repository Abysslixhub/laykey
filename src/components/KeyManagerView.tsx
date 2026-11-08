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
  Plus, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { ApiKeyRecord } from '../types';

interface KeyManagerViewProps {
  onSelectKeyForTesting?: (keyString: string) => void;
}

export const KeyManagerView: React.FC<KeyManagerViewProps> = ({ onSelectKeyForTesting }) => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});

  // Batch modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState('App_User');
  const [batchQuota, setBatchQuota] = useState(100);
  const [batchTier, setBatchTier] = useState('starter');
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/keys');
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

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa (thu hồi) API Key này? Ứng dụng đang dùng key sẽ không thể gọi API nữa.')) return;
    try {
      const res = await fetch(`/api/keys/${id}/revoke`, { method: 'POST' });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err: any) {
      alert(`Lỗi thu hồi key: ${err.message}`);
    }
  };

  const handleRegenerate = async (id: string) => {
    if (!window.confirm('Tạo lại chuỗi ngẫu nhiên mới cho Key này? Khóa cũ sẽ ngừng hoạt động ngay lập tức.')) return;
    try {
      const res = await fetch(`/api/keys/${id}/regenerate`, { method: 'POST' });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err: any) {
      alert(`Lỗi tái tạo key: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa vĩnh viễn API Key này khỏi hệ thống?')) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err: any) {
      alert(`Lỗi xóa key: ${err.message}`);
    }
  };

  const handleBatchGenerate = async () => {
    setIsBatchLoading(true);
    try {
      const res = await fetch('/api/keys/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: batchCount,
          prefix: batchPrefix,
          quota: batchQuota,
          tier: batchTier,
          expiresInDays: 30,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo danh sách');
      
      setIsBatchModalOpen(false);
      fetchKeys();
      alert(`Đã tạo thành công ${data.count} API Keys mới!`);
    } catch (err: any) {
      alert(`Không thể tạo hàng loạt: ${err.message}`);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const exportKeysToCSV = () => {
    if (keys.length === 0) return;
    const header = 'ID,Name,Key,Tier,UsedQuota,TotalQuota,Status,CreatedAt,ExpiresAt\n';
    const rows = keys
      .map(
        (k) =>
          `"${k.id}","${k.name}","${k.key}","${k.tier}",${k.usedQuota},${k.totalQuota},"${k.status}","${k.createdAt}","${k.expiresAt}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-api-keys-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered keys
  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUsed = keys.reduce((acc, k) => acc + (k.usedQuota || 0), 0);
  const activeCount = keys.filter((k) => k.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            Quản Lý Danh Sách Khóa API & Hạn Mức Ứng Dụng
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Theo dõi tình trạng hoạt động, số lượt request đã dùng và phân quyền các khóa API được cấp cho người dùng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sinh Hàng Loạt (Batch)</span>
          </button>

          <button
            onClick={exportKeysToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất CSV</span>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Tổng số Key đã cấp</div>
            <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">{keys.length}</div>
          </div>
          <Key className="w-6 h-6 text-cyan-400/60" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Đang hoạt động (Active)</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{activeCount}</div>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-400/60" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Tổng số Request đã tiêu thụ</div>
            <div className="text-xl font-bold font-mono text-purple-300 mt-0.5">{totalUsed}</div>
          </div>
          <Clock className="w-6 h-6 text-purple-400/60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên ứng dụng hoặc chuỗi key..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
            Hoạt động ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('revoked')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'revoked'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đã thu hồi ({keys.length - activeCount})
          </button>
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Tên Khóa / App</th>
                <th className="py-3 px-4 font-semibold">Chuỗi Khóa Bí Mật</th>
                <th className="py-3 px-4 font-semibold">Hạn Mức Sử Dụng</th>
                <th className="py-3 px-4 font-semibold">Trạng Thái</th>
                <th className="py-3 px-4 font-semibold">Ngày Hết Hạn</th>
                <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredKeys.length > 0 ? (
                filteredKeys.map((k) => {
                  const isVisible = visibleKeyIds[k.id];
                  const isCopied = copiedKeyId === k.id;
                  const isUnlimited = k.totalQuota === -1;
                  const usagePercent = isUnlimited
                    ? 0
                    : Math.min(100, Math.round((k.usedQuota / k.totalQuota) * 100));

                  return (
                    <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4 font-sans font-medium text-slate-100">
                        <div className="flex items-center gap-2">
                          <span>{k.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                            {k.tier}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Tạo: {new Date(k.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Key */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                            {isVisible ? k.key : k.key.slice(0, 10) + '••••••••••••••••'}
                          </span>
                          <button
                            onClick={() => toggleVisibility(k.id)}
                            title={isVisible ? 'Ẩn' : 'Hiện'}
                            className="p-1 rounded text-slate-500 hover:text-slate-300"
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyKey(k.id, k.key)}
                            title="Sao chép"
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

                      {/* Quota Progress */}
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                          <span>{k.usedQuota} đã dùng</span>
                          <span className="text-slate-400">
                            {isUnlimited ? 'Vô hạn' : `/ ${k.totalQuota}`}
                          </span>
                        </div>
                        <div className="w-32 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              usagePercent > 80
                                ? 'bg-rose-500'
                                : usagePercent > 50
                                ? 'bg-amber-500'
                                : 'bg-cyan-500'
                            }`}
                            style={{ width: `${isUnlimited ? 15 : usagePercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 font-sans">
                        {k.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Hoạt động
                          </span>
                        ) : k.status === 'revoked' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Đã thu hồi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700/30 text-slate-400 border border-slate-700/50">
                            Hết hạn
                          </span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {k.expiresAt === 'never'
                          ? 'Vĩnh viễn'
                          : new Date(k.expiresAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1">
                          {onSelectKeyForTesting && k.status === 'active' && (
                            <button
                              onClick={() => onSelectKeyForTesting(k.key)}
                              title="Kiểm tra key trực tiếp trong Sandbox"
                              className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 mr-1"
                            >
                              Test Key
                            </button>
                          )}

                          {k.status === 'active' && (
                            <button
                              onClick={() => handleRevoke(k.id)}
                              title="Thu hồi / Khóa key này"
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleRegenerate(k.id)}
                            title="Tái tạo chuỗi ngẫu nhiên mới"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(k.id)}
                            title="Xóa vĩnh viễn"
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
                    Không tìm thấy API Key nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Generator Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-slate-100 text-sm">Sinh Khóa API Hàng Loạt (Batch)</h3>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Số lượng Key cần sinh (1 - 50):
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tiền tố tên nhận diện:
                </label>
                <input
                  type="text"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  placeholder="Ví dụ: App_User, Tester_Group"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Gói Tier:</label>
                  <select
                    value={batchTier}
                    onChange={(e) => setBatchTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  >
                    <option value="starter">Starter</option>
                    <option value="developer">Developer</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quota / Key:</label>
                  <input
                    type="number"
                    value={batchQuota}
                    onChange={(e) => setBatchQuota(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsBatchModalOpen(false)}
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
