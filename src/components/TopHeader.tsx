import React from 'react';
import { ViewMode } from '../types';
import {
  Menu,
  Search,
  Globe,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  Atom,
  ChevronDown,
} from 'lucide-react';

interface TopHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenHelp: () => void;
  isArabic: boolean;
  onToggleLanguage: () => void;
  currentView: ViewMode;
  currentWorkspace: string;
  onOpenNewProject: () => void;
  unreadCount?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileSidebar,
  onOpenSearch,
  onOpenHelp,
  isArabic,
  onToggleLanguage,
  currentView,
  currentWorkspace,
  onOpenNewProject,
  unreadCount = 2,
}) => {
  const formatBreadcrumb = (view: ViewMode) => {
    switch (view) {
      case 'dashboard':
        return 'Scientific overview';
      case 'virtual-lab':
        return isArabic ? 'المختبر الافتراضي والمحاكاة العلمية' : 'Virtual Laboratory & Simulation Suite';
      case 'periodic-table':
        return 'Periodic Table & Elements';
      case 'molar-mass':
        return 'Molar Mass & Stoichiometry';
      case 'balance-equation':
        return 'Reaction & Equation Balancer';
      case 'material-explorer':
        return 'Materials Science Explorer';
      case 'crystal-structure':
        return 'Crystallography & Unit Cells';
      case 'xrd-lab':
        return 'X-Ray Diffraction Laboratory';
      case 'ai-assistant':
        return 'AI Science Copilot';
      case 'projects':
        return 'Research Projects';
      case 'recent-activity':
        return 'Activity & Timeline';
      default:
        return view.replace('-', ' ');
    }
  };

  return (
    <header
      id="top-navigation-bar"
      className="h-14 border-b border-[#142230] bg-[#091017]/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30"
    >
      {/* Left: Sidebar Toggle, Brand (Mobile) & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Toggle Sidebar"
          className="lg:hidden text-slate-400 hover:text-slate-200 transition p-1.5 rounded-lg hover:bg-slate-800/80"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile mini brand logo */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#070b12] rounded-[7px] flex items-center justify-center">
              <Atom className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            ALAA CHEM
          </span>
        </div>

        {/* Desktop Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 font-medium">Workspace</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold capitalize">
            {formatBreadcrumb(currentView)}
          </span>
        </div>
      </div>

      {/* Right: Search, Language, Notifications, Help */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <button
          onClick={onOpenSearch}
          className="relative flex items-center bg-[#0d1622] hover:bg-[#111f2e] text-xs text-slate-400 rounded-md pl-3 pr-2.5 py-1.5 border border-[#1b2b3d] hover:border-cyan-500/50 transition group cursor-pointer text-left"
          title="Search workspace (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 mr-2 transition" />
          <span className="hidden md:inline text-slate-400 pr-6">Search workspace</span>
          <span className="md:hidden text-slate-400 pr-1">Search</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-[#142334] rounded border border-[#203750] ml-2">
            ⌘ K
          </kbd>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-1 border-l border-[#152435] pl-2 sm:pl-3 text-slate-400">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            aria-label="Toggle language English/Arabic"
            title={`Current: ${isArabic ? 'العربية' : 'English'} (Click to switch)`}
            className={`p-1.5 rounded-md hover:bg-[#101b27] transition flex items-center gap-1 text-xs font-mono ${
              isArabic ? 'text-cyan-400' : 'hover:text-cyan-400'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline">{isArabic ? 'AR' : 'EN'}</span>
          </button>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            onClick={() => alert(`Recent Notifications:\n1. Ti-6Al-4V XRD scan completed with high signal-to-noise ratio.\n2. SiC-α thermal conductivity model verified at 120 W/m·K.`)}
            className="p-1.5 hover:text-cyan-400 rounded-md hover:bg-[#101b27] transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full ring-2 ring-[#091017]"></span>
            )}
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            aria-label="Help / Documentation"
            className="p-1.5 hover:text-cyan-400 rounded-md hover:bg-[#101b27] transition"
            title="Scientific Help & References"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
