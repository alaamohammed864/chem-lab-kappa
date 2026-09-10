// Educational Laboratory Safety & Compliance Modal
import React from 'react';
import { ShieldCheck, AlertTriangle, X, CheckCircle, Info, HeartHandshake } from 'lucide-react';

interface SafetyAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

export const SafetyAdvisoryModal: React.FC<SafetyAdvisoryModalProps> = ({
  isOpen,
  onClose,
  isArabic = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d1622] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#18293d] bg-[#09111a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isArabic ? 'إرشادات السلامة والبروتوكول المخبري' : 'Educational Laboratory Safety Protocol'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isArabic ? 'معايير المحاكاة الأكاديمية الآمنة' : 'Safe Academic Simulation Standard & Ethics'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#142334] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 text-xs text-slate-300 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Main Statement */}
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <HeartHandshake className="w-4 h-4" />
              <span>{isArabic ? 'بيئة تعليمية آمنة 100%' : '100% Educational Simulation Environment'}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isArabic
                ? 'تم تصميم هذا المختبر الافتراضي حصرياً للأغراض التعليمية الأكاديمية. تستخدم المحاكاة نماذج رياضية لمركبات غذائية ومحاليل تعليمية مخففة وغير خطرة.'
                : 'This Virtual Laboratory is strictly designed for educational science education. Simulations utilize rigorous physical mathematical equations with benign, non-hazardous substances, food dyes, and simulated solutions.'}
            </p>
          </div>

          {/* Safety Principles Checklist */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200">
              {isArabic ? 'بروتوكولات السلامة المخبرية المعيارية:' : 'Standard Student Laboratory Safety Rules:'}
            </h4>

            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>PPE Requirement:</strong> Always wear ANSI-approved splash goggles, lab coat, and nitrile gloves during physical bench work.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>No Hazardous Procedures:</strong> Dangerous synthesis, toxic energetic reagents, and uncontrolled thermal reactions are completely excluded from this simulation platform.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Proper Waste Disposal:</strong> In physical labs, never pour acids or heavy metal solutions down the drain without neutralization and proper environmental disposal containers.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Eyewash & Safety Shower Awareness:</strong> Locate safety showers, fire blankets, and emergency eye fountains prior to any experiment.
                </span>
              </li>
            </ul>
          </div>

          {/* Academic Integrity Note */}
          <div className="p-2.5 rounded-lg bg-[#09111a] border border-[#142334] text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Physics & Chemistry Engine: </span>
            Simulated values are computed from real first-principles thermodynamics, Beer-Lambert optics, differential reaction kinetics, and ideal gas state equations.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#18293d] bg-[#09111a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition cursor-pointer"
          >
            {isArabic ? 'فهمت وأوافق' : 'Acknowledge & Return to Lab'}
          </button>
        </div>
      </div>
    </div>
  );
};
