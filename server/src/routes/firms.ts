/* FIREWEAVE  - NASA FIRMS proxy routes. MAP_KEY stays server-side only. */

import { Router } from 'express';
import { z } from 'zod';
import {
  getDataAvailability,
  getObservationsRaw,
  parseFirmsCsv,
  FIRMS_SOURCES,
  LIVE_SOURCE_FOR_DATASET,
  checkHealth,
} from '../services/firmsConnector.js';
import { normalizeRows } from '../services/ingestion.js';
import { storage } from '../services/storage.js';
import type { FireObservation, SourceDataset } from '../types.js';

const router = Router();

const validCalendarDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
};

const BBoxSchema = z.object({
  west: z.coerce.number().min(-180).max(180),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  north: z.coerce.number().min(-90).max(90),
});

// Envelope for Central Kalimantan's complete province boundary (geoBoundaries ADM1).
// Requested five-day FIRMS area is bounded to this study region rather than global.
const defaultBBox = { west: 110.7, south: -3.6, east: 115.9, north: 0.9 };
const defaultRegion = 'Central_Kalimantan_ID';

// GET /api/nasa/firms/availability
router.get('/availability', async (_req, res, next) => {
  try {
    const csv = await getDataAvailability();
    res.type('text/csv').send(csv);
  } catch (err: any) {
    next(err);
  }
});

// GET /api/nasa/firms/observations
router.get('/observations', async (req, res, next) => {
  try {
    const parsed = BBoxSchema.safeParse({
      west: req.query.west,
      south: req.query.south,
      east: req.query.east,
      north: req.query.north,
    });
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid bounding box', details: parsed.error.flatten() });
      return;
    }
    const { west, south, east, north } = parsed.data;
    const source = (req.query.source as SourceDataset) ?? 'MODIS_SP';
    if (!FIRMS_SOURCES.includes(source)) {
      res.status(400).json({ error: `Invalid source. Supported: ${FIRMS_SOURCES.join(', ')}` });
      return;
    }
    // Latest is the FIRMS default; omitting DATE prevents silently querying a
    // prior calendar day when the daily feed has not yet been processed.
    const requestedDate = typeof req.query.date === 'string' ? req.query.date : undefined;
    if (requestedDate && !validCalendarDate(requestedDate)) {
      res.status(400).json({ error: 'date must be a valid calendar date using YYYY-MM-DD format' });
      return;
    }
    const dayRange = Math.min(Math.max(Number(req.query.dayRange ?? 1), 1), 5);

    const requestSource = requestedDate ? source : (LIVE_SOURCE_FOR_DATASET[source] ?? source);
    const rawCsv = await getObservationsRaw(requestSource, west, south, east, north, requestedDate, dayRange);
    let headers: string[] = [];
    let rows: Record<string, string>[] = [];
    let empty = false;

    try {
      const parsedCsv = parseFirmsCsv(rawCsv);
      headers = parsedCsv.headers;
      rows = parsedCsv.rows;
      empty = rows.length === 0;
    } catch (err: any) {
      // Never return or log an upstream URL: FIRMS puts the secret MAP_KEY in its path.
      // NASA error bodies remain visible without exposing credential-bearing requests.
      res.status(502).json({
        error: 'NASA FIRMS request failed',
        message: String(err?.message ?? err).replace(/https?:\/\/[^\s"']+/gi, '[upstream NASA request]'),
        source: requestSource,
        date: requestedDate ?? 'latest available',
        dayRange,
      });
      return;
    }

    const regionCode = req.query.region as string ?? defaultRegion;
    const result = normalizeRows(rows, regionCode, requestSource);

    // Persist accepted observations
    let newlyStoredCount = result.accepted.length;
    if (result.accepted.length > 0) {
      const previousCount = storage.readObservations().length;
      newlyStoredCount = Math.max(0, storage.addObservations(result.accepted).length - previousCount);
    }

    res.json({
      source: requestSource,
      processingType: requestSource.endsWith('_SP') ? 'STANDARD' : 'NEAR_REAL_TIME',
      satellite: requestSource.startsWith('MODIS') ? 'Terra/Aqua' : requestSource.startsWith('VIIRS_SNPP') ? 'Suomi-NPP' : requestSource.startsWith('VIIRS_NOAA20') ? 'NOAA-20' : 'NOAA-21',
      requestedDate: requestedDate ?? null,
      latest: !requestedDate,
      region: regionCode,
      bbox: { west, south, east, north },
      date: requestedDate ?? (rows.reduce((max, row) =>
        (row.acq_date ?? '') > max ? (row.acq_date ?? '') : max, ''
      ) || null),
      dayRange,
      retrievedAt: new Date().toISOString(),
      empty,
      recordCount: rows.length,
      acceptedCount: newlyStoredCount,
      retrievedAcceptedCount: result.accepted.length,
      rejectedCount: result.rejected.length,
      stats: result.stats,
      rejected: result.rejected.slice(0, 20), // preview only
      observations: result.accepted,
      nasaAttribution: 'Data provided by NASA FIRMS (https://firms.modaps.eosdis.nasa.gov/)',
    });
  } catch (err: any) {
    next(err);
  }
});

// GET /api/nasa/firms/health
router.get('/health', async (_req, res) => {
  const health = await checkHealth();
  res.status(health.ok ? 200 : 503).json(health);
});

export default router;

