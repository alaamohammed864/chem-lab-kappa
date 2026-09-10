// Reusable Property Models and Analytics for Materials Science
import {
  MaterialModel,
  MaterialHardness,
  CorrosionResistanceLevel,
  MaterialAshbyMetrics,
} from './materialModel';

export type MaterialPropertyKey =
  | 'density'
  | 'hardness'
  | 'tensileStrength'
  | 'yieldStrength'
  | 'elasticModulus'
  | 'poissonRatio'
  | 'thermalConductivity'
  | 'meltingPoint'
  | 'electricalConductivity'
  | 'corrosionResistance';

export type PropertyGroup = 'mechanical' | 'thermal' | 'electrical' | 'chemical' | 'physical';

export interface PropertyDefinition {
  key: MaterialPropertyKey;
  name: string;
  nameAr: string;
  symbol: string;
  unit: string;
  group: PropertyGroup;
  description: string;
  descriptionAr: string;
  higherIsBetter: boolean;
  referenceRange: { min: number; max: number }; // Global bounds across all solid materials
  formatValue: (material: MaterialModel) => string;
  getNumericValue: (material: MaterialModel) => number;
}

export const CORROSION_SCORE_MAP: Record<CorrosionResistanceLevel, number> = {
  Poor: 1,
  Low: 2,
  Moderate: 3,
  High: 4,
  'Very High': 5,
  Excellent: 6,
};

export const REVERSE_CORROSION_MAP: Record<number, CorrosionResistanceLevel> = {
  1: 'Poor',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very High',
  6: 'Excellent',
};

/**
 * Reusable Registry of all 10 Core Material Properties
 */
export const PROPERTY_DEFINITIONS: Record<MaterialPropertyKey, PropertyDefinition> = {
  density: {
    key: 'density',
    name: 'Density',
    nameAr: 'الكثافة',
    symbol: 'ρ',
    unit: 'g/cm³',
    group: 'physical',
    description: 'Mass per unit volume of the material at standard 20°C temperature.',
    descriptionAr: 'الكتلة لكل وحدة حجم من المادة عند درجة حرارة 20° مئوية القياسية.',
    higherIsBetter: false, // For structural efficiency, lower density is preferred
    referenceRange: { min: 0.05, max: 20.0 },
    formatValue: (m) => `${m.density.toFixed(2)} g/cm³`,
    getNumericValue: (m) => m.density,
  },
  hardness: {
    key: 'hardness',
    name: 'Hardness',
    nameAr: 'الصلادة',
    symbol: 'H',
    unit: 'HV / Scale',
    group: 'mechanical',
    description: 'Resistance of the material to localized plastic indentation or surface scratching.',
    descriptionAr: 'مقاومة المادة للتغلغل اللدن الموضعي أو الخدش السطحي.',
    higherIsBetter: true,
    referenceRange: { min: 10, max: 3500 },
    formatValue: (m) => `${m.hardness.value} ${m.hardness.scale}`,
    getNumericValue: (m) => m.hardness.approxHV ?? m.hardness.value,
  },
  tensileStrength: {
    key: 'tensileStrength',
    name: 'Tensile Strength (UTS)',
    nameAr: 'مقاومة الشد القصوى',
    symbol: 'σ_UTS',
    unit: 'MPa',
    group: 'mechanical',
    description: 'Maximum engineering stress a material can withstand before necking and fracture.',
    descriptionAr: 'أقصى إجهاد هندسي تتحمله المادة قبل حدوث التخصر والانهيار بالكسر.',
    higherIsBetter: true,
    referenceRange: { min: 10, max: 3500 },
    formatValue: (m) => `${m.tensileStrength.toLocaleString()} MPa`,
    getNumericValue: (m) => m.tensileStrength,
  },
  yieldStrength: {
    key: 'yieldStrength',
    name: 'Yield Strength',
    nameAr: 'إجهاد الخضوع',
    symbol: 'σ_y',
    unit: 'MPa',
    group: 'mechanical',
    description: 'Stress level at which permanent, non-recoverable plastic deformation begins (0.2% offset).',
    descriptionAr: 'مستوى الإجهاد الذي يبدأ عنده التشوه اللدن الدائم غير القابل للاسترجاع (أوفست 0.2%).',
    higherIsBetter: true,
    referenceRange: { min: 5, max: 3000 },
    formatValue: (m) => `${m.yieldStrength.toLocaleString()} MPa`,
    getNumericValue: (m) => m.yieldStrength,
  },
  elasticModulus: {
    key: 'elasticModulus',
    name: "Young's Modulus",
    nameAr: 'معامل يونغ للمرونة',
    symbol: 'E',
    unit: 'GPa',
    group: 'mechanical',
    description: 'Inherent stiffness of atomic bonds, defining the ratio of stress to elastic strain.',
    descriptionAr: 'الجساءة الذاتية للروابط الذرية، معبرة عن نسبة الإجهاد إلى الانفعال المرن.',
    higherIsBetter: true,
    referenceRange: { min: 0.1, max: 1100 },
    formatValue: (m) => `${m.elasticModulus.toLocaleString()} GPa`,
    getNumericValue: (m) => m.elasticModulus,
  },
  poissonRatio: {
    key: 'poissonRatio',
    name: "Poisson's Ratio",
    nameAr: 'نسبة بواسون',
    symbol: 'ν',
    unit: '—',
    group: 'mechanical',
    description: 'Ratio of transverse contraction strain to longitudinal extension strain in uniaxial tension.',
    descriptionAr: 'نسبة الانفعال العرضي الانكماشي إلى الانفعال الطولي الامتدادي تحت الشد أحادي المحور.',
    higherIsBetter: false,
    referenceRange: { min: 0.1, max: 0.5 },
    formatValue: (m) => m.poissonRatio.toFixed(2),
    getNumericValue: (m) => m.poissonRatio,
  },
  thermalConductivity: {
    key: 'thermalConductivity',
    name: 'Thermal Conductivity',
    nameAr: 'الموصلية الحرارية',
    symbol: 'k',
    unit: 'W/(m·K)',
    group: 'thermal',
    description: 'Rate of steady-state heat conduction across unit thickness per unit temperature difference.',
    descriptionAr: 'معدل التوصيل الحراري المستقر عبر وحدة السمك لكل وحدة فرق في درجات الحرارة.',
    higherIsBetter: true,
    referenceRange: { min: 0.01, max: 2000 },
    formatValue: (m) => `${m.thermalConductivity.toFixed(1)} W/m·K`,
    getNumericValue: (m) => m.thermalConductivity,
  },
  meltingPoint: {
    key: 'meltingPoint',
    name: 'Melting / Solidus Point',
    nameAr: 'درجة الانصهار',
    symbol: 'T_m',
    unit: '°C',
    group: 'thermal',
    description: 'Phase change temperature where solid lattice transitions to liquid, or degradation onset.',
    descriptionAr: 'درجة حرارة تحول الشبكة الصلبة إلى الحالة السائلة أو بدء التفكك الحراري.',
    higherIsBetter: true,
    referenceRange: { min: 100, max: 3600 },
    formatValue: (m) => `${m.meltingPoint.toLocaleString()} °C`,
    getNumericValue: (m) => m.meltingPoint,
  },
  electricalConductivity: {
    key: 'electricalConductivity',
    name: 'Electrical Conductivity',
    nameAr: 'الموصلية الكهربائية',
    symbol: 'σ',
    unit: 'S/m',
    group: 'electrical',
    description: 'Ease with which electrical charges migrate under an applied electric field.',
    descriptionAr: 'مدى سهولة انتقال الشحنات الكهربائية تحت تأثير مجال كهربائي مطبق.',
    higherIsBetter: true,
    referenceRange: { min: 1e-16, max: 6e7 },
    formatValue: (m) => {
      if (m.electricalConductivity >= 1e5) {
        return `${(m.electricalConductivity / 1e6).toFixed(2)} × 10⁶ S/m`;
      }
      if (m.electricalConductivity >= 1) {
        return `${m.electricalConductivity.toFixed(1)} S/m`;
      }
      return `${m.electricalConductivity.toExponential(2)} S/m`;
    },
    getNumericValue: (m) => m.electricalConductivity,
  },
  corrosionResistance: {
    key: 'corrosionResistance',
    name: 'Corrosion Resistance',
    nameAr: 'مقاومة التآكل',
    symbol: 'CR',
    unit: 'Rating',
    group: 'chemical',
    description: 'Resistance to atmospheric oxidation, acidic pitting, galvanic degradation, and stress corrosion.',
    descriptionAr: 'مقاومة الأكسدة الجوية والتنقر بالأحماض والتآكل الجلفاني والتشقق الإجهادي.',
    higherIsBetter: true,
    referenceRange: { min: 1, max: 6 },
    formatValue: (m) => m.corrosionResistance,
    getNumericValue: (m) => CORROSION_SCORE_MAP[m.corrosionResistance] || 3,
  },
};

/**
 * Computes Ashby Materials Selection performance indices
 */
export function calculateAshbyMetrics(material: MaterialModel): MaterialAshbyMetrics {
  // Density in g/cm³ converted to kg/m³ is density * 1000
  // Specific strength = Yield Strength (MPa) / Density (g/cm³) => (MPa / (g/cm³)) == kN·m/kg
  const specificStrength = material.density > 0 ? material.yieldStrength / material.density : 0;
  // Specific modulus = Young's Modulus (GPa) / Density (g/cm³) => MN·m/kg
  const specificModulus = material.density > 0 ? material.elasticModulus / material.density : 0;

  return {
    specificStrength: Number(specificStrength.toFixed(1)),
    specificModulus: Number(specificModulus.toFixed(1)),
  };
}

/**
 * Normalizes a property value on a 0 - 100 scale for radar / spider comparison
 */
export function normalizePropertyScore(material: MaterialModel, key: MaterialPropertyKey): number {
  const def = PROPERTY_DEFINITIONS[key];
  if (!def) return 50;

  const raw = def.getNumericValue(material);

  if (key === 'electricalConductivity') {
    // Logarithmic scale for electrical conductivity from 1e-14 to 6e7
    const logVal = Math.log10(Math.max(1e-14, raw));
    const minLog = -14;
    const maxLog = 7.8;
    return Math.min(100, Math.max(5, ((logVal - minLog) / (maxLog - minLog)) * 100));
  }

  if (key === 'corrosionResistance') {
    return ((raw - 1) / 5) * 100;
  }

  if (key === 'density') {
    // Invert density since lower density = higher lightweight rating
    const fraction = (raw - def.referenceRange.min) / (def.referenceRange.max - def.referenceRange.min);
    return Math.min(100, Math.max(5, (1 - fraction) * 100));
  }

  // Linear or square-root scaling for wide dynamic range
  const { min, max } = def.referenceRange;
  const clamped = Math.min(max, Math.max(min, raw));
  return Math.min(100, Math.max(5, ((clamped - min) / (max - min)) * 100));
}

/**
 * Multi-property rankings
 */
export function rankMaterialsByProperty(
  materials: MaterialModel[],
  propertyKey: MaterialPropertyKey,
  direction: 'desc' | 'asc' = 'desc'
): Array<{ material: MaterialModel; value: number; formatted: string; rank: number }> {
  const def = PROPERTY_DEFINITIONS[propertyKey];

  const sorted = [...materials].sort((a, b) => {
    const valA = def.getNumericValue(a);
    const valB = def.getNumericValue(b);
    return direction === 'desc' ? valB - valA : valA - valB;
  });

  return sorted.map((mat, idx) => ({
    material: mat,
    value: def.getNumericValue(mat),
    formatted: def.formatValue(mat),
    rank: idx + 1,
  }));
}
