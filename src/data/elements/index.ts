import { ChemicalElement } from '../../types';
import { ELEMENTS_1_TO_20 } from './elements1_20';
import { ELEMENTS_21_TO_40 } from './elements21_40';
import { ELEMENTS_41_TO_60 } from './elements41_60';
import { ELEMENTS_61_TO_80 } from './elements61_80';
import { ELEMENTS_81_TO_100 } from './elements81_100';
import { ELEMENTS_101_TO_118 } from './elements101_118';

export const ELEMENTS_DATA: ChemicalElement[] = [
  ...ELEMENTS_1_TO_20,
  ...ELEMENTS_21_TO_40,
  ...ELEMENTS_41_TO_60,
  ...ELEMENTS_61_TO_80,
  ...ELEMENTS_81_TO_100,
  ...ELEMENTS_101_TO_118,
];

// Hash maps for fast O(1) lookups across the app
export const ELEMENTS_BY_NUMBER = new Map<number, ChemicalElement>(
  ELEMENTS_DATA.map((el) => [el.number, el])
);

export const ELEMENTS_BY_SYMBOL = new Map<string, ChemicalElement>(
  ELEMENTS_DATA.map((el) => [el.symbol.toUpperCase(), el])
);

export function getElementByNumber(num: number): ChemicalElement | undefined {
  return ELEMENTS_BY_NUMBER.get(num);
}

export function getElementBySymbol(symbol: string): ChemicalElement | undefined {
  return ELEMENTS_BY_SYMBOL.get(symbol.trim().toUpperCase());
}

export function searchElements(query: string): ChemicalElement[] {
  const q = query.trim().toLowerCase();
  if (!q) return ELEMENTS_DATA;

  return ELEMENTS_DATA.filter((el) =>
    el.name.toLowerCase().includes(q) ||
    el.symbol.toLowerCase().includes(q) ||
    el.number.toString() === q ||
    el.category.toLowerCase().includes(q) ||
    (el.block && el.block.toLowerCase() === q) ||
    (el.phase && el.phase.toLowerCase() === q) ||
    (el.summary && el.summary.toLowerCase().includes(q))
  );
}
