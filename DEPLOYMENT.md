# Deployment

This project can be deployed as a production-like prototype with Docker Compose.

The chosen architecture is:

```text
Browser
  |
  v
Frontend container: React static build served by Nginx
  |
  | /api and /health
  v
Backend container: Node + Express
  |
  v
Prisma
  |
  v
SQLite database in a Docker volume
```

This is appropriate for the workshop prototype because it is reproducible, isolated from host Node/npm/Prisma installations, and starts from disposable containers with deterministic dependency installation. It is deployment evidence for RNCP C4.8, not a final Decathlon enterprise production architecture.

## Prerequisites

- Git
- Docker with Docker Compose

No host Node, npm, Prisma, local `.env`, local `node_modules`, or local build artifacts are required for the Compose deployment.

## Deployment

```bash
git clone <repository-url> workshop-dcn
cd workshop-dcn
docker compose up --build -d
```

The frontend is published on:

```text
http://localhost:8080
```

Useful checks:

```bash
curl http://localhost:8080/
curl http://localhost:8080/health
curl http://localhost:8080/api/cases
```

## Database

The deployed SQLite database is created inside the named Docker volume `sqlite_data` and mounted in the backend container at:

```text
/app/data/app.db
```

The backend receives:

```text
DATABASE_URL=file:/app/data/app.db
```

At container startup, `backend/docker-entrypoint.sh` runs:

```bash
npx prisma migrate deploy
```

This creates or updates the database from committed Prisma migrations.

`backend/prisma/dev.db` is not the deployed database. It is excluded by `backend/.dockerignore`, is not copied by the backend Dockerfile, and is not mounted by Compose.

## Stop

Stop containers while keeping the SQLite volume:

```bash
docker compose down
```

## Reset Database

Stop containers and remove the SQLite volume:

```bash
docker compose down -v
```

On the next startup, Prisma migrations will recreate a fresh SQLite database in the Docker volume.

## Automated Verification

The repository includes a readable verification script:

```bash
CLEANUP=1 scripts/verify-deployment.sh
```

It validates the Compose configuration, starts from a clean Compose project and empty SQLite volume, builds images, starts services, checks the frontend, checks backend health through Nginx, exercises `/api/cases`, creates and reloads a case, verifies `/app/data/app.db`, and asserts that `/app/prisma/dev.db` is absent from the backend runtime image.
