import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewMode, ResearchNote, ChemicalElement, MaterialItem } from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { ResearchService, ResearchProject } from './services/researchService';
import type { EquationLabTab } from './components/EquationLabModal';

// Code-split heavy scientific modals and workspaces to minimize initial bundle size
const PeriodicTableModal = lazy(() => import('./components/PeriodicTableModal').then((m) => ({ default: m.PeriodicTableModal })));
const MolarMassCalculatorModal = lazy(() => import('./components/MolarMassCalculatorModal').then((m) => ({ default: m.MolarMassCalculatorModal })));
const EquationLabModal = lazy(() => import('./components/EquationLabModal').then((m) => ({ default: m.EquationLabModal })));
const MaterialExplorerModal = lazy(() => import('./components/MaterialExplorerModal').then((m) => ({ default: m.MaterialExplorerModal })));
const CrystalStructureModal = lazy(() => import('./components/CrystalStructureModal').then((m) => ({ default: m.CrystalStructureModal })));
const XRDLabModal = lazy(() => import('./components/XRDLabModal').then((m) => ({ default: m.XRDLabModal })));
const PhaseDiagramModal = lazy(() => import('./components/PhaseDiagramModal').then((m) => ({ default: m.PhaseDiagramModal })));
const CorrosionLabModal = lazy(() => import('./components/CorrosionLabModal').then((m) => ({ default: m.CorrosionLabModal })));
const NDTCenterModal = lazy(() => import('./components/NDTCenterModal').then((m) => ({ default: m.NDTCenterModal })));
const AIAssistantModal = lazy(() => import('./components/AIAssistantModal').then((m) => ({ default: m.AIAssistantModal })));
const EducationModal = lazy(() => import('./components/EducationModal').then((m) => ({ default: m.EducationModal })));
const ResearchWorkspaceModal = lazy(() => import('./components/ResearchWorkspaceModal').then((m) => ({ default: m.ResearchWorkspaceModal })));
const ReportsModal = lazy(() => import('./components/ReportsModal').then((m) => ({ default: m.ReportsModal })));
const NewProjectModal = lazy(() => import('./components/NewProjectModal').then((m) => ({ default: m.NewProjectModal })));
const SearchPalette = lazy(() => import('./components/SearchPalette').then((m) => ({ default: m.SearchPalette })));
const ResearchNoteDetailModal = lazy(() => import('./components/ResearchNoteDetailModal').then((m) => ({ default: m.ResearchNoteDetailModal })));
const HelpModal = lazy(() => import('./components/HelpModal').then((m) => ({ default: m.HelpModal })));
const VirtualLabWorkspace = lazy(() => import('./components/virtualLab/VirtualLabWorkspace').then((m) => ({ default: m.VirtualLabWorkspace })));

// Accessible loading fallback for asynchronous modules
const ModalLoadingFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs" aria-live="polite" aria-busy="true">
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0c1624] border border-[#1b314b] shadow-2xl">
      <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono text-cyan-300">Loading module...</span>
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [currentWorkspace, setCurrentWorkspace] = useState('Engineering Workspace');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isArabic, setIsArabic] = useState(false);

  // Active Modals
  const [isPeriodicTableOpen, setIsPeriodicTableOpen] = useState(false);
  const [isMolarMassOpen, setIsMolarMassOpen] = useState(false);
  const [isEquationLabOpen, setIsEquationLabOpen] = useState(false);
  const [equationLabTab, setEquationLabTab] = useState<EquationLabTab>('equation');
  const [isMaterialExplorerOpen, setIsMaterialExplorerOpen] = useState(false);
  const [isCrystalStructureOpen, setIsCrystalStructureOpen] = useState(false);
  const [isXRDLabOpen, setIsXRDLabOpen] = useState(false);
  const [isPhaseDiagramOpen, setIsPhaseDiagramOpen] = useState(false);
  const [isCorrosionLabOpen, setIsCorrosionLabOpen] = useState(false);
  const [isNDTCenterOpen, setIsNDTCenterOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isResearchWorkspaceOpen, setIsResearchWorkspaceOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedReportProject, setSelectedReportProject] = useState<ResearchProject | undefined>(undefined);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isSearchPaletteOpen, setIsSearchPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeNoteDetail, setActiveNoteDetail] = useState<ResearchNote | null>(null);

  // Research Notes dataset managed via ResearchService
  const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(() => ResearchService.getNotes());

  // Global Escape key handler to ensure keyboard accessibility across all modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPeriodicTableOpen(false);
        setIsMolarMassOpen(false);
        setIsEquationLabOpen(false);
        setIsMaterialExplorerOpen(false);
        setIsCrystalStructureOpen(false);
        setIsXRDLabOpen(false);
        setIsPhaseDiagramOpen(false);
        setIsCorrosionLabOpen(false);
        setIsNDTCenterOpen(false);
        setIsAIAssistantOpen(false);
        setIsEducationOpen(false);
        setIsResearchWorkspaceOpen(false);
        setIsReportsOpen(false);
        setIsNewProjectOpen(false);
        setIsSearchPaletteOpen(false);
        setIsHelpOpen(false);
        setActiveNoteDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectView = (view: ViewMode) => {
    setCurrentView(view);
    // If selecting a tool, open its dedicated modal
    if (view === 'periodic-table') setIsPeriodicTableOpen(true);
    else if (view === 'molar-mass') setIsMolarMassOpen(true);
    else if (view === 'balance-equation') {
      setEquationLabTab('equation');
      setIsEquationLabOpen(true);
    } else if (view === 'ion-explorer') {
      setEquationLabTab('ions');
      setIsEquationLabOpen(true);
    } else if (view === 'molecule-lab') {
      setEquationLabTab('molecules');
      setIsEquationLabOpen(true);
    } else if (view === 'material-explorer') setIsMaterialExplorerOpen(true);
    else if (view === 'crystal-structure') setIsCrystalStructureOpen(true);
    else if (view === 'xrd-lab') setIsXRDLabOpen(true);
    else if (view === 'phase-diagrams') setIsPhaseDiagramOpen(true);
    else if (view === 'corrosion-lab') setIsCorrosionLabOpen(true);
    else if (view === 'ndt-center' || view === 'engineering-calc') setIsNDTCenterOpen(true);
    else if (view === 'ai-assistant') setIsAIAssistantOpen(true);
    else if (view === 'education' || view === 'learning-paths') setIsEducationOpen(true);
    else if (view === 'research-workspace' || view === 'projects') setIsResearchWorkspaceOpen(true);
    else if (view === 'reports') setIsReportsOpen(true);
  };

  const handleCreateProject = (newNote: ResearchNote) => {
    const updated = ResearchService.addNote(newNote);
    setResearchNotes(updated);
  };

  return (
    <div
      className={`min-h-screen bg-[#070c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 ${
        isArabic ? 'rtl font-sans' : 'ltr'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Screen Reader Accessibility Skip Link */}
      <a
        href="#main-scientific-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-cyan-500 focus:text-slate-950 focus:font-bold focus:rounded-md shadow-lg"
      >
        Skip to scientific workspace content
      </a>

      <div className="flex flex-1 w-full relative">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={handleSelectView}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentWorkspace={currentWorkspace}
          onSelectWorkspace={(ws) => setCurrentWorkspace(ws)}
        />

        {/* Main Work Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070c14]">
          {/* Top Header */}
          <TopHeader
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSearch={() => setIsSearchPaletteOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            isArabic={isArabic}
            onToggleLanguage={() => setIsArabic(!isArabic)}
            currentView={currentView}
            currentWorkspace={currentWorkspace}
            onOpenNewProject={() => setIsNewProjectOpen(true)}
          />

          {/* Primary View: Dashboard or Virtual Laboratory */}
          <main id="main-scientific-content" className="flex-1 flex flex-col min-w-0">
            {currentView === 'virtual-lab' ? (
              <Suspense fallback={<ModalLoadingFallback />}>
                <VirtualLabWorkspace language={isArabic ? 'ar' : 'en'} />
              </Suspense>
            ) : (
              <DashboardView
                onSelectView={handleSelectView}
                onOpenNewProject={() => setIsNewProjectOpen(true)}
                researchNotes={researchNotes}
                onOpenNoteDetail={(note) => setActiveNoteDetail(note)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={handleSelectView}
      />

      {/* Lazy Suspense Container for Functional Scientific Tool Modals */}
      <Suspense fallback={<ModalLoadingFallback />}>
        {isPeriodicTableOpen && (
          <PeriodicTableModal
            isOpen={isPeriodicTableOpen}
            onClose={() => setIsPeriodicTableOpen(false)}
            onSelectForCalculation={(el) => {
              setIsPeriodicTableOpen(false);
              setIsMolarMassOpen(true);
            }}
          />
        )}

        {isMolarMassOpen && (
          <MolarMassCalculatorModal
            isOpen={isMolarMassOpen}
            onClose={() => setIsMolarMassOpen(false)}
          />
        )}

        {isEquationLabOpen && (
          <EquationLabModal
            isOpen={isEquationLabOpen}
            onClose={() => setIsEquationLabOpen(false)}
            initialTab={equationLabTab}
          />
        )}

        {isMaterialExplorerOpen && (
          <MaterialExplorerModal
            isOpen={isMaterialExplorerOpen}
            onClose={() => setIsMaterialExplorerOpen(false)}
          />
        )}

        {isCrystalStructureOpen && (
          <CrystalStructureModal
            isOpen={isCrystalStructureOpen}
            onClose={() => setIsCrystalStructureOpen(false)}
          />
        )}

        {isXRDLabOpen && (
          <XRDLabModal
            isOpen={isXRDLabOpen}
            onClose={() => setIsXRDLabOpen(false)}
          />
        )}

        {isPhaseDiagramOpen && (
          <PhaseDiagramModal
            isOpen={isPhaseDiagramOpen}
            onClose={() => setIsPhaseDiagramOpen(false)}
          />
        )}

        {isCorrosionLabOpen && (
          <CorrosionLabModal
            isOpen={isCorrosionLabOpen}
            onClose={() => setIsCorrosionLabOpen(false)}
          />
        )}

        {isNDTCenterOpen && (
          <NDTCenterModal
            isOpen={isNDTCenterOpen}
            onClose={() => setIsNDTCenterOpen(false)}
          />
        )}

        {isAIAssistantOpen && (
          <AIAssistantModal
            isOpen={isAIAssistantOpen}
            onClose={() => setIsAIAssistantOpen(false)}
          />
        )}

        {isEducationOpen && (
          <EducationModal
            isOpen={isEducationOpen}
            onClose={() => setIsEducationOpen(false)}
          />
        )}

        {isResearchWorkspaceOpen && (
          <ResearchWorkspaceModal
            isOpen={isResearchWorkspaceOpen}
            onClose={() => setIsResearchWorkspaceOpen(false)}
            onOpenReportGenerator={(proj) => {
              setSelectedReportProject(proj);
              setIsReportsOpen(true);
            }}
          />
        )}

        {isReportsOpen && (
          <ReportsModal
            isOpen={isReportsOpen}
            onClose={() => setIsReportsOpen(false)}
            defaultProject={selectedReportProject}
          />
        )}

        {isNewProjectOpen && (
          <NewProjectModal
            isOpen={isNewProjectOpen}
            onClose={() => setIsNewProjectOpen(false)}
            onCreateProject={handleCreateProject}
          />
        )}

        {isSearchPaletteOpen && (
          <SearchPalette
            isOpen={isSearchPaletteOpen}
            onClose={() => setIsSearchPaletteOpen(false)}
            onNavigate={handleSelectView}
          />
        )}

        {activeNoteDetail && (
          <ResearchNoteDetailModal
            note={activeNoteDetail}
            onClose={() => setActiveNoteDetail(null)}
            onNavigate={handleSelectView}
          />
        )}

        {isHelpOpen && (
          <HelpModal
            isOpen={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}

