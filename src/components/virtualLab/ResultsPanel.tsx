// Laboratory Results & Analytical Findings Panel
import React from 'react';
import { Award, CheckCircle, AlertCircle, FileText, ArrowUpRight } from 'lucide-react';
import { SimulationResultItem } from '../../engines/simulation';

interface ResultsPanelProps {
  results: SimulationResultItem[];
  isComplete: boolean;
  isArabic?: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results,
  isComplete,
  isArabic = false,
}) => {
  return (
    <div className="w-full bg-[#0d1622] border border-[#18293d] rounded-xl p-3.5 space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-[#18293d] pb-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isArabic ? 'النتائج والتحليل الرياضي' : 'Analytical Results & Findings'}
          </h4>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
            isComplete
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
              : 'bg-[#132030] text-slate-400'
          }`}
        >
          {isComplete
            ? isArabic
              ? 'اكتمل التحليل'
              : 'Complete'
            : isArabic
            ? 'قيد الحساب'
            : 'In Progress'}
        </span>
      </div>

      {results.length === 0 ? (
        <div className="py-6 text-center text-slate-500 italic text-xs">
          {isArabic
            ? 'النتائج ستظهر تلقائيًا عند تقدم أو انتهاء المحاكاة.'
            : 'Analytical calculations will appear here as experimental milestones are achieved.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((item, idx) => {
            const hasError = typeof item.percentError === 'number';
            const isGoodAccuracy = hasError && (item.percentError as number) < 5;

            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#09111a] border border-[#142334] flex flex-col justify-between space-y-2 hover:border-[#1c334e] transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 font-medium">
                    <span>{isArabic && item.labelAr ? item.labelAr : item.label}</span>
                    {hasError && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isGoodAccuracy
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {item.percentError}% err
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-cyan-300">
                      {item.value}
                    </span>
                    {item.unit && (
                      <span className="text-xs text-slate-400 font-mono">
                        {item.unit}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-[10px] text-slate-400 pt-1 border-t border-[#121f2d]">
                  {item.expectedValue && (
                    <div className="flex justify-between font-mono">
                      <span>{isArabic ? 'القيمة المتوقعة:' : 'Expected:'}</span>
                      <span className="text-slate-300">{item.expectedValue} {item.unit}</span>
                    </div>
                  )}

                  {item.formulaUsed && (
                    <div className="font-mono text-slate-500 truncate" title={item.formulaUsed}>
                      {item.formulaUsed}
                    </div>
                  )}

                  {item.interpretation && (
                    <p className="text-slate-400 italic line-clamp-2">
                      {item.interpretation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
