# C4.10 — PPT Summary

## Slide 1 — C4.10 — Un audit technique orienté risques

Recommended visual:

```text
+-----------------------------+-----------------------------+-----------------------------+
| FORCES                      | CONTRAINTES / LIMITES       | IMPACT                      |
+-----------------------------+-----------------------------+-----------------------------+
| TypeScript frontend/backend | Auth/RBAC absent            | P0 avant donnees reelles    |
| Prisma relational workflow  | KPI encore mock-backed      | Risque de mauvaise decision |
| 69 backend tests + 2 E2E    | SQLite limite la production | Migration DB avant pilote   |
| Docker Compose reproductible| JSON string peu exploitable | Analytics limitees          |
| Git history comprehensible  | Observabilite minimale      | Support prod incomplet      |
+-----------------------------+-----------------------------+-----------------------------+
```

Bottom message:

```text
Prototype maitrise != pret pour production
```

Speaker notes:

- The audit distinguishes original weaknesses now resolved from current remaining limits.
- The strongest current strengths are test coverage, Prisma persistence, Docker reproducibility and Git traceability.
- The main blockers are security, real KPI data, production database choice and observability.

## Slide 2 — C4.10 — Une roadmap dimensionnée

Priority columns:

```text
P0 — Avant donnees reelles
Auth staff + RBAC
Protect personal data
Resolve production dependency advisories
Effort: S to L

P1 — Avant pilote
KPI from Prisma
Transactions for score/decision
Read-only GET score
PostgreSQL/managed DB target
Observability + secrets
Effort: S to XL

P2 — Industrialisation
Split App.tsx
Typed API contract
Selective data normalization
Reduce any
CI/lint gates
Effort: S to L
```

Bottom validation markers:

```text
Diagnostic clair ✅
Choix data argumentés ✅
Recommandations priorisées ✅
```

## Backup Content A — Detailed Risk Matrix

| Risk | Severity | Priority | One-line response |
|---|---|---|---|
| No authentication/RBAC | HIGH | P0 | Protect API before real data. |
| Customer personal data controls incomplete | HIGH | P0 | Add access control, audit trail, logging minimization and protected backups. |
| KPI endpoint uses mocks | HIGH | P1 | Move aggregation to Prisma. |
| SQLite production limits | MEDIUM now, HIGH before production | P1 | Migrate pilot/production to PostgreSQL or managed DB. |
| Multi-record writes not transactional | MEDIUM | P1 | Add Prisma transactions around score/decision flows. |
| GET score mutates state | MEDIUM | P1 | Make GET read-only and keep calculation on POST. |
| Static frontend display data | MEDIUM | P1/P2 | Bind UI to backend DTO values. |
| Large `App.tsx` | MEDIUM | P2 | Split screens/hooks/components. |

## Backup Content B — Technology-Choice Table

| Technology | Prototype coherence | Production evolution |
|---|---|---|
| TypeScript | Coherent for safer fast development. | Reduce `any`; generate/shared API types. |
| React/Vite | Coherent for rapid seller UI. | Split workflow and update dependencies. |
| Express/REST | Coherent and easy to test. | Add auth, route semantics and OpenAPI. |
| Prisma | Coherent ORM/migration layer. | Keep Prisma, migrate DB provider. |
| SQLite | Coherent for local prototype and C4.8 proof. | Move real data to PostgreSQL/managed DB. |
| Vitest/Supertest/Playwright | Strong rattrapage validation. | Add CI, coverage thresholds and more negative tests. |
| Docker Compose/Nginx | Strong reproducible deployment proof. | Move to managed runtime with secrets/TLS/monitoring. |

## Backup Content C — Workshop-Final Vs Current

| Topic | `workshop-final` | Current rattrapage |
|---|---|---|
| Tests | No committed automated test evidence found. | 69 backend tests + 2 E2E pass. |
| Scoring defects | Incomplete diagnosis and negative offers possible. | Corrected and covered by non-regression tests. |
| API URL/DB config | Local-oriented hardcoded values. | Env/proxy/database URL configurable. |
| Deployment | Manual local launch. | Docker Compose clean deployment proof. |
| Versioning evidence | Less structured workshop history. | Tag, branch strategy and C4.9 evidence. |
| Auth/RBAC | Absent. | Still absent, P0 recommendation. |
| KPI data | Mock-backed. | Still mock-backed, P1 recommendation. |
| SQLite | Local dev DB. | Docker volume SQLite, still future DB evolution. |

## Oral Script

Pour C4.10, j'ai réalisé un audit technique du projet en distinguant deux états: le rendu initial `workshop-final` et l'état actuel de la branche `rattrapage-bc4`. Le point important est que ce projet reste un prototype de workshop: sur cinq jours, des choix comme TypeScript, React, Express, Prisma, SQLite et même du JSON stocké en texte étaient cohérents, parce qu'ils permettaient d'aller vite, de tester le parcours métier et de livrer une démonstration fonctionnelle. Le rattrapage a renforcé cette base avec 69 tests backend, 2 tests E2E, des corrections de scoring, une configuration Docker Compose reproductible et un historique Git lisible. En revanche, dès que la cible devient une production avec de vraies données client, les contraintes changent. Les principaux bloqueurs sont l'absence d'authentification et de rôles, les KPI encore calculés depuis des mocks, SQLite qui limite la concurrence et l'exploitation industrielle, les champs JSON string difficiles à analyser, et l'observabilité minimale. J'ai donc priorisé la roadmap par risque et effort: P0 pour sécuriser les données réelles, P1 pour fiabiliser le pilote avec KPI Prisma, transactions et base PostgreSQL, puis P2 pour industrialiser la maintenabilité avec découpage frontend, contrat API typé et CI. La conclusion n'est pas que les choix initiaux étaient mauvais: ils étaient adaptés au prototype. L'audit montre surtout quels choix doivent évoluer quand les contraintes passent d'une démonstration à une exploitation réelle.

## Jury Questions

1. Quel est le principal risque actuel ?

L'absence d'authentification et de RBAC. Si l'API est exposée, un client non autorisé peut lire ou modifier des dossiers contenant des données personnelles et commerciales.

2. Pourquoi SQLite était un bon choix ?

Pour un prototype court, SQLite évite un serveur externe, simplifie l'installation, fonctionne très bien avec Prisma et facilite les tests isolés.

3. Pourquoi SQLite devient une limite ?

En production multi-utilisateurs, il faut gérer concurrence, sauvegardes, monitoring, accès centralisé et éventuellement plusieurs instances backend. SQLite n'est pas le meilleur outil pour cela.

4. Pourquoi ne pas avoir utilisé PostgreSQL dès le workshop ?

Le workshop avait une contrainte de temps et de démonstration. Ajouter PostgreSQL aurait augmenté la complexité opérationnelle sans apporter beaucoup de valeur pour le prototype initial.

5. Pourquoi le JSON string ?

Il a permis de stocker rapidement des sections de diagnostic variables sans multiplier les tables pendant le prototype.

6. Est-ce une mauvaise pratique ?

Pas toujours. C'est acceptable pour des détails flexibles et peu requêtés. Cela devient une limite pour les champs qu'on doit filtrer, valider, indexer ou analyser.

7. Pourquoi les KPI mocks sont-ils problématiques ?

Parce que le coeur métier est en base Prisma, mais les KPI lisent une source différente. Les indicateurs peuvent donc ne pas refléter les vrais dossiers.

8. Quelle serait votre priorité numéro 1 avant production ?

Authentification et RBAC côté serveur, parce que c'est le prérequis pour protéger les données client et les actions de décision.

9. Pourquoi l'authentification est-elle critique ?

Le système contient noms, téléphones, emails, dossiers et offres commerciales. Sans authentification, il n'y a pas de contrôle d'accès ni d'attribution des actions.

10. Quelle différence entre audit et correction ?

L'audit identifie, justifie et priorise les risques. La correction modifie le produit. Pour C4.10, l'objectif est le rapport d'audit, pas de changer encore le système.

11. Pourquoi ne pas corriger tous les problèmes maintenant ?

Parce que certaines corrections, comme auth ou migration PostgreSQL, changent l'architecture et demandent cadrage, tests, choix produit et déploiement. Les faire vite serait risqué.

12. Comment avez-vous calculé les priorités ?

Avec impact, probabilité, exposition aux données réelles et effort. Les risques de sécurité et de cohérence des données passent avant les optimisations.

13. Comment avez-vous estimé les efforts ?

Avec une échelle relative: XS, S, M, L, XL, en supposant un développeur qui connaît déjà le code. Ce sont des tailles de planification, pas des engagements.

14. Quels problèmes ont déjà été corrigés grâce à l'audit ?

Pendant le rattrapage, des défauts de scoring ont été corrigés: diagnostic incomplet, offre négative, libellés de diagnostic mal interprétés et détails de refus mal persistés.

15. Quels tests manquent encore ?

Il manque surtout des tests d'auth/RBAC, de transactions, de KPI Prisma, de cas d'erreur frontend, de pagination et de non-régression sur les dépendances.

16. Docker Compose est-il votre architecture cible ?

Non. C'est une preuve de déploiement reproductible pour le prototype. Pour une vraie production, je choisirais une plateforme managée avec secrets, TLS, monitoring et backups.

17. Pourquoi PostgreSQL en production ?

PostgreSQL apporte concurrence, requêtes analytiques, indexation, sauvegardes, supervision et exploitation multi-utilisateurs bien mieux adaptées que SQLite.

18. Que garderiez-vous de l'architecture actuelle ?

Je garderais TypeScript, React/Vite, l'API Express si le périmètre reste simple, Prisma, les migrations, les tests automatisés et le principe de déploiement containerisé.

19. Quel choix technique regrettez-vous le plus ?

Le mélange entre données réelles Prisma et données mockées pour les KPI, car cela crée deux sources de vérité dans la même application.

20. Si vous aviez deux semaines de plus, que feriez-vous ?

Je ferais auth/RBAC, KPI Prisma, transactions critiques, migration PostgreSQL pilote, nettoyage des dépendances, puis découpage du gros composant frontend et contrat API typé.
