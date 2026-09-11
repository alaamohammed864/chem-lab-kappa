import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  BookOpen,
  Sparkles,
  ShieldAlert,
  Radio,
  FileCheck,
  Award,
  ChevronRight,
  Clock,
  ArrowLeft,
  Search,
} from 'lucide-react';
import {
  LEARNING_PATHS_DATA,
  LearningPath,
  Lesson,
  Worksheet,
  EducationService,
  UserProgressRecord,
} from '../engines/education/educationEngine';
import { LessonViewer } from './education/LessonViewer';
import { WorksheetViewer } from './education/WorksheetViewer';
import { ProgressDashboard } from './education/ProgressDashboard';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EducationMainTab = 'paths' | 'worksheets' | 'progress';

export const EducationModal: React.FC<EducationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<EducationMainTab>('paths');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(LEARNING_PATHS_DATA[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeWorksheet, setActiveWorksheet] = useState<Worksheet | null>(null);
  const [progress, setProgress] = useState<UserProgressRecord>(() => EducationService.getProgress());
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const refreshProgress = () => {
    setProgress(EducationService.getProgress());
  };

  const getPathIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-teal-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-indigo-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-cyan-400" />;
    }
  };

  const filteredPaths = LEARNING_PATHS_DATA.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.lessons.some((l) => l.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070d14] border border-[#1b2b3d] w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-[#162738] bg-gradient-to-r from-[#0b1420] via-[#0e1a2b] to-[#0b1420] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Education & Learning Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                  Engineering Curriculum
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Self-paced mastery paths in crystallography, corrosion mechanics & non-destructive examination
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title="Close Education Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-[#142232] bg-[#070e17] overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setActiveTab('paths');
                setActiveLesson(null);
                setActiveWorksheet(null);
              }}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
                activeTab === 'paths'
                  ? 'bg-[#0d1a27] text-cyan-300 border-cyan-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Learning Paths & Lessons</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('worksheets');
                setActiveLesson(null);
              }}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
                activeTab === 'worksheets'
                  ? 'bg-[#0d1a27] text-teal-300 border-teal-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Engineering Worksheets</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('progress');
                refreshProgress();
              }}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
                activeTab === 'progress'
                  ? 'bg-[#0d1a27] text-indigo-300 border-indigo-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Progress & History Log</span>
            </button>
          </div>

          {activeTab === 'paths' && !activeLesson && (
            <div className="relative pb-2 hidden sm:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons & topics..."
                className="w-56 pl-8 pr-3 py-1.5 rounded-lg bg-[#0e1724] border border-[#1b2b3d] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* View 1: Active Lesson Viewer */}
          {activeLesson && selectedPath && (
            <div className="space-y-3">
              <button
                onClick={() => setActiveLesson(null)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to {selectedPath.title}</span>
              </button>
              <LessonViewer
                lesson={activeLesson}
                pathId={selectedPath.id}
                onLessonFinished={refreshProgress}
              />
            </div>
          )}

          {/* View 2: Active Worksheet Viewer */}
          {activeWorksheet && (
            <div className="space-y-3">
              <button
                onClick={() => setActiveWorksheet(null)}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-mono transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Worksheets</span>
              </button>
              <WorksheetViewer worksheet={activeWorksheet} />
            </div>
          )}

          {/* View 3: Learning Paths & Lessons Catalog */}
          {activeTab === 'paths' && !activeLesson && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left sidebar: Path selector */}
              <div className="lg:col-span-4 space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  CURRICULUM TRACKS
                </span>
                {filteredPaths.map((path) => {
                  const isSelected = selectedPath?.id === path.id;
                  const completedLessons = path.lessons.filter((l) =>
                    progress.completedLessonIds.includes(l.id)
                  ).length;
                  const pct = Math.round((completedLessons / path.lessons.length) * 100);

                  return (
                    <div
                      key={path.id}
                      onClick={() => setSelectedPath(path)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-[#0f1d2c] border-cyan-500 shadow-md shadow-cyan-950/40'
                          : 'bg-[#0b131d] border-[#162738] hover:border-slate-600 hover:bg-[#0e1724]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-black/40 border border-slate-700/60 flex items-center justify-center shrink-0">
                            {getPathIcon(path.iconName)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight">
                              {path.title}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">
                              {path.category} · {path.lessons.length} Lessons
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-cyan-400 shrink-0">
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right panel: Lessons in selected path */}
              <div className="lg:col-span-8 space-y-4">
                {selectedPath && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#09111b] border border-[#142334] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
                          Active Path
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {selectedPath.lessons.length} Modules Available
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{selectedPath.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedPath.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block pt-1">
                      LESSONS & PRACTICE MODULES
                    </span>

                    <div className="space-y-2.5">
                      {selectedPath.lessons.map((lesson, idx) => {
                        const isCompleted = progress.completedLessonIds.includes(lesson.id);
                        const quizResult = progress.quizScores[lesson.id];

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className="p-3.5 rounded-xl bg-[#0b131d] border border-[#162738] hover:border-cyan-500/50 hover:bg-[#0e1724] transition cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                                    {lesson.title}
                                  </h4>
                                  {isCompleted && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                                      COMPLETED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {lesson.summary}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {lesson.durationMinutes} min
                                  </span>
                                  <span>·</span>
                                  <span>{lesson.difficulty}</span>
                                  {quizResult && (
                                    <>
                                      <span>·</span>
                                      <span className="text-cyan-400 font-bold">
                                        Score: {quizResult.score}/{quizResult.total}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View 4: Worksheets List */}
          {activeTab === 'worksheets' && !activeWorksheet && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#09111b] border border-[#142334] space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-teal-400" />
                  <span>Engineering Problem Sets & Laboratory Worksheets</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive mathematical calculation sheets with given boundary data, derivation steps, and code consensus references.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {LEARNING_PATHS_DATA.flatMap((p) => p.worksheets).map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => setActiveWorksheet(ws)}
                    className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] hover:border-teal-500 hover:bg-[#0e1724] transition cursor-pointer space-y-3 group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800 uppercase font-semibold">
                          Worksheet
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ws.estimatedTimeMinutes} min
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                        {ws.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {ws.objectives[0]}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-teal-400 font-semibold">
                      <span>Open Problem Set</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View 5: Progress & History Dashboard */}
          {activeTab === 'progress' && <ProgressDashboard progress={progress} />}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#142232] bg-[#060b12] flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Curriculum version 2.4 — Materials Science & Metallurgy Academic Directorate</span>
          <span>
            {progress.completedLessonIds.length} of{' '}
            {LEARNING_PATHS_DATA.reduce((acc, p) => acc + p.lessons.length, 0)} Completed
          </span>
        </div>
      </div>
    </div>
  );
};
