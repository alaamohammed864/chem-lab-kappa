import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { offlineSyncService, SyncStatus } from '../../services/offlineSyncService';

interface OfflineSyncIndicatorProps {
  className?: string;
  compact?: boolean;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({
  className = '',
  compact = false,
}) => {
  const [status, setStatus] = useState<SyncStatus>(offlineSyncService.getStatus());
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    offlineSyncService.syncPendingQueue();
  };

  const statusConfig = {
    online: {
      label: 'Online',
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60',
      dotClass: 'bg-emerald-400',
      icon: CheckCircle2,
      desc: 'Connected to network. Local cache synchronized.',
    },
    offline: {
      label: 'Offline',
      badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800/80 hover:bg-amber-900/60',
      dotClass: 'bg-amber-400',
      icon: WifiOff,
      desc: 'Offline mode active. Using local IndexedDB cache and calculation engines.',
    },
    syncing: {
      label: 'Syncing...',
      badgeClass: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/60',
      dotClass: 'bg-cyan-400 animate-ping',
      icon: RefreshCw,
      desc: 'Synchronizing local lab records and research notes with remote storage.',
    },
    error: {
      label: 'Sync Error',
      badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-800/80 hover:bg-rose-900/60',
      dotClass: 'bg-rose-400',
      icon: AlertCircle,
      desc: 'Network synchronization interrupted. Click to retry synchronization.',
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        id="offline-sync-status-indicator"
        aria-live="polite"
        aria-label={`Network status: ${statusConfig.label}. ${statusConfig.desc}`}
        onClick={handleManualSync}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onFocus={() => setTooltipOpen(true)}
        onBlur={() => setTooltipOpen(false)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 ${statusConfig.badgeClass}`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.dotClass}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dotClass.replace(' animate-ping', '')}`} />
        </span>
        <Icon className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin' : ''}`} />
        {!compact && (
          <span className="font-semibold tracking-wide capitalize text-[11px]">
            {statusConfig.label}
          </span>
        )}
      </button>

      {/* Accessible Tooltip Popover */}
      {tooltipOpen && (
        <div
          role="tooltip"
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-56 p-2.5 rounded-lg bg-[#0c1624] border border-[#1e344e] shadow-xl text-left pointer-events-none"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass.replace(' animate-ping', '')}`} />
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              {statusConfig.label} Status
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {statusConfig.desc}
          </p>
          {status === 'offline' && (
            <p className="text-[10px] text-amber-400/90 mt-1 font-mono">
              Note: Offline engines handle all stoichiometry, XRD & NDT calculations locally.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
