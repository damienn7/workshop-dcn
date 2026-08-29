import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const workerId = process.env.VITEST_WORKER_ID ?? String(process.pid);
const testDbDir = path.join(os.tmpdir(), 'workshop-dcn-backend-tests');

export const testDbFile = path.join(testDbDir, `test-${workerId}.db`);
export const testDatabaseUrl = `file:${testDbFile}`;

export function configureTestDatabaseEnv() {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = testDatabaseUrl;
}

export async function prepareTestDatabase() {
  configureTestDatabaseEnv();

  const { prisma } = await import('../db/prisma');
  await prisma.$disconnect().catch(() => undefined);

  fs.mkdirSync(testDbDir, { recursive: true });
  fs.rmSync(testDbFile, { force: true });
  fs.rmSync(`${testDbFile}-journal`, { force: true });
  fs.rmSync(`${testDbFile}-wal`, { force: true });
  fs.rmSync(`${testDbFile}-shm`, { force: true });

  const prismaBin = path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
  );
  const migrationFile = path.join(
    process.cwd(),
    'prisma',
    'migrations',
    '20260618131614_init',
    'migration.sql'
  );

  execFileSync(prismaBin, ['db', 'execute', '--url', testDatabaseUrl, '--file', migrationFile], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
}

export async function resetTestDatabase() {
  const { prisma } = await import('../db/prisma');

  await prisma.decision.deleteMany();
  await prisma.scoreResult.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.preDiagnostic.deleteMany();
  await prisma.buybackCase.deleteMany();
  await prisma.customer.deleteMany();
}

export async function disconnectTestDatabase() {
  const { prisma } = await import('../db/prisma');
  await prisma.$disconnect();
}
