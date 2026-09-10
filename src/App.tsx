import React, { useState } from 'react';
import { ViewMode, ResearchNote, ChemicalElement, MaterialItem } from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { ResearchService } from './services/researchService';

// Tool Modals
import { PeriodicTableModal } from './components/PeriodicTableModal';
import { MolarMassCalculatorModal } from './components/MolarMassCalculatorModal';
import { EquationLabModal, EquationLabTab } from './components/EquationLabModal';
import { MaterialExplorerModal } from './components/MaterialExplorerModal';
import { CrystalStructureModal } from './components/CrystalStructureModal';
import { XRDLabModal } from './components/XRDLabModal';
import { PhaseDiagramModal } from './components/PhaseDiagramModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { NewProjectModal } from './components/NewProjectModal';
import { SearchPalette } from './components/SearchPalette';
import { ResearchNoteDetailModal } from './components/ResearchNoteDetailModal';
import { HelpModal } from './components/HelpModal';
import { VirtualLabWorkspace } from './components/virtualLab/VirtualLabWorkspace';

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
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isSearchPaletteOpen, setIsSearchPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeNoteDetail, setActiveNoteDetail] = useState<ResearchNote | null>(null);

  // Research Notes dataset managed via ResearchService
  const [researchNotes, setResearchNotes] = useState<ResearchNote[]>(() => ResearchService.getNotes());

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
    else if (view === 'ai-assistant') setIsAIAssistantOpen(true);
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
          {currentView === 'virtual-lab' ? (
            <VirtualLabWorkspace language={isArabic ? 'ar' : 'en'} />
          ) : (
            <DashboardView
              onSelectView={handleSelectView}
              onOpenNewProject={() => setIsNewProjectOpen(true)}
              researchNotes={researchNotes}
              onOpenNoteDetail={(note) => setActiveNoteDetail(note)}
            />
          )}
        </div>
      </div>

      {/* Sticky Mobile Bottom Navigation Bar (Image 1.png) */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={handleSelectView}
      />

      {/* Modals for Functional Scientific Tools */}
      <PeriodicTableModal
        isOpen={isPeriodicTableOpen}
        onClose={() => setIsPeriodicTableOpen(false)}
        onSelectForCalculation={(el) => {
          setIsPeriodicTableOpen(false);
          setIsMolarMassOpen(true);
        }}
      />

      <MolarMassCalculatorModal
        isOpen={isMolarMassOpen}
        onClose={() => setIsMolarMassOpen(false)}
      />

      <EquationLabModal
        isOpen={isEquationLabOpen}
        onClose={() => setIsEquationLabOpen(false)}
        initialTab={equationLabTab}
      />

      <MaterialExplorerModal
        isOpen={isMaterialExplorerOpen}
        onClose={() => setIsMaterialExplorerOpen(false)}
      />

      <CrystalStructureModal
        isOpen={isCrystalStructureOpen}
        onClose={() => setIsCrystalStructureOpen(false)}
      />

      <XRDLabModal
        isOpen={isXRDLabOpen}
        onClose={() => setIsXRDLabOpen(false)}
      />

      <PhaseDiagramModal
        isOpen={isPhaseDiagramOpen}
        onClose={() => setIsPhaseDiagramOpen(false)}
      />

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <SearchPalette
        isOpen={isSearchPaletteOpen}
        onClose={() => setIsSearchPaletteOpen(false)}
        onNavigate={handleSelectView}
      />

      <ResearchNoteDetailModal
        note={activeNoteDetail}
        onClose={() => setActiveNoteDetail(null)}
        onNavigate={handleSelectView}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
