import { scoringConfig } from '../../data/scoring.config';

export function getBuybackBaseValue(estimatedBasePrice: number, score: number): number {
  let coefficient = 0;

  if (score >= 85) coefficient = 0.7;
  else if (score >= 75) coefficient = 0.65;
  else if (score >= 60) coefficient = 0.6;
  else if (score >= 50) coefficient = 0.55;
  else coefficient = 0;

  return Math.round(estimatedBasePrice * coefficient);
}

export const VALUE_MAP: Record<string, number> = {
  excellent: 100,
  good: 75,
  medium: 50,
  bad: 25,
  out_of_service: 0,
  no_shock: 100,
  shock: 0,
  no_issue: 100,
  small_difficulty: 60,
  normal_wear: 75,
  functional: 90,
  replace: 25,
  correct: 80,
  dry: 60,
  good_wear: 75,
  clean: 85,
  cleaning_needed: 50,
  dangerous: 0
};

export function mapValueToScore(v?: string | number): number {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  const key = String(v);
  const normalized = key.toLowerCase();
  if (VALUE_MAP[normalized] !== undefined) return VALUE_MAP[normalized];
  // Try to parse known words
  if (normalized.includes('good')) return 75;
  if (normalized.includes('excellent')) return 100;
  if (normalized.includes('medium')) return 50;
  if (normalized.includes('bad')) return 25;
  if (normalized.includes('out')) return 0;
  if (normalized.includes('no')) return 100;
  return 50;
}
