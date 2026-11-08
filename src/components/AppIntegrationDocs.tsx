import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Smartphone, 
  Globe, 
  FileCode, 
  BookOpen, 
  Key, 
  Layers,
  ShieldCheck,
  Server
} from 'lucide-react';

interface AppIntegrationDocsProps {
  currentKey?: string;
}

export const AppIntegrationDocs: React.FC<AppIntegrationDocsProps> = ({ currentKey }) => {
  const [selectedKey, setSelectedKey] = useState(currentKey || 'nx_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [activeLang, setActiveLang] = useState<'flutter' | 'js' | 'python' | 'curl' | 'kotlin'>('flutter');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.app';

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Code snippets by language
  const snippets: Record<string, { label: string; icon: any; code: string; ext: string }> = {
    flutter: {
      label: 'Flutter (Dart)',
      icon: Smartphone,
      ext: 'dart',
      code: `// Tích hợp NexusAI vào ứng dụng Flutter (Android & iOS)
// Thêm package 'http: ^1.2.0' vào pubspec.yaml

import 'dart:convert';
import 'package:http/http.dart' as http;

class NexusAiService {
  final String apiKey = '${selectedKey}';
  final String baseUrl = '${baseUrl}';

  // 1. Kiểm tra tính hợp lệ và hạn mức của Key
  Future<Map<String, dynamic>> verifyKey() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/verify'),
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Key không hợp lệ hoặc đã hết hạn');
    }
  }

  // 2. Gửi tin nhắn trò chuyện AI (Chat)
  Future<String> sendChatMessage(String userMessage) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/chat'),
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'messages': [
          {'role': 'user', 'content': userMessage}
        ],
        'systemInstruction': 'Bạn là trợ lý AI thông minh trong ứng dụng di động.',
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final remainingQuota = response.headers['x-ratelimit-remaining'];
      print('Hạn mức còn lại của user: $remainingQuota');
      return data['response'];
    } else {
      throw Exception('Lỗi gọi API: \${response.body}');
    }
  }
}`,
    },
    js: {
      label: 'JavaScript / React Native',
      icon: Globe,
      ext: 'javascript',
      code: `// Tích hợp NexusAI vào Web / Node.js / React Native
const API_KEY = '${selectedKey}';
const BASE_URL = '${baseUrl}';

// 1. Gửi tin nhắn tới AI Chatbot
async function callNexusChat(message) {
  try {
    const res = await fetch(\`\${BASE_URL}/api/v1/chat\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY, // Hoặc 'Authorization': \`Bearer \${API_KEY}\`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        systemInstruction: 'Bạn là trợ lý AI hữu ích.',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Lỗi gọi API');
    }

    const data = await res.json();
    console.log('AI Trả lời:', data.response);
    console.log('Số lượt còn lại:', res.headers.get('x-ratelimit-remaining'));
    return data.response;
  } catch (error) {
    console.error('Lỗi tích hợp:', error);
  }
}

// 2. Sinh văn bản nhanh
async function generateText(prompt) {
  const res = await fetch(\`\${BASE_URL}/api/v1/generate\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data.text;
}`,
    },
    python: {
      label: 'Python (App / Bot)',
      icon: FileCode,
      ext: 'python',
      code: `# Tích hợp NexusAI trong Python (Script, Telegram Bot, FastAPI)
# Cài đặt: pip install requests

import requests

API_KEY = "${selectedKey}"
BASE_URL = "${baseUrl}"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# 1. Kiểm tra trạng thái Key
def check_key():
    r = requests.get(f"{BASE_URL}/api/v1/verify", headers=headers)
    print("Trạng thái Key:", r.json())

# 2. Gửi yêu cầu Chat
def ask_ai(prompt):
    payload = {
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "systemInstruction": "Bạn là chuyên gia tư vấn công nghệ."
    }
    r = requests.post(f"{BASE_URL}/api/v1/chat", headers=headers, json=payload)
    if r.status_code == 200:
        data = r.json()
        print(f"Hạn mức còn lại: {r.headers.get('X-RateLimit-Remaining')}")
        return data.get("response")
    else:
        print("Lỗi:", r.text)

if __name__ == "__main__":
    check_key()
    reply = ask_ai("Xin chào, hãy giới thiệu ngắn gọn về hệ thống của bạn!")
    print("AI:", reply)`,
    },
    curl: {
      label: 'cURL (Terminal / Shell)',
      icon: Terminal,
      ext: 'bash',
      code: `# 1. Kiểm tra tính hợp lệ của API Key
curl -X GET "${baseUrl}/api/v1/verify" \\
  -H "x-api-key: ${selectedKey}"

# 2. Gọi Chat API bằng cURL
curl -X POST "${baseUrl}/api/v1/chat" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${selectedKey}" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Tóm tắt ưu điểm của mô hình Gemini 3.8 Flash"}
    ]
  }'

# 3. Gọi Text Completion
curl -X POST "${baseUrl}/api/v1/generate" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${selectedKey}" \\
  -d '{"prompt": "Viết 1 câu slogan sáng tạo cho ứng dụng du lịch"}'`,
    },
    kotlin: {
      label: 'Android (Kotlin)',
      icon: Smartphone,
      ext: 'kotlin',
      code: `// Tích hợp trong Android Native với OkHttp
// dependency: implementation("com.squareup.okhttp3:okhttp:4.12.0")

import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

val client = OkHttpClient()
val JSON = "application/json; charset=utf-8".toMediaType()

fun sendAiChat(userText: String, onResponse: (String) -> Unit) {
    val json = JSONObject().apply {
        put("messages", org.json.JSONArray().apply {
            put(JSONObject().apply {
                put("role", "user")
                put("content", userText)
            })
        })
    }

    val request = Request.Builder()
        .url("${baseUrl}/api/v1/chat")
        .addHeader("x-api-key", "${selectedKey}")
        .post(json.toString().toRequestBody(JSON))
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: java.io.IOException) {
            e.printStackTrace()
        }
        override fun onResponse(call: Call, response: Response) {
            val body = response.body?.string()
            val remaining = response.header("X-RateLimit-Remaining")
            // Parse JSON response...
        }
    })
}`,
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Tài Liệu Hướng Dẫn Tích Hợp API Vào Ứng Dụng (App SDK & API Docs)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy-paste mã nguồn chuẩn mực để kết nối ứng dụng di động hoặc web của bạn với NexusAI API.
            </p>
          </div>

          {/* Key selector input */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <Key className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 font-medium">Khóa của bạn:</span>
            <input
              type="text"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              placeholder="Dán key nx_live_... vào đây"
              className="bg-transparent text-xs text-cyan-300 font-mono focus:outline-none w-56 truncate"
            />
          </div>
        </div>
      </div>

      {/* API Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Phương thức Xác thực</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gửi khóa qua header <code className="text-cyan-300 font-mono">x-api-key: nx_live_...</code> hoặc <code className="text-cyan-300 font-mono">Authorization: Bearer nx_live_...</code>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Độ bảo mật & Hạn mức</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hệ thống tự động trừ 1 quota mỗi lượt gọi và trả về số lượt còn lại qua header <code className="text-cyan-300 font-mono">X-RateLimit-Remaining</code>.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Động cơ AI Phía Sau</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mọi yêu cầu đều được backend xử lý an toàn qua mô hình <strong className="text-slate-200">Gemini 3.8 Flash</strong>, không cần cấu hình thêm API key nào khác trên App.
          </p>
        </div>
      </div>

      {/* Language Tabs & Code Viewer */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
        {/* Languages Tab Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {Object.entries(snippets).map(([key, item]) => {
              const Icon = item.icon;
              const isSelected = activeLang === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveLang(key as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => copyCode(activeLang, snippets[activeLang].code)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copiedIndex === activeLang ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Block */}
        <div className="p-4 bg-slate-950 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-cyan-200 leading-relaxed select-all">
            <code>{snippets[activeLang].code}</code>
          </pre>
        </div>
      </div>

      {/* HTTP Status Reference */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Mã phản hồi HTTP chuẩn (Status Codes):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30">
            <span className="font-mono font-bold text-emerald-400">200 OK</span>
            <p className="text-slate-400 text-[11px] mt-0.5">Xác thực thành công và trả về dữ liệu AI.</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-amber-500/30">
            <span className="font-mono font-bold text-amber-400">401 Unauthorized</span>
            <p className="text-slate-400 text-[11px] mt-0.5">Thiếu API key hoặc key không tồn tại.</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-rose-500/30">
            <span className="font-mono font-bold text-rose-400">403 Forbidden</span>
            <p className="text-slate-400 text-[11px] mt-0.5">Key đã hết hạn hoặc bị thu hồi.</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30">
            <span className="font-mono font-bold text-purple-400">429 Rate Limit</span>
            <p className="text-slate-400 text-[11px] mt-0.5">Đã dùng hết số lượt request (Quota).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
