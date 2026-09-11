import React from 'react';
import { Award, CheckCircle2, Clock, History, BarChart3, BookOpen, FileCheck } from 'lucide-react';
import { UserProgressRecord, LEARNING_PATHS_DATA } from '../../engines/education/educationEngine';

interface ProgressDashboardProps {
  progress: UserProgressRecord;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ progress }) => {
  const totalLessonsCount = LEARNING_PATHS_DATA.reduce((acc, p) => acc + p.lessons.length, 0);
  const completedCount = progress.completedLessonIds.length;
  const overallPct = Math.round((completedCount / totalLessonsCount) * 100);

  const quizEntries = Object.values(progress.quizScores) as Array<{ score: number; total: number }>;
  const avgQuizScore =
    quizEntries.length > 0
      ? Math.round(
          (quizEntries.reduce((acc: number, q) => acc + q.score / q.total, 0) / quizEntries.length) * 100
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0b131d] border border-[#162738] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Completed Lessons</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {completedCount} <span className="text-xs text-slate-500 font-normal">/ {totalLessonsCount}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
            <div
              className="h-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0b131d] border border-[#162738] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Overall Mastery</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{overallPct}%</div>
          <p className="text-[10px] text-slate-400">Across 3 core learning tracks</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0b131d] border border-[#162738] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Average Quiz Score</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{avgQuizScore}%</div>
          <p className="text-[10px] text-slate-400">{quizEntries.length} evaluation quizzes taken</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0b131d] border border-[#162738] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Laboratory Worksheets</span>
            <FileCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">3 Available</div>
          <p className="text-[10px] text-slate-400">XRD, Galvanic & RT problem sets</p>
        </div>
      </div>

      {/* Track Progress Breakdown */}
      <div className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] space-y-3">
        <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
          Curriculum Track Progress
        </h4>

        <div className="space-y-2.5">
          {LEARNING_PATHS_DATA.map((path) => {
            const pathPct = progress.learningPathProgressPct[path.id] || 0;
            const completedInPath = path.lessons.filter((l) =>
              progress.completedLessonIds.includes(l.id)
            ).length;

            return (
              <div
                key={path.id}
                className="p-3 rounded-lg bg-[#0e1724] border border-[#18283a] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{path.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({completedInPath} of {path.lessons.length} lessons)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-cyan-400">{pathPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${pathPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity History Log */}
      <div className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Learning & Verification History
          </h4>
          <span className="text-[10px] font-mono text-slate-500">Chronological Log</span>
        </div>

        <div className="space-y-2">
          {progress.activityHistory && progress.activityHistory.length > 0 ? (
            progress.activityHistory.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-medium text-slate-200">{item.title}</span>
                    {item.details && (
                      <span className="text-[11px] text-slate-400 ml-2 font-mono">
                        [{item.details}]
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.timestamp}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic py-2">No learning activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
