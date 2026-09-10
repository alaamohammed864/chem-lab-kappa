// Experiment Selection Bar & Picker
import React from 'react';
import { ExperimentMetadata } from '../../engines/simulation';
import {
  FlaskConical,
  Flame,
  Activity,
  Wind,
  Layers,
  ChevronDown,
  Clock,
  Award,
  ShieldCheck,
} from 'lucide-react';

interface ExperimentSelectorProps {
  experiments: ExperimentMetadata[];
  selectedExperimentId: string;
  onSelectExperiment: (id: string) => void;
  onOpenSafetyAdvisory: () => void;
  isArabic?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'acid-base-titration': <FlaskConical className="w-4 h-4 text-pink-400" />,
  'solution-calorimetry': <Flame className="w-4 h-4 text-orange-400" />,
  'chemical-kinetics': <Activity className="w-4 h-4 text-purple-400" />,
  'gas-laws-pvt': <Wind className="w-4 h-4 text-cyan-400" />,
  'spectrophotometry-beer-lambert': <Layers className="w-4 h-4 text-emerald-400" />,
};

export const ExperimentSelector: React.FC<ExperimentSelectorProps> = ({
  experiments,
  selectedExperimentId,
  onSelectExperiment,
  onOpenSafetyAdvisory,
  isArabic = false,
}) => {
  const currentExp = experiments.find((e) => e.id === selectedExperimentId) || experiments[0];

  return (
    <div className="w-full bg-[#0d1622] border-b border-[#18293d] p-3 space-y-3">
      {/* Top Bar with Experiment Tabs & Safety Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Horizontal Experiment Scrollable Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {experiments.map((exp) => {
            const isSelected = exp.id === selectedExperimentId;
            return (
              <button
                key={exp.id}
                onClick={() => onSelectExperiment(exp.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-[#121f2d] text-slate-400 hover:text-slate-200 hover:bg-[#162738] border border-transparent'
                }`}
              >
                {CATEGORY_ICONS[exp.id] || <FlaskConical className="w-3.5 h-3.5" />}
                <span>{isArabic ? exp.titleAr : exp.title.split('&')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Safety & Educational Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSafetyAdvisory}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[11px] hover:bg-emerald-900/60 transition cursor-pointer"
            title="View Educational Laboratory Safety Guidelines"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isArabic ? 'إرشادات السلامة المخبرية' : 'Lab Safety Guidelines'}</span>
          </button>
        </div>
      </div>

      {/* Active Experiment Header Summary Card */}
      {currentExp && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#09111a] border border-[#142334] text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">
                {isArabic ? currentExp.titleAr : currentExp.title}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                {currentExp.category}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] line-clamp-1">
              {isArabic ? currentExp.summaryAr : currentExp.summary}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0 font-mono">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              {currentExp.difficulty}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              ~{currentExp.durationMinutes} min
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
