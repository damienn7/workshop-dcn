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
