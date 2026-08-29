import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');
const migrationPath = path.join(backendRoot, 'prisma/migrations/20260618131614_init/migration.sql');

function getSqlitePath(databaseUrl: string) {
  if (!databaseUrl.startsWith('file:')) {
    throw new Error('E2E DATABASE_URL must use a SQLite file: URL.');
  }

  const sqlitePath = databaseUrl.slice('file:'.length);
  if (!path.isAbsolute(sqlitePath)) {
    throw new Error('E2E DATABASE_URL must point to an absolute file path.');
  }

  return sqlitePath;
}

function splitSqlStatements(sql: string) {
  return sql
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to reset the E2E database.');
  }

  const sqlitePath = getSqlitePath(databaseUrl);
  mkdirSync(path.dirname(sqlitePath), { recursive: true });

  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    rmSync(`${sqlitePath}${suffix}`, { force: true });
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    const migrationSql = readFileSync(migrationPath, 'utf8');
    for (const statement of splitSqlStatements(migrationSql)) {
      await prisma.$executeRawUnsafe(statement);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`E2E database ready at ${sqlitePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
