# C4.3 - Plan de tests et recette

## Objectif

Valider le prototype Diag' Seconde Vie sur le parcours magasin critique :

1. ouvrir un dossier de reprise ;
2. démarrer et compléter le diagnostic technique ;
3. calculer le score de reprise ;
4. enregistrer la décision finale ;
5. vérifier la persistance des données utiles à la traçabilité.

Ce plan sert de preuve RNCP C4.3 pour la conception, l'exécution et l'exploitation d'une stratégie de test.

## Périmètre couvert

| Niveau | Zone | Outils | Statut |
|--------|------|--------|--------|
| Backend smoke | Santé API et isolation de base | Vitest, Supertest, SQLite temporaire | Automatisé |
| Unitaires | Moteur de scoring pur | Vitest | Automatisé |
| Acceptation métier | Règles de score et seuils de décision | Vitest | Automatisé |
| API intégration | Diagnostic HTTP + persistance Prisma | Vitest, Supertest, Prisma | Automatisé |
| API intégration | Scoring + décisions finales | Vitest, Supertest, Prisma | Automatisé |
| E2E | Parcours technicien complet frontend + backend | Playwright | À automatiser |

## Hors périmètre initial

- tests de charge ;
- sécurité applicative avancée ;
- accessibilité exhaustive ;
- compatibilité navigateur étendue ;
- tests sur une base de production.

## Environnement de test

- Branche : `rattrapage-bc4`
- Backend : Node.js, Express, TypeScript, Prisma, SQLite
- Frontend : React, Vite, TypeScript
- Base de test : SQLite temporaire isolée par worker Vitest
- Base locale exclue des commits : `backend/prisma/dev.db`

Commandes principales :

```bash
cd backend
npm test
npm run typecheck
```

## Stratégie de données

Les tests backend créent leurs dossiers de reprise dans une base SQLite temporaire, appliquent la migration Prisma existante, puis nettoient les tables avant chaque test.

Les fixtures couvrent :

- dossier inexistant ;
- dossier sans diagnostic ;
- dossier avec diagnostic incomplet ;
- diagnostic complet acceptable ;
- décision acceptée ;
- ajustement manuel ;
- décision refusée.

## Cas de test de référence

| ID | Type | Description | Fichier |
|----|------|-------------|---------|
| C43-BE-001 | Smoke | Vérifier `/health` | `backend/src/test/health.test.ts` |
| C43-BE-010 | Unitaire | Seuils et mapping du moteur de scoring | `backend/src/modules/scoring/scoring.engine.test.ts` |
| C43-BE-020 | Acceptation | Score accepté, conditionnel, refusé | `backend/src/modules/scoring/scoring.acceptance.test.ts` |
| C43-BE-021 | Acceptation | Critères bloquants et limites 50/75 | `backend/src/modules/scoring/scoring.acceptance.test.ts` |
| C43-BE-022 | Défaut | Diagnostic incomplet, offre négative, libellés UI | `backend/src/modules/scoring/scoring.acceptance.test.ts` |
| C43-API-030 | API | Démarrage et sauvegarde du diagnostic | `backend/src/modules/diagnostics/diagnostics.routes.test.ts` |
| C43-API-040 | API | Score, acceptation, ajustement, refus | `backend/src/modules/scoring/scoring.routes.test.ts` |
| C43-API-041 | Défaut | Scoring incomplet et détails de refus | `backend/src/modules/scoring/scoring.routes.test.ts` |
| C43-E2E-001 | E2E | Parcours technicien complet accepté | À créer |

## Critères d'acceptation

Le socle est considéré conforme lorsque :

- tous les tests non marqués `[DEFECT]` passent ;
- les défauts ouverts sont documentés avec un identifiant et une preuve ;
- chaque correctif fait passer au moins un test `[DEFECT]` existant ;
- la suite backend complète passe après correction des défauts métier ;
- le parcours E2E technicien complet est automatisé et vérifie l'état persistant final.
