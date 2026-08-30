# workshop-dcn

## Lancer le prototype avec backend local

1. Démarrer le backend (port 4000):

```bash
cd backend
npm install
npm run dev
```

2. Démarrer le frontend (Vite):

```bash
cd DecathProto
npm install
npm run dev
```

Le frontend Vite démarre normalement sur `http://localhost:5173` (ou le port suivant disponible).

Exemples curl utiles:

```
curl http://localhost:4000/health
curl http://localhost:4000/api/cases
curl -X POST http://localhost:4000/api/cases/DEC-00487/diagnosis/start
curl -X POST http://localhost:4000/api/cases/DEC-00487/score
curl http://localhost:4000/api/kpis/summary
```

## Versioning and project history

Main Git references:

- `feature/web`: original workshop development line.
- `workshop-final`: immutable tag preserving the original workshop-final state.
- `rattrapage-bc4`: isolated branch for supplementary BC4 evidence and corrections.

Inspect the history:

```bash
git log --oneline --decorate --graph
git log --oneline workshop-final..rattrapage-bc4
```

Rattrapage strategy:

- Tests were committed before corrective fixes where defects were identified.
- Fixes, deployment configuration, Docker packaging and evidence documents were kept in separate atomic commits.
- This makes the history easier to review, compare, debug and explain to a jury.
