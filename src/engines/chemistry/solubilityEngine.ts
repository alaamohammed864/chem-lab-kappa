// Solubility & Ksp Equilibrium Engine
// Computes Molar Solubility (mol/L), Mass Solubility (g/L), Common Ion Effect, and Precipitation Prediction (Q vs Ksp)

import { SOLUBILITY_DATA, SolubilityEntry } from '../../data/solubilityData';
import { computeMolarMassEngine } from './molarMassEngine';

export type SolubilityCalculationMode =
  | 'molar_solubility'
  | 'solubility_from_ksp'
  | 'common_ion_effect'
  | 'precipitation_quotient'
  | 'precipitate_check'
  | 'qualitative_rules';

export interface SolubilityInputs {
  mode: SolubilityCalculationMode;
  saltFormula?: string;
  kspValue?: number;
  // Common ion effect input
  commonIon?: 'cation' | 'anion';
  commonIonType?: 'cation' | 'anion';
  commonIonConcentrationM?: number;
  commonIonMolarity?: number;
  // Precipitation prediction input
  cationConcentrationM?: number;
  anionConcentrationM?: number;
  // Solution volume for total dissolved mass calculation
  volumeLiters?: number;
}

export interface SolubilityResult {
  mode: SolubilityCalculationMode;
  saltFormula: string;
  saltName: string;
  ksp: number;
  molarMass: number;
  // Dissociation stoichiometry: MmXn -> m M + n X
  cationMultiplier: number;
  anionMultiplier: number;
  dissociationEquation: string;
  // Solubility outputs
  molarSolubilityMolPerL: number; // s
  molarSolubilityMolL?: number;   // alias
  massSolubilityGPerL: number;    // g/L
  massSolubilityGPer100mL: number;// g/100 mL
  // Precipitation prediction
  reactionQuotientQ?: number;
  precipitationExpected?: boolean;
  willPrecipitate?: boolean;      // alias
  saturationState?: 'Unsaturated (No precipitate)' | 'Saturated (Dynamic Equilibrium)' | 'Supersaturated (Precipitation Occurs)';
  // Common ion effect comparison
  commonIonSuppressionFactor?: number;
  // General rules
  qualitativeRuleSummary?: string;
  isValid: boolean;
  errors: string[];
  units: {
    ksp: string;
    molarSolubility: string;
    massSolubility: string;
  };
  explanation: string[];
  assumptions: string[];
}

export function computeSolubilityEngine(inputs: SolubilityInputs): SolubilityResult {
  const errors: string[] = [];
  const explanation: string[] = [];
  const volumeL = inputs.volumeLiters && inputs.volumeLiters > 0 ? inputs.volumeLiters : 1.0;

  const defaultUnits = {
    ksp: 'Dimensionless equilibrium constant',
    molarSolubility: 'mol/L',
    massSolubility: 'g/L',
  };

  const assumptions: string[] = [
    'Pure aqueous solution at standard temperature (25°C).',
    'Negligible complex-ion formation or hydrolysis of ions unless specified.',
    'Activity coefficients approximated as γ ≈ 1.00 for sparingly soluble salts.',
  ];

  const emptyResult = (errs: string[]): SolubilityResult => ({
    mode: inputs.mode,
    saltFormula: inputs.saltFormula || '',
    saltName: 'Unknown Salt',
    ksp: 0,
    molarMass: 0,
    cationMultiplier: 1,
    anionMultiplier: 1,
    dissociationEquation: '',
    molarSolubilityMolPerL: 0,
    massSolubilityGPerL: 0,
    massSolubilityGPer100mL: 0,
    isValid: false,
    errors: errs,
    units: defaultUnits,
    explanation: errs,
    assumptions,
  });

  try {
    let entry: SolubilityEntry | undefined;
    if (inputs.saltFormula) {
      const clean = inputs.saltFormula.trim().toUpperCase();
      entry = SOLUBILITY_DATA.find(
        (s) => s.formula.toUpperCase() === clean || s.name.toUpperCase() === clean
      );
    }

    let ksp = inputs.kspValue || (entry ? entry.ksp : 0);
    const saltFormula = inputs.saltFormula || (entry ? entry.formula : 'Salt');
    const saltName = entry?.name || saltFormula;
    let m = entry?.cationCount || 1;
    let n = entry?.anionCount || 1;

    // Deduce cation and anion stoichiometry if not in dataset
    if (!entry && inputs.saltFormula) {
      const mm = computeMolarMassEngine({ formula: inputs.saltFormula });
      // Default to 1:1 if not found
      m = 1;
      n = 1;
    }

    // Compute molar mass
    let molarMass = entry?.molarMass || 0;
    if (molarMass <= 0 && saltFormula) {
      const mmRes = computeMolarMassEngine({ formula: saltFormula });
      if (mmRes.isValid && mmRes.totalMolarMass > 0) {
        molarMass = mmRes.totalMolarMass;
      }
    }

    if (inputs.mode === 'qualitative_rules') {
      const rule = evaluateQualitativeSolubility(saltFormula);
      return {
        mode: 'qualitative_rules',
        saltFormula,
        saltName,
        ksp,
        molarMass,
        cationMultiplier: m,
        anionMultiplier: n,
        dissociationEquation: `${saltFormula}(s) ⇌ ${m > 1 ? m : ''}Cation + ${n > 1 ? n : ''}Anion`,
        molarSolubilityMolPerL: 0,
        massSolubilityGPerL: 0,
        massSolubilityGPer100mL: 0,
        qualitativeRuleSummary: rule,
        isValid: true,
        errors: [],
        units: defaultUnits,
        explanation: [rule],
        assumptions,
      };
    }

    if (ksp <= 0) {
      errors.push('A positive Ksp equilibrium constant is required for quantitative calculations.');
      return emptyResult(errors);
    }

    const cationSymbol = entry?.cation || 'Mⁿ⁺';
    const anionSymbol = entry?.anion || 'Xᵐ⁻';
    const dissocEq = `${saltFormula}(s) ⇌ ${m > 1 ? m : ''}${cationSymbol} + ${n > 1 ? n : ''}${anionSymbol}`;

    // Pure molar solubility s = (Ksp / (m^m * n^n)) ^ (1 / (m + n))
    const prefactor = Math.pow(m, m) * Math.pow(n, n);
    const totalExponent = m + n;
    const pureSolubilityMolPerL = Math.pow(ksp / prefactor, 1 / totalExponent);
    let finalMolarSolubility = pureSolubilityMolPerL;
    let commonFactor: number | undefined;

    explanation.push(`Dissociation Equilibrium: ${dissocEq}`);
    explanation.push(`Solubility Product Expression: Ksp = [${cationSymbol}]ᵐ · [${anionSymbol}]ⁿ = (${m}s)ᵐ · (${n}s)ⁿ = ${prefactor} · s^${totalExponent} = ${ksp.toExponential(3)}`);
    explanation.push(
      `Pure Molar Solubility: s = (${ksp.toExponential(3)} ÷ ${prefactor})^(1/${totalExponent}) = ${pureSolubilityMolPerL.toExponential(4)} mol/L`
    );

    // Common Ion Effect mode
    if (inputs.mode === 'common_ion_effect') {
      const cIonConc = inputs.commonIonConcentrationM || inputs.commonIonMolarity || 0;
      const cIonType = inputs.commonIon || inputs.commonIonType || 'anion';
      if (cIonConc <= 0) {
        errors.push('Common ion concentration must be strictly positive.');
        return emptyResult(errors);
      }

      // If common ion is anion, [anion] ≈ n * cIonConc (assuming common ion >> dissolved amount)
      // Ksp = (m*s)^m * (commonConc)^n  =>  s = ( Ksp / (m^m * commonConc^n) )^(1/m)
      if (cIonType === 'cation') {
        const effConc = m * cIonConc;
        finalMolarSolubility = Math.pow(ksp / (Math.pow(effConc, m) * Math.pow(n, n)), 1 / n);
      } else {
        const effConc = n * cIonConc;
        finalMolarSolubility = Math.pow(ksp / (Math.pow(m, m) * Math.pow(effConc, n)), 1 / m);
      }

      commonFactor = pureSolubilityMolPerL / finalMolarSolubility;
      explanation.push(
        `Common Ion Effect: In the presence of ${cIonConc.toExponential(3)} M common ion, equilibrium shifts left (Le Chatelier principle).`
      );
      explanation.push(
        `Suppressed Solubility s' = ${finalMolarSolubility.toExponential(4)} mol/L (Solubility decreased by ${commonFactor.toFixed(1)}×).`
      );
    }

    // Precipitation Quotient Mode (Q vs Ksp)
    let reactionQ: number | undefined;
    let precipExpected: boolean | undefined;
    let satState: 'Unsaturated (No precipitate)' | 'Saturated (Dynamic Equilibrium)' | 'Supersaturated (Precipitation Occurs)' | undefined;

    if (inputs.mode === 'precipitation_quotient' || inputs.mode === 'precipitate_check') {
      const catConc = inputs.cationConcentrationM || 0;
      const anConc = inputs.anionConcentrationM || 0;
      if (catConc <= 0 || anConc <= 0) {
        errors.push('Both cation and anion concentrations must be strictly positive to calculate reaction quotient Q.');
        return emptyResult(errors);
      }

      reactionQ = Math.pow(catConc, m) * Math.pow(anConc, n);
      explanation.push(`Ion Product (Reaction Quotient): Q_sp = [${cationSymbol}]ᵐ · [${anionSymbol}]ⁿ = (${catConc.toExponential(3)})^${m} × (${anConc.toExponential(3)})^${n} = ${reactionQ.toExponential(4)}`);

      if (reactionQ > ksp * 1.01) {
        precipExpected = true;
        satState = 'Supersaturated (Precipitation Occurs)';
        explanation.push(`Q_sp (${reactionQ.toExponential(3)}) > K_sp (${ksp.toExponential(3)}): System exceeds equilibrium saturation. Precipitate WILL form until Q = Ksp.`);
      } else if (Math.abs(reactionQ - ksp) / ksp < 0.01) {
        precipExpected = false;
        satState = 'Saturated (Dynamic Equilibrium)';
        explanation.push(`Q_sp ≈ K_sp: Solution is precisely saturated at dynamic dissolution-precipitation equilibrium.`);
      } else {
        precipExpected = false;
        satState = 'Unsaturated (No precipitate)';
        explanation.push(`Q_sp (${reactionQ.toExponential(3)}) < K_sp (${ksp.toExponential(3)}): Solution is unsaturated. All ions remain completely dissolved; no precipitate forms.`);
      }
    }

    const massSolGPerL = finalMolarSolubility * (molarMass > 0 ? molarMass : 1);
    const massSolGPer100mL = massSolGPerL / 10;

    explanation.push(`Mass Solubility: ${massSolGPerL.toExponential(3)} g/L (${massSolGPer100mL.toExponential(3)} g per 100 mL H₂O at 25°C)`);

    return {
      mode: inputs.mode,
      saltFormula,
      saltName,
      ksp,
      molarMass: Number(molarMass.toFixed(3)),
      cationMultiplier: m,
      anionMultiplier: n,
      dissociationEquation: dissocEq,
      molarSolubilityMolPerL: Number(finalMolarSolubility.toPrecision(5)),
      molarSolubilityMolL: Number(finalMolarSolubility.toPrecision(5)),
      massSolubilityGPerL: Number(massSolGPerL.toPrecision(5)),
      massSolubilityGPer100mL: Number(massSolGPer100mL.toPrecision(5)),
      reactionQuotientQ: reactionQ !== undefined ? Number(reactionQ.toPrecision(4)) : undefined,
      precipitationExpected: precipExpected,
      willPrecipitate: precipExpected,
      saturationState: satState,
      commonIonSuppressionFactor: commonFactor ? Number(commonFactor.toFixed(2)) : undefined,
      isValid: true,
      errors: [],
      units: defaultUnits,
      explanation,
      assumptions,
    };
  } catch (err: any) {
    errors.push(err?.message || 'Error calculating solubility equilibrium.');
    return emptyResult(errors);
  }
}

function evaluateQualitativeSolubility(formula: string): string {
  const f = formula.toUpperCase();

  if (f.includes('NO3') || f.includes('CLO3') || f.includes('CH3COO')) {
    return 'Soluble: All nitrates (NO₃⁻), chlorates (ClO₃⁻), and acetates (CH₃COO⁻) are universally soluble in water.';
  }
  if (f.startsWith('NA') || f.startsWith('K') || f.startsWith('LI') || f.startsWith('NH4')) {
    return 'Soluble: All alkali metal cations (Group 1: Li⁺, Na⁺, K⁺) and ammonium (NH₄⁺) salts are completely soluble.';
  }
  if (f.includes('SO4')) {
    if (f.includes('BA') || f.includes('PB') || f.includes('SR') || f.includes('CA')) {
      return 'Insoluble / Sparingly Soluble: Most sulfates are soluble, EXCEPT BaSO₄, PbSO₄, SrSO₄, and sparingly CaSO₄.';
    }
    return 'Soluble: Sulfates (SO₄²⁻) are generally soluble with standard metal counterions.';
  }
  if (f.includes('CL') || f.includes('BR') || f.includes('I')) {
    if (f.includes('AG') || f.includes('PB') || f.includes('HG')) {
      return 'Insoluble: Halides (Cl⁻, Br⁻, I⁻) are generally soluble EXCEPT Ag⁺, Pb²⁺, and Hg₂²⁺.';
    }
    return 'Soluble: Standard halide salts dissolve readily in aqueous solution.';
  }
  if (f.includes('CO3') || f.includes('PO4') || f.includes('S') || f.includes('OH')) {
    return 'Insoluble / Sparingly Soluble: Carbonates (CO₃²⁻), phosphates (PO₄³⁻), sulfides (S²⁻), and hydroxides (OH⁻) are insoluble, except when paired with alkali metals (Group 1) or ammonium.';
  }

  return 'Moderately or Sparingly Soluble depending on temperature and lattice energy.';
}

export const calculateSolubilityEngine = computeSolubilityEngine;
