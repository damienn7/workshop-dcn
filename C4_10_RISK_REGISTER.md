# C4.10 — Risk Register

Evidence date: 2026-08-30.

Scope: backup risk matrix for the C4.10 technical audit. No corrections were implemented during this task.

Severity uses impact × likelihood:

- CRITICAL: immediate severe impact under current exposure.
- HIGH: production blocker before real customer/business data.
- MEDIUM: important pilot/production risk or data-quality risk.
- LOW: maintainability or hygiene issue with limited immediate exposure.

| ID | Risk | Evidence | Severity | Probability | Impact | Recommendation | Priority |
|---|---|---|---|---|---|---|---|
| C410-SEC-001 | Unauthenticated API access | No auth/RBAC middleware in `backend/src/app.ts`; no auth dependencies in `backend/package.json`. | HIGH | High if exposed beyond local demo | Personal data and commercial decisions can be read or modified. | Add authenticated staff sessions and route-level RBAC. | P0 |
| C410-SEC-002 | Personal data not production-protected | `Customer` stores names, phone and email; no audit trail or access policy in code. | HIGH | High before real deployment | Privacy, accountability and data access risks. | Add access policy, audit trail, logging minimization and protected backups. | P0 |
| C410-SEC-003 | Known dependency vulnerabilities | `npm audit`: backend 7 total, frontend 5 total; production-only audit still flags backend low and frontend high. | MEDIUM | Medium | Known advisories remain unresolved. | Upgrade/remove vulnerable dependencies in a dedicated security task. | P0/P1 |
| C410-SEC-004 | Limited request/security hardening | Express uses `express.json()` and CORS; no visible rate limiting, request-size policy or security headers. | MEDIUM | Medium if public | Increased DoS and browser-facing hardening risk. | Add request limits, rate limiting, `helmet` or equivalent, and ingress controls. | P1 |
| C410-DATA-001 | KPIs read mock data | `backend/src/modules/kpis/kpis.service.ts` imports `CASES` from `cases.mock.ts`. | HIGH | Certain | KPI dashboard can contradict real database records. | Rebuild KPI aggregation with Prisma queries and DB-backed tests. | P1 |
| C410-DATA-002 | SQLite production scalability limit | Prisma provider is SQLite; C4.8 stores one `/app/data/app.db` volume. | MEDIUM now, HIGH before production | High as users increase | Concurrency, backup and horizontal scaling limits. | Migrate pilot/production to PostgreSQL or managed relational DB. | P1 |
| C410-DATA-003 | JSON strings limit analytics | Diagnosis/scoring/decision details stored in `*Json` text columns. | MEDIUM | High | Difficult filtering, indexing, validation and reporting. | Normalize high-value analytical fields; keep flexible JSON for low-value details. | P2 |
| C410-DATA-004 | Partial state from multi-record writes | No `$transaction` found; score/decision flows write multiple records. | MEDIUM | Medium | Score, decision and case status can diverge on failure. | Wrap critical multi-record operations in Prisma transactions. | P1 |
| C410-API-001 | GET score can mutate data | `GET /api/cases/:caseNumber/score` calls `calculateScoreForCase()` when missing. | MEDIUM | Medium | Violates read-only GET expectations and can surprise caches/clients. | Make GET read-only; keep calculation on POST. | P1 |
| C410-FE-001 | Static frontend values can diverge | `App.tsx` contains `DOSSIERS`, `CATEGORIES`, `PRICE_LINES`, hardcoded `DEC-00487`, fixed offer/email text. | MEDIUM | High | Store employee may see display values not matching persisted state. | Bind displays to backend DTOs; move demo fixtures behind explicit demo mode. | P1/P2 |
| C410-QUAL-001 | Large frontend component | `DecathProto/src/app/App.tsx` is 1725 lines. | MEDIUM | High | Slower review, more regression risk, harder test isolation. | Split screens, hooks and shared UI/domain helpers. | P2 |
| C410-QUAL-002 | Type safety weakened by `any` | Source scan found 66 `any` tokens and 46 `unknown` tokens. | LOW/MEDIUM | High | DTO/schema drift can escape compile-time checks. | Replace key `any` with Prisma/Zod-inferred types and typed JSON parsing. | P2 |
| C410-OPS-001 | Minimal observability | Only startup `console.log` and error `console.error`; no structured logs/metrics/audit events. | MEDIUM | Medium | Production incidents and decision traceability are hard to investigate. | Add structured logs, request IDs, metrics, alerts and business audit events. | P1/P2 |
| C410-QA-001 | Missing lint/CI quality gate | Package scripts include tests/build/typecheck/E2E but no lint script. | LOW | Medium | Style/unused-code regressions rely on manual review. | Add ESLint/Prettier, CI checks and dependency scanning. | P2 |
| C410-OPS-002 | Compose is a prototype deployment, not final production hosting | C4.8 deployment uses local Docker Compose and SQLite volume. | MEDIUM | High before production | Secrets, TLS, scaling and backup operations remain incomplete. | Move to managed container/PaaS target with secret manager and backups. | P1 |

## Top Risks Before Real Data

| Rank | Risk | Why it comes first |
|---:|---|---|
| 1 | No authentication/RBAC | It directly exposes personal and commercial operations if the API is reachable. |
| 2 | Personal data controls incomplete | Customer identity data requires access, logging and retention controls. |
| 3 | KPI mock source | Data exploitation is unreliable while indicators are not database-backed. |
| 4 | Production database suitability | SQLite is good for proof, not for multi-user production operations. |
| 5 | Multi-record writes not transactional | Commercial decisions should not end in partial persisted states. |
