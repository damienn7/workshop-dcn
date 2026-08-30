# C4.5 — API and Database Evidence

Branch verified: `rattrapage-bc4`.

Scope: evidence/documentation only. No backend behavior, Prisma schema, ORM choice, SQLite configuration, or `backend/prisma/dev.db` content was changed for this evidence.

## Evaluation Criterion 1

Database connection is present and tested.

Verdict: DEMONSTRATED.

| Evidence | File/test | What it proves |
|---|---|---|
| Prisma datasource | `backend/prisma/schema.prisma` | Prisma is configured with datasource `db`, provider `sqlite`, URL `file:./dev.db` for the local development database. |
| ORM client | `backend/src/db/prisma.ts` | A shared `PrismaClient` is instantiated. When `DATABASE_URL` is present, the client uses that URL, which allows isolated test databases. |
| Express wiring | `backend/src/app.ts` | Express mounts the case, diagnosis, scoring and KPI routers. The case/diagnosis/scoring services import the Prisma singleton. |
| Isolated test DB setup | `backend/src/test/testDatabase.ts`, `backend/src/test/setup.ts` | Vitest configures `DATABASE_URL=file:/tmp/workshop-dcn-backend-tests/test-<worker>.db`, recreates the SQLite database from the migration, resets rows before each test, and disconnects Prisma after the run. |
| Connection exercised by API tests | `backend/src/modules/diagnostics/diagnostics.routes.test.ts`, `backend/src/modules/scoring/scoring.routes.test.ts` | Supertest calls real Express routes; the routes perform Prisma reads/writes; the tests verify the persisted rows with Prisma queries. |

Safe verification run:

```text
cd backend
npm test -- src/test/health.test.ts src/modules/diagnostics/diagnostics.routes.test.ts src/modules/scoring/scoring.routes.test.ts src/modules/scoring/scoring.acceptance.test.ts
```

Result captured on 2026-08-30: 4 test files PASS, 29 tests PASS. Database used: isolated SQLite file under `/tmp/workshop-dcn-backend-tests/`, not `backend/prisma/dev.db`.

## Evaluation Criterion 2

Entities are demonstrably loaded and saved.

Verdict: DEMONSTRATED.

### Prisma Models

Actual count: 6 Prisma models.

| Model | Purpose | Primary key | Important fields | Foreign keys | Relations |
|---|---|---|---|---|---|
| `Customer` | Customer identity attached to a buyback request. | `id String @id @default(cuid())` | `firstName`, `lastName`, `phone`, `email`, timestamps | None | `cases BuybackCase[]` |
| `BuybackCase` | Main buyback dossier/case. | `id String @id @default(cuid())` | `caseNumber @unique`, `status`, item fields, `customerScore`, `onlineEstimate`, `finalOffer`, timestamps | `customerId` | Required `customer`; optional `preDiagnostic`, `diagnosis`, `scoreResult`, `decision` |
| `PreDiagnostic` | Customer-declared pre-diagnostic before store inspection. | `id String @id @default(cuid())` | `generalState`, `frame`, `brakes`, `transmission`, `wheels`, `photosJson`, timestamps | `caseId @unique` | Required `case`; deleted on parent case cascade |
| `Diagnosis` | Technician diagnosis sections. | `id String @id @default(cuid())` | `startedAt`, `completedAt`, `identificationJson`, `frameForkJson`, `brakesJson`, `transmissionJson`, `wheelsTiresJson`, `finishingJson`, timestamps | `caseId @unique` | Required `case`; deleted on parent case cascade |
| `ScoreResult` | Computed technician score, decision suggestion and price details. | `id String @id @default(cuid())` | `technicianScore`, `decision`, `onlineEstimate`, `finalOffer`, `gapPercent`, scoring JSON fields, timestamps | `caseId @unique` | Required `case`; deleted on parent case cascade |
| `Decision` | Final accept/refuse decision and commercial outcome. | `id String @id @default(cuid())` | `status`, `finalOffer`, `manualAdjustment`, `adjustmentReason`, `refusalReasonsJson`, `alternativesJson`, `completedAt`, timestamps | `caseId @unique` | Required `case`; deleted on parent case cascade |

### ER Diagram

```mermaid
erDiagram
  Customer ||--o{ BuybackCase : owns
  BuybackCase ||--o| PreDiagnostic : has
  BuybackCase ||--o| Diagnosis : has
  BuybackCase ||--o| ScoreResult : has
  BuybackCase ||--o| Decision : has

  Customer {
    string id PK
    string firstName
    string lastName
    string phone
    string email
  }

  BuybackCase {
    string id PK
    string caseNumber UK
    string status
    string customerId FK
    string articleType
    string brand
    string model
    int finalOffer
  }

  PreDiagnostic {
    string id PK
    string caseId FK_UK
    string generalState
    string photosJson
  }

  Diagnosis {
    string id PK
    string caseId FK_UK
    string identificationJson
    string brakesJson
  }

  ScoreResult {
    string id PK
    string caseId FK_UK
    int technicianScore
    string decision
    int finalOffer
  }

  Decision {
    string id PK
    string caseId FK_UK
    string status
    int finalOffer
  }
```

### Entity Loading Evidence

| User/API action | Route | Service | Prisma operation | Models loaded |
|---|---|---|---|---|
| Case listing from home screen: `Screen1` `useEffect()` -> `diagApi.listCases()` | `GET /api/cases` in `cases.routes.ts` | `listCasesCompact()` | `prisma.buybackCase.findMany({ include: { customer: true }, orderBy: { createdAt: 'desc' } })` | `BuybackCase` + `Customer` |
| Case detail loading: `Screen1::handleOpenCase()` -> `diagApi.getCase(caseNumber)` | `GET /api/cases/:caseNumber` in `cases.routes.ts` | `getCaseByNumber()` | `prisma.buybackCase.findUnique({ where: { caseNumber }, include: { customer: true, preDiagnostic: true, diagnosis: true, scoreResult: true, decision: true } })` | `BuybackCase` + `Customer` + `PreDiagnostic` + `Diagnosis` + `ScoreResult` + `Decision` |
| Diagnosis loading: `diagApi.getDiagnosis(caseNumber)` | `GET /api/cases/:caseNumber/diagnosis` in `diagnostics.routes.ts` | `getDiagnosis()` | `prisma.buybackCase.findUnique({ where: { caseNumber }, include: { diagnosis: true } })` | `BuybackCase` + `Diagnosis` |
| Reload after each saved section: e.g. `Screen6::handleNext()` -> `diagApi.getCase(number)` | `GET /api/cases/:caseNumber` | `getCaseByNumber()` | Same include tree as case detail | Saved related `Diagnosis` is returned inside the case DTO |

### Entity Save/Persistence Evidence

| Business path | Frontend action | API method | Endpoint | Express route | Service | Prisma operation | Model affected |
|---|---|---|---|---|---|---|---|
| A. Start diagnosis | `Screen3` primary button | `diagApi.startDiagnosis(number)` | `POST /api/cases/:caseNumber/diagnosis/start` | `diagnostics.routes.ts` | `startDiagnosis()` | `prisma.diagnosis.upsert()`, then `prisma.buybackCase.update()` | Creates/updates `Diagnosis`; sets `BuybackCase.status = diagnosis_in_progress` |
| B. Save brakes section | `Screen6::handleNext()` | `diagApi.saveBrakes(number, payload)` | `PUT /api/cases/:caseNumber/diagnosis/brakes` | `diagnostics.routes.ts` | `saveBrakes()` -> `saveStep()` | `prisma.diagnosis.update({ data: { brakesJson: JSON.stringify(parsed.data) } })` | Updates `Diagnosis.brakesJson` |
| C. Calculate score | `Screen10::handleGenerateDecision()` | `diagApi.calculateScore(number)` | `POST /api/cases/:caseNumber/score` | `scoring.routes.ts` | `calculateScoreForCase()` -> `updateCase()` | `prisma.scoreResult.upsert()`, then `prisma.buybackCase.update()` | Creates/updates `ScoreResult`; updates `BuybackCase.finalOffer` |
| D1. Accept decision | `Screen11::handleAccept()` | `diagApi.acceptDecision(number, payload)` | `POST /api/cases/:caseNumber/decision/accept` | `scoring.routes.ts` | Route handler + `setFinalOffer()` | `prisma.decision.upsert()`, `prisma.buybackCase.update()` | Creates/updates `Decision`; updates `BuybackCase.status` and `finalOffer` |
| D2. Refuse decision | `Screen11::handleRefuse()` | `diagApi.refuseDecision(number, payload)` | `POST /api/cases/:caseNumber/decision/refuse` | `scoring.routes.ts` | `setRefusal()` | `prisma.decision.upsert()`, `prisma.buybackCase.update()` | Creates/updates `Decision`; persists refusal reasons/alternatives; sets `BuybackCase.status = refused` and `finalOffer = 0` |

## Evaluation Criterion 3

Loaded entities preserve database relations.

Verdict: DEMONSTRATED.

The main relation evidence is `cases.service.ts::getCaseByNumber()`. It loads a `BuybackCase` by unique `caseNumber` with this Prisma include tree:

```ts
include: {
  customer: true,
  preDiagnostic: true,
  diagnosis: true,
  scoreResult: true,
  decision: true
}
```

`mapDbCaseToApi()` then maps these related records into the API response:

- `dbCase.customer` -> `customer`
- `dbCase.preDiagnostic` -> `preDiagnostic`
- `dbCase.diagnosis` -> `diagnosis`
- `dbCase.scoreResult` -> `scoring`
- `dbCase.decision` -> `refusalReasons` / `refusalAlternatives`

| Parent | Child | Cardinality | Prisma relation | Demonstrated loading |
|---|---|---|---|---|
| `Customer` | `BuybackCase` | One customer can have many cases; each case has exactly one customer. | `Customer.cases BuybackCase[]`; `BuybackCase.customerId`; `BuybackCase.customer Customer` | `listCasesCompact()` and `getCaseByNumber()` include `customer`. |
| `BuybackCase` | `PreDiagnostic` | A case has zero or one pre-diagnostic; a pre-diagnostic belongs to one case. | `BuybackCase.preDiagnostic PreDiagnostic?`; `PreDiagnostic.caseId @unique` | `getCaseByNumber()` includes `preDiagnostic`. |
| `BuybackCase` | `Diagnosis` | A case has zero or one diagnosis; a diagnosis belongs to one case. | `BuybackCase.diagnosis Diagnosis?`; `Diagnosis.caseId @unique` | `getCaseByNumber()` includes `diagnosis`; `getDiagnosis()` includes `diagnosis`; diagnosis tests assert the related row exists. |
| `BuybackCase` | `ScoreResult` | A case has zero or one score result; a score result belongs to one case. | `BuybackCase.scoreResult ScoreResult?`; `ScoreResult.caseId @unique` | `getCaseByNumber()` includes `scoreResult`; scoring route tests persist and read the related `ScoreResult`. |
| `BuybackCase` | `Decision` | A case has zero or one final decision; a decision belongs to one case. | `BuybackCase.decision Decision?`; `Decision.caseId @unique` | `getCaseByNumber()` includes `decision`; accept/refuse route tests persist and read the related `Decision`. |

## C4.3 Test Evidence Reused For C4.5

No redundant tests were created. Existing C4.3 tests already execute the database access layer.

| Test ID/file | Database action | Model affected | C4.5 criterion proved |
|---|---|---|---|
| `backend/src/test/health.test.ts` | Confirms `DATABASE_URL` equals the isolated test database URL while the Express app responds. | Test SQLite configuration | Criterion 1: safe test DB wiring is active. |
| `backend/src/modules/diagnostics/diagnostics.routes.test.ts` - starts diagnosis | API starts diagnosis, then Prisma reloads case with `include: { diagnosis: true }`. | `Diagnosis`, `BuybackCase` | Criteria 1, 2, 3: connection works, diagnosis row is created, relation is loaded. |
| `backend/src/modules/diagnostics/diagnostics.routes.test.ts` - persists identification | API saves identification JSON and mirrors item fields; Prisma reload verifies row values. | `Diagnosis`, `BuybackCase` | Criterion 2: entity fields are saved and re-read. |
| `backend/src/modules/diagnostics/diagnostics.routes.test.ts` - persists diagnosis sections | API saves frame/fork, brakes, transmission, wheels/tires, finishing; Prisma reads each JSON field. | `Diagnosis` | Criterion 2: diagnosis-section persistence is executable evidence. |
| `backend/src/modules/scoring/scoring.routes.test.ts` - calculates score | API calculates score; Prisma verifies `ScoreResult` and `BuybackCase.finalOffer`. | `ScoreResult`, `BuybackCase` | Criterion 2: score result is saved and linked to the case. |
| `backend/src/modules/scoring/scoring.routes.test.ts` - accepts decision | API accepts the offer; Prisma verifies `Decision` and case status/offer. | `Decision`, `BuybackCase` | Criterion 2: final decision is persisted. |
| `backend/src/modules/scoring/scoring.routes.test.ts` - refuses decision | API refuses the case; Prisma verifies refusal reasons and case status/offer. | `Decision`, `BuybackCase` | Criterion 2: refusal data is persisted. |
| `backend/src/modules/scoring/scoring.acceptance.test.ts` | Test data is created through Prisma with nested customer/diagnosis, then scoring service persists a result. | `Customer`, `BuybackCase`, `Diagnosis`, `ScoreResult` | Criteria 1 and 2: ORM creates related records and service persists scoring. |

## Endpoint Count

Current source exposes 17 HTTP endpoints:

- 16 mounted API endpoints: 3 case endpoints, 8 diagnosis endpoints, 4 score/decision endpoints, 1 KPI endpoint.
- 1 health endpoint: `GET /health`.

Important limitation: `GET /api/kpis/summary` is a mounted API endpoint, but it uses `backend/src/data/cases.mock.ts`, not Prisma/SQLite. It is therefore not used as C4.5 database-access evidence.

## Final C4.5 Verdict

| Criterion | Verdict | Evidence anchor |
|---|---|---|
| 1. Database connection is present and tested. | DEMONSTRATED | Prisma datasource/client plus isolated SQLite integration tests. |
| 2. Entities corresponding to database tables are loaded and saved. | DEMONSTRATED | Case loading, diagnosis saves, scoring persistence, decision persistence, all verified by tests. |
| 3. Loaded entities are linked together as defined in the schema. | DEMONSTRATED | Prisma relations in `schema.prisma`, `getCaseByNumber()` include tree, and tests that load related rows. |
