/* FIREWEAVE  - data ingestion: normalize NASA CSV rows into the canonical schema,
   with sensor-specific quality control and full rejection traceability. */

import type {
  FireObservation,
  SourceDataset,
  ProcessingType,
  DayNight,
} from '../types.js';

export interface IngestResult {
  accepted: FireObservation[];
  rejected: Array<{ rowIndex: number; reason: string; raw: Record<string, string> }>;
  stats: {
    totalRows: number;
    accepted: number;
    rejected: number;
    bySource: Record<string, number>;
    missingAttributes: Record<string, number>;
  };
}

let uuidCounter = 0;
function makeId(): string {
  return `obs_${Date.now()}_${++uuidCounter}_${Math.random().toString(36).slice(2, 9)}`;
}

function toDate(row: Record<string, string>): string | null {
  const raw = row['acq_date'] ?? row['acquisition_date'] ?? '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  return isNaN(d.getTime()) ? null : `${m[1]}-${m[2]}-${m[3]}`;
}

function toTime(row: Record<string, string>): string {
  return (row['acq_time'] ?? row['acquisition_time'] ?? '').trim();
}

function toDayNight(row: Record<string, string>): DayNight {
  const v = (row['daynight'] ?? row['day_night'] ?? '').trim().toUpperCase();
  return v === 'N' ? 'N' : 'D';
}

function toNumber(v: string): number | null {
  if (v === null || v === undefined) return null;
  const s = v.trim();
  if (s === '' || s.toLowerCase() === 'nan' || s.toLowerCase() === 'null') return null;
  const n = Number(s);
  return isNaN(n) ? null : n;
}

function detectSourceDataset(
  satellite: string,
  instrument: string,
  processingVersion?: string
): { source: SourceDataset; processingType: ProcessingType } | null {
  const sat = satellite.trim().toLowerCase();
  const inst = instrument.trim().toUpperCase();
  const isSP = (processingVersion ?? '').toUpperCase().includes('SP');

  if (inst === 'MODIS') {
    if (sat === 'terra' || sat === 'aqua') {
      return {
        source: isSP ? 'MODIS_SP' : 'MODIS_NRT',
        processingType: isSP ? 'STANDARD' : 'NEAR_REAL_TIME',
      };
    }
    return null;
  }
  if (inst === 'VIIRS') {
    if (sat === 'snpp') {
      return {
        source: isSP ? 'VIIRS_SNPP_SP' : 'VIIRS_SNPP_NRT',
        processingType: isSP ? 'STANDARD' : 'NEAR_REAL_TIME',
      };
    }
    if (sat === 'noaa-20' || sat === 'noaa20') {
      return {
        source: isSP ? 'VIIRS_NOAA20_SP' : 'VIIRS_NOAA20_NRT',
        processingType: isSP ? 'STANDARD' : 'NEAR_REAL_TIME',
      };
    }
    if (sat === 'noaa-21' || sat === 'noaa21') {
      return {
        source: isSP ? 'VIIRS_NOAA21_SP' : 'VIIRS_NOAA21_NRT',
        processingType: isSP ? 'STANDARD' : 'NEAR_REAL_TIME',
      };
    }
    return null;
  }
  return null;
}

/**
 * Normalize raw NASA CSV rows into canonical FireObservation records.
 * `sourceOverride` forces a source dataset when the row lacks enough info
 * (e.g. NRT CSVs where processing type is known from the request URL).
 */
export function normalizeRows(
  rows: Record<string, string>[],
  regionCode: string,
  sourceOverride?: SourceDataset,
  importBatchId?: string
): IngestResult {
  const accepted: FireObservation[] = [];
  const rejected: IngestResult['rejected'] = [];
  const missingAttributes: Record<string, number> = {};
  const bySource: Record<string, number> = {};

  const requiredFields = ['latitude', 'longitude', 'acq_date', 'satellite', 'instrument'];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i;

    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === '') {
        missingAttributes[field] = (missingAttributes[field] ?? 0) + 1;
      }
    }

    const lat = toNumber(row['latitude'] ?? '');
    const lon = toNumber(row['longitude'] ?? '');
    const date = toDate(row);

    const rejectReasons: string[] = [];
    if (lat === null) rejectReasons.push('missing_or_invalid_latitude');
    if (lon === null) rejectReasons.push('missing_or_invalid_longitude');
    if (lat !== null && (lat < -90 || lat > 90)) rejectReasons.push('latitude_out_of_range');
    if (lon !== null && (lon < -180 || lon > 180)) rejectReasons.push('longitude_out_of_range');
    if (date === null) rejectReasons.push('missing_or_invalid_acquisition_date');

    const satellite = (row['satellite'] ?? '').trim();
    const instrument = (row['instrument'] ?? '').trim();
    if (!satellite) rejectReasons.push('missing_satellite');
    if (!instrument) rejectReasons.push('missing_instrument');

    if (rejectReasons.length > 0) {
      rejected.push({ rowIndex, reason: rejectReasons.join('; '), raw: row });
      continue;
    }

    let source: SourceDataset;
    let processingType: ProcessingType;
    if (sourceOverride) {
      source = sourceOverride;
      processingType =
        source === 'MODIS_SP' ||
        source === 'VIIRS_SNPP_SP' ||
        source === 'VIIRS_NOAA20_SP' ||
        source === 'VIIRS_NOAA21_SP'
          ? 'STANDARD'
          : 'NEAR_REAL_TIME';
    } else {
      const detected = detectSourceDataset(satellite, instrument, row['version']);
      if (!detected) {
        rejected.push({
          rowIndex,
          reason: `unrecognized_satellite_instrument: ${satellite}/${instrument}`,
          raw: row,
        });
        continue;
      }
      source = detected.source;
      processingType = detected.processingType;
    }

    bySource[source] = (bySource[source] ?? 0) + 1;

    const confidence = (row['confidence'] ?? '').trim();
    const confidenceNumeric = toNumber(confidence) ?? null;

    const obs: FireObservation = {
      id: makeId(),
      sourceDataset: source,
      satellite,
      instrument: instrument === 'MODIS' ? 'MODIS' : 'VIIRS',
      processingType,
      // lat/lon/date are guaranteed non-null by the rejection block above.
      latitude: lat!,
      longitude: lon!,
      acquisitionDate: date!,
      acquisitionTime: toTime(row),
      confidence,
      confidenceNumeric: toNumber(confidence) ?? undefined,
      frp: toNumber(row['frp'] ?? '') ?? undefined,
      brightness: toNumber(row['brightness'] ?? '') ?? undefined,
      scan: toNumber(row['scan'] ?? '') ?? undefined,
      track: toNumber(row['track'] ?? '') ?? undefined,
      dayNight: toDayNight(row),
      processingVersion: (row['version'] ?? '').trim() || undefined,
      rawRecord: { ...row },
      importedAt: new Date().toISOString(),
      importBatchId,
      regionCode,
    };

    accepted.push(obs);
  }

  return {
    accepted,
    rejected,
    stats: {
      totalRows: rows.length,
      accepted: accepted.length,
      rejected: rejected.length,
      bySource,
      missingAttributes,
    },
  };
}


