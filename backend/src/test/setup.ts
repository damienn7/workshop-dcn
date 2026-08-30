import { afterAll, beforeAll, beforeEach } from 'vitest';
import {
  configureTestDatabaseEnv,
  disconnectTestDatabase,
  prepareTestDatabase,
  resetTestDatabase
} from './testDatabase.js';

configureTestDatabaseEnv();

beforeAll(async () => {
  await prepareTestDatabase();
});

beforeEach(async () => {
  await resetTestDatabase();
});

afterAll(async () => {
  await disconnectTestDatabase();
});
