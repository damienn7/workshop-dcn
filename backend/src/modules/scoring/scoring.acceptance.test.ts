import { describe, expect, it } from 'vitest';

import prisma from '../../db/prisma.js';
import { calculateScoreForCase } from './scoring.service.js';

type DiagnosisInput = {
  identification?: Record<string, unknown> | null;
  frameFork?: Record<string, unknown> | null;
  brakes?: Record<string, unknown> | null;
  transmission?: Record<string, unknown> | null;
  wheelsTires?: Record<string, unknown> | null;
  finishing?: Record<string, unknown> | null;
};

let sequence = 0;

const baseIdentification = {
  articleType: 'bike',
  category: 'vtt',
  brand: 'Rockrider',
  model: '520',
  year: 2020,
  frameSize: 'M',
  serialNumber: '1234567890',
  estimatedBasePrice: 200
};

const acceptedDiagnosis: DiagnosisInput = {
  identification: baseIdentification,
  frameFork: {
    generalCondition: 'excellent',
    shockDeformation: 'no',
    fork: 'excellent'
  },
  brakes: {
    frontEfficiency: 'correct',
    rearEfficiency: 'correct',
    padsWear: 'good'
  },
  transmission: {
    chain: 'good',
    derailleur: 'good',
    bottomBracket: 'good'
  },
  wheelsTires: {
    rims: 'good',
    tires: 'good',
    hubs: 'good'
  },
  finishing: {
    saddle: 'good',
    handlebarDirection: 'good',
    cleanliness: 'clean'
  }
};

const conditionalDiagnosis: DiagnosisInput = {
  identification: baseIdentification,
  frameFork: {
    generalCondition: 'medium',
    shockDeformation: 'medium',
    fork: 'medium'
  },
  brakes: {
    frontEfficiency: 'medium',
    rearEfficiency: 'medium',
    padsWear: 'normal_wear'
  },
  transmission: {
    chain: 'medium',
    derailleur: 'medium',
    bottomBracket: 'medium'
  },
  wheelsTires: {
    rims: 'medium',
    tires: 'medium',
    hubs: 'medium'
  },
  finishing: {
    saddle: 'medium',
    handlebarDirection: 'medium',
    cleanliness: 'medium'
  }
};

const refusedDiagnosis: DiagnosisInput = {
  identification: baseIdentification,
  frameFork: {
    generalCondition: 'bad',
    shockDeformation: 'bad',
    fork: 'bad'
  },
  brakes: {
    frontEfficiency: 'bad',
    rearEfficiency: 'bad',
    padsWear: 'replace'
  },
  transmission: {
    chain: 'bad',
    derailleur: 'bad',
    bottomBracket: 'bad'
  },
  wheelsTires: {
    rims: 'bad',
    tires: 'bad',
    hubs: 'bad'
  },
  finishing: {
    saddle: 'bad',
    handlebarDirection: 'medium',
    cleanliness: 'bad'
  }
};

async function buildScoringCase({
  diagnosis,
  estimatedBasePrice = 200,
  onlineEstimate = 200,
  customerScore = 80
}: {
  diagnosis: DiagnosisInput;
  estimatedBasePrice?: number;
  onlineEstimate?: number;
  customerScore?: number;
}) {
  sequence += 1;
  const caseNumber = `TEST-SCORE-${sequence}`;

  await prisma.buybackCase.create({
    data: {
      caseNumber,
      status: 'diagnosis_in_progress',
      articleType: 'bike',
      category: 'vtt',
      brand: 'Rockrider',
      model: '520',
      year: 2020,
      frameSize: 'M',
      serialNumber: '1234567890',
      estimatedBasePrice,
      customerScore,
      onlineEstimate,
      finalOffer: null,
      customer: {
        create: {
          firstName: 'Test',
          lastName: `Scoring ${sequence}`,
          email: `scoring-${sequence}@example.test`
        }
      },
      diagnosis: {
        create: {}
      }
    }
  });

  return {
    caseNumber,
    status: 'diagnosis_in_progress',
    customerScore,
    onlineEstimate,
    item: {
      articleType: 'bike',
      category: 'vtt',
      brand: 'Rockrider',
      model: '520',
      year: 2020,
      frameSize: 'M',
      serialNumber: '1234567890',
      estimatedBasePrice
    },
    diagnosis,
    preDiagnostic: undefined
  };
}

async function score(diagnosis: DiagnosisInput, options: Partial<Parameters<typeof buildScoringCase>[0]> = {}) {
  const caseObj = await buildScoringCase({ diagnosis, ...options });
  return calculateScoreForCase(caseObj);
}

describe('scoring business acceptance scenarios', () => {
  it('accepts a bike above the accepted threshold', async () => {
    const result = await score(acceptedDiagnosis);

    expect(result.decision).toBe('accepted');
    expect(result.technicianScore).toBeGreaterThanOrEqual(75);
    expect(result.finalOffer).toBeGreaterThan(0);
  });

  it('marks a bike as conditional at mid-range quality', async () => {
    const result = await score(conditionalDiagnosis);

    expect(result.decision).toBe('conditional');
    expect(result.technicianScore).toBeGreaterThanOrEqual(50);
    expect(result.technicianScore).toBeLessThan(75);
  });

  it('refuses a bike below the conditional threshold', async () => {
    const result = await score(refusedDiagnosis);

    expect(result.decision).toBe('refused');
    expect(result.technicianScore).toBeLessThan(50);
  });

  it('lets a blocking criterion override a good numerical score', async () => {
    const result = await score({
      ...acceptedDiagnosis,
      frameFork: {
        ...acceptedDiagnosis.frameFork,
        shockDeformation: 'shock'
      }
    });

    expect(result.decision).toBe('refused');
    expect(result.finalOffer).toBe(0);
    expect(result.blockingReasons.join(' ')).toMatch(/Cadre avec choc/);
  });

  it('[DEFECT] treats no_shock as the absence of a frame shock', async () => {
    const result = await score({
      ...acceptedDiagnosis,
      frameFork: {
        ...acceptedDiagnosis.frameFork,
        shockDeformation: 'no_shock'
      }
    });

    expect(result.decision).toBe('accepted');
    expect(result.finalOffer).toBeGreaterThan(0);
    expect(result.blockingReasons.join(' ')).not.toMatch(/Cadre avec choc/);
  });

  it('treats a score of exactly 50 as conditional', async () => {
    const result = await score({
      identification: baseIdentification,
      frameFork: {
        generalCondition: 50,
        shockDeformation: 50,
        fork: 50
      },
      brakes: {
        frontEfficiency: 35,
        rearEfficiency: 35,
        padsWear: 'ok'
      },
      transmission: {
        chain: 50,
        derailleur: 50,
        bottomBracket: 50
      },
      wheelsTires: {
        rims: 50,
        tires: 50,
        hubs: 50
      },
      finishing: {
        saddle: 50,
        handlebarDirection: 50,
        cleanliness: 50
      }
    });

    expect(result.technicianScore).toBe(50);
    expect(result.decision).toBe('conditional');
  });

  it('treats a score of exactly 75 as accepted', async () => {
    const result = await score({
      identification: baseIdentification,
      frameFork: {
        generalCondition: 75,
        shockDeformation: 75,
        fork: 75
      },
      brakes: {
        frontEfficiency: 72.5,
        rearEfficiency: 72.5,
        padsWear: 'ok'
      },
      transmission: {
        chain: 75,
        derailleur: 75,
        bottomBracket: 75
      },
      wheelsTires: {
        rims: 75,
        tires: 75,
        hubs: 75
      },
      finishing: {
        saddle: 75,
        handlebarDirection: 75,
        cleanliness: 75
      }
    });

    expect(result.technicianScore).toBe(75);
    expect(result.decision).toBe('accepted');
  });

  it('[DEFECT] rejects scoring when the diagnosis is incomplete', async () => {
    await expect(
      score({
        identification: baseIdentification,
        frameFork: null,
        brakes: null,
        transmission: null,
        wheelsTires: null,
        finishing: null
      })
    ).rejects.toThrow(/diagnostic incomplet/i);
  });

  it('[DEFECT] never returns a negative final offer', async () => {
    const result = await score(
      {
        ...conditionalDiagnosis,
        brakes: {
          frontEfficiency: 'medium',
          rearEfficiency: 'medium',
          padsWear: 'replace'
        },
        finishing: {
          saddle: 'medium',
          handlebarDirection: 'medium',
          cleanliness: 'cleaning_needed'
        }
      },
      {
        estimatedBasePrice: 0,
        onlineEstimate: 0
      }
    );

    expect(result.finalOffer).toBeGreaterThanOrEqual(0);
  });

  it('[DEFECT] treats the current French UI blocking label as a blocking criterion', async () => {
    const result = await score({
      ...acceptedDiagnosis,
      frameFork: {
        generalCondition: 'Excellent',
        shockDeformation: 'Oui — bloquant',
        fork: 'Fonctionnelle'
      }
    });

    expect(result.decision).toBe('refused');
    expect(result.finalOffer).toBe(0);
    expect(result.blockingReasons.join(' ')).toMatch(/Cadre avec choc/);
  });
});
