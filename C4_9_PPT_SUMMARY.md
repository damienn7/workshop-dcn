# C4.9 — PPT Summary

## Principal Slide — C4.9 — Un historique Git qui raconte le projet

Visual:

```text
feature/web
     |
     v
6e73394
workshop-final
     |
     +---------------------- rattrapage-bc4
                             |
                             + test infrastructure
                             + business/API tests
                             + E2E
                             + fixes
                             + C4.3 evidence
                             + C4.5 evidence
                             + Docker / C4.8
                             |
                             v
                           68a7226
```

Highlights:

```text
Immutable baseline: workshop-final
Atomic commits: test / fix / build / docs
Traceability: test -> defect -> fix -> non-regression
Remote: https://github.com/damienn7/workshop-dcn.git
Branch: rattrapage-bc4
```

KPI row:

```text
21 analyzed commits after workshop-final
4 explicit defect-fix commits
1 immutable baseline tag
```

Accessibility note:

```text
Remote branch exists and was aligned at 68a7226 before C4.9 docs.
After this local documentation commit, a final push is required for jury access to the latest README/evidence files.
```

## Oral Script

Pour C4.9, l'outil de versioning utilisé est Git, avec un dépôt GitHub configuré en remote. J'ai séparé l'état original du workshop et le travail de rattrapage: la branche `feature/web` garde la ligne de développement d'origine, le tag immuable `workshop-final` pointe vers le rendu initial, et la branche `rattrapage-bc4` contient les compléments BC4. L'historique après ce tag contient 21 commits analysés, avec des messages compréhensibles comme `test:`, `fix:`, `build:` et `docs:`. Un point important est la traçabilité test-first: les tests de scoring, d'API et d'acceptation ont été commités avant les corrections, puis les commits de fix montrent l'arbitrage technique, par exemple le rejet des diagnostics incomplets ou la prévention des offres négatives. Cette organisation rend l'évolution consultable, comparable avec `workshop-final`, et utilisable pour relire, expliquer ou annuler une décision.

## Jury Questions

1. Pourquoi Git ?

Git permet de suivre chaque révision du projet, de comparer les versions, de revenir à un état précédent et d'expliquer l'évolution du code.

2. Pourquoi une branche rattrapage-bc4 ?

Elle isole les corrections et preuves RNCP du rendu workshop initial. On peut donc relire le rattrapage sans mélanger les deux périodes.

3. Pourquoi avoir créé workshop-final ?

Pour figer l'état exact du rendu initial et garder un point de comparaison fiable.

4. Pourquoi un tag plutôt qu'une branche ?

Un tag est un repère immuable. Une branche peut avancer; ici, l'objectif était de protéger l'état original.

5. Qu'est-ce qu'un commit atomique ?

C'est un commit qui porte une intention unique: un test, une correction, une configuration ou une documentation précise.

6. Pourquoi les tests sont-ils commités avant les corrections ?

Cela prouve que le défaut a été identifié par un test avant la correction, puis que le même test reste comme preuve de non-régression.

7. Quelle différence entre Git et GitHub ?

Git est l'outil de versioning. GitHub est l'hébergement distant qui permet de partager et consulter le dépôt.

8. Comment revenir à l'état du workshop ?

Avec le tag: `git checkout workshop-final` pour inspecter l'état, ou `git switch feature/web` pour revenir à la branche d'origine.

9. Comment comparer le workshop et le rattrapage ?

Avec `git log workshop-final..rattrapage-bc4` pour les commits et `git diff --stat workshop-final..rattrapage-bc4` pour les fichiers modifiés.

10. Pourquoi ne pas travailler directement sur feature/web ?

Pour préserver l'historique d'origine et rendre les ajouts de rattrapage clairement identifiables.

11. Avez-vous utilisé des pull requests pendant ce workshop ?

Je ne peux pas démontrer de pull requests dans cette preuve locale. Le workshop était limité côté développement collaboratif; la preuve porte ici sur Git, le remote, les branches, le tag et l'historique.

12. Qu'amélioreriez-vous pour une vraie équipe de développement ?

J'ajouterais des branches protégées, des pull requests obligatoires, des revues de code, des checks CI et une convention de messages partagée.

13. Comment géreriez-vous les conflits ?

Par petites branches à jour régulièrement, résolution locale des conflits, tests avant merge, puis revue du diff final.

14. Quelle stratégie de branches utiliseriez-vous en équipe ?

Une branche principale protégée, des branches de fonctionnalité courtes, des pull requests et des tags de release pour les jalons importants.

## Collaboration Limitation

What is demonstrated:

- Git version control.
- GitHub remote configuration.
- Branches and immutable tag.
- Consultable and meaningful history.
- Atomic revisions.

Workshop limitation:

- The available evidence does not demonstrate a full multi-developer pull request workflow.
- In a real development team, I would add protected branches, feature branches, pull requests, code review and CI status checks.
