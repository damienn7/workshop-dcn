# C4.8 — PPT Summary

## Slide 1 — C4.8 — Un déploiement reproductible

Visual flow:

```text
Repository
   |
   v
docker compose up --build
   |
   v
+----------------+----------------+
| Frontend       | Backend        |
| React + Nginx  | Node + Express |
+----------------+-------+--------+
                         |
                         v
                      Prisma
                         |
                         v
                  SQLite volume
```

Key message:

```text
Host prerequisites: Git + Docker only

No local dependency on:
Node
npm
Prisma
node_modules
dist
.env
backend/prisma/dev.db
```

Project-specific choices:

- Docker Compose isolates frontend and backend while keeping the deployment readable for the jury.
- Nginx serves the React production build and proxies `/api` and `/health` to the backend container.
- The backend runs compiled Express code with Prisma migrations at startup.
- SQLite is stored in a Docker volume at `/app/data/app.db`.
- `backend/prisma/dev.db` is neither copied into the image nor used by `DATABASE_URL`.

## Slide 2 — C4.8 — Prouvé depuis un environnement vierge

3-step validation:

```text
1. Clean checkout
   git worktree add /tmp/workshop-dcn-c48-clean HEAD

2. Build + startup from Compose
   docker compose up --build -d

3. Runtime checks
   frontend HTTP 200
   backend /health HTTP 200
   /api/cases HTTP 200
   SQLite volume present
   /app/prisma/dev.db absent
```

Factual final results:

```text
Clean checkout commit: 1a61ccb
No backend/node_modules
No DecathProto/node_modules
No backend/dist
No DecathProto/dist
No local .env

CLEANUP=1 COMPOSE_PROJECT_NAME=workshop-dcn-c48-clean scripts/verify-deployment.sh
PASS: deployment is working from Docker Compose.

docker compose -p workshop-dcn-c48-onecmd up --build -d
FRONTEND_HTTP=200
HEALTH_HTTP=200
API_CASES_HTTP=200
SQLITE_VOLUME_DB_PRESENT
NO_DEV_DB_IN_RUNTIME_IMAGE
```

Validation markers:

```text
Script lisible ✅
Déploiement fonctionnel ✅
Environnement vierge ✅
```

## Oral Script

Pour C4.8, j'ai choisi Docker Compose pour fournir une preuve de déploiement reproductible du prototype. L'objectif n'est pas de prétendre que c'est l'architecture finale de production Decathlon, mais de montrer qu'une personne peut récupérer le dépôt et lancer l'application avec Git et Docker uniquement. Le frontend est construit avec Vite puis servi par Nginx. Nginx sert aussi de point d'entrée unique: il affiche l'application React et redirige `/api` et `/health` vers le backend. Le backend est une image Node qui contient le code Express compilé, les dépendances de production, le schema Prisma et les migrations. Au démarrage, l'entrypoint exécute `npx prisma migrate deploy`, ce qui initialise une base SQLite fraîche dans le volume Docker `/app/data/app.db`. La base locale `backend/prisma/dev.db` n'est pas utilisée: elle est ignorée par Docker, non copiée dans l'image, et le script vérifie qu'elle est absente du conteneur. La commande de déploiement est `docker compose up --build -d`. Je l'ai validée depuis un worktree propre, sans `node_modules`, sans `dist`, sans `.env` local, avec des checks HTTP 200 sur le frontend, la santé backend et l'API.

## Jury Questions

1. Pourquoi Docker Compose ?

Docker Compose permet de décrire tout le prototype dans un fichier lisible: frontend, backend, réseau, variables d'environnement, healthchecks et volume SQLite. C'est reproductible et suffisant pour prouver C4.8.

2. Pourquoi ne pas simplement fournir npm install / npm run dev ?

`npm run dev` dépend de Node, npm, Prisma, des ports et de l'environnement local. Compose embarque ces dépendances dans les images et lance une version production-like.

3. Quelle différence entre image et conteneur ?

L'image est le paquet immuable construit par Docker. Le conteneur est l'instance en cours d'exécution de cette image, avec son réseau, son processus et ses volumes.

4. Pourquoi Nginx pour le frontend ?

Le frontend est un build statique React. Nginx le sert efficacement, gère le fallback SPA vers `index.html`, et proxy les appels `/api` vers le backend.

5. Comment le frontend communique-t-il avec le backend ?

Dans le build Docker, `VITE_API_BASE_URL=/api`. Le navigateur appelle donc le même domaine, puis Nginx transfère `/api/` vers le service Compose `backend:4000`.

6. Où est stockée SQLite ?

La base déployée est `/app/data/app.db` dans le conteneur backend, persistée par le volume Docker nommé `sqlite_data`.

7. Que se passe-t-il si le conteneur backend est supprimé ?

Le conteneur peut être recréé. Les données restent dans le volume Docker tant que le volume `sqlite_data` n'est pas supprimé.

8. Que se passe-t-il si le volume est supprimé ?

Les données SQLite sont supprimées. Au prochain démarrage, `prisma migrate deploy` recrée une base vide à partir des migrations.

9. Comment les migrations sont-elles exécutées ?

L'entrypoint backend exécute `npx prisma migrate deploy` avant `node dist/server.js`.

10. Comment prouvez-vous que dev.db n'est pas utilisée ?

Le Dockerfile ne copie que `schema.prisma` et `migrations`, `.dockerignore` exclut `prisma/dev.db`, Compose définit `DATABASE_URL=file:/app/data/app.db`, et le script vérifie `NO_DEV_DB_IN_RUNTIME_IMAGE`.

11. Que signifie environnement vierge ?

C'est un checkout Git propre sans `node_modules`, sans `dist`, sans `.env` local et sans installation locale de Node/npm/Prisma nécessaire pour déployer.

12. Docker Compose est-il suffisant pour une vraie production Decathlon ?

Non. Ici, Compose sert de preuve reproductible pour le prototype RNCP. Une production Decathlon aurait besoin d'une plateforme plus robuste.

13. Que choisiriez-vous réellement pour une production industrielle ?

Je choisirais une plateforme orchestrée ou managée, par exemple Kubernetes ou une offre PaaS/container managée, avec CI/CD, observabilité, sauvegardes et gestion des secrets.

14. Pourquoi ne pas utiliser PostgreSQL ici ?

SQLite suffit pour prouver le déploiement du prototype et limiter la complexité. PostgreSQL resterait le meilleur choix pour une vraie production multi-utilisateurs.

15. Comment géreriez-vous les secrets en vraie production ?

Je ne les mettrais pas dans le dépôt ni dans `compose.yaml`. J'utiliserais un gestionnaire de secrets de la plateforme cible, avec rotation, droits minimaux et audit.
