export type AppTab = 'get-key' | 'script-simulator' | 'key-manager' | 'lua-integration';

export type KeyTier = 'free_24h' | 'free_48h' | 'vip_30d' | 'lifetime_vip';

export interface HubKeyRecord {
  id: string;
  key: string; // Định dạng ABYSS-[RANDOM]
  hubName: string; // Abysslix Hub
  hwid: string; // Hardware ID / Device identifier
  tier: KeyTier;
  tierName: string;
  durationHours: number; // 24, 48, 720 (30d), -1 (lifetime)
  status: 'active' | 'expired' | 'banned';
  createdAt: string;
  expiresAt: string; // ISO string or 'never'
  ipAddress?: string;
  lastCheckedAt?: string;
}

export interface HubStats {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  bannedKeys: number;
  totalVerifications: number;
}

// Backwards compatibility types
export type KeyPlan = 'trial_24h' | 'weekly_7d' | 'monthly_30d' | 'vip_pro' | 'lifetime';
export type KeyStatus = 'unused' | 'activated' | 'expired' | 'banned';

export interface ActivatedDevice {
  deviceId: string;
  deviceName: string;
  activatedAt: string;
  lastPingAt: string;
}

export interface AppLicenseKey {
  id: string;
  licenseKey: string;
  plan: KeyPlan;
  planName: string;
  durationDays: number;
  maxDevices: number;
  activatedDevices: ActivatedDevice[];
  status: KeyStatus;
  createdAt: string;
  expiresAt: string;
  activatedAt?: string;
  note?: string;
}

export interface ApiKeyRecord {
  id: string;
  key: string;
  name: string;
  tier: 'starter' | 'developer' | 'unlimited';
  totalQuota: number;
  usedQuota: number;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt: string;
  lastUsedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  durationMs?: number;
  thinkingLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MetricLog {
  id: string;
  timestamp: string;
  endpoint: string;
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  charsGenerated?: number;
}

export interface SystemMetrics {
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  successRate: number;
  avgLatencyMs: number;
  uptimeSeconds: number;
  model: string;
  logs: MetricLog[];
}

export interface PipelineStep {
  id: string;
  title: string;
  description: string;
  promptTemplate: string;
  systemInstruction?: string;
}

export interface PipelineResultStep {
  id: string;
  title: string;
  input: string;
  output: string;
  durationMs: number;
}
