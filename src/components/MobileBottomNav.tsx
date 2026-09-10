import React from 'react';
import { ViewMode } from '../types';
import { LayoutGrid, FlaskConical, Boxes, GitBranch, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/90 safe-bottom"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {/* Dashboard */}
        <button
          onClick={() => onSelectView('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 transition ${
            currentView === 'dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Dashboard</span>
        </button>

        {/* Lab Tools */}
        <button
          onClick={() => onSelectView('virtual-lab')}
          className={`flex flex-col items-center py-1 px-2.5 transition ${
            currentView === 'virtual-lab' || currentView === 'periodic-table' || currentView === 'molar-mass' || currentView === 'balance-equation'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Virtual Lab</span>
        </button>

        {/* Materials */}
        <button
          onClick={() => onSelectView('material-explorer')}
          className={`flex flex-col items-center py-1 px-2.5 transition ${
            currentView === 'material-explorer' || currentView === 'crystal-structure' || currentView === 'xrd-lab'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Materials</span>
        </button>

        {/* Research */}
        <button
          onClick={() => onSelectView('recent-activity')}
          className={`flex flex-col items-center py-1 px-2.5 transition ${
            currentView === 'recent-activity' || currentView === 'projects' || currentView === 'research-workspace'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Research</span>
        </button>

        {/* Profile / Engineer */}
        <button
          onClick={() => onSelectView('settings')}
          className={`flex flex-col items-center py-1 px-2.5 transition ${
            currentView === 'settings' || currentView === 'about'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
