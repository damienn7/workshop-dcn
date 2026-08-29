# C4.3 - Registre des défauts

## Défauts ouverts

| ID | Sévérité | Statut | Preuve automatisée | Comportement attendu | Comportement observé |
|----|----------|--------|--------------------|----------------------|----------------------|
| C43-DEF-001 | Haute | Ouvert | `scoring.acceptance.test.ts` - `[DEFECT] treats no_shock as the absence of a frame shock` | `no_shock` signifie absence de choc et ne bloque pas la reprise | Le moteur refuse le dossier car la chaîne contient `shock` |
| C43-DEF-002 | Haute | Ouvert | `scoring.acceptance.test.ts` et `scoring.routes.test.ts` - diagnostic incomplet | Le scoring doit refuser un diagnostic incomplet avec une erreur métier | Le service et l'API calculent un score malgré des sections manquantes |
| C43-DEF-003 | Moyenne | Ouvert | `scoring.acceptance.test.ts` - `[DEFECT] never returns a negative final offer` | L'offre finale doit être bornée à 0 minimum | Une offre finale négative peut être renvoyée et persistée |
| C43-DEF-004 | Haute | Ouvert | `scoring.acceptance.test.ts` - libellé UI français bloquant | Les valeurs envoyées par le frontend doivent être comprises par le backend | `Oui — bloquant` n'est pas interprété comme critère bloquant |
| C43-DEF-005 | Moyenne | Ouvert | `scoring.routes.test.ts` - `[DEFECT] returns refusal reasons and persists alternatives for later display` | Les raisons de refus doivent être renvoyées, les alternatives persistées | La réponse renvoie `reasons: []` et `alternativesJson` reste vide |

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
| C43-DEF-002 | `fix: reject scoring for incomplete diagnoses` |
| C43-DEF-003 | `fix: prevent negative buyback offers` |
| C43-DEF-001 et C43-DEF-004 | `fix: align diagnosis values with scoring rules` |
| C43-DEF-005 | `fix: persist and expose refusal decision details` |
