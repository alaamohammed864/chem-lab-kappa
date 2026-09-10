// Acid-Base Titration Simulation Engine
// Pure simulation logic - decoupled from UI and Visualization.
import {
  ISimulationEngine,
  BaseSimulationState,
  ExperimentMetadata,
  SimulationAction,
  SimulationResultItem,
  SimulationDataPoint,
} from './types';

export interface TitrationParams {
  analyteType: 'weak_acid_acetic' | 'strong_acid_hcl';
  analyteConcentration: number; // M (mol/L) e.g. 0.1
  analyteVolume: number; // mL e.g. 25.0
  titrantConcentration: number; // M (NaOH) e.g. 0.1
  buretteCapacity: number; // mL e.g. 50.0
  indicator: 'phenolphthalein' | 'bromothymol_blue' | 'methyl_orange';
  stirrerSpeed: number; // 0 to 1000 RPM
  dropRate: number; // mL per second when continuous
}

export interface TitrationState extends BaseSimulationState {
  titrantAdded: number; // mL delivered from burette
  buretteRemaining: number; // mL left in burette
  currentPH: number;
  currentDPH_DV: number; // first derivative
  solutionVolume: number; // mL (analyte + titrant added)
  molesAcidRemaining: number;
  molesBaseAdded: number;
  equivalencePointReached: boolean;
  equivalenceVolumeDetected: number | null;
  indicatorColorHex: string;
  isStirring: boolean;
  dropAnimationActive: boolean;
  lastDropTime: number;
}

const KW = 1.0e-14;
const KA_ACETIC = 1.75e-5; // Acetic acid pKa = 4.757

export class TitrationSimulationEngine implements ISimulationEngine<TitrationState, TitrationParams> {
  metadata: ExperimentMetadata = {
    id: 'acid-base-titration',
    title: 'Acid-Base Titration & Potentiometric pH Curve',
    titleAr: 'معايرة حمض-قاعدة ومنحنى الأس الهيدروجيني',
    category: 'Acid-Base Titration',
    difficulty: 'Introductory',
    durationMinutes: 15,
    summary:
      'Standardized titrimetric determination of acid concentration using automated dropwise burette delivery, indicator transition tracking, and potentiometric curve derivation.',
    summaryAr:
      'تحديد تركيز الحمض باستخدام التنقيط المعياري من السحاحة، وتتبع تحول الكاشف ومنحنى الجهد الهيدروجيني.',
    educationalObjectives: [
      'Master the concept of equivalence point vs endpoint in volumetric analysis',
      'Analyze the buffering region using the Henderson-Hasselbalch equation',
      'Observe indicator color shift at its specific pKa range',
      'Determine unknown analyte concentration from standard titrant stoichiometry',
    ],
    educationalObjectivesAr: [
      'إتقان مفهوم نقطة التكافؤ مقابل نقطة النهاية في التحليل الحجمي',
      'تحليل منطقة المحلول المنظم باستخدام معادلة هندرسون-هاسلبالخ',
      'ملاحظة تحول لون الكاشف عند نطاق الـ pKa الخاص به',
      'حساب تركيز المادة المجهولة من قياسات الحجم القياسي',
    ],
    safetyGuidelines: [
      'Simulated Educational Experiment: Standard student laboratory PPE required (safety goggles, lab coat, nitrile gloves)',
      'Dilute educational solutions (<0.1 M vinegar / sodium hydroxide simulation) are utilized',
      'Dispose of neutralized reaction mixtures in designated laboratory drain with water flush',
    ],
    safetyGuidelinesAr: [
      'تجربة تعليمية افتراضية: يلزم ارتداء معدات الوقاية الشخصية المعيارية (نظارات السلامة، معطف المختبر، القفازات)',
      'تستخدم محاليل تعليمية مخففة تحاكي الخل المنزلي وهيدروكسيد الصوديوم المخفف',
      'التخلص من مخاليط التفاعل المتعادلة في مجرى المختبر المخصص مع تدفق الماء',
    ],
    paramDefinitions: [
      {
        id: 'analyteType',
        name: 'Analyte Sample Acid',
        nameAr: 'حمض العينة المراد معايرته',
        type: 'select',
        options: [
          { label: 'Acetic Acid (CH₃COOH) - Weak Acid, Ka=1.75e-5', labelAr: 'حمض الأسيتيك (حمض ضعيف)', value: 'weak_acid_acetic' },
          { label: 'Hydrochloric Acid (HCl) - Strong Acid', labelAr: 'حمض الهيدروكلوريك (حمض قوي)', value: 'strong_acid_hcl' },
        ],
        defaultValue: 'weak_acid_acetic',
        description: 'Choice of weak or strong monoprotic acid sample.',
      },
      {
        id: 'analyteVolume',
        name: 'Analyte Sample Volume (mL)',
        nameAr: 'حجم عينة الحمض (مل)',
        type: 'number',
        min: 10,
        max: 50,
        step: 5,
        unit: 'mL',
        defaultValue: 25.0,
        description: 'Exact volume of acid pipetted into the Erlenmeyer flask.',
      },
      {
        id: 'analyteConcentration',
        name: 'Analyte Concentration (M)',
        nameAr: 'تركيز عينة الحمض (مولار)',
        type: 'number',
        min: 0.05,
        max: 0.5,
        step: 0.01,
        unit: 'M',
        defaultValue: 0.1,
        description: 'Nominal molar concentration of the acid.',
      },
      {
        id: 'titrantConcentration',
        name: 'Titrant (NaOH) Concentration (M)',
        nameAr: 'تركيز محلول الصودا المعياري (مولار)',
        type: 'number',
        min: 0.05,
        max: 0.2,
        step: 0.01,
        unit: 'M',
        defaultValue: 0.1,
        description: 'Concentration of standard sodium hydroxide in the burette.',
      },
      {
        id: 'indicator',
        name: 'Chemical Indicator',
        nameAr: 'الكاشف اللوني',
        type: 'select',
        options: [
          { label: 'Phenolphthalein (Clear → Light Pink, pH 8.2-10.0)', labelAr: 'فينولفثالين (عديم اللون ← وردي فاتح)', value: 'phenolphthalein' },
          { label: 'Bromothymol Blue (Yellow → Green → Blue, pH 6.0-7.6)', labelAr: 'أزرق بروموثيمول (أصفر ← أخضر ← أزرق)', value: 'bromothymol_blue' },
          { label: 'Methyl Orange (Red → Orange → Yellow, pH 3.1-4.4)', labelAr: 'ميثيل برتقالي (أحمر ← أصفر)', value: 'methyl_orange' },
        ],
        defaultValue: 'phenolphthalein',
        description: 'Visual indicator added to signal the endpoint.',
      },
      {
        id: 'stirrerSpeed',
        name: 'Magnetic Stirrer Speed (RPM)',
        nameAr: 'سرعة المحرك المغناطيسي (دورة/دقيقة)',
        type: 'number',
        min: 0,
        max: 800,
        step: 50,
        unit: 'RPM',
        defaultValue: 350,
        description: 'Speed of the magnetic stirring bar ensuring solution homogeneity.',
      },
    ],
    tableColumns: [
      { key: 'titrantAdded', label: 'V(NaOH) Added', labelAr: 'حجم NaOH المضاف', unit: 'mL', precision: 2 },
      { key: 'currentPH', label: 'pH', labelAr: 'الأس الهيدروجيني', precision: 2 },
      { key: 'currentDPH_DV', label: 'ΔpH / ΔV', labelAr: 'المشتقة الأولى ΔpH/ΔV', precision: 2 },
      { key: 'molesAcidRemaining', label: 'Moles Acid', labelAr: 'مولات الحمض المتبقية', precision: 5 },
      { key: 'solutionVolume', label: 'Total Volume', labelAr: 'الحجم الكلي', unit: 'mL', precision: 2 },
    ],
    graphConfig: {
      xKey: 'titrantAdded',
      xLabel: 'Volume of 0.10M NaOH Added',
      xLabelAr: 'حجم محلول NaOH المضاف',
      xUnit: 'mL',
      yKey: 'currentPH',
      yLabel: 'pH Value',
      yLabelAr: 'قيمة الأس الهيدروجيني pH',
      yUnit: 'pH',
      secondaryYKey: 'currentDPH_DV',
      secondaryYLabel: '1st Derivative (ΔpH/ΔV)',
      secondaryYUnit: 'pH/mL',
      minX: 0,
      maxX: 50,
      minY: 0,
      maxY: 14,
    },
  };

  getInitialState(params: TitrationParams): TitrationState {
    const initialPH = this.calculateInstantaneousPH(0, params);
    const initialColor = this.getIndicatorColor(initialPH, params.indicator);

    return {
      simTime: 0,
      isRunning: false,
      isComplete: false,
      statusText: 'Ready. Open burette stopcock or dispense drops to begin titration.',
      statusTextAr: 'جاهز. افتح صنبور السحاحة أو أضف قطرات لبدء المعايرة.',
      observations: [
        {
          timestamp: 0,
          type: 'info',
          message: `Loaded ${params.analyteVolume} mL of ${params.analyteConcentration} M acid with ${params.indicator} indicator.`,
          messageAr: `تم وضع ${params.analyteVolume} مل من الحمض بتركيز ${params.analyteConcentration} مولار مع كاشف ${params.indicator}.`,
          visualCue: initialColor,
        },
      ],
      dataPoints: [
        {
          id: 'dp-0',
          stepIndex: 0,
          simTime: 0,
          values: {
            titrantAdded: 0,
            currentPH: Number(initialPH.toFixed(2)),
            currentDPH_DV: 0,
            molesAcidRemaining: Number((params.analyteVolume * 0.001 * params.analyteConcentration).toFixed(6)),
            solutionVolume: params.analyteVolume,
          },
        },
      ],
      results: [],
      titrantAdded: 0,
      buretteRemaining: params.buretteCapacity,
      currentPH: initialPH,
      currentDPH_DV: 0,
      solutionVolume: params.analyteVolume,
      molesAcidRemaining: params.analyteVolume * 0.001 * params.analyteConcentration,
      molesBaseAdded: 0,
      equivalencePointReached: false,
      equivalenceVolumeDetected: null,
      indicatorColorHex: initialColor,
      isStirring: params.stirrerSpeed > 0,
      dropAnimationActive: false,
      lastDropTime: 0,
    };
  }

  step(currentState: TitrationState, params: TitrationParams, dt: number): TitrationState {
    if (!currentState.isRunning || currentState.isComplete) {
      return currentState;
    }

    // Determine titrant flow: e.g. 0.25 mL per second
    const flowRate = params.dropRate || 0.25; // mL per sec
    const volumeToAdd = flowRate * dt;

    return this.deliverTitrant(currentState, params, volumeToAdd, dt);
  }

  handleAction(currentState: TitrationState, action: SimulationAction, params: TitrationParams): TitrationState {
    switch (action.type) {
      case 'START_FLOW':
        return {
          ...currentState,
          isRunning: true,
          statusText: 'Burette stopcock opened — continuous delivery active.',
          statusTextAr: 'صنبور السحاحة مفتوح — الإضافة المستمرة جارية.',
        };

      case 'PAUSE_FLOW':
        return {
          ...currentState,
          isRunning: false,
          statusText: 'Burette stopcock closed — flow paused.',
          statusTextAr: 'تم إغلاق صنبور السحاحة — الإضافة متوقفة.',
        };

      case 'DISPENSE_SINGLE_DROP':
        return this.deliverTitrant(currentState, params, 0.05, 0.1);

      case 'DISPENSE_VOLUME':
        const vol = Number(action.payload?.volume) || 0.5;
        return this.deliverTitrant(currentState, params, vol, 0.5);

      case 'TOGGLE_STIRRER':
        const nextStir = !currentState.isStirring;
        return {
          ...currentState,
          isStirring: nextStir,
          observations: [
            ...currentState.observations,
            {
              timestamp: currentState.simTime,
              type: 'change',
              message: nextStir ? 'Magnetic stirrer enabled.' : 'Magnetic stirrer halted.',
              messageAr: nextStir ? 'تم تشغيل المحرك المغناطيسي.' : 'تم إيقاف المحرك المغناطيسي.',
            },
          ],
        };

      case 'RESET':
        return this.getInitialState(params);

      default:
        return currentState;
    }
  }

  private deliverTitrant(
    state: TitrationState,
    params: TitrationParams,
    volumeToAdd: number,
    dt: number
  ): TitrationState {
    const capacity = params.buretteCapacity || 50.0;
    const newTitrantAdded = Math.min(capacity, state.titrantAdded + volumeToAdd);
    const actualAddedDelta = newTitrantAdded - state.titrantAdded;
    if (actualAddedDelta <= 0) {
      return {
        ...state,
        isRunning: false,
        isComplete: true,
        statusText: 'Burette is empty (maximum capacity reached).',
        statusTextAr: 'السحاحة فارغة (تم الوصول إلى السعة القصوى).',
      };
    }

    const newSimTime = state.simTime + dt;
    const newBuretteRemaining = Math.max(0, capacity - newTitrantAdded);
    const newTotalVolume = params.analyteVolume + newTitrantAdded;

    const newPH = this.calculateInstantaneousPH(newTitrantAdded, params);
    const deltaV = actualAddedDelta;
    const deltaPH = newPH - state.currentPH;
    const dPH_dV = deltaV > 0 ? deltaPH / deltaV : 0;

    const newColor = this.getIndicatorColor(newPH, params.indicator);

    // Moles tracking
    const initialMolesAcid = params.analyteVolume * 0.001 * params.analyteConcentration;
    const totalMolesBase = newTitrantAdded * 0.001 * params.titrantConcentration;
    const molesAcidRemaining = Math.max(0, initialMolesAcid - totalMolesBase);

    // Check equivalence detection
    const theoreticalEqVolume = (initialMolesAcid / params.titrantConcentration) * 1000;
    let eqReached = state.equivalencePointReached;
    let eqDetectedVol = state.equivalenceVolumeDetected;
    const newObservations = [...state.observations];

    if (!eqReached && newTitrantAdded >= theoreticalEqVolume) {
      eqReached = true;
      eqDetectedVol = Number(theoreticalEqVolume.toFixed(2));
      newObservations.push({
        timestamp: Number(newSimTime.toFixed(1)),
        type: 'milestone',
        message: `Equivalence Point Reached at V = ${theoreticalEqVolume.toFixed(2)} mL (pH = ${newPH.toFixed(2)}).`,
        messageAr: `تم بلوغ نقطة التكافؤ عند الحجم = ${theoreticalEqVolume.toFixed(2)} مل (الأس = ${newPH.toFixed(2)}).`,
        visualCue: newColor,
      });
    }

    // Indicator color shift observation
    if (state.indicatorColorHex !== newColor && newObservations.length < 50) {
      newObservations.push({
        timestamp: Number(newSimTime.toFixed(1)),
        type: 'change',
        message: `Visual indicator shift detected at pH ${newPH.toFixed(2)}. Solution color changed.`,
        messageAr: `لوحظ تحول في لون الكاشف عند الأس الهيدروجيني ${newPH.toFixed(2)}.`,
        visualCue: newColor,
      });
    }

    // Add data point periodically or after noticeable volume addition
    const lastDp = state.dataPoints[state.dataPoints.length - 1];
    const shouldAddDataPoint =
      !lastDp ||
      Math.abs(newTitrantAdded - Number(lastDp.values.titrantAdded)) >= 0.2 ||
      eqReached !== state.equivalencePointReached;

    const newDataPoints = [...state.dataPoints];
    if (shouldAddDataPoint) {
      newDataPoints.push({
        id: `dp-${newDataPoints.length}`,
        stepIndex: newDataPoints.length,
        simTime: Number(newSimTime.toFixed(1)),
        values: {
          titrantAdded: Number(newTitrantAdded.toFixed(2)),
          currentPH: Number(newPH.toFixed(2)),
          currentDPH_DV: Number(dPH_dV.toFixed(2)),
          molesAcidRemaining: Number(molesAcidRemaining.toFixed(6)),
          solutionVolume: Number(newTotalVolume.toFixed(2)),
        },
      });
    }

    const isFinished = newBuretteRemaining <= 0 || newTitrantAdded >= theoreticalEqVolume * 1.5;

    const updatedState: TitrationState = {
      ...state,
      simTime: newSimTime,
      titrantAdded: newTitrantAdded,
      buretteRemaining: newBuretteRemaining,
      currentPH: newPH,
      currentDPH_DV: dPH_dV,
      solutionVolume: newTotalVolume,
      molesAcidRemaining,
      molesBaseAdded: totalMolesBase,
      equivalencePointReached: eqReached,
      equivalenceVolumeDetected: eqDetectedVol,
      indicatorColorHex: newColor,
      dropAnimationActive: true,
      lastDropTime: newSimTime,
      isRunning: !isFinished && state.isRunning,
      isComplete: isFinished,
      statusText: isFinished
        ? 'Titration run completed. Analyze graph and equivalence point.'
        : `Titrating: ${newTitrantAdded.toFixed(2)} mL added. pH = ${newPH.toFixed(2)}`,
      statusTextAr: isFinished
        ? 'اكتملت المعايرة. قم بتحليل المنحنى ونقطة التكافؤ.'
        : `جارٍ المعايرة: أضيف ${newTitrantAdded.toFixed(2)} مل. الأس الهيدروجيني = ${newPH.toFixed(2)}`,
      observations: newObservations,
      dataPoints: newDataPoints,
    };

    if (isFinished) {
      updatedState.results = this.calculateResults(updatedState, params);
    }

    return updatedState;
  }

  calculateInstantaneousPH(vAdded: number, params: TitrationParams): number {
    const vAcidL = params.analyteVolume * 0.001;
    const vBaseL = vAdded * 0.001;
    const totalVL = vAcidL + vBaseL;

    const molesAcidInitial = vAcidL * params.analyteConcentration;
    const molesBaseAdded = vBaseL * params.titrantConcentration;

    const isWeakAcid = params.analyteType === 'weak_acid_acetic';
    const Ka = isWeakAcid ? KA_ACETIC : 1e7;

    // 1. Initial State (No Base Added)
    if (vAdded <= 0.001) {
      if (isWeakAcid) {
        // [H+] = sqrt(Ka * C_acid)
        const hConc = Math.sqrt(Ka * params.analyteConcentration);
        return Math.max(1.0, -Math.log10(hConc));
      } else {
        return Math.max(0.5, -Math.log10(params.analyteConcentration));
      }
    }

    // 2. Before Equivalence Point (Buffer or Excess Strong Acid)
    if (molesBaseAdded < molesAcidInitial) {
      const remainingMolesAcid = molesAcidInitial - molesBaseAdded;
      if (isWeakAcid) {
        // Henderson-Hasselbalch equation: pH = pKa + log([A-] / [HA])
        const pKa = -Math.log10(Ka);
        const molesConjugateBase = molesBaseAdded;
        const ratio = molesConjugateBase / remainingMolesAcid;
        return Math.min(13.9, Math.max(1.0, pKa + Math.log10(Math.max(1e-5, ratio))));
      } else {
        // Strong acid: [H+] = remaining moles / total volume
        const hConc = remainingMolesAcid / totalVL;
        return Math.max(0.5, -Math.log10(hConc));
      }
    }

    // 3. At Equivalence Point
    if (Math.abs(molesBaseAdded - molesAcidInitial) < 1e-6) {
      if (isWeakAcid) {
        // Conjugate base hydrolysis: A- + H2O <=> HA + OH-
        // Kb = Kw / Ka
        const Kb = KW / Ka;
        const concBaseAnion = molesAcidInitial / totalVL;
        const ohConc = Math.sqrt(Kb * concBaseAnion);
        const pOH = -Math.log10(ohConc);
        return Math.min(13.5, 14.0 - pOH); // Typically ~8.72 for 0.1M acetic acid
      } else {
        // Strong acid + Strong base: neutral salt
        return 7.0;
      }
    }

    // 4. Past Equivalence Point (Excess Strong Base)
    const excessMolesBase = molesBaseAdded - molesAcidInitial;
    const ohConc = excessMolesBase / totalVL;
    const pOH = -Math.log10(Math.max(1e-14, ohConc));
    return Math.min(13.8, Math.max(7.0, 14.0 - pOH));
  }

  getIndicatorColor(ph: number, indicator: string): string {
    switch (indicator) {
      case 'phenolphthalein':
        if (ph < 8.2) return '#f8fafc'; // Clear / colorless
        if (ph >= 10.0) return '#f43f5e'; // Vibrant pink/magenta
        // Transition gradient 8.2 to 10.0
        const fracP = (ph - 8.2) / 1.8;
        return `rgba(244, 63, 94, ${Math.min(0.9, 0.15 + fracP * 0.75)})`;

      case 'bromothymol_blue':
        if (ph < 6.0) return '#eab308'; // Yellow
        if (ph > 7.6) return '#2563eb'; // Deep Blue
        return '#10b981'; // Green at neutral

      case 'methyl_orange':
        if (ph < 3.1) return '#ef4444'; // Red
        if (ph > 4.4) return '#f59e0b'; // Yellow
        return '#f97316'; // Orange

      default:
        return '#f8fafc';
    }
  }

  calculateResults(state: TitrationState, params: TitrationParams): SimulationResultItem[] {
    const theoreticalEqVolume = (params.analyteVolume * params.analyteConcentration) / params.titrantConcentration;
    const experimentalVeq = state.equivalenceVolumeDetected || theoreticalEqVolume;

    // Calculated Analyte Concentration: C_a = (C_b * V_eq) / V_a
    const calculatedConc = (params.titrantConcentration * experimentalVeq) / params.analyteVolume;
    const errorPct = Math.abs((calculatedConc - params.analyteConcentration) / params.analyteConcentration) * 100;

    return [
      {
        label: 'Theoretical Equivalence Volume (V_eq)',
        labelAr: 'حجم التكافؤ النظري (V_eq)',
        value: theoreticalEqVolume.toFixed(2),
        unit: 'mL',
        expectedValue: theoreticalEqVolume.toFixed(2),
        formulaUsed: 'V_eq = (C_acid × V_acid) / C_base',
        interpretation: 'Exact stoichiometric volume where moles of OH⁻ equal initial moles of H⁺.',
      },
      {
        label: 'Experimental Equivalence Volume',
        labelAr: 'حجم التكافؤ المقاس تجريبياً',
        value: experimentalVeq.toFixed(2),
        unit: 'mL',
        expectedValue: theoreticalEqVolume.toFixed(2),
        percentError: Number(errorPct.toFixed(2)),
        interpretation: 'Derived from the inflection point of the potentiometric curve (maximum ΔpH/ΔV).',
      },
      {
        label: 'Calculated Acid Concentration',
        labelAr: 'تركيز الحمض المحسوب تجريبياً',
        value: calculatedConc.toFixed(4),
        unit: 'M',
        expectedValue: params.analyteConcentration.toFixed(4),
        percentError: Number(errorPct.toFixed(2)),
        formulaUsed: 'C_analyte = (C_titrant × V_eq) / V_analyte',
        interpretation: 'Experimental molarity of the sample acid determined by volumetric titration.',
      },
      {
        label: 'Equivalence Point pH',
        labelAr: 'الأس الهيدروجيني عند التكافؤ',
        value: (params.analyteType === 'weak_acid_acetic' ? 8.72 : 7.0).toFixed(2),
        unit: 'pH',
        interpretation:
          params.analyteType === 'weak_acid_acetic'
            ? 'Basic pH (>7) due to basic hydrolysis of acetate ions (CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻).'
            : 'Neutral pH (=7) due to complete neutralization of strong acid and strong base.',
      },
    ];
  }

  validateParams(params: TitrationParams): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];
    if (params.analyteVolume <= 0 || params.analyteVolume > 100) errors.push('Analyte volume must be between 1 and 100 mL.');
    if (params.analyteConcentration <= 0) errors.push('Analyte concentration must be positive.');
    if (params.titrantConcentration <= 0) errors.push('Titrant concentration must be positive.');
    return { isValid: errors.length === 0, errors };
  }
}
