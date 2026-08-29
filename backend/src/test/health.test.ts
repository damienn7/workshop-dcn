import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../app';
import { testDatabaseUrl } from './testDatabase';

describe('backend test infrastructure', () => {
  it('serves the health endpoint with the isolated test database configured', async () => {
    expect(process.env.DATABASE_URL).toBe(testDatabaseUrl);

    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'diag-seconde-vie-api'
    });
  });
});
