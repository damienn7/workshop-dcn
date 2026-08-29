# C4.3 - Recette baseline

## Synthèse

Baseline exécutée sur `rattrapage-bc4` après ajout des tests backend de caractérisation, d'acceptation métier et d'intégration API.

Cette recette documente l'état réel avant correction des défauts métier. Les tests `[DEFECT]` sont volontairement en échec afin de servir de preuve de non-conformité et de garde-fou pour les commits de correction.

## Résultats automatisés

| Commande | Résultat | Détail |
|----------|----------|--------|
| `cd backend && npm test -- src/modules/diagnostics/diagnostics.routes.test.ts` | PASS | 9 tests passants |
| `cd backend && npm test -- src/modules/scoring/scoring.routes.test.ts` | FAIL attendu | 8 passants, 1 échec `[DEFECT]` |
| `cd backend && npm test` | FAIL attendu | 68 passants, 1 échec `[DEFECT]` |
| `cd backend && npm run typecheck` | PASS | `tsc --noEmit` sans erreur |
| `cd DecathProto && npm run test:e2e` | PASS | 2 tests Playwright passants |

## Détail par cas

| ID | Cas | Statut baseline | Observation |
|----|-----|-----------------|-------------|
| C43-BE-001 | Santé API | PASS | `/health` répond correctement |
| C43-BE-010 | Moteur de scoring | PASS | Mappings, seuils et valeurs par défaut couverts |
| C43-BE-020 | Scoring accepté / conditionnel / refusé | PASS | Les décisions numériques principales sont conformes |
| C43-BE-021 | Bornes 50 et 75 | PASS | 50 donne `conditional`, 75 donne `accepted` |
| C43-BE-022-A | `no_shock` ne doit pas bloquer | PASS | `no_shock` est reconnu comme absence de choc |
| C43-BE-022-B | Diagnostic incomplet refusé | PASS | Le service refuse le scoring incomplet |
| C43-BE-022-C | Offre finale non négative | PASS | L'offre est bornée à 0 minimum |
| C43-BE-022-D | Libellé UI français bloquant | PASS | `Oui — bloquant` déclenche le refus métier |
| C43-API-030 | Diagnostic API + Prisma | PASS | Démarrage et sections persistés |
| C43-API-040 | Score et décision API | PASS partiel | Flux score, acceptation, ajustement et refus principal passent |
| C43-API-041-A | API score diagnostic incomplet | PASS | `POST /score` renvoie `400` avec l'erreur métier |
| C43-API-041-B | Détails de refus | FAIL attendu | Raisons non renvoyées, alternatives non persistées |
| C43-E2E-001 | Parcours technicien complet | PASS | Dossier ouvert, diagnostic complété, score généré, décision acceptée et état relu via API |

## Décision de recette baseline

La baseline est acceptée comme état de référence de rattrapage, pas comme état produit final.

Le périmètre peut passer en correction uniquement après conservation de ces preuves :

- tests backend de caractérisation ;
- tests d'acceptation métier ;
- tests API de diagnostic, scoring et décision ;
- registre de défauts C4.3.
