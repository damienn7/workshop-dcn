# Architecture Current State - Diag' Seconde Vie

Audit date: 2026-08-29.

Scope: current repository state inspected from source code, package manifests, Prisma schema, migration, seed script, docs, git metadata, and read-only SQLite queries. This report intentionally does not propose that undocumented behavior is implemented.

## 1. Repository Structure

```text
/
├── README.md                         # root local-launch notes
├── .env.example                      # VITE_API_BASE_URL example, stored at repo root
├── pertt.md                          # Mermaid planning/PERT artifact, not executable code
├── newExportDecath.pdf               # generated/exported project artifact
├── DecathProto.zip                   # archived frontend artifact
├── DecathProto/                      # React/Vite frontend
│   ├── README.md                     # Figma Make generated README
│   ├── package.json                  # frontend scripts and dependencies
│   ├── vite.config.ts                # Vite React/Tailwind config and aliases
│   ├── dist/                         # generated build output, ignored by git
│   ├── guidelines/                   # mostly empty generation guidelines
│   └── src/
│       ├── main.tsx                  # frontend entry point
│       ├── app/
│       │   ├── App.tsx               # monolithic mobile prototype and workflow
│       │   └── components/           # imported UI primitives, mostly shadcn/Figma bundle
│       ├── imports/
│       │   ├── api.ts                # low-level fetch wrapper
│       │   ├── diagApi.ts            # typed-ish application API client
│       │   ├── api.types.ts          # frontend API DTO types
│       │   ├── currentCase.ts        # module-level current-case store
│       │   ├── formatters.ts         # display formatting helpers
│       │   └── pasted_text/          # original prototype prompt/spec artifact
│       ├── assets/                   # Decathlon logo and imported media
│       └── styles/                   # CSS, Tailwind import, theme/layout variables
└── backend/                          # Node/Express/TypeScript backend
    ├── README.md                     # backend endpoint notes, partly stale
    ├── package.json                  # backend scripts and dependencies
    ├── tsconfig.json                 # TypeScript compiler config
    ├── dist/                         # generated build output, ignored by git
    ├── prisma/
    │   ├── schema.prisma             # SQLite data model
    │   ├── seed.ts                   # demo data reset/seed script
    │   ├── dev.db                    # tracked SQLite database file, currently dirty locally
    │   └── migrations/               # initial SQL migration
    └── src/
        ├── server.ts                 # starts Express server
        ├── app.ts                    # Express app, middleware, routes, error handler
        ├── db/prisma.ts              # PrismaClient singleton
        ├── shared/                   # ApiError, asyncHandler, HTTP constants
        ├── data/                     # scoring config plus legacy mocks
        └── modules/
            ├── cases/                # case routes, Zod schemas, Prisma service
            ├── diagnostics/          # diagnosis routes, Zod schemas, Prisma service
            ├── scoring/              # scoring routes, service, engine, types
            └── kpis/                 # KPI route and mock-backed service
```

Important generated/ignored directories exist locally: `backend/node_modules/`, `DecathProto/node_modules/`, `backend/dist/`, and `DecathProto/dist/`. The generated `dist` folders should not be treated as source of truth.

## 2. Application Architecture

Actual runtime architecture:

```text
Store employee
  ↓
React/Vite mobile prototype
  DecathProto/src/app/App.tsx
  ↓
Frontend API client
  DecathProto/src/imports/diagApi.ts
  DecathProto/src/imports/api.ts
  ↓ HTTP JSON, base URL from VITE_API_BASE_URL or http://localhost:4000
Express app
  backend/src/app.ts
  ↓
Routers
  cases.routes.ts
  diagnostics.routes.ts
  scoring.routes.ts
  kpis.routes.ts
  ↓
Service/business functions
  cases.service.ts
  diagnostics.service.ts
  scoring.service.ts
  kpis.service.ts
  ↓
Prisma singleton
  backend/src/db/prisma.ts
  ↓
SQLite
  backend/prisma/dev.db via backend/prisma/schema.prisma
```

One implemented path does not follow the database architecture:

```text
GET /api/kpis/summary
  ↓
kpis.routes.ts
  ↓
kpis.service.ts
  ↓
backend/src/data/cases.mock.ts
```

Layer identification:

| Layer | Current implementation |
|---|---|
| UI layer | `DecathProto/src/app/App.tsx`, a single file containing shared UI atoms and screens `Screen1` through `Screen13`. |
| Frontend API client | `DecathProto/src/imports/api.ts` wraps `fetch`; `DecathProto/src/imports/diagApi.ts` exposes domain methods. |
| Express routing | `backend/src/app.ts` mounts routers under `/api/cases` and `/api/kpis`; `/health` is defined directly. |
| Business/service layer | Case and diagnosis logic in `cases.service.ts` and `diagnostics.service.ts`; scoring orchestration in `scoring.service.ts`. |
| Scoring engine | `backend/src/modules/scoring/scoring.engine.ts` maps raw values and base-price coefficients; `scoring.service.ts` computes weighted results, repairs, blockers, decisions, and persistence. |
| Persistence | Prisma calls in `cases.service.ts`, `diagnostics.service.ts`, and `scoring.routes.ts`. |
| Database | SQLite file at `backend/prisma/dev.db`; schema hardcodes `url = "file:./dev.db"` in `backend/prisma/schema.prisma`. |
| Mock/static data | `kpis.service.ts` uses `CASES` from `backend/src/data/cases.mock.ts`; frontend `App.tsx` contains `DOSSIERS`, `CATEGORIES`, and `PRICE_LINES`; `catalog.mock.ts` is present but unused. |

Documentation/code discrepancy: `backend/README.md` says "Données mockées en mémoire dans `src/data/`", but current cases, diagnosis, scoring, and decisions use Prisma/SQLite. Only KPIs still use the mock array.

## 3. Frontend Analysis

### Entry Points

| File/function | Role |
|---|---|
| `DecathProto/src/main.tsx` | Calls `createRoot(...).render(<App />)` and imports global CSS. |
| `DecathProto/src/app/App.tsx::App` | Root component. Holds `screen` and `sidebarOpen` state, selects one component from `SCREENS`. |
| `DecathProto/index.html` | Vite HTML entry. Title/description still say "Code Quality Improvement", not "Diag' Seconde Vie". |

### Main React Components

`DecathProto/src/app/App.tsx` defines shared atoms:

| Component/function | Responsibility |
|---|---|
| `StatusBadge` | Displays current case/workflow status using `STATUS_LABEL`. |
| `Card`, `SectionLabel`, `PrimaryButton`, `SecondaryButton`, `ChoiceChip`, `PhotoPlaceholder`, `InfoField`, `InfoBox`, `ProgressBar`, `QuestionChips`, `NavButton` | Local UI primitives for the mobile prototype. |
| `PageShell` | Page header, optional back button, stepper extracted from subtitle, scrollable content area. |
| `Logo`, `QRCode` | Inline SVG display helpers. |

Workflow screens in `App.tsx`:

| Screen | Component | Current responsibility |
|---|---|---|
| 0 | `Screen1` | Home, case list, search, QR entry, create in-store case. |
| 1 | `Screen2` | Simulated QR scan for hardcoded `DEC-00487`. |
| 2 | `Screen3` | Case details, tabs for client/pre-diagnosis/photos, starts diagnosis. |
| 3 | `Screen4` | Identification and base price/serial entry. |
| 4 | `Screen5` | Frame/fork diagnosis. |
| 5 | `Screen6` | Brakes diagnosis. |
| 6 | `Screen7` | Transmission diagnosis. |
| 7 | `Screen8` | Wheels/tires diagnosis. |
| 8 | `Screen9` | Finishing diagnosis. |
| 9 | `Screen10` | Diagnosis summary; triggers score generation. Display rows are static. |
| 10 | `Screen11` | Decision screen; accepts/refuses decision. Some display data is static. |
| 11 | `Screen12` | Accepted final screen. Main amount is dynamic; some text remains hardcoded. |
| 12 | `Screen13` | Refused final screen. Reasons are partially dynamic; alternatives are static. |

Note: `type ScreenId = 0 | ... | 12`, while comments call the screens "Screen 1" through "Screen 13". This is only a naming mismatch, not a runtime problem.

### State Management

Current frontend state is local and in-memory:

| Location | State |
|---|---|
| `App.tsx::App` | `screen` controls navigation; no URL route or browser history integration. |
| `App.tsx` screens | Each screen holds local `loading`, `error`, form, and chip-selection state with `useState`. |
| `DecathProto/src/imports/currentCase.ts` | Module-level `currentCase` variable plus `setCurrentCase`, `getCurrentCase`, and `subscribeCurrentCase`. |

There is no Redux, React Query, Zustand, Context provider, or React Router usage in the workflow. `react-router` is listed in `DecathProto/package.json` but not used by `App.tsx`.

Data survival:

| Data | Survives refresh? | Evidence |
|---|---:|---|
| Saved case/diagnosis/scoring/decision data | Yes, if the backend write succeeded, because backend persists to SQLite. | `diagnostics.service.ts`, `cases.service.ts`, `scoring.service.ts`, `scoring.routes.ts`. |
| Current UI screen | No. | `App.tsx::App` initializes `screen` to `0`. |
| Current selected case in frontend memory | No. | `currentCase.ts` uses a module-level variable only. |
| Screen form selections before save | No. | Diagnosis screens keep `ans` in local `useState`. |
| Browser storage | No workflow persistence. | No `localStorage`/`sessionStorage` usage in app code; only an unused shadcn sidebar cookie helper exists in `components/ui/sidebar.tsx`. |

`Screen3` has a fallback fetch of hardcoded `DEC-00487` when `caseData` is absent, but that is not general state restoration.

### Navigation Strategy

Navigation is a state machine:

```text
Screen1 home
  → Screen2 QR
  → Screen3 case details
  → Screen4 identification
  → Screen5 frame/fork
  → Screen6 brakes
  → Screen7 transmission
  → Screen8 wheels/tires
  → Screen9 finishing
  → Screen10 summary
  → Screen11 decision
  → Screen12 accepted OR Screen13 refused
```

The actual navigation is implemented by passing `go(s: ScreenId)` into each screen from `App.tsx::App`.

### API Clients and Error Handling

| File/function | Current behavior |
|---|---|
| `api.ts::request` | Sends JSON `fetch` to `${API_BASE_URL}${path}`. Parses JSON responses. Throws a generic `Error` with `status` and `payload` attached as `any` when `response.ok` is false. |
| `api.ts::apiGet`, `apiPost`, `apiPut` | Thin method wrappers over `request`. |
| `diagApi.ts` | Maps frontend actions to `/api/cases`, `/diagnosis`, `/score`, and `/decision` endpoints. |

Error handling is per-screen: `catch (err: any)` stores a message in local `error` state. There is no global API error boundary, retry policy, offline mode, or centralized toast.

Loading states are also per-screen: `Screen1`, `Screen2`, `Screen3`, `Screen4`-`Screen9`, `Screen10`, and `Screen11` each toggle local `loading` or `saving` state around API calls.

### Frontend API Request Triggers

| User action / lifecycle | Component/function | Frontend API function | HTTP endpoint |
|---|---|---|---|
| Home screen loads | `Screen1::useEffect` | `diagApi.listCases` | `GET /api/cases` |
| Click a dossier row | `Screen1::handleOpenCase` | `diagApi.getCase` | `GET /api/cases/:caseNumber` |
| Search dossier and press Enter | `Screen1::handleSearch` -> `handleOpenCase` | `diagApi.getCase` | `GET /api/cases/:caseNumber` |
| Click "Nouveau sans pré-diagnostic" | `Screen1::handleCreateWithoutPrediag` | `diagApi.createCase` | `POST /api/cases` |
| Simulate QR scan | `Screen2::handleSimulate` | `diagApi.getCase('DEC-00487')` | `GET /api/cases/DEC-00487` |
| Screen3 mounted without case | `Screen3::useEffect` | `diagApi.getCase('DEC-00487')` | `GET /api/cases/DEC-00487` |
| Start diagnosis from Client tab | `Screen3` primary button handler | `diagApi.startDiagnosis`, then `diagApi.getCase` | `POST /api/cases/:caseNumber/diagnosis/start`, then `GET /api/cases/:caseNumber` |
| Continue without pre-diagnosis | `Screen3` prediag-tab button handler | `diagApi.startDiagnosis`, then `diagApi.getCase` | `POST /api/cases/:caseNumber/diagnosis/start`, then `GET /api/cases/:caseNumber` |
| Save identification | `Screen4` primary button handler | `diagApi.saveIdentification`, then `diagApi.getCase` | `PUT /api/cases/:caseNumber/diagnosis/identification`, then `GET /api/cases/:caseNumber` |
| Save frame/fork | `Screen5::handleNext` | `diagApi.saveFrameFork`, then `diagApi.getCase` | `PUT /api/cases/:caseNumber/diagnosis/frame-fork`, then `GET /api/cases/:caseNumber` |
| Save brakes | `Screen6::handleNext` | `diagApi.saveBrakes`, then `diagApi.getCase` | `PUT /api/cases/:caseNumber/diagnosis/brakes`, then `GET /api/cases/:caseNumber` |
| Save transmission | `Screen7::handleNext` | `diagApi.saveTransmission`, then `diagApi.getCase` | `PUT /api/cases/:caseNumber/diagnosis/transmission`, then `GET /api/cases/:caseNumber` |
| Save wheels/tires | `Screen8::handleNext` | `diagApi.saveWheelsTires`, then `diagApi.getCase` | `PUT /api/cases/:caseNumber/diagnosis/wheels-tires`, then `GET /api/cases/:caseNumber` |
| Save finishing | `Screen9::handleNext` | `diagApi.saveFinishing`, then `diagApi.getCase` | `PUT /api/cases/:caseNumber/diagnosis/finishing`, then `GET /api/cases/:caseNumber` |
| Generate decision/scoring | `Screen10::handleGenerateDecision` | `diagApi.calculateScore`, then `diagApi.getCase` | `POST /api/cases/:caseNumber/score`, then `GET /api/cases/:caseNumber` |
| Accept offer | `Screen11::handleAccept` | `diagApi.acceptDecision`, then `diagApi.getCase` | `POST /api/cases/:caseNumber/decision/accept`, then `GET /api/cases/:caseNumber` |
| Refuse offer | `Screen11::handleRefuse` | `diagApi.refuseDecision`, then `diagApi.getCase` | `POST /api/cases/:caseNumber/decision/refuse`, then `GET /api/cases/:caseNumber` |

`diagApi.getDiagnosis` and `diagApi.getScore` exist in `diagApi.ts` but are not called from `App.tsx` today.

### Frontend Business Logic and Static Data

Business/display logic duplicated or hardcoded in the frontend:

| Location | Current behavior | Risk |
|---|---|---|
| `App.tsx::DOSSIERS` | Local case fallback used when API fails or returns an empty list. | UI can show stale cases not present in DB. |
| `App.tsx::ProgressBar` | Color thresholds `>=75`, `>=50`, else red. | Duplicates backend decision thresholds from `scoring.config.ts`. |
| `Screen4` | Serial number and price validation before `saveIdentification`. | Duplicates backend checks from `diagnostics.service.ts::saveIdentification`. |
| `Screen5`-`Screen9` | Payload defaults and selected chip labels are constructed in UI. | UI vocabulary and backend scoring vocabulary diverge. |
| `App.tsx::CATEGORIES` and `Screen10` | Summary table and displayed scores are static (`72`, `61`) even after score calculation. | Scoring result persisted by backend may not match displayed summary. |
| `App.tsx::PRICE_LINES` and `Screen11` | Price detail lines and "Estimation client : 85 EUR / Offre finale : 58 EUR" are static; only main offer/status partly use `caseData.scoring`. | Decision explanation may not match actual backend scoring. |
| `Screen12` | Big final amount is dynamic, but text says "bon d'achat de 58 EUR" and email is hardcoded to Marie. | Final acceptance screen can be inconsistent for other cases/offers. |
| `Screen13` | Reasons use `caseData.refusalReasons` or scoring blockers; alternatives are static. | Persisted alternatives are not displayed from backend. |

Important vocabulary mismatch: `Screen5`-`Screen9` often send French display labels such as `"Oui — bloquant"`, `"Hors service"`, `"À changer"`, and `"HS"`. `scoring.service.ts::computeRepairsAndBlocking` checks lowercased strings for English/internal tokens such as `shock`, `yes`, `out`, `replace`, `danger`, and `bad`. Therefore, visible blocking or repair choices may not trigger backend blockers/repairs unless the payload happens to use the expected internal token.

## 4. Backend Analysis

### Entry Point and Express Configuration

| File/function | Current behavior |
|---|---|
| `backend/src/server.ts` | Imports `app` and listens on `process.env.PORT` or `4000`. Log message always prints localhost. |
| `backend/src/app.ts` | Creates Express app, registers JSON middleware, hardcoded CORS origins, `/health`, routers, and error handler. |
| `backend/src/db/prisma.ts` | Exports a singleton `new PrismaClient()`. |

Middleware:

| Middleware | Location | Current behavior |
|---|---|---|
| JSON body parser | `app.ts::app.use(express.json())` | Parses JSON request bodies. |
| CORS | `app.ts::cors({ origin: allowedOrigins })` | Allows only `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:5174`, `http://127.0.0.1:5174`. |
| Async error wrapper | `shared/asyncHandler.ts::asyncHandler` | Wraps route handlers and forwards rejected promises. Casts `req`/`res` to `any`. |
| Error handler | `app.ts` final `app.use` | Returns `ApiError` status/message/details, Zod 400, otherwise logs and returns 500. |

No authentication, authorization, RBAC, rate limiting, request logging, request IDs, or input-size controls are currently implemented in `app.ts`.

### Modules

| Module | Files | Current responsibility |
|---|---|---|
| Cases | `cases.routes.ts`, `cases.service.ts`, `cases.schemas.ts` | List, get, create, map Prisma cases to API DTO, update case status/final offer, persist scoring, persist refusal. |
| Diagnostics | `diagnostics.routes.ts`, `diagnostics.service.ts`, `diagnostics.schemas.ts` | Start diagnosis and save/get each diagnosis section as JSON strings. |
| Scoring | `scoring.routes.ts`, `scoring.service.ts`, `scoring.engine.ts`, `scoring.types.ts` | Calculate/persist score, accept/refuse decisions, manual adjustment validation. |
| KPIs | `kpis.routes.ts`, `kpis.service.ts` | Return KPI summary from legacy `CASES` mock array. |
| Shared | `ApiError.ts`, `asyncHandler.ts`, `http.ts` | Error class, async wrapper, numeric HTTP constants. `HTTP` constants are currently unused. |
| Data | `scoring.config.ts`, `cases.mock.ts`, `catalog.mock.ts` | Scoring config, legacy cases mock used by KPI service, unused catalog mock. |

### API Endpoints

Total relevant endpoints found in source: 17.

| Method | Endpoint | Module | Handler/service | Database mutation | Description |
|---|---|---|---|---|---|
| GET | `/health` | app | `app.ts` inline handler | No | Service health response `{ status: "ok", service: "diag-seconde-vie-api" }`. |
| GET | `/api/cases` | cases | `cases.routes.ts` -> `listCasesCompact` | No | Lists compact cases from `BuybackCase` with `Customer`. |
| GET | `/api/cases/:caseNumber` | cases | `cases.routes.ts` -> `getCaseByNumber` | No | Loads one case and relations from Prisma; 404 if missing. |
| POST | `/api/cases` | cases | `cases.routes.ts` -> `createCase` or `createCaseMinimal` | Yes: `BuybackCase`, nested `Customer` | Creates a case. Minimal in-store path bypasses normal `NewCaseSchema` if `withoutPreDiagnostic` or `source === "in_store"`. |
| POST | `/api/cases/:caseNumber/diagnosis/start` | diagnostics | `diagnostics.routes.ts` -> `startDiagnosis` | Yes: `Diagnosis` upsert, `BuybackCase.status` update | Starts or restarts diagnosis and sets status to `diagnosis_in_progress`. |
| PUT | `/api/cases/:caseNumber/diagnosis/identification` | diagnostics | `diagnostics.routes.ts` -> `saveIdentification` | Yes: `Diagnosis.identificationJson`, `BuybackCase` item fields | Validates identification, saves JSON, updates item fields. |
| PUT | `/api/cases/:caseNumber/diagnosis/frame-fork` | diagnostics | `diagnostics.routes.ts` -> `saveFrameFork` -> `saveStep` | Yes: `Diagnosis.frameForkJson` | Saves frame/fork section JSON. |
| PUT | `/api/cases/:caseNumber/diagnosis/brakes` | diagnostics | `diagnostics.routes.ts` -> `saveBrakes` -> `saveStep` | Yes: `Diagnosis.brakesJson` | Saves brakes section JSON. |
| PUT | `/api/cases/:caseNumber/diagnosis/transmission` | diagnostics | `diagnostics.routes.ts` -> `saveTransmission` -> `saveStep` | Yes: `Diagnosis.transmissionJson` | Saves transmission section JSON. |
| PUT | `/api/cases/:caseNumber/diagnosis/wheels-tires` | diagnostics | `diagnostics.routes.ts` -> `saveWheelsTires` -> `saveStep` | Yes: `Diagnosis.wheelsTiresJson` | Saves wheels/tires section JSON. |
| PUT | `/api/cases/:caseNumber/diagnosis/finishing` | diagnostics | `diagnostics.routes.ts` -> `saveFinishing` -> `saveStep` | Yes: `Diagnosis.finishingJson` | Saves finishing section JSON. |
| GET | `/api/cases/:caseNumber/diagnosis` | diagnostics | `diagnostics.routes.ts` -> `getDiagnosis` | No | Returns parsed diagnosis JSON; 400 if diagnosis not started. |
| POST | `/api/cases/:caseNumber/score` | scoring | `scoring.routes.ts` -> `calculateScoreForCase` | Yes: `ScoreResult` upsert, `BuybackCase.finalOffer` update | Calculates and persists score; only checks that a diagnosis row exists. |
| GET | `/api/cases/:caseNumber/score` | scoring | `scoring.routes.ts` -> `getCaseByNumber`; if missing scoring then `calculateScoreForCase` | Sometimes yes: same as POST score | Returns existing score, but mutates DB by calculating/persisting when scoring is absent. |
| POST | `/api/cases/:caseNumber/decision/accept` | scoring | `scoring.routes.ts`; `validateManualOfferAdjustment`; `setFinalOffer` | Yes: `Decision` upsert, `BuybackCase.finalOffer`, `BuybackCase.status` | Accepts the buyback. Requires an existing score. Uses multiple writes without a transaction. |
| POST | `/api/cases/:caseNumber/decision/refuse` | scoring | `scoring.routes.ts` -> `setRefusal` | Yes: `Decision` upsert, `BuybackCase.status`, `BuybackCase.finalOffer` | Refuses the buyback. Does not require scoring. Alternatives from request body are returned but not persisted. |
| GET | `/api/kpis/summary` | kpis | `kpis.routes.ts` -> `getKpisSummary` | No DB mutation and no DB read | Returns KPI calculations from `backend/src/data/cases.mock.ts`, not Prisma. |

### Backend Validation and Error Handling Summary

Validation exists, but it is uneven:

| Area | Current implementation |
|---|---|
| Case creation | `cases.routes.ts` uses `NewCaseSchema.safeParse`, except minimal in-store creation can bypass that schema. |
| Diagnosis identification | `diagnostics.service.ts::saveIdentification` uses `IdentificationSchema.safeParse` plus manual checks for category, required fields, serial digits length, and price > 0. |
| Diagnosis sections | `diagnostics.service.ts::saveStep` uses per-section Zod schemas, but most fields are optional strings and no enums are enforced. |
| Scoring | `scoring.routes.ts` checks only that `c.diagnosis` exists, not that all sections are complete. |
| Decision accept | `scoring.routes.ts` checks `c.scoring`; `validateManualOfferAdjustment` checks +/-15% and reason for manual adjustment. Request body is not Zod-validated. |
| Decision refuse | Checks case existence only. No score requirement and no body schema validation. |
| Database | Prisma enforces primary keys, unique case numbers/case IDs, required child relation fields, and cascade on child-to-case relations. Most domain statuses/decisions remain free text. |

## 5. Data Model / Prisma

Source of truth: `backend/prisma/schema.prisma`.

### Models

#### `Customer`

Purpose: customer identity/contact information.

| Field | Notes |
|---|---|
| `id String @id @default(cuid())` | Primary key. |
| `firstName String`, `lastName String` | Required. |
| `phone String?`, `email String?` | Optional. No email/phone format constraint in Prisma. |
| `cases BuybackCase[]` | One customer to many buyback cases. |
| `createdAt`, `updatedAt` | Timestamps. |

Relations: parent of `BuybackCase`; no cascade specified from `Customer` to `BuybackCase`, so DB migration uses restrict on customer delete.

#### `BuybackCase`

Purpose: central buyback dossier containing customer link, item identity, statuses, estimates, and one-to-one child records.

| Field | Notes |
|---|---|
| `id String @id @default(cuid())` | Primary key. |
| `caseNumber String @unique` | Public/business identifier, generated with `Math.random()` in `cases.service.ts`. |
| `status String` | Required free-text status; no Prisma enum. |
| `customerId String` | Required FK to `Customer.id`. |
| `articleType String` | Required free-text at DB level. Zod has `ArticleType`, but DB does not. |
| `category`, `brand`, `model`, `year`, `frameSize`, `serialNumber`, `declaredKm`, `estimatedBasePrice` | Item fields; most optional after minimal in-store creation. |
| `customerScore`, `onlineEstimate`, `finalOffer` | Optional numeric commercial fields. |
| `preDiagnostic PreDiagnostic?`, `diagnosis Diagnosis?`, `scoreResult ScoreResult?`, `decision Decision?` | Optional one-to-one relations from the case side. |
| `createdAt`, `updatedAt` | Timestamps. |

Relations: required many-to-one to `Customer`; optional one-to-one children from parent view.

#### `PreDiagnostic`

Purpose: customer pre-diagnosis answers and photos.

| Field | Notes |
|---|---|
| `id String @id @default(cuid())` | Primary key. |
| `caseId String @unique` | Required FK to one `BuybackCase`. |
| `generalState`, `frame`, `brakes`, `transmission`, `wheels` | Optional text answers. |
| `photosJson String?` | JSON serialized as a string. |
| `createdAt`, `updatedAt` | Timestamps. |

Relation: required child relation to `BuybackCase`, with `onDelete: Cascade`; optional from `BuybackCase`.

#### `Diagnosis`

Purpose: in-store technician diagnosis, stored one section per JSON string field.

| Field | Notes |
|---|---|
| `id String @id @default(cuid())` | Primary key. |
| `caseId String @unique` | Required FK to one `BuybackCase`. |
| `startedAt DateTime @default(now())` | Set on create; overwritten on restart by `startDiagnosis`. |
| `completedAt DateTime?` | Defined but not set by current service code. |
| `identificationJson`, `frameForkJson`, `brakesJson`, `transmissionJson`, `wheelsTiresJson`, `finishingJson` | JSON serialized as optional strings. |
| `createdAt`, `updatedAt` | Timestamps. |

Relation: required child relation to `BuybackCase`, with `onDelete: Cascade`; optional from `BuybackCase`.

#### `ScoreResult`

Purpose: calculated technician score, buyback decision, offer, and explanation details.

| Field | Notes |
|---|---|
| `id String @id @default(cuid())` | Primary key. |
| `caseId String @unique` | Required FK to one `BuybackCase`. |
| `customerScore Int?`, `technicianScore Int`, `decision String`, `onlineEstimate Int?`, `finalOffer Int`, `gapPercent Int?` | Score and commercial result fields. |
| `categoryScoresJson`, `blockingReasonsJson`, `repairCostsJson`, `priceBreakdownJson`, `explanationsJson` | Required JSON serialized strings. |
| `createdAt`, `updatedAt` | Timestamps. |

Relation: required child relation to `BuybackCase`, with `onDelete: Cascade`; optional from `BuybackCase`.

#### `Decision`

Purpose: final acceptance/refusal status and manual adjustment/refusal metadata.

| Field | Notes |
|---|---|
| `id String @id @default(cuid())` | Primary key. |
| `caseId String @unique` | Required FK to one `BuybackCase`. |
| `status String`, `finalOffer Int` | Required final state. |
| `manualAdjustment Boolean @default(false)`, `adjustmentReason String?` | Manual offer adjustment metadata. |
| `refusalReasonsJson String?`, `alternativesJson String?` | Optional JSON serialized strings. `alternativesJson` is not written by the current refusal route. |
| `completedAt DateTime?` | Set on accept/refuse. |
| `createdAt`, `updatedAt` | Timestamps. |

Relation: required child relation to `BuybackCase`, with `onDelete: Cascade`; optional from `BuybackCase`.

### Entity Relationship Diagram

```text
Customer
  1
  │
  └── * BuybackCase
          │
          ├── 0..1 PreDiagnostic
          │       └── photosJson: JSON string
          │
          ├── 0..1 Diagnosis
          │       ├── identificationJson: JSON string
          │       ├── frameForkJson: JSON string
          │       ├── brakesJson: JSON string
          │       ├── transmissionJson: JSON string
          │       ├── wheelsTiresJson: JSON string
          │       └── finishingJson: JSON string
          │
          ├── 0..1 ScoreResult
          │       ├── categoryScoresJson: JSON string
          │       ├── blockingReasonsJson: JSON string
          │       ├── repairCostsJson: JSON string
          │       ├── priceBreakdownJson: JSON string
          │       └── explanationsJson: JSON string
          │
          └── 0..1 Decision
                  ├── refusalReasonsJson: JSON string
                  └── alternativesJson: JSON string
```

Child rows (`PreDiagnostic`, `Diagnosis`, `ScoreResult`, `Decision`) require a `BuybackCase` via `caseId`, but the parent case may exist without any of those child rows.

## 6. Persistence Flow

Use case traced: "A technician opens a case, completes the diagnosis, calculates a score and validates a decision."

### Open Case

```text
User opens home screen
  ↓
Screen1::useEffect
  ↓
diagApi.listCases()
  ↓
GET /api/cases
  ↓
backend/src/modules/cases/cases.routes.ts
  ↓
cases.service.ts::listCasesCompact()
  ↓
prisma.buybackCase.findMany({ include: { customer: true } })
  ↓
BuybackCase + Customer
```

Then a specific row/search/QR opens a case:

```text
User selects/searches/scans a dossier
  ↓
Screen1::handleOpenCase() OR Screen2::handleSimulate()
  ↓
diagApi.getCase(caseNumber)
  ↓
GET /api/cases/:caseNumber
  ↓
cases.routes.ts
  ↓
cases.service.ts::getCaseByNumber()
  ↓
prisma.buybackCase.findUnique({ include: customer, preDiagnostic, diagnosis, scoreResult, decision })
  ↓
BuybackCase, Customer, PreDiagnostic, Diagnosis, ScoreResult, Decision
  ↓
cases.service.ts::mapDbCaseToApi()
  ↓
setCurrentCase()
```

### Start Diagnosis

```text
User clicks "Démarrer le diagnostic"
  ↓
Screen3 primary-button handler
  ↓
diagApi.startDiagnosis(caseNumber)
  ↓
POST /api/cases/:caseNumber/diagnosis/start
  ↓
diagnostics.routes.ts
  ↓
diagnostics.service.ts::startDiagnosis()
  ↓
ensureCaseExists()
  ↓
prisma.diagnosis.upsert({ where: { caseId }, update: { startedAt }, create: { caseId } })
  ↓
prisma.buybackCase.update({ status: "diagnosis_in_progress" })
  ↓
Diagnosis + BuybackCase
```

The frontend immediately refreshes the case:

```text
diagApi.getCase(caseNumber)
  ↓
GET /api/cases/:caseNumber
  ↓
setCurrentCase(updated)
```

### Save Identification

```text
User clicks "Cadre & fourche ->"
  ↓
Screen4 primary-button handler
  ↓
diagApi.saveIdentification(caseNumber, payload)
  ↓
PUT /api/cases/:caseNumber/diagnosis/identification
  ↓
diagnostics.routes.ts
  ↓
diagnostics.service.ts::saveIdentification()
  ↓
IdentificationSchema.safeParse() + manual required-field/serial/price checks
  ↓
ensureCaseExists()
  ↓
prisma.diagnosis.findUnique({ where: { caseId } })
  ↓
prisma.diagnosis.update({ identificationJson: JSON.stringify(data) })
  ↓
prisma.buybackCase.update({ brand, model, year, frameSize, serialNumber, estimatedBasePrice })
  ↓
Diagnosis + BuybackCase
```

### Save Diagnosis Sections

Frame/fork:

```text
User clicks next on "Cadre & fourche"
  ↓
Screen5::handleNext()
  ↓
diagApi.saveFrameFork(caseNumber, payload)
  ↓
PUT /api/cases/:caseNumber/diagnosis/frame-fork
  ↓
diagnostics.routes.ts
  ↓
diagnostics.service.ts::saveFrameFork()
  ↓
diagnostics.service.ts::saveStep(caseNumber, "frameFork", FrameForkSchema, payload)
  ↓
prisma.diagnosis.update({ frameForkJson: JSON.stringify(parsed.data) })
  ↓
Diagnosis
```

Brakes:

```text
Screen6::handleNext()
  ↓
diagApi.saveBrakes()
  ↓
PUT /api/cases/:caseNumber/diagnosis/brakes
  ↓
diagnostics.service.ts::saveBrakes()
  ↓
saveStep(..., "brakes", BrakesSchema, ...)
  ↓
prisma.diagnosis.update({ brakesJson: JSON.stringify(parsed.data) })
  ↓
Diagnosis
```

Transmission:

```text
Screen7::handleNext()
  ↓
diagApi.saveTransmission()
  ↓
PUT /api/cases/:caseNumber/diagnosis/transmission
  ↓
diagnostics.service.ts::saveTransmission()
  ↓
saveStep(..., "transmission", TransmissionSchema, ...)
  ↓
prisma.diagnosis.update({ transmissionJson: JSON.stringify(parsed.data) })
  ↓
Diagnosis
```

Wheels/tires:

```text
Screen8::handleNext()
  ↓
diagApi.saveWheelsTires()
  ↓
PUT /api/cases/:caseNumber/diagnosis/wheels-tires
  ↓
diagnostics.service.ts::saveWheelsTires()
  ↓
saveStep(..., "wheelsTires", WheelsTiresSchema, ...)
  ↓
prisma.diagnosis.update({ wheelsTiresJson: JSON.stringify(parsed.data) })
  ↓
Diagnosis
```

Finishing:

```text
Screen9::handleNext()
  ↓
diagApi.saveFinishing()
  ↓
PUT /api/cases/:caseNumber/diagnosis/finishing
  ↓
diagnostics.service.ts::saveFinishing()
  ↓
saveStep(..., "finishing", FinishingSchema, ...)
  ↓
prisma.diagnosis.update({ finishingJson: JSON.stringify(parsed.data) })
  ↓
Diagnosis
```

After each section save, the frontend calls `diagApi.getCase(caseNumber)` and updates the in-memory `currentCase`.

### Calculate Score

```text
User clicks "Générer la décision"
  ↓
Screen10::handleGenerateDecision()
  ↓
diagApi.calculateScore(caseNumber)
  ↓
POST /api/cases/:caseNumber/score
  ↓
scoring.routes.ts
  ↓
cases.service.ts::getCaseByNumber()
  ↓
if c.diagnosis exists, scoring.service.ts::calculateScoreForCase(c)
  ↓
scoring.service.ts::computeCategoryScores()
  ↓
scoring.service.ts::computeRepairsAndBlocking()
  ↓
scoring.engine.ts::getBuybackBaseValue()
  ↓
cases.service.ts::updateCase({ scoring, finalOffer })
  ↓
prisma.scoreResult.upsert()
  ↓
prisma.buybackCase.update({ finalOffer })
  ↓
ScoreResult + BuybackCase
```

### Accept Decision

```text
User clicks "Valider X EUR"
  ↓
Screen11::handleAccept()
  ↓
diagApi.acceptDecision(caseNumber, { finalOffer, manualAdjustment, adjustmentReason })
  ↓
POST /api/cases/:caseNumber/decision/accept
  ↓
scoring.routes.ts
  ↓
cases.service.ts::getCaseByNumber()
  ↓
if c.scoring exists, optional scoring.service.ts::validateManualOfferAdjustment()
  ↓
prisma.buybackCase.findUnique()
  ↓
prisma.decision.upsert({ status: "accepted", finalOffer, manualAdjustment, adjustmentReason, completedAt })
  ↓
cases.service.ts::setFinalOffer()
  ↓
prisma.buybackCase.update({ finalOffer })
  ↓
prisma.buybackCase.update({ status: "accepted" })
  ↓
Decision + BuybackCase
```

These writes are not wrapped in a transaction.

### Refuse Decision

```text
User clicks "Refuser"
  ↓
Screen11::handleRefuse()
  ↓
diagApi.refuseDecision(caseNumber, { reasons, alternatives })
  ↓
POST /api/cases/:caseNumber/decision/refuse
  ↓
scoring.routes.ts
  ↓
cases.service.ts::getCaseByNumber()
  ↓
cases.service.ts::setRefusal(caseNumber, reasons)
  ↓
prisma.decision.upsert({ status: "refused", finalOffer: 0, refusalReasonsJson, completedAt })
  ↓
prisma.buybackCase.update({ status: "refused", finalOffer: 0 })
  ↓
Decision + BuybackCase
```

`alternatives` from the request body are not persisted to `Decision.alternativesJson`. `cases.service.ts::mapDbCaseToApi` also does not map `Decision.refusalReasonsJson` back into the returned `BuybackCase`, so persisted refusal reasons are not generally visible through `GET /api/cases/:caseNumber`.

## 7. Scoring Engine

### Responsible Files and Functions

| File/function | Responsibility |
|---|---|
| `backend/src/data/scoring.config.ts::scoringConfig` | Decision thresholds, category weights, repair costs, margins. |
| `backend/src/modules/scoring/scoring.engine.ts::VALUE_MAP` | Maps known string tokens to numeric scores. |
| `backend/src/modules/scoring/scoring.engine.ts::mapValueToScore` | Converts string/number/undefined inputs into score values. |
| `backend/src/modules/scoring/scoring.engine.ts::getBuybackBaseValue` | Applies coefficient by technician-score threshold. |
| `backend/src/modules/scoring/scoring.service.ts::computeCategoryScores` | Computes section scores. |
| `backend/src/modules/scoring/scoring.service.ts::computeRepairsAndBlocking` | Adds repair items and blocking reasons. |
| `backend/src/modules/scoring/scoring.service.ts::calculateScoreForCase` | Computes weighted score, final offer, decision, explanation, and persists result. |
| `backend/src/modules/scoring/scoring.service.ts::validateManualOfferAdjustment` | Checks manual offer adjustment range and reason. |
| `backend/src/modules/scoring/scoring.routes.ts` | HTTP endpoints for score and decisions. |

### Inputs

`calculateScoreForCase(caseObj)` receives the API-mapped object from `cases.service.ts::getCaseByNumber`, not a raw Prisma model. Important fields:

| Input | Source |
|---|---|
| `caseObj.diagnosis` | Parsed from `Diagnosis.*Json` by `mapDbCaseToApi`. |
| `caseObj.preDiagnostic` | Parsed/mapped from `PreDiagnostic` and `photosJson`. |
| `caseObj.item.estimatedBasePrice` | `BuybackCase.estimatedBasePrice`, updated by identification save. |
| `caseObj.onlineEstimate` | `BuybackCase.onlineEstimate`, set on initial case creation/seed but not updated by `saveIdentification`. |
| `caseObj.customerScore` | `BuybackCase.customerScore`. |

### Categories and Weights

Configured in `scoring.config.ts`:

| Category key | Label | Weight |
|---|---|---:|
| `frameFork` | Cadre & fourche | 30 |
| `brakes` | Freins | 25 |
| `transmission` | Transmission | 25 |
| `wheelsTires` | Roues & pneus | 10 |
| `finishing` | Finitions | 10 |

Total configured weight is 100.

### Score Calculation

`computeCategoryScores(diagnosis, preDiagnostic)`:

| Category | Current formula |
|---|---|
| Frame/fork | Average of `generalCondition`, `fork`, and `shockDeformation` score, with missing `shockDeformation` treated as `100`. |
| Brakes | Average of `frontEfficiency`, `rearEfficiency`, and `padsWear`, with missing `padsWear` treated as `80`; `padsWear` containing `replace` becomes `25`, otherwise `80`. |
| Transmission | Average of `chain`, `derailleur`, and `bottomBracket`, with missing `bottomBracket` treated as `"good"`. |
| Wheels/tires | Average of `rims`, `tires`, and `hubs`. |
| Finishing | Average of `saddle`, `handlebarDirection`, and `cleanliness`. |

`mapValueToScore(v)` behavior:

| Input shape | Current behavior |
|---|---|
| number | Returned as-is. |
| undefined/null/empty | Returns `0`. |
| exact known token in `VALUE_MAP` | Returns configured value. |
| unknown string containing `good`, `excellent`, `medium`, `bad`, `out`, or `no` | Returns the corresponding heuristic score. |
| all other unknown strings | Returns `50`. |

Technician score:

```text
weighted = sum(categoryScore * configuredWeight)
technicianScore = round(weighted / max(1, totalWeight))
```

### Thresholds and Base Value

`getBuybackBaseValue(estimatedBasePrice, score)`:

| Technician score | Coefficient |
|---:|---:|
| `>= 85` | `0.70` |
| `>= 75` and `< 85` | `0.65` |
| `>= 60` and `< 75` | `0.60` |
| `>= 50` and `< 60` | `0.55` |
| `< 50` | `0` |

Boundary behavior is inclusive at `50`, `60`, `75`, and `85`.

Decision thresholds from `scoring.config.ts`:

| Condition | Decision |
|---|---|
| Any blocking reason | `refused` |
| No blocker and technician score `>= 75` | `accepted` |
| No blocker and technician score `>= 50` | `conditional` |
| No blocker and technician score `< 50` | `refused` |

Boundary behavior at `50` and `75` is inclusive.

### Blocking Criteria

`computeRepairsAndBlocking` currently adds blocking reasons when:

| Condition checked | Blocking reason |
|---|---|
| `frameFork.shockDeformation` lowercased contains `shock` or `yes` | `Cadre avec choc ou déformation` |
| `frameFork.fork` lowercased contains `out_of_service` or `out` | `Fourche hors service` |
| `finishing.handlebarDirection` lowercased contains `danger` or `bad` | `Direction dangereuse` |

Blocking criteria override a good numerical score when detected: `calculateScoreForCase` sets `finalOffer = 0` and `decision = "refused"` if `blocking.length > 0`.

Observed caveat: the frontend often sends French labels such as `"Oui — bloquant"`, `"Hors service"`, and `"HS"`. These do not necessarily contain the English tokens checked above, so the visible UI blocker can fail to become a backend blocker.

### Refurbishment Costs

Configured in `scoring.config.ts::repairCosts`:

| Code | Amount |
|---|---:|
| `brakePads` | 12 |
| `cleaning` | 8 |
| `derailleurAdjustment` | 10 |
| `tireReplacement` | 20 |
| `wheelTruing` | 15 |
| `chainReplacement` | 18 |
| `saddleReplacement` | 15 |
| `directionRepair` | 25 |

Currently triggered repairs in `computeRepairsAndBlocking`:

| Repair | Trigger |
|---|---|
| Brake pads | `brakes.padsWear` contains `replace`. |
| Cleaning | `finishing.cleanliness` contains `cleaning`. |
| Derailleur adjustment | `transmission.derailleur` contains `medium` or `bad`. |
| Chain replacement | `transmission.chain` contains `replace`. |
| Tire replacement | `wheelsTires.tires` contains `replace`. |
| Wheel truing | `wheelsTires.rims` contains `medium`. |
| Direction repair | `finishing.handlebarDirection` contains `danger` or `bad`. |

`saddleReplacement` exists in config but is not currently used by `computeRepairsAndBlocking`.

### Final Offer Calculation

`calculateScoreForCase`:

```text
baseBuybackValue = getBuybackBaseValue(
  caseObj.item.estimatedBasePrice ?? caseObj.onlineEstimate ?? 0,
  technicianScore
)

finalOffer = baseBuybackValue - repairsTotal - reconditioningMargin - riskMargin
finalOffer = round(finalOffer / 5) * 5
if blockingReasons.length > 0:
  finalOffer = 0
```

Margins:

| Margin | Current value |
|---|---:|
| `reconditioning` | 7 |
| `defaultRisk` | 0 |

There is no lower-bound clamp to zero for non-blocking cases. Therefore a final offer can become negative when base value is low or zero and repair/margin deductions are positive.

### Edge Cases

| Question | Observed current behavior |
|---|---|
| What if diagnosis exists but is incomplete? | Scoring can run. `scoring.routes.ts` only checks `if (!c.diagnosis)`, and `startDiagnosis` creates a `Diagnosis` row with all section JSON fields null. |
| What happens when fields are undefined/null? | `mapValueToScore` returns `0` for missing values; some formula terms use defaults (`shockDeformation` -> `100`, `padsWear` -> `80`, `bottomBracket` -> `"good"`). |
| Can scoring run before all diagnosis sections are completed? | Yes. It can run immediately after `POST /diagnosis/start` if a `Diagnosis` row exists. |
| Can final offer become negative? | Yes for non-blocking cases. There is no `Math.max(0, finalOffer)`. |
| Are threshold boundaries 50 and 75 handled correctly? | They are handled inclusively: `>= 75` accepted and `>= 50` conditional. |
| Can blocking criteria override a good numerical score? | Yes, when blockers are detected. Detection depends on string tokens and currently misses some French UI labels. |
| Can `GET /score` mutate data? | Yes. `scoring.routes.ts` calculates and persists a score if none exists. |
| Does pre-diagnosis fallback map cleanly into scoring? | Not fully. `computeCategoryScores` falls back to `preDiagnostic` per section, but pre-diagnostic field names (`frame`, `brakes`, etc.) do not match expected diagnostic section keys (`generalCondition`, `frontEfficiency`, etc.), so many pre-diagnostic values score as missing/default. |
| Are refusal reasons mirrored during scoring? | `calculateScoreForCase` sets `partial.refusalReasons = blocking`, but `cases.service.ts::updateCase` ignores that field. |

## 8. Current Validation and Error Handling

| Rule | Location | Current behavior | Potential missing case |
|---|---|---|---|
| JSON request parsing | `app.ts::express.json()` | Parses JSON bodies. | Default body-size/error behavior only; malformed JSON becomes generic Express error through handler. |
| CORS origins | `app.ts::allowedOrigins` | Allows localhost/127.0.0.1 ports 5173 and 5174 only. | Vite can choose another port; no production origin config. |
| Central ApiError handling | `app.ts` error middleware; `ApiError.ts` | Returns `status`, `message`, `details`. | No error codes/request IDs; Prisma errors become generic 500. |
| Zod error handling | `app.ts` error middleware | Returns 400 `Données invalides`. | Most routes use `safeParse` manually instead of throwing `ZodError`; body schemas are absent for decision routes. |
| Case creation schema | `cases.schemas.ts::NewCaseSchema`, `cases.routes.ts` | Requires customer and item with article type/category/brand/model/year/frameSize/serial/estimated price subset. | Minimal in-store branch can bypass schema; no email/phone/year/price bounds beyond type. |
| Minimal in-store creation | `cases.routes.ts`, `cases.service.ts::createCaseMinimal` | If invalid body has `withoutPreDiagnostic` or `source: "in_store"`, creates a sparse case. | If a partial invalid `customer` object is supplied, Prisma may fail required fields; no domain validation. |
| Case existence | `diagnostics.service.ts::ensureCaseExists`, cases/scoring routes | Missing cases return 404 ApiError. | No authorization check for who can view/mutate the case. |
| Diagnosis must be started before saves | `diagnostics.service.ts::saveIdentification`, `saveStep` | If no `Diagnosis` row, returns 400 `Diagnostic non démarré`. | Does not enforce ordered section completion. |
| Identification shape | `diagnostics.schemas.ts::IdentificationSchema` | Requires articleType, brand, model, year, frameSize, serialNumber, estimatedBasePrice at type level. | No enum for category, no year range, no exact serial-number normalization. |
| Identification business checks | `diagnostics.service.ts::saveIdentification` | Requires bike category, brand/model/year/frameSize, serial number with at least 10 digits, price > 0. | Does not update `onlineEstimate`; accepts arbitrary article categories and string labels. |
| Frame/fork schema | `diagnostics.schemas.ts::FrameForkSchema` | Requires `generalCondition` and `fork`; other fields optional. | No enum; French labels and internal scoring tokens are not normalized. |
| Brakes/transmission/wheels/finishing schemas | `diagnostics.schemas.ts` | All or nearly all fields optional strings. | Empty object can be valid for several sections; no completion guarantee. |
| Score precondition | `scoring.routes.ts` | Requires only `c.diagnosis` exists. | Does not require identification or all diagnosis sections. |
| Manual adjustment bounds | `scoring.service.ts::validateManualOfferAdjustment` | Allows +/-15% around suggested offer; reason required if adjusted. | Accept route body is not parsed with Zod; `undefined`/non-number runtime values can reach Prisma. |
| Accept requires scoring | `scoring.routes.ts` accept route | Returns 400 `Scoring manquant` if no scoring. | Does not prevent accepting a `refused` scoring result. |
| Refusal body | `scoring.routes.ts` refuse route | Uses `body.reasons ?? []` and returns request alternatives. | Does not validate reasons/alternatives; does not persist alternatives; does not require scoring. |
| Prisma constraints | `schema.prisma`, migration SQL | Enforces PKs, unique `caseNumber`, unique child `caseId`, required FKs, cascade deletes for child records. | No DB enums, no check constraints for score ranges, offers, statuses, or non-negative prices. |
| JSON parsing | `cases.service.ts::mapDbCaseToApi`, `diagnostics.service.ts::getDiagnosis/startDiagnosis` | Parses JSON string columns directly. | Invalid JSON in DB would throw and become a 500. |

## 9. Mock Data vs Real Database Data

### Data Source by Module

| Area | Current source | Evidence | Notes |
|---|---|---|---|
| Case list/detail/create | Prisma/SQLite | `cases.service.ts::listCasesCompact`, `getCaseByNumber`, `createCase`, `createCaseMinimal` | Real DB path. |
| Diagnosis start/save/get | Prisma/SQLite | `diagnostics.service.ts` | Real DB path with JSON string columns. |
| Scoring calculation/persistence | Prisma/SQLite plus static config | `scoring.routes.ts`, `scoring.service.ts`, `cases.service.ts::updateCase`, `scoring.config.ts` | Input from DB-mapped case; score persisted to `ScoreResult`. |
| Decisions | Prisma/SQLite | `scoring.routes.ts`, `cases.service.ts::setFinalOffer`, `setRefusal` | Real DB path, but no transactions. |
| KPIs | Mock/in-memory | `kpis.service.ts` imports `CASES` from `data/cases.mock.ts` | Does not reflect DB changes. |
| Catalog | Unused mock | `data/catalog.mock.ts` exports `CATALOG`; no imports found. | Dead/unused current source. |
| Frontend home fallback | Static array | `App.tsx::DOSSIERS` | Used if API fails or API returns empty list. |
| Frontend summary | Static array | `App.tsx::CATEGORIES` | Does not render actual `score.categoryScores`. |
| Frontend price details | Static array | `App.tsx::PRICE_LINES` | Does not render actual `score.priceBreakdown` or `repairCosts`. |
| QR scan | Hardcoded case | `Screen2::handleSimulate` | Always opens `DEC-00487`. |

### Current SQLite vs Seed vs Mock

`backend/prisma/seed.ts` creates 3 cases: `DEC-00487`, `DEC-00481`, and `DEC-00479`.

`backend/src/data/cases.mock.ts` contains 4 entries, including `DEC-00488`, `DEC-00481`, `DEC-00479`, and `DEC-00487`, with duplicate `id: "case_1"` for two entries.

Read-only query of the current local `backend/prisma/dev.db` found:

| Table | Row count |
|---|---:|
| `Customer` | 32 |
| `BuybackCase` | 32 |
| `PreDiagnostic` | 3 |
| `Diagnosis` | 11 |
| `ScoreResult` | 6 |
| `Decision` | 8 |

The git worktree also reports `M backend/prisma/dev.db`, so the current local database diverges from the committed database file and from `seed.ts`.

Main inconsistency: API case/diagnosis/scoring changes persist to SQLite, but `GET /api/kpis/summary` continues to report metrics from the static mock array.

## 10. Testing Current State

No tests were created during this audit.

Repository scan results:

| Item searched | Current result |
|---|---|
| `*.test.*`, `*.spec.*` source files | None found outside dependency folders. |
| Jest/Vitest/Cypress/Playwright/Supertest/testing-library references | None in project package manifests/locks or source files. |
| Backend `test` script | None in `backend/package.json`. |
| Frontend `test` script | None in `DecathProto/package.json`. |
| CI config | No `.github` or project CI workflow found. |
| Coverage setup | `.gitignore` ignores `coverage`, but no coverage tool/script is configured. |
| Test report generation | Not currently available because no test runner/script exists. |

Available quality/build-adjacent script:

| Command | Current behavior |
|---|---|
| `cd backend && npm run typecheck` | Fails with TS6059 because `backend/prisma/seed.ts` is included by default but `tsconfig.json` has `rootDir: "src"`. |

Automated test coverage is currently zero at the project level.

## 11. Build and Deployment

### Documented Local Launch

Root `README.md` documents:

```bash
cd backend
npm install
npm run dev

cd DecathProto
npm install
npm run dev
```

Backend `README.md` documents the same backend startup and lists the main endpoints.

Frontend `README.md` is the Figma Make generated README and only says to run `npm i` and `npm run dev`.

### Backend Scripts

From `backend/package.json`:

| Script | Command | Current assessment |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Development server for port 4000 by default. |
| `start` | `node dist/server.js` | Requires built `dist`; local `dist` exists but is ignored and can be stale. |
| `build` | `tsc` | Expected to fail for the same rootDir/include reason seen in `npm run typecheck`. |
| `typecheck` | `tsc --noEmit` | Currently fails with TS6059 on `prisma/seed.ts`. |
| `db:generate` | `prisma generate` | Generates Prisma client. |
| `db:migrate` | `prisma migrate dev` | Applies dev migration. |
| `db:seed` | `tsx prisma/seed.ts` | Deletes all data and creates 3 demo cases. |
| `db:reset` | `prisma migrate reset --force` | Destructive DB reset. |

Backend environment/config:

| Config | Current state |
|---|---|
| Port | `process.env.PORT` or `4000` in `server.ts`. |
| Database URL | Hardcoded in Prisma schema as `file:./dev.db`; no `DATABASE_URL` use. |
| CORS | Hardcoded allowed local Vite origins in `app.ts`. |
| Authentication secrets | None. |

### Prisma Initialization

Prisma schema uses SQLite and points to `backend/prisma/dev.db`. Migrations exist under `backend/prisma/migrations/20260618131614_init/migration.sql`.

The README does not document `npm run db:migrate`, `npm run db:seed`, or `npm run db:generate`. A clean clone currently includes `backend/prisma/dev.db` because it is tracked, but if the DB is missing or reset, a developer must discover and run the Prisma scripts manually.

### Frontend Scripts

From `DecathProto/package.json`:

| Script | Command | Current assessment |
|---|---|---|
| `dev` | `vite` | Starts Vite frontend. |
| `build` | `vite build` | Builds frontend assets; no explicit typecheck script. |

Frontend environment/config:

| Config | Current state |
|---|---|
| API base URL | `api.ts` uses `import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"`. |
| Env example | `.env.example` is at repo root. Vite running from `DecathProto` will not automatically read repo-root `.env` unless configured or copied; fallback hides this in local dev. |
| Vite config | `vite.config.ts` sets React and Tailwind plugins, `@` alias to `src`, asset includes for SVG/CSV, and a Figma asset resolver. |
| Deployment config | None found. |

### Can a Clean Machine Launch Reliably?

Development launch is plausible but not fully reliable/documented:

```bash
# backend
cd backend
npm install
npm run dev

# optional but currently undocumented when DB needs reset/init
npm run db:migrate
npm run db:seed

# frontend
cd ../DecathProto
npm install
npm run dev
```

Known launch/deployment gaps:

| Gap | Evidence |
|---|---|
| Backend build/typecheck fails | `npm run typecheck` failed with TS6059 due `seed.ts` outside `rootDir`. |
| Production backend start depends on ignored `dist` | `backend/package.json::start` uses `dist/server.js`; `dist/` is ignored in `.gitignore`. |
| Database initialization is under-documented | Prisma scripts exist but READMEs do not instruct migrate/seed/generate. |
| SQLite database is tracked and locally dirty | `git status --short` reports `M backend/prisma/dev.db`. |
| Frontend API env file is placed at repo root | `.env.example` exists at root; Vite project root is `DecathProto`. |
| CORS is localhost-specific | `app.ts::allowedOrigins` only lists ports 5173 and 5174. |
| No deployment target | No Docker, hosting, Procfile, CI, or production env docs found. |
| Frontend metadata still generic | `DecathProto/index.html` title/description remain "Code Quality Improvement". |

## 12. Git / Project Organization

Git metadata is available.

| Item | Current value |
|---|---|
| Current branch | `feature/web` |
| Remote | `origin https://github.com/damienn7/workshop-dcn.git` |
| Current worktree | `M backend/prisma/dev.db`; ignored `.env`, `dist/`, and `node_modules/` folders. |
| Other visible branch | `feature/mobile` exists locally/remotely in log. |

Recent commits:

```text
6e73394 updated style in home page
76893c7 updated style of the home page
a2b6092 updated style in layout.css and variables.css
3210fd3 add price field
d9fdca2 fix(buttonCreateDiagWithoutPreDiag)
e0955f1 add db support with prisma
13d3954 add new diag without pre diag
0b7539d add pertt diagram
abeb1e3 updated frontend
40dade9 add backend api
bf655ce feat(react): add front-end
cee4e8e Initial commit
```

The history shows an initial frontend, backend API, Prisma DB support, and later style/frontend iterations. No history was modified during this audit.

## 13. Technical Debt / Architecture Risks

| Severity | Finding | Evidence/file | Consequence | Recommended future action |
|---|---|---|---|---|
| CRITICAL | No authentication, authorization, or RBAC protects customer data or case mutations. | `backend/src/app.ts` mounts all routers directly; no auth middleware exists. | Anyone reaching the API can read PII, alter diagnosis, score, accept, or refuse cases. | Add authentication, employee roles, authorization checks, and audit logging before production use. |
| CRITICAL | Scoring can run on an incomplete diagnosis. | `scoring.routes.ts` only checks `c.diagnosis`; `diagnostics.service.ts::startDiagnosis` creates an empty row. | Offers/decisions can be generated from missing/default values. | Add explicit diagnosis completion validation before scoring. |
| HIGH | `GET /api/cases/:caseNumber/score` can mutate the database. | `scoring.routes.ts` calls `calculateScoreForCase` from the GET route when no score exists. | Safe/idempotent GET semantics are broken; cache/retry/crawler behavior can create scores. | Make GET read-only; keep calculation on POST. |
| HIGH | Frontend diagnosis labels do not match backend scoring tokens. | `App.tsx::Screen5`-`Screen9`; `scoring.service.ts::computeRepairsAndBlocking`; `scoring.engine.ts::VALUE_MAP`. | Visible blockers/repairs may not affect score or final offer. | Send stable enum codes from UI and validate enums server-side. |
| HIGH | KPIs use mock data while main workflow uses Prisma. | `kpis.service.ts` imports `CASES`; cases/diagnostics/scoring services use Prisma. | KPI dashboard can be wrong after real workflow operations. | Rebuild KPI service on Prisma queries. |
| HIGH | No automated tests or test runner are configured. | No test files/scripts/dependencies found. | Scoring, API, persistence, and UI regressions are unguarded. | Add prioritized unit/integration/E2E test suite. |
| HIGH | Backend build/typecheck currently fails. | `backend/tsconfig.json`; `npm run typecheck` TS6059 for `prisma/seed.ts`. | Production build path is unreliable; `npm start` depends on stale ignored `dist`. | Fix TypeScript include/rootDir or separate seed tsconfig; validate CI build. |
| HIGH | Multi-write score/decision operations are not transactional. | `scoring.routes.ts` accept route; `cases.service.ts::updateCase`, `setRefusal`. | Partial writes can leave `Decision`, `ScoreResult`, and `BuybackCase` inconsistent. | Use Prisma transactions for state changes spanning multiple tables. |
| HIGH | Final offer can become negative. | `scoring.service.ts::calculateScoreForCase` subtracts costs/margins and rounds without lower clamp. | Refused or low-value bikes can show invalid negative offers. | Add business rule for minimum offer and tests. |
| HIGH | Validation is weak for most diagnosis sections. | `diagnostics.schemas.ts` has optional free-text fields and no enums for most sections. | Empty/arbitrary payloads can be persisted and scored. | Define canonical DTOs/enums and completion rules. |
| HIGH | JSON is stored as strings and parsed without safety. | `schema.prisma`; `cases.service.ts::mapDbCaseToApi`; `diagnostics.service.ts::getDiagnosis`. | Invalid JSON causes 500s; DB cannot validate nested fields. | Consider normalized fields or guarded JSON parsing with schema validation. |
| MEDIUM | Refusal reasons/alternatives persistence/API mapping is incomplete. | `cases.service.ts::setRefusal`; `mapDbCaseToApi`; `scoring.routes.ts` refusal route. | Persisted refusal details are not reliably returned to frontend; alternatives are not stored. | Map `Decision` fields into API DTO and persist alternatives. |
| MEDIUM | Hardcoded localhost API/CORS configuration. | `api.ts`, `app.ts::allowedOrigins`, `.env.example`. | Non-local deployments or Vite fallback ports can fail. | Move API/CORS config to environment variables and docs. |
| MEDIUM | Current-case frontend store is in-memory only. | `currentCase.ts`; `App.tsx::App` initializes `screen = 0`. | Refresh loses workflow state; deep-linking impossible. | Use route params and fetch case state from backend on load. |
| MEDIUM | Random case-number generation has no collision handling. | `cases.service.ts::createCase`, `createCaseMinimal`. | Prisma unique constraint can cause 500 on rare collision. | Use deterministic sequence or retry on unique conflict. |
| MEDIUM | `Diagnosis.completedAt` is never set. | `schema.prisma`; only `startedAt` is updated in `diagnostics.service.ts`; grep found no diagnosis completion update. | KPI/analytics cannot calculate real diagnosis duration from DB. | Mark completion when all sections are saved. |
| MEDIUM | Documentation lags implementation. | `backend/README.md` says data is mocked; Prisma code exists. | Engineers may design tests/setup against wrong architecture. | Update READMEs after architecture decisions are finalized. |
| MEDIUM | Tracked SQLite DB diverges from seed data. | `git status --short`; read-only SQLite counts; `seed.ts`. | Reproducibility depends on local binary DB state. | Stop tracking mutable dev DB or document seed/reset workflow. |
| MEDIUM | Excessive `any` weakens TypeScript guarantees. | `cases.service.ts`, `diagnostics.service.ts`, `scoring.service.ts`, `api.ts`, `env.d.ts`. | Runtime payload mismatches pass compilation. | Replace `any` with Prisma payload types and shared DTO schemas. |
| LOW | Unused `catalog.mock.ts` remains. | `backend/src/data/catalog.mock.ts`; no imports found. | Confusing dead source. | Remove or wire intentionally later. |
| LOW | Frontend contains static prototype copy and generic metadata. | `App.tsx::CATEGORIES`, `PRICE_LINES`; `DecathProto/index.html`. | Demo can contradict live backend state. | Render actual score/decision DTOs and update metadata. |

## 14. RNCP BC4 Mapping

| Competency | Existing evidence | Missing evidence | Recommended proof for oral |
|---|---|---|---|
| C4.1 - Conditions of access to data | CORS restriction in `app.ts`; Prisma relations in `schema.prisma`; central API routes. | Authentication, authorization/RBAC, access-control policy, audit logs, data privacy controls. | Present the route map and explicitly explain that access control is currently absent, then show the target middleware/RBAC design. |
| C4.3 - Test suite / acceptance testing | No implemented test suite. `pertt.md` plans tests, but this is not implementation. | Unit/API/DB/frontend/E2E tests, CI execution, coverage/report artifacts. | Use this audit to justify the next testing strategy; do not claim tests already exist. |
| C4.5 - API and database integration | Express routes in `app.ts`; Prisma services in `cases.service.ts`, `diagnostics.service.ts`, `scoring.service.ts`; migration and schema in `backend/prisma/`. | Consistent KPI DB integration, transactions, stronger validation, production DB config. | Demo a real API call mutating SQLite, then show Prisma model relationships and endpoint table. |
| C4.8 - Deployment | Local dev scripts in both package manifests; backend `start`/`build` scripts; frontend Vite build script. | Reliable backend build, production env docs, deployment target, Docker/hosting config, production CORS/API base configuration. | Show current local launch procedure and the failing backend typecheck/build gap honestly. |
| C4.9 - Version control | Git branch `feature/web`; remote origin; meaningful commits for frontend, backend, Prisma, style; migration tracked. | Clean worktree, CI/PR conventions, strategy for mutable DB file. | Show `git log`, current branch, and note the dirty `backend/prisma/dev.db` as a repository hygiene issue. |
| C4.10 - Technical audit | This `ARCHITECTURE_CURRENT_STATE.md` documents architecture, endpoints, model, risks, tests, and RNCP mapping. | Remediation plan and implemented fixes/tests. | Use this report as the audit artifact; distinguish observed state from future recommendations. |

## 15. Testing Targets for Next Step

Do not implement these in this step; they are proposed targets for future work.

| Priority | Component/function to test | Reason | Suggested technology |
|---|---|---|---|
| P0 | `scoring.engine.ts::getBuybackBaseValue` | Deterministic threshold logic at 50, 60, 75, 85. | Vitest unit tests. |
| P0 | `scoring.engine.ts::mapValueToScore` | Central value mapping, unknown strings, null/undefined handling, French label mismatch characterization. | Vitest unit tests. |
| P0 | `scoring.service.ts::calculateScoreForCase` | Core business rules: weights, blockers, repairs, negative offer, incomplete diagnosis behavior. | Vitest with mocked persistence or extracted pure calculator. |
| P0 | `POST /api/cases/:caseNumber/diagnosis/start` and diagnosis PUT routes | Validates persistence, "not started" errors, case-not-found errors, section payload behavior. | Supertest + Prisma test database. |
| P0 | `POST /api/cases/:caseNumber/score` | Verifies score persistence, diagnosis precondition, incomplete diagnosis current behavior, blocker override. | Supertest + Prisma test database. |
| P0 | Decision accept/refuse endpoints | Validates scoring requirement, manual adjustment bounds/reason, persisted status/final offer/refusal reasons. | Supertest + Prisma test database. |
| P0 | Full technician acceptance workflow | Protects the main acceptance path end to end from case open to accepted decision. | Playwright E2E against seeded local backend. |
| P1 | Full refusal/blocker workflow | Ensures a visible blocking diagnosis actually becomes refused with offer 0. | Playwright E2E + API assertions. |
| P1 | `cases.service.ts::mapDbCaseToApi` | JSON parse/mapping correctness for diagnosis, score, decision/refusal fields. | Vitest integration/unit with fixtures. |
| P1 | Prisma model relations and seed | Verifies one-to-one relations, cascade expectations, seed reproducibility. | Prisma integration tests with temp SQLite DB. |
| P1 | `kpis.service.ts::getKpisSummary` after DB rewrite | KPIs must reflect persisted cases, not mocks. | Vitest/Supertest + test DB. |
| P1 | `App.tsx::Screen1` API states | Home loading/error/fallback behavior is the entry point of the UI. | React Testing Library + Vitest. |
| P1 | `App.tsx` diagnosis save screens | Ensures save buttons call correct `diagApi` methods, update current case, and navigate. | React Testing Library + mocked `diagApi`. |
| P1 | `currentCase.ts` | Simple in-memory store behavior and subscription cleanup. | Vitest unit tests. |
| P2 | Build smoke checks | Prevent backend typecheck/build and frontend build regressions. | CI scripts: `npm run typecheck`, `npm run build`; frontend `vite build`. |
| P2 | API contract/schema validation | Ensures frontend DTOs and backend schemas stay aligned. | Zod shared schemas or generated OpenAPI tests. |

Top priority sequence for the next step:

```text
1. Scoring engine unit/characterization tests.
2. Diagnosis API integration tests.
3. Scoring API integration tests.
4. Decision API persistence tests.
5. One Playwright acceptance flow over seeded data.
```

