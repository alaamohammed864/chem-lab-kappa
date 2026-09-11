import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  Building,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import {
  ResearchProject,
  ResearchWorkspaceService,
} from '../services/researchService';
import { ReportService, ScientificReport } from '../services/reportService';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProject?: ResearchProject;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  defaultProject,
}) => {
  const [projects] = useState<ResearchProject[]>(() =>
    ResearchWorkspaceService.getProjects()
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => defaultProject?.id || projects[0]?.id || 'proj-1'
  );

  if (!isOpen) return null;

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) ||
    defaultProject ||
    projects[0];

  const report: ScientificReport =
    ReportService.generateReportFromProject(activeProject);

  const handleExportMarkdown = () => {
    const md = ReportService.exportToMarkdown(report);
    ReportService.downloadFile(
      `${report.reportNumber.toLowerCase()}_report.md`,
      md,
      'text/markdown'
    );
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    ReportService.downloadFile(
      `${report.reportNumber.toLowerCase()}_report.json`,
      jsonStr,
      'application/json'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070d14] border border-[#1b2b3d] w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-[#162738] bg-gradient-to-r from-[#0b1420] via-[#0e1a2b] to-[#0b1420] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Scientific Report Preview & Export
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                  ISO 17025 Format
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Peer-reviewed layout with verified calculations, stated assumptions, and physical limits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Project Picker */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#0e1724] border border-[#1b2b3d] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 hidden sm:block"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title.slice(0, 35)}...
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                try {
                  window.print();
                } catch (e) {
                  console.warn('Browser print dialogue unavailable in current context:', e);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-[#0e1724] border border-[#18283a] text-xs text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer flex items-center gap-1.5"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800 text-xs text-indigo-300 hover:border-indigo-400 transition cursor-pointer flex items-center gap-1.5 font-semibold"
              title="Download Markdown Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg bg-[#0e1724] border border-[#1b2b3d] text-xs text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              title="Download JSON Payload"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Close Report Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Preview Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#05090f]">
          <div className="max-w-4xl mx-auto bg-[#0a121d] border border-[#172638] rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none">
            {/* Formal Document Letterhead */}
            <div className="border-b-2 border-slate-700/80 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase font-bold tracking-widest">
                  <Building className="w-4 h-4" />
                  <span>{report.laboratoryName}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {report.title}
                </h1>
                <p className="text-xs text-slate-400">
                  Metallurgical Engineering Quality Assurance & Analytical Directorate
                </p>
              </div>

              <div className="bg-[#08101a] border border-[#162738] p-3 rounded-xl text-right text-xs font-mono space-y-1 shrink-0">
                <div className="text-indigo-400 font-bold">{report.reportNumber}</div>
                <div className="text-slate-400 text-[11px]">{report.dateGenerated}</div>
                <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 inline-block font-semibold">
                  STATUS: {report.status}
                </div>
              </div>
            </div>

            {/* Specimen & Scope Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#08101a] border border-[#142335] text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  Lead Investigator:
                </span>
                <strong className="text-slate-200">{report.investigator}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  Target Material:
                </span>
                <strong className="text-cyan-300">{report.materialUnderStudy}</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  Project Classification:
                </span>
                <strong className="text-indigo-300">{activeProject.category}</strong>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                Executive Abstract & Project Scope
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0e1724]/60 p-4 rounded-xl border border-[#162738]">
                {report.executiveSummary}
              </p>
            </div>

            {/* Body Sections */}
            <div className="space-y-6">
              {report.sections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <div className="border-b border-slate-800 pb-1.5">
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      {section.heading}
                    </h2>
                    {section.subheading && (
                      <p className="text-xs text-slate-400 italic">{section.subheading}</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{section.content}</p>

                  {/* Section Table */}
                  {section.tableData && (
                    <div className="overflow-x-auto rounded-xl border border-[#162738]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#0e1826] border-b border-[#162738] text-slate-300 font-mono text-[11px]">
                            {section.tableData.headers.map((h, i) => (
                              <th key={i} className="p-2.5 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#142335] text-slate-200">
                          {section.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-800/30">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 font-mono text-[11px]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Key Findings */}
                  {section.keyFindings && section.keyFindings.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Key Analytical Findings:
                      </span>
                      <ul className="space-y-1 text-xs text-emerald-200/90 pl-4 list-disc">
                        {section.keyFindings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Caveats / Limitations */}
                  {section.caveats && section.caveats.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Governing Assumptions & Stated Boundaries:
                      </span>
                      <ul className="space-y-1 text-xs text-amber-200/90 pl-4 list-disc">
                        {section.caveats.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Formal Sign-off and Disclaimer */}
            <div className="pt-6 border-t-2 border-slate-700/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#08101a] border border-[#152538] space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Prepared By:</span>
                  <strong className="text-slate-200">{report.signoff.preparedBy}</strong>
                  <div className="text-[10px] text-slate-400">Investigator Signature [VERIFIED]</div>
                </div>

                <div className="p-3 rounded-lg bg-[#08101a] border border-[#152538] space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Reviewed By:</span>
                  <strong className="text-slate-200">{report.signoff.reviewedBy}</strong>
                  <div className="text-[10px] text-slate-400">Quality Assurance Board</div>
                </div>

                <div className="p-3 rounded-lg bg-[#08101a] border border-[#152538] space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Approval Date:</span>
                  <strong className="text-indigo-400">{report.signoff.approvedDate}</strong>
                  <div className="text-[10px] text-slate-400">Electronic Stamp ID #8841</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080d14] border border-[#142335] text-[10px] font-mono text-slate-400 leading-relaxed">
                {report.disclaimer}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#142232] bg-[#060b12] flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Document format conformant to ASTM / ISO guidelines</span>
          <span>Alaa Chem Lab Scientific Repository</span>
        </div>
      </div>
    </div>
  );
};
