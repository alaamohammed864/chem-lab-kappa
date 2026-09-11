import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  FileText,
  Bookmark,
  Calculator,
  Atom,
  Boxes,
  Paperclip,
  History,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  Printer,
  Calendar,
  User,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import {
  ResearchProject,
  ResearchWorkspaceService,
  ResearchReference,
  SavedCalculation,
} from '../services/researchService';
import { ResearchNote } from '../types';

interface ResearchWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportGenerator?: (project: ResearchProject) => void;
}

type ProjectDetailTab =
  | 'notes'
  | 'calculations'
  | 'references'
  | 'materials-elements'
  | 'attachments'
  | 'history';

export const ResearchWorkspaceModal: React.FC<ResearchWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onOpenReportGenerator,
}) => {
  const [projects, setProjects] = useState<ResearchProject[]>(() =>
    ResearchWorkspaceService.getProjects()
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => projects[0]?.id || 'proj-1'
  );
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>('notes');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddRefModal, setShowAddRefModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDetails, setNoteDetails] = useState('');
  const [refTitle, setRefTitle] = useState('');
  const [refAuthors, setRefAuthors] = useState('');
  const [refStandardCode, setRefStandardCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] =
    useState<ResearchProject['category']>('Metals & Alloys');

  if (!isOpen) return null;

  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = ResearchWorkspaceService.createProject(
      newTitle,
      newDesc,
      newCategory
    );
    const refreshed = ResearchWorkspaceService.getProjects();
    setProjects(refreshed);
    setSelectedProjectId(created.id);
    setShowNewProjectModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleOpenAddNote = () => {
    setNoteTitle('');
    setNoteDetails('');
    setShowAddNoteModal(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const note: ResearchNote = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim(),
      subtitle: `${currentProject.title.slice(0, 30)}...`,
      category: currentProject.category,
      timestamp: 'Just now',
      statusColor: 'cyan',
      details: noteDetails.trim() || 'No extended notes provided.',
    };

    ResearchWorkspaceService.addNoteToProject(currentProject.id, note);
    setProjects(ResearchWorkspaceService.getProjects());
    setShowAddNoteModal(false);
  };

  const handleOpenAddReference = () => {
    setRefTitle('');
    setRefAuthors('Materials Research Committee');
    setRefStandardCode('');
    setShowAddRefModal(true);
  };

  const handleSaveReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refTitle.trim()) return;

    const ref: ResearchReference = {
      id: `ref-${Date.now()}`,
      title: refTitle.trim(),
      authors: refAuthors.trim() || 'Materials Research Committee',
      publication: 'Engineering Journal / Consensus Standard',
      year: new Date().getFullYear(),
      standardCode: refStandardCode.trim() || undefined,
    };

    ResearchWorkspaceService.addReferenceToProject(currentProject.id, ref);
    setProjects(ResearchWorkspaceService.getProjects());
    setShowAddRefModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070d14] border border-[#1b2b3d] w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#162738] bg-gradient-to-r from-[#0b1420] via-[#0e1a2b] to-[#0b1420] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Scientific Research Workspace
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                  Lab Projects & Notebooks
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Integrated repository for experimental logs, references, physical calculations & specimen records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-xs text-cyan-300 hover:border-cyan-400 transition cursor-pointer flex items-center gap-1.5 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>

            {onOpenReportGenerator && currentProject && (
              <button
                onClick={() => onOpenReportGenerator(currentProject)}
                className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800 text-xs text-indigo-300 hover:border-indigo-400 transition cursor-pointer flex items-center gap-1.5 font-semibold"
                title="Generate Formal Report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Report</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Close Research Workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body: 2-Column Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Projects Navigation */}
          <div className="w-full lg:w-72 bg-[#09111b] border-r border-[#142232] p-3.5 flex flex-col space-y-3 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                LABORATORY PROJECTS ({projects.length})
              </span>
            </div>

            <div className="space-y-2">
              {projects.map((proj) => {
                const isSelected = proj.id === selectedProjectId;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[#0f1d2c] border-cyan-500 shadow-md shadow-cyan-950/30'
                        : 'bg-[#0c141f] border-[#162638] hover:border-slate-600 hover:bg-[#0f1926]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {proj.category}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          proj.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1 leading-tight">
                      {proj.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                      <span>{proj.notes.length} Notes</span>
                      <span>·</span>
                      <span>{proj.calculations.length} Calcs</span>
                      <span>·</span>
                      <span>{proj.references.length} Refs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Project Details & Modules */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#070c14]">
            {currentProject && (
              <>
                {/* Project Header Info Card */}
                <div className="p-4 sm:px-6 bg-[#09111b] border-b border-[#142232] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-wide">
                          {currentProject.title}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {currentProject.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-4xl">
                        {currentProject.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 justify-end">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{currentProject.leadResearcher}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex items-center gap-1 pt-2 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        activeTab === 'notes'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Notes ({currentProject.notes.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('calculations')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        activeTab === 'calculations'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Calculations ({currentProject.calculations.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('references')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        activeTab === 'references'
                          ? 'bg-teal-950 text-teal-300 border border-teal-800 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>References ({currentProject.references.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('materials-elements')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        activeTab === 'materials-elements'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Materials & Elements</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('attachments')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        activeTab === 'attachments'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Attachments ({currentProject.attachments.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('history')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        activeTab === 'history'
                          ? 'bg-slate-800 text-slate-200 border border-slate-700 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Audit History ({currentProject.history.length})</span>
                    </button>
                  </div>
                </div>

                {/* Sub-tab Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                          Scientific Research Observations & Notes
                        </span>
                        <button
                          onClick={handleOpenAddNote}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-xs text-cyan-300 hover:border-cyan-400 transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Note</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {currentProject.notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-white">{note.title}</h4>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {note.subtitle}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">
                                {note.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-cyan-500/50">
                              {note.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calculations Tab */}
                  {activeTab === 'calculations' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-indigo-400 font-bold">
                          Logged Laboratory Calculations
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentProject.calculations.map((calc) => (
                          <div
                            key={calc.id}
                            className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] space-y-2.5"
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-indigo-400" />
                                <h4 className="text-xs font-bold text-white">{calc.title}</h4>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">
                                {calc.timestamp}
                              </span>
                            </div>

                            <div className="px-3 py-1.5 rounded bg-black/40 border border-slate-800 font-mono text-xs text-indigo-300">
                              Formula: {calc.formula}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#17293b]">
                                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                                  Input Parameters:
                                </span>
                                <div className="space-y-0.5 font-mono text-[11px] text-slate-200">
                                  {Object.entries(calc.inputs).map(([k, v]) => (
                                    <div key={k}>
                                      {k}: <span className="text-cyan-300">{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#17293b]">
                                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                                  Computed Outputs:
                                </span>
                                <div className="space-y-0.5 font-mono text-[11px] text-slate-200">
                                  {Object.entries(calc.outputs).map(([k, v]) => (
                                    <div key={k}>
                                      {k}: <span className="text-emerald-300 font-bold">{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {calc.notes && (
                              <p className="text-xs text-slate-400 italic">Note: {calc.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* References Tab */}
                  {activeTab === 'references' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-teal-400 font-bold">
                          Bibliographic Standards & Citations
                        </span>
                        <button
                          onClick={handleOpenAddReference}
                          className="px-2.5 py-1 rounded-lg bg-teal-950 border border-teal-800 text-xs text-teal-300 hover:border-teal-400 transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Reference</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {currentProject.references.map((ref) => (
                          <div
                            key={ref.id}
                            className="p-3.5 rounded-xl bg-[#0b131d] border border-[#162738] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-white">{ref.title}</h4>
                              {ref.standardCode && (
                                <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-semibold">
                                  {ref.standardCode}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              {ref.authors} ({ref.year}) — <em>{ref.publication}</em>
                            </p>
                            {ref.doi && (
                              <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                                <span>DOI: {ref.doi}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materials & Elements Tab */}
                  {activeTab === 'materials-elements' && (
                    <div className="space-y-4">
                      {/* Linked Materials */}
                      <div className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] space-y-2.5">
                        <span className="text-xs font-bold text-teal-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                          <Boxes className="w-4 h-4" />
                          Linked Engineering Materials
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {currentProject.linkedMaterials.map((mat, i) => (
                            <div
                              key={i}
                              className="px-3 py-1.5 rounded-lg bg-[#0e1724] border border-[#17293b] text-xs font-semibold text-slate-200 flex items-center gap-2"
                            >
                              <span className="w-2 h-2 rounded-full bg-teal-400" />
                              <span>{mat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Linked Elements */}
                      <div className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] space-y-2.5">
                        <span className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                          <Atom className="w-4 h-4" />
                          Constituent Chemical Elements
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {currentProject.linkedElements.map((el, i) => (
                            <div
                              key={i}
                              className="px-3 py-1.5 rounded-lg bg-[#0e1724] border border-[#17293b] text-xs font-bold text-cyan-300 font-mono flex items-center gap-2"
                            >
                              <span className="w-5 h-5 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px]">
                                {el}
                              </span>
                              <span>Element {el}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attachments Tab */}
                  {activeTab === 'attachments' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                          Attached Laboratory Artifacts
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentProject.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-3.5 rounded-xl bg-[#0b131d] border border-[#162738] space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate max-w-[200px]">
                                {att.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {att.fileSizeFormatted}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">{att.description}</p>
                            <div className="text-[10px] font-mono text-slate-500">
                              Uploaded: {att.uploadedAt}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* History Tab */}
                  {activeTab === 'history' && (
                    <div className="space-y-3">
                      <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                        Project Audit Timeline & Change Log
                      </span>

                      <div className="space-y-2 border-l-2 border-slate-800 ml-2 pl-4">
                        {currentProject.history.map((h) => (
                          <div key={h.id} className="relative pb-3 space-y-0.5">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500" />
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-200">{h.action}</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {h.timestamp}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              By: <strong className="text-slate-300">{h.user}</strong>
                            </div>
                            {h.details && (
                              <p className="text-xs text-slate-300 italic">{h.details}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* New Project Modal Overlay */}
        {showNewProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#0b1420] border border-[#1b2d42] rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-sm font-bold text-white">Create New Research Project</h3>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Project Title:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Stress Corrosion Cracking in 7075-T6"
                    className="w-full bg-[#0e1724] border border-[#1b2b3d] rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as ResearchProject['category'])
                    }
                    className="w-full bg-[#0e1724] border border-[#1b2b3d] rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Metals & Alloys">Metals & Alloys</option>
                    <option value="Corrosion & Coatings">Corrosion & Coatings</option>
                    <option value="Crystallography">Crystallography</option>
                    <option value="NDT Quality Assurance">NDT Quality Assurance</option>
                    <option value="Chemical Synthesis">Chemical Synthesis</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Description & Scope:</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="State experimental objectives, material targets, and governing standards..."
                    className="w-full bg-[#0e1724] border border-[#1b2b3d] rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Note Modal */}
        {showAddNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#0c1624] border border-[#1d324d] rounded-xl p-5 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Add Scientific Observation / Note
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="text-slate-400 hover:text-white p-1 text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Note Title / Phenomenon:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Passivity Breakdown in 3.5 wt% NaCl"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070d16] border border-[#1b2f48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Scientific Observation Details:
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe microstructure, heat-treatment effects, XRD peak intensity shifts, or electrochemistry..."
                    value={noteDetails}
                    onChange={(e) => setNoteDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070d16] border border-[#1b2f48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddNoteModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Reference Modal */}
        {showAddRefModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#0c1624] border border-[#1d324d] rounded-xl p-5 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-teal-400" />
                  Add Consensus Standard / Reference
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddRefModal(false)}
                  className="text-slate-400 hover:text-white p-1 text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveReference} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Standard / Document Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standard Test Methods for Pitting Resistance"
                    value={refTitle}
                    onChange={(e) => setRefTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070d16] border border-[#1b2f48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Standard Code (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ASTM G48, ISO 15156, ASME Sec V"
                    value={refStandardCode}
                    onChange={(e) => setRefStandardCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070d16] border border-[#1b2f48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Authoring Committee / Organization:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ASTM Committee G01 / NACE International"
                    value={refAuthors}
                    onChange={(e) => setRefAuthors(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070d16] border border-[#1b2f48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddRefModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
                  >
                    Save Reference
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
