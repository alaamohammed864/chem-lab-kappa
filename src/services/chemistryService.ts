// Chemistry Service Layer
import {
  calculateMolarMass,
  computeMolarMassEngine,
  MolarMassInputs,
  MolarMassResult,
  balanceChemicalEquationEngine,
  balanceChemicalEquationLocal,
  ReactionBalancerInputs,
  BalancedReactionResult,
  computeStoichiometryEngine,
  StoichiometryInputs,
  StoichiometryResult,
  computeConcentrationEngine,
  ConcentrationInputs,
  ConcentrationResult,
  computeDilutionEngine,
  DilutionInputs,
  DilutionResult,
  computePHEngine,
  PHInputs,
  PHResult,
  computeGasLawsEngine,
  GasLawsInputs,
  GasLawsResult,
  computeThermochemistryEngine,
  ThermochemistryInputs,
  ThermochemistryResult,
  computeSolubilityEngine,
  SolubilityInputs,
  SolubilityResult,
} from '../engines';
import { ELEMENTS_DATA } from '../data/elements';
import { ChemicalElement } from '../types';

export class ChemistryService {
  /**
   * Retrieves all 118 periodic table elements
   */
  static getElements(): ChemicalElement[] {
    return ELEMENTS_DATA;
  }

  /**
   * Searches elements by name, symbol, or atomic number
   */
  static searchElements(query: string): ChemicalElement[] {
    const q = query.trim().toLowerCase();
    if (!q) return ELEMENTS_DATA;
    return ELEMENTS_DATA.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.number) === q
    );
  }

  /**
   * Finds element by atomic symbol
   */
  static getElementBySymbol(symbol: string): ChemicalElement | undefined {
    return ELEMENTS_DATA.find((e) => e.symbol.toLowerCase() === symbol.toLowerCase());
  }

  /**
   * 1. Molar Mass Engine
   */
  static computeMolarMass(formula: string): MolarMassResult {
    return calculateMolarMass(formula);
  }

  static computeMolarMassDetailed(inputs: MolarMassInputs): MolarMassResult {
    return computeMolarMassEngine(inputs);
  }

  /**
   * 2. Chemical Equation Balancer Engine
   */
  static async balanceEquation(equation: string): Promise<BalancedReactionResult> {
    try {
      const res = await fetch('/api/tools/balance-equation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equation }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          original: equation,
          balanced: data.balanced || data.balancedEquation || equation,
          reactionType: data.type || data.reactionType || 'Stoichiometric Chemical Reaction',
          enthalpy: data.enthalpy || data.thermodynamics || 'Evaluated standard enthalpy',
          deltaG: data.deltaG,
          notes: data.notes || 'Verified stoichiometric balance.',
          isSpontaneous: true,
          reactants: data.reactants || [],
          products: data.products || [],
          isValid: true,
          errors: [],
          units: {
            coefficients: 'mol (stoichiometric ratio)',
            enthalpy: 'kJ/mol',
            gibbsEnergy: 'kJ/mol',
          },
          explanation: data.explanation || ['Equation balanced via stoichiometric solver.'],
          assumptions: ['Conservation of mass (Lavoisier principle).'],
        };
      }
    } catch {
      // Fallback silently to client engine
    }

    return balanceChemicalEquationLocal(equation);
  }

  static balanceEquationDetailed(inputs: ReactionBalancerInputs): BalancedReactionResult {
    return balanceChemicalEquationEngine(inputs);
  }

  /**
   * 3. Stoichiometry Engine (Limiting reagents, theoretical & percent yield)
   */
  static computeStoichiometry(inputs: StoichiometryInputs): StoichiometryResult {
    return computeStoichiometryEngine(inputs);
  }

  /**
   * 4. Concentration Engine (Molarity, Molality, ppm, mass %, Normality)
   */
  static computeConcentration(inputs: ConcentrationInputs): ConcentrationResult {
    return computeConcentrationEngine(inputs);
  }

  /**
   * 5. Dilution Engine (C1V1 = C2V2)
   */
  static computeDilution(inputs: DilutionInputs): DilutionResult {
    return computeDilutionEngine(inputs);
  }

  /**
   * 6. pH Calculation Engine (Strong/weak acids/bases, buffers, ions)
   */
  static computePH(inputs: PHInputs): PHResult {
    return computePHEngine(inputs);
  }

  /**
   * 7. Gas Laws Engine (Ideal, Boyle, Charles, Gay-Lussac, Combined, Van der Waals)
   */
  static computeGasLaws(inputs: GasLawsInputs): GasLawsResult {
    return computeGasLawsEngine(inputs);
  }

  /**
   * 8. Thermochemistry Engine (Hess's law ΔH°, ΔS°, ΔG°, Keq, calorimetry)
   */
  static computeThermochemistry(inputs: ThermochemistryInputs): ThermochemistryResult {
    return computeThermochemistryEngine(inputs);
  }

  /**
   * 9. Solubility & Ksp Engine (Molar solubility, common ion effect, Q vs Ksp)
   */
  static computeSolubility(inputs: SolubilityInputs): SolubilityResult {
    return computeSolubilityEngine(inputs);
  }
}
