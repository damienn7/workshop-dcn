# C4.9 — Git Versioning Evidence

Evidence date: 2026-08-30.

Scope: versioning evidence and documentation only. No application behavior was changed for C4.9.

Safety point: `backend/prisma/dev.db` was already locally modified before this work. It was not staged, committed, reset, deleted or edited for C4.9.

## 1. Repository

| Item | Evidence |
|---|---|
| Versioning tool | Git |
| Remote hosting | GitHub remote configured locally |
| Remote URL | `https://github.com/damienn7/workshop-dcn.git` |
| Current branch | `rattrapage-bc4` |
| Original workshop branch | `feature/web` |
| Baseline tag | `workshop-final` |
| C4.9 analysis HEAD before docs | `68a7226923441fb41e7a19dacf8b41dcc4f5f05c` |
| `origin/rattrapage-bc4` before docs | `68a7226923441fb41e7a19dacf8b41dcc4f5f05c` |
| `origin/feature/web` | `6e733941fb71a5d552eb96fa54f1d94e674e4ecc` |
| `workshop-final` tag object | `b5126ade48ca20c37344093ff189d6983b22d0f4` |
| `workshop-final` commit | `6e733941fb71a5d552eb96fa54f1d94e674e4ecc` |

Verification commands executed:

```text
git branch --show-current
rattrapage-bc4

git status --short
 M backend/prisma/dev.db

git remote -v
origin  https://github.com/damienn7/workshop-dcn.git (fetch)
origin  https://github.com/damienn7/workshop-dcn.git (push)

git tag --list
workshop-final

git rev-list --left-right --count origin/rattrapage-bc4...rattrapage-bc4
0       0
```

Remote branch checks executed with `git ls-remote`:

```text
6e733941fb71a5d552eb96fa54f1d94e674e4ecc refs/heads/feature/web
68a7226923441fb41e7a19dacf8b41dcc4f5f05c refs/heads/rattrapage-bc4
b5126ade48ca20c37344093ff189d6983b22d0f4 refs/tags/workshop-final
6e733941fb71a5d552eb96fa54f1d94e674e4ecc refs/tags/workshop-final^{}
```

The remote is configured and reachable through local Git. Public anonymous browser accessibility is not proven by local Git alone.

## 2. Versioning Strategy

The real strategy is:

- `feature/web`: original development branch from the workshop.
- `workshop-final`: annotated immutable tag marking the original workshop-final state.
- `rattrapage-bc4`: isolated branch containing supplementary RNCP evidence and corrections.

`workshop-final` is a tag rather than another mutable branch because it is an immutable reference point. It protects the original submission state, makes comparisons easy, and distinguishes later rattrapage work from the original workshop.

Readable representation:

```text
feature/web
    |
    v
6e73394 updated style in home page
    |
    +-- tag: workshop-final
    |
    +------------------------------ rattrapage-bc4
                                      |
                                      + test infrastructure
                                      + business/API tests
                                      + E2E tests
                                      + corrective fixes
                                      + C4.3 evidence
                                      + architecture audit
                                      + C4.5 evidence
                                      + deployment configuration
                                      + Docker / Compose
                                      + C4.8 evidence
```

Useful comparison commands:

```bash
git log workshop-final..rattrapage-bc4
git diff --stat workshop-final..rattrapage-bc4
```

## 3. Consultable History

The main analyzed evidence range is `workshop-final..68a7226`, captured before this C4.9 documentation commit.

Commit count:

```text
git rev-list --count workshop-final..HEAD
21
```

Actual commit history after `workshop-final`, oldest to newest:

```text
81ac40a test: setup isolated backend test infrastructure
c2d9162 test: cover scoring engine rules and boundaries
959f3da test: add scoring acceptance scenarios
24365f1 test: cover diagnosis API persistence flow
c699dea test: cover scoring and decision API flows
f78f885 docs: add C4.3 baseline recette
ee55ede test: setup end-to-end acceptance testing
a447e26 test: cover complete technician buyback workflow
0844c79 fix: reject scoring for incomplete diagnoses
e939db3 fix: prevent negative buyback offers
4850c06 fix: align diagnosis values with scoring rules
195307e fix: persist and expose refusal decision details
457e63e docs: add current architecture audit
5e098ba docs: finalize C4.3 recette evidence
64ce999 docs: add C4.5 API and database evidence
c78b7c8 build: make application configuration deployable
71c0e03 build: containerize application services
73f89f9 build: add reproducible compose deployment
09f8508 build: harden backend Docker ownership
1a61ccb build: assert deployed database isolation
68a7226 docs: add C4.8 deployment evidence
```

## 4. History By Development Phase

| Phase | Commits | Purpose | Why the history is understandable |
|---|---|---|---|
| Test infrastructure | `81ac40a` | Adds Vitest, Supertest, isolated SQLite test helpers and backend test config. | The first rattrapage commit establishes how later changes are validated. |
| Scoring rules and business acceptance tests | `c2d9162`, `959f3da` | Captures deterministic scoring rules, boundaries and business acceptance scenarios. | Business behavior is documented through executable tests before fixes. |
| API and persistence tests | `24365f1`, `c699dea` | Covers diagnosis persistence, scoring routes and decision flows through HTTP and Prisma. | The commits separate API/database validation from business-rule tests. |
| C4.3 baseline evidence | `f78f885` | Adds initial recette plan, defect register and test plan. | The docs explain what the tests were meant to prove. |
| End-to-end acceptance | `ee55ede`, `a447e26` | Adds Playwright setup and a complete technician workflow. | E2E infrastructure is separated from the main scenario. |
| Corrective fixes | `0844c79`, `e939db3`, `4850c06`, `195307e` | Fixes incomplete scoring, negative offers, UI/backend value mismatch and refusal detail persistence. | Each defect correction has its own commit and can be reviewed independently. |
| Architecture audit | `457e63e` | Documents current architecture. | The audit is separated from behavior changes. |
| C4.3 final evidence | `5e098ba` | Finalizes recette and Git evidence for C4.3. | Evidence documentation is grouped apart from code fixes. |
| C4.5 API/database evidence | `64ce999` | Adds API and database evidence documents. | C4.5 proof is a documentation commit, not a code change. |
| Deployment configuration | `c78b7c8` | Makes API URL, CORS, `PORT`, `DATABASE_URL` and TypeScript ESM output deployable. | Configuration portability is isolated before container work. |
| Docker/containerization | `71c0e03` | Adds backend/frontend Dockerfiles, Nginx config, dockerignore files and backend entrypoint. | Container packaging is separate from Compose orchestration. |
| Compose deployment | `73f89f9` | Adds `compose.yaml` and deployment verification script. | The runnable deployment script appears in a focused build commit. |
| Deployment hardening | `09f8508`, `1a61ccb` | Reduces runtime image ownership changes and asserts `dev.db` absence in verification. | Small hardening changes are independently traceable. |
| C4.8 evidence | `68a7226` | Adds deployment guide, C4.8 evidence and PPT summary. | The final proof is separated from implementation commits. |

## 5. Example Of Technical Arbitration

The strongest traceability example is the C4.3 test-first sequence:

```text
test commit -> defect demonstrated -> fix commit -> same test retained as non-regression
```

| Test / baseline commit | Problem demonstrated | Fix commit | Traceability value |
|---|---|---|---|
| `959f3da test: add scoring acceptance scenarios`; `c699dea test: cover scoring and decision API flows` | Scoring could be calculated even when diagnosis sections were incomplete. | `0844c79 fix: reject scoring for incomplete diagnoses` | Shows the defect existed at business and API levels, then was corrected in a focused commit. |
| `959f3da test: add scoring acceptance scenarios` | A highly degraded item could produce a negative final offer. | `e939db3 fix: prevent negative buyback offers` | Captures a pricing boundary defect, then keeps the test as non-regression evidence. |
| `959f3da test: add scoring acceptance scenarios`; `c2d9162 test: cover scoring engine rules and boundaries` | `no_shock` could be treated as a blocking shock defect. | `4850c06 fix: align diagnosis values with scoring rules` | Shows the decision to normalize diagnosis values rather than alter the UI-only label. |
| `959f3da test: add scoring acceptance scenarios` | French UI label `Oui — bloquant` was not recognized as a blocking criterion. | `4850c06 fix: align diagnosis values with scoring rules` | Links a frontend wording value to backend scoring interpretation. |
| `c699dea test: cover scoring and decision API flows` | Refusal reasons and alternatives were not fully persisted/exposed for later display. | `195307e fix: persist and expose refusal decision details` | Demonstrates API contract evolution with persistence-backed non-regression coverage. |

Current searchable test anchors:

```text
backend/src/modules/scoring/scoring.acceptance.test.ts:220 [DEFECT] treats no_shock as the absence of a frame shock
backend/src/modules/scoring/scoring.acceptance.test.ts:302 [DEFECT] rejects scoring when the diagnosis is incomplete
backend/src/modules/scoring/scoring.acceptance.test.ts:315 [DEFECT] never returns a negative final offer
backend/src/modules/scoring/scoring.acceptance.test.ts:339 [DEFECT] treats the current French UI blocking label as a blocking criterion
backend/src/modules/scoring/scoring.routes.test.ts:154 [DEFECT] rejects scoring when diagnosis sections are incomplete
backend/src/modules/scoring/scoring.routes.test.ts:294 [DEFECT] returns refusal reasons and persists alternatives for later display
```

This shows technical arbitration in Git: tests documented the expected behavior, fixes addressed one decision at a time, and the retained tests became non-regression evidence.

## 6. Atomic Commits

Representative atomic commit examples:

| Type | Commit | What it isolates |
|---|---|---|
| `test:` | `81ac40a test: setup isolated backend test infrastructure` | Test harness only. |
| `test:` | `c699dea test: cover scoring and decision API flows` | API behavior evidence only. |
| `fix:` | `0844c79 fix: reject scoring for incomplete diagnoses` | One scoring validation correction. |
| `fix:` | `195307e fix: persist and expose refusal decision details` | One API/persistence correction. |
| `build:` | `c78b7c8 build: make application configuration deployable` | Portable runtime configuration. |
| `build:` | `73f89f9 build: add reproducible compose deployment` | Compose deployment script and verifier. |
| `docs:` | `457e63e docs: add current architecture audit` | Architecture documentation only. |
| `docs:` | `68a7226 docs: add C4.8 deployment evidence` | Deployment evidence only. |

Atomic commits help review, rollback, debugging, collaboration and jury explanation. They make it possible to answer: what changed, why it changed, and how it was verified.

Transparency: the original workshop history did not always use strict Conventional Commits. The stricter atomic and conventional strategy was adopted on `rattrapage-bc4`.

## 7. Repository Accessibility

Accessibility facts from local Git:

- GitHub remote URL is configured: `https://github.com/damienn7/workshop-dcn.git`.
- Remote branch `origin/rattrapage-bc4` exists.
- Remote branch `origin/feature/web` exists.
- Remote tag `workshop-final` exists.
- Before the C4.9 documentation commit, `origin/rattrapage-bc4` and local `rattrapage-bc4` were aligned at `68a7226`.

Important limitation:

- Public anonymous browser accessibility cannot be proven from local Git alone.
- After this C4.9 documentation is committed locally, the latest README/evidence state requires a final push before a jury can consult it on GitHub.

Expected post-commit status:

```text
History quality: demonstrated locally.
Latest remote accessibility: requires final push.
```

No push is performed automatically for this task.

## 8. RNCP Verdict

Criterion: "The repository is accessible, contains the different revisions of the project with meaningful comments, and makes it possible to understand the history of the project."

| Dimension | Verdict | Evidence |
|---|---|---|
| Repository configured on GitHub | DEMONSTRATED LOCALLY | `origin` is `https://github.com/damienn7/workshop-dcn.git`. |
| Remote branches/tag exist | DEMONSTRATED LOCALLY | `git ls-remote` returned `feature/web`, `rattrapage-bc4` and `workshop-final`. |
| Different revisions exist | DEMONSTRATED | 21 analyzed commits after `workshop-final` before C4.9 docs. |
| Comments are meaningful | DEMONSTRATED | Commits use readable `test:`, `fix:`, `build:` and `docs:` messages on `rattrapage-bc4`. |
| History is understandable | DEMONSTRATED | Phases, test-first traceability and atomic examples are documented above. |
| Latest C4.9 docs accessible remotely | NOT YET FULLY DEMONSTRATED | A final push is required after the documentation commit. |

Overall before final push: **NOT YET FULLY DEMONSTRATED** for remote accessibility of the latest C4.9 deliverable.

History quality itself: **DEMONSTRATED**.
