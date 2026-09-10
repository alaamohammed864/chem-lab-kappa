// Gas Laws & Thermodynamic PVT Chamber Simulation Engine
// Pure simulation logic - decoupled from UI and Visualization.
import {
  ISimulationEngine,
  BaseSimulationState,
  ExperimentMetadata,
  SimulationAction,
  SimulationResultItem,
  SimulationDataPoint,
} from './types';

export interface GasLawParams {
  gasType: 'he' | 'n2' | 'co2' | 'ideal';
  mode: 'boyle_isothermal' | 'charles_isobaric' | 'gay_lussac_isochoric';
  initialVolumeL: number; // L e.g. 2.0 L
  initialTempC: number; // °C e.g. 25 °C
  molesGas: number; // mol e.g. 0.1 mol
}

export interface GasLawState extends BaseSimulationState {
  currentVolumeL: number;
  currentPressureKPa: number;
  currentTempK: number;
  currentTempC: number;
  molesGas: number;
  vRms_m_s: number; // root mean square speed
  compressibilityZ: number; // PV / (nRT)
  pistonPositionFraction: number; // 0 to 1
  particleCollisionRate: number; // collisions per sec
}

const R_KPA_L_MOL_K = 8.31446; // kPa · L / (mol · K)
const GAS_CONSTANTS: Record<string, { molarMassG: number; vdwA: number; vdwB: number; name: string }> = {
  he: { molarMassG: 4.0026, vdwA: 0.0346, vdwB: 0.0237, name: 'Helium (He)' },
  n2: { molarMassG: 28.0134, vdwA: 1.370, vdwB: 0.0387, name: 'Nitrogen (N₂)' },
  co2: { molarMassG: 44.01, vdwA: 3.658, vdwB: 0.0429, name: 'Carbon Dioxide (CO₂)' },
  ideal: { molarMassG: 28.97, vdwA: 0.0, vdwB: 0.0, name: 'Ideal Gas' },
};

export class GasLawSimulationEngine implements ISimulationEngine<GasLawState, GasLawParams> {
  metadata: ExperimentMetadata = {
    id: 'gas-laws-pvt',
    title: 'Gas Laws & Thermodynamic PVT Chamber',
    titleAr: 'قوانين الغازات وغرفة الضغط والحجم والحرارة (PVT)',
    category: 'Gas Laws & Thermodynamics',
    difficulty: 'Introductory',
    durationMinutes: 10,
    summary:
      'Investigation of Boyle, Charles, and Gay-Lussac thermodynamic gas relations in a variable piston chamber with kinetic molecular speed visualization.',
    summaryAr:
      'استكشاف قوانين بويل وشارل وغي-لوساك في أسطوانة متغيرة المكبس مع نمذجة السرعة الجزيئية ومحاكاة الغاز الحقيقي.',
    educationalObjectives: [
      'Verify Boyle’s Law (P ∝ 1/V) at constant temperature',
      'Verify Charles’s Law (V ∝ T) and extrapolate to absolute zero (0 K)',
      'Calculate root-mean-square molecular speed (v_rms) from kinetic theory of gases',
      'Observe real gas deviations via Van der Waals equation and compressibility factor Z',
    ],
    educationalObjectivesAr: [
      'التحقق من قانون بويل عند ثبوت درجة الحرارة',
      'التحقق من قانون شارل والاستقراء نحو الصفر المطلق (0 كلفن)',
      'حساب متوسط سرعة الجزيئات الجذرية من النظرية الحركية',
      'ملاحظة انحرافات الغاز الحقيقي وفق معادلة فان دير فالس',
    ],
    safetyGuidelines: [
      'Simulated Educational Experiment: Standard student laboratory PPE required (safety goggles, lab coat)',
      'Safe benign gases (He, N₂, CO₂) and non-hazardous classroom pressures (<500 kPa) simulated',
      'Virtual pressure-relief safety valve is calibrated to prevent chamber over-pressurization',
    ],
    safetyGuidelinesAr: [
      'تجربة تعليمية افتراضية: يلزم ارتداء معدات الوقاية الشخصية المعيارية',
      'تستخدم غازات آمنة وغير ضارة مع ضغوط مخبرية معيارية',
      'صمام أمان افتراضي لمنع تجاوز الضغط الأقصى المسموح',
    ],
    paramDefinitions: [
      {
        id: 'gasType',
        name: 'Gas Specimen',
        nameAr: 'عينة الغاز',
        type: 'select',
        options: [
          { label: 'Ideal Gas (Zero volume & intermolecular forces)', labelAr: 'غاز مثالي', value: 'ideal' },
          { label: 'Helium (He) - Monatomic noble gas', labelAr: 'الهيليوم (غاز خامل)', value: 'he' },
          { label: 'Nitrogen (N₂) - Diatomic air constituent', labelAr: 'النيتروجين (ثنائي الذرة)', value: 'n2' },
          { label: 'Carbon Dioxide (CO₂) - Real gas with polarizability', labelAr: 'ثاني أكسيد الكربون', value: 'co2' },
        ],
        defaultValue: 'ideal',
        description: 'Gas model and molecular weight influencing kinetic behavior.',
      },
      {
        id: 'mode',
        name: 'Experimental Law / Regime',
        nameAr: 'نظام التجربة / القانون المختار',
        type: 'select',
        options: [
          { label: 'Boyle’s Law (Isothermal: T Constant, Adjust Volume)', labelAr: 'قانون بويل (ثبوت الحرارة، تغيير الحجم)', value: 'boyle_isothermal' },
          { label: 'Charles’s Law (Isobaric: P Constant, Adjust Temp)', labelAr: 'قانون شارل (ثبوت الضغط، تغيير الحرارة)', value: 'charles_isobaric' },
          { label: 'Gay-Lussac’s Law (Isochoric: V Constant, Adjust Temp)', labelAr: 'قانون غي-لوساك (ثبوت الحجم، تغيير الحرارة)', value: 'gay_lussac_isochoric' },
        ],
        defaultValue: 'boyle_isothermal',
        description: 'Thermodynamic constraint governing state transformations.',
      },
      {
        id: 'molesGas',
        name: 'Amount of Gas (mol)',
        nameAr: 'كمية الغاز (مول)',
        type: 'number',
        min: 0.02,
        max: 0.25,
        step: 0.01,
        unit: 'mol',
        defaultValue: 0.1,
        description: 'Fixed molar quantity enclosed in the piston chamber.',
      },
      {
        id: 'initialVolumeL',
        name: 'Initial Chamber Volume (L)',
        nameAr: 'الحجم الابتدائي للغرفة (لتر)',
        type: 'number',
        min: 0.5,
        max: 5.0,
        step: 0.1,
        unit: 'L',
        defaultValue: 2.0,
        description: 'Enclosed volume of the variable-height cylinder.',
      },
      {
        id: 'initialTempC',
        name: 'Initial Temperature (°C)',
        nameAr: 'درجة الحرارة الابتدائية (°م)',
        type: 'number',
        min: -50,
        max: 200,
        step: 1,
        unit: '°C',
        defaultValue: 25.0,
        description: 'Thermal bath starting temperature.',
      },
    ],
    tableColumns: [
      { key: 'currentVolumeL', label: 'Volume (V)', labelAr: 'الحجم (V)', unit: 'L', precision: 3 },
      { key: 'currentPressureKPa', label: 'Pressure (P)', labelAr: 'الضغط (P)', unit: 'kPa', precision: 1 },
      { key: 'currentTempC', label: 'Temp (T)', labelAr: 'درجة الحرارة', unit: '°C', precision: 1 },
      { key: 'pvProduct', label: 'P × V Product', labelAr: 'حاصل الضرب P × V', unit: 'kPa·L', precision: 2 },
      { key: 'vRms_m_s', label: 'v_rms', labelAr: 'السرعة الجزيئية', unit: 'm/s', precision: 0 },
    ],
    graphConfig: {
      xKey: 'currentVolumeL',
      xLabel: 'Volume of Gas (V)',
      xLabelAr: 'حجم الغاز (V)',
      xUnit: 'L',
      yKey: 'currentPressureKPa',
      yLabel: 'Pressure (P)',
      yLabelAr: 'الضغط (P)',
      yUnit: 'kPa',
      secondaryYKey: 'pvProduct',
      secondaryYLabel: 'P · V Constant',
      secondaryYUnit: 'kPa·L',
      minX: 0.5,
      maxX: 5.0,
      minY: 0,
      maxY: 600,
    },
  };

  getInitialState(params: GasLawParams): GasLawState {
    const tempC = params.initialTempC !== undefined ? params.initialTempC : 25;
    const vol = params.initialVolumeL !== undefined ? params.initialVolumeL : 2.0;
    const moles = params.molesGas !== undefined ? params.molesGas : 0.1;
    const tempK = tempC + 273.15;
    const pKPa = this.calculatePressure(vol, tempK, moles, params.gasType);
    const gas = GAS_CONSTANTS[params.gasType] || GAS_CONSTANTS.ideal;
    const vRms = Math.sqrt((3 * 8.31446 * tempK) / (gas.molarMassG * 0.001));

    return {
      simTime: 0,
      isRunning: false,
      isComplete: false,
      statusText: 'Ready. Use piston controls or temperature thermal coils to observe gas response.',
      statusTextAr: 'جاهز. استخدم أدوات المكبس أو الملفات الحرارية لمراقبة سلوك الغاز.',
      observations: [
        {
          timestamp: 0,
          type: 'info',
          message: `Chamber filled with ${moles} mol ${gas.name} at V = ${vol.toFixed(2)} L, T = ${tempC} °C (P = ${pKPa.toFixed(1)} kPa).`,
          messageAr: `تم ملء الغرفة بـ ${moles} مول من ${gas.name} عند حجم ${vol.toFixed(2)} لتر وضغط ${pKPa.toFixed(1)} كيلو باسكال.`,
        },
      ],
      dataPoints: [
        {
          id: 'dp-0',
          stepIndex: 0,
          simTime: 0,
          values: {
            currentVolumeL: Number(vol.toFixed(3)),
            currentPressureKPa: Number(pKPa.toFixed(1)),
            currentTempC: Number(tempC.toFixed(1)),
            currentTempK: Number(tempK.toFixed(1)),
            pvProduct: Number((pKPa * vol).toFixed(2)),
            vRms_m_s: Number(vRms.toFixed(0)),
          },
        },
      ],
      results: [],
      currentVolumeL: vol,
      currentPressureKPa: pKPa,
      currentTempK: tempK,
      currentTempC: tempC,
      molesGas: moles,
      vRms_m_s: vRms,
      compressibilityZ: (pKPa * vol) / (params.molesGas * R_KPA_L_MOL_K * tempK),
      pistonPositionFraction: vol / 5.0,
      particleCollisionRate: Math.round(vRms * 12),
    };
  }

  step(currentState: GasLawState, params: GasLawParams, dt: number): GasLawState {
    if (!currentState.isRunning || currentState.isComplete) {
      return currentState;
    }

    const newSimTime = currentState.simTime + dt;

    // In automated runs (e.g. compression sweep):
    let newVol = currentState.currentVolumeL;
    let newTempK = currentState.currentTempK;

    if (params.mode === 'boyle_isothermal') {
      // Gradually compress from 4.0 L down to 0.8 L
      newVol = Math.max(0.8, currentState.currentVolumeL - 0.08 * dt);
    } else if (params.mode === 'charles_isobaric') {
      // Heat up at constant pressure, volume expands
      newTempK = Math.min(450, currentState.currentTempK + 3.0 * dt);
      newVol = (params.molesGas * R_KPA_L_MOL_K * newTempK) / currentState.currentPressureKPa;
    } else if (params.mode === 'gay_lussac_isochoric') {
      // Heat up at constant volume, pressure increases
      newTempK = Math.min(450, currentState.currentTempK + 3.0 * dt);
    }

    const newPressure = this.calculatePressure(newVol, newTempK, currentState.molesGas, params.gasType);
    const gas = GAS_CONSTANTS[params.gasType] || GAS_CONSTANTS.ideal;
    const newVRms = Math.sqrt((3 * 8.31446 * newTempK) / (gas.molarMassG * 0.001));

    // Add data point periodically
    const lastDp = currentState.dataPoints[currentState.dataPoints.length - 1];
    const shouldAdd = !lastDp || newSimTime - Number(lastDp.values.simTime || 0) >= 2.0;

    const newDataPoints = [...currentState.dataPoints];
    if (shouldAdd) {
      newDataPoints.push({
        id: `dp-${newDataPoints.length}`,
        stepIndex: newDataPoints.length,
        simTime: Number(newSimTime.toFixed(1)),
        values: {
          currentVolumeL: Number(newVol.toFixed(3)),
          currentPressureKPa: Number(newPressure.toFixed(1)),
          currentTempC: Number((newTempK - 273.15).toFixed(1)),
          currentTempK: Number(newTempK.toFixed(1)),
          pvProduct: Number((newPressure * newVol).toFixed(2)),
          vRms_m_s: Number(newVRms.toFixed(0)),
        },
      });
    }

    const isComplete = newSimTime >= 40.0 || (params.mode === 'boyle_isothermal' && newVol <= 0.82);

    const updatedState: GasLawState = {
      ...currentState,
      simTime: newSimTime,
      currentVolumeL: newVol,
      currentPressureKPa: newPressure,
      currentTempK: newTempK,
      currentTempC: newTempK - 273.15,
      vRms_m_s: newVRms,
      compressibilityZ: (newPressure * newVol) / (currentState.molesGas * R_KPA_L_MOL_K * newTempK),
      pistonPositionFraction: Math.min(1.0, Math.max(0.1, newVol / 5.0)),
      particleCollisionRate: Math.round(newVRms * (5.0 / newVol) * 4),
      isRunning: !isComplete,
      isComplete,
      statusText: isComplete
        ? 'Gas compression cycle completed.'
        : `Monitoring: V = ${newVol.toFixed(2)} L, P = ${newPressure.toFixed(1)} kPa, T = ${(newTempK - 273.15).toFixed(1)} °C`,
      statusTextAr: isComplete
        ? 'اكتملت دورة انضغاط الغاز.'
        : `مراقبة: V = ${newVol.toFixed(2)} لتر، P = ${newPressure.toFixed(1)} كيلو باسكال، T = ${(newTempK - 273.15).toFixed(1)} °س`,
      dataPoints: newDataPoints,
    };

    if (isComplete) {
      updatedState.results = this.calculateResults(updatedState, params);
    }

    return updatedState;
  }

  handleAction(currentState: GasLawState, action: SimulationAction, params: GasLawParams): GasLawState {
    switch (action.type) {
      case 'SET_VOLUME': {
        const newVol = Math.max(0.5, Math.min(5.0, Number(action.payload?.volume) || 2.0));
        const newP = this.calculatePressure(newVol, currentState.currentTempK, currentState.molesGas, params.gasType);
        return this.recordManualChange(currentState, newVol, newP, currentState.currentTempK, params, 'Adjusted piston volume.');
      }

      case 'SET_TEMPERATURE': {
        const newTempC = Number(action.payload?.tempC) ?? 25.0;
        const newTempK = newTempC + 273.15;
        let newVol = currentState.currentVolumeL;
        if (params.mode === 'charles_isobaric') {
          // isobaric expansion
          newVol = (currentState.molesGas * R_KPA_L_MOL_K * newTempK) / currentState.currentPressureKPa;
        }
        const newP = this.calculatePressure(newVol, newTempK, currentState.molesGas, params.gasType);
        return this.recordManualChange(currentState, newVol, newP, newTempK, params, `Changed chamber temperature to ${newTempC.toFixed(1)} °C.`);
      }

      case 'START_SWEEP':
        return {
          ...currentState,
          isRunning: true,
          statusText: 'Automatic thermodynamic state sweep running.',
          statusTextAr: 'المسح الديناميكي الحراري التلقائي جاري.',
        };

      case 'PAUSE_SWEEP':
        return {
          ...currentState,
          isRunning: false,
          statusText: 'Thermodynamic sweep paused.',
          statusTextAr: 'تم إيقاف المسح مؤقتاً.',
        };

      case 'RESET':
        return this.getInitialState(params);

      default:
        return currentState;
    }
  }

  private recordManualChange(
    state: GasLawState,
    vol: number,
    pressure: number,
    tempK: number,
    params: GasLawParams,
    logMsg: string
  ): GasLawState {
    const gas = GAS_CONSTANTS[params.gasType] || GAS_CONSTANTS.ideal;
    const vRms = Math.sqrt((3 * 8.31446 * tempK) / (gas.molarMassG * 0.001));

    const newDataPoints = [
      ...state.dataPoints,
      {
        id: `dp-${state.dataPoints.length}`,
        stepIndex: state.dataPoints.length,
        simTime: Number(state.simTime.toFixed(1)),
        values: {
          currentVolumeL: Number(vol.toFixed(3)),
          currentPressureKPa: Number(pressure.toFixed(1)),
          currentTempC: Number((tempK - 273.15).toFixed(1)),
          currentTempK: Number(tempK.toFixed(1)),
          pvProduct: Number((pressure * vol).toFixed(2)),
          vRms_m_s: Number(vRms.toFixed(0)),
        },
      },
    ];

    return {
      ...state,
      currentVolumeL: vol,
      currentPressureKPa: pressure,
      currentTempK: tempK,
      currentTempC: tempK - 273.15,
      vRms_m_s: vRms,
      compressibilityZ: (pressure * vol) / (state.molesGas * R_KPA_L_MOL_K * tempK),
      pistonPositionFraction: vol / 5.0,
      particleCollisionRate: Math.round(vRms * (5.0 / vol) * 4),
      observations: [
        ...state.observations,
        {
          timestamp: Number(state.simTime.toFixed(1)),
          type: 'change',
          message: logMsg,
        },
      ],
      dataPoints: newDataPoints,
    };
  }

  private calculatePressure(volL: number, tempK: number, nMoles: number, gasType: string): number {
    const gas = GAS_CONSTANTS[gasType] || GAS_CONSTANTS.ideal;
    if (gasType === 'ideal' || (gas.vdwA === 0 && gas.vdwB === 0)) {
      // Ideal Gas Law: P = (n * R * T) / V
      return (nMoles * R_KPA_L_MOL_K * tempK) / volL;
    }

    // Van der Waals: P = (n * R * T) / (V - n * b) - a * (n / V)^2
    const n = nMoles;
    const v = volL;
    const denominator = v - n * gas.vdwB;
    if (denominator <= 0.001) return 2000; // safety ceiling
    const term1 = (n * R_KPA_L_MOL_K * tempK) / denominator;
    const term2 = gas.vdwA * Math.pow(n / v, 2) * 101.325; // convert L^2 atm to kPa
    return Math.max(10, term1 - term2);
  }

  calculateResults(state: GasLawState, params: GasLawParams): SimulationResultItem[] {
    const pKPa = state.currentPressureKPa;
    const vL = state.currentVolumeL;
    const tK = state.currentTempK;
    const n = state.molesGas;

    // Derived experimental gas constant R_exp = (P * V) / (n * T)
    const expR = (pKPa * vL) / (n * tK);
    const theoreticalR = R_KPA_L_MOL_K;
    const errorPct = Math.abs((expR - theoreticalR) / theoreticalR) * 100;

    return [
      {
        label: 'Calculated Gas Constant (R_exp)',
        labelAr: 'ثابت الغازات العام المحسوب (R_exp)',
        value: expR.toFixed(3),
        unit: 'kPa·L / (mol·K)',
        expectedValue: theoreticalR.toFixed(3),
        percentError: Number(errorPct.toFixed(2)),
        formulaUsed: 'R = (P × V) / (n × T)',
        interpretation: 'Matches ideal universal gas constant (8.314 J/mol·K) within experimental accuracy.',
      },
      {
        label: 'Mean Molecular Speed (v_rms)',
        labelAr: 'متوسط السرعة الجزيئية الجذرية (v_rms)',
        value: state.vRms_m_s.toFixed(0),
        unit: 'm/s',
        formulaUsed: 'v_rms = √(3RT / M)',
        interpretation: 'Speed distribution of gas particles driven by thermal kinetic energy.',
      },
      {
        label: 'Compressibility Factor (Z)',
        labelAr: 'معامل الانضغاطية (Z)',
        value: state.compressibilityZ.toFixed(3),
        expectedValue: '1.000',
        formulaUsed: 'Z = PV / (nRT)',
        interpretation:
          Math.abs(state.compressibilityZ - 1.0) < 0.05
            ? 'Gas exhibits near-ideal thermodynamic behavior under current conditions.'
            : 'Non-ideal gas behavior driven by intermolecular potential forces.',
      },
    ];
  }

  validateParams(params: GasLawParams): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];
    if (params.molesGas <= 0) errors.push('Number of moles must be positive.');
    if (params.initialVolumeL <= 0) errors.push('Volume must be positive.');
    return { isValid: errors.length === 0, errors };
  }
}

export { GasLawSimulationEngine as GasLawLabEngine };

