import { CASES } from '../../data/cases.mock';

export function getKpisSummary() {
  const totalCases = CASES.length;
  const completedCases = CASES.filter(c => ['accepted', 'refused', 'completed'].includes(c.status)).length;
  const accepted = CASES.filter(c => c.status === 'accepted').length;
  const refused = CASES.filter(c => c.status === 'refused').length;
  const conditional = CASES.filter(c => c.status === 'conditional').length;

  const diagnosisTimes: number[] = CASES.map(c => {
    if (c.startedAt && c.completedAt) {
      const s = new Date(c.startedAt).getTime();
      const e = new Date(c.completedAt).getTime();
      return Math.max(0, (e - s) / 1000 / 60);
    }
    return 0;
  }).filter(v => v > 0);

  const averageDiagnosisTimeMinutes = diagnosisTimes.length ? Number((diagnosisTimes.reduce((s, n) => s + n, 0) / diagnosisTimes.length).toFixed(1)) : 0;

  const scored = CASES.filter(c => c.scoring && typeof c.scoring.gapPercent === 'number');
  const averageEstimateOfferGapPercent = scored.length ? Math.round(scored.reduce((s, c: any) => s + (c.scoring.gapPercent || 0), 0) / scored.length) : 0;

  const manualAdjustmentCount = CASES.filter(c => (c as any).manualAdjustment).length;
  const manualAdjustmentRate = totalCases ? manualAdjustmentCount / totalCases : 0;

  const avgTechnicianScore = (() => {
    const withScore = CASES.filter(c => c.scoring && typeof c.scoring.technicianScore === 'number');
    if (!withScore.length) return 0;
    const sum = withScore.reduce((s, c: any) => s + c.scoring.technicianScore, 0);
    return Math.round(sum / withScore.length);
  })();

  return {
    totalCases,
    completedCases,
    acceptedRate: completedCases ? accepted / completedCases : 0,
    refusedRate: completedCases ? refused / completedCases : 0,
    conditionalRate: completedCases ? conditional / completedCases : 0,
    averageDiagnosisTimeMinutes,
    averageEstimateOfferGapPercent,
    manualAdjustmentRate,
    averageTechnicianScore: avgTechnicianScore
  };
}
