# C4.3 - Plan de tests et recette

## Objectif

Valider le prototype Diag' Seconde Vie sur le parcours magasin critique :

1. ouvrir un dossier de reprise ;
2. démarrer et compléter le diagnostic technique ;
3. calculer le score de reprise ;
4. enregistrer la décision finale ;
5. vérifier la persistance des données utiles à la traçabilité.

Ce plan sert de preuve RNCP C4.3 : il montre une stratégie de test exécutable, reproductible et reliée aux cas d'usage de l'application.

## Niveaux de test implémentés

| Niveau | Objectif | Outils | Preuves |
|--------|----------|--------|---------|
| Business / unit tests | Caractériser les règles métier de scoring : mappings, seuils, bloqueurs et cas limites | Vitest | `scoring.engine.test.ts`, `scoring.acceptance.test.ts` |
| API / persistence integration tests | Vérifier les routes Express, les réponses HTTP et les mutations Prisma | Vitest, Supertest, Prisma, SQLite isolé | `diagnostics.routes.test.ts`, `scoring.routes.test.ts` |
| End-to-end acceptance tests | Jouer un parcours utilisateur réel côté frontend avec backend démarré | Playwright | `infra.spec.ts`, `technician-workflow.spec.ts` |

Diagramme de stratégie :

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

## Environnement de test

- Branche : `rattrapage-bc4`
- Backend : Node.js, Express, TypeScript, Prisma, SQLite
- Frontend : React, Vite, TypeScript
- Tests backend : base SQLite temporaire par worker Vitest
- Tests E2E : base SQLite temporaire absolue, réinitialisée avant démarrage des serveurs
- Base locale protégée : `backend/prisma/dev.db` n'est pas utilisée par les tests et n'est jamais stagée

Commandes de validation :

```bash
cd backend
npm test
npm run typecheck

cd ../DecathProto
npm run build
npm run test:e2e
```

## Stratégie de données

Les tests backend appliquent la migration Prisma existante sur une base SQLite temporaire, puis nettoient les tables avant chaque test. Les fixtures créent des dossiers déterministes avec client, vélo, diagnostic, score et décision selon le scénario.

Les tests E2E utilisent un helper Playwright qui crée un dossier via l'API, démarre le frontend avec `VITE_API_BASE_URL`, puis vérifie l'état final en relisant le dossier par HTTP.

Protection `dev.db` :

- `backend/src/db/prisma.ts` accepte `process.env.DATABASE_URL` pour les tests ;
- Vitest utilise une URL SQLite temporaire ;
- Playwright utilise `E2E_DATABASE_URL` ou `/tmp/workshop-dcn-e2e/e2e.db` ;
- `.gitignore` couvre les bases temporaires et rapports de test ;
- `backend/prisma/dev.db` reste explicitement exclu de l'index Git.

## Cas d'usage couverts

| ID | Niveau | Cas couvert | Fichier |
|----|--------|-------------|---------|
| C43-BE-001 | Smoke | Santé API `/health` | `backend/src/test/health.test.ts` |
| C43-BE-010 | Business / unit | `getBuybackBaseValue`, seuils 50/60/75/85 et arrondis | `backend/src/modules/scoring/scoring.engine.test.ts` |
| C43-BE-011 | Business / unit | `mapValueToScore`, tokens connus, valeurs numériques et fallback | `backend/src/modules/scoring/scoring.engine.test.ts` |
| C43-BE-020 | Business acceptance | Décisions accepted, conditional, refused | `backend/src/modules/scoring/scoring.acceptance.test.ts` |
| C43-BE-021 | Business acceptance | Critères bloquants et bornes exactes 50/75 | `backend/src/modules/scoring/scoring.acceptance.test.ts` |
| C43-BE-022 | Business acceptance | Diagnostic incomplet, offre négative, alignement libellés UI / scoring | `backend/src/modules/scoring/scoring.acceptance.test.ts` |
| C43-API-030 | API / persistence | Démarrage diagnostic, identification, cadre/fourche, freins, transmission, roues/pneus, finitions | `backend/src/modules/diagnostics/diagnostics.routes.test.ts` |
| C43-API-040 | API / persistence | `POST /score`, 404 score, acceptation, ajustement manuel, ajustement hors plage, refus | `backend/src/modules/scoring/scoring.routes.test.ts` |
| C43-API-041 | API / persistence | Diagnostic incomplet et détails de refus persistés/exposés | `backend/src/modules/scoring/scoring.routes.test.ts` |
| C43-E2E-000 | E2E | Démarrage déterministe frontend + backend | `DecathProto/e2e/infra.spec.ts` |
| C43-E2E-001 | E2E | Parcours technicien complet accepté | `DecathProto/e2e/technician-workflow.spec.ts` |

## Critères d'acceptation

Le périmètre C4.3 est validé lorsque :

- tous les tests backend passent ;
- le typecheck backend passe ;
- le build frontend passe ;
- le parcours E2E Playwright passe ;
- les défauts détectés en baseline restent documentés ;
- chaque défaut corrigé référence un test de non-régression et un commit atomique.
