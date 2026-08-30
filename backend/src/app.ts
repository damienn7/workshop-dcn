import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';

import casesRouter from './modules/cases/cases.routes.js';
import diagnosticsRouter from './modules/diagnostics/diagnostics.routes.js';
import scoringRouter from './modules/scoring/scoring.routes.js';
import kpisRouter from './modules/kpis/kpis.routes.js';
import { ApiError } from './shared/ApiError.js';

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

const configuredAllowedOrigins = process.env.CORS_ORIGINS
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredAllowedOrigins?.length
  ? configuredAllowedOrigins
  : defaultAllowedOrigins;

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'diag-seconde-vie-api' });
});

app.use('/api/cases', casesRouter);
app.use('/api/cases', diagnosticsRouter);
app.use('/api/cases', scoringRouter);
app.use('/api/kpis', kpisRouter);

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, details: err.details ?? [] });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Données invalides', details: err.errors.map(e => e.message) });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: 'Internal error', details: [] });
});

export default app;
