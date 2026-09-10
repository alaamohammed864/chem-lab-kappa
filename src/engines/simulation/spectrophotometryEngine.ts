// Spectrophotometry & Beer-Lambert Law Simulation Engine
// Pure simulation logic - decoupled from UI and Visualization.
import {
  ISimulationEngine,
  BaseSimulationState,
  ExperimentMetadata,
  SimulationAction,
  SimulationResultItem,
  SimulationDataPoint,
} from './types';

export interface SpectrophotometryParams {
  solute: 'copper_sulfate' | 'food_dye_blue' | 'food_dye_red';
  selectedWavelengthNm: number; // e.g. 630 nm
  pathLengthCm: number; // typically 1.0 cm
  unknownSampleConcentration: number; // M (blind target to deduce)
}

export interface SpectrophotometryState extends BaseSimulationState {
  currentCuvetteContent: 'blank_water' | 'standard_1' | 'standard_2' | 'standard_3' | 'standard_4' | 'standard_5' | 'unknown';
  currentConcentrationM: number;
  currentAbsorbance: number;
  currentTransmittancePct: number;
  isBlankCalibrated: boolean;
  standardsMeasured: { standardId: string; concM: number; abs: number; trans: number }[];
  linearFitSlope: number | null;
  linearFitR2: number | null;
  unknownMeasuredAbs: number | null;
  unknownCalculatedConcM: number | null;
  beamColorHex: string;
}

// Optical properties of educational safe solutions
const SOLUTE_OPTICS: Record<
  string,
  { name: string; lambdaMaxNm: number; epsilonAtMax: number; defaultStandardsM: number[]; colorRgb: string }
> = {
  copper_sulfate: {
    name: 'Copper(II) Sulfate (CuSO₄·5H₂O)',
    lambdaMaxNm: 635, // red absorption, blue appearance
    epsilonAtMax: 12.5, // L / (mol · cm)
    defaultStandardsM: [0.02, 0.05, 0.10, 0.15, 0.20],
    colorRgb: '56, 189, 248',
  },
  food_dye_blue: {
    name: 'E133 Brilliant Blue Food Dye',
    lambdaMaxNm: 630,
    epsilonAtMax: 85000,
    defaultStandardsM: [2e-6, 5e-6, 10e-6, 15e-6, 20e-6],
    colorRgb: '37, 99, 235',
  },
  food_dye_red: {
    name: 'E129 Allura Red Food Dye',
    lambdaMaxNm: 505,
    epsilonAtMax: 24000,
    defaultStandardsM: [5e-6, 10e-6, 20e-6, 30e-6, 40e-6],
    colorRgb: '239, 68, 68',
  },
};

export class SpectrophotometrySimulationEngine
  implements ISimulationEngine<SpectrophotometryState, SpectrophotometryParams> {
  metadata: ExperimentMetadata = {
    id: 'spectrophotometry-beer-lambert',
    title: 'Spectrophotometry & Beer-Lambert Law',
    titleAr: 'التحليل الطيفي وقانون بير-لامبرت للامتصاصية',
    category: 'Spectrophotometry & Optics',
    difficulty: 'Introductory',
    durationMinutes: 10,
    summary:
      'Determination of molar absorptivity (ε) and quantitative analysis of an unknown sample concentration using spectrophotometric calibration curves and the Beer-Lambert relation.',
    summaryAr:
      'تحديد معامل الامتصاص المولي (ε) والتحليل الكمي لتركيز عينة مجهولة باستخدام منحنيات المعايرة الطيفية وقانون بير-لامبرت.',
    educationalObjectives: [
      'Understand the relationship between Transmittance (%T) and Absorbance (A = -log₁₀ T)',
      'Construct a Beer-Lambert calibration curve from a standard concentration series',
      'Evaluate instrument linearity (R²) and molar absorptivity coefficient (ε)',
      'Deduce the exact concentration of an unknown specimen through optical interpolation',
    ],
    educationalObjectivesAr: [
      'فهم العلاقة الفيزيائية بين النفاذية والامتصاصية',
      'بناء منحنى المعايرة القياسي لسلسلة من التراكيز القياسية',
      'حساب معامل الامتصاص المولي وتقييم خطية القياس (R²)',
      'استنتاج تركيز العينة المجهولة عبر الاستيفاء الخطي',
    ],
    safetyGuidelines: [
      'Simulated Educational Experiment: Standard student laboratory PPE required (safety goggles, lab coat)',
      'Safe non-toxic food dyes and dilute educational salts are utilized',
      'Ensure optical cuvette exterior is wiped clean with lint-free optical lens paper before insertion',
    ],
    safetyGuidelinesAr: [
      'تجربة تعليمية افتراضية: يلزم ارتداء معدات الوقاية الشخصية المعيارية',
      'تستخدم أصباغ طعام آمنة ومحاليل تعليمية غير سامة',
      'مسح جوانب خلية القياس الطيفي بورق مخصص لمنع بصمات الأصابع',
    ],
    paramDefinitions: [
      {
        id: 'solute',
        name: 'Chemical Chromophore Solution',
        nameAr: 'المحلول الملون المراد تحليله',
        type: 'select',
        options: [
          { label: 'Copper(II) Sulfate (CuSO₄) — λ_max = 635 nm', labelAr: 'كبريتات النحاس (أزرق)', value: 'copper_sulfate' },
          { label: 'Brilliant Blue Dye — λ_max = 630 nm', labelAr: 'صبغة زرقاء غذائية', value: 'food_dye_blue' },
          { label: 'Allura Red Dye — λ_max = 505 nm', labelAr: 'صبغة حمراء غذائية', value: 'food_dye_red' },
        ],
        defaultValue: 'copper_sulfate',
        description: 'Selected absorbing analyte for spectrophotometric calibration.',
      },
      {
        id: 'selectedWavelengthNm',
        name: 'Monochromator Wavelength (λ nm)',
        nameAr: 'الطول الموجي للمونوكروماتور (نانومتر)',
        type: 'number',
        min: 400,
        max: 750,
        step: 5,
        unit: 'nm',
        defaultValue: 635,
        description: 'Incident light wavelength selected by the diffraction grating monochromator.',
      },
      {
        id: 'pathLengthCm',
        name: 'Cuvette Path Length b (cm)',
        nameAr: 'طول مسار خلية القياس (سم)',
        type: 'number',
        min: 0.5,
        max: 2.0,
        step: 0.5,
        unit: 'cm',
        defaultValue: 1.0,
        description: 'Internal optical distance travelled by the light beam through the solution.',
      },
    ],
    tableColumns: [
      { key: 'sampleName', label: 'Sample / Standard', labelAr: 'اسم العينة', precision: 0 },
      { key: 'concM', label: 'Concentration (M)', labelAr: 'التركيز (مولار)', precision: 4 },
      { key: 'absorbance', label: 'Absorbance (A)', labelAr: 'الامتصاصية', precision: 3 },
      { key: 'transmittancePct', label: '% Transmittance (%T)', labelAr: 'نسبة النفاذية %', precision: 1 },
      { key: 'wavelengthNm', label: 'Wavelength (λ)', labelAr: 'الطول الموجي', unit: 'nm', precision: 0 },
    ],
    graphConfig: {
      xKey: 'concM',
      xLabel: 'Concentration (M)',
      xLabelAr: 'التركيز (مولار)',
      xUnit: 'M',
      yKey: 'absorbance',
      yLabel: 'Absorbance (A)',
      yLabelAr: 'الامتصاصية (A)',
      yUnit: 'A.U.',
      secondaryYKey: 'transmittancePct',
      secondaryYLabel: '% Transmittance',
      secondaryYUnit: '%',
      minX: 0,
      maxX: 0.25,
      minY: 0,
      maxY: 3.0,
    },
  };

  getInitialState(params: SpectrophotometryParams): SpectrophotometryState {
    const beamHex = this.wavelengthToHex(params.selectedWavelengthNm);

    return {
      simTime: 0,
      isRunning: false,
      isComplete: false,
      statusText: 'Ready. Insert blank cuvette (DI water) and press "Zero / Calibrate Blank".',
      statusTextAr: 'جاهز. أدخل خلية العينة الفارغة (الماء المقطر) واضغط "معايرة الصفر".',
      observations: [
        {
          timestamp: 0,
          type: 'info',
          message: `Spectrophotometer initialized at λ = ${params.selectedWavelengthNm} nm (b = ${params.pathLengthCm} cm).`,
          messageAr: `تم تشغيل مقياس الطيف عند الطول الموجي ${params.selectedWavelengthNm} نانومتر.`,
          visualCue: beamHex,
        },
      ],
      dataPoints: [],
      results: [],
      currentCuvetteContent: 'blank_water',
      currentConcentrationM: 0,
      currentAbsorbance: 0,
      currentTransmittancePct: 100,
      isBlankCalibrated: false,
      standardsMeasured: [],
      linearFitSlope: null,
      linearFitR2: null,
      unknownMeasuredAbs: null,
      unknownCalculatedConcM: null,
      beamColorHex: beamHex,
    };
  }

  step(currentState: SpectrophotometryState, params: SpectrophotometryParams, dt: number): SpectrophotometryState {
    return currentState;
  }

  handleAction(
    currentState: SpectrophotometryState,
    action: SimulationAction,
    params: SpectrophotometryParams
  ): SpectrophotometryState {
    switch (action.type) {
      case 'CALIBRATE_BLANK': {
        return {
          ...currentState,
          currentCuvetteContent: 'blank_water',
          currentConcentrationM: 0,
          currentAbsorbance: 0.0,
          currentTransmittancePct: 100.0,
          isBlankCalibrated: true,
          statusText: 'Blank calibrated. 100.0% Transmittance (A = 0.000) set.',
          statusTextAr: 'تمت معايرة الصفر. النفاذية 100.0% والامتصاص 0.000.',
          observations: [
            ...currentState.observations,
            {
              timestamp: Number(currentState.simTime.toFixed(1)),
              type: 'milestone',
              message: 'Zero baseline established with deionized water blank (A = 0.000).',
              messageAr: 'تم ضبط خط الصفر باستخدام الماء المقطر (A = 0.000).',
            },
          ],
        };
      }

      case 'MEASURE_STANDARD': {
        const stdIndex = Number(action.payload?.standardIndex) ?? 0;
        const soluteInfo = SOLUTE_OPTICS[params.solute] || SOLUTE_OPTICS.copper_sulfate;
        const conc = soluteInfo.defaultStandardsM[stdIndex] ?? 0.05;
        const stdName = `Standard #${stdIndex + 1}`;

        const epsilon = this.getEpsilon(params.solute, params.selectedWavelengthNm);
        const theoreticalAbs = epsilon * params.pathLengthCm * conc;
        // Add tiny instrument noise (±0.005)
        const noise = (Math.sin(stdIndex * 3) * 0.003);
        const measuredAbs = Math.max(0, Number((theoreticalAbs + noise).toFixed(3)));
        const transPct = Math.min(100, Math.max(0.1, Number((Math.pow(10, -measuredAbs) * 100).toFixed(1))));

        const existingFiltered = currentState.standardsMeasured.filter((s) => s.standardId !== stdName);
        const updatedStandards = [
          ...existingFiltered,
          { standardId: stdName, concM: conc, abs: measuredAbs, trans: transPct },
        ].sort((a, b) => a.concM - b.concM);

        // Perform linear regression if >= 2 points
        let slope: number | null = null;
        let r2: number | null = null;
        if (updatedStandards.length >= 2) {
          const regression = this.linearRegression(updatedStandards.map((s) => ({ x: s.concM, y: s.abs })));
          slope = regression.slope;
          r2 = regression.r2;
        }

        const newDataPoints = [
          ...currentState.dataPoints.filter((dp) => dp.values.sampleName !== stdName),
          {
            id: `dp-std-${stdIndex}`,
            stepIndex: currentState.dataPoints.length,
            simTime: Number(currentState.simTime.toFixed(1)),
            values: {
              sampleName: stdName,
              concM: Number(conc.toFixed(5)),
              absorbance: measuredAbs,
              transmittancePct: transPct,
              wavelengthNm: params.selectedWavelengthNm,
            },
          },
        ];

        return {
          ...currentState,
          currentCuvetteContent: `standard_${stdIndex + 1}` as any,
          currentConcentrationM: conc,
          currentAbsorbance: measuredAbs,
          currentTransmittancePct: transPct,
          standardsMeasured: updatedStandards,
          linearFitSlope: slope,
          linearFitR2: r2,
          dataPoints: newDataPoints,
          statusText: `Measured ${stdName} (conc = ${conc} M): Absorbance = ${measuredAbs.toFixed(3)}`,
          statusTextAr: `تم قياس ${stdName} (التركيز = ${conc} مولار): الامتصاصية = ${measuredAbs.toFixed(3)}`,
          observations: [
            ...currentState.observations,
            {
              timestamp: Number(currentState.simTime.toFixed(1)),
              type: 'info',
              message: `Recorded ${stdName} (${conc} M): Abs = ${measuredAbs.toFixed(3)}, %T = ${transPct.toFixed(1)}%.`,
              messageAr: `تم تسجيل ${stdName} (${conc} مولار): الامتصاص = ${measuredAbs.toFixed(3)}.`,
            },
          ],
        };
      }

      case 'MEASURE_UNKNOWN': {
        const soluteInfo = SOLUTE_OPTICS[params.solute] || SOLUTE_OPTICS.copper_sulfate;
        const actualUnknownConc = params.unknownSampleConcentration || soluteInfo.defaultStandardsM[2] * 1.15;

        const epsilon = this.getEpsilon(params.solute, params.selectedWavelengthNm);
        const theoreticalAbs = epsilon * params.pathLengthCm * actualUnknownConc;
        const measuredAbs = Math.max(0, Number(theoreticalAbs.toFixed(3)));
        const transPct = Math.min(100, Math.max(0.1, Number((Math.pow(10, -measuredAbs) * 100).toFixed(1))));

        // Interpolate concentration from calibration curve slope if available, else from epsilon
        const slope = currentState.linearFitSlope || epsilon * params.pathLengthCm;
        const calculatedConc = slope > 0 ? measuredAbs / slope : actualUnknownConc;

        const newDataPoints = [
          ...currentState.dataPoints.filter((dp) => dp.values.sampleName !== 'Unknown Sample'),
          {
            id: `dp-unknown`,
            stepIndex: currentState.dataPoints.length,
            simTime: Number(currentState.simTime.toFixed(1)),
            values: {
              sampleName: 'Unknown Sample',
              concM: Number(calculatedConc.toFixed(5)),
              absorbance: measuredAbs,
              transmittancePct: transPct,
              wavelengthNm: params.selectedWavelengthNm,
            },
          },
        ];

        const nextState: SpectrophotometryState = {
          ...currentState,
          currentCuvetteContent: 'unknown',
          currentConcentrationM: calculatedConc,
          currentAbsorbance: measuredAbs,
          currentTransmittancePct: transPct,
          unknownMeasuredAbs: measuredAbs,
          unknownCalculatedConcM: calculatedConc,
          dataPoints: newDataPoints,
          isComplete: true,
          statusText: `Unknown sample analyzed: Absorbance = ${measuredAbs.toFixed(3)} → Calculated Conc = ${calculatedConc.toFixed(4)} M`,
          statusTextAr: `تم تحليل العينة المجهولة: الامتصاصية = ${measuredAbs.toFixed(3)} ← التركيز المحسوب = ${calculatedConc.toFixed(4)} مولار`,
          observations: [
            ...currentState.observations,
            {
              timestamp: Number(currentState.simTime.toFixed(1)),
              type: 'milestone',
              message: `Unknown Sample evaluated: Abs = ${measuredAbs.toFixed(3)}. Interpolated Concentration = ${calculatedConc.toFixed(4)} M.`,
              messageAr: `تم قياس العينة المجهولة: الامتصاص = ${measuredAbs.toFixed(3)}. التركيز المستنتج = ${calculatedConc.toFixed(4)} مولار.`,
            },
          ],
        };

        nextState.results = this.calculateResults(nextState, params);
        return nextState;
      }

      case 'SET_WAVELENGTH': {
        const wl = Number(action.payload?.wavelength) || 635;
        const beamHex = this.wavelengthToHex(wl);
        return {
          ...currentState,
          beamColorHex: beamHex,
          isBlankCalibrated: false, // changing wavelength requires re-blanking
          statusText: `Monochromator set to ${wl} nm. Please re-zero blank.`,
          statusTextAr: `تم ضبط الطول الموجي على ${wl} نانومتر. يرجى إعادة معايرة الصفر.`,
          observations: [
            ...currentState.observations,
            {
              timestamp: Number(currentState.simTime.toFixed(1)),
              type: 'change',
              message: `Diffraction grating adjusted to λ = ${wl} nm. Re-zeroing recommended.`,
              visualCue: beamHex,
            },
          ],
        };
      }

      case 'RESET':
        return this.getInitialState(params);

      default:
        return currentState;
    }
  }

  private getEpsilon(soluteKey: string, wavelengthNm: number): number {
    const solute = SOLUTE_OPTICS[soluteKey] || SOLUTE_OPTICS.copper_sulfate;
    const deltaWl = Math.abs(wavelengthNm - solute.lambdaMaxNm);
    // Gaussian absorption peak profile
    const sigma = 35.0; // peak width in nm
    const factor = Math.exp(-Math.pow(deltaWl, 2) / (2 * Math.pow(sigma, 2)));
    return Math.max(0.1, solute.epsilonAtMax * factor);
  }

  private linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumXX += p.x * p.x;
      sumYY += p.y * p.y;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Pearson correlation r
    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const r = den !== 0 ? num / den : 1;
    const r2 = Math.min(1.0, Math.pow(r, 2));

    return { slope, intercept, r2 };
  }

  private wavelengthToHex(wl: number): string {
    // Convert visible nm wavelength to RGB color
    let r = 0;
    let g = 0;
    let b = 0;

    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      b = 1.0;
    } else if (wl >= 440 && wl < 490) {
      g = (wl - 440) / (490 - 440);
      b = 1.0;
    } else if (wl >= 490 && wl < 510) {
      g = 1.0;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1.0;
    } else if (wl >= 580 && wl < 645) {
      r = 1.0;
      g = -(wl - 645) / (645 - 580);
    } else if (wl >= 645 && wl <= 780) {
      r = 1.0;
    }

    const rByte = Math.round(r * 255);
    const gByte = Math.round(g * 255);
    const bByte = Math.round(b * 255);
    return `#${rByte.toString(16).padStart(2, '0')}${gByte.toString(16).padStart(2, '0')}${bByte.toString(16).padStart(2, '0')}`;
  }

  calculateResults(state: SpectrophotometryState, params: SpectrophotometryParams): SimulationResultItem[] {
    const slope = state.linearFitSlope || 12.5;
    const r2 = state.linearFitR2 || 0.999;
    const unknownConc = state.unknownCalculatedConcM || 0.085;
    const targetUnknown = params.unknownSampleConcentration || 0.085;
    const errorPct = targetUnknown > 0 ? Math.abs((unknownConc - targetUnknown) / targetUnknown) * 100 : 0;

    return [
      {
        label: 'Molar Absorptivity (ε)',
        labelAr: 'معامل الامتصاص المولي (ε)',
        value: (slope / params.pathLengthCm).toFixed(2),
        unit: 'L / (mol · cm)',
        formulaUsed: 'A = ε × b × c  →  ε = slope / b',
        interpretation: 'Characteristic optical extinction coefficient at the analytical wavelength.',
      },
      {
        label: 'Calibration Linearity (R²)',
        labelAr: 'معامل الخطية لمنحنى المعايرة (R²)',
        value: r2.toFixed(4),
        expectedValue: '1.0000',
        interpretation: 'Beer’s law holds true when R² > 0.995 within standard linear dynamic range.',
      },
      {
        label: 'Deduced Unknown Concentration',
        labelAr: 'التركيز المستنتج للعينة المجهولة',
        value: unknownConc.toFixed(4),
        unit: 'M',
        expectedValue: targetUnknown.toFixed(4),
        percentError: Number(errorPct.toFixed(2)),
        formulaUsed: 'c_unknown = A_unknown / (ε × b)',
        interpretation: 'Calculated by linear projection onto the spectrophotometric standard curve.',
      },
    ];
  }

  validateParams(params: SpectrophotometryParams): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];
    if (params.pathLengthCm <= 0) errors.push('Path length must be positive.');
    if (params.selectedWavelengthNm < 380 || params.selectedWavelengthNm > 780) {
      errors.push('Wavelength must be in visible spectrum (380 - 780 nm).');
    }
    return { isValid: errors.length === 0, errors };
  }
}
