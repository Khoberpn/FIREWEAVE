/* FIREWEAVE '" NASA FIRMS connector (server-side only). MAP_KEY never leaves this module. */

import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';
import type { SourceDataset } from '../types.js';
import { storage } from './storage.js';

const FIRMS_BASE = 'https://firms.modaps.eosdis.nasa.gov/api';

export const FIRMS_SOURCES: SourceDataset[] = [
  'MODIS_SP',
  'MODIS_NRT',
  'VIIRS_SNPP_SP',
  'VIIRS_SNPP_NRT',
  'VIIRS_NOAA20_SP',
  'VIIRS_NOAA20_NRT',
  'VIIRS_NOAA21_SP',
  'VIIRS_NOAA21_NRT',
];

/** Standard and Near Real-Time records are independent NASA products. */
export const LIVE_SOURCE_FOR_DATASET: Partial<Record<SourceDataset, SourceDataset>> = {
  MODIS_SP: 'MODIS_NRT',
  VIIRS_SNPP_SP: 'VIIRS_SNPP_NRT',
  VIIRS_NOAA20_SP: 'VIIRS_NOAA20_NRT',
  VIIRS_NOAA21_SP: 'VIIRS_NOAA21_NRT',
};

/** NASA's latest-feed URL omits DATE; adding DATE requests that historical window. */
export function buildAreaCsvPath(
  source: SourceDataset,
  west: number,
  south: number,
  east: number,
  north: number,
  dayRange = DEFAULT_DAY_RANGE,
  date?: string,
): string {
  const clamped = Math.min(Math.max(dayRange, 1), MAX_DAY_RANGE);
  const bounds = `${west},${south},${east},${north}`;
  return `/area/csv/{MAP_KEY}/${source}/${bounds}/${clamped}${date ? `/${date}` : ''}`;
}

const DEFAULT_DAY_RANGE = 1;
const MAX_DAY_RANGE = 5;

// In-flight request dedup keys -> promise
const inflight = new Map<string, Promise<unknown>>();
// Throttle: minimum interval between NASA requests (ms)
let lastRequestTs = 0;
const THROTTLE_MS = 1000;

function getMapKey(): string {
  const key = process.env.FIRMS_MAP_KEY;
  if (!key || /^(?:YOUR_|REPLACE|PLACEHOLDER)/i.test(key.trim())) {
    throw new Error('A newly rotated FIRMS_MAP_KEY must be configured in the server environment');
  }
  return key.trim();
}

function throttle(): Promise<void> {
  return new Promise((resolve) => {
    const now = Date.now();
    const wait = Math.max(0, THROTTLE_MS - (now - lastRequestTs));
    setTimeout(resolve, wait);
  });
}

function requestJsonOrText(urlStr: string, timeoutMs = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(
      url,
      { headers: { 'User-Agent': 'FIREWEAVE/1.0 (NASA Space Apps 2026)' }, timeout: timeoutMs },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode! >= 400) {
            reject(new Error(`NASA FIRMS HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
          } else {
            resolve(data);
          }
        });
      },
    );
    req.on('timeout', () => {
      req.destroy(new Error('NASA FIRMS request timed out'));
    });
    req.on('error', reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch from NASA FIRMS with caching, throttling, duplicate-request prevention,
 * and exponential-backoff retry.
 */
export async function firmsRequest<T>(
  path: string,
  ttlMs: number,
  retries = 3
): Promise<T> {
  const mapKey = getMapKey();
  // A NASA error response may echo its request URL. Strip the key defensively
  // before any failure can cross the API boundary or reach server logs.
  const urlStr = `${FIRMS_BASE}${path.replace(/\{MAP_KEY\}/, mapKey)}`;
  // Cache stable request paths, never credential-bearing URLs. The MAP_KEY
  // remains server-side and cannot leak through cache keys or persisted JSON.
  const cacheKey = `firms:${path}`;
  const cached = storage.cacheGet<T>(cacheKey);
  if (cached !== null) return cached;
  if (inflight.has(cacheKey)) return inflight.get(cacheKey)! as Promise<T>;
  const promise = (async () => {
    let lastError: unknown = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      await throttle();
      lastRequestTs = Date.now();
      try {
        const text = await requestJsonOrText(urlStr);
        const result: T = text as T;
        storage.cacheSet(cacheKey, result, ttlMs);
        return result;
      } catch (err: any) {
        // NASA's gateway can echo the full authenticated URL in an error.
        // Only retain/surface the credential-scrubbed message, ever.
        const msg = String(err?.message ?? err)
          .replace(/https?:\/\/[^\s"']+/gi, '[upstream NASA request]')
          .replaceAll(mapKey, '[redacted]');
        const safeError = new Error(msg);
        lastError = safeError;
        const retryable =
          /timeout|ECONNRESET|ECONNREFUSED|ETIMEDOUT/i.test(msg) ||
          /429|50[234]/i.test(msg);
        if (attempt < retries && retryable) {
          await sleep(Math.min(1000 * 2 ** attempt, 15000));
          continue;
        }
        throw safeError;
      }
    }
    throw lastError;
  })();
  inflight.set(cacheKey, promise);
  try {
    return (await promise) as T;
  } finally {
    inflight.delete(cacheKey);
  }
}

/** Get data availability for all sources. TTL: 1 hour. */
export async function getDataAvailability(): Promise<string> {
  return firmsRequest<string>(`/data_availability/csv/{MAP_KEY}/all`, 60 * 60 * 1000);
}

/** Helper to find the latest available date for a given sensor source */
export async function getLatestAvailableDate(source: SourceDataset): Promise<string | undefined> {
  try {
    const csv = await getDataAvailability();
    const lines = csv.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts[0]?.trim() === source && parts[2]?.trim()) {
        return parts[2].trim();
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Get observations for one source over a bounded date window (max 5 days).
 * Returns raw CSV text. TTL: 6 hours.
 */
export async function getObservationsRaw(
  source: SourceDataset,
  west: number,
  south: number,
  east: number,
  north: number,
  date?: string,
  dayRange = DEFAULT_DAY_RANGE
): Promise<string> {
  // Omitting DATE tells FIRMS to serve the most recent available observations.
  // A YYYY-MM-DD path instead queries that historical day, not "the latest".
  const path = buildAreaCsvPath(source, west, south, east, north, dayRange, date);
  const result = await firmsRequest<string>(path, 6 * 60 * 60 * 1000);

  // If no date was specified and the live feed has no detections (just header),
  // automatically check the latest completed orbit date from availability so the user
  // gets actual real-world hotspot detections.
  if (!date && result.trim().split('\n').length <= 1) {
    const latestDate = await getLatestAvailableDate(source);
    if (latestDate) {
      const fallbackPath = buildAreaCsvPath(source, west, south, east, north, dayRange, latestDate);
      try {
        const fallbackResult = await firmsRequest<string>(fallbackPath, 6 * 60 * 60 * 1000);
        if (fallbackResult.trim().split('\n').length > 1) {
          return fallbackResult;
        }
      } catch {
        // keep initial result
      }
    }
  }

  return result;
}

/** Health check: probe availability endpoint. */
export async function checkHealth(): Promise<{ ok: boolean; error?: string }> {
  try {
    await getDataAvailability();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}

/**
 * Parse NASA FIRMS CSV text into raw row objects.
 * Throws if the response is an error message rather than a CSV table.
 */
export function parseFirmsCsv(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const trimmed = csvText.trim();
  if (!trimmed) return { headers: [], rows: [] };
  const firstLine = trimmed.split('\n')[0];
  const looksLikeError =
    firstLine.toLowerCase().includes('error') ||
    firstLine.toLowerCase().includes('invalid') ||
    firstLine.toLowerCase().includes('unauthorized') ||
    firstLine.toLowerCase().includes('not found');
  if (looksLikeError && !firstLine.includes('latitude')) {
    throw new Error(`NASA FIRMS returned an error message: ${firstLine.slice(0, 300)}`);
  }
  const lines = trimmed.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = idx < values.length ? values[idx] : '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

/** Minimal CSV line parser handling quoted fields. */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let field = '';
      while (i < line.length) {
        if (line[i] === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            field += '"';
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          field += line[i];
          i++;
        }
      }
      fields.push(field);
      if (i < line.length && line[i] === ',') i++;
    } else {
      const comma = line.indexOf(',', i);
      if (comma === -1) {
        fields.push(line.slice(i));
        i = line.length;
      } else {
        fields.push(line.slice(i, comma));
        i = comma + 1;
      }
    }
  }
  return fields;
}

/**
 * Split a date range into NASA-compliant chunks (1-5 days each).
 * Each chunk's `date` is the start date of that chunk.
 */
export function chunkDateRange(
  startDate: string,
  endDate: string,
  maxDays = MAX_DAY_RANGE
): Array<{ date: string; days: number }> {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];
  const chunks: Array<{ date: string; days: number }> = [];
  let cur = new Date(start);
  while (cur <= end) {
    const chunkEnd = new Date(cur);
    chunkEnd.setUTCDate(chunkEnd.getUTCDate() + maxDays - 1);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());
    const days = (chunkEnd.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24) + 1;
    chunks.push({
      date: formatDate(cur),
      days: Math.max(1, Math.min(maxDays, Math.floor(days))),
    });
    cur = new Date(chunkEnd);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return chunks;
}

function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

