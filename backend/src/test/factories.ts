import prisma from '../db/prisma';

let sequence = 0;

export function nextCaseNumber(prefix = 'TEST') {
  sequence += 1;
  return `${prefix}-${sequence.toString().padStart(5, '0')}`;
}

export async function createBuybackCase({
  caseNumber = nextCaseNumber(),
  status = 'pending',
  withDiagnosis = false,
  estimatedBasePrice = 200,
  onlineEstimate = 200,
  customerScore = 80
}: {
  caseNumber?: string;
  status?: string;
  withDiagnosis?: boolean;
  estimatedBasePrice?: number;
  onlineEstimate?: number;
  customerScore?: number;
} = {}) {
  const created = await prisma.buybackCase.create({
    data: {
      caseNumber,
      status,
      articleType: 'bike',
      category: 'vtt',
      brand: 'Rockrider',
      model: '520',
      year: 2020,
      frameSize: 'M',
      serialNumber: '1234567890',
      declaredKm: 1000,
      estimatedBasePrice,
      customerScore,
      onlineEstimate,
      finalOffer: null,
      customer: {
        create: {
          firstName: 'Test',
          lastName: caseNumber,
          phone: '0600000000',
          email: `${caseNumber.toLowerCase()}@example.test`
        }
      },
      diagnosis: withDiagnosis
        ? {
            create: {}
          }
        : undefined
    },
    include: {
      customer: true,
      diagnosis: true
    }
  });

  return created;
}
