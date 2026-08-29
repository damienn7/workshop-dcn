export type BuybackCaseStatus =
  | 'pending'
  | 'diagnosis_in_progress'
  | 'accepted'
  | 'conditional'
  | 'refused'
  | 'completed';

export type CaseListItem = {
  id: string;
  caseNumber: string;
  status: BuybackCaseStatus;
  customerName: string;
  itemLabel: string;
  customerScore?: number | null;
  onlineEstimate?: number | null;
  finalOffer?: number | null;
};

export type Customer = {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
};

export type BuybackCase = {
  id: string;
  caseNumber: string;
  status: BuybackCaseStatus;
  customer: Customer;
  item: {
    articleType: string;
    category?: string;
    brand?: string;
    model?: string;
    year?: number;
    frameSize?: string;
    serialNumber?: string;
    declaredKm?: number;
    estimatedBasePrice?: number;
  };
  preDiagnostic?: {
    generalState?: string;
    frame?: string;
    brakes?: string;
    transmission?: string;
    wheels?: string;
    photos?: string[];
  };
  customerScore?: number | null;
  onlineEstimate?: number | null;
  refusalReasons?: string[];
  refusalAlternatives?: string[];
  finalOffer?: number | null;
  diagnosis?: unknown;
  scoring?: ScoreResult;
};

export type RepairCostItem = {
  code: string;
  label: string;
  amount: number;
};

export type ScoreResult = {
  customerScore?: number | null;
  technicianScore: number;
  decision: 'accepted' | 'conditional' | 'refused';
  onlineEstimate?: number | null;
  finalOffer: number;
  gapPercent: number;
  categoryScores: {
    frameFork: number;
    brakes: number;
    transmission: number;
    wheelsTires: number;
    finishing: number;
  };
  blockingReasons: string[];
  repairCosts: RepairCostItem[];
  priceBreakdown: {
    baseValue: number;
    repairs: number;
    reconditioningMargin: number;
    riskMargin: number;
    finalOffer: number;
  };
  explanations: string[];
};
