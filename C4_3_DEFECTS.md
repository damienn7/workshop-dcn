# C4.3 - Registre des défauts

## Défauts suivis

| Defect ID | Related test(s) | Severity | Initial behavior | Root cause | Fix commit | Final status |
|-----------|-----------------|----------|------------------|------------|------------|--------------|
| C43-DEF-001 | `scoring.acceptance.test.ts` - `[DEFECT] treats no_shock as the absence of a frame shock` | Haute | `no_shock` refusait le dossier | Détection bloquante basée sur `includes('shock')`, donc faux positif sur une valeur négative | `4850c06 fix: align diagnosis values with scoring rules` | RESOLVED |
| C43-DEF-002 | `scoring.acceptance.test.ts` et `scoring.routes.test.ts` - diagnostic incomplet | Haute | Le service et l'API calculaient un score avec des sections nulles | Absence de validation de complétude avant `calculateScoreForCase` | `0844c79 fix: reject scoring for incomplete diagnoses` | RESOLVED |
| C43-DEF-003 | `scoring.acceptance.test.ts` - `[DEFECT] never returns a negative final offer` | Moyenne | Une offre finale négative pouvait être renvoyée | Le calcul arrondissait l'offre mais ne la bornait pas à 0 | `e939db3 fix: prevent negative buyback offers` | RESOLVED |
| C43-DEF-004 | `scoring.acceptance.test.ts` - `[DEFECT] treats the current French UI blocking label as a blocking criterion` | Haute | `Oui — bloquant` donnait une décision conditionnelle au lieu d'un refus | Les libellés français du frontend n'étaient pas normalisés côté backend | `4850c06 fix: align diagnosis values with scoring rules` | RESOLVED |
| C43-DEF-005 | `scoring.routes.test.ts` - `[DEFECT] returns refusal reasons and persists alternatives for later display` | Moyenne | La réponse renvoyait `reasons: []` et `alternativesJson` restait vide | Le mapping API ignorait les champs `Decision`, et `setRefusal` ne persistait pas les alternatives | `195307e fix: persist and expose refusal decision details` | RESOLVED |

## Statut final

Tous les défauts C4.3 confirmés sont résolus.

Non-régression vérifiée :

- `cd backend && npm test` : 69 PASS ;
- `cd backend && npm run typecheck` : PASS ;
- `cd DecathProto && npm run build` : PASS ;
- `cd DecathProto && npm run test:e2e` : 2 PASS.

## Traçabilité

Les tests détectant les défauts ont été ajoutés avant les commits de correction :

- baseline scoring métier : `959f3da test: add scoring acceptance scenarios` ;
- baseline scoring/décision API : `c699dea test: cover scoring and decision API flows` ;
- corrections : `0844c79`, `e939db3`, `4850c06`, `195307e`.
