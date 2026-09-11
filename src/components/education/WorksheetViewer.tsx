import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ChevronDown, ChevronUp, BookOpen, Printer } from 'lucide-react';
import { Worksheet } from '../../engines/education/educationEngine';
import { ReportService } from '../../services/reportService';

interface WorksheetViewerProps {
  worksheet: Worksheet;
}

export const WorksheetViewer: React.FC<WorksheetViewerProps> = ({ worksheet }) => {
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportWorksheet = () => {
    let text = `# ${worksheet.title}\n`;
    text += `Target Audience: ${worksheet.targetAudience} | Estimated Time: ${worksheet.estimatedTimeMinutes} min\n\n`;
    text += `## Learning Objectives\n`;
    worksheet.objectives.forEach((obj) => (text += `- ${obj}\n`));
    text += `\n---\n\n`;

    worksheet.problems.forEach((prob, idx) => {
      text += `### ${prob.title}\n`;
      text += `${prob.scenario}\n\n`;
      text += `**Given Data:**\n`;
      Object.entries(prob.givenData).forEach(([k, v]) => {
        text += `- ${k}: ${v}\n`;
      });
      text += `\n**Derivation Steps:**\n`;
      prob.stepsToSolve.forEach((step) => (text += `${step}\n`));
      text += `\n**Final Solution:** ${prob.solution}\n`;
      if (prob.standardReference) {
        text += `*Governing Code:* ${prob.standardReference}\n`;
      }
      text += `\n---\n\n`;
    });

    ReportService.downloadFile(
      `${worksheet.id}_worksheet.md`,
      text,
      'text/markdown'
    );
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-wide">{worksheet.title}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
              {worksheet.estimatedTimeMinutes} Min
            </span>
          </div>
          <p className="text-xs text-slate-400">Target Level: {worksheet.targetAudience}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-[#0e1724] border border-[#18283a] text-xs text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
          <button
            onClick={handleExportWorksheet}
            className="px-3 py-1.5 rounded-lg bg-teal-950/70 border border-teal-500/60 text-xs text-teal-200 hover:bg-teal-900 transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>
        </div>
      </div>

      {/* Objectives */}
      <div className="p-3.5 rounded-xl bg-[#08101a] border border-[#132233] space-y-1.5">
        <span className="text-[11px] font-mono uppercase font-bold text-teal-400 tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Laboratory Objectives
        </span>
        <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc marker:text-teal-400">
          {worksheet.objectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </div>

      {/* Problem list */}
      <div className="space-y-3.5">
        {worksheet.problems.map((prob, idx) => {
          const isRevealed = revealedSolutions[prob.id];

          return (
            <div
              key={prob.id}
              className="p-4 rounded-xl bg-[#0b131d] border border-[#162738] space-y-3"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-xs font-mono text-teal-400 font-bold block mb-0.5">
                    PROBLEM #{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white">{prob.title}</h4>
                </div>
                {prob.standardReference && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    {prob.standardReference}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{prob.scenario}</p>

              {/* Given Data Box */}
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#172a3e] space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-slate-400">
                  Given Parameters:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-0.5">
                  {Object.entries(prob.givenData).map(([key, val]) => (
                    <div key={key} className="text-xs text-slate-200">
                      <strong className="text-slate-400">{key}:</strong>{' '}
                      <span className="font-mono text-cyan-300">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggle Solution */}
              <div className="pt-1">
                <button
                  onClick={() => toggleSolution(prob.id)}
                  className="w-full p-2 rounded-lg bg-[#0e1724] border border-[#1b2b3d] hover:border-teal-500/50 text-xs font-semibold text-teal-300 flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400" />
                    {isRevealed ? 'Hide Derivation & Solution Key' : 'Reveal Step-by-Step Derivation & Solution'}
                  </span>
                  {isRevealed ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {isRevealed && (
                  <div className="mt-2 p-3.5 rounded-lg bg-[#08111c] border border-teal-900/40 text-xs space-y-2.5 animate-fadeIn">
                    <span className="text-[10px] font-mono uppercase font-bold text-teal-400">
                      Step-by-Step Solution Derivation:
                    </span>
                    <ol className="space-y-1.5 list-decimal pl-4 text-slate-200 leading-relaxed font-mono text-[11px]">
                      {prob.stepsToSolve.map((step, sIdx) => (
                        <li key={sIdx} className="pl-1">
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className="p-2.5 rounded bg-teal-950/60 border border-teal-800 text-xs text-teal-200 font-semibold">
                      Final Answer: {prob.solution}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
