# C4.5 — Live Demo Plan

Objective: deterministic, low-risk demonstration of API access to persisted SQLite data through Prisma.

Environment: disposable SQLite database at `/tmp/workshop-dcn-c45-demo.db`. Do not use `backend/prisma/dev.db`.

## Preparation

Terminal 1:

```bash
cd /Users/damiennicolleau/eemi/workshop-dcn/backend
DEMO_DB=/tmp/workshop-dcn-c45-demo.db
DATABASE_URL=file:$DEMO_DB npm run db:e2e:reset
```

Expected output:

```text
E2E database ready at /tmp/workshop-dcn-c45-demo.db
```

Seed one deterministic case:

```bash
DATABASE_URL=file:$DEMO_DB npx tsx -e "import prisma from './src/db/prisma'; await prisma.buybackCase.create({ data: { caseNumber: 'C45-DEMO-001', status: 'pending', articleType: 'bike', category: 'vtt', brand: 'Rockrider', model: '520', year: 2020, frameSize: 'M', serialNumber: '1234567890', estimatedBasePrice: 200, customer: { create: { firstName: 'Demo', lastName: 'C45', phone: '0600000000', email: 'demo.c45@example.test' } } } }); await prisma.\$disconnect(); console.log('Seeded C45-DEMO-001');"
```

Expected output:

```text
Seeded C45-DEMO-001
```

Start the backend on a disposable port:

```bash
DATABASE_URL=file:$DEMO_DB PORT=4400 npx tsx src/server.ts
```

Expected output:

```text
Diag Seconde Vie API listening on http://localhost:4400
```

Fallback if the terminal demo fails: use `backend/src/test/testDatabase.ts` and `DecathProto/playwright.config.ts` as evidence that C4.3 already uses isolated SQLite databases.

## Demo Steps

| Step | Command or UI action | Expected output | Fallback evidence |
|---|---|---|---|
| 1. Load one existing case through the API | `curl -s http://localhost:4400/api/cases/C45-DEMO-001` | JSON contains `caseNumber: "C45-DEMO-001"`, `customer.firstName: "Demo"`, and item fields. | `cases.routes.ts` -> `getCaseByNumber()` -> `prisma.buybackCase.findUnique(... include ...)`. |
| 2. Start diagnosis | `curl -s -X POST http://localhost:4400/api/cases/C45-DEMO-001/diagnosis/start` | JSON diagnosis object with `identification`, `frameFork`, `brakes`, `transmission`, `wheelsTires`, `finishing` all `null`. | `diagnostics.service.ts::startDiagnosis()` uses `prisma.diagnosis.upsert()` and updates case status. |
| 3. Save one diagnosis field | `curl -s -X PUT http://localhost:4400/api/cases/C45-DEMO-001/diagnosis/brakes -H 'Content-Type: application/json' -d '{"type":"v_brake_pads","frontEfficiency":"correct","rearEfficiency":"correct","padsWear":"good"}'` | JSON echoes the saved brakes payload. | `diagnostics.service.ts::saveBrakes()` -> `saveStep()` -> `prisma.diagnosis.update()`. |
| 4. Verify persistence directly in the disposable DB | `DATABASE_URL=file:$DEMO_DB npx tsx -e "import prisma from './src/db/prisma'; const c = await prisma.buybackCase.findUnique({ where: { caseNumber: 'C45-DEMO-001' }, include: { diagnosis: true } }); console.log(c?.diagnosis?.brakesJson); await prisma.\$disconnect();"` | Output contains `{"type":"v_brake_pads","frontEfficiency":"correct","rearEfficiency":"correct","padsWear":"good"}`. | `diagnostics.routes.test.ts` has executable assertions for the same persistence behavior. |
| 5. Reload the case and show the related diagnosis is returned | `curl -s http://localhost:4400/api/cases/C45-DEMO-001` | JSON contains a `diagnosis.brakes` object with the saved values. | `cases.service.ts::getCaseByNumber()` includes `diagnosis: true`; `mapDbCaseToApi()` parses `brakesJson`. |

## Stop Demo Server

Use `Ctrl+C` in Terminal 1.

## Safety Check

Before and after the demo:

```bash
git status --short
```

Expected repository status remains limited to documentation files plus the pre-existing local modification before commit, or only the pre-existing local modification after commit:

```text
 M backend/prisma/dev.db
```

`backend/prisma/dev.db` must not be staged or committed.
