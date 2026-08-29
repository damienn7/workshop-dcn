import type { APIRequestContext } from '@playwright/test';

export const backendBaseURL = process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:4100';

export const technicianCasePayload = {
  customer: {
    firstName: 'Camille',
    lastName: 'Martin',
    phone: '0600000000',
    email: 'camille.martin@example.test'
  },
  item: {
    articleType: 'bike',
    category: 'vtt',
    brand: 'Rockrider',
    model: '520',
    year: 2020,
    frameSize: 'M',
    serialNumber: '1234567890',
    estimatedBasePrice: 200
  }
};

export async function createTechnicianCase(request: APIRequestContext) {
  const response = await request.post(`${backendBaseURL}/api/cases`, {
    data: technicianCasePayload
  });

  if (!response.ok()) {
    throw new Error(`Unable to create E2E case: ${response.status()} ${await response.text()}`);
  }

  return response.json();
}
