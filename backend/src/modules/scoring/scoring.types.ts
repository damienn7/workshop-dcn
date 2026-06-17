export type RepairItem = {
  code: string;
  label: string;
  amount: number;
};

export type PriceBreakdown = {
  baseValue: number;
  repairs: number;
  reconditioningMargin: number;
  riskMargin: number;
  finalOffer: number;
};

export type ScoringResult = {
  customerScore?: number;
  technicianScore: number;
  decision: 'accepted' | 'conditional' | 'refused';
  onlineEstimate?: number;
  finalOffer: number;
  gapPercent: number;
  categoryScores: Record<string, number>;
  blockingReasons: string[];
  repairCosts: RepairItem[];
  priceBreakdown: PriceBreakdown;
  explanations: string[];
};
