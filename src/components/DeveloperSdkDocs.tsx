import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Smartphone, 
  Globe, 
  FileCode, 
  Laptop, 
  BookOpen, 
  Key, 
  Server, 
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface DeveloperSdkDocsProps {
  currentKey?: string;
}

export const DeveloperSdkDocs: React.FC<DeveloperSdkDocsProps> = ({ currentKey }) => {
  const [selectedKey, setSelectedKey] = useState(currentKey || 'VIP-8F92-K4M9-2026');
  const [activePlatform, setActivePlatform] = useState<'flutter' | 'reactnative' | 'csharp' | 'python' | 'kotlin'>('flutter');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.app';

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const platforms: Record<string, { label: string; icon: any; code: string }> = {
    flutter: {
      label: 'Flutter (Android & iOS)',
      icon: Smartphone,
      code: `// Tích hợp kiểm tra bản quyền vào App Flutter
// Thêm packages vào pubspec.yaml:
//   http: ^1.2.0
//   device_info_plus: ^10.1.0
//   shared_preferences: ^2.2.3

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:device_info_plus/device_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppLicenseService {
  static const String serverUrl = '${baseUrl}';

  // 1. Kích hoạt mã bản quyền khi người dùng nhập vào màn hình Cài đặt
  static Future<Map<String, dynamic>> activateKey(String licenseKey) async {
    final deviceInfo = DeviceInfoPlugin();
    String deviceId = 'unknown_device';
    String deviceName = 'Thiết bị di động';

    // Lấy HWID thực tế từ phần cứng máy
    try {
      final androidInfo = await deviceInfo.androidInfo;
      deviceId = androidInfo.id;
      deviceName = '\${androidInfo.brand} \${androidInfo.model}';
    } catch (_) {
      // Fallback iOS hoặc khác
    }

    final response = await http.post(
      Uri.parse('\$serverUrl/api/license/activate'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'licenseKey': licenseKey.trim().toUpperCase(),
        'deviceId': deviceId,
        'deviceName': deviceName,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['valid'] == true) {
      // Lưu lại key vào bộ nhớ máy
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('app_license_key', licenseKey);
      await prefs.setString('app_plan', data['planName']);
      return data;
    } else {
      throw Exception(data['error'] ?? 'Kích hoạt không thành công');
    }
  }

  // 2. Kiểm tra bản quyền mỗi khi người dùng mở App (Splash screen)
  static Future<bool> checkLicenseOnLaunch() async {
    final prefs = await SharedPreferences.getInstance();
    final savedKey = prefs.getString('app_license_key');
    if (savedKey == null) return false; // Chưa có key -> Chuyển sang màn hình nhập key

    final response = await http.post(
      Uri.parse('\$serverUrl/api/license/verify'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'licenseKey': savedKey}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['valid'] == true;
    }
    return false;
  }
}`,
    },
    reactnative: {
      label: 'React Native / Expo',
      icon: Globe,
      code: `// Tích hợp kiểm tra bản quyền vào App React Native / Expo
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';

const API_BASE = '${baseUrl}';

// 1. Kích hoạt khi người dùng nhập Key
export async function activateAppLicense(keyInput) {
  // Lấy định danh thiết bị độc nhất
  const deviceId = Application.getAndroidId() || 'device_id_uuid';

  const response = await fetch(\`\${API_BASE}/api/license/activate\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      licenseKey: keyInput.trim().toUpperCase(),
      deviceId: deviceId,
      deviceName: 'React Native Device',
    }),
  });

  const result = await response.json();
  if (response.ok && result.valid) {
    await AsyncStorage.setItem('LICENSE_KEY', keyInput);
    await AsyncStorage.setItem('PLAN_NAME', result.planName);
    return { success: true, message: result.message };
  } else {
    throw new Error(result.error || 'Mã không hợp lệ');
  }
}

// 2. Kiểm tra bản quyền khi khởi động app
export async function verifyLicense() {
  const key = await AsyncStorage.getItem('LICENSE_KEY');
  if (!key) return false;

  const res = await fetch(\`\${API_BASE}/api/license/verify\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey: key }),
  });
  const data = await res.json();
  return data.valid === true;
}`,
    },
    csharp: {
      label: 'C# / Unity / PC Tool (.NET)',
      icon: Laptop,
      code: `// Tích hợp bản quyền vào phần mềm PC (WinForms, WPF, Unity Game, Tool C#)
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class LicenseManager
{
    private static readonly HttpClient client = new HttpClient();
    private const string ServerUrl = "${baseUrl}/api/license";

    // 1. Hàm kích hoạt key
    public static async Task<bool> ActivateLicense(string key)
    {
        // Lấy Machine Name hoặc HWID của máy tính
        string deviceId = Environment.MachineName + "_" + Environment.UserName;

        var payload = new {
            licenseKey = key.Trim().ToUpper(),
            deviceId = deviceId,
            deviceName = Environment.MachineName
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"{ServerUrl}/activate", content);

        var responseString = await response.Content.ReadAsStringAsync();
        if (response.IsSuccessStatusCode)
        {
            Console.WriteLine("Kích hoạt bản quyền thành công: " + responseString);
            return true;
        }
        else
        {
            Console.WriteLine("Lỗi kích hoạt: " + responseString);
            return false;
        }
    }
}`,
    },
    python: {
      label: 'Python (Tool / Bot / Desktop App)',
      icon: FileCode,
      code: `# Tích hợp kích hoạt bản quyền vào Tool / App Python (PyQt, Tkinter, Script)
import requests
import uuid

SERVER_URL = "${baseUrl}/api/license"

def get_hwid():
    # Lấy địa chỉ MAC của card mạng làm HWID
    return hex(uuid.getnode())

def activate_license(license_key):
    payload = {
        "licenseKey": license_key.strip().upper(),
        "deviceId": get_hwid(),
        "deviceName": "Python Desktop Client"
    }
    
    r = requests.post(f"{SERVER_URL}/activate", json=payload)
    if r.status_code == 200:
        data = r.json()
        print(f"Kích hoạt thành công gói: {data['planName']}")
        print(f"Số ngày còn lại: {data['daysRemaining']}")
        return True
    else:
        print("Lỗi:", r.json().get('error'))
        return False

if __name__ == "__main__":
    test_key = "${selectedKey}"
    activate_license(test_key)`,
    },
    kotlin: {
      label: 'Android (Java / Kotlin)',
      icon: Smartphone,
      code: `// Tích hợp trong Android Studio (Kotlin Native)
import android.provider.Settings
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

fun activateAppLicense(context: android.content.Context, key: String) {
    val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
    val client = OkHttpClient()

    val json = JSONObject().apply {
        put("licenseKey", key.trim().uppercase())
        put("deviceId", androidId)
        put("deviceName", android.os.Build.MODEL)
    }

    val body = json.toString().toRequestBody("application/json".toMediaType())
    val request = Request.Builder()
        .url("${baseUrl}/api/license/activate")
        .post(body)
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: java.io.IOException) {
            // Xử lý lỗi mất mạng
        }
        override fun onResponse(call: Call, response: Response) {
            val resStr = response.body?.string()
            if (response.isSuccessful) {
                // Mở khóa ứng dụng và lưu vào SharedPreferences
            }
        }
    })
}`,
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Tài Liệu Hướng Dẫn Nhúng Code Vào Ứng Dụng (App Developer SDK)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cách kết nối ứng dụng di động (Flutter/React Native), phần mềm PC (C#/Python) với hệ thống xác thực bản quyền.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <Key className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 font-medium">Khóa mẫu:</span>
            <input
              type="text"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="bg-transparent text-xs text-cyan-300 font-mono font-bold focus:outline-none w-52 truncate uppercase"
            />
          </div>
        </div>
      </div>

      {/* 3 Step Integration Process */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono">1</span>
            <span>Khách Nhận Key Từ Web</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Người dùng vào website nhấn nhận key miễn phí (hoặc mua key), nhận chuỗi mã dạng <code className="text-cyan-300 font-mono">VIP-XXXX-XXXX</code>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono">2</span>
            <span>Nhập Vào App & Khóa HWID</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            App gọi endpoint <code className="text-emerald-300 font-mono">/api/license/activate</code> kèm Device ID. Server khóa máy và kích hoạt thời hạn.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono">3</span>
            <span>Kiểm Tra Tự Động Mỗi Khi Mở App</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mỗi lần người dùng mở app, app gửi <code className="text-purple-300 font-mono">/api/license/verify</code> để kiểm tra key có bị hết hạn hoặc bị ban hay không.
          </p>
        </div>
      </div>

      {/* Code Snippets Viewer */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
        {/* Language Tabs */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {Object.entries(platforms).map(([key, item]) => {
              const Icon = item.icon;
              const isSelected = activePlatform === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePlatform(key as any)}
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
            onClick={() => copyCode(activePlatform, platforms[activePlatform].code)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copiedId === activePlatform ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-cyan-200 leading-relaxed select-all">
            <code>{platforms[activePlatform].code}</code>
          </pre>
        </div>
      </div>

      {/* Endpoints Quick Reference */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Danh Sách API Endpoints Cho Ứng Dụng Khách:
        </h4>

        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-emerald-400 font-bold mr-2">POST</span>
              <span className="text-slate-200">{baseUrl}/api/license/activate</span>
            </div>
            <span className="text-slate-400 font-sans text-[11px]">
              Kích hoạt key lần đầu trên thiết bị người dùng
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-cyan-400 font-bold mr-2">POST</span>
              <span className="text-slate-200">{baseUrl}/api/license/verify</span>
            </div>
            <span className="text-slate-400 font-sans text-[11px]">
              Kiểm tra hạn dùng và trạng thái khóa mỗi khi mở app
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
