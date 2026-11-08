import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Allow CORS for Roblox executors, Delta, Fluxus, Codex, Arceus X, etc.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-hwid, x-api-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- HUB KEYS DATA STORAGE ---
export type KeyTier = 'free_24h' | 'free_48h' | 'vip_30d' | 'lifetime_vip';

export interface HubKeyRecord {
  id: string;
  key: string; // Định dạng: ABYSS-[RANDOM]
  hubName: string;
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

const DATA_DIR = path.resolve(__dirname, 'data');
const KEYS_FILE = path.resolve(DATA_DIR, 'hub_keys.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let hubKeysDatabase: HubKeyRecord[] = [];

// Helper to generate key: Prefix 'ABYSS' followed by random characters chunks
function generateHubKey(prefix = 'ABYSS'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const genChunk = (len: number) => {
    let s = '';
    for (let i = 0; i < len; i++) {
      s += chars[crypto.randomInt(0, chars.length)];
    }
    return s;
  };

  const p = (prefix && prefix.trim() !== '') ? prefix.trim().toUpperCase() : 'ABYSS';
  const c1 = genChunk(5);
  const c2 = genChunk(5);
  const c3 = genChunk(4);
  return `${p}-${c1}-${c2}-${c3}`;
}

const CONFIG_FILE = path.resolve(DATA_DIR, 'shortlink_config.json');

export interface ShortlinkConfig {
  service: string;
  serviceName: string;
  taskUrl: string;
  minDurationSeconds: number;
  requireHumanCheck: boolean;
  antiBypassEnabled: boolean;
  notes?: string;
  updatedAt: string;
}

let shortlinkConfig: ShortlinkConfig = {
  service: 'linkvertise',
  serviceName: 'Linkvertise',
  taskUrl: 'https://linkvertise.com',
  minDurationSeconds: 10,
  requireHumanCheck: true,
  antiBypassEnabled: true,
  notes: 'Dán link rút gọn của bạn vào đây',
  updatedAt: new Date().toISOString(),
};

function loadShortlinkConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      shortlinkConfig = { ...shortlinkConfig, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Lỗi khi tải cấu hình shortlink:', err);
  }
}

function saveShortlinkConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(shortlinkConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lỗi khi lưu cấu hình shortlink:', err);
  }
}

loadShortlinkConfig();

// Anti-Bypass Ticket Store (In-Memory Cryptographic Validation)
interface CheckpointTicket {
  ticketId: string;
  ip: string;
  createdAt: number;
  minDurationSeconds: number;
  challengeAnswer?: string;
  status: 'pending' | 'verified' | 'used';
  unlockToken?: string;
  expiresAt: number;
}

const activeTickets = new Map<string, CheckpointTicket>();
const unlockTokens = new Map<string, { ticketId: string; ip: string; expiresAt: number }>();

// Cleanup stale tickets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, ticket] of activeTickets.entries()) {
    if (ticket.expiresAt < now) activeTickets.delete(id);
  }
  for (const [token, data] of unlockTokens.entries()) {
    if (data.expiresAt < now) unlockTokens.delete(token);
  }
}, 5 * 60 * 1000);

function loadHubKeys(): HubKeyRecord[] {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const data = fs.readFileSync(KEYS_FILE, 'utf-8');
      hubKeysDatabase = JSON.parse(data);
    } else {
      // Seed pre-created demo keys for Abysslix Hub
      hubKeysDatabase = [
        {
          id: 'k_' + crypto.randomBytes(4).toString('hex'),
          key: 'ABYSS-DEMO1-READY-2026',
          hubName: 'Abysslix Hub',
          hwid: 'HWID-9921-X812-FLUXUS',
          tier: 'free_24h',
          tierName: 'Key 24 Giờ (Free)',
          durationHours: 24,
          status: 'active',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          lastCheckedAt: new Date().toISOString(),
        },
        {
          id: 'k_' + crypto.randomBytes(4).toString('hex'),
          key: 'ABYSS-9M2KB-L78XZ-2026',
          hubName: 'Abysslix Hub',
          hwid: '',
          tier: 'free_24h',
          tierName: 'Key 24 Giờ (Chưa Bind HWID)',
          durationHours: 24,
          status: 'active',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'k_' + crypto.randomBytes(4).toString('hex'),
          key: 'ABYSS-VIP99-GOD77-GOLD',
          hubName: 'Abysslix Hub VIP',
          hwid: 'HWID-DELTA-PC-8812',
          tier: 'lifetime_vip',
          tierName: 'VIP Trọn Đời (Lifetime)',
          durationHours: -1,
          status: 'active',
          createdAt: new Date().toISOString(),
          expiresAt: 'never',
        },
      ];
      saveHubKeys();
    }
  } catch (err) {
    console.error('Lỗi khi đọc file hub_keys.json:', err);
    hubKeysDatabase = [];
  }
  return hubKeysDatabase;
}

function saveHubKeys() {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(hubKeysDatabase, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lỗi khi lưu file hub_keys.json:', err);
  }
}

loadHubKeys();

let totalVerificationsCount = 256;

// ==========================================
// API ROUTES FOR ABYSSLIX HUB KEY SYSTEM
// ==========================================

// 1. Health & Server Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Abysslix Hub Key System API',
    totalKeys: hubKeysDatabase.length,
    activeKeys: hubKeysDatabase.filter(k => k.status === 'active').length,
    timestamp: new Date().toISOString(),
  });
});

// 2. Get All Keys (Admin / Stats view)
app.get('/api/keys/list', (req, res) => {
  const activeCount = hubKeysDatabase.filter(k => k.status === 'active').length;
  const expiredCount = hubKeysDatabase.filter(k => k.status === 'expired').length;
  const bannedCount = hubKeysDatabase.filter(k => k.status === 'banned').length;

  res.json({
    success: true,
    keys: hubKeysDatabase,
    stats: {
      totalKeys: hubKeysDatabase.length,
      activeKeys: activeCount,
      expiredKeys: expiredCount,
      bannedKeys: bannedCount,
      totalVerifications: totalVerificationsCount,
    },
  });
});

// --- SHORTLINK CONFIG & PRESETS ---
const SHORTLINK_PRESETS = [
  { id: 'linkvertise', name: 'Linkvertise', defaultUrl: 'https://linkvertise.com', tip: 'Mạng lưới trả tiền cao nhất cho traffic gaming/script' },
  { id: 'lootlabs', name: 'Lootlabs (LootLinks)', defaultUrl: 'https://loot-links.com', tip: 'Chuyên dụng cho Roblox script & exploit' },
  { id: 'traffic1s', name: 'Traffic1s', defaultUrl: 'https://traffic1s.com', tip: 'Phổ biến và thanh toán nhanh tại Việt Nam' },
  { id: 'megaurl', name: 'MegaURL', defaultUrl: 'https://megaurl.in', tip: 'Rút gọn link kiếm tiền Việt Nam' },
  { id: 'workink', name: 'Work.ink', defaultUrl: 'https://work.ink', tip: 'Rất thông dụng cho Roblox script executor' },
  { id: 'sub2unlock', name: 'Sub2Unlock', defaultUrl: 'https://sub2unlock.io', tip: 'Yêu cầu đăng ký kênh YouTube / tham gia Discord' },
  { id: 'custom', name: 'Link Tùy Chỉnh', defaultUrl: 'https://google.com', tip: 'Bất kỳ liên kết web nào của bạn' },
];

app.get('/api/checkpoint/config', (req, res) => {
  res.json({
    success: true,
    config: shortlinkConfig,
    presets: SHORTLINK_PRESETS,
  });
});

app.post('/api/checkpoint/config', (req, res) => {
  const { service, taskUrl, minDurationSeconds, requireHumanCheck, antiBypassEnabled, notes } = req.body;

  if (taskUrl !== undefined) shortlinkConfig.taskUrl = String(taskUrl).trim();
  if (service !== undefined) {
    shortlinkConfig.service = String(service);
    const found = SHORTLINK_PRESETS.find(p => p.id === service);
    shortlinkConfig.serviceName = found ? found.name : 'Tùy Chỉnh';
  }
  if (minDurationSeconds !== undefined) {
    shortlinkConfig.minDurationSeconds = Math.max(3, Math.min(120, Number(minDurationSeconds) || 10));
  }
  if (requireHumanCheck !== undefined) {
    shortlinkConfig.requireHumanCheck = Boolean(requireHumanCheck);
  }
  if (antiBypassEnabled !== undefined) {
    shortlinkConfig.antiBypassEnabled = Boolean(antiBypassEnabled);
  }
  if (notes !== undefined) {
    shortlinkConfig.notes = String(notes);
  }
  shortlinkConfig.updatedAt = new Date().toISOString();

  saveShortlinkConfig();

  res.json({
    success: true,
    message: 'Đã lưu cấu hình link rút gọn và cơ chế chống bypass!',
    config: shortlinkConfig,
  });
});

// --- ANTI-BYPASS CHECKPOINT FLOW ---
// Start a checkpoint session: returns ticketId and challenge
app.post('/api/checkpoint/start', (req, res) => {
  const ticketId = 'tk_' + crypto.randomBytes(16).toString('hex');
  const ip = req.ip || '127.0.0.1';

  // Generate lightweight anti-bot math challenge if enabled
  let challenge = undefined;
  let challengeAnswer = undefined;

  if (shortlinkConfig.requireHumanCheck) {
    const a = crypto.randomInt(2, 9);
    const b = crypto.randomInt(1, 9);
    challengeAnswer = String(a + b);
    challenge = {
      id: crypto.randomBytes(8).toString('hex'),
      question: `Xác minh bảo mật: ${a} + ${b} = ?`,
    };
  }

  const ticket: CheckpointTicket = {
    ticketId,
    ip,
    createdAt: Date.now(),
    minDurationSeconds: shortlinkConfig.minDurationSeconds,
    challengeAnswer,
    status: 'pending',
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  };

  activeTickets.set(ticketId, ticket);

  res.json({
    success: true,
    ticketId,
    taskUrl: shortlinkConfig.taskUrl,
    minDurationSeconds: shortlinkConfig.minDurationSeconds,
    challenge,
    antiBypassEnabled: shortlinkConfig.antiBypassEnabled,
  });
});

// Verify checkpoint: checks elapsed time and challenge answer to block bypass bots
app.post('/api/checkpoint/verify', (req, res) => {
  const { ticketId, challengeAnswer } = req.body;

  if (!ticketId || !activeTickets.has(ticketId)) {
    return res.status(400).json({
      success: false,
      error: 'Phiên nhiệm vụ không tồn tại hoặc đã hết hạn. Vui lòng làm lại nhiệm vụ!',
    });
  }

  const ticket = activeTickets.get(ticketId)!;

  if (ticket.status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: 'Phiên nhiệm vụ này đã được xác thực trước đó!',
    });
  }

  // 1. Anti-Fast-Bypass Detection: Server-side elapsed time check
  const now = Date.now();
  const elapsedSeconds = (now - ticket.createdAt) / 1000;
  const minRequired = ticket.minDurationSeconds - 0.7; // allow 700ms network variance

  if (shortlinkConfig.antiBypassEnabled && elapsedSeconds < minRequired) {
    // Malicious bypass bot called verify prematurely!
    activeTickets.delete(ticketId);
    return res.status(403).json({
      success: false,
      error: `Phát hiện Bypass / Gian lận! Bạn thao tác quá nhanh (${elapsedSeconds.toFixed(1)}s < ${ticket.minDurationSeconds}s). Vui lòng hoàn thành nhiệm vụ vượt link thực tế!`,
    });
  }

  // 2. Anti-bot challenge check
  if (shortlinkConfig.requireHumanCheck && ticket.challengeAnswer) {
    if (!challengeAnswer || String(challengeAnswer).trim() !== ticket.challengeAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Câu trả lời xác minh bảo mật không chính xác. Vui lòng kiểm tra lại!',
      });
    }
  }

  // 3. Issue single-use cryptographically signed Unlock Token
  const unlockToken = 'ABYSS-TOK-' + crypto.randomBytes(16).toString('hex').toUpperCase();
  ticket.status = 'verified';
  ticket.unlockToken = unlockToken;

  unlockTokens.set(unlockToken, {
    ticketId,
    ip: req.ip || '127.0.0.1',
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes to claim key
  });

  res.json({
    success: true,
    unlockToken,
    message: 'Xác minh vượt link thành công! Bạn có 10 phút để nhận mã key.',
  });
});

// 3. Generate / Claim Key for Abysslix Hub with Anti-Bypass Validation
app.post('/api/key/generate', (req, res) => {
  const { hubName = 'Abysslix Hub', hwid = '', tier = 'free_24h', prefix = 'ABYSS', unlockToken } = req.body;

  // STRICT ANTI-BYPASS ENFORCEMENT:
  if (shortlinkConfig.antiBypassEnabled) {
    if (!unlockToken || typeof unlockToken !== 'string') {
      return res.status(403).json({
        success: false,
        error: 'Chưa có token xác minh! Bạn bắt buộc phải hoàn thành nhiệm vụ vượt link để nhận key.',
      });
    }

    if (!unlockTokens.has(unlockToken)) {
      return res.status(403).json({
        success: false,
        error: 'Mã xác minh không hợp lệ hoặc đã được sử dụng! Vui lòng làm lại nhiệm vụ mới.',
      });
    }

    const tokenData = unlockTokens.get(unlockToken)!;
    if (tokenData.expiresAt < Date.now()) {
      unlockTokens.delete(unlockToken);
      return res.status(403).json({
        success: false,
        error: 'Mã xác minh đã hết hạn. Vui lòng hoàn thành lại nhiệm vụ!',
      });
    }

    // SINGLE-USE CONSUMPTION: invalidate token immediately to prevent replay attacks
    unlockTokens.delete(unlockToken);
    const associatedTicket = activeTickets.get(tokenData.ticketId);
    if (associatedTicket) {
      associatedTicket.status = 'used';
    }
  }

  let durationHours = 24;
  let tierName = 'Key 24 Giờ (Free)';
  if (tier === 'free_48h') {
    durationHours = 48;
    tierName = 'Key 48 Giờ';
  } else if (tier === 'vip_30d') {
    durationHours = 720;
    tierName = 'VIP 30 Ngày';
  } else if (tier === 'lifetime_vip') {
    durationHours = -1;
    tierName = 'VIP Trọn Đời';
  }

  // Ensure prefix is 'ABYSS' by default as requested
  const p = (prefix && prefix.trim() !== '') ? prefix.trim().toUpperCase() : 'ABYSS';
  const generatedKey = generateHubKey(p);

  let expiresAt = 'never';
  if (durationHours > 0) {
    expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
  }

  const newKey: HubKeyRecord = {
    id: 'k_' + crypto.randomBytes(6).toString('hex'),
    key: generatedKey,
    hubName: hubName || 'Abysslix Hub',
    hwid: (hwid && String(hwid).trim()) || 'ALL_EXECUTORS',
    tier: tier as KeyTier,
    tierName,
    durationHours,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt,
    ipAddress: req.ip || '127.0.0.1',
  };

  hubKeysDatabase.unshift(newKey);
  saveHubKeys();

  res.status(201).json({
    success: true,
    key: newKey,
    message: 'Tạo key Abysslix Hub thành công! Hãy dán vào script để mở khóa.',
  });
});

// 4. Batch Generate Keys
app.post('/api/keys/batch', (req, res) => {
  const { count = 10, prefix = 'ABYSS', hubName = 'Abysslix Hub', tier = 'free_24h' } = req.body;
  const num = Math.min(Math.max(Number(count) || 1, 1), 100);

  let durationHours = 24;
  let tierName = 'Key 24 Giờ';
  if (tier === 'free_48h') {
    durationHours = 48;
    tierName = 'Key 48 Giờ';
  } else if (tier === 'vip_30d') {
    durationHours = 720;
    tierName = 'VIP 30 Ngày';
  } else if (tier === 'lifetime_vip') {
    durationHours = -1;
    tierName = 'VIP Trọn Đời';
  }

  let expiresAt = 'never';
  if (durationHours > 0) {
    expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
  }

  const p = (prefix && prefix.trim() !== '') ? prefix.trim().toUpperCase() : 'ABYSS';
  const generated: HubKeyRecord[] = [];
  for (let i = 0; i < num; i++) {
    const k: HubKeyRecord = {
      id: 'k_' + crypto.randomBytes(6).toString('hex'),
      key: generateHubKey(p),
      hubName: hubName || 'Abysslix Hub',
      hwid: '',
      tier: tier as KeyTier,
      tierName,
      durationHours,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt,
    };
    generated.push(k);
    hubKeysDatabase.unshift(k);
  }

  saveHubKeys();

  res.status(201).json({
    success: true,
    count: generated.length,
    keys: generated,
    message: `Đã sinh thành công ${generated.length} mã key cho Abysslix Hub!`,
  });
});

// 5. KEY VERIFICATION ENDPOINT
// Supports both GET (for Lua game:HttpGet / request) and POST (for modern fetch/http)
const handleVerifyKey = (req: Request, res: Response) => {
  totalVerificationsCount++;
  const rawKey = req.method === 'GET' ? req.query.key : req.body.key;
  const rawHwid = req.method === 'GET' ? req.query.hwid : req.body.hwid;

  if (!rawKey || !String(rawKey).trim()) {
    return res.status(400).json({
      valid: false,
      status: 'error',
      message: 'Vui lòng cung cấp mã Key Abysslix Hub (Missing key parameter)',
    });
  }

  const cleanKey = String(rawKey).trim().toUpperCase();
  const cleanHwid = rawHwid ? String(rawHwid).trim() : '';

  const record = hubKeysDatabase.find(k => k.key.toUpperCase() === cleanKey);

  if (!record) {
    return res.status(404).json({
      valid: false,
      status: 'invalid',
      message: 'Key Abysslix Hub không tồn tại hoặc đã nhập sai! Vui lòng lấy key tại website.',
    });
  }

  // Check if banned
  if (record.status === 'banned') {
    return res.status(403).json({
      valid: false,
      status: 'banned',
      message: 'Key này đã bị cấm / blacklist khỏi Abysslix Hub!',
    });
  }

  // Check if expired
  if (record.expiresAt !== 'never' && new Date(record.expiresAt).getTime() < Date.now()) {
    record.status = 'expired';
    saveHubKeys();
    return res.status(403).json({
      valid: false,
      status: 'expired',
      message: 'Key Abysslix Hub đã hết hạn sử dụng! Vui lòng quay lại website lấy key mới.',
      expiresAt: record.expiresAt,
    });
  }

  // HWID Verification & Binding
  if (cleanHwid) {
    if (!record.hwid || record.hwid === '') {
      // First time using: Bind this key to user's HWID
      record.hwid = cleanHwid;
      record.lastCheckedAt = new Date().toISOString();
      saveHubKeys();
    } else if (record.hwid !== cleanHwid) {
      // Key is bound to a different HWID
      return res.status(403).json({
        valid: false,
        status: 'hwid_mismatch',
        message: 'Key này đã được liên kết với một thiết bị khác (HWID mismatch)! Không thể dùng chung.',
        boundHwid: record.hwid.slice(0, 8) + '••••••••',
      });
    }
  }

  record.lastCheckedAt = new Date().toISOString();
  saveHubKeys();

  // Compute time remaining
  let timeRemainingFormatted = 'Vĩnh viễn';
  if (record.expiresAt !== 'never') {
    const diffMs = new Date(record.expiresAt).getTime() - Date.now();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    timeRemainingFormatted = `${hours} giờ ${mins} phút`;
  }

  res.json({
    valid: true,
    status: 'success',
    key: record.key,
    hub: record.hubName,
    tier: record.tierName,
    expiresAt: record.expiresAt,
    timeRemaining: timeRemainingFormatted,
    hwidBound: Boolean(record.hwid),
    message: `Xác thực Key thành công! Chào mừng bạn đến với Abysslix Hub.`,
  });
};

app.get('/api/key/verify', handleVerifyKey);
app.post('/api/key/verify', handleVerifyKey);
app.get('/api/check-key', handleVerifyKey);
app.post('/api/check-key', handleVerifyKey);

// 6. Reset HWID
app.post('/api/keys/:id/reset-hwid', (req, res) => {
  const { id } = req.params;
  const record = hubKeysDatabase.find(k => k.id === id);

  if (!record) {
    return res.status(404).json({ error: 'Không tìm thấy key' });
  }

  record.hwid = '';
  saveHubKeys();

  res.json({ success: true, message: 'Đã xóa liên kết HWID! Key có thể kích hoạt trên executor mới.' });
});

// 7. Toggle Ban
app.post('/api/keys/:id/toggle-ban', (req, res) => {
  const { id } = req.params;
  const record = hubKeysDatabase.find(k => k.id === id);

  if (!record) {
    return res.status(404).json({ error: 'Không tìm thấy key' });
  }

  record.status = record.status === 'banned' ? 'active' : 'banned';
  saveHubKeys();

  res.json({ success: true, status: record.status, message: 'Cập nhật trạng thái thành công' });
});

// 8. Delete Key
app.delete('/api/keys/:id', (req, res) => {
  const { id } = req.params;
  const idx = hubKeysDatabase.findIndex(k => k.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Không tìm thấy key' });
  }

  hubKeysDatabase.splice(idx, 1);
  saveHubKeys();

  res.json({ success: true, message: 'Đã xóa key khỏi hệ thống' });
});

// Vite middleware for dev / static serve for prod
async function setupViteOrStatic() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  app.listen(PORT, () => {
    console.log(`Abysslix Hub Key Server running on http://localhost:${PORT}`);
  });
});
