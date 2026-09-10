// Formula Parser & Chemical Tokenizer Engine
// Supports standard symbols, nested parentheses, brackets, hydrates (· / * / .), and polyatomic ions
import { ELEMENTS_DATA } from '../../data/elements';

export interface ChemicalToken {
  symbol: string;
  count: number;
  name?: string;
  atomicMass?: number;
}

export interface FormulaValidationResult {
  isValid: boolean;
  error?: string;
  counts?: Record<string, number>;
  tokens?: ChemicalToken[];
  formatted?: string;
}

const KNOWN_ELEMENT_MAP = new Map(ELEMENTS_DATA.map((e) => [e.symbol, e]));

export function parseChemicalFormula(formula: string): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!formula) return counts;

  // Clean and normalize whitespace
  let cleaned = formula.replace(/\s+/g, '');
  if (!cleaned) return counts;

  // Replace unicode subscripts with ASCII numbers
  cleaned = cleaned.replace(/[₀-₉]/g, (ch) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(ch)] || ch);

  // Strip ionic charge indicators at the end like ^2-, 3+, 2-, +, -, etc.
  cleaned = cleaned.replace(/\^?[0-9]*[+-]$/, '');

  // Handle hydrates like CuSO4·5H2O, CuSO4*5H2O, or CuSO4.5H2O
  // Split on hydrate separator dot or asterisk
  const hydrateParts = cleaned.split(/[·*]/);
  if (hydrateParts.length > 1) {
    // Parse main salt
    const mainCounts = parseSegmentString(hydrateParts[0]);
    for (const [sym, cnt] of Object.entries(mainCounts)) {
      counts[sym] = (counts[sym] || 0) + cnt;
    }

    // Parse each hydrate segment
    for (let p = 1; p < hydrateParts.length; p++) {
      const part = hydrateParts[p];
      // e.g. 5H2O or H2O
      const match = part.match(/^(\d*)(.*)$/);
      const coeff = match && match[1] ? parseInt(match[1], 10) : 1;
      const subFormula = match && match[2] ? match[2] : part;
      const subCounts = parseSegmentString(subFormula);
      for (const [sym, cnt] of Object.entries(subCounts)) {
        counts[sym] = (counts[sym] || 0) + cnt * coeff;
      }
    }
    return counts;
  }

  // Also check for dot-hydrate like FeSO4.7H2O
  if (cleaned.includes('.') && !/^\d+\.\d+$/.test(cleaned)) {
    const dotParts = cleaned.split('.');
    if (dotParts.length === 2 && (dotParts[1].includes('H2O') || /^\d*H2O/.test(dotParts[1]))) {
      const mainCounts = parseSegmentString(dotParts[0]);
      for (const [sym, cnt] of Object.entries(mainCounts)) {
        counts[sym] = (counts[sym] || 0) + cnt;
      }
      const match = dotParts[1].match(/^(\d*)(.*)$/);
      const coeff = match && match[1] ? parseInt(match[1], 10) : 1;
      const subFormula = match && match[2] ? match[2] : dotParts[1];
      const subCounts = parseSegmentString(subFormula);
      for (const [sym, cnt] of Object.entries(subCounts)) {
        counts[sym] = (counts[sym] || 0) + cnt * coeff;
      }
      return counts;
    }
  }

  return parseSegmentString(cleaned);
}

function parseSegmentString(cleaned: string): Record<string, number> {
  const counts: Record<string, number> = {};

  // Handles nested brackets and parentheses like (NH4)2SO4, Ca3(PO4)2, K4[Fe(CN)6]
  function parseSegment(str: string, multiplier = 1) {
    let i = 0;
    while (i < str.length) {
      if (str[i] === '(' || str[i] === '[') {
        const openChar = str[i];
        const closeChar = openChar === '(' ? ')' : ']';
        let depth = 1;
        let j = i + 1;
        while (j < str.length && depth > 0) {
          if (str[j] === openChar) depth++;
          else if (str[j] === closeChar) depth--;
          j++;
        }
        const innerStr = str.substring(i + 1, j - 1);
        let numStr = '';
        while (j < str.length && /\d/.test(str[j])) {
          numStr += str[j];
          j++;
        }
        const groupMultiplier = (numStr ? parseInt(numStr, 10) : 1) * multiplier;
        parseSegment(innerStr, groupMultiplier);
        i = j;
      } else if (/[A-Z]/.test(str[i])) {
        let sym = str[i];
        let j = i + 1;
        if (j < str.length && /[a-z]/.test(str[j])) {
          sym += str[j];
          j++;
        }
        let numStr = '';
        while (j < str.length && /\d/.test(str[j])) {
          numStr += str[j];
          j++;
        }
        const atomCount = (numStr ? parseInt(numStr, 10) : 1) * multiplier;
        counts[sym] = (counts[sym] || 0) + atomCount;
        i = j;
      } else {
        i++;
      }
    }
  }

  parseSegment(cleaned, 1);
  return counts;
}

/**
 * Tokenizes a formula into an array of constituent chemical tokens
 */
export function tokenizeFormula(formula: string): ChemicalToken[] {
  const counts = parseChemicalFormula(formula);
  return Object.entries(counts).map(([symbol, count]) => {
    const el = KNOWN_ELEMENT_MAP.get(symbol);
    return {
      symbol,
      count,
      name: el?.name,
      atomicMass: el?.atomicMass,
    };
  });
}

/**
 * Thoroughly validates chemical formula for malformed syntax, unbalanced brackets,
 * unknown element symbols, invalid characters, or formatting errors.
 */
export function validateChemicalFormula(rawFormula: string): FormulaValidationResult {
  if (!rawFormula || !rawFormula.trim()) {
    return { isValid: false, error: 'Chemical formula cannot be empty.' };
  }

  const formula = rawFormula.trim();

  // Check for disallowed characters
  const allowedChars = /^[A-Za-z0-9()[\]·*.\^+\- ]+$/;
  if (!allowedChars.test(formula)) {
    const invalidChar = formula.match(/[^A-Za-z0-9()[\]·*.\^+\- ]/)?.[0] || 'character';
    return {
      isValid: false,
      error: `Formula contains invalid character "${invalidChar}". Use standard chemical symbols, parentheses, and numbers.`,
    };
  }

  // Check bracket balance
  const stack: string[] = [];
  for (let i = 0; i < formula.length; i++) {
    const ch = formula[i];
    if (ch === '(' || ch === '[') {
      stack.push(ch);
    } else if (ch === ')') {
      if (stack.pop() !== '(') {
        return { isValid: false, error: 'Mismatched or unclosed parentheses ")" in chemical formula.' };
      }
    } else if (ch === ']') {
      if (stack.pop() !== '[') {
        return { isValid: false, error: 'Mismatched or unclosed square bracket "]" in chemical formula.' };
      }
    }
  }
  if (stack.length > 0) {
    return {
      isValid: false,
      error: `Unclosed bracket "${stack[stack.length - 1]}" in chemical formula.`,
    };
  }

  // Check for empty parentheses
  if (/\(\)|\[\]/.test(formula)) {
    return { isValid: false, error: 'Chemical formula contains empty parentheses or brackets.' };
  }

  // Check for lowercase starting letters that aren't parts of element symbols
  const withoutCoeff = formula.replace(/^\d+/, '').trim();
  if (/^[a-z]/.test(withoutCoeff)) {
    return {
      isValid: false,
      error: `Chemical element symbols must start with a capital letter (e.g. "${withoutCoeff.charAt(0).toUpperCase() + withoutCoeff.slice(1)}").`,
    };
  }

  // Parse counts and verify all elements exist in standard 118 element database
  try {
    const counts = parseChemicalFormula(formula);
    const keys = Object.keys(counts);
    if (keys.length === 0) {
      return { isValid: false, error: 'No recognizable chemical elements found in formula.' };
    }

    for (const sym of keys) {
      if (!KNOWN_ELEMENT_MAP.has(sym)) {
        return {
          isValid: false,
          error: `Unrecognized chemical element symbol "${sym}". Not found in the IUPAC Periodic Table of Elements.`,
        };
      }
    }

    const tokens = tokenizeFormula(formula);
    const formatted = formatChemicalFormula(formula);

    return {
      isValid: true,
      counts,
      tokens,
      formatted,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || 'Syntax error while parsing chemical formula.',
    };
  }
}

export function isValidFormula(formula: string): boolean {
  return validateChemicalFormula(formula).isValid;
}

/**
 * Converts numbers into standard scientific unicode subscripts,
 * while formatting charge indicators into superscripts (e.g., SO4^2- -> SO₄²⁻)
 */
export function formatChemicalFormula(formula: string): string {
  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  };
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻',
  };

  // Convert explicit charge notation like ^2- or 2- at the end
  let res = formula;
  const chargeMatch = res.match(/\^?([0-9]*[+-])$/);
  let chargeStr = '';
  if (chargeMatch) {
    res = res.substring(0, chargeMatch.index);
    chargeStr = chargeMatch[1]
      .split('')
      .map((c) => superscripts[c] || c)
      .join('');
  }

  // Convert remaining numbers into subscripts
  const formattedFormula = res.replace(/\d+/g, (match) => {
    return match.split('').map((ch) => subscripts[ch] || ch).join('');
  });

  return formattedFormula + chargeStr;
}
