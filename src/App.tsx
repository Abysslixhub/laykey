/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HubKeyRecord } from './types';
import { Navbar } from './components/Navbar';
import { HubKeyPortal } from './components/HubKeyPortal';
import { CheckpointTaskView } from './components/CheckpointTaskView';
import { ModelInfoModal } from './components/ModelInfoModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'checkpoint'>('home');
  const [unlockToken, setUnlockToken] = useState<string | null>(() => {
    return localStorage.getItem('abyss_unlock_token');
  });
  const [isTaskCompleted, setIsTaskCompleted] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('abyss_unlock_token'));
  });
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [, setSelectedKey] = useState<string>('');

  useEffect(() => {
    // Check if user returned with query params like ?checkpoint=completed or ?token=...
    const params = new URLSearchParams(window.location.search);
    const paramToken = params.get('token') || params.get('unlockToken');
    if (paramToken) {
      setUnlockToken(paramToken);
      localStorage.setItem('abyss_unlock_token', paramToken);
      setIsTaskCompleted(true);
      setCurrentView('home');
    } else if (params.get('checkpoint') === 'completed') {
      setIsTaskCompleted(true);
      setCurrentView('home');
    }
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const end = performance.now();
          setLatencyMs(Math.round(end - start));
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch {
        setIsOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCompleteTask = (token: string) => {
    setUnlockToken(token);
    localStorage.setItem('abyss_unlock_token', token);
    setIsTaskCompleted(true);
    setCurrentView('home');
  };

  const handleResetTask = () => {
    setIsTaskCompleted(false);
    setUnlockToken(null);
    localStorage.removeItem('abyss_unlock_token');
    localStorage.removeItem('abyss_task_completed');
  };

  const handleKeyGenerated = (keyRecord: HubKeyRecord) => {
    setSelectedKey(keyRecord.key);
    // Invalidate local unlock token since server consumed it
    setUnlockToken(null);
    localStorage.removeItem('abyss_unlock_token');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        isOnline={isOnline}
        latencyMs={latencyMs}
        onOpenSpecs={() => setIsSpecsOpen(true)}
      />

      {/* Main Workspace Body - Switches between Get Key Portal and Checkpoint Mission */}
      <main className="flex-1 pb-10">
        {currentView === 'home' ? (
          <HubKeyPortal
            onKeyGenerated={handleKeyGenerated}
            onGoToTask={() => setCurrentView('checkpoint')}
            isTaskCompleted={isTaskCompleted}
            onResetTask={handleResetTask}
            unlockToken={unlockToken}
          />
        ) : (
          <CheckpointTaskView
            onCompleteTask={handleCompleteTask}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Mechanism & Specs Modal */}
      <ModelInfoModal isOpen={isSpecsOpen} onClose={() => setIsSpecsOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-3.5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/unnamed_93150696.png"
              alt="Logo"
              className="w-4 h-4 rounded object-cover"
            />
            <span className="font-semibold text-slate-300">Abysslix Hub • Hệ Thống Cấp Mã Key Chính Thức</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Key Format: ABYSS-[RANDOM] • Hỗ trợ trên mọi executor (Delta, Fluxus, Codex, Arceus X, Hydrogen...)
          </div>
        </div>
      </footer>
    </div>
  );
}
