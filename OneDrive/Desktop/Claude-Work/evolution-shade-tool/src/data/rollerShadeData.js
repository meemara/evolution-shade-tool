// Roller Shade Configuration Data - extracted from Lutron MyProjects
// Last updated: 2026-04-23

export const FABRIC_FAMILIES = [
  "Aura - 3%", "Aura - 5%",
  "Basketweave - 1%",
  "Basketweave 27 - 1%", "Basketweave 27 - 10%", "Basketweave 27 - 3%", "Basketweave 27 - 5%",
  "Basketweave 4000 Eco - 10%", "Basketweave 4000 Eco - 3%", "Basketweave 4000 Eco - 5%",
  "Basketweave 90 - 1%", "Basketweave 90 - 10%", "Basketweave 90 - 3%", "Basketweave 90 - 5%",
  "Basketweave 90 C - 1%", "Basketweave 90 C - 3%", "Basketweave 90 C - 5%",
  "Basketweave Eco2 - 1%", "Basketweave Eco2 - 3%", "Basketweave Eco2 - 5%",
  "Bouclé Blackout - 0%",
  "E Screen - 1%", "E Screen - 10%", "E Screen - 3%", "E Screen - 5%",
  "E Screen with KOOLBLACK™ - 1%", "E Screen with KOOLBLACK™ - 3%", "E Screen with KOOLBLACK™ - 5%",
  "Element - 0%", "Element Facade - 0%",
  "GreenScreen® Evolve™ - 3%",
  "Harbor BO - 0%", "Highland BO - 0%", "Hue - 0%",
  "Jacquard - 10%", "Jacquard - 5%", "Jacquard - 7%",
  "Luna Blackout - 0%", "Luna Blackout FR - 0%",
  "M Screen - 1%", "M Screen - 3%", "M Screen - 5%",
  "Matrice Blackout - 0%", "Mirage BO - 0%", "Mosaic Blackout - 0%",
  "Palette Blackout - 0%", "Pochoir Blackout - 0%",
  "Premiere - 0%",
  "Roseau Blackout - 0%", "Satine Blackout - 0%",
  "SheerLite - 3%", "SheerLite - 5%",
  "Sheerweave 4900 - 1%", "Sheerweave 4900 - 3%",
  "Standard - 0%", "Stratus BO - 0%", "Stria Blackout - 0%",
  "T Screen - 1%", "T Screen - 3%",
  "T Screen with KOOLBLACK™ - 1%", "T Screen with KOOLBLACK™ - 3%", "T Screen with KOOLBLACK™ - 5%",
  "Verso - 0%"
];

export const OPERATORS = [
  { value: "Roller 20", label: "Roller 20", maxSqFt: 20 },
  { value: "Roller 64", label: "Roller 64", maxSqFt: 64 },
  { value: "Roller 100", label: "Roller 100", maxSqFt: 100 },
  { value: "Roller 150", label: "Roller 150", maxSqFt: 150 },
  { value: "Roller 225", label: "Roller 225", maxSqFt: 225 },
  { value: "Roller 300", label: "Roller 300", maxSqFt: 300 },
  { value: "Clerestory", label: "Clerestory", maxSqFt: null },
];

export const TECHNOLOGIES = [
  "Manual",
  "Sivoia QS Triathlon",
  "Sivoia QS Wired",
  "Sivoia QS Wireless",
  "Sivoia QS Palladiom",
  "Sivoia QS Palladiom Wire-Free",
];

export const MOUNTINGS = ["TBD", "Inside", "Outside"];

export const BRACKETS = ["Ceiling Brackets", "Wall Brackets", "Jamb Brackets"];

export const HEMBARS = [
  "Pick Automatically",
  "Designer Bottom Bar",
  '3/16 in x 1 in Sealed',
  '7/16 in x 1-3/8 in Sealed',
  "Half-Wrap Architectural Bottom Bar",
  "Exposed Architectural Bottom Bar",
  "1 in Exposed",
  "Cable Guided Exposed Architectural Bottom Bar",
  "Cable Guided Exposed Oval Bottom Bar",
  "Cable Guided Half-Wrap Architectural Bottom Bar",
  "Cable Guided Half-Wrap Oval Bottom Bar",
];

export const HEMBAR_COLORS = [
  "Pick Automatically", "None", "Lutron Recommended",
  "Biscuit", "Black", "Bronze", "Clear Anodized",
  "Silver", "Slate Grey", "Taupe", "White", "Custom"
];

export const OPERATOR_SIDES = ["TBD", "Right", "Left"];

export const FABRIC_FACES = [
  "Fabric Face Away From Glass (Standard)",
  "Fabric Face Towards Glass"
];

export const FABRIC_DROPS = ["Regular", "Reverse"];

export const YES_NO_AUTO = ["Pick Automatically", "No", "Yes"];
export const YES_NO = ["No", "Yes"];

export const LIGHT_GAPS = ["Minimum", "Custom"];
export const WIDTH_TYPES = ["Bracket-to-Bracket", "Fabric Width"];
export const TUBES = ["Pick Automatically", "2.5 in", "3 in"];

export const SIDE_CHANNELS = ["None", "2.5 x 1 in Side Channel"];
export const SILL_ANGLES = ["None", "1.5 x 1 in Sill Angle"];

// Constraint rules based on operator size
export const CONSTRAINTS = {
  topTreatments: {
    "Roller 20": {
      available: ["None", "Fascia", "Fascia with Top Back Cover", "Top Back Cover", "Pocket"],
      fasciaSize: '2.75"',
      pocketSize: '3.5" x 3.5" with 2" Flap',
      dualPocket: '6" x 9" with 3" Flap',
    },
    "Roller 64": {
      available: ["None", "Fascia", "Fascia with Top Back Cover", "Top Back Cover", "Pocket"],
      fasciaSize: '3.5"',
      pocketSizes: ['3.5" x 3.5" with 2" Flap', '4" x 4" with 2" Flap'],
      dualPocket: '6" x 9" with 3" Flap',
    },
    "Roller 100": {
      available: ["None", "Fascia", "Fascia with Top Back Cover", "Top Back Cover", "Pocket"],
      fasciaSize: '4"',
      pocketSizes: ['4.75" x 5" with 3" Flap', '7" x 7" with 5" Flap'],
      dualPocket: '7" x 11" with 3" Flap',
    },
    "Roller 150": {
      available: ["None", "Fascia", "Fascia with Top Back Cover", "Top Back Cover", "Pocket"],
      fasciaSize: '4"',
      pocketSizes: ['4.75" x 5" with 3" Flap', '7" x 7" with 5" Flap'],
      dualPocket: '7" x 11" with 3" Flap',
    },
    "Roller 225": {
      available: ["None", "Pocket"],
      pocketSizes: ['7" x 7" with 5" Flap'],
      dualPocket: '8" x 14" with 3" Flap',
    },
    "Roller 300": {
      available: ["None", "Fascia", "Fascia with Top Back Cover", "Top Back Cover", "Pocket"],
      fasciaSize: '4"',
      pocketSizes: ['4.75" x 5" with 3" Flap', '7" x 7" with 5" Flap'],
      dualPocket: '7" x 11" with 3" Flap',
    },
    "Clerestory": {
      available: ["None"],
    },
  },
  cableGuidedHembar: {
    "Roller 20": true,
    "Roller 64": true,
    "Roller 100": true,
    "Roller 150": true,
    "Roller 225": false,
    "Roller 300": false,
    "Clerestory": false,
  },
  coupling: {
    "Roller 20": false,
    "Roller 64": false,
    "Roller 100": true,
    "Roller 150": true,
    "Roller 225": false,
    "Roller 300": true,
    "Clerestory": false,
  },
};

// Get recommended operator based on square footage
export function getRecommendedOperator(sqFt) {
  if (sqFt <= 0) return null;
  const sorted = OPERATORS.filter(o => o.maxSqFt !== null).sort((a, b) => a.maxSqFt - b.maxSqFt);
  for (const op of sorted) {
    if (sqFt <= op.maxSqFt) return op.value;
  }
  return "Roller 300"; // largest available
}

// Get available hembars based on operator
export function getAvailableHembars(operator) {
  const cableGuided = CONSTRAINTS.cableGuidedHembar[operator];
  if (cableGuided) return HEMBARS;
  return HEMBARS.filter(h => !h.toLowerCase().includes("cable guided"));
}

// Get available top treatments based on operator
export function getAvailableTopTreatments(operator) {
  const constraint = CONSTRAINTS.topTreatments[operator];
  if (!constraint) return ["None"];
  return constraint.available;
}

// Calculate square footage from width and height (in inches)
export function calculateSqFt(widthInches, heightInches) {
  if (!widthInches || !heightInches) return 0;
  return (widthInches * heightInches) / 144;
}

// Create a blank shade with defaults
export function createBlankShade(index) {
  return {
    id: Date.now() + Math.random(),
    name: `Roller Shade ${index}`,
    qty: 1,
    width: '',
    height: '',
    mounting: 'TBD',
    fabric: '',
    topTreatment: 'None',
    technology: 'Sivoia QS Wired',
    operator: 'Roller 100',
    operatorSide: 'TBD',
    bracket: 'Ceiling Brackets',
    hembar: 'Pick Automatically',
    hembarColor: 'Pick Automatically',
    customHembarColor: '',
    angle: '',
    reduceSag: 'No',
    fabricFace: 'Fabric Face Away From Glass (Standard)',
    fabricDrop: 'Regular',
    railroading: 'Pick Automatically',
    customSeams: 'No',
    battens: 'Pick Automatically',
    sideChannel: 'None',
    sillAngle: 'None',
    lightGaps: 'Minimum',
    widthType: 'Bracket-to-Bracket',
    tube: 'Pick Automatically',
    tubeFabricReplacement: 'No',
  };
}
