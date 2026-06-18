import { BuybackCase } from '../modules/cases/cases.schemas';

export const CASES: BuybackCase[] = [
  {
    id: 'case_1',
    caseNumber: 'DEC-00488',
    status: 'pending',
    customer: {
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '06 12 34 56 78',
      email: 'marie.dupont@email.fr'
    },
    item: {
      articleType: 'bike',
      category: 'vtt',
      brand: 'Rockrider',
      model: 'Rockrider 520',
      year: 2019,
      frameSize: 'M',
      serialNumber: '',
      declaredKm: 2500,
      estimatedBasePrice: 150
    },
    preDiagnostic: {
      generalState: 'good',
      frame: 'no_shock',
      brakes: 'functional',
      transmission: 'small_difficulty',
      wheels: 'normal_wear',
      photos: ['photo_1', 'photo_2', 'photo_3']
    },
    customerScore: 72,
    onlineEstimate: 85,
    finalOffer: null
  },
  {
    id: 'case_2',
    caseNumber: 'DEC-00481',
    status: 'accepted',
    customer: {
      firstName: 'Paul',
      lastName: 'Rivière',
      phone: '06 67 56 87 90',
      email: 'paul.riviere@email.fr'
    },
    item: {
      articleType: 'bike',
      category: 'route_gravel',
      brand: 'Triban',
      model: 'Triban 100',
      year: 2022,
      frameSize: 'M',
      serialNumber: '1234567890',
      declaredKm: 900,
      estimatedBasePrice: 120
    },
    preDiagnostic: {
      generalState: 'good',
      frame: 'no_shock',
      brakes: 'functional',
      transmission: 'no_issue',
      wheels: 'normal_wear',
      photos: ['photo_1', 'photo_2', 'photo_3']
    },
    customerScore: 86,
    onlineEstimate: 99,
    finalOffer: 65
  },
  {
    id: 'case_3',
    caseNumber: 'DEC-00479',
    status: 'refused',
    customer: {
      firstName: 'Sophie',
      lastName: 'Chen',
      phone: '07 88 44 65 13',
      email: 'sophie.chen@gmail.com'
    },
    item: {
      articleType: 'bike',
      category: 'route_gravel',
      brand: 'Triban',
      model: 'Route Trappes 78990',
      year: 2012,
      frameSize: 'S',
      serialNumber: '9876543210',
      declaredKm: 1900,
      estimatedBasePrice: 90
    },
    preDiagnostic: {
      generalState: 'good',
      frame: 'shock',
      brakes: 'functional',
      transmission: 'small_difficulty',
      wheels: 'normal_wear',
      photos: ['photo_1', 'photo_2', 'photo_3']
    },
    customerScore: 54,
    onlineEstimate: 50,
    finalOffer: 0
  },
{
    id: 'case_1',
    caseNumber: 'DEC-00487',
    status: 'pending',
    customer: {
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '06 12 34 56 78',
      email: 'marie.dupont@email.fr'
    },
    item: {
      articleType: 'bike',
      category: 'vtt',
      brand: 'Rockrider',
      model: 'Rockrider 520',
      year: 2019,
      frameSize: 'M',
      serialNumber: '',
      declaredKm: 2500,
      estimatedBasePrice: 150
    },
    preDiagnostic: {
      generalState: 'good',
      frame: 'no_shock',
      brakes: 'functional',
      transmission: 'small_difficulty',
      wheels: 'normal_wear',
      photos: ['photo_1', 'photo_2', 'photo_3']
    },
    customerScore: 72,
    onlineEstimate: 85,
    finalOffer: null
  }
];
