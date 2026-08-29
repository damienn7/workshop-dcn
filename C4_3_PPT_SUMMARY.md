# C4.3 - PPT Summary

## Slide 1 — C4.3 Test strategy

Title:
C4.3 — Une recette automatisée et reproductible

Content:

- Vitest — règles métier
- Supertest + Prisma — API / persistance
- Playwright — parcours utilisateur
- isolated SQLite test environment

KPI line:
69 tests backend PASS
2 E2E PASS

## Slide 2 — From defect detection to non-regression

| Defect detected | Baseline | Correction | Final |
|-----------------|----------|------------|-------|
| incomplete diagnosis scoring | FAIL | `0844c79` | PASS |
| negative offer | FAIL | `e939db3` | PASS |
| UI/scoring value mismatch | FAIL | `4850c06` | PASS |
| refusal persistence | FAIL | `195307e` | PASS |

## Oral notes

Lors de la première présentation, le prototype fonctionnait visuellement, mais il manquait une preuve automatisée de recette. Les scénarios métier existaient dans le discours, pourtant rien ne démontrait de façon reproductible que le scoring, le diagnostic et la décision finale restaient corrects après modification. J'ai donc ajouté une stratégie en trois niveaux. D'abord Vitest pour les règles métier : seuils, bloqueurs, cas limites et offres. Ensuite Supertest avec Prisma pour vérifier les routes Express et la persistance dans une base SQLite isolée, sans toucher `dev.db`. Enfin Playwright pour rejouer le parcours réel d'un technicien depuis l'interface React jusqu'à la décision acceptée.

Point important : les tests ont été écrits avant les corrections. Cette baseline a révélé des défauts concrets : scoring possible avec diagnostic incomplet, offre négative, mauvais alignement entre libellés UI et tokens backend, et détails de refus incomplets. Chaque défaut a ensuite été corrigé dans un commit atomique relié à un test qui échouait auparavant. La non-régression est démontrée par l'exécution finale : 69 tests backend passent, le typecheck passe, le build frontend passe, et les 2 tests Playwright passent.

## Jury trap questions

1. Why not only manual testing?
Manual testing shows a moment, not a guarantee. Automated tests make the recette repeatable and catch regressions.

2. Why Vitest?
Vitest fits the TypeScript backend, runs quickly, and is well suited for deterministic business-rule tests.

3. Why Supertest?
Supertest exercises the real Express routes without needing an external HTTP server in each test.

4. Why Playwright?
Playwright validates the complete user workflow through the browser, including frontend, backend and API wiring.

5. Why use a separate test database?
It protects `backend/prisma/dev.db`, keeps tests deterministic, and allows cleanup between scenarios.

6. Why keep failing tests before fixing bugs?
They prove the defect existed, guide the fix, and remain as non-regression tests afterward.

7. What is the difference between unit, integration and E2E tests?
Unit tests isolate business logic, integration tests verify components working together, and E2E tests validate the user journey across the full stack.

8. How do you know the tests do not modify dev.db?
The test setup overrides `DATABASE_URL` with temporary SQLite files, and Git status confirms `dev.db` is not staged or committed.

9. Are 69 tests enough?
They are enough for the targeted C4.3 evidence scope, but not a complete industrial QA strategy.

10. What remains untested?
Load, security, accessibility, broad browser compatibility and deeper frontend component states remain outside this scope.
