/* FIREWEAVE  - analytics routes. All outputs computed from stored observations. */

import { Router } from 'express';
import { z } from 'zod';
import {
  aggregateGrid,
  buildBaseline,
  computeNfai,
  detectAnomalies,
  compareSensors,
} from '../services/harmonization.js';
import { storage } from '../services/storage.js';
import type { FireObservation } from '../types.js';

const router = Router();

const DateRangeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function filterByWindow(obs: FireObservation[], start: string, end: string): FireObservation[] {
  return obs.filter((o) => o.acquisitionDate >= start && o.acquisitionDate <= end);
}

function getRegion(req: any): string {
  return (req.query.region as string) ?? 'Central_Kalimantan_ID';
}

// GET /api/analytics/activity-calendar
router.get('/activity-calendar', (req, res, next) => {
  try {
    const { start, end } = DateRangeSchema.parse({
      start: req.query.start,
      end: req.query.end,
    });
    const sensor = (req.query.sensor as 'MODIS' | 'VIIRS') ?? 'MODIS';
    const source = (req.query.source as string) ?? '';
    const region = getRegion(req);
    const view = (req.query.view as 'raw' | 'harmonized') ?? 'raw';

    const obs = filterByWindow(storage.readObservations(), start, end).filter(
      (o) => o.regionCode === region &&
        (!sensor || o.instrument === sensor) &&
        (!source || o.sourceDataset === source)
    );

    const cells = aggregateGrid(obs, region);
    const calendar = cells.map((cell) => ({
      year: cell.year,
      month: cell.month,
      week: cell.week,
      yearMonth: cell.yearMonth,
      isoWeek: cell.isoWeek,
      latBin: cell.latBin,
      lonBin: cell.lonBin,
      modisCount: cell.modisCount,
      viirsCount: cell.viirsCount,
      totalCount: cell.totalCount,
    }));

    let harmonized: any[] = [];
    if (view === 'harmonized') {
      const monthSet = new Set(cells.map((c) => c.yearMonth));
      const effSource = source || (sensor === 'MODIS' ? 'MODIS_SP' : 'VIIRS_SNPP_SP');
      for (const ym of monthSet) {
        const [y, m] = ym.split('-').map(Number);
        harmonized.push(computeNfai(obs, sensor, effSource, region, y, m));
      }
      harmonized.sort((a, b) => a.period.localeCompare(b.period));
    }

    res.json({
      region,
      sensor,
      source,
      view,
      window: { start, end },
      cells: calendar,
      harmonized,
      method: {
        aggregation: `Spatial bin 0.1Â° Ã— 0.1Â°, monthly aggregation`,
        note: 'RAW DETECTION VIEW = observed hotspot counts. HARMONIZED ACTIVITY VIEW = FIREWEAVE NFAI derived indicator (not an official NASA product).',
      },
    });
  } catch (err: any) {
    next(err);
  }
});

// GET /api/analytics/seasonal-fingerprint
router.get('/seasonal-fingerprint', (req, res, next) => {
  try {
    const sensor = (req.query.sensor as 'MODIS' | 'VIIRS') ?? 'MODIS';
    const source = (req.query.source as string) ?? (sensor === 'MODIS' ? 'MODIS_SP' : 'VIIRS_SNPP_SP');
    const region = getRegion(req);
    const yearsParam = (req.query.years as string) ?? '';
    const years = yearsParam ? yearsParam.split(',').map(Number).filter((y) => !isNaN(y)) : [];

    const obs = storage.readObservations().filter(
      (o) => o.regionCode === region && o.instrument === sensor && o.sourceDataset === source
    );

    const cells = aggregateGrid(obs, region);
    const byYearMonth = new Map<string, { modis: number; viirs: number; total: number }>();
    for (const c of cells) {
      const prev = byYearMonth.get(c.yearMonth) ?? { modis: 0, viirs: 0, total: 0 };
      prev.modis += c.modisCount;
      prev.viirs += c.viirsCount;
      prev.total += c.totalCount;
      byYearMonth.set(c.yearMonth, prev);
    }

    const fingerprint = [...byYearMonth.entries()].map(([ym, v]) => {
      const [y, m] = ym.split('-').map(Number);
      const nfai = computeNfai(obs, sensor, source, region, y, m);
      return { yearMonth: ym, year: y, month: m, ...v, nfai };
    });

    const clim = new Map<number, number[]>();
    for (const f of fingerprint) {
      if (!clim.has(f.month)) clim.set(f.month, []);
      clim.get(f.month)!.push(f.total);
    }
    const climatology = [...clim.entries()].map(([m, vals]) => vals.sort((a, b) => a - b)).map((vals, i) => ({
      month: [...clim.keys()][i],
      median: vals[Math.floor(vals.length / 2)] ?? 0,
      p10: vals[Math.floor(vals.length * 0.1)] ?? 0,
      p90: vals[Math.ceil(vals.length * 0.9) - 1] ?? 0,
    }));

    res.json({
      region,
      sensor,
      source,
      years,
      fingerprint,
      climatology,
      method: 'Monthly detection counts aggregated per year; climatology = median across years per calendar month.',
    });
  } catch (err: any) {
    next(err);
  }
});

// GET /api/analytics/sensor-comparison
router.get('/sensor-comparison', (req, res, next) => {
  try {
    const { start, end } = DateRangeSchema.parse({
      start: req.query.start,
      end: req.query.end,
    });
    const region = getRegion(req);
    const obs = filterByWindow(storage.readObservations(), start, end);

    const monthSet = new Set<string>();
    for (const o of obs) {
      if (o.regionCode !== region) continue;
      monthSet.add(o.acquisitionDate.slice(0, 7));
    }

    const comparisons: any[] = [];
    for (const ym of monthSet) {
      const [y, m] = ym.split('-').map(Number);
      comparisons.push(compareSensors(obs, region, y, m));
    }
    comparisons.sort((a, b) => a.period.localeCompare(b.period));

    res.json({ region, window: { start, end }, comparisons });
  } catch (err: any) {
    next(err);
  }
});

// GET /api/analytics/anomalies
router.get('/anomalies', (req, res, next) => {
  try {
    const { start, end } = DateRangeSchema.parse({
      start: req.query.start,
      end: req.query.end,
    });
    const sensor = (req.query.sensor as 'MODIS' | 'VIIRS') ?? 'MODIS';
    const source = (req.query.source as string) ?? (sensor === 'MODIS' ? 'MODIS_SP' : 'VIIRS_SNPP_SP');
    const region = getRegion(req);

    const obs = storage.readObservations().filter(
      (o) => o.regionCode === region && o.instrument === sensor && o.sourceDataset === source
    );

    const anomalies = detectAnomalies(obs, sensor, source, region, start, end);
    res.json({ region, sensor, source, window: { start, end }, anomalies });
  } catch (err: any) {
    next(err);
  }
});

// POST /api/analytics/harmonize
router.post('/harmonize', (req, res, next) => {
  try {
    const body = z.object({
      start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      region: z.string().optional(),
    }).parse(req.body);
    const region = body.region ?? getRegion(req);
    const obs = filterByWindow(storage.readObservations(), body.start, body.end).filter((o) => o.regionCode === region);

    const cells = aggregateGrid(obs, region);
    const modisBaseline = buildBaseline(obs, 'MODIS', 'MODIS_SP', region);
    const viirsBaseline = buildBaseline(obs, 'VIIRS', 'VIIRS_SNPP_SP', region);

    const months = new Set(cells.map((c) => c.yearMonth));
    const nfai: any[] = [];
    for (const ym of months) {
      const [y, m] = ym.split('-').map(Number);
      nfai.push(computeNfai(obs, 'MODIS', 'MODIS_SP', region, y, m));
      nfai.push(computeNfai(obs, 'VIIRS', 'VIIRS_SNPP_SP', region, y, m));
    }

    res.json({
      region,
      window: { start: body.start, end: body.end },
      gridCells: cells.length,
      totalObservations: obs.length,
      baselines: { modis: modisBaseline, viirs: viirsBaseline },
      nfai,
      method: {
        aggregation: '0.1Â° Ã— 0.1Â° spatial bins, weekly + monthly temporal aggregation',
        baseline: 'Per-sensor monthly median & MAD across historical years',
        nfai: 'FIREWEAVE Normalized Fire Activity Index (derived project metric, not a NASA product)',
      },
    });
  } catch (err: any) {
    next(err);
  }
});

export default router;


