import React, { useState } from 'react';
import {
  Zap,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  CORROSION_ALLOYS,
  evaluateGalvanicPair,
} from '../../engines/materials/corrosionEngine';

export const CorrosionGalvanicMatrix: React.FC = () => {
  const [metalAId, setMetalAId] = useState<string>('carbon-steel-1018');
  const [metalBId, setMetalBId] = useState<string>('ss-316l');
  const [areaRatio, setAreaRatio] = useState<number>(1.0); // Cathode to Anode area ratio

  const pairResult = evaluateGalvanicPair(metalAId, metalBId, areaRatio);
  const metalA = CORROSION_ALLOYS[metalAId];
  const metalB = CORROSION_ALLOYS[metalBId];

  return (
    <div className="space-y-4">
      {/* Top Description */}
      <div className="bg-[#0b131d] border border-[#162738] rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
        Bimetallic galvanic corrosion occurs when two electrically coupled dissimilar alloys are immersed in a common conductive electrolyte.
        The less noble alloy acts as an <strong>anode</strong> (corrodes sacrificially), while the more noble alloy becomes the protected <strong>cathode</strong>.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Galvanic Coupling Setup
            </span>
            <span className="text-[10px] font-mono text-slate-500">Seawater Scale (SCE)</span>
          </div>

          {/* Metal A Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Alloy Component A:</span>
              <span className="font-mono text-[11px] text-cyan-300">{metalA.standardPotentialVSCE} V vs SCE</span>
            </label>
            <select
              value={metalAId}
              onChange={(e) => setMetalAId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e1724] border border-[#1a2d40] text-xs text-slate-200 cursor-pointer"
            >
              {Object.values(CORROSION_ALLOYS).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>

          {/* Metal B Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Alloy Component B:</span>
              <span className="font-mono text-[11px] text-cyan-300">{metalB.standardPotentialVSCE} V vs SCE</span>
            </label>
            <select
              value={metalBId}
              onChange={(e) => setMetalBId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e1724] border border-[#1a2d40] text-xs text-slate-200 cursor-pointer"
            >
              {Object.values(CORROSION_ALLOYS).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>

          {/* Cathode-to-Anode Area Ratio Slider */}
          <div className="space-y-2 p-3 rounded-lg bg-[#0e1724] border border-[#182a3d]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Area Ratio (A_Cathode / A_Anode):
              </span>
              <span className="font-mono font-bold text-amber-300">{areaRatio.toFixed(1)} : 1</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={10.0}
              step={0.1}
              value={areaRatio}
              onChange={(e) => setAreaRatio(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>0.1:1 (Favorable: Large Anode)</span>
              <span>1:1 (Equal)</span>
              <span className="text-rose-400">10:1 (Hazard: Large Cathode)</span>
            </div>
          </div>
        </div>

        {/* Right Evaluation & Anode/Cathode Identification (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b131d] border border-[#162738] rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Coupling Analysis & Polarity
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                pairResult.riskLevel === 'Severe' ? 'bg-rose-950 text-rose-300 border border-rose-700' :
                pairResult.riskLevel === 'High' ? 'bg-rose-900/50 text-rose-300 border border-rose-700' :
                pairResult.riskLevel === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                pairResult.riskLevel === 'Low' ? 'bg-teal-950 text-teal-300 border border-teal-700' :
                'bg-emerald-950 text-emerald-300 border border-emerald-700'
              }`}>
                {pairResult.riskLevel} Galvanic Risk
              </span>
            </div>

            {/* Anode / Cathode Cards */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Anode Card */}
              <div className="p-3 rounded-xl bg-[#1a1114] border border-rose-900/40 space-y-1">
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  ANODE (Sacrificial Target)
                </span>
                <div className="text-sm font-bold text-white truncate">{pairResult.anodeMaterial.name}</div>
                <div className="text-[11px] font-mono text-rose-300">
                  {pairResult.anodeMaterial.standardPotentialVSCE} V vs SCE
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Suffers accelerated oxidation and mass dissolution.
                </div>
              </div>

              {/* Cathode Card */}
              <div className="p-3 rounded-xl bg-[#0e1c24] border border-cyan-900/40 space-y-1">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CATHODE (Noble / Protected)
                </span>
                <div className="text-sm font-bold text-white truncate">{pairResult.cathodeMaterial.name}</div>
                <div className="text-[11px] font-mono text-cyan-300">
                  {pairResult.cathodeMaterial.standardPotentialVSCE} V vs SCE
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Cathodically protected; reduction of O₂ occurs here.
                </div>
              </div>
            </div>

            {/* Voltage Difference & Driving Force */}
            <div className="p-3 rounded-xl bg-[#0f1926] border border-[#1a2e44] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Galvanic Driving Voltage Difference (ΔE):</span>
                <span className="font-mono text-base font-extrabold text-amber-300">
                  {pairResult.potentialDifferenceV.toFixed(3)} V
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0a121c] p-2.5 rounded-lg border border-slate-800">
                {pairResult.recommendation}
              </p>
            </div>
          </div>

          {/* Area Ratio Golden Rule Notice */}
          <div className="p-2.5 rounded bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Rule of Thumb:</strong> Never use a small active anode fastened to a large noble cathode (e.g. carbon steel rivets in a stainless steel or bronze plate). The concentrated anodic current density will rapidly shear the fasteners.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
