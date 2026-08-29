# C4.3 - Recette baseline

## Synthèse

Baseline exécutée sur `rattrapage-bc4` après ajout des tests backend de caractérisation, d'acceptation métier et d'intégration API.

Cette recette documente l'état réel avant correction des défauts métier. Les tests `[DEFECT]` sont volontairement en échec afin de servir de preuve de non-conformité et de garde-fou pour les commits de correction.

## Résultats automatisés

| Commande | Résultat | Détail |
|----------|----------|--------|
| `cd backend && npm test -- src/modules/diagnostics/diagnostics.routes.test.ts` | PASS | 9 tests passants |
| `cd backend && npm test -- src/modules/scoring/scoring.routes.test.ts` | FAIL attendu | 7 passants, 2 échecs `[DEFECT]` |
| `cd backend && npm test` | FAIL attendu | 63 passants, 6 échecs `[DEFECT]` |
| `cd backend && npm run typecheck` | PASS | `tsc --noEmit` sans erreur |

## Détail par cas

| ID | Cas | Statut baseline | Observation |
|----|-----|-----------------|-------------|
| C43-BE-001 | Santé API | PASS | `/health` répond correctement |
| C43-BE-010 | Moteur de scoring | PASS | Mappings, seuils et valeurs par défaut couverts |
| C43-BE-020 | Scoring accepté / conditionnel / refusé | PASS | Les décisions numériques principales sont conformes |
| C43-BE-021 | Bornes 50 et 75 | PASS | 50 donne `conditional`, 75 donne `accepted` |
| C43-BE-022-A | `no_shock` ne doit pas bloquer | FAIL attendu | Le moteur détecte `shock` dans `no_shock` |
| C43-BE-022-B | Diagnostic incomplet refusé | FAIL attendu | Le service calcule encore un score |
| C43-BE-022-C | Offre finale non négative | FAIL attendu | Une offre à `-50` peut être produite |
| C43-BE-022-D | Libellé UI français bloquant | FAIL attendu | `Oui — bloquant` n'est pas reconnu |
| C43-API-030 | Diagnostic API + Prisma | PASS | Démarrage et sections persistés |
| C43-API-040 | Score et décision API | PASS partiel | Flux score, acceptation, ajustement et refus principal passent |
| C43-API-041-A | API score diagnostic incomplet | FAIL attendu | `POST /score` renvoie `200` au lieu de `400` |
| C43-API-041-B | Détails de refus | FAIL attendu | Raisons non renvoyées, alternatives non persistées |
| C43-E2E-001 | Parcours technicien complet | À exécuter | Infrastructure Playwright non encore ajoutée |

## Décision de recette baseline

La baseline est acceptée comme état de référence de rattrapage, pas comme état produit final.

Le périmètre peut passer en correction uniquement après conservation de ces preuves :

- tests backend de caractérisation ;
- tests d'acceptation métier ;
- tests API de diagnostic, scoring et décision ;
- registre de défauts C4.3.
