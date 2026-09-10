import React from 'react';
import { ResearchNote, ViewMode } from '../types';
import { FileText, X, Calendar, Tag, ArrowRight } from 'lucide-react';

interface ResearchNoteDetailModalProps {
  note: ResearchNote | null;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const ResearchNoteDetailModal: React.FC<ResearchNoteDetailModalProps> = ({
  note,
  onClose,
  onNavigate,
}) => {
  if (!note) return null;

  const handleAction = () => {
    if (note.title.includes('XRD') || note.subtitle.includes('XRD')) {
      onNavigate('xrd-lab');
    } else if (note.title.includes('Material') || note.subtitle.includes('SiC')) {
      onNavigate('material-explorer');
    } else if (note.title.includes('Equation') || note.subtitle.includes('Fe')) {
      onNavigate('balance-equation');
    } else {
      onNavigate('dashboard');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Research Record Detail
              </h3>
              <p className="text-xs text-slate-400">Verified laboratory entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
              {note.category}
            </div>
            <h4 className="text-lg font-bold text-white font-sans">{note.title}</h4>
            <div className="text-slate-400">{note.subtitle}</div>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px] border-y border-[#142230] py-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Timestamp: {note.timestamp}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Status: Verified</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#0b141e] rounded-xl border border-[#172737] text-slate-200 font-sans text-xs leading-relaxed space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Experimental Log & Findings:
            </div>
            <p>{note.details || 'Standard analysis verified in scientific workspace.'}</p>
          </div>

          {/* Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition"
            >
              Close
            </button>
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs tracking-wide transition cursor-pointer"
            >
              <span>Inspect in Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
