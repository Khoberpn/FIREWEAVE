/* FIREWEAVE  - lightweight persistent JSON storage (no external database dependency) */

import fs from 'node:fs';
import path from 'node:path';
import type {
  FireObservation,
  ImportBatch,
  CacheEntry,
  DataStatus,
} from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const OBS_PATH = path.join(DATA_DIR, 'observations.json');
const IMPORTS_PATH = path.join(DATA_DIR, 'imports.json');
const CACHE_PATH = path.join(DATA_DIR, 'cache.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export const storage = {
  // ---------- observations ----------
  readObservations: (): FireObservation[] =>
    readJson<FireObservation[]>(OBS_PATH, []),

  writeObservations: (obs: FireObservation[]): void => {
    writeJson(OBS_PATH, obs);
  },

  addObservations: (obs: FireObservation[]): FireObservation[] => {
    const combined = storage.readObservations();
    // Re-querying overlapping five-day live windows must not multiply raw
    // fire detections or corrupt downstream grids, counts and baselines.
    const seen = new Set(combined.map((o) =>
      `${o.sourceDataset}|${o.satellite}|${o.acquisitionDate}|${o.acquisitionTime}|${o.latitude.toFixed(5)}|${o.longitude.toFixed(5)}`,
    ));
    for (const observation of obs) {
      const signature = `${observation.sourceDataset}|${observation.satellite}|${observation.acquisitionDate}|${observation.acquisitionTime}|${observation.latitude.toFixed(5)}|${observation.longitude.toFixed(5)}`;
      if (!seen.has(signature)) {
        combined.push(observation);
        seen.add(signature);
      }
    }
    storage.writeObservations(combined);
    return combined;
  },

  replaceObservations: (obs: FireObservation[]): void => {
    storage.writeObservations(obs);
  },

  clearObservations: (): void => {
    storage.writeObservations([]);
  },

  // ---------- imports ----------
  readImports: (): ImportBatch[] => readJson<ImportBatch[]>(IMPORTS_PATH, []),

  writeImports: (batches: ImportBatch[]): void => {
    writeJson(IMPORTS_PATH, batches);
  },

  addImport: (batch: ImportBatch): void => {
    const batches = storage.readImports();
    batches.push(batch);
    storage.writeImports(batches);
  },

  // ---------- cache (API response cache with TTL) ----------
  // Discard legacy FIRMS cache entries keyed by their full URL: older versions
  // embedded the NASA MAP_KEY in those URLs and could persist it to cache.json.
  readCache: (): CacheEntry[] =>
    readJson<CacheEntry[]>(CACHE_PATH, []).filter(
      (entry) => !/^firms:https:\/\/firms\.modaps\.eosdis\.nasa\.gov\/api\//i.test(entry.key),
    ),

  writeCache: (entries: CacheEntry[]): void => {
    writeJson(CACHE_PATH, entries);
  },

  cacheGet: <T>(key: string): T | null => {
    const entries = storage.readCache();
    const entry = entries.find((e) => e.key === key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      storage.cacheDelete(key);
      return null;
    }
    return entry.data as T;
  },

  cacheSet: <T>(key: string, data: T, ttlMs: number): void => {
    const entries = storage.readCache().filter((e) => e.key !== key);
    entries.push({ key, data, expiresAt: Date.now() + ttlMs });
    storage.writeCache(entries);
  },

  cacheDelete: (key: string): void => {
    const entries = storage.readCache().filter((e) => e.key !== key);
    storage.writeCache(entries);
  },

  cachePruneExpired: (): void => {
    const now = Date.now();
    const entries = storage.readCache().filter((e) => e.expiresAt > now);
    storage.writeCache(entries);
  },

  // ---------- status snapshot ----------
  statusSnapshot: (): DataStatus => {
    const obs = storage.readObservations();
    const imports = storage.readImports();
    const bySource: Record<string, number> = {};
    let modis = 0;
    let viirs = 0;
    let minDate: string | null = null;
    let maxDate: string | null = null;
    for (const o of obs) {
      bySource[o.sourceDataset] = (bySource[o.sourceDataset] ?? 0) + 1;
      if (o.instrument === 'MODIS') modis++;
      else viirs++;
      if (minDate === null || o.acquisitionDate < minDate) minDate = o.acquisitionDate;
      if (maxDate === null || o.acquisitionDate > maxDate) maxDate = o.acquisitionDate;
    }
    return {
      nasaAvailabilityChecked: false,
      latestNasaDate: maxDate,
      sources: [],
      observations: {
        total: obs.length,
        modis,
        viirs,
        bySource,
        dateRange: { start: minDate, end: maxDate },
      },
      imports,
      lastUpdated: new Date().toISOString(),
    };
  },
};

