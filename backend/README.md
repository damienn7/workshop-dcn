# Diag' Seconde Vie — API (backend)

Minimal TypeScript + Express backend to support the Diag' Seconde Vie prototype.

Installation

```
cd backend
npm install
npm run dev
```

L'API démarre sur `http://localhost:4000`.

Endpoints principaux

- `GET /health` — état du service
- `GET /api/cases` — liste compacte des dossiers
- `GET /api/cases/:caseNumber` — détail d'un dossier
- `POST /api/cases` — créer un dossier simple

- Diagnostic:
  - `POST /api/cases/:caseNumber/diagnosis/start`
  - `PUT  /api/cases/:caseNumber/diagnosis/identification`
  - `PUT  /api/cases/:caseNumber/diagnosis/frame-fork`
  - `PUT  /api/cases/:caseNumber/diagnosis/brakes`
  - `PUT  /api/cases/:caseNumber/diagnosis/transmission`
  - `PUT  /api/cases/:caseNumber/diagnosis/wheels-tires`
  - `PUT  /api/cases/:caseNumber/diagnosis/finishing`
  - `GET  /api/cases/:caseNumber/diagnosis`

- Scoring:
  - `POST /api/cases/:caseNumber/score`
  - `GET  /api/cases/:caseNumber/score`

- Decision:
  - `POST /api/cases/:caseNumber/decision/accept`
  - `POST /api/cases/:caseNumber/decision/refuse`

- KPIs:
  - `GET /api/kpis/summary`

Exemples curl

```
curl http://localhost:4000/health
curl http://localhost:4000/api/cases
curl http://localhost:4000/api/cases/DEC-00487
curl -X POST http://localhost:4000/api/cases/DEC-00487/diagnosis/start
curl -X POST http://localhost:4000/api/cases/DEC-00487/score
curl http://localhost:4000/api/kpis/summary
```

Notes

- Données mockées en mémoire dans `src/data/` (modifiable).
- TypeScript strict; zod pour validation.
