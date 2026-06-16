export type Decision = 'accepted' | 'conditional' | 'refused_safety' | 'refused_economic';

export function sampleResult() {
  const base = 120;
  const repairCosts = 30;
  const cleaningCosts = 5;
  const ageCoefficient = 0.9; // example
  const conditionCoefficient = 0.9;
  const finalOffer = Math.max(0, Math.round(base * ageCoefficient * conditionCoefficient - repairCosts - cleaningCosts));
  const score = Math.max(0, Math.min(100, Math.round(100 * (finalOffer / base))));
  let decision: Decision = 'conditional';
  if (score >= 75) decision = 'accepted';
  else if (score < 50) decision = 'refused_economic';

  return { base, finalOffer, repairCosts, cleaningCosts, score, decision, reasons: ['Usure normale', 'Frais réparation modérés'] };
}

export function sampleComparison() {
  return [
    { element: 'Pneus', client: 'good', seller: 'medium', impact: 10 },
    { element: 'Transmission', client: 'good', seller: 'replace', impact: 40 }
  ];
}

export function calculateOffer({ baseMarketValue, year, condition, repairCosts, cleaningCosts, hasCriticalFrame, hasCriticalFork, batteryDangerous }:
  { baseMarketValue: number; year?: number; condition?: string; repairCosts?: number; cleaningCosts?: number; hasCriticalFrame?: boolean; hasCriticalFork?: boolean; batteryDangerous?: boolean }) {
  const now = new Date().getFullYear();
  const age = year ? Math.max(0, now - year) : 0;
  const ageCoefficient = Math.max(0.4, 1 - age * 0.05);
  const conditionMap: Record<string, number> = { good: 1, medium: 0.9, replace: 0.7, critical: 0.4 };
  const conditionCoefficient = condition ? (conditionMap[condition] ?? 0.8) : 0.8;

  const base = baseMarketValue;
  const repair = repairCosts || 0;
  const cleaning = cleaningCosts || 0;

  // Decision rules
  if (hasCriticalFrame || hasCriticalFork || batteryDangerous) {
    return {
      base,
      finalOffer: 0,
      repairCosts: repair,
      cleaningCosts: cleaning,
      score: 0,
      decision: 'refused_safety' as Decision,
      reasons: ['Critère de sécurité détecté']
    };
  }

  // Use segment weights to compute a score proxy
  const finalOffer = Math.max(0, Math.round(base * ageCoefficient * conditionCoefficient - repair - cleaning));
  const score = Math.max(0, Math.min(100, Math.round(100 * (finalOffer / base))));

  // Decision rules
  let decision: Decision = 'conditional';
  if (hasCriticalFrame || hasCriticalFork || batteryDangerous) {
    decision = 'refused_safety';
  } else if (repair > base * 0.6) {
    decision = 'refused_economic';
  } else if (score >= 75) {
    decision = 'accepted';
  } else if (score < 50) {
    decision = 'refused_economic';
  }

  const reasons: string[] = [];
  if (age > 3) reasons.push(`Décote âge: ${age} ans`);
  if (condition && condition !== 'good') reasons.push(`État: ${condition}`);
  if (repair > 0) reasons.push(`Frais réparation: €${repair}`);

  return { base, finalOffer, repairCosts: repair, cleaningCosts: cleaning, score, decision, reasons };
}

export function calculateScoreFromCategories({ baseMarketValue, categories, cleaningCosts = 0 }:
  { baseMarketValue: number; categories: Record<string, { impact?: number; status?: string; blocking?: boolean }> ; cleaningCosts?: number }) {
  // weights
  const weights: Record<string, number> = { frame: 0.3, fork: 0.0, brakes: 0.25, transmission: 0.25, wheels: 0.1, finishes: 0.1 };
  // fork is considered as part of frame blocking-wise but weight 0 separate; distribute fork to frame
  const normalizedWeights = { frame: 0.3 + 0.05, fork: 0, brakes: 0.25, transmission: 0.25, wheels: 0.1, finishes: 0.1 };

  let score = 100;
  let repairCosts = 0;
  const reasons: string[] = [];
  let blocking = false;

  Object.keys(normalizedWeights).forEach((k) => {
    const key = k;
    const w = (normalizedWeights as any)[key] || 0;
    const c = categories[key] || {};
    const status = c.status || 'good';
    // simple mapping
    const map: Record<string, number> = { good: 1, medium: 0.85, replace: 0.6, critical: 0.3 };
    const coeff = map[status] ?? 0.8;
    score -= Math.round((1 - coeff) * w * 100);
    if (c.impact) repairCosts += c.impact;
    if (c.blocking) blocking = true;
    if (status !== 'good') reasons.push(`${key}: ${status}`);
  });

  // final adjustments
  score = Math.max(0, Math.min(100, Math.round(score)));
  const base = baseMarketValue;
  const finalOffer = Math.max(0, Math.round(base * (score / 100) - repairCosts - cleaningCosts));

  // decision
  let decision: Decision = 'conditional';
  if (blocking) decision = 'refused_safety';
  else if (repairCosts > base * 0.6) decision = 'refused_economic';
  else if (score >= 75) decision = 'accepted';
  else if (score < 50) decision = 'refused_economic';

  return { base, finalOffer, repairCosts, cleaningCosts, score, decision: decision as Decision, reasons };
}
