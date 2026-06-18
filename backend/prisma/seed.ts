import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.decision.deleteMany();
  await prisma.scoreResult.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.preDiagnostic.deleteMany();
  await prisma.buybackCase.deleteMany();
  await prisma.customer.deleteMany();

  console.log('Seeding demo cases...');

  // Case 1 — Marie Dupont
  await prisma.buybackCase.create({
    data: {
      caseNumber: 'DEC-00487',
      status: 'pending',
      customer: {
        create: {
          firstName: 'Marie',
          lastName: 'Dupont',
          phone: '06 12 34 56 78',
          email: 'marie.dupont@email.fr'
        }
      },
      articleType: 'bike',
      category: 'vtt',
      brand: 'Rockrider',
      model: 'Rockrider 520',
      year: 2019,
      frameSize: 'M',
      declaredKm: 2500,
      estimatedBasePrice: 150,
      customerScore: 72,
      onlineEstimate: 85,
      finalOffer: null,
      preDiagnostic: {
        create: {
          generalState: 'good',
          frame: 'no_shock',
          brakes: 'functional',
          transmission: 'small_difficulty',
          wheels: 'normal_wear',
          photosJson: JSON.stringify(['photo_1', 'photo_2', 'photo_3'])
        }
      }
    }
  });

  // Case 2 — Paul Rivière (accepted)
  await prisma.buybackCase.create({
    data: {
      caseNumber: 'DEC-00481',
      status: 'accepted',
      customer: {
        create: {
          firstName: 'Paul',
          lastName: 'Rivière',
          phone: '06 67 56 87 90',
          email: 'paul.riviere@email.fr'
        }
      },
      articleType: 'bike',
      category: 'route_gravel',
      brand: 'Triban',
      model: 'Triban 100',
      year: 2022,
      frameSize: 'M',
      serialNumber: '1234567890',
      declaredKm: 900,
      estimatedBasePrice: 120,
      customerScore: 86,
      onlineEstimate: 99,
      finalOffer: 65,
      preDiagnostic: {
        create: {
          generalState: 'good',
          frame: 'no_shock',
          brakes: 'functional',
          transmission: 'no_issue',
          wheels: 'normal_wear',
          photosJson: JSON.stringify(['photo_1', 'photo_2', 'photo_3'])
        }
      },
      decision: {
        create: {
          status: 'accepted',
          finalOffer: 65,
          manualAdjustment: false,
          completedAt: new Date()
        }
      }
    }
  });

  // Case 3 — Sophie Chen (refused)
  await prisma.buybackCase.create({
    data: {
      caseNumber: 'DEC-00479',
      status: 'refused',
      customer: {
        create: {
          firstName: 'Sophie',
          lastName: 'Chen',
          phone: '07 88 44 65 13',
          email: 'sophie.chen@gmail.com'
        }
      },
      articleType: 'bike',
      category: 'route_gravel',
      brand: 'Triban',
      model: 'Route Trappes 78990',
      year: 2012,
      frameSize: 'S',
      serialNumber: '9876543210',
      declaredKm: 1900,
      estimatedBasePrice: 90,
      customerScore: 54,
      onlineEstimate: 50,
      finalOffer: 0,
      preDiagnostic: {
        create: {
          generalState: 'good',
          frame: 'shock',
          brakes: 'functional',
          transmission: 'small_difficulty',
          wheels: 'normal_wear',
          photosJson: JSON.stringify(['photo_1', 'photo_2', 'photo_3'])
        }
      },
      decision: {
        create: {
          status: 'refused',
          finalOffer: 0,
          manualAdjustment: false,
          refusalReasonsJson: JSON.stringify(['Cadre avec choc']),
          completedAt: new Date()
        }
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
