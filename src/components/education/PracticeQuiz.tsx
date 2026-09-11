import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Award } from 'lucide-react';
import { PracticeQuestion } from '../../engines/education/educationEngine';

interface PracticeQuizProps {
  questions: PracticeQuestion[];
  lessonId: string;
  pathId: string;
  onComplete: (score: number, total: number) => void;
}

export const PracticeQuiz: React.FC<PracticeQuizProps> = ({
  questions,
  lessonId,
  pathId,
  onComplete,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correct += 1;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    onComplete(score, questions.length);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();
  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#1b2b3d] pb-2.5">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Knowledge Verification & Practice</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              {questions.length} Questions
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            Select the most accurate physical principle or mathematical formulation.
          </p>
        </div>

        {submitted && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
            </span>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Retake Quiz"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const userChoice = selectedAnswers[qIdx];
          const isCorrect = userChoice === q.correctOptionIndex;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-xl border transition ${
                submitted
                  ? isCorrect
                    ? 'bg-emerald-950/20 border-emerald-900/60'
                    : 'bg-rose-950/20 border-rose-900/60'
                  : 'bg-[#0b131d] border-[#162738]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-bold text-slate-200">
                  <span className="font-mono text-cyan-400 mr-1.5">Q{qIdx + 1}.</span>
                  {q.question}
                </span>

                {submitted && (
                  <div>
                    {isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 text-xs font-semibold">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  let optStyle = 'bg-[#0f1a26] border-[#1a2d40] text-slate-300 hover:border-slate-600';

                  if (submitted) {
                    if (optIdx === q.correctOptionIndex) {
                      optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected) {
                      optStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      optStyle = 'bg-[#0f1a26]/40 border-[#1a2d40]/40 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optStyle = 'bg-indigo-950/80 border-indigo-500 text-white font-medium shadow-sm shadow-indigo-950';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex items-center gap-2 ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current/30 flex items-center justify-center text-[10px] font-mono shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-3 p-3 rounded-lg bg-[#08101a] border border-[#142334] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Physical Explanation & Derivation:
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-5">{q.explanation}</p>
                  {q.formulaHint && (
                    <div className="pl-5 pt-1 text-[11px] font-mono text-cyan-300/80">
                      Governing Formulation: {q.formulaHint}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              allAnswered
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>Submit Answers & Record Score</span>
          </button>
        </div>
      )}
    </div>
  );
};
