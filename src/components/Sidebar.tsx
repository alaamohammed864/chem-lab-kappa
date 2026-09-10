import React, { useState } from 'react';
import { ViewMode } from '../types';
import {
  Atom,
  LayoutGrid,
  Boxes,
  Activity,
  Table,
  CircleDot,
  Orbit,
  Zap,
  TestTube,
  Calculator,
  Compass,
  Cpu,
  Binary,
  Layers,
  Sparkles,
  FileText,
  Settings,
  HelpCircle,
  Info,
  ChevronDown,
  MoreVertical,
  Radio,
  FileSpreadsheet,
  FlaskConical,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentWorkspace: string;
  onSelectWorkspace: (workspace: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  currentWorkspace,
  onSelectWorkspace,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const workspaces = [
    { title: 'Engineering Workspace', sub: 'Personal research' },
    { title: 'Advanced Metallurgy', sub: 'Ti & Superalloys' },
    { title: 'Nanomaterials & XRD', sub: 'Phase analysis' },
    { title: 'Electrochemical Lab', sub: 'Corrosion & cells' },
  ];

  const handleNavClick = (view: ViewMode) => {
    onSelectView(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 w-64 bg-[#091017] border-r border-[#152332] flex flex-col shrink-0 h-screen transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-[#142230]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Atom className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wider text-white uppercase font-mono leading-none">
                ALAA CHEM LAB
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 uppercase">
                Scientific Workspace
              </p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 text-xs"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Workspace Selector Card with dropdown */}
        <div className="p-3 border-b border-[#142230] relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#0f1b26] border border-[#1b2d40] hover:border-cyan-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate group-hover:text-cyan-300">
                  {currentWorkspace}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Active project profile</p>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 ml-1 transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-[#0f1a26] border border-[#1f334a] rounded-lg shadow-2xl z-50 p-1.5 space-y-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.title}
                  onClick={() => {
                    onSelectWorkspace(ws.title);
                    setWorkspaceMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex flex-col ${
                    currentWorkspace === ws.title
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                      : 'text-slate-300 hover:bg-[#152332]'
                  }`}
                >
                  <span className="font-medium">{ws.title}</span>
                  <span className="text-[10px] text-slate-400">{ws.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          {/* Workspace */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Workspace
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'dashboard'
                      ? 'bg-[#132738] text-cyan-300 font-medium relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-cyan-400 before:rounded-r'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutGrid className="w-4 h-4 text-cyan-400" />
                    Dashboard
                  </span>
                  {currentView === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('virtual-lab')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'virtual-lab'
                      ? 'bg-[#132738] text-cyan-300 font-medium relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-cyan-400 before:rounded-r'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    Virtual Laboratory
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    SIM
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('projects')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'projects' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('research-workspace')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'research-workspace' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Research Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('recent-activity')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'recent-activity' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Recent Activity
                </button>
              </li>
            </ul>
          </div>

          {/* Chemistry */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Chemistry
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => handleNavClick('periodic-table')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'periodic-table' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Table className="w-4 h-4 text-cyan-400" />
                  Periodic Table
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('periodic-table')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#111e2b] transition"
                >
                  <CircleDot className="w-4 h-4" />
                  Element Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('molar-mass')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'molar-mass' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  Molar Mass Lab
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('balance-equation')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'balance-equation' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  Equation Lab
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('ion-explorer')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'ion-explorer' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Atom className="w-4 h-4 text-blue-400" />
                  Ion Explorer & Salts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('molecule-lab')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'molecule-lab' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Boxes className="w-4 h-4 text-purple-400" />
                  Molecule 3D/2D Lab
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('periodic-table')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#111e2b] transition"
                >
                  <Orbit className="w-4 h-4" />
                  Atom & Orbital Lab
                </button>
              </li>
            </ul>
          </div>

          {/* Materials Science */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Materials Science
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => handleNavClick('material-explorer')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'material-explorer' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Boxes className="w-4 h-4 text-amber-400" />
                  Materials Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('crystal-structure')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'crystal-structure' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  Crystal Structures
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('phase-diagrams')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'phase-diagrams' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Phase Diagrams
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('xrd-lab')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'xrd-lab' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  XRD Laboratory
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('corrosion-lab')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'corrosion-lab' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  Corrosion Laboratory
                </button>
              </li>
            </ul>
          </div>

          {/* Engineering & NDT */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Engineering
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => handleNavClick('engineering-calc')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'engineering-calc' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Engineering Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('ndt-center')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'ndt-center' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Radio className="w-4 h-4 text-cyan-400" />
                  NDT Center
                </button>
              </li>
            </ul>
          </div>

          {/* Intelligence */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Intelligence
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => handleNavClick('ai-assistant')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'ai-assistant' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  AI Science Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('reports')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition ${
                    currentView === 'reports' ? 'bg-[#132738] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e2b]'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Scientific Reports
                </button>
              </li>
            </ul>
          </div>

          {/* System */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              System
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => handleNavClick('settings')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#111e2b] transition"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('about')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#111e2b] transition"
                >
                  <Info className="w-4 h-4" />
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('help')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#111e2b] transition"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Sidebar User Footer */}
        <div className="p-3 border-t border-[#142230] bg-[#091017]">
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#0f1b26] transition">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-md bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs text-cyan-300 shrink-0">
                AM
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white uppercase tracking-tight truncate">
                  ENG ALAA MOHAMMED
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">Research engineer</p>
              </div>
            </div>
            <button
              aria-label="Account options"
              onClick={() => handleNavClick('settings')}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
