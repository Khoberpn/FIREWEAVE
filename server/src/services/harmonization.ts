/* FIREWEAVE  - harmonization engine.
   Spatial-temporal aggregation, per-sensor baselines, NFAI, anomaly detection.
   All metrics are FIREWEAVE-derived, not official NASA products. */

import type {
  FireObservation,
  GridCell,
  SensorBaseline,
  MonthStat,
  NFAIResult,
  AnomalyResult,
  SensorComparison,
} from '../types.js';

const GRID_RESOLUTION = 0.1;
const MIN_BASELINE_YEARS = 3;

function latBin(lat: number): number {
  return Math.floor(lat / GRID_RESOLUTION) * GRID_RESOLUTION;
}
function lonBin(lon: number): number {
  return Math.floor(lon / GRID_RESOLUTION) * GRID_RESOLUTION;
}

function isoWeek(dateStr: string): { year: number; week: number; label: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo, label: `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}` };
}

function monthOf(dateStr: string): { year: number; month: number; label: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  const y = Number(m![1]);
  const mo = Number(m![2]);
  return { year: y, month: mo, label: `${y}-${String(mo).padStart(2, '0')}` };
}

export function aggregateGrid(
  observations: FireObservation[],
  regionCode: string
): GridCell[] {
  const map = new Map<string, GridCell>();
  for (const o of observations) {
    const { year, month, label: yearMonth } = monthOf(o.acquisitionDate);
    const { week, label: isoWeekLabel } = isoWeek(o.acquisitionDate);
    const cellId = `${regionCode}|${latBin(o.latitude).toFixed(4)}|${lonBin(o.longitude).toFixed(4)}|${yearMonth}|W${String(week).padStart(2, '0')}`;
    const existing = map.get(cellId);
    const cell: GridCell = existing ?? {
      cellId,
      latBin: latBin(o.latitude),
      lonBin: lonBin(o.longitude),
      year,
      month,
      week,
      isoWeek: isoWeekLabel,
      yearMonth,
      modisCount: 0,
      viirsCount: 0,
      totalCount: 0,
      modisDatasets: [],
      viirsDatasets: [],
      dateStart: o.acquisitionDate,
      dateEnd: o.acquisitionDate,
    };
    cell.totalCount += 1;
    if (o.instrument === 'MODIS') {
      cell.modisCount += 1;
      if (!cell.modisDatasets.includes(o.sourceDataset)) cell.modisDatasets.push(o.sourceDataset);
    } else {
      cell.viirsCount += 1;
      if (!cell.viirsDatasets.includes(o.sourceDataset)) cell.viirsDatasets.push(o.sourceDataset);
    }
    if (o.acquisitionDate < cell.dateStart) cell.dateStart = o.acquisitionDate;
    if (o.acquisitionDate > cell.dateEnd) cell.dateEnd = o.acquisitionDate;
    map.set(cellId, cell);
  }
  return [...map.values()].sort((a, b) =>
    a.yearMonth.localeCompare(b.yearMonth) || a.cellId.localeCompare(b.cellId)
  );
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  sorted = [...sorted].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, rank))];
}
function median(sorted: number[]): number { return percentile(sorted, 50); }
function mad(sorted: number[]): number {
  const med = median(sorted);
  const absDev = sorted.map((v) => Math.abs(v - med)).sort((a, b) => a - b);
  return median(absDev);
}
function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

/** Stage 4  - per-sensor historical baselines. */
export function buildBaseline(
  observations: FireObservation[],
  sensor: 'MODIS' | 'VIIRS',
  sourceDataset: string,
  regionCode: string
): SensorBaseline {
  const sensorObs = observations.filter(
    (o) => o.instrument === sensor && o.sourceDataset === sourceDataset
  );

  const annualTotals: Record<string, number> = {};
  let minDate: string | null = null;
  let maxDate: string | null = null;

  const monthToYearCounts = new Map<number, Map<number, number>>();
  for (const o of sensorObs) {
    const { year, month } = monthOf(o.acquisitionDate);
    if (!monthToYearCounts.has(month)) monthToYearCounts.set(month, new Map());
    const m = monthToYearCounts.get(month)!;
    m.set(year, (m.get(year) ?? 0) + 1);
    annualTotals[String(year)] = (annualTotals[String(year)] ?? 0) + 1;
    if (minDate === null || o.acquisitionDate < minDate) minDate = o.acquisitionDate;
    if (maxDate === null || o.acquisitionDate > maxDate) maxDate = o.acquisitionDate;
  }

  const monthlyStats: MonthStat[] = [];
  for (const [month, yearCounts] of monthToYearCounts.entries()) {
    const values = [...yearCounts.values()].sort((a, b) => a - b);
    const n = values.length;
    const avg = mean(values);
    monthlyStats.push({
      month,
      n,
      median: median(values),
      mad: mad(values),
      p10: percentile(values, 10),
      p50: percentile(values, 50),
      p90: percentile(values, 90),
      mean: avg,
      std: n > 1
        ? Math.sqrt(values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / n)
        : undefined,
    });
  }
  monthlyStats.sort((a, b) => a.month - b.month);

  const yearsCovered = new Set(sensorObs.map((o) => monthOf(o.acquisitionDate).year)).size;
  const periodStart = minDate ?? '';
  const periodEnd = maxDate ?? '';
  const sufficient = yearsCovered >= MIN_BASELINE_YEARS && monthlyStats.length > 0;

  return {
    sensor,
    sourceDataset,
    regionCode,
    periodStart,
    periodEnd,
    monthlyStats,
    annualTotals,
    totalObservations: sensorObs.length,
    yearsCovered,
    sufficient,
  };
}

/** Stage 5  - FIREWEAVE Normalized Fire Activity Index (NFAI). */
export function computeNfai(
  observations: FireObservation[],
  sensor: 'MODIS' | 'VIIRS',
  sourceDataset: string,
  regionCode: string,
  year: number,
  month: number
): NFAIResult {
  const baseline = buildBaseline(observations, sensor, sourceDataset, regionCode);
  const monthLabel = `${year}-${String(month).padStart(2, '0')}`;
  const observed = observations.filter(
    (o) => o.instrument === sensor &&
      o.sourceDataset === sourceDataset &&
      monthOf(o.acquisitionDate).year === year &&
      monthOf(o.acquisitionDate).month === month
  ).length;
  const stat = baseline.monthlyStats.find((s) => s.month === month);
  const baselineMedian = stat ? stat.median : 0;
  const baselineMad = stat ? stat.mad : 0;
  const nYears = stat?.n ?? 0;
  const scale = 1.4826 * baselineMad + 1;
  const rawZ = (observed - baselineMedian) / scale;
  const nfai = Math.max(-1, Math.min(1, rawZ / 3));
  const direction =
    rawZ > 0.5 ? 'increase' : rawZ < -0.5 ? 'decrease' : 'stable';
  let seasonalContext: 'peak' | 'shoulder' | 'off' = 'off';
  if (stat) {
    if (observed >= stat.p90) seasonalContext = 'peak';
    else if (observed >= stat.p50) seasonalContext = 'shoulder';
  }
  const coverage = Math.min(1, nYears / 10);
  const uncertainty = nYears < 3 ? 'high' : nYears < 6 ? 'medium' : 'low';
  return {
    sensor,
    sourceDataset,
    period: monthLabel,
    year,
    month,
    rawCount: observed,
    baselineMedian,
    baselineMad,
    nfai: Number(nfai.toFixed(3)),
    direction,
    seasonalContext,
    coverage: Number(coverage.toFixed(2)),
    uncertainty,
  };
}

/** Stage 6  - transparent seasonal anomaly detection. */
export function detectAnomalies(
  observations: FireObservation[],
  sensor: 'MODIS' | 'VIIRS',
  sourceDataset: string,
  regionCode: string,
  startDate: string,
  endDate: string
): AnomalyResult[] {
  const baseline = buildBaseline(observations, sensor, sourceDataset, regionCode);
  const results: AnomalyResult[] = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  let cur = new Date(start);
  while (cur <= end) {
    const y = cur.getUTCFullYear();
    const m = cur.getUTCMonth() + 1;
    const label = `${y}-${String(m).padStart(2, '0')}`;
    const observed = observations.filter(
      (o) => o.instrument === sensor &&
        o.sourceDataset === sourceDataset &&
        monthOf(o.acquisitionDate).year === y &&
        monthOf(o.acquisitionDate).month === m
    ).length;
    const stat = baseline.monthlyStats.find((s) => s.month === m);
    const sufficient = baseline.sufficient && !!stat && stat.n >= 3;
    let robustZ = 0;
    let severity: AnomalyResult['severity'] = 'none';
    if (sufficient) {
      robustZ = (observed - stat.median) / (1.4826 * stat.mad + 1);
      const absZ = Math.abs(robustZ);
      if (absZ >= 3.5) severity = 'severe';
      else if (absZ >= 2.5) severity = 'moderate';
      else if (absZ >= 1.5) severity = 'minor';
    }
    results.push({
      period: label,
      sensor,
      sourceDataset,
      observed,
      expectedMedian: stat?.median ?? 0,
      robustZ: Number(robustZ.toFixed(3)),
      severity,
      sufficientBaseline: sufficient,
      message: !sufficient ? 'INSUFFICIENT HISTORICAL BASELINE' : undefined,
    });
    cur.setUTCDate(cur.getUTCDate() + 32);
    cur.setUTCDate(1);
  }
  return results.sort((a, b) => a.period.localeCompare(b.period));
}

/** Cross-sensor comparison for a region/period. */
export function compareSensors(
  observations: FireObservation[],
  regionCode: string,
  year: number,
  month: number
): SensorComparison {
  const modisObs = observations.filter(
    (o) => o.instrument === 'MODIS' &&
      monthOf(o.acquisitionDate).year === year &&
      monthOf(o.acquisitionDate).month === month
  );
  const viirsObs = observations.filter(
    (o) => o.instrument === 'VIIRS' &&
      monthOf(o.acquisitionDate).month === month &&
      monthOf(o.acquisitionDate).year === year
  );

  const modisCount = modisObs.length;
  const viirsCount = viirsObs.length;
  const modisDatasets = [...new Set(modisObs.map((o) => o.sourceDataset))];
  const viirsDatasets = [...new Set(viirsObs.map((o) => o.sourceDataset))];

  const modisBaseline = buildBaseline(observations, 'MODIS', modisDatasets[0] ?? 'MODIS_SP', regionCode);
  const viirsBaseline = buildBaseline(observations, 'VIIRS', viirsDatasets[0] ?? 'VIIRS_SNPP_SP', regionCode);

  const modisMedian = modisBaseline.monthlyStats.find((s) => s.month === month)?.median ?? 0;
  const viirsMedian = viirsBaseline.monthlyStats.find((s) => s.month === month)?.median ?? 0;

  const countRatio =
    viirsCount === 0 ? (modisCount === 0 ? null : null) : modisCount / viirsCount;

  let agreement: 'consistent' | 'divergent' | 'insufficient' = 'insufficient';
  let explanation = '';
  if (modisCount === 0 && viirsCount === 0) {
    agreement = 'insufficient';
    explanation = 'No observations from either sensor in this period.';
  } else if (modisCount === 0 || viirsCount === 0) {
    agreement = 'divergent';
    explanation = 'Only one sensor detected hotspots; likely due to different overpass times, swath width, or detection thresholds.';
  } else {
    const ratio = Math.max(modisCount, viirsCount) / Math.min(modisCount, viirsCount);
    if (ratio <= 2) {
      agreement = 'consistent';
      explanation = 'MODIS and VIIRS counts are within a 2:1 ratio, consistent with expected sensor differences (VIIRS 375 m vs MODIS 1 km pixel size).';
    } else {
      agreement = 'divergent';
      explanation = 'Counts diverge beyond 2:1. Contributing factors may include pixel size, overpass timing, cloud cover, confidence thresholds, and processing version  - not resolution alone.';
    }
  }

  return {
    period: `${year}-${String(month).padStart(2, '0')}`,
    regionCode,
    modis: { count: modisCount, datasets: modisDatasets, baselineMedian: modisMedian },
    viirs: { count: viirsCount, datasets: viirsDatasets, baselineMedian: viirsMedian },
    countRatio: countRatio ? Number(countRatio.toFixed(2)) : null,
    agreement,
    explanation,
  };
}

