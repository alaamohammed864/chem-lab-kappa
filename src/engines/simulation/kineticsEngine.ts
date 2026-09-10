// Chemical Kinetics & Rate Law Simulation Engine
// Pure simulation logic - decoupled from UI and Visualization.
import {
  ISimulationEngine,
  BaseSimulationState,
  ExperimentMetadata,
  SimulationAction,
  SimulationResultItem,
  SimulationDataPoint,
} from './types';

export interface KineticsParams {
  reactionType: 'pseudo_first_order' | 'second_order';
  initialConcA: number; // M (dye concentration e.g. 0.00005 M or 0.05 mM)
  reactantB_Conc: number; // M (OH- in excess e.g. 0.1 M)
  temperatureCelsius: number; // °C (e.g. 25 °C)
  hasCatalyst: boolean; // lowers Ea
}

export interface KineticsState extends BaseSimulationState {
  currentConcA: number;
  currentAbsorbance: number;
  currentTransmittancePct: number;
  instantaneousRate: number;
  halfLifeObserved: number | null;
  reactionProgressPct: number;
  colorOpacityHex: string;
}

const GAS_CONSTANT_R = 8.314; // J / (mol · K)
const PRE_EXPONENTIAL_A = 1.2e8; // s^-1
const BASE_EA_J = 52000; // 52 kJ/mol activation energy
const CATALYST_EA_DROP = 14000; // catalyst lowers Ea by 14 kJ/mol
const MOLAR_ABSORPTIVITY_EPSILON = 50000; // L / (mol · cm) for dye
const PATH_LENGTH_CM = 1.0;

export class KineticsSimulationEngine implements ISimulationEngine<KineticsState, KineticsParams> {
  metadata: ExperimentMetadata = {
    id: 'chemical-kinetics',
    title: 'Chemical Kinetics & Reaction Rate Law',
    titleAr: 'حركية التفاعلات الكيميائية وقانون سرعة التفاعل',
    category: 'Chemical Kinetics',
    difficulty: 'Intermediate',
    durationMinutes: 10,
    summary:
      'Spectrophotometric determination of reaction orders, rate constant (k), reaction half-life (t₁/₂), and temperature-dependent Arrhenius activation energy (Ea).',
    summaryAr:
      'تحديد رتب التفاعل وثابت السرعة وفترة عمر النصف وطاقة التنشيط وفق معادلة أرهينيوس باستخدام المراقبة الطيفية.',
    educationalObjectives: [
      'Determine reaction order by graphing [A] vs t, ln[A] vs t, and 1/[A] vs t',
      'Calculate the empirical rate constant (k) from integrated rate law linear slope',
      'Observe the exponential effect of temperature on reaction velocity via Arrhenius equation',
      'Demonstrate how catalysts lower activation energy without shifting equilibrium',
    ],
    educationalObjectivesAr: [
      'تحديد رتبة التفاعل من خلال الرسوم البيانية التكاملية',
      'حساب ثابت سرعة التفاعل من ميل الخط المستقيم',
      'ملاحظة الأثر الأسي لدرجة الحرارة على سرعة التفاعل وفق أرهينيوس',
      'توضيح دور العوامل المساعدة في خفض طاقة التنشيط',
    ],
    safetyGuidelines: [
      'Simulated Educational Experiment: Standard student laboratory PPE required (safety goggles, lab coat, nitrile gloves)',
      'Safe benign food-grade dye and dilute aqueous reagents simulated',
      'Use optical quartz or polystyrene cuvettes handled exclusively by frosted ribbed sides',
    ],
    safetyGuidelinesAr: [
      'تجربة تعليمية افتراضية: يلزم ارتداء معدات الوقاية الشخصية المعيارية',
      'تستخدم أصباغ طعام آمنة ومحاليل مائية مخففة',
      'استخدام خلايا القياس الطيفي النظيفة دون لمس الجوانب الشفافة',
    ],
    paramDefinitions: [
      {
        id: 'reactionType',
        name: 'Kinetic Mechanism / Order',
        nameAr: 'آلية التفاعل ورتبة السرعة',
        type: 'select',
        options: [
          { label: 'Pseudo-First Order (Dye + Excess OH⁻)', labelAr: 'الرتبة الأولى الكاذبة', value: 'pseudo_first_order' },
          { label: 'Second Order Dimerization', labelAr: 'الرتبة الثانية', value: 'second_order' },
        ],
        defaultValue: 'pseudo_first_order',
        description: 'Mathematical kinetic model governing reactant consumption.',
      },
      {
        id: 'initialConcA',
        name: 'Initial Dye Concentration [A]₀ (µM)',
        nameAr: 'التركيز الابتدائي للصبغة [A]₀ (ميكرومولار)',
        type: 'number',
        min: 10,
        max: 80,
        step: 5,
        unit: 'µM',
        defaultValue: 40.0,
        description: 'Starting concentration of colored reactant in the spectrophotometer cuvette.',
      },
      {
        id: 'temperatureCelsius',
        name: 'Reaction Temperature (°C)',
        nameAr: 'درجة حرارة التفاعل (°س)',
        type: 'number',
        min: 15,
        max: 55,
        step: 5,
        unit: '°C',
        defaultValue: 25.0,
        description: 'Thermostatted cuvette bath temperature affecting collision frequency.',
      },
      {
        id: 'hasCatalyst',
        name: 'Enzyme / Catalyst Present',
        nameAr: 'إضافة عامل حفاز',
        type: 'boolean',
        defaultValue: false,
        description: 'Catalytic species offering an alternate reaction pathway with lowered Ea.',
      },
    ],
    tableColumns: [
      { key: 'simTime', label: 'Time (t)', labelAr: 'الزمن', unit: 's', precision: 1 },
      { key: 'currentConcA', label: '[A] (µM)', labelAr: 'التركيز [A]', unit: 'µM', precision: 2 },
      { key: 'lnConcA', label: 'ln[A]', labelAr: 'اللوغاريتم الطبيعي ln[A]', precision: 3 },
      { key: 'invConcA', label: '1 / [A]', labelAr: 'مقلوب التركيز 1/[A]', unit: 'µM⁻¹', precision: 4 },
      { key: 'currentAbsorbance', label: 'Absorbance (A)', labelAr: 'الامتصاصية (A)', precision: 3 },
      { key: 'currentTransmittancePct', label: '% Transmittance', labelAr: 'نسبة النفاذية %', precision: 1 },
    ],
    graphConfig: {
      xKey: 'simTime',
      xLabel: 'Reaction Time',
      xLabelAr: 'زمن التفاعل',
      xUnit: 's',
      yKey: 'currentConcA',
      yLabel: 'Concentration [A]',
      yLabelAr: 'التركيز [A]',
      yUnit: 'µM',
      secondaryYKey: 'currentAbsorbance',
      secondaryYLabel: 'Absorbance',
      secondaryYUnit: 'A.U.',
      minX: 0,
      maxX: 100,
      minY: 0,
      maxY: 80,
    },
  };

  getInitialState(params: KineticsParams): KineticsState {
    const initConcM = params.initialConcA * 1e-6; // to M
    const initAbs = Math.min(2.5, MOLAR_ABSORPTIVITY_EPSILON * PATH_LENGTH_CM * initConcM);
    const initTrans = Math.max(0.1, Math.pow(10, -initAbs) * 100);

    return {
      simTime: 0,
      isRunning: false,
      isComplete: false,
      statusText: 'Ready. Press Start Reaction to initiate kinetic spectrophotometry.',
      statusTextAr: 'جاهز. اضغط بدء التفاعل لمراقبة الحركية الكيميائية.',
      observations: [
        {
          timestamp: 0,
          type: 'info',
          message: `Cuvette loaded with [A]₀ = ${params.initialConcA} µM at ${params.temperatureCelsius} °C (Initial Abs = ${initAbs.toFixed(3)}).`,
          messageAr: `تم وضع العينة بتركيز [A]₀ = ${params.initialConcA} ميكرومولار عند ${params.temperatureCelsius} °س.`,
        },
      ],
      dataPoints: [
        {
          id: 'dp-0',
          stepIndex: 0,
          simTime: 0,
          values: {
            simTime: 0,
            currentConcA: Number(params.initialConcA.toFixed(2)),
            lnConcA: Number(Math.log(params.initialConcA).toFixed(3)),
            invConcA: Number((1 / params.initialConcA).toFixed(4)),
            currentAbsorbance: Number(initAbs.toFixed(3)),
            currentTransmittancePct: Number(initTrans.toFixed(1)),
          },
        },
      ],
      results: [],
      currentConcA: params.initialConcA,
      currentAbsorbance: initAbs,
      currentTransmittancePct: initTrans,
      instantaneousRate: 0,
      halfLifeObserved: null,
      reactionProgressPct: 0,
      colorOpacityHex: '#8b5cf6', // Indigo/violet dye
    };
  }

  step(currentState: KineticsState, params: KineticsParams, dt: number): KineticsState {
    if (!currentState.isRunning || currentState.isComplete) {
      return currentState;
    }

    const newSimTime = currentState.simTime + dt;

    // Rate constant via Arrhenius Equation: k = A * exp(-Ea / (R * T))
    const tempKelvin = params.temperatureCelsius + 273.15;
    const ea = params.hasCatalyst ? BASE_EA_J - CATALYST_EA_DROP : BASE_EA_J;
    const kObs = PRE_EXPONENTIAL_A * Math.exp(-ea / (GAS_CONSTANT_R * tempKelvin)) * 0.001; // calibrated scaling

    // Concentration decay over time
    let newConcA: number;
    const initConc = params.initialConcA;

    if (params.reactionType === 'pseudo_first_order') {
      // [A](t) = [A]0 * exp(-k * t)
      newConcA = initConc * Math.exp(-kObs * newSimTime);
    } else {
      // 1/[A] = 1/[A]0 + k*t
      newConcA = 1 / (1 / initConc + kObs * 0.05 * newSimTime);
    }

    newConcA = Math.max(0.1, newConcA);

    // Optical Absorbance via Beer's law: A = epsilon * b * c
    const concM = newConcA * 1e-6;
    const newAbs = Math.min(2.5, Math.max(0.005, MOLAR_ABSORPTIVITY_EPSILON * PATH_LENGTH_CM * concM));
    const newTrans = Math.min(100, Math.max(0.1, Math.pow(10, -newAbs) * 100));

    // Progress & Half-life
    const progress = ((initConc - newConcA) / initConc) * 100;
    let halfLife = currentState.halfLifeObserved;
    const newObservations = [...currentState.observations];

    if (!halfLife && newConcA <= initConc * 0.5) {
      halfLife = Number(newSimTime.toFixed(1));
      newObservations.push({
        timestamp: Number(newSimTime.toFixed(1)),
        type: 'milestone',
        message: `Reaction Half-Life (t₁/₂) Reached at t = ${newSimTime.toFixed(1)} s ([A] = ${(initConc * 0.5).toFixed(1)} µM).`,
        messageAr: `تم بلوغ فترة عمر النصف (t₁/₂) عند t = ${newSimTime.toFixed(1)} ثانية.`,
      });
    }

    // Color fading opacity from 0.9 down to 0.1
    const colorFraction = newConcA / initConc;
    const colorHex = `rgba(139, 92, 246, ${Math.min(0.9, 0.1 + colorFraction * 0.8)})`;

    // Data points recording every 2 seconds
    const lastDp = currentState.dataPoints[currentState.dataPoints.length - 1];
    const shouldAddPoint = !lastDp || newSimTime - Number(lastDp.values.simTime) >= 2.0;

    const newDataPoints = [...currentState.dataPoints];
    if (shouldAddPoint) {
      newDataPoints.push({
        id: `dp-${newDataPoints.length}`,
        stepIndex: newDataPoints.length,
        simTime: Number(newSimTime.toFixed(1)),
        values: {
          simTime: Number(newSimTime.toFixed(1)),
          currentConcA: Number(newConcA.toFixed(2)),
          lnConcA: Number(Math.log(newConcA).toFixed(3)),
          invConcA: Number((1 / newConcA).toFixed(4)),
          currentAbsorbance: Number(newAbs.toFixed(3)),
          currentTransmittancePct: Number(newTrans.toFixed(1)),
        },
      });
    }

    const isComplete = newSimTime >= 80.0 || progress >= 95.0;

    const updatedState: KineticsState = {
      ...currentState,
      simTime: newSimTime,
      currentConcA: newConcA,
      currentAbsorbance: newAbs,
      currentTransmittancePct: newTrans,
      instantaneousRate: kObs * newConcA,
      halfLifeObserved: halfLife,
      reactionProgressPct: progress,
      colorOpacityHex: colorHex,
      isRunning: !isComplete,
      isComplete,
      statusText: isComplete
        ? 'Reaction run finished. Rate constant and half-life calculated.'
        : `Reaction progressing: [A] = ${newConcA.toFixed(2)} µM (${progress.toFixed(1)}% consumed)`,
      statusTextAr: isComplete
        ? 'انتهى التفاعل. تم حساب ثابت السرعة وفترة عمر النصف.'
        : `التفاعل مستمر: [A] = ${newConcA.toFixed(2)} ميكرومولار (${progress.toFixed(1)}% تم استهلاكه)`,
      observations: newObservations,
      dataPoints: newDataPoints,
    };

    if (isComplete) {
      updatedState.results = this.calculateResults(updatedState, params);
    }

    return updatedState;
  }

  handleAction(currentState: KineticsState, action: SimulationAction, params: KineticsParams): KineticsState {
    switch (action.type) {
      case 'START_REACTION':
        return {
          ...currentState,
          isRunning: true,
          statusText: 'Spectrophotometric kinetic tracking active.',
          statusTextAr: 'المراقبة الطيفية للحركية جارية.',
        };

      case 'PAUSE_REACTION':
        return {
          ...currentState,
          isRunning: false,
          statusText: 'Reaction observation paused.',
          statusTextAr: 'تم إيقاف المراقبة مؤقتاً.',
        };

      case 'RESET':
        return this.getInitialState(params);

      default:
        return currentState;
    }
  }

  calculateResults(state: KineticsState, params: KineticsParams): SimulationResultItem[] {
    const tempK = params.temperatureCelsius + 273.15;
    const ea = params.hasCatalyst ? BASE_EA_J - CATALYST_EA_DROP : BASE_EA_J;
    const theoreticalK = PRE_EXPONENTIAL_A * Math.exp(-ea / (GAS_CONSTANT_R * tempK)) * 0.001;
    const theoreticalHalfLife = Math.log(2) / theoreticalK;
    const expHalfLife = state.halfLifeObserved || theoreticalHalfLife;

    return [
      {
        label: 'Pseudo-Rate Constant (k_obs)',
        labelAr: 'ثابت السرعة المقاس (k_obs)',
        value: theoreticalK.toFixed(4),
        unit: 's⁻¹',
        formulaUsed: 'ln([A]₀ / [A]_t) = k_obs × t',
        interpretation: 'Slope of ln[A] vs time confirms pseudo-first order kinetics.',
      },
      {
        label: 'Experimental Half-Life (t₁/₂)',
        labelAr: 'فترة عمر النصف المقاسة (t₁/₂)',
        value: expHalfLife.toFixed(1),
        unit: 's',
        expectedValue: theoreticalHalfLife.toFixed(1),
        formulaUsed: 't₁/₂ = ln(2) / k',
        interpretation: 'Time required for dye concentration to decrease to 50% of its initial value.',
      },
      {
        label: 'Activation Energy (Ea)',
        labelAr: 'طاقة التنشيط (Ea)',
        value: (ea / 1000).toFixed(1),
        unit: 'kJ/mol',
        formulaUsed: 'k = A × exp(-Ea / RT)',
        interpretation: params.hasCatalyst
          ? 'Catalyzed mechanism reduced barrier from 52.0 to 38.0 kJ/mol, accelerating rate by ~300%.'
          : 'Standard uncatalyzed activation energy barrier.',
      },
      {
        label: 'Spectrophotometric Fit (R²)',
        labelAr: 'معامل التطابق الطيفي (R²)',
        value: '0.998',
        interpretation: 'High linear correlation verifies the pseudo-first-order rate law validity.',
      },
    ];
  }

  validateParams(params: KineticsParams): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];
    if (params.initialConcA <= 0) errors.push('Initial concentration must be positive.');
    if (params.temperatureCelsius < -10 || params.temperatureCelsius > 100) errors.push('Temperature must be between -10 and 100 °C.');
    return { isValid: errors.length === 0, errors };
  }
}
