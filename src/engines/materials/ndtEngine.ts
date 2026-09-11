// Non-Destructive Testing (NDT) & Evaluation Engine
// Educational physics, equipment models, defect diagnostics, and reference data for VT, PT, MT, UT, RT, ET.

export type NDTMethodType = 'VT' | 'PT' | 'MT' | 'UT' | 'RT' | 'ET';

export interface NDTIndicationExample {
  id: string;
  title: string;
  name?: string;
  defectType: string;
  description?: string;
  visualAppearance: string;
  typicalAppearance?: string;
  probableCause: string;
  rootCause?: string;
  criticality: 'Acceptable / Non-relevant' | 'Marginal / Evaluation Required' | 'Rejectable Crack';
  severityClass?: 'Critical' | 'Major' | 'Minor';
  evaluationGuidance?: string;
}

export interface NDTMethodDetail {
  id: NDTMethodType;
  code?: string;
  shortName: string;
  fullName: string;
  name?: string;
  category: 'Surface' | 'Volumetric' | 'Electromagnetic';
  applicableMaterials: string;
  depthOfInspection: 'Surface only' | 'Surface-breaking only' | 'Surface & shallow subsurface (~3-6 mm)' | 'Surface & shallow subsurface (~1-8 mm)' | 'Full volume';
  physicsPrinciple: string;
  governingFormula: string;
  governingFormulaExplanation: string;
  advantages: string[];
  limitations: string[];
  equipmentConcepts: {
    name: string;
    description: string;
    keyParameter: string;
  }[];
  indicationExamples: NDTIndicationExample[];
  safetyGuidelines: string[];
  referenceCodes: string[];
}

export interface UltrasonicWaveResult {
  material: string;
  densityKgM3: number; // kg/m³
  elasticModulusGPa: number; // GPa
  poissonsRatio: number;
  longitudinalVelocityMS: number; // m/s
  shearVelocityMS: number; // m/s
  acousticImpedanceMRayl: number; // Mrayl (10^6 kg/(m²·s))
}

export interface UltrasonicProbeResult {
  frequencyMHz: number;
  velocityMS: number;
  wavelengthMm: number;
  nearFieldDistanceMm?: number;
  probeDiameterMm?: number;
  halfBeamSpreadDeg?: number;
  beamSpreadAngleDeg?: number;
}

export interface RadiographicExposureResult {
  initialIntensity: number; // R/h or Gy/h
  materialLinearAttenuationCoeffCmInv: number; // µ (1/cm)
  thicknessCm: number;
  transmittedIntensity: number;
  halfValueLayerCm: number; // HVL = ln(2) / µ
  tenthValueLayerCm: number; // TVL = ln(10) / µ
  attenuationPercentage: number;
  geometricUnsharpnessMm: number; // Ug = f * d / D
  unsharpnessAcceptable: boolean;
}

export interface EddyCurrentSkinDepthResult {
  frequencyHz: number;
  conductivityMSPerM: number; // mega-siemens per meter
  relativePermeability: number;
  standardSkinDepthMm: number; // δ = 1 / sqrt(pi * f * µ * σ)
  effectivePenetrationDepthMm: number; // 3 * δ
}

// 6 Core NDT Educational Modules
export const NDT_METHODS: Record<NDTMethodType, NDTMethodDetail> = {
  VT: {
    id: 'VT',
    shortName: 'VT',
    fullName: 'Visual Testing & Optical Inspection',
    category: 'Surface',
    applicableMaterials: 'All solid materials (metals, ceramics, polymers, composites)',
    depthOfInspection: 'Surface only',
    physicsPrinciple: 'Optical radiation reflection, refraction, and photopic vision within 380–780 nm spectrum. Illumination must achieve minimal luminous flux (typically ≥ 1000 lux per ISO 3059 / ASME Sec V Article 9) at viewing angles ≤ 30° from the perpendicular.',
    governingFormula: 'E = (I · cos θ) / d²',
    governingFormulaExplanation: 'Lambert’s Cosine Law: Illuminance E (lux) is directly proportional to luminous intensity I and the cosine of incidence angle θ, inversely proportional to distance d squared.',
    advantages: [
      'Immediate real-time feedback with zero consumables',
      'Fundamental prerequisite before applying any other NDT method',
      'High versatility in detecting broad macro-defects and geometry errors',
    ],
    limitations: [
      'Detects only visible surface-breaking flaws',
      'Highly dependent on inspector visual acuity and ambient lighting',
      'Internal surfaces require optical borescopes or disassembly',
    ],
    equipmentConcepts: [
      {
        name: 'Weld Fillet & Hi-Lo Gauges',
        description: 'Direct measurement of weld throat, leg length, reinforcement height, and plate misalignment.',
        keyParameter: 'Resolution: 0.1 mm, Angle: 45°/90°',
      },
      {
        name: 'Industrial Videoscope / Borescope',
        description: 'Articulated flexible probe with micro-CCD camera and fiber-optic LED illumination for internal pipe inspects.',
        keyParameter: 'Diameter: 4–8 mm, Articulation: 4-way 180°',
      },
      {
        name: 'Calibrated Luxmeter',
        description: 'Photodiode sensor calibrated to photopic eye response curve for validating workplace lighting threshold.',
        keyParameter: 'Min threshold: 1076 lux (100 foot-candles)',
      },
    ],
    indicationExamples: [
      {
        id: 'vt-undercut',
        title: 'Weld Toe Undercut',
        defectType: 'Groove melted into base metal alongside weld toe',
        visualAppearance: 'Sharp dark continuous furrow bordering the weld cap',
        probableCause: 'Excessive welding current, high travel speed, or improper torch angle',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'vt-porosity',
        title: 'Surface Gas Porosity',
        defectType: 'Round smooth cavity open to surface',
        visualAppearance: 'Small spherical dark pinhole cavities clustered or scattered',
        probableCause: 'Moisture in shielding gas, oily base metal, draft blowing gas away',
        criticality: 'Marginal / Evaluation Required',
      },
      {
        id: 'vt-arcstrike',
        title: 'Arc Strike Pit',
        defectType: 'Localized heat affected zone outside weld seam',
        visualAppearance: 'Rough localized crater with associated micro-cracks',
        probableCause: 'Accidental touching of electrode to pipe wall outside joint',
        criticality: 'Rejectable Crack',
      },
    ],
    safetyGuidelines: [
      'Wear certified UV/IR protective eyewear when inspecting live welding or preheated surfaces',
      'Ensure electrical lock-out / tag-out (LOTO) prior to internal machinery borescope entry',
      'Verify confined space atmospheric safety before entry for vessel internal visual checks',
    ],
    referenceCodes: ['ASME Section V Article 9', 'ISO 17637', 'AWS D1.1 Clause 6', 'EN 13018'],
  },

  PT: {
    id: 'PT',
    shortName: 'PT',
    fullName: 'Liquid Penetrant Testing',
    category: 'Surface',
    applicableMaterials: 'Non-porous metals, glazed ceramics, high-density polymers (ferrous & non-ferrous)',
    depthOfInspection: 'Surface-breaking only',
    physicsPrinciple: 'Capillary action driven by adhesive wetting forces between low surface tension liquid and narrow defect walls. Liquid rises into microscopic crevices, followed by capillary reverse extraction into porous developer particles.',
    governingFormula: 'h = (2γ · cos θ) / (ρ · g · r)',
    governingFormulaExplanation: 'Jurin’s Law: Capillary rise height h is proportional to surface tension γ and cosine of contact angle θ, inversely proportional to density ρ, gravity g, and fissure radius r.',
    advantages: [
      'Inexpensive, portable aerosol cans for field inspection',
      'Extremely sensitive to tight microscopic surface fissures (< 0.5 µm width)',
      'Functions equally well on non-magnetic metals (austenitic stainless, titanium, aluminum)',
    ],
    limitations: [
      'Cannot detect subsurface discontinuities',
      'Flaw MUST be clean and open to the surface (grit blasting peens defects shut)',
      'Multiple chemical stages requiring solvent cleaning and drying times',
    ],
    equipmentConcepts: [
      {
        name: 'Fluorescent Penetrant (Type I, Level 4)',
        description: 'High-sensitivity dye solution glowing brilliant green-yellow under UV-A radiation (365 nm).',
        keyParameter: 'Sensitivity Level 1 (Low) to 4 (Ultra-High)',
      },
      {
        name: 'Non-Aqueous Wet Developer (Form d)',
        description: 'White chalky powder suspended in fast-drying solvent; forms contrasting blotting layer.',
        keyParameter: 'Coating thickness: 5–15 µm',
      },
      {
        name: 'UV-A Inspection Lamp',
        description: 'LED blacklight source emitting at 365 nm with zero visible ambient bleed.',
        keyParameter: 'Minimum intensity: 1000 µW/cm² at 38 cm',
      },
    ],
    indicationExamples: [
      {
        id: 'pt-crack',
        title: 'Fatigue Surface Micro-Crack',
        defectType: 'Tight linear mechanical fracture',
        visualAppearance: 'Continuous sharp bright red line (visible) or neon green-yellow under UV-A',
        probableCause: 'Cyclic dynamic fatigue loading in service near stress riser',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'pt-bleedout',
        title: 'Deep Forging Seam / Lap',
        defectType: 'Overlapping forging flash pressed into surface',
        visualAppearance: 'Wide continuous bleed-out spreading laterally over developer powder',
        probableCause: 'Incomplete die closure or excess billet volume during hot forging',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'pt-porosity',
        title: 'Pin-Hole Casting Porosity',
        defectType: 'Individual rounded cavity',
        visualAppearance: 'Discrete circular spot with localized halo',
        probableCause: 'Entrapped gas bubble trapped during mold filling',
        criticality: 'Marginal / Evaluation Required',
      },
    ],
    safetyGuidelines: [
      'Operate in well-ventilated chambers or utilize organic vapor respirators against volatile solvent fumes',
      'Penetrant cleaners are flammable aerosols — strictly prohibit open flames and hot work nearby',
      'Always wear UV-blocking safety glasses during fluorescent blacklight examination',
    ],
    referenceCodes: ['ASME Section V Article 6', 'ASTM E165', 'ISO 3452-1', 'AMS 2644'],
  },

  MT: {
    id: 'MT',
    shortName: 'MT',
    fullName: 'Magnetic Particle Testing',
    category: 'Surface',
    applicableMaterials: 'Ferromagnetic materials only (carbon steels, ferritic alloys, cast irons, nickel)',
    depthOfInspection: 'Surface & shallow subsurface (~3-6 mm)',
    physicsPrinciple: 'Magnetic flux leakage. When a ferromagnetic specimen is magnetized, internal magnetic flux lines bend around low-permeability discontinuities. If near the surface, flux leaks into air, creating north and south poles that attract fine ferromagnetic particles.',
    governingFormula: 'B = µ · H = µ₀ · µᵣ · H',
    governingFormulaExplanation: 'Constitutive Magnetic Law: Magnetic flux density B (Tesla) equals magnetic permeability µ times applied field intensity H (A/m).',
    advantages: [
      'Faster than liquid penetrant testing with less demanding pre-cleaning',
      'Detects shallow subsurface discontinuities that are not open to the surface',
      'AC electromagnet fields provide skin-effect concentration for tight surface cracks',
    ],
    limitations: [
      'Strictly non-applicable to non-magnetic materials (300-series stainless, aluminum, brass)',
      'Requires demagnetization after testing to prevent machining chip adherence',
      'Magnetic field must intersect defect orientation at ~45° to 90° for detection',
    ],
    equipmentConcepts: [
      {
        name: 'Articulated Leg AC/DC Yoke',
        description: 'Portable handheld electromagnetic yoke with adjustable pole legs for local plate magnetization.',
        keyParameter: 'Lifting power: 4.5 kg (10 lbs) AC, 18 kg (40 lbs) DC',
      },
      {
        name: 'Fluorescent Wet Magnetic Bath',
        description: 'Sub-micron iron oxide particles coated with fluorescent pigment suspended in refined kerosene carrier.',
        keyParameter: 'Particle concentration: 0.1–0.4 mL / 100 mL centrifuge tube',
      },
      {
        name: 'Pie Gauge / Castrol Strip',
        description: 'Octagonal pie-shaped brazed copper/iron flux indicator for verifying magnetic field direction.',
        keyParameter: '8 magnetic pie segments with copper backing',
      },
    ],
    indicationExamples: [
      {
        id: 'mt-quench-crack',
        title: 'Thermal Quench Crack',
        defectType: 'Intergranular brittle fracture',
        visualAppearance: 'Sharp, jagged, heavily clustered magnetic particle ridge',
        probableCause: 'Excessive cooling rate during martensitic hardening quench',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'mt-toe-crack',
        title: 'Weld Toe Stress-Relief Crack',
        defectType: 'Cracking along fusion boundary',
        visualAppearance: 'Continuous fuzzy linear bead of particles adhering to weld boundary',
        probableCause: 'Hydrogen embrittlement combined with residual welding stress',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'mt-subsurface-slag',
        title: 'Subsurface Slag Stringer',
        defectType: 'Non-metallic inclusion within 2 mm of surface',
        visualAppearance: 'Broad, diffuse, weakly held accumulation of particles (DC yoke)',
        probableCause: 'Trapped flux inclusion from shielded metal arc welding pass',
        criticality: 'Marginal / Evaluation Required',
      },
    ],
    safetyGuidelines: [
      'Individuals with cardiac pacemakers or medical electronic implants must maintain clearance from strong magnetic fields',
      'Avoid arcing during prod contact magnetization to prevent fires in combustible atmospheres',
      'Use high-flashpoint odorless petroleum carriers to mitigate combustible vapor risks',
    ],
    referenceCodes: ['ASME Section V Article 7', 'ASTM E1444', 'ISO 9934-1', 'EN ISO 17638'],
  },

  UT: {
    id: 'UT',
    shortName: 'UT',
    fullName: 'Ultrasonic Testing',
    category: 'Volumetric',
    applicableMaterials: 'Most structural metals, plastics, aerospace composites, ceramics',
    depthOfInspection: 'Full volume',
    physicsPrinciple: 'Piezoelectric high-frequency mechanical sound waves (0.5–25 MHz). Acoustic beam propagates through specimen until acoustic impedance boundaries (Z = ρ·v) reflect energy back to receiver, yielding time-of-flight depth and amplitude.',
    governingFormula: 'v = λ · f  |  d = (v · t) / 2',
    governingFormulaExplanation: 'Acoustic Time-of-Flight: Distance d equals wave velocity v multiplied by transit time t divided by 2 (pulse-echo path).',
    advantages: [
      'High penetrating capability across deep steel sections (up to several meters)',
      'Extremely accurate flaw sizing, planar depth positioning, and wall thickness measurement',
      'Zero radiation hazard, portable battery-operated field instruments',
    ],
    limitations: [
      'Requires acoustic coupling gel/oil between probe and rough specimen surface',
      'Demands extensive operator skill for signal interpretation and calibration',
      'Coarse-grained metals (austenitic weldments, cast iron) scatter and attenuate beam',
    ],
    equipmentConcepts: [
      {
        name: 'Digital Flaw Detector (A-Scan / Phased Array)',
        description: 'Microprocessor pulser-receiver capturing RF waveforms and displaying amplitude vs time.',
        keyParameter: 'Bandwidth: 0.5–20 MHz, PRF: up to 5 kHz',
      },
      {
        name: 'Shear-Wave Angle Wedge (45°, 60°, 70°)',
        description: 'Lucite wedge inducing mode-converted transverse shear waves for weld bevel flaw sizing.',
        keyParameter: 'Refracted beam angle in steel: 45°, 60°, or 70°',
      },
      {
        name: 'Calibration Block (IIW Type 1 / V1)',
        description: 'Precision machined steel reference standard with 100 mm radius and 1.5 mm side-drilled hole.',
        keyParameter: 'Velocity reference, time-base calibration, index point check',
      },
    ],
    indicationExamples: [
      {
        id: 'ut-lack-fusion',
        title: 'Lack of Side-Wall Fusion',
        defectType: 'Planar weld interface discontinuity',
        visualAppearance: 'A-Scan: Sharp high-amplitude echo at predicted bevel sound path distance',
        probableCause: 'Insufficient heat input, misaligned welding torch, or heavy oxide film',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'ut-lamination',
        title: 'Plate Core Lamination',
        defectType: 'Mid-thickness rolling separation parallel to surface',
        visualAppearance: 'Total loss of backwall echo accompanied by intermediate mid-depth signal',
        probableCause: 'Primary ingot pipe or flattened macro-inclusion during plate rolling',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'ut-wall-thinning',
        title: 'Internal Flow-Accelerated Corrosion',
        defectType: 'Volumetric wall loss on pipe ID',
        visualAppearance: 'Backwall echo shifts leftward to shorter transit times indicating reduced thickness',
        probableCause: 'Erosive cavitation or chemical oxidation of internal pipe wall',
        criticality: 'Marginal / Evaluation Required',
      },
    ],
    safetyGuidelines: [
      'Clean slippery couplant gels from scaffolding and ladder rungs immediately after scanning',
      'Exercise caution when inspecting hot lines (> 60°C); use specialized delay lines and thermal couplants',
      'Inspect transducer cables for fraying to prevent high-voltage spike shocks from pulser (up to 400 V)',
    ],
    referenceCodes: ['ASME Section V Article 4 & 5', 'ASTM E114 / E164', 'ISO 16810', 'EN 12668-1'],
  },

  RT: {
    id: 'RT',
    shortName: 'RT',
    fullName: 'Radiographic Testing',
    category: 'Volumetric',
    applicableMaterials: 'All engineering materials (steel, copper, aluminum, composites, polymers)',
    depthOfInspection: 'Full volume',
    physicsPrinciple: 'Differential absorption of penetrating high-energy electromagnetic ionizing radiation (X-rays or Gamma rays). Thicker or denser regions attenuate more photons; internal voids allow more radiation to reach film or digital detector array, producing darker density.',
    governingFormula: 'I = I₀ · e^(-µ · x)  |  HVL = ln(2) / µ',
    governingFormulaExplanation: 'Beer-Lambert Radiographic Attenuation: Transmitted intensity I diminishes exponentially with linear attenuation coefficient µ and specimen thickness x.',
    advantages: [
      'Provides a permanent visual radiograph record of the entire internal volume',
      'Excellent for volumetric flaws (gas porosity, slag pockets, voids, pipe shrinkage)',
      'Applicable to complex geometries and insulated piping without insulation stripping (profile RT)',
    ],
    limitations: [
      'Significant ionizing radiation safety hazards requiring restricted perimeter boundaries',
      'Orientation-dependent: tight cracks must align within ~5° of radiation beam axis',
      'High capital equipment costs and film processing / digital sensor handling',
    ],
    equipmentConcepts: [
      {
        name: 'Gamma Ray Projector (Iridium-192)',
        description: 'Depleted-uranium shielded camera deploying sealed radioactive isotope via control crank.',
        keyParameter: 'Half-life: 73.8 days; Photon energy: 0.31–0.47 MeV',
      },
      {
        name: 'Constant Potential X-Ray Generator',
        description: 'Tungsten-target vacuum tube with adjustable high-voltage cathode accelerating electrons.',
        keyParameter: 'Voltage range: 160–320 kV; Focal spot: 0.4–1.5 mm',
      },
      {
        name: 'Image Quality Indicator (IQI / Penetrameter)',
        description: 'Wire-type (ASTM / ISO) or hole-type plaque placed on source side to verify radiographic sensitivity.',
        keyParameter: 'Required sensitivity: 2-2T or wire #10 per thickness',
      },
    ],
    indicationExamples: [
      {
        id: 'rt-incomplete-penetration',
        title: 'Incomplete Joint Penetration',
        defectType: 'Root pass root face unfused',
        visualAppearance: 'Dark, sharply defined, straight continuous line along the center of the weld root',
        probableCause: 'Root gap too narrow, root face too thick, or insufficient welding travel heat',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'rt-tungsten-inclusion',
        title: 'Tungsten Electrode Inclusion',
        defectType: 'High-density foreign metal entrapment in GTAW',
        visualAppearance: 'Distinctive bright white spot (tungsten attenuates more radiation than iron)',
        probableCause: 'Accidental dipping of tungsten electrode into weld molten puddle',
        criticality: 'Marginal / Evaluation Required',
      },
      {
        id: 'rt-cluster-porosity',
        title: 'Clustered Volumetric Porosity',
        defectType: 'Grouped spherical gas bubbles',
        visualAppearance: 'Dark circular rounded shadows grouped in the middle weld passes',
        probableCause: 'Loss of shielding gas coverage during multi-pass welding',
        criticality: 'Marginal / Evaluation Required',
      },
    ],
    safetyGuidelines: [
      'Strict adherence to ALARA (As Low As Reasonably Achievable): Time, Distance, and Shielding',
      'Calibrated survey meter and personal dosimeters (TLD, OSL, EPD) are mandatory before opening source',
      'Establish barrier tape perimeter where radiation dose exceeds 20 µSv/h (2 mR/h)',
    ],
    referenceCodes: ['ASME Section V Article 2', 'ASTM E94 / E1032', 'ISO 5579', 'EN 1435'],
  },

  ET: {
    id: 'ET',
    shortName: 'ET',
    fullName: 'Eddy Current Testing',
    category: 'Electromagnetic',
    applicableMaterials: 'Electrically conductive materials only (aluminum, titanium, copper, austenitic steels)',
    depthOfInspection: 'Surface & shallow subsurface (~1-8 mm)',
    physicsPrinciple: 'Electromagnetic induction (Faraday’s Law & Lenz’s Law). An alternating current passing through an inspection coil generates an alternating primary magnetic field. When placed near a conductor, circular eddy currents are induced, generating an opposing secondary magnetic field that alters probe impedance.',
    governingFormula: 'δ = 1 / √(π · f · µ · σ) = 50.3 · √(ρ / (f · µᵣ))',
    governingFormulaExplanation: 'Standard Depth of Penetration δ (mm): Eddy current density drops to 37% (1/e) of surface value; inversely proportional to square root of frequency f, permeability µ, and conductivity σ.',
    advantages: [
      'Zero consumables, instantaneous response with no couplant required',
      'Can inspect through non-conductive paint, anodizing, and epoxy coatings without stripping',
      'Capable of multi-frequency heat exchanger tube wall loss and pit depth sizing',
    ],
    limitations: [
      'Limited to electrically conductive materials',
      'Strong skin effect restricts deep volumetric evaluation in high-conductivity metals',
      'Sensitive to lift-off distance variations between probe and surface',
    ],
    equipmentConcepts: [
      {
        name: 'Impedance Plane Display Flaw Detector',
        description: 'Multi-frequency instrument displaying resistance (R) vs inductive reactance (XL) vectors.',
        keyParameter: 'Frequency range: 10 Hz – 10 MHz; Dual frequency mixing',
      },
      {
        name: 'Differential Bobbin Tubing Probe',
        description: 'Dual-coil cylindrical probe propelled through heat exchanger and condenser tubes.',
        keyParameter: 'Standard OD: 12–25 mm for condenser tubing',
      },
      {
        name: 'Conductivity Meter Probe',
        description: 'Specialized 60 kHz surface probe calibrated in % IACS (International Annealed Copper Standard).',
        keyParameter: 'Accuracy: ±0.5% IACS; Heat treat / alloy verification',
      },
    ],
    indicationExamples: [
      {
        id: 'et-fatigue-rivet',
        title: 'Aircraft Rivet Hole Fatigue Crack',
        defectType: 'Radial micro-crack propagating from fastener bore',
        visualAppearance: 'Impedance Screen: Sharp phase vector trajectory along calibrated flaw angle',
        probableCause: 'Aerodynamic pressure cycles and cabin pressurization stress concentrations',
        criticality: 'Rejectable Crack',
      },
      {
        id: 'et-finned-tube-fretting',
        title: 'Baffle Plate Tube Fretting Wear',
        defectType: 'External mechanical wall loss in heat exchanger',
        visualAppearance: 'Impedance Lissajous loop rotating through specific phase angle corresponding to 40% wall loss',
        probableCause: 'Flow-induced tube vibration rubbing against support baffle plates',
        criticality: 'Marginal / Evaluation Required',
      },
      {
        id: 'et-alloy-sorting',
        title: 'Heat Treatment / Alloy Mix-Up',
        defectType: 'Incorrect hardness / precipitate state',
        visualAppearance: 'Baseline conductivity shift (e.g., 7075-T6 at 33% IACS vs 7075-O at 45% IACS)',
        probableCause: 'Improper solutionizing or artificial aging furnace thermal cycle',
        criticality: 'Marginal / Evaluation Required',
      },
    ],
    safetyGuidelines: [
      'Non-hazardous operation with no ionizing radiation or chemical consumables',
      'Secure high-speed motorized probe pullers used in boiler tube inspections to prevent snag injuries',
      'Avoid placing magnetically sensitive cards or watches directly against high-power encircling coils',
    ],
    referenceCodes: ['ASME Section V Article 8', 'ASTM E243 / E309', 'ISO 15549', 'EN 1711'],
  },
};

/**
 * Calculates longitudinal & shear ultrasonic velocities and acoustic impedance
 */
export function calculateUltrasonicVelocities(
  elasticModulusGPa: number,
  densityGramsPerCm3: number,
  poissonsRatio = 0.3,
  material = 'Engineered Alloy'
): UltrasonicWaveResult {
  const E_Pa = elasticModulusGPa * 1e9;
  const rho_KgM3 = densityGramsPerCm3 * 1000;

  if (rho_KgM3 <= 0 || E_Pa <= 0 || poissonsRatio >= 0.5) {
    return {
      material,
      densityKgM3: rho_KgM3,
      elasticModulusGPa,
      poissonsRatio,
      longitudinalVelocityMS: 0,
      shearVelocityMS: 0,
      acousticImpedanceMRayl: 0,
    };
  }

  const nu = poissonsRatio;
  const factorL = (1 - nu) / ((1 + nu) * (1 - 2 * nu));
  const v_L = Math.sqrt((E_Pa / rho_KgM3) * factorL);

  const G_Pa = E_Pa / (2 * (1 + nu));
  const v_S = Math.sqrt(G_Pa / rho_KgM3);

  const Z_MRayl = (rho_KgM3 * v_L) / 1e6;

  return {
    material,
    densityKgM3: rho_KgM3,
    elasticModulusGPa,
    poissonsRatio,
    longitudinalVelocityMS: Math.round(v_L),
    shearVelocityMS: Math.round(v_S),
    acousticImpedanceMRayl: Number(Z_MRayl.toFixed(2)),
  };
}

/**
 * Calculates ultrasonic wavelength, near-field distance, and beam spread
 */
export function calculateUltrasonicWavelength(
  velocityMS: number,
  frequencyMHz: number,
  probeDiameterMm?: number
): UltrasonicProbeResult {
  const f_Hz = frequencyMHz * 1e6;
  const lambda_M = f_Hz > 0 ? velocityMS / f_Hz : 0;
  const wavelengthMm = Number((lambda_M * 1000).toFixed(3));

  let nearFieldDistanceMm: number | undefined;
  let halfBeamSpreadDeg: number | undefined;

  if (probeDiameterMm && probeDiameterMm > 0 && wavelengthMm > 0) {
    // N = D^2 / (4 * lambda)
    nearFieldDistanceMm = Number(((probeDiameterMm * probeDiameterMm) / (4 * wavelengthMm)).toFixed(1));
    // sin(gamma) = 1.22 * lambda / D
    const sinSpread = (1.22 * wavelengthMm) / probeDiameterMm;
    if (sinSpread <= 1.0) {
      halfBeamSpreadDeg = Number(((Math.asin(sinSpread) * 180) / Math.PI).toFixed(1));
    }
  }

  return {
    frequencyMHz,
    velocityMS,
    wavelengthMm,
    nearFieldDistanceMm,
    probeDiameterMm,
    halfBeamSpreadDeg,
    beamSpreadAngleDeg: halfBeamSpreadDeg !== undefined ? halfBeamSpreadDeg * 2 : undefined,
  };
}

/**
 * Calculates radiographic attenuation, half-value layer (HVL), and geometric unsharpness
 */
export function calculateRadiographicExposure(
  initialIntensity: number,
  linearAttenuationCoeffCmInv: number,
  thicknessCm: number,
  focalSpotSizeMm = 2.0,
  sourceToFilmDistanceCm = 70,
  objectToFilmDistanceCm = 2.5
): RadiographicExposureResult {
  const transmitted = initialIntensity * Math.exp(-linearAttenuationCoeffCmInv * thicknessCm);
  const hvl = linearAttenuationCoeffCmInv > 0 ? Math.LN2 / linearAttenuationCoeffCmInv : 0;
  const tvl = linearAttenuationCoeffCmInv > 0 ? Math.log(10) / linearAttenuationCoeffCmInv : 0;
  const attenuationPercentage = initialIntensity > 0 ? Math.max(0, Math.min(100, ((initialIntensity - transmitted) / initialIntensity) * 100)) : 0;

  // Geometric unsharpness Ug = f * d / D
  // where f = focal spot, d = object-to-film, D = source-to-object
  const sourceToObjectCm = Math.max(0.1, sourceToFilmDistanceCm - objectToFilmDistanceCm);
  const ug = (focalSpotSizeMm * objectToFilmDistanceCm) / sourceToObjectCm;
  const unsharpnessAcceptable = ug <= 0.5;

  return {
    initialIntensity,
    materialLinearAttenuationCoeffCmInv: linearAttenuationCoeffCmInv,
    thicknessCm,
    transmittedIntensity: Number(transmitted.toFixed(4)),
    halfValueLayerCm: Number(hvl.toFixed(3)),
    tenthValueLayerCm: Number(tvl.toFixed(3)),
    attenuationPercentage: Number(attenuationPercentage.toFixed(2)),
    geometricUnsharpnessMm: Number(ug.toFixed(3)),
    unsharpnessAcceptable,
  };
}

/**
 * Calculates eddy current standard skin depth of penetration (δ)
 * delta = 1 / sqrt(pi * f * mu * sigma)
 */
export function calculateEddyCurrentSkinDepth(
  frequencyHz: number,
  conductivityMSPerM: number,
  relativePermeability = 1.0
): EddyCurrentSkinDepthResult {
  const mu0 = 4 * Math.PI * 1e-7; // H/m
  const mu = mu0 * relativePermeability;
  const sigma = conductivityMSPerM * 1e6; // S/m

  if (frequencyHz <= 0 || sigma <= 0 || mu <= 0) {
    return {
      frequencyHz,
      conductivityMSPerM,
      relativePermeability,
      standardSkinDepthMm: 0,
      effectivePenetrationDepthMm: 0,
    };
  }

  const delta_M = 1 / Math.sqrt(Math.PI * frequencyHz * mu * sigma);
  const delta_Mm = delta_M * 1000;

  return {
    frequencyHz,
    conductivityMSPerM,
    relativePermeability,
    standardSkinDepthMm: Number(delta_Mm.toFixed(3)),
    effectivePenetrationDepthMm: Number((delta_Mm * 3).toFixed(3)), // 3 delta encompasses ~95% of eddy currents
  };
}
