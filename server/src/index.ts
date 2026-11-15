/* FIREWEAVE  - Express application entry point. */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import firmsRoutes from './routes/firms.js';
import analyticsRoutes from './routes/analytics.js';
import importRoutes from './routes/import.js';
import reportsRoutes from './routes/reports.js';
import systemRoutes from './routes/system.js';
import fiaRoutes from './routes/fia.js';
import { errorHandler, notFound } from './middleware.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: 'text/csv', limit: '50mb' }));

app.get('/api/_health', (_req, res) => {
  res.json({ status: 'ok', service: 'fireweave-server', time: new Date().toISOString() });
});

app.use('/api/nasa/firms', firmsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/fia', fiaRoutes);
app.use('/api/ai', fiaRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FIREWEAVE server listening on port ${PORT}`);
  console.log(`FIRMS MAP_KEY configured: ${!!process.env.FIRMS_MAP_KEY && !/^(?:YOUR_|REPLACE|PLACEHOLDER)/i.test(process.env.FIRMS_MAP_KEY.trim())}`);
});

export default app;

