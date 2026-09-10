import React, { useState } from 'react';
import { Plus, X, Boxes, Atom, Sparkles } from 'lucide-react';
import { ResearchNote } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (note: ResearchNote) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState('Advanced Metallurgy');
  const [targetMaterial, setTargetMaterial] = useState('Ti-6Al-4V');
  const [methodology, setMethodology] = useState('X-Ray Diffraction & Rietveld Refinement');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newNote: ResearchNote = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      subtitle: `${targetMaterial} / ${discipline}`,
      timestamp: 'Just now',
      category: 'research',
      statusColor: 'cyan',
      details: notes || `Investigating ${targetMaterial} using ${methodology}.`,
    };

    onCreateProject(newNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                New Research Project
              </h3>
              <p className="text-xs text-slate-400">Initialize a new experiment or material characterization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Microstructural Characterization of SLM Ti-6Al-4V"
              className="w-full mt-1 bg-[#070c13] border border-[#1d3148] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Discipline
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full mt-1 bg-[#070c13] border border-[#1d3148] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Advanced Metallurgy">Advanced Metallurgy</option>
                <option value="Nanomaterials & XRD">Nanomaterials & XRD</option>
                <option value="Corrosion Engineering">Corrosion Engineering</option>
                <option value="Electrochemistry">Electrochemistry</option>
                <option value="Polymers & Composites">Polymers & Composites</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Target Material
              </label>
              <input
                type="text"
                value={targetMaterial}
                onChange={(e) => setTargetMaterial(e.target.value)}
                placeholder="e.g. Inconel 718, 316L, SiC"
                className="w-full mt-1 bg-[#070c13] border border-[#1d3148] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Primary Characterization Methodology
            </label>
            <input
              type="text"
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              placeholder="e.g. XRD + SEM/EDS + Potentiodynamic Polarization"
              className="w-full mt-1 bg-[#070c13] border border-[#1d3148] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Hypothesis & Laboratory Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record experimental objectives, boundary conditions, and expected outcomes..."
              className="w-full mt-1 bg-[#070c13] border border-[#1d3148] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#142230]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold rounded-lg text-xs tracking-wide transition shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              Initialize Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
