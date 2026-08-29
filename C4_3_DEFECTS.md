# C4.3 - Registre des défauts

## Défauts suivis

| ID | Sévérité | Statut | Preuve automatisée | Comportement attendu | Comportement observé |
|----|----------|--------|--------------------|----------------------|----------------------|
| C43-DEF-001 | Haute | Corrigé | `scoring.acceptance.test.ts` - `[DEFECT] treats no_shock as the absence of a frame shock` | `no_shock` signifie absence de choc et ne bloque pas la reprise | `no_shock` est maintenant reconnu comme valeur non bloquante |
| C43-DEF-002 | Haute | Corrigé | `scoring.acceptance.test.ts` et `scoring.routes.test.ts` - diagnostic incomplet | Le scoring doit refuser un diagnostic incomplet avec une erreur métier | Le service et l'API renvoient maintenant `Scoring impossible: diagnostic incomplet` |
| C43-DEF-003 | Moyenne | Corrigé | `scoring.acceptance.test.ts` - `[DEFECT] never returns a negative final offer` | L'offre finale doit être bornée à 0 minimum | L'offre finale est maintenant bornée à 0 avant persistance |
| C43-DEF-004 | Haute | Corrigé | `scoring.acceptance.test.ts` - libellé UI français bloquant | Les valeurs envoyées par le frontend doivent être comprises par le backend | `Oui — bloquant` est maintenant interprété comme critère bloquant |
| C43-DEF-005 | Moyenne | Corrigé | `scoring.routes.test.ts` - `[DEFECT] returns refusal reasons and persists alternatives for later display` | Les raisons de refus doivent être renvoyées, les alternatives persistées | Les raisons sont renvoyées et les alternatives sont persistées |

## Règles de correction

Chaque correction doit rester atomique :

- conserver le test `[DEFECT]` qui prouve le problème ;
- implémenter le plus petit correctif métier valide ;
- exécuter le test ciblé ;
- exécuter la suite de régression pertinente ;
- mettre à jour cette fiche et la recette lorsque le statut change.

## Candidats de commits de correction

| Défaut | Commit attendu |
|--------|----------------|
| C43-DEF-002 | `fix: reject scoring for incomplete diagnoses` - fait |
| C43-DEF-003 | `fix: prevent negative buyback offers` - fait |
| C43-DEF-001 et C43-DEF-004 | `fix: align diagnosis values with scoring rules` - fait |
| C43-DEF-005 | `fix: persist and expose refusal decision details` - fait |
