export function formatPreDiagnosticValue(value?: string | null): string {
  if (!value) return 'Non renseigné';
  const labels: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Bon état',
    medium: 'Moyen',
    bad: 'Mauvais',

    no_shock: 'Sans choc',
    shock: 'Avec choc',

    functional: 'Fonctionnels',
    weak: 'Faibles',
    not_working: 'Non fonctionnels',

    no_issue: 'Aucune difficulté',
    small_difficulty: 'Petites difficultés',
    major_issue: 'Difficultés importantes',

    normal_wear: 'Usure normale',
    damaged: 'Endommagées'
  };
  return labels[value] ?? value;
}

export function formatScore(score?: number | null): string {
  return typeof score === 'number' ? String(score) : '—';
}

export function formatPrice(price?: number | null): string {
  return typeof price === 'number' ? `${price} €` : '—';
}
