import React, { useState } from 'react';
import { ViewMode, ResearchNote } from '../types';
import {
  Plus,
  Table,
  Calculator,
  FlaskConical,
  Boxes,
  Sparkles,
  TrendingUp,
  ChevronRight,
  MoreVertical,
  Atom,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  onSelectView: (view: ViewMode) => void;
  onOpenNewProject: () => void;
  researchNotes: ResearchNote[];
  onOpenNoteDetail: (note: ResearchNote) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectView,
  onOpenNewProject,
  researchNotes,
  onOpenNoteDetail,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  return (
    <main
      id="dashboard-main-view"
      className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6 pb-24 lg:pb-12"
    >
      {/* Greeting & Project Action */}
      <section
        id="greeting-section"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-cyan-400 font-semibold">
            OVERVIEW / 09 SEP 2026
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Good morning, Engineer
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Your scientific workspace is ready.
          </p>
        </div>

        <div>
          <button
            id="btn-new-research-project"
            onClick={onOpenNewProject}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-semibold px-4 py-2.5 rounded-xl sm:rounded-lg text-xs tracking-wide transition shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New research project</span>
          </button>
        </div>
      </section>

      {/* Hero Showcase Banner */}
      <section
        id="hero-banner-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111927] to-[#0c121e] border border-slate-800/90 hero-gradient p-5 sm:p-7 md:p-8 shadow-xl"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Operational Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-cyan-300 font-semibold">
                WORKSPACE STATUS OPERATIONAL
              </span>
            </div>

            {/* Main Headline */}
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Build knowledge from every <br className="hidden sm:inline" />
              <span className="italic font-serif text-cyan-400 underline decoration-cyan-500/30 decoration-2 underline-offset-4">
                experiment.
              </span>
            </h3>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-slate-300/90 max-w-xl leading-relaxed">
              Explore chemistry, materials science and engineering analysis from a single, focused workstation.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="btn-explore-elements"
                onClick={() => onSelectView('periodic-table')}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-semibold px-4 py-2 rounded-xl sm:rounded-md text-xs transition active:scale-95 shadow-sm cursor-pointer"
              >
                <Table className="w-4 h-4 text-slate-900" />
                <span>Explore elements</span>
              </button>

              <button
                id="btn-open-ai-assistant"
                onClick={() => onSelectView('ai-assistant')}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium py-2 px-1 transition group cursor-pointer"
              >
                <span>Open AI assistant</span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          {/* Right: Orbital Atom Visual (Iron Fe 26) */}
          <div className="lg:col-span-5 flex items-center justify-center relative min-h-[190px]">
            <div className="relative w-56 sm:w-64 h-48 flex items-center justify-center">
              {/* Elliptical Orbits */}
              <div className="absolute inset-0 border border-cyan-500/25 rounded-full rotate-45 scale-y-50 animate-orbit"></div>
              <div className="absolute inset-0 border border-slate-600/30 rounded-full -rotate-45 scale-y-50 animate-orbit-rev"></div>
              <div className="absolute inset-0 border border-purple-500/25 rounded-full rotate-12 scale-y-[0.35]"></div>

              {/* Floating Data Tags */}
              <div className="absolute top-2 right-4 bg-slate-900/90 border border-cyan-500/30 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-300 shadow flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>26.98</span>
              </div>
              <div className="absolute bottom-4 left-3 bg-slate-900/90 border border-purple-500/30 px-2 py-0.5 rounded text-[9px] font-mono text-purple-300 shadow flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>2.2 eV</span>
              </div>

              {/* Satellite Particles */}
              <div className="absolute top-7 right-12 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d2ff]"></div>
              <div className="absolute bottom-9 left-14 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]"></div>

              {/* Central Fe 26 Nucleus */}
              <div
                onClick={() => onSelectView('periodic-table')}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-400 to-sky-200 p-[2px] shadow-xl glow-element-fe animate-pulse-glow z-10 flex items-center justify-center cursor-pointer transition hover:scale-105"
                title="Iron (Fe) - Atomic Number 26"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#38e1e7] to-[#00f2fe] flex flex-col items-center justify-center text-slate-950 font-bold">
                  <span className="text-base font-black tracking-tight leading-none">Fe</span>
                  <span className="text-[9px] font-mono font-bold leading-none mt-0.5">26</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Tools Grid */}
      <section id="quick-access-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              QUICK ACCESS
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Start with a tool
            </h3>
          </div>
          <button
            onClick={() => onSelectView('periodic-table')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View all tools</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-col on mobile, 3-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Virtual Laboratory (New) */}
          <div
            id="tool-virtual-lab"
            onClick={() => onSelectView('virtual-lab')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition shrink-0">
                <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition truncate">
                    Virtual Laboratory
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    NEW
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">5-engine simulation suite</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* Periodic Table */}
          <div
            id="tool-periodic-table"
            onClick={() => onSelectView('periodic-table')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-cyan-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition shrink-0">
                <Table className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition truncate">
                  Periodic Table
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Explore 118 elements</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* Molar Mass */}
          <div
            id="tool-molar-mass"
            onClick={() => onSelectView('molar-mass')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-indigo-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-[#1b1e3b] border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition shrink-0">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition truncate">
                  Molar Mass
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Calculate compounds</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* Balance Equation */}
          <div
            id="tool-balance-equation"
            onClick={() => onSelectView('balance-equation')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-emerald-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-[#112d31] border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition shrink-0">
                <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition truncate">
                  Balance Equation
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Solve reactions</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* Material Explorer */}
          <div
            id="tool-material-explorer"
            onClick={() => onSelectView('material-explorer')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-amber-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-[#2b2518] border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition shrink-0">
                <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition truncate">
                  Material Explorer
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Browse properties</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-amber-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* Crystal Structure */}
          <div
            id="tool-crystal-structure"
            onClick={() => onSelectView('crystal-structure')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-teal-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-[#132c38] border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-teal-300 transition truncate">
                  Crystal Structure
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Inspect unit cells</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-teal-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* Phase Diagrams */}
          <div
            id="tool-phase-diagrams"
            onClick={() => onSelectView('phase-diagrams')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-cyan-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-[#0f2736] border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition truncate">
                  Phase Diagrams
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Lever Rule & alloys</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* XRD Laboratory */}
          <div
            id="tool-xrd-lab"
            onClick={() => onSelectView('xrd-lab')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-purple-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-[#291e3b] border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 transition truncate">
                  XRD Laboratory
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Analyze diffraction</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-purple-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* Ion Explorer */}
          <div
            id="tool-ion-explorer"
            onClick={() => onSelectView('ion-explorer')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-blue-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-[#102038] border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition shrink-0">
                <Atom className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition truncate">
                  Ion Explorer
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Salts & oxidation</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-blue-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>

          {/* Molecule 3D Lab */}
          <div
            id="tool-molecule-lab"
            onClick={() => onSelectView('molecule-lab')}
            className="group p-3 sm:p-3.5 rounded-xl sm:rounded-lg bg-[#0e1824] border border-[#182a3c] hover:border-cyan-500/40 hover:bg-[#111f2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-md bg-[#0d2630] border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition shrink-0">
                <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition truncate">
                  Molecule 3D Lab
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">3D/2D visualizer</p>
              </div>
            </div>
            <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5 shrink-0" />
          </div>
        </div>
      </section>

      {/* Split Analytics: Recent Activity (Timeline) + Scientific Snapshot (Chart) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Activity Timeline (5 cols) */}
        <div
          id="recent-activity-card"
          className="lg:col-span-5 bg-[#0d1622] rounded-2xl sm:rounded-xl border border-[#172737] p-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-3">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  RECENT ACTIVITY
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">Research timeline</h4>
              </div>
              <button
                onClick={() => onSelectView('recent-activity')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Entries */}
            <div className="space-y-3 pt-1 text-xs">
              {researchNotes.map((note) => {
                let dotClass = 'bg-cyan-400 shadow-[0_0_8px_#00d2ff]';
                if (note.statusColor === 'purple') dotClass = 'bg-purple-400 shadow-[0_0_8px_#c084fc]';
                if (note.statusColor === 'teal') dotClass = 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]';
                if (note.statusColor === 'slate') dotClass = 'bg-slate-500';

                return (
                  <div
                    key={note.id}
                    onClick={() => onOpenNoteDetail(note)}
                    className="flex items-start justify-between gap-3 p-1.5 -mx-1.5 rounded-lg hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotClass}`}></span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-100 truncate">{note.title}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                          {note.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {note.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scientific Snapshot (Chart - 7 cols) */}
        <div
          id="scientific-snapshot-card"
          className="lg:col-span-7 bg-[#0d1622] rounded-2xl sm:rounded-xl border border-[#172737] p-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  SCIENTIFIC SNAPSHOT
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">Analysis throughput</h4>
              </div>
              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 rounded">
                DEMO DATA
              </span>
            </div>

            {/* Legends */}
            <div className="flex items-center gap-4 text-[11px] font-mono mb-3 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full"></span>
                <span>Calculations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-purple-400 rounded-full"></span>
                <span>Research notes</span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative w-full h-36 sm:h-44 pt-2">
              <svg
                className="w-full h-full overflow-visible"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 500 160"
              >
                {/* Horizontal Grid lines */}
                <line x1="28" y1="20" x2="495" y2="20" stroke="#172737" strokeDasharray="2 2" strokeWidth="1" />
                <line x1="28" y1="55" x2="495" y2="55" stroke="#172737" strokeDasharray="2 2" strokeWidth="1" />
                <line x1="28" y1="90" x2="495" y2="90" stroke="#172737" strokeDasharray="2 2" strokeWidth="1" />
                <line x1="28" y1="125" x2="495" y2="125" stroke="#172737" strokeDasharray="2 2" strokeWidth="1" />
                <line x1="28" y1="150" x2="495" y2="150" stroke="#1b2e40" strokeWidth="1" />

                {/* Y-axis Labels */}
                <text x="8" y="23" fill="#64748b" className="text-[9px] font-mono">80</text>
                <text x="8" y="58" fill="#64748b" className="text-[9px] font-mono">60</text>
                <text x="8" y="93" fill="#64748b" className="text-[9px] font-mono">40</text>
                <text x="8" y="128" fill="#64748b" className="text-[9px] font-mono">20</text>
                <text x="12" y="153" fill="#64748b" className="text-[9px] font-mono">0</text>

                {/* Purple Line (Research Notes) */}
                <path
                  d="M 35 140 Q 90 135, 140 125 T 250 110 T 360 95 T 485 70"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="transition-all"
                />

                {/* Cyan Line (Calculations) */}
                <path
                  d="M 35 138 C 70 138, 85 125, 115 118 C 145 110, 160 130, 190 120 C 220 108, 230 95, 260 95 C 290 95, 305 112, 335 105 C 365 95, 375 75, 400 70 C 420 65, 435 72, 455 68 C 470 65, 480 62, 490 60"
                  fill="none"
                  stroke="#00d2ff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 6px rgba(0,210,255,0.4))"
                />

                {/* Interactive Points on Cyan Line */}
                {[
                  { cx: 35, cy: 138, label: '01 Sep', value: '12 Calculations' },
                  { cx: 190, cy: 120, label: '04 Sep', value: '28 Calculations' },
                  { cx: 335, cy: 105, label: '07 Sep', value: '46 Calculations' },
                  { cx: 490, cy: 60, label: '09 Sep', value: '74 Calculations' },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4"
                    fill="#00d2ff"
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={() => setHoveredPoint({ x: pt.cx, y: pt.cy, label: pt.label, value: pt.value })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute bg-slate-900/95 border border-cyan-500/60 rounded px-2 py-1 text-[10px] font-mono text-cyan-200 pointer-events-none shadow-lg -translate-x-1/2 -translate-y-8"
                  style={{ left: `${(hoveredPoint.x / 500) * 100}%`, top: `${(hoveredPoint.y / 160) * 100}%` }}
                >
                  <span className="font-bold">{hoveredPoint.label}:</span> {hoveredPoint.value}
                </div>
              )}
            </div>

            {/* X-axis dates */}
            <div className="flex justify-between pl-7 pr-2 mt-2 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
              <span>01 SEP</span>
              <span>04 SEP</span>
              <span>07 SEP</span>
              <span>09 SEP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="pt-4 pb-2 border-t border-slate-800/80 text-center space-y-3">
        {/* Mobile profile card banner */}
        <div className="flex sm:hidden items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-900/60 border border-teal-500/40 text-teal-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
              AM
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">ENG ALAA MOHAMMED</div>
              <div className="text-[10px] font-mono text-slate-400 truncate">Research engineer</div>
            </div>
          </div>
          <button
            onClick={() => onSelectView('settings')}
            className="text-slate-400 hover:text-white p-1"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 tracking-wider flex flex-col sm:flex-row items-center justify-between gap-1">
          <div>
            ALAA CHEM LAB • Developed by <span className="text-slate-300 font-semibold">ENG ALAA MOHAMMED</span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500">
            UI prototype • Demonstration data
          </div>
        </div>
      </footer>
    </main>
  );
};
