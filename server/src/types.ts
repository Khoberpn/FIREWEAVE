/* FIREWEAVE  - shared TypeScript types */

export type SourceDataset =
  | 'MODIS_SP'
  | 'MODIS_NRT'
  | 'VIIRS_SNPP_SP'
  | 'VIIRS_SNPP_NRT'
  | 'VIIRS_NOAA20_SP'
  | 'VIIRS_NOAA20_NRT'
  | 'VIIRS_NOAA21_SP'
  | 'VIIRS_NOAA21_NRT';

export type ProcessingType = 'STANDARD' | 'NEAR_REAL_TIME';
export type DayNight = 'D' | 'N';

export const SENSOR_BY_SOURCE: Record<SourceDataset, 'MODIS' | 'VIIRS'> = {
  MODIS_SP: 'MODIS',
  MODIS_NRT: 'MODIS',
  VIIRS_SNPP_SP: 'VIIRS',
  VIIRS_SNPP_NRT: 'VIIRS',
  VIIRS_NOAA20_SP: 'VIIRS',
  VIIRS_NOAA20_NRT: 'VIIRS',
  VIIRS_NOAA21_SP: 'VIIRS',
  VIIRS_NOAA21_NRT: 'VIIRS',
};

export const SATELLITE_BY_SOURCE: Record<SourceDataset, string> = {
  MODIS_SP: 'Terra/Aqua',
  MODIS_NRT: 'Terra/Aqua',
  VIIRS_SNPP_SP: 'Suomi-NPP',
  VIIRS_SNPP_NRT: 'Suomi-NPP',
  VIIRS_NOAA20_SP: 'NOAA-20',
  VIIRS_NOAA20_NRT: 'NOAA-20',
  VIIRS_NOAA21_SP: 'NOAA-21',
  VIIRS_NOAA21_NRT: 'NOAA-21',
};

export const PROCESSING_BY_SOURCE: Record<SourceDataset, ProcessingType> = {
  MODIS_SP: 'STANDARD',
  MODIS_NRT: 'NEAR_REAL_TIME',
  VIIRS_SNPP_SP: 'STANDARD',
  VIIRS_SNPP_NRT: 'NEAR_REAL_TIME',
  VIIRS_NOAA20_SP: 'STANDARD',
  VIIRS_NOAA20_NRT: 'NEAR_REAL_TIME',
  VIIRS_NOAA21_SP: 'STANDARD',
  VIIRS_NOAA21_NRT: 'NEAR_REAL_TIME',
};

/** Canonical internal record  - original NASA attributes preserved verbatim in rawRecord. */
export interface FireObservation {
  id: string;
  sourceDataset: SourceDataset;
  satellite: string;
  instrument: 'MODIS' | 'VIIRS';
  processingType: ProcessingType;
  latitude: number;
  longitude: number;
  acquisitionDate: string; // YYYY-MM-DD
  acquisitionTime: string; // HHMM (native)
  confidence: string | number; // native confidence, never coerced silently
  confidenceNumeric?: number;
  frp?: number;
  brightness?: number;
  scan?: number;
  track?: number;
  dayNight: DayNight;
  processingVersion?: string;
  rawRecord: Record<string, unknown>;
  importedAt: string;
  importBatchId?: string;
  regionCode?: string;
}

/** Aggregated spatial-temporal cell (sensor identity preserved). */
export interface GridCell {
  cellId: string;
  latBin: number;
  lonBin: number;
  year: number;
  month: number;
  week: number;
  isoWeek: string; // YYYY-Www
  yearMonth: string; // YYYY-MM
  modisCount: number;
  viirsCount: number;
  totalCount: number;
  modisDatasets: string[];
  viirsDatasets: string[];
  modisFrpSum?: number;
  viirsFrpSum?: number;
  dateStart: string;
  dateEnd: string;
}

/** Per-sensor historical baseline statistics. */
export interface MonthStat {
  month: number; // 1-12
  n: number; // number of years observed
  median: number;
  mad: number; // median absolute deviation
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  std?: number;
}

export interface SensorBaseline {
  sensor: 'MODIS' | 'VIIRS';
  sourceDataset: string;
  regionCode: string;
  periodStart: string;
  periodEnd: string;
  monthlyStats: MonthStat[];
  annualTotals: Record<string, number>;
  totalObservations: number;
  yearsCovered: number;
  sufficient: boolean; // minimum sample requirement met
}

/** FIREWEAVE Normalized Fire Activity Index  - derived project metric, NOT a NASA product. */
export interface NFAIResult {
  sensor: string;
  sourceDataset: string;
  period: string; // YYYY-MM or YYYY-Www
  year: number;
  month: number;
  week?: number;
  rawCount: number;
  baselineMedian: number;
  baselineMad: number;
  nfai: number; // robust normalized deviation
  direction: 'increase' | 'decrease' | 'stable';
  seasonalContext: 'peak' | 'shoulder' | 'off';
  coverage: number; // 0-1
  uncertainty: 'low' | 'medium' | 'high';
}

/** Transparent anomaly result. */
export interface AnomalyResult {
  period: string;
  sensor: string;
  sourceDataset: string;
  observed: number;
  expectedMedian: number;
  robustZ: number;
  severity: 'none' | 'minor' | 'moderate' | 'severe';
  sufficientBaseline: boolean;
  message?: string;
}

/** Comparison between sensors for same region/period. */
export interface SensorComparison {
  period: string;
  regionCode: string;
  modis: { count: number; datasets: string[]; baselineMedian: number };
  viirs: { count: number; datasets: string[]; baselineMedian: number };
  countRatio: number | null;
  agreement: 'consistent' | 'divergent' | 'insufficient';
  explanation: string;
}

/** Import batch metadata. */
export interface ImportBatch {
  id: string;
  filename: string;
  sourceDataset?: SourceDataset;
  processingType?: ProcessingType;
  acquisitionPeriod: { start: string; end: string };
  recordCount: number;
  acceptedCount: number;
  rejectedCount: number;
  importedAt: string;
  status: 'completed' | 'completed_with_errors' | 'failed';
  errors: string[];
}

/** API cache entry with TTL. */
export interface CacheEntry {
  key: string;
  data: unknown;
  expiresAt: number;
}

/** Data status for dashboard freshness. */
export interface DataStatus {
  nasaAvailabilityChecked: boolean;
  latestNasaDate: string | null;
  sources: Array<{
    source: string;
    satellite: string;
    instrument: 'MODIS' | 'VIIRS';
    processingType: ProcessingType;
    earliestDate: string | null;
    latestDate: string | null;
    available: boolean;
  }>;
  observations: {
    total: number;
    modis: number;
    viirs: number;
    bySource: Record<string, number>;
    dateRange: { start: string | null; end: string | null };
  };
  imports: ImportBatch[];
  lastUpdated: string;
}
