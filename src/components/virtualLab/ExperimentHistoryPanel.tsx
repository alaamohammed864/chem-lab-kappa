// Laboratory Experiment History & Run Archive
import React from 'react';
import { History, Clock, FileSpreadsheet, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export interface ExperimentRunRecord {
  runId: string;
  experimentId: string;
  experimentTitle: string;
  experimentTitleAr?: string;
  timestamp: number;
  durationSeconds: number;
  dataPointsCount: number;
  keyMetricLabel: string;
  keyMetricValue: string;
  params: Record<string, any>;
}

interface ExperimentHistoryPanelProps {
  history: ExperimentRunRecord[];
  onClearHistory?: () => void;
  onSelectRun?: (record: ExperimentRunRecord) => void;
  isArabic?: boolean;
}

export const ExperimentHistoryPanel: React.FC<ExperimentHistoryPanelProps> = ({
  history,
  onClearHistory,
  onSelectRun,
  isArabic = false,
}) => {
  return (
    <div className="w-full bg-[#0d1622] border border-[#18293d] rounded-xl p-3.5 space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-[#18293d] pb-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isArabic ? 'سجل التجارب السابقة والجلسات' : 'Experimental Run History'}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#132030] text-slate-400">
            {history.length} {isArabic ? 'تجارب محفوظة' : 'runs archived'}
          </span>
          {onClearHistory && history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-[#152436] transition cursor-pointer"
              title="Clear Run History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-6 text-center text-slate-500 italic text-xs">
          {isArabic
            ? 'لا توجد تجارب سابقة محفوظة في هذه الجلسة بعد.'
            : 'No past runs archived yet. Completed experimental simulations will be recorded here.'}
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
          {history.map((record) => (
            <div
              key={record.runId}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#09111a] border border-[#142334] hover:border-[#1c334e] transition text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {isArabic && record.experimentTitleAr ? record.experimentTitleAr : record.experimentTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span>{record.dataPointsCount} data points</span>
                  <span>t = {record.durationSeconds.toFixed(1)}s</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block">{record.keyMetricLabel}</span>
                  <span className="text-xs font-bold text-cyan-400">{record.keyMetricValue}</span>
                </div>

                {onSelectRun && (
                  <button
                    onClick={() => onSelectRun(record)}
                    className="p-1 rounded bg-[#132030] text-slate-400 hover:text-white transition cursor-pointer"
                    title="View Run Details"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
