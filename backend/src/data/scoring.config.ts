export const scoringConfig = {
  decisionThresholds: {
    accepted: 75,
    conditional: 50
  },
  categories: {
    frameFork: { label: 'Cadre & fourche', weight: 30 },
    brakes: { label: 'Freins', weight: 25 },
    transmission: { label: 'Transmission', weight: 25 },
    wheelsTires: { label: 'Roues & pneus', weight: 10 },
    finishing: { label: 'Finitions', weight: 10 }
  },
  repairCosts: {
    brakePads: 12,
    cleaning: 8,
    derailleurAdjustment: 10,
    tireReplacement: 20,
    wheelTruing: 15,
    chainReplacement: 18,
    saddleReplacement: 15,
    directionRepair: 25
  },
  margins: {
    reconditioning: 7,
    defaultRisk: 0
  }
} as const;
