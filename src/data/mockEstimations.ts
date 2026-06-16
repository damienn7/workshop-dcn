export const mockStats = { diagnosticsToday: 12, avgTime: 8, acceptedRate: 64 };

export const mockEstimations: Record<string, any> = {
  'DEC-00487': {
    id: 'DEC-00487',
    client: 'Marie Dupont',
    type: 'mechanical',
    brand: 'Rockrider',
    model: '520',
    year: 2019,
    km: 2500,
    clientScore: 72,
    estimatedPrice: 85
  },
  'DEC-00481': {
    id: 'DEC-00481',
    client: 'Paul Rivière',
    type: 'mechanical',
    brand: 'Triban',
    model: '100',
    year: 2022,
    km: 900,
    clientScore: 86,
    estimatedPrice: 99,
    finalOffer: 65
  },
  'DEC-00479': {
    id: 'DEC-00479',
    client: 'Sophie Chen',
    type: 'electric',
    brand: "B'Twin",
    model: 'E-VTC',
    year: 2020,
    km: 1200,
    clientScore: 45,
    estimatedPrice: 250
  }
};

export const DEFAULT_CHECKLIST = [
  { id: 'cadre', label: 'Cadre', declared: 'good' },
  { id: 'fourche', label: 'Fourche', declared: 'good' },
  { id: 'freins', label: 'Freins', declared: 'good' },
  { id: 'pneus', label: 'Pneus', declared: 'good' },
  { id: 'roues', label: 'Roues', declared: 'good' },
  { id: 'transmission', label: 'Transmission', declared: 'good' },
  { id: 'selle', label: 'Selle et guidon', declared: 'good' },
  { id: 'proprete', label: 'Propreté', declared: 'good' }
];
