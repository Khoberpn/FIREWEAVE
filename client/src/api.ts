export type SourceDataset =
  | 'MODIS_NRT' | 'VIIRS_SNPP_NRT' | 'VIIRS_NOAA20_NRT' | 'VIIRS_NOAA21_NRT'
  | 'MODIS_SP' | 'VIIRS_SNPP_SP' | 'VIIRS_NOAA20_SP' | 'VIIRS_NOAA21_SP';

export interface FireObservation {
  id: string; sourceDataset: SourceDataset; satellite: string;
  instrument: 'MODIS' | 'VIIRS'; processingType: 'STANDARD' | 'NEAR_REAL_TIME';
  latitude: number; longitude: number; acquisitionDate: string; acquisitionTime: string;
  confidence: string | number; confidenceNumeric?: number; frp?: number; brightness?: number;
  dayNight: 'D' | 'N'; rawRecord?: Record<string, unknown>; importedAt: string;
  regionCode?: string;
}
export interface LiveResult {
  source: SourceDataset; satellite: string; region: string;
  date: string | null; requestedDate?: string | null; latest?: boolean; dayRange: number; retrievedAt: string;
  empty: boolean; recordCount: number; acceptedCount: number; retrievedAcceptedCount?: number; rejectedCount: number;
  observations: FireObservation[]; nasaAttribution: string;
}
export interface DataStatus {
  observations: { total: number; modis: number; viirs: number; dateRange: { start: string | null; end: string | null } };
  sources: Array<{ source: string; available: boolean; latestDate: string | null }>;
  imports: unknown[]; lastUpdated: string; configured?: boolean;
  nasaHealth?: { ok: boolean; error?: string };
}

export const INDONESIA_BOUNDS = { west: 95.0, south: -11.0, east: 141.0, north: 6.0 };
export const CENTRAL_JAVA_BOUNDS = { west: 108.5, south: -8.8, east: 111.8, north: -6.3 };
export const CENTRAL_KALIMANTAN_BOUNDS = { west: 110.7, south: -3.6, east: 115.9, north: 0.9 };
export const DEFAULT_BOUNDS = INDONESIA_BOUNDS;
export const DEFAULT_REGION = 'Indonesia_National';

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    const body: { error?: string; message?: string } = await response.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Server returned HTTP ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

export async function getObservations(
  source: SourceDataset,
  dayRange: number,
  signalOrBounds?: AbortSignal | typeof DEFAULT_BOUNDS,
  signal?: AbortSignal
): Promise<LiveResult> {
  let bounds = DEFAULT_BOUNDS;
  let abortSignal: AbortSignal | undefined = signal;
  if (signalOrBounds instanceof AbortSignal) {
    abortSignal = signalOrBounds;
  } else if (signalOrBounds && 'west' in signalOrBounds) {
    bounds = signalOrBounds;
  }

  const params = new URLSearchParams({
    west: String(bounds.west),
    south: String(bounds.south),
    east: String(bounds.east),
    north: String(bounds.north),
    source,
    dayRange: String(dayRange),
    region: DEFAULT_REGION,
  });
  return apiFetch<LiveResult>(`/api/nasa/firms/observations?${params}`, abortSignal);
}

export async function getDataStatus(signal?: AbortSignal): Promise<DataStatus> {
  return apiFetch<DataStatus>('/api/system/data-status', signal);
}

export function reportUrl(format: 'pdf' | 'csv', start: string, end: string): string {
  const params = new URLSearchParams({ format, start, end, region: DEFAULT_REGION });
  return `/api/reports/regional?${params}`;
}
