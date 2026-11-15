/* FIREWEAVE - processing unit tests: ingestion QC, harmonization, baselines, NFAI, anomalies. */
import { describe, it, expect } from 'vitest';
import type { FireObservation, SourceDataset } from '../src/services/harmonization.js';
import { normalizeRows } from '../src/services/ingestion.js';
import {
  aggregateGrid,
  buildBaseline,
  computeNfai,
  detectAnomalies,
  compareSensors,
} from '../src/services/harmonization.js';
import { parseFirmsCsv, chunkDateRange } from '../src/services/firmsConnector.js';

// Keep date parsing deterministic regardless of the host timezone.
process.env.TZ = 'UTC';

const NOW = new Date('2024-06-01T00:00:00Z').toISOString();

function baseObs(overrides: Partial<FireObservation> = {}): FireObservation {
  const source = (overrides.sourceDataset ?? 'MODIS_NRT') as SourceDataset;
  const isVii = source.startsWith('VIIRS');
  return {
    id: overrides.id ?? 'obs_test_1',
    sourceDataset: source,
    satellite: overrides.satellite ?? (isVii ? 'SNPP' : 'Terra'),
    instrument: overrides.instrument ?? (isVii ? 'VIIRS' : 'MODIS'),
    processingType: overrides.processingType ?? 'NEAR_REAL_TIME',
    latitude: overrides.latitude ?? 34.05,
    longitude: overrides.longitude ?? -118.2,
    acquisitionDate: overrides.acquisitionDate ?? '2024-01-15',
    acquisitionTime: overrides.acquisitionTime ?? '1345',
    confidence: overrides.confidence ?? 'nominal',
    confidenceNumeric: overrides.confidenceNumeric ?? 0.7,
    dayNight: overrides.dayNight ?? 'D',
    rawRecord: overrides.rawRecord ?? {},
    importedAt: NOW,
    ...overrides,
  } as FireObservation;
}

function monthObs(
  source: SourceDataset,
  year: number,
  month: number,
  count: number,
): FireObservation[] {
  const out: FireObservation[] = [];
  const isVii = source.startsWith('VIIRS');
  for (let i = 0; i < count; i++) {
    const day = String(1 + (i % 28)).padStart(2, '0');
    out.push(
      baseObs({
        id: `obs_${source}_${year}_${String(month).padStart(2, '0')}_${i}`,
        sourceDataset: source,
        instrument: isVii ? 'VIIRS' : 'MODIS',
        acquisitionDate: `${year}-${String(month).padStart(2, '0')}-${day}`,
      }),
    );
  }
  return out;
}

describe('normalizeRows', () => {
  it('accepts a valid MODIS NRT row and preserves native attributes', () => {
    const rows = [{
      latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-15',
      acq_time: '1345', satellite: 'terra', instrument: 'MODIS',
      confidence: 'nominal', frp: '12.5', version: 'Collection 6.1 NRT',
    }];
    const result = normalizeRows(rows, 'TEST');
    expect(result.accepted).toHaveLength(1);
    expect(result.rejected).toHaveLength(0);
    const o = result.accepted[0];
    expect(o.id).toMatch(/^obs_/);
    expect(o.sourceDataset).toBe('MODIS_NRT');
    expect(o.processingType).toBe('NEAR_REAL_TIME');
    expect(o.latitude).toBe(34.05);
    expect(o.longitude).toBe(-118.2);
    expect(o.acquisitionDate).toBe('2024-01-15');
    expect(o.acquisitionTime).toBe('1345');
    expect(o.confidence).toBe('nominal');
    expect(o.rawRecord.instrument).toBe('MODIS');
  });

  it('rejects rows with invalid or missing required attributes', () => {
    const rows = [
      { longitude: '-118.20', acq_date: '2024-01-15', satellite: 'terra', instrument: 'MODIS' },
      { latitude: '34.05', longitude: '', acq_date: '2024-01-15', satellite: 'terra', instrument: 'MODIS' },
      { latitude: '34.05', longitude: '-118.20', acq_date: 'not-a-date', satellite: 'terra', instrument: 'MODIS' },
      { latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-15', satellite: '', instrument: 'MODIS' },
      { latitude: '91.0', longitude: '-118.20', acq_date: '2024-01-15', satellite: 'terra', instrument: 'MODIS' },
    ];
    const result = normalizeRows(rows, 'TEST');
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(5);
    expect(result.stats.missingAttributes.latitude).toBe(1);
    expect(result.stats.rejected).toBe(5);
  });

  it('rejects unrecognized satellite/instrument combinations', () => {
    const rows = [
      { latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-15', satellite: 'pluto', instrument: 'MODIS' },
      { latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-15', satellite: 'terra', instrument: 'AVHRR' },
    ];
    const result = normalizeRows(rows, 'TEST');
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected[0]!.reason).toContain('unrecognized_satellite_instrument');
  });

  it('derives STANDARD vs NEAR_REAL_TIME from processing version', () => {
    const sp = normalizeRows(
      [{ latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-15', satellite: 'terra', instrument: 'MODIS', version: 'Collection 6.1 SP' }],
      'TEST',
    );
    expect(sp.accepted[0]!.sourceDataset).toBe('MODIS_SP');
    expect(sp.accepted[0]!.processingType).toBe('STANDARD');

    const nrt = normalizeRows(
      [{ latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-15', satellite: 'snpp', instrument: 'VIIRS', version: 'V1 NRT' }],
      'TEST',
    );
    expect(nrt.accepted[0]!.sourceDataset).toBe('VIIRS_SNPP_NRT');
    expect(nrt.accepted[0]!.processingType).toBe('NEAR_REAL_TIME');
  });

  it('sourceOverride forces dataset and processing type', () => {
    const rows = [{ latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-15', satellite: 'terra', instrument: 'MODIS' }];
    const result = normalizeRows(rows, 'TEST', 'VIIRS_NOAA21_SP');
    expect(result.accepted[0]!.sourceDataset).toBe('VIIRS_NOAA21_SP');
    expect(result.accepted[0]!.processingType).toBe('STANDARD');
    expect(result.accepted[0]!.instrument).toBe('MODIS');
  });

  it('tracks stats by source', () => {
    const rows = [
      { latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-15', satellite: 'terra', instrument: 'MODIS' },
      { latitude: '35.0', longitude: '-119.0', acq_date: '2024-01-15', satellite: 'snpp', instrument: 'VIIRS' },
      { latitude: '34.05', longitude: '-118.20', acq_date: '2024-01-16', satellite: 'aqua', instrument: 'MODIS' },
    ];
    const result = normalizeRows(rows, 'TEST');
    expect(result.stats.bySource).toMatchObject({ MODIS_NRT: 2, VIIRS_SNPP_NRT: 1 });
    expect(result.stats.totalRows).toBe(3);
    expect(result.stats.accepted).toBe(3);
  });
});

describe('aggregateGrid', () => {
  it('bins observations by 0.1° cell and month, keeping sensor identity', () => {
    const obs = [
      baseObs({ sourceDataset: 'MODIS_NRT', latitude: 34.05, longitude: -118.20, acquisitionDate: '2024-01-15' }),
      baseObs({ sourceDataset: 'MODIS_SP', latitude: 34.051, longitude: -118.20, acquisitionDate: '2024-01-20' }),
      baseObs({ sourceDataset: 'VIIRS_SNPP_NRT', latitude: 34.05, longitude: -118.20, acquisitionDate: '2024-01-17' }),
    ];
    const cells = aggregateGrid(obs, 'CA');
    expect(cells).toHaveLength(1);
    const c = cells[0]!;
    expect(c.modisCount).toBe(2);
    expect(c.viirsCount).toBe(1);
    expect(c.totalCount).toBe(3);
    expect(c.modisDatasets.sort()).toEqual(['MODIS_NRT', 'MODIS_SP']);
    expect(c.viirsDatasets).toEqual(['VIIRS_SNPP_NRT']);
    expect(c.latBin).toBe(34);
    expect(c.lonBin).toBe(-118.2);
    expect(c.yearMonth).toBe('2024-01');
  });

  it('splits cells across months and sensors separately', () => {
    const obs = [
      baseObs({ sourceDataset: 'MODIS_NRT', latitude: 34.05, longitude: -118.20, acquisitionDate: '2024-01-15' }),
      baseObs({ sourceDataset: 'MODIS_NRT', latitude: 34.05, longitude: -118.20, acquisitionDate: '2024-02-15' }),
    ];
    const cells = aggregateGrid(obs, 'CA');
    expect(cells).toHaveLength(2);
    expect(cells.map((c) => c.yearMonth)).toEqual(['2024-01', '2024-02']);
  });
});

describe('buildBaseline', () => {
  it('is sufficient with 3+ years and computes monthly stats', () => {
    const obs: FireObservation[] = [];
    for (const y of [2019, 2020, 2021, 2022]) {
      obs.push(...monthObs('MODIS_NRT', y, 1, 10));
      obs.push(...monthObs('MODIS_NRT', y, 6, 5));
    }
    const base = buildBaseline(obs, 'MODIS', 'MODIS_NRT', 'CA');
    expect(base.sufficient).toBe(true);
    expect(base.yearsCovered).toBe(4);
    const jan = base.monthlyStats.find((s) => s.month === 1)!;
    expect(jan.n).toBe(4);
    expect(jan.median).toBe(10);
    expect(jan.mad).toBe(0);
    expect(jan.p10).toBe(10);
    expect(jan.p90).toBe(10);
    const jun = base.monthlyStats.find((s) => s.month === 6)!;
    expect(jun.median).toBe(5);
    expect(base.totalObservations).toBe(4 * (10 + 5));
    expect(Object.keys(base.annualTotals)).toEqual(['2019', '2020', '2021', '2022']);
  });

  it('is NOT sufficient with fewer than 3 years', () => {
    const obs = [...monthObs('MODIS_NRT', 2023, 1, 10), ...monthObs('MODIS_NRT', 2023, 6, 5)];
    const base = buildBaseline(obs, 'MODIS', 'MODIS_NRT', 'CA');
    expect(base.sufficient).toBe(false);
    expect(base.yearsCovered).toBe(1);
  });

  it('returns empty stats for a sensor with no observations', () => {
    const base = buildBaseline([], 'VIIRS', 'VIIRS_SNPP_NRT', 'CA');
    expect(base.sufficient).toBe(false);
    expect(base.monthlyStats).toEqual([]);
    expect(base.totalObservations).toBe(0);
  });
});

describe('computeNfai', () => {
  const history: FireObservation[] = [];
  for (const y of [2019, 2020, 2021, 2022, 2023]) {
    history.push(...monthObs('MODIS_NRT', y, 1, 10));
  }

  it('clamps NFAI to [-1, 1] and validates fields', () => {
    const nfai = computeNfai(history, 'MODIS', 'MODIS_NRT', 'CA', 2024, 1);
    expect(nfai.nfai).toBeGreaterThanOrEqual(-1);
    expect(nfai.nfai).toBeLessThanOrEqual(1);
    expect(nfai.period).toBe('2024-01');
    expect(['increase', 'decrease', 'stable']).toContain(nfai.direction);
    expect(['peak', 'shoulder', 'off']).toContain(nfai.seasonalContext);
    expect(['low', 'medium', 'high']).toContain(nfai.uncertainty);
    expect(nfai.coverage).toBeGreaterThanOrEqual(0);
    expect(nfai.coverage).toBeLessThanOrEqual(1);
  });

  it('flags an increase when observed exceeds baseline', () => {
    const withSpike = [...history, ...monthObs('MODIS_NRT', 2024, 1, 40)];
    const nfai = computeNfai(withSpike, 'MODIS', 'MODIS_NRT', 'CA', 2024, 1);
    expect(nfai.rawCount).toBe(40);
    expect(nfai.baselineMedian).toBe(10);
    expect(nfai.nfai).toBeCloseTo(1, 1);
    expect(nfai.direction).toBe('increase');
    expect(nfai.seasonalContext).toBe('peak');
  });

  it('flags a decrease when observed is far below baseline', () => {
    const withDip = [...history, ...monthObs('MODIS_NRT', 2024, 1, 1)];
    const nfai = computeNfai(withDip, 'MODIS', 'MODIS_NRT', 'CA', 2024, 1);
    expect(nfai.direction).toBe('decrease');
    expect(nfai.nfai).toBeCloseTo(-1, 1);
  });

  it('reports high uncertainty with fewer than 3 baseline years', () => {
    const short = [...monthObs('MODIS_NRT', 2023, 1, 10), ...monthObs('MODIS_NRT', 2024, 1, 10)];
    const nfai = computeNfai(short, 'MODIS', 'MODIS_NRT', 'CA', 2024, 1);
    expect(nfai.uncertainty).toBe('high');
  });

  it('clamps NFAI to 1 for extreme activity', () => {
    const extreme = [...history, ...monthObs('MODIS_NRT', 2024, 1, 1000)];
    const nfai = computeNfai(extreme, 'MODIS', 'MODIS_NRT', 'CA', 2024, 1);
    expect(nfai.nfai).toBe(1);
  });
});

describe('detectAnomalies', () => {
  const history: FireObservation[] = [];
  for (const y of [2019, 2020, 2021, 2022, 2023]) {
    history.push(...monthObs('MODIS_NRT', y, 1, 10));
    history.push(...monthObs('MODIS_NRT', y, 8, 10));
  }

  it('detects a severe spike above the baseline', () => {
    const withSpike = [...history, ...monthObs('MODIS_NRT', 2024, 1, 60)];
    const res = detectAnomalies(withSpike, 'MODIS', 'MODIS_NRT', 'CA', '2024-01-01', '2024-02-01');
    const jan = res.find((r) => r.period === '2024-01')!;
    expect(jan.sufficientBaseline).toBe(true);
    expect(jan.severity).toBe('severe');
    expect(jan.observed).toBe(60);
    expect(jan.expectedMedian).toBe(10);
    expect(jan.robustZ).toBeGreaterThan(3.5);
  });

  it('reports none for months matching the baseline', () => {
    const res = detectAnomalies(history, 'MODIS', 'MODIS_NRT', 'CA', '2023-01-01', '2023-02-01');
    expect(res.every((r) => r.severity === 'none')).toBe(true);
  });

  it('flags insufficient baseline when history is too short', () => {
    const short = [...monthObs('MODIS_NRT', 2023, 1, 10)];
    const res = detectAnomalies(short, 'MODIS', 'MODIS_NRT', 'CA', '2023-01-01', '2023-02-01');
    expect(res[0]!.sufficientBaseline).toBe(false);
    expect(res[0]!.message).toBe('INSUFFICIENT HISTORICAL BASELINE');
  });
});

describe('compareSensors', () => {
  it('is consistent when counts are within 2:1', () => {
    const obs = [
      ...monthObs('MODIS_NRT', 2024, 1, 10),
      ...monthObs('VIIRS_SNPP_NRT', 2024, 1, 8),
    ];
    const c = compareSensors(obs, 'CA', 2024, 1);
    expect(c.agreement).toBe('consistent');
    expect(c.countRatio).toBeCloseTo(10 / 8, 1);
    expect(c.modis.count).toBe(10);
    expect(c.viirs.count).toBe(8);
  });

  it('is divergent when only one sensor has detections', () => {
    const c = compareSensors([...monthObs('MODIS_NRT', 2024, 1, 10)], 'CA', 2024, 1);
    expect(c.agreement).toBe('divergent');
    expect(c.countRatio).toBeNull();
  });

  it('is insufficient when neither sensor has detections', () => {
    const c = compareSensors([], 'CA', 2024, 1);
    expect(c.agreement).toBe('insufficient');
    expect(c.countRatio).toBeNull();
  });
});

describe('parseFirmsCsv', () => {
  it('parses a standard NASA FIRMS CSV table', () => {
    const csv = `latitude,longitude,acq_date,acq_time,satellite,instrument,confidence,frp
34.05,-118.20,2024-01-15,1345,terra,MODIS,nominal,12.5
35.00,-119.00,2024-01-15,1400,snpp,VIIRS,low,4.2`;
    const { headers, rows } = parseFirmsCsv(csv);
    expect(headers).toContain('latitude');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.latitude).toBe('34.05');
    expect(rows[1]!.instrument).toBe('VIIRS');
  });

  it('handles quoted fields containing commas', () => {
    const csv = 'latitude,longitude,acq_date\n"34.05","-118,20",2024-01-15';
    const { rows } = parseFirmsCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.longitude).toBe('-118,20');
  });

  it('throws on a NASA error message without a header row', () => {
    expect(() => parseFirmsCsv('ERROR: Invalid map key')).toThrow();
    expect(() => parseFirmsCsv('unauthorized access')).toThrow();
  });

  it('returns empty for empty input', () => {
    expect(parseFirmsCsv('')).toEqual({ headers: [], rows: [] });
  });
});

describe('chunkDateRange', () => {
  it('splits a 10-day range into 5-day NASA-compliant chunks', () => {
    const chunks = chunkDateRange('2024-01-01', '2024-01-10', 5);
    expect(chunks).toEqual([
      { date: '2024-01-01', days: 5 },
      { date: '2024-01-06', days: 5 },
    ]);
  });

  it('handles ranges not divisible by chunk size', () => {
    const chunks = chunkDateRange('2024-01-01', '2024-01-07', 3);
    expect(chunks).toEqual([
      { date: '2024-01-01', days: 3 },
      { date: '2024-01-04', days: 3 },
      { date: '2024-01-07', days: 1 },
    ]);
  });

  it('returns a single chunk for one day', () => {
    const chunks = chunkDateRange('2024-06-01', '2024-06-01');
    expect(chunks).toEqual([{ date: '2024-06-01', days: 1 }]);
  });

  it('returns nothing when end precedes start', () => {
    expect(chunkDateRange('2024-06-02', '2024-06-01')).toEqual([]);
  });
});