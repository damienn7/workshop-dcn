# C4.3 - Recette finale

## Synthèse

La recette C4.3 a été construite en deux temps :

1. baseline : ajout de tests automatisés avant correction afin de révéler les défauts réels ;
2. final : corrections atomiques puis réexécution de la suite comme preuve de non-régression.

Les tests nommés `[DEFECT]` restent dans le code pour préserver l'historique de non-conformité. Ils sont maintenant passants.

## Résultats finaux vérifiés

| Commande | Résultat | Détail |
|----------|----------|--------|
| `cd backend && npm test` | PASS | 5 fichiers, 69 tests passants |
| `cd backend && npm run typecheck` | PASS | `tsc --noEmit` sans erreur |
| `cd DecathProto && npm run build` | PASS | build Vite généré |
| `cd DecathProto && npm run test:e2e` | PASS | 2 tests Playwright passants |

Restent uniquement des avertissements non bloquants observés pendant la validation :

- build frontend : warning CSS minify existant sur `.photo-placeholder .text-[10px]` ;
- Playwright : warnings Node `NO_COLOR` ignoré car `FORCE_COLOR` est défini.

## Baseline vs final

Baseline automatisée après les tests API/scoring : 69 tests backend exécutés, 63 passants, 6 échecs attendus documentant les défauts. Les 6 échecs correspondaient à 5 défauts, car le diagnostic incomplet était couvert à la fois au niveau service et au niveau API.

| ID | Scenario | Baseline | Defect / Observation | Correction | Final result |
|----|----------|----------|----------------------|------------|--------------|
| C43-BE-001 | Santé API | PASS | Aucun défaut | Infrastructure test `81ac40a` | PASS |
| C43-BE-010 | Règles moteur scoring | PASS | Mappings et seuils caractérisés | Tests de caractérisation `c2d9162` | PASS |
| C43-BE-020 | Accepted / conditional / refused | PASS | Décisions principales conformes | Tests d'acceptation `959f3da` | PASS |
| C43-BE-021 | Bornes 50 et 75 | PASS | 50 donne `conditional`, 75 donne `accepted` | Tests d'acceptation `959f3da` | PASS |
| C43-BE-022-A | `no_shock` ne doit pas bloquer | FAIL | `no_shock` était refusé car le moteur cherchait la sous-chaîne `shock` | `4850c06 fix: align diagnosis values with scoring rules` | PASS |
| C43-BE-022-B | Scoring d'un diagnostic incomplet | FAIL | Le service et l'API calculaient un score malgré des sections manquantes | `0844c79 fix: reject scoring for incomplete diagnoses` | PASS |
| C43-BE-022-C | Offre finale jamais négative | FAIL | Une offre négative pouvait être calculée et persistée | `e939db3 fix: prevent negative buyback offers` | PASS |
| C43-BE-022-D | Libellé UI français bloquant | FAIL | `Oui — bloquant` n'était pas reconnu comme choc bloquant | `4850c06 fix: align diagnosis values with scoring rules` | PASS |
| C43-API-030 | Diagnostic API + persistance Prisma | PASS | Démarrage et sections persistés correctement | `24365f1 test: cover diagnosis API persistence flow` | PASS |
| C43-API-040 | Score et décision API | PASS partiel | Flux score, acceptation, ajustement et refus principal couverts | `c699dea test: cover scoring and decision API flows` | PASS |
| C43-API-041-B | Détails de refus | FAIL | Raisons non renvoyées et alternatives non persistées | `195307e fix: persist and expose refusal decision details` | PASS |
| C43-E2E-000 | Environnement E2E déterministe | Non implémenté | Aucun test navigateur dans la baseline initiale | `ee55ede test: setup end-to-end acceptance testing` | PASS |
| C43-E2E-001 | Parcours technicien complet accepté | Non implémenté | Parcours utilisateur non matérialisé en preuve exécutable | `a447e26 test: cover complete technician buyback workflow` | PASS |

## Totaux

| Mesure | Baseline | Final |
|--------|----------|-------|
| Backend tests | 63 PASS / 6 FAIL attendus | 69 PASS / 0 FAIL |
| Backend typecheck | PASS | PASS |
| Frontend build | PASS avec warning CSS | PASS avec warning CSS |
| E2E Playwright | Non implémenté puis 2 PASS après ajout | 2 PASS / 0 FAIL |
| Défauts détectés | 5 | 5 |
| Défauts résolus | 0 | 5 |
| Défauts ouverts | 5 | 0 |

## Décision de recette

La recette finale est acceptée pour le périmètre C4.3.

Les preuves disponibles montrent :

- une stratégie de test multi-niveaux ;
- des scénarios automatisés reliés aux cas d'usage métier ;
- une baseline qui détecte des défauts réels ;
- des corrections atomiques après les tests ;
- une suite finale entièrement passante.
