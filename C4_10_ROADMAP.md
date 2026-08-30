# C4.10 — Production-Readiness Roadmap

Evidence date: 2026-08-30.

This roadmap is dimensioned for one developer already familiar with the repository. Estimates are relative planning sizes, not delivery commitments.

Effort scale:

- XS: less than 0.5 day.
- S: 0.5 to 1 day.
- M: 1 to 3 days.
- L: 3 to 5 days.
- XL: more than 5 days.

## P0 — Before Handling Real Users/Data

| ID | Recommendation | Effort | Dependencies | Acceptance criterion |
|---|---|---:|---|---|
| AUTH-001 | Implement authenticated staff sessions. | L | Access-policy decision, staff identity source. | Anonymous API calls return 401; authenticated sessions can access authorized routes. |
| AUTH-002 | Add server-side RBAC for diagnosis, scoring and decision endpoints. | M/L | AUTH-001, role matrix. | Unauthorized roles receive 403; tests cover seller/manager/admin permissions. |
| SEC-001 | Protect personal data technically. | M | AUTH-001, production hosting choice. | Logs avoid request bodies/PII; sensitive actions have audit records; backup access is restricted. |
| DEP-001 | Resolve known dependency advisories without breaking tests. | S/M | Test suite, dependency review. | `npm audit --omit=dev --audit-level=low` passes or remaining advisories are explicitly risk-accepted. |

## P1 — Before Pilot Deployment

| ID | Recommendation | Effort | Dependencies | Acceptance criterion |
|---|---|---:|---|---|
| DATA-001 | Move `/api/kpis/summary` from mock data to Prisma aggregation. | M | KPI definitions. | KPI integration tests create DB rows and assert totals/rates from persisted data. |
| DATA-002 | Add Prisma transactions around score and decision workflows. | M | Current persistence tests. | Tests prove score/result/status/decision stay consistent if one operation fails. |
| API-001 | Make `GET /api/cases/:caseNumber/score` read-only. | S | Frontend flow check. | GET never creates or updates rows; POST remains the scoring action. |
| DB-001 | Define and implement pilot database target. | L/XL | Hosting target, migration plan. | Pilot environment uses PostgreSQL or managed relational DB with migrations, backup and restore check. |
| OPS-001 | Add production observability basics. | M | Hosting target. | Structured request logs, request IDs, error logs, health/readiness checks and basic metrics exist. |
| OPS-002 | Externalize secrets and environment configuration. | M | Hosting target. | No secrets in Git/Compose files; runtime config comes from platform secret manager or controlled env. |

## P2 — Scalability And Maintainability

| ID | Recommendation | Effort | Dependencies | Acceptance criterion |
|---|---|---:|---|---|
| FE-001 | Replace static frontend scoring/price/final texts with backend DTO data. | M | DTO contract review. | Screens 10-13 display persisted score, price breakdown, alternatives and customer data for any case. |
| FE-002 | Split `App.tsx` into screens, hooks and domain helpers. | M/L | Stable E2E coverage. | Each screen has its own module; E2E workflow still passes. |
| API-002 | Publish a shared API contract. | M | Zod/OpenAPI strategy. | Frontend DTOs are generated or shared; contract drift is caught in CI. |
| DATA-003 | Normalize high-value analytical fields. | L | KPI requirements, DB target. | Reporting-critical diagnosis/decision fields are queryable without JSON string parsing. |
| QUAL-001 | Reduce critical `any` usage. | M | API contract and data mapper strategy. | Main DB/API mappers use typed Prisma payloads and Zod-inferred DTOs. |
| QA-001 | Add linting, formatting and CI gates. | S/M | Repo CI provider. | Pull requests run install, lint, typecheck, unit/integration tests, E2E smoke and dependency audit. |

## P3 — Optimization

| ID | Recommendation | Effort | Dependencies | Acceptance criterion |
|---|---|---:|---|---|
| PERF-001 | Add pagination/filtering to case list. | S/M | Real list volume. | `GET /api/cases` supports limit/page or cursor and does not load unbounded history. |
| PERF-002 | Add selected indexes after KPI/query analysis. | S/M | DATA-001, DB target. | Query plans for common filters use appropriate indexes. |
| UX-001 | Improve offline/error/retry UX for store network interruptions. | M | Product decision. | API failure states distinguish unavailable API, validation errors and retryable network failures. |
| DOC-001 | Refresh stale backend README statements. | XS | Current architecture docs. | README no longer implies all data is mock-backed. |

## Priority Summary

```text
P0: make real data safe.
P1: make pilot data reliable and operable.
P2: make the codebase easier to evolve.
P3: optimize once usage volume and pilot feedback are known.
```
