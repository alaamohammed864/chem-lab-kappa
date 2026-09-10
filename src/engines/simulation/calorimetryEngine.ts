// Solution Calorimetry & Enthalpy Simulation Engine
// Pure simulation logic - decoupled from UI and Visualization.
import {
  ISimulationEngine,
  BaseSimulationState,
  ExperimentMetadata,
  SimulationAction,
  SimulationResultItem,
  SimulationDataPoint,
} from './types';

export interface CalorimetryParams {
  soluteType: 'cacl2' | 'kcl' | 'nacl' | 'neutralization_dilute';
  soluteMass: number; // grams e.g. 5.0 g
  waterVolume: number; // mL (grams of water) e.g. 100.0 mL
  initialTemp: number; // °C e.g. 22.0 °C
  calorimeterConstant: number; // J/°C e.g. 25.0
  ambientTemp: number; // °C e.g. 22.0 °C
  stirringActive: boolean;
}

export interface CalorimetryState extends BaseSimulationState {
  currentTemp: number;
  initialTempRecorded: number;
  deltaTemp: number;
  soluteAdded: boolean;
  soluteDissolvedFraction: number; // 0 to 1
  cumulativeHeatJoules: number; // J
  peakTempObserved: number;
  isStirring: boolean;
}

// Thermodynamic reference data (Literature values)
const SOLUTE_DATA: Record<
  string,
  { name: string; molarMass: number; deltaH_kJ_mol: number; isExothermic: boolean }
> = {
  cacl2: {
    name: 'Calcium Chloride (CaCl₂)',
    molarMass: 110.98,
    deltaH_kJ_mol: -82.8, // Exothermic
    isExothermic: true,
  },
  kcl: {
    name: 'Potassium Chloride (KCl)',
    molarMass: 74.55,
    deltaH_kJ_mol: 17.2, // Endothermic
    isExothermic: false,
  },
  nacl: {
    name: 'Sodium Chloride (NaCl)',
    molarMass: 58.44,
    deltaH_kJ_mol: 3.88, // Endothermic
    isExothermic: false,
  },
  neutralization_dilute: {
    name: 'Dilute Neutralization (HCl + NaOH)',
    molarMass: 36.46, // normalized per mol H+
    deltaH_kJ_mol: -57.1, // Exothermic
    isExothermic: true,
  },
};

const SPECIFIC_HEAT_WATER = 4.184; // J / (g · °C)
const COOLING_CONSTANT = 0.003; // Newton cooling coefficient (s^-1)

export class CalorimetrySimulationEngine implements ISimulationEngine<CalorimetryState, CalorimetryParams> {
  metadata: ExperimentMetadata = {
    id: 'solution-calorimetry',
    title: 'Solution Calorimetry & Enthalpy of Dissolution',
    titleAr: 'قياس السعرات الحرارية لمحاليل الأملاح وحرارة الذوبان',
    category: 'Thermochemistry & Calorimetry',
    difficulty: 'Intermediate',
    durationMinutes: 12,
    summary:
      'Determination of molar enthalpy of dissolution (ΔH_soln) and neutralization in an insulated constant-pressure calorimeter using thermodynamic heat transfer modeling.',
    summaryAr:
      'حساب الإنثالبي المولي للذوبان والتعادل في مسعر حراري معزول ذي ضغط ثابت باستخدام نمذجة انتقال الحرارة الديناميكية.',
    educationalObjectives: [
      'Apply the First Law of Thermodynamics to isolated calorimeter systems',
      'Distinguish quantitatively between exothermic and endothermic chemical dissolutions',
      'Account for calorimeter heat capacity (C_cal) and cooling curve extrapolation',
      'Calculate molar enthalpy (ΔH) and compare with standard enthalpy tables',
    ],
    educationalObjectivesAr: [
      'تطبيق القانون الأول للديناميكا الحرارية على نظام المسعر المعزول',
      'التمييز كمياً بين تفاعلات الذوبان الطاردة للحرارة والماصة للحرارة',
      'حساب السعة الحرارية للمسعر وتصحيح منحنى التبريد',
      'حساب الإنثالبي المولي ومقارنته بالقيم القياسية المرجعية',
    ],
    safetyGuidelines: [
      'Simulated Educational Experiment: Standard student laboratory PPE required (safety goggles, lab coat, nitrile gloves)',
      'Safe benign educational household salts (CaCl₂, KCl, NaCl) are modeled',
      'Ensure thermometer probe is securely submerged away from the rotating magnetic stir bar',
    ],
    safetyGuidelinesAr: [
      'تجربة تعليمية افتراضية: يلزم ارتداء معدات الوقاية الشخصية المعيارية',
      'تستخدم أملاح منزلية وتعليمية آمنة وغير ضارة',
      'التأكد من غمر مجس مقياس الحرارة بأمان بعيداً عن قضيب التحريك المغناطيسي',
    ],
    paramDefinitions: [
      {
        id: 'soluteType',
        name: 'Solute / Reaction Sample',
        nameAr: 'المادة المذابة / نوع التفاعل',
        type: 'select',
        options: [
          { label: 'Calcium Chloride (CaCl₂) — Exothermic (-82.8 kJ/mol)', labelAr: 'كلوريد الكالسيوم (طارد للحرارة)', value: 'cacl2' },
          { label: 'Potassium Chloride (KCl) — Endothermic (+17.2 kJ/mol)', labelAr: 'كلوريد البوتاسيوم (ماص للحرارة)', value: 'kcl' },
          { label: 'Sodium Chloride (NaCl) — Mildly Endothermic (+3.9 kJ/mol)', labelAr: 'كلوريد الصوديوم (ماص خفيف)', value: 'nacl' },
          { label: 'HCl + NaOH Neutralization (-57.1 kJ/mol)', labelAr: 'تعادل حمض وقاعدة مخففين', value: 'neutralization_dilute' },
        ],
        defaultValue: 'cacl2',
        description: 'Selected chemical compound or reaction to evaluate thermodynamically.',
      },
      {
        id: 'soluteMass',
        name: 'Solute Mass Added (g)',
        nameAr: 'كتلة المادة المذابة (جرام)',
        type: 'number',
        min: 1.0,
        max: 15.0,
        step: 0.5,
        unit: 'g',
        defaultValue: 5.0,
        description: 'Mass of solid salt weighed on precision analytical balance.',
      },
      {
        id: 'waterVolume',
        name: 'Calorimeter Water Volume (mL)',
        nameAr: 'حجم الماء في المسعر (مل)',
        type: 'number',
        min: 50,
        max: 200,
        step: 10,
        unit: 'mL',
        defaultValue: 100.0,
        description: 'Volume of deionized water inside the insulated calorimeter vessel.',
      },
      {
        id: 'initialTemp',
        name: 'Initial Water Temperature (°C)',
        nameAr: 'درجة حرارة الماء الابتدائية (°س)',
        type: 'number',
        min: 15.0,
        max: 30.0,
        step: 0.5,
        unit: '°C',
        defaultValue: 22.0,
        description: 'Baseline temperature of water before solute addition.',
      },
      {
        id: 'calorimeterConstant',
        name: 'Calorimeter Heat Capacity C_cal (J/°C)',
        nameAr: 'السعة الحرارية للمسعر C_cal (جول/°س)',
        type: 'number',
        min: 5.0,
        max: 50.0,
        step: 5.0,
        unit: 'J/°C',
        defaultValue: 25.0,
        description: 'Effective heat capacity of the polystyrene vessel and thermometer.',
      },
    ],
    tableColumns: [
      { key: 'simTime', label: 'Time (t)', labelAr: 'الزمن (ثانية)', unit: 's', precision: 1 },
      { key: 'currentTemp', label: 'Temperature (T)', labelAr: 'درجة الحرارة', unit: '°C', precision: 2 },
      { key: 'deltaTemp', label: 'ΔT', labelAr: 'فرق الحرارة ΔT', unit: '°C', precision: 2 },
      { key: 'dissolvedPct', label: 'Dissolved %', labelAr: 'نسبة الذوبان %', precision: 1 },
      { key: 'cumulativeHeatJoules', label: 'Heat q_soln', labelAr: 'الحرارة المنتقلة q', unit: 'J', precision: 1 },
    ],
    graphConfig: {
      xKey: 'simTime',
      xLabel: 'Elapsed Time',
      xLabelAr: 'الزمن المنقضي',
      xUnit: 's',
      yKey: 'currentTemp',
      yLabel: 'Temperature',
      yLabelAr: 'درجة الحرارة',
      yUnit: '°C',
      secondaryYKey: 'cumulativeHeatJoules',
      secondaryYLabel: 'Heat Flow (J)',
      secondaryYUnit: 'J',
      minX: 0,
      maxX: 120,
      minY: 10,
      maxY: 45,
    },
  };

  getInitialState(params: CalorimetryParams): CalorimetryState {
    return {
      simTime: 0,
      isRunning: false,
      isComplete: false,
      statusText: 'Ready. Add solute sample to begin calorimetric dissolution tracking.',
      statusTextAr: 'جاهز. أضف عينة الملح لبدء قياس التغير الحراري في المسعر.',
      observations: [
        {
          timestamp: 0,
          type: 'info',
          message: `Calorimeter primed with ${params.waterVolume} mL H₂O at ${params.initialTemp.toFixed(1)} °C.`,
          messageAr: `تم تجهيز المسعر بحجم ${params.waterVolume} مل من الماء عند ${params.initialTemp.toFixed(1)} °س.`,
        },
      ],
      dataPoints: [
        {
          id: 'dp-0',
          stepIndex: 0,
          simTime: 0,
          values: {
            simTime: 0,
            currentTemp: Number(params.initialTemp.toFixed(2)),
            deltaTemp: 0,
            dissolvedPct: 0,
            cumulativeHeatJoules: 0,
          },
        },
      ],
      results: [],
      currentTemp: params.initialTemp,
      initialTempRecorded: params.initialTemp,
      deltaTemp: 0,
      soluteAdded: false,
      soluteDissolvedFraction: 0,
      cumulativeHeatJoules: 0,
      peakTempObserved: params.initialTemp,
      isStirring: true,
    };
  }

  step(currentState: CalorimetryState, params: CalorimetryParams, dt: number): CalorimetryState {
    if (!currentState.isRunning || currentState.isComplete) {
      return currentState;
    }

    const newSimTime = currentState.simTime + dt;
    let newDissolvedFraction = currentState.soluteDissolvedFraction;
    let newTemp = currentState.currentTemp;
    const newObservations = [...currentState.observations];

    // Thermodynamic parameters
    const solute = SOLUTE_DATA[params.soluteType] || SOLUTE_DATA.cacl2;
    const moles = params.soluteMass / solute.molarMass;
    const totalTheoreticalHeatJ = -solute.deltaH_kJ_mol * 1000 * moles; // negative because exothermic releases heat to water
    const totalHeatCapacity = params.waterVolume * SPECIFIC_HEAT_WATER + params.calorimeterConstant;

    if (currentState.soluteAdded && newDissolvedFraction < 1.0) {
      // Dissolution rate depends on stirring: stirring fast dissolves in ~15s, unstirred in ~45s
      const dissolveRate = (currentState.isStirring ? 0.08 : 0.025) * dt;
      newDissolvedFraction = Math.min(1.0, currentState.soluteDissolvedFraction + dissolveRate);

      if (newDissolvedFraction >= 1.0 && currentState.soluteDissolvedFraction < 1.0) {
        newObservations.push({
          timestamp: Number(newSimTime.toFixed(1)),
          type: 'milestone',
          message: 'Solute crystals completely dissolved in solution.',
          messageAr: 'ذابت بلورات الملح بالكامل في المحلول.',
        });
      }
    }

    // Heat generation from newly dissolved fraction
    const deltaDissolved = newDissolvedFraction - currentState.soluteDissolvedFraction;
    const heatIncrementJ = deltaDissolved * totalTheoreticalHeatJ;

    // Temperature change from newly generated heat: dT = q / C_total
    const tempChangeFromHeat = heatIncrementJ / totalHeatCapacity;

    // Ambient heat dissipation (Newton's law of cooling)
    const ambientTemp = params.ambientTemp ?? params.initialTemp;
    const coolingDelta = COOLING_CONSTANT * (currentState.currentTemp - ambientTemp) * dt;

    newTemp = currentState.currentTemp + tempChangeFromHeat - coolingDelta;
    const deltaT = newTemp - currentState.initialTempRecorded;

    // Peak tracking
    const isExo = solute.isExothermic;
    let peakTemp = currentState.peakTempObserved;
    if (isExo && newTemp > peakTemp) {
      peakTemp = newTemp;
    } else if (!isExo && newTemp < peakTemp) {
      peakTemp = newTemp;
    }

    // Cumulative heat released/absorbed by solution
    const cumulativeQ = (newTemp - currentState.initialTempRecorded) * totalHeatCapacity;

    // Add data point every 2 simulation seconds
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
          currentTemp: Number(newTemp.toFixed(2)),
          deltaTemp: Number(deltaT.toFixed(2)),
          dissolvedPct: Number((newDissolvedFraction * 100).toFixed(1)),
          cumulativeHeatJoules: Number(cumulativeQ.toFixed(1)),
        },
      });
    }

    const isComplete = newSimTime >= 90.0 && newDissolvedFraction >= 1.0;

    const updatedState: CalorimetryState = {
      ...currentState,
      simTime: newSimTime,
      currentTemp: newTemp,
      deltaTemp: deltaT,
      soluteDissolvedFraction: newDissolvedFraction,
      cumulativeHeatJoules: cumulativeQ,
      peakTempObserved: peakTemp,
      isRunning: !isComplete,
      isComplete,
      statusText: isComplete
        ? 'Experiment completed. Calorimetric heat balance recorded.'
        : `Monitoring: T = ${newTemp.toFixed(2)} °C (ΔT = ${deltaT >= 0 ? '+' : ''}${deltaT.toFixed(2)} °C)`,
      statusTextAr: isComplete
        ? 'اكتملت التجربة. تم تسجيل التوازن الحراري في المسعر.'
        : `مراقبة: T = ${newTemp.toFixed(2)} °س (ΔT = ${deltaT >= 0 ? '+' : ''}${deltaT.toFixed(2)} °س)`,
      observations: newObservations,
      dataPoints: newDataPoints,
    };

    if (isComplete) {
      updatedState.results = this.calculateResults(updatedState, params);
    }

    return updatedState;
  }

  handleAction(currentState: CalorimetryState, action: SimulationAction, params: CalorimetryParams): CalorimetryState {
    switch (action.type) {
      case 'ADD_SOLUTE':
        if (currentState.soluteAdded) return currentState;
        const solute = SOLUTE_DATA[params.soluteType] || SOLUTE_DATA.cacl2;
        return {
          ...currentState,
          isRunning: true,
          soluteAdded: true,
          statusText: `Added ${params.soluteMass} g of ${solute.name} into calorimeter.`,
          statusTextAr: `تمت إضافة ${params.soluteMass} جرام من ${solute.name} إلى المسعر.`,
          observations: [
            ...currentState.observations,
            {
              timestamp: Number(currentState.simTime.toFixed(1)),
              type: 'milestone',
              message: `Added ${params.soluteMass} g of ${solute.name} into calorimeter. Dissolution began.`,
              messageAr: `تمت إضافة ${params.soluteMass} جرام من ${solute.name} إلى المسعر وبدأ الذوبان.`,
            },
          ],
        };

      case 'TOGGLE_RUN':
        return {
          ...currentState,
          isRunning: !currentState.isRunning,
          statusText: currentState.isRunning ? 'Calorimeter recording paused.' : 'Calorimeter recording active.',
          statusTextAr: currentState.isRunning ? 'تم إيقاف التسجيل مؤقتاً.' : 'التسجيل جارٍ.',
        };

      case 'TOGGLE_STIRRER':
        const nextStir = !currentState.isStirring;
        return {
          ...currentState,
          isStirring: nextStir,
          observations: [
            ...currentState.observations,
            {
              timestamp: Number(currentState.simTime.toFixed(1)),
              type: 'change',
              message: nextStir ? 'Calorimeter stirrer started.' : 'Calorimeter stirrer halted.',
              messageAr: nextStir ? 'تم تشغيل محرك المسعر.' : 'تم إيقاف محرك المسعر.',
            },
          ],
        };

      case 'RESET':
        return this.getInitialState(params);

      default:
        return currentState;
    }
  }

  calculateResults(state: CalorimetryState, params: CalorimetryParams): SimulationResultItem[] {
    const solute = SOLUTE_DATA[params.soluteType] || SOLUTE_DATA.cacl2;
    const moles = params.soluteMass / solute.molarMass;
    const maxDeltaT = state.peakTempObserved - state.initialTempRecorded;
    const totalC = params.waterVolume * SPECIFIC_HEAT_WATER + params.calorimeterConstant;

    // q_cal = C_total * maxDeltaT
    const qCalJ = totalC * maxDeltaT;
    // q_rxn = -q_cal
    const qRxnJ = -qCalJ;

    // Experimental molar enthalpy: deltaH_exp = q_rxn / moles (in kJ/mol)
    const deltaHExp_kJ_mol = moles > 0 ? (qRxnJ / 1000) / moles : 0;
    const theoreticalDeltaH = solute.deltaH_kJ_mol;

    const errorPct =
      theoreticalDeltaH !== 0
        ? Math.abs((deltaHExp_kJ_mol - theoreticalDeltaH) / theoreticalDeltaH) * 100
        : 0;

    return [
      {
        label: 'Observed Maximum Temperature Change (ΔT)',
        labelAr: 'أقصى تغير في درجة الحرارة (ΔT)',
        value: `${maxDeltaT >= 0 ? '+' : ''}${maxDeltaT.toFixed(2)}`,
        unit: '°C',
        interpretation: maxDeltaT > 0 ? 'Net temperature rise indicates exothermic dissolution.' : 'Temperature drop indicates endothermic process.',
      },
      {
        label: 'Total Calorimetric Heat Absorbed (q_cal)',
        labelAr: 'الحرارة الممتصة في المسعر (q_cal)',
        value: qCalJ.toFixed(1),
        unit: 'J',
        formulaUsed: 'q_cal = (m_water × c_water + C_cal) × ΔT',
        interpretation: 'Sensible heat captured by the solution and calorimeter vessel.',
      },
      {
        label: 'Experimental Enthalpy of Dissolution (ΔH_exp)',
        labelAr: 'حرارة الذوبان التجريبية المولية (ΔH_exp)',
        value: deltaHExp_kJ_mol.toFixed(2),
        unit: 'kJ/mol',
        expectedValue: theoreticalDeltaH.toFixed(2),
        percentError: Number(errorPct.toFixed(1)),
        formulaUsed: 'ΔH = -q_cal / n_solute',
        interpretation: `Literature standard enthalpy is ${theoreticalDeltaH.toFixed(1)} kJ/mol.`,
      },
      {
        label: 'Thermochemical Classification',
        labelAr: 'التصنيف الكيميائي الحراري',
        value: solute.isExothermic ? 'Exothermic (ΔH < 0)' : 'Endothermic (ΔH > 0)',
        interpretation: solute.isExothermic
          ? 'Lattice energy is lower than hydration energy, releasing heat.'
          : 'Lattice energy exceeds hydration energy, absorbing thermal energy from water.',
      },
    ];
  }

  validateParams(params: CalorimetryParams): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];
    if (params.soluteMass <= 0) errors.push('Solute mass must be greater than zero.');
    if (params.waterVolume <= 0) errors.push('Water volume must be greater than zero.');
    return { isValid: errors.length === 0, errors };
  }
}
