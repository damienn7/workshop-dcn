# C4.3 — Final Test & Acceptance Report

## 1. Initial Situation

The original workshop version did not provide an automated acceptance evidence layer. The main user scenarios existed conceptually around the Decathlon buyback workflow, but they were not materialized as executable tests that could prove behavior, reveal defects, or prevent regressions.

## 2. Implemented Testing Strategy

```text
Business rules
    |
    v
Vitest
    |
    v
API / persistence
    |
    v
Supertest + Prisma + isolated SQLite
    |
    v
User acceptance
    |
    v
Playwright
```

The strategy starts with deterministic scoring rules, then validates HTTP and database persistence, then executes the complete technician workflow through the React interface.

## 3. Test Coverage

Covered use cases:

- scoring thresholds and value mappings ;
- blocking criteria ;
- incomplete diagnosis rejection ;
- non-negative final offer ;
- diagnosis start and section persistence ;
- scoring persistence ;
- accepted decision persistence ;
- refused decision persistence ;
- manual adjustment validation ;
- complete end-to-end technician workflow.

## 4. Baseline Findings

The baseline tests detected five confirmed defects:

- scoring was allowed on incomplete diagnoses ;
- final offers could become negative ;
- `no_shock` was wrongly treated as a frame shock ;
- the French UI label `Oui — bloquant` was not recognized as blocking ;
- refusal reasons and alternatives were not fully persisted and exposed.

## 5. Corrective Actions

| Defect | Atomic fix commit |
|--------|-------------------|
| Incomplete diagnosis scoring | `0844c79 fix: reject scoring for incomplete diagnoses` |
| Negative final offer | `e939db3 fix: prevent negative buyback offers` |
| UI/scoring value mismatch | `4850c06 fix: align diagnosis values with scoring rules` |
| Refusal persistence/exposure | `195307e fix: persist and expose refusal decision details` |

## 6. Non-Regression

Fresh final validation:

- backend tests: 69 PASS ;
- backend typecheck: PASS ;
- frontend build: PASS ;
- Playwright E2E: 2 PASS ;
- remaining failures: 0.

Remaining non-blocking warnings:

- Vite CSS minify warning on `.photo-placeholder .text-[10px]` ;
- Playwright web server warning about `NO_COLOR` being ignored because `FORCE_COLOR` is set.

## 7. Final Evidence

Evidence files:

- `C4_3_TEST_PLAN.md` ;
- `C4_3_RECETTE.md` ;
- `C4_3_DEFECTS.md` ;
- `C4_3_GIT_EVIDENCE.md` ;
- `C4_3_PPT_SUMMARY.md` ;
- automated test files under `backend/src` and `DecathProto/e2e`.

## 8. RNCP C4.3 Mapping

The evidence answers C4.3 because:

- a test suite is present and executable ;
- the suite covers business rules, API persistence and user workflows ;
- tests were executed and results are documented ;
- defects detected by recette were corrected ;
- the original failing tests remain as non-regression evidence ;
- final validation proves the corrected behavior is stable.
