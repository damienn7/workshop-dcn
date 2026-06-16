export type BikeType = 'mechanical' | 'electric';
export type ConditionState = 'good' | 'medium' | 'replace' | 'critical';

export interface Bike {
  id?: string;
  type: BikeType;
  brand?: string;
  model?: string;
  year?: number;
  declaredCondition?: ConditionState | string;
}
