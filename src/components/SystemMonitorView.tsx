import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Database,
  BarChart3
} from 'lucide-react';
import { SystemMetrics, MetricLog } from '../types';

export const SystemMonitorView: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch {
      // Ignore background fetch errors
    }
  };

  useEffect(() => {
    fetchMetrics();
    if (!autoRefresh) return;
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    await fetchMetrics();
    setIsLoading(false);
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    const hrs = Math.floor(mins / 60);
    if (hrs === 0) return `${mins}m ${secs}s`;
    return `${hrs}h ${mins % 60}m`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Bảng Điều Khiển & Giám Sát Hiệu Năng API Hệ Thống
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Theo dõi độ trễ thời gian thực, lưu lượng các endpoint và tình trạng kết nối tới Gemini API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Tự làm mới (3s)</span>
          </label>

          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Cập nhật</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng lượt gọi API</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {metrics?.totalCalls ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">
            {metrics?.successCalls ?? 0} thành công • {metrics?.errorCalls ?? 0} lỗi
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tỷ lệ thành công</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics?.successRate ?? 100}%
          </div>
          <div className="text-[11px] text-slate-500">
            Đảm bảo tính sẵn sàng cao (High Availability)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Độ trễ trung bình</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {metrics?.avgLatencyMs ? `${metrics.avgLatencyMs}ms` : '--'}
          </div>
          <div className="text-[11px] text-slate-500">
            Thời gian phản hồi máy chủ & Gemini API
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Thời gian hoạt động</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            {formatUptime(metrics?.uptimeSeconds)}
          </div>
          <div className="text-[11px] text-slate-500">
            Server Express + Node 22 (dev runtime)
          </div>
        </div>
      </div>

      {/* System Engine & Architecture Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Mô hình Cốt Lõi (Core Engine)</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Mô hình AI:</span>
              <span className="text-cyan-300 font-mono font-medium">gemini-3.8-flash</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Nhà phát triển:</span>
              <span className="text-slate-200">Google DeepMind</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Chế độ Tư duy:</span>
              <span className="text-slate-200">ThinkingLevel (Low/Med/High)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Đa phương thức:</span>
              <span className="text-emerald-400">Text, Vision, Code, Workflow</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kiến Trúc & Bảo Mật</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Bảo mật Khóa API:</span>
              <span className="text-emerald-400 font-medium">100% Server Proxy (Strict)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Phương thức Chat:</span>
              <span className="text-slate-200">Server-Sent Events (SSE Stream)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Giới hạn tải file:</span>
              <span className="text-slate-200">30 MB Base64 payload</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Telemetry Agent:</span>
              <span className="text-slate-200">aistudio-build</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Tình Trạng Endpoints</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-300">POST /api/chat</span>
              <span className="text-emerald-400 text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                STREAMING
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-300">POST /api/generate</span>
              <span className="text-cyan-400 text-[11px] bg-cyan-500/10 px-1.5 py-0.5 rounded">
                SYNC
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-300">POST /api/vision</span>
              <span className="text-purple-400 text-[11px] bg-purple-500/10 px-1.5 py-0.5 rounded">
                MULTIMODAL
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300">POST /api/pipeline</span>
              <span className="text-amber-400 text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded">
                AGENT-CHAIN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Request Log Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Nhật Ký Truy Vấn Gần Nhất (Live API Logs)</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Lưu tối đa 20 yêu cầu gần nhất
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Thời gian</th>
                <th className="py-2.5 px-4 font-medium">Endpoint</th>
                <th className="py-2.5 px-4 font-medium">Trạng thái</th>
                <th className="py-2.5 px-4 font-medium">Độ trễ</th>
                <th className="py-2.5 px-4 font-medium">Ký tự sinh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {metrics?.logs && metrics.logs.length > 0 ? (
                metrics.logs.map((log: MetricLog) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5 px-4 font-semibold text-cyan-300">{log.endpoint}</td>
                    <td className="py-2.5 px-4">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>200 OK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ERROR</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{log.latencyMs}ms</td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {log.charsGenerated ? `${log.charsGenerated.toLocaleString()} ký tự` : '--'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    Chưa có nhật ký truy vấn. Hãy thực hiện một thao tác ở các tab trên để quan sát dữ liệu trực tiếp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
