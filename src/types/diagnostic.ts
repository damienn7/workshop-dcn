import { ConditionState } from './bike';

export interface DiagnosticItem {
  id: string;
  label: string;
  declared?: string;
  seller?: ConditionState | string;
  impact?: number;
}

export interface DiagnosticResult {
  items: DiagnosticItem[];
  repairCosts: number;
}
