# C4.3 - Git Evidence

## Branch

Work was performed on `rattrapage-bc4`.

Protected branches were not modified:

- `workshop-final` ;
- `feature/web`.

## C4.3 sequence

Log captured before the final documentation commit:

```text
457e63e docs: add current architecture audit
195307e fix: persist and expose refusal decision details
4850c06 fix: align diagnosis values with scoring rules
e939db3 fix: prevent negative buyback offers
0844c79 fix: reject scoring for incomplete diagnoses
a447e26 test: cover complete technician buyback workflow
ee55ede test: setup end-to-end acceptance testing
f78f885 docs: add C4.3 baseline recette
c699dea test: cover scoring and decision API flows
24365f1 test: cover diagnosis API persistence flow
959f3da test: add scoring acceptance scenarios
c2d9162 test: cover scoring engine rules and boundaries
81ac40a test: setup isolated backend test infrastructure
```

## Progression

| Step | Commit | Evidence |
|------|--------|----------|
| Current-state audit | `457e63e` | Documents the application architecture used to design the test strategy |
| Test infrastructure | `81ac40a` | Vitest, Supertest, isolated SQLite test helpers |
| Scoring characterization | `c2d9162` | Unit coverage for deterministic scoring helpers |
| Business acceptance baseline | `959f3da` | Expected business scenarios and initial failing defect tests |
| Diagnosis API tests | `24365f1` | HTTP + Prisma persistence coverage for diagnostic steps |
| Scoring and decision API tests | `c699dea` | Score, accept, refusal and adjustment flows |
| Baseline recette docs | `f78f885` | C4.3 plan, recette and defect register |
| E2E infrastructure | `ee55ede` | Playwright config, deterministic E2E DB reset and smoke test |
| Main E2E workflow | `a447e26` | Complete technician journey from case opening to accepted decision |
| Fix incomplete diagnosis scoring | `0844c79` | Previously failing incomplete-diagnosis tests pass |
| Fix negative offers | `e939db3` | Previously failing negative-offer test passes |
| Fix UI/scoring value mismatch | `4850c06` | `no_shock` and French blocking label tests pass |
| Fix refusal decision details | `195307e` | Refusal reasons and alternatives are persisted/exposed |

## Evidence for C4.3 and C4.9

The history shows that tests preceded the corresponding fixes:

- defects were first captured in `959f3da` and `c699dea` ;
- fixes were then implemented in separate commits `0844c79`, `e939db3`, `4850c06` and `195307e` ;
- final validation proves the same tests now pass.

This supports C4.3 because it provides executable recette evidence, and C4.9 because the commit history is atomic, traceable and explainable.

## Repository hygiene

`backend/prisma/dev.db` is intentionally not committed. Temporary SQLite databases, Playwright reports and test output folders are ignored.
