// Real-Time Laboratory Observation Feed
import React, { useRef, useEffect } from 'react';
import { Eye, Bell, CheckCircle2, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { ObservationEvent } from '../../engines/simulation';

interface ObservationAreaProps {
  observations: ObservationEvent[];
  onClear?: () => void;
  isArabic?: boolean;
}

export const ObservationArea: React.FC<ObservationAreaProps> = ({
  observations,
  onClear,
  isArabic = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [observations.length]);

  return (
    <div className="w-full bg-[#0d1622] border border-[#18293d] rounded-xl p-3.5 space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-[#18293d] pb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isArabic ? 'سجل الملاحظات والظواهر المخبرية' : 'Observation Feed & Events'}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#132030] text-slate-400">
            {observations.length} {isArabic ? 'أحداث' : 'events'}
          </span>
          {onClear && observations.length > 0 && (
            <button
              onClick={onClear}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-[#152436] transition cursor-pointer"
              title="Clear Observation Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Events List */}
      <div
        ref={scrollRef}
        className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin text-xs"
      >
        {observations.length === 0 ? (
          <div className="py-6 text-center text-slate-500 italic">
            {isArabic ? 'لا توجد ملاحظات مسجلة بعد.' : 'No observations logged yet. Start the simulation to record events.'}
          </div>
        ) : (
          observations.map((obs, index) => {
            const isMilestone = obs.type === 'milestone';
            const isChange = obs.type === 'change';
            const isWarning = obs.type === 'warning';

            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 p-2 rounded-lg border transition ${
                  isMilestone
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : isChange
                    ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                    : isWarning
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-[#09111a] border-[#142334] text-slate-300'
                }`}
              >
                {/* Icon Indicator */}
                <div className="mt-0.5 shrink-0">
                  {isMilestone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {isChange && <Bell className="w-3.5 h-3.5 text-purple-400" />}
                  {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  {!isMilestone && !isChange && !isWarning && <Info className="w-3.5 h-3.5 text-cyan-400" />}
                </div>

                {/* Content & Time */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-500">
                      t = {obs.timestamp.toFixed(1)}s
                    </span>
                    {obs.visualCue && (
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: obs.visualCue }}
                        />
                        <span className="font-mono text-[9px] text-slate-400 uppercase">
                          {obs.visualCue}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed break-words">
                    {isArabic && obs.messageAr ? obs.messageAr : obs.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
