'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { serverStatusService } from '../lib/services/serverStatusService';

export const ServerDownScreen: React.FC = () => {
  const [isDown, setIsDown] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Initial health check on mount
    serverStatusService.checkHealth();

    // Subscribe to status changes
    const unsubscribe = serverStatusService.subscribe((down) => {
      setIsDown(down);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualRetry = async () => {
    setIsChecking(true);
    await serverStatusService.checkHealth();
    setIsChecking(false);
  };

  if (!isDown) {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="server-error-title"
      className="fixed inset-0 z-[999999] bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 select-none"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-10 text-center shadow-2xl space-y-6">
        {/* Simple Minimal Icon - No Fancy Lights */}
        <div className="mx-auto w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
          <AlertCircle className="w-7 h-7 text-zinc-300" strokeWidth={1.75} />
        </div>

        {/* Clean, Simple Message as requested */}
        <div className="space-y-2">
          <h1
            id="server-error-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans"
          >
            Uh oh! Something is wrong
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Please check after some time.
          </p>
        </div>

        {/* Notice that purchasing is disabled during server downtime */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-400">
          Store services and purchasing are temporarily disabled while our server is unavailable.
        </div>

        {/* Simple Solid Action Button */}
        <div className="pt-2">
          <button
            onClick={handleManualRetry}
            disabled={isChecking}
            className="w-full py-3 px-5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs tracking-wider uppercase rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Server...' : 'Check Again'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
