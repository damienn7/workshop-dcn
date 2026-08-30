# C4.8 — Deployment Evidence

Branch verified: `rattrapage-bc4`.

Evidence date: 2026-08-30.

Immutable reference preserved: `workshop-final`.

Important safety point: `backend/prisma/dev.db` was already locally modified before C4.8 work began. It was never staged, reset, deleted, copied into the Docker image, used as the Docker database, or committed. The final status still leaves it unstaged.

## Baseline Audit

Initial repository checks:

```text
git branch --show-current
rattrapage-bc4

git status --short
 M backend/prisma/dev.db

git log --oneline --decorate -5
64ce999 (HEAD -> rattrapage-bc4) docs: add C4.5 API and database evidence
5e098ba (origin/rattrapage-bc4) docs: finalize C4.3 recette evidence
457e63e docs: add current architecture audit
195307e fix: persist and expose refusal decision details
4850c06 fix: align diagnosis values with scoring rules
```

Docker availability:

```text
docker --version
Docker version 28.3.2, build 578ccf6

docker compose version
Docker Compose version v2.38.2-desktop.1
```

Backend audit:

| Point | Result |
|---|---|
| Runtime/package manager | Node 20, npm with `package-lock.json`. Local audit used Node `v20.19.4` and npm `10.8.2`; Docker uses `node:20-bookworm-slim`. |
| `npm ci` | PASS. npm reported 7 audit vulnerabilities already outside C4.8 scope. |
| `npm run build` | PASS. |
| Production entry point | `node dist/server.js`, exposed by `backend/package.json` script `start`. |
| `PORT` | Configurable through `process.env.PORT`, fallback `4000`. |
| `DATABASE_URL` | Prisma schema uses `env("DATABASE_URL")`; runtime client uses `DATABASE_URL` with local fallback `file:./prisma/dev.db` for development only. |
| Prisma migrations | Container startup runs `npx prisma migrate deploy` from `backend/docker-entrypoint.sh`. |
| Seed | Not required for startup; an empty migrated database supports the validated API flow. |
| CORS | `CORS_ORIGINS` comma-separated env var, with local Vite origins as development fallback. |
| Hardcoded localhost | Kept only as development fallback or docs/tests; Docker browser traffic uses relative `/api`. |
| Runtime files | `dist`, `package.json`, `package-lock.json`, production `node_modules`, `prisma/schema.prisma`, `prisma/migrations`, `docker-entrypoint.sh`. |

Frontend audit:

| Point | Result |
|---|---|
| `npm ci` | PASS. npm reported 5 audit vulnerabilities already outside C4.8 scope. |
| `npm run build` | PASS. Existing Vite CSS minify warning remains unchanged: `Expected identifier but found "10px"` for `.photo-placeholder .text-[10px]`. |
| API base URL | `DecathProto/src/imports/api.ts` reads `VITE_API_BASE_URL`. |
| Localhost dependency | Production no longer depends on absolute localhost; development fallback remains `http://localhost:4000`. |
| Relative `/api` | Docker build passes `VITE_API_BASE_URL=/api`. |
| SPA fallback | Nginx uses `try_files $uri $uri/ /index.html`. |
| Dist directory | Vite generates `DecathProto/dist`. |

Database audit:

| Point | Result |
|---|---|
| ORM | Prisma with SQLite provider. |
| Schema | `backend/prisma/schema.prisma`. |
| Migrations | `backend/prisma/migrations/20260618131614_init/migration.sql`. |
| Fresh database creation | `prisma migrate deploy` creates `/app/data/app.db` from migrations in the Docker volume. |
| Local `dev.db` | Not used by Compose and not copied into runtime image. |

Validation of existing application after configuration changes:

```text
cd backend && npm test
5 test files PASS, 69 tests PASS

cd backend && npm run typecheck
PASS

cd DecathProto && npm run build
PASS with the known unchanged Vite CSS warning

cd DecathProto && npm run test:e2e
2 tests PASS, with existing NO_COLOR environment warnings
```

## Criterion 1 — Deployment Script Exists And Is Readable

Weight: 6 points.

Implemented deployment artifacts:

| Artifact | Role |
|---|---|
| `compose.yaml` | One Compose deployment with `backend`, `frontend`, health checks, `sqlite_data` volume, and frontend host port `8080`. |
| `backend/Dockerfile` | Multi-stage backend image: deterministic `npm ci`, Prisma client generation, TypeScript build, production runtime. |
| `backend/docker-entrypoint.sh` | Small startup script: requires `DATABASE_URL`, creates `/app/data`, runs `npx prisma migrate deploy`, then starts Node. |
| `backend/.dockerignore` | Excludes host `node_modules`, `dist`, `.env`, logs, and `prisma/dev.db` / SQLite files from the image context. |
| `DecathProto/Dockerfile` | Multi-stage frontend image: `npm ci`, Vite build, Nginx runtime. |
| `DecathProto/nginx.conf` | Serves React static files, provides SPA fallback, proxies `/api/` and `/health` to the backend service. |
| `DecathProto/.dockerignore` | Excludes host dependencies, local build output, env files, and test reports. |
| `scripts/verify-deployment.sh` | Readable automated proof script using `set -euo pipefail`. |
| `DEPLOYMENT.md` | Human deployment guide with prerequisites, startup, access, stop, reset, and database explanation. |

Main deployment command:

```bash
docker compose up --build -d
```

Verdict: **DEMONSTRATED**.

Points: **6 / 6**.

## Criterion 2 — Deployment Demonstrably Works

Weight: 4 points.

Compose configuration validation:

```text
docker compose -p workshop-dcn-c48-clean config
COMPOSE_CONFIG_OK
```

Important resolved Compose values:

```text
backend DATABASE_URL=file:/app/data/app.db
backend volume workshop-dcn-c48-clean_sqlite_data -> /app/data
frontend build arg VITE_API_BASE_URL=/api
frontend port 8080:80
```

Automated verification command executed:

```bash
CLEANUP=1 COMPOSE_PROJECT_NAME=workshop-dcn-c48-clean scripts/verify-deployment.sh
```

Relevant output:

```text
Validating compose configuration...
Starting from a clean Compose project and empty SQLite volume...
Building images without cache...
backend  Built
frontend  Built
Starting services...
Container workshop-dcn-c48-clean-backend-1  Healthy
OK: frontend responds at http://localhost:8080/
OK: backend health through frontend proxy responds at http://localhost:8080/health
GET /api/cases -> []
Created case: DEC-99314
Reloaded case through API: DEC-99314
-rw-r--r-- 1 node node 90112 Aug 30 15:35 /app/data/app.db
OK: /app/prisma/dev.db is absent from the runtime image
PASS: deployment is working from Docker Compose.
```

Container state during the verification:

```text
workshop-dcn-c48-clean-backend-1    Up ... (healthy)   4000/tcp
workshop-dcn-c48-clean-frontend-1   Up ...             0.0.0.0:8080->80/tcp
```

Exact one-command deployment check from the same clean checkout:

```bash
docker compose -p workshop-dcn-c48-onecmd up --build -d
```

HTTP and database results:

```text
FRONTEND_HTTP=200
HEALTH_HTTP=200
API_CASES_HTTP=200
API_CASES_BODY=[]
SQLITE_VOLUME_DB_PRESENT
NO_DEV_DB_IN_RUNTIME_IMAGE
```

Backend startup uses migrations:

```text
Applying Prisma migrations...
Datasource "db": SQLite database "app.db" at "file:/app/data/app.db"
1 migration found
All migrations have been successfully applied.
Diag Seconde Vie API listening on http://localhost:4000
```

Verdict: **DEMONSTRATED**.

Points: **4 / 4**.

## Criterion 3 — Works In A Virgin Environment

Weight: 2 points.

Clean source checkout used:

```bash
git worktree add /tmp/workshop-dcn-c48-clean HEAD
```

Result:

```text
Preparing worktree (detached HEAD 1a61ccb)
HEAD is now at 1a61ccb build: assert deployed database isolation

git -C /tmp/workshop-dcn-c48-clean status --short
<empty>
```

Absence of local dependency/build/env requirements:

```text
NO_BACKEND_NODE_MODULES
NO_FRONTEND_NODE_MODULES
NO_BACKEND_DIST
NO_FRONTEND_DIST
NO_ROOT_ENV
NO_BACKEND_ENV
TRACKED_DEV_DB_PRESENT_BUT_NOT_USED_BY_COMPOSE
```

Fresh Compose resources:

```text
Starting from a clean Compose project and empty SQLite volume...
Volume "workshop-dcn-c48-clean_sqlite_data"  Created
```

Clean-environment runtime proof:

```text
backend  Built
frontend  Built
OK: frontend responds at http://localhost:8080/
OK: backend health through frontend proxy responds at http://localhost:8080/health
GET /api/cases -> []
Created case: DEC-99314
Reloaded case through API: DEC-99314
OK: /app/prisma/dev.db is absent from the runtime image
PASS: deployment is working from Docker Compose.
```

The clean checkout still contains the historically tracked `backend/prisma/dev.db`, but the deployment does not depend on it:

- `backend/.dockerignore` excludes `prisma/dev.db`.
- The backend Dockerfile copies only `prisma/schema.prisma` and `prisma/migrations`.
- Compose mounts `sqlite_data` at `/app/data`.
- `DATABASE_URL` is `file:/app/data/app.db`.
- The verifier asserts `/app/prisma/dev.db` is absent from the runtime image.

Verdict: **DEMONSTRATED**.

Points: **2 / 2**.

## Final C4.8 Verdict

| Criterion | Verdict | Points |
|---|---:|---:|
| 1. A deployment script exists and is readable. | DEMONSTRATED | 6 / 6 |
| 2. The deployment script demonstrably works. | DEMONSTRATED | 4 / 4 |
| 3. The deployment script can be used in a clean/virgin environment. | DEMONSTRATED | 2 / 2 |

Total: **12 / 12**.

## Remaining Limitations

- This is a reproducible prototype deployment, not the final Decathlon production hosting target.
- SQLite is acceptable for the C4.8 proof; PostgreSQL or another managed database would be preferable for an industrial production architecture.
- npm audit still reports dependency vulnerabilities in the existing dependency tree; those are outside this C4.8 deployment proof.
- The frontend build still reports the pre-existing Vite CSS minify warning for `.photo-placeholder .text-[10px]`; the production build succeeds.
