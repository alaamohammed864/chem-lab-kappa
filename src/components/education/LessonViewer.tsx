import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle, Clock, BarChart3, HelpCircle } from 'lucide-react';
import { Lesson, EducationService } from '../../engines/education/educationEngine';
import { PracticeQuiz } from './PracticeQuiz';

interface LessonViewerProps {
  lesson: Lesson;
  pathId: string;
  onLessonFinished?: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  pathId,
  onLessonFinished,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'theory' | 'quiz'>('theory');
  const [completed, setCompleted] = useState(false);

  const handleQuizComplete = (score: number, total: number) => {
    EducationService.recordLessonCompletion(lesson.id, score, total, pathId);
    setCompleted(true);
    if (onLessonFinished) {
      onLessonFinished();
    }
  };

  return (
    <div className="space-y-4">
      {/* Lesson Header Banner */}
      <div className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-semibold">
              {lesson.difficulty}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lesson.durationMinutes} min read & practice
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-wide">{lesson.title}</h2>
          <p className="text-xs text-slate-300 max-w-3xl">{lesson.summary}</p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-[#08101a] p-1 rounded-lg border border-[#162637]">
          <button
            onClick={() => setActiveSubTab('theory')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'theory'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lesson Theory</span>
          </button>

          <button
            onClick={() => setActiveSubTab('quiz')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'quiz'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Practice Quiz ({lesson.practiceQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'theory' && (
        <div className="space-y-4">
          {lesson.sections.map((section, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-xl bg-[#0b131d] border border-[#162738] space-y-3"
            >
              <h3 className="text-sm font-bold text-cyan-300 tracking-wide border-b border-slate-800/80 pb-2">
                {section.heading}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">{section.content}</p>

              {/* Key Points */}
              {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="p-3 rounded-lg bg-[#0e1724] border border-[#18293c] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    Key Conceptual Rules:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-200 pl-4 list-disc marker:text-cyan-400">
                    {section.keyPoints.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Equations */}
              {section.equations && section.equations.length > 0 && (
                <div className="p-3 rounded-lg bg-[#070e17] border border-cyan-900/40 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                    Governing Formulations:
                  </span>
                  <div className="space-y-1">
                    {section.equations.map((eq, eIdx) => (
                      <div
                        key={eIdx}
                        className="px-3 py-1.5 rounded bg-black/40 border border-slate-800 font-mono text-xs text-cyan-200 tracking-wide"
                      >
                        {eq}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Bottom Next Action */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-cyan-950/40 border border-indigo-900/50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Ready to verify comprehension?</h4>
              <p className="text-[11px] text-slate-400">
                Complete the {lesson.practiceQuestions.length} practice questions to earn certification credit.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('quiz')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>Start Practice Questions</span>
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'quiz' && (
        <PracticeQuiz
          questions={lesson.practiceQuestions}
          lessonId={lesson.id}
          pathId={pathId}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};
