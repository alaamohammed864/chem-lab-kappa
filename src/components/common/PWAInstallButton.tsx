import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Install Alaa Chem Lab as Desktop or Mobile App"
        title="Install Offline App"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install on iPhone / iPad"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111f2e] hover:bg-[#16273a] text-slate-300 border border-[#1e344e] text-xs font-mono transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Install App</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-sm rounded-xl bg-[#0e1724] border border-[#1c334d] p-5 shadow-2xl text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 id="ios-install-title" className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation guide"
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                To install <strong>Alaa Chem Lab</strong> as a standalone application on iOS Safari:
              </p>
              <ol className="mt-2 text-xs text-slate-300 list-decimal list-inside space-y-1.5 font-mono">
                <li>Tap the <strong>Share</strong> button in the Safari toolbar</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                <li>Confirm by tapping <strong>Add</strong> in the top right</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 py-2 text-xs font-semibold text-white transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
