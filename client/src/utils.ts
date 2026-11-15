import type { FireObservation, SourceDataset } from './api';

export const SENSOR_OPTIONS: { id: SourceDataset; instrument: 'MODIS' | 'VIIRS'; satellite: string; family: string; color: string }[] = [
  { id: 'MODIS_NRT', instrument: 'MODIS', satellite: 'Terra / Aqua', family: 'MODIS', color: '#f0a14a' },
  { id: 'VIIRS_SNPP_NRT', instrument: 'VIIRS', satellite: 'Suomi–NPP', family: 'VIIRS', color: '#a6a2f6' },
  { id: 'VIIRS_NOAA20_NRT', instrument: 'VIIRS', satellite: 'NOAA–20', family: 'VIIRS', color: '#c994e9' },
  { id: 'VIIRS_NOAA21_NRT', instrument: 'VIIRS', satellite: 'NOAA–21', family: 'VIIRS', color: '#78c0bf' },
];
export const EVERY_SENSOR = new Set(SENSOR_OPTIONS.map(sensor => sensor.id));
export const DATE_WINDOWS = [{ days: 1, label: '24 hours', short: '24H' }, { days: 3, label: '72 hours', short: '72H' }, { days: 5, label: '5 days', short: '5D' }] as const;
export interface ActivityPoint { date: string; label: string; modis: number; viirs: number }
export const compactNumber = (n: number) => Intl.NumberFormat('en', { notation: n >= 10_000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n);
export const dayLabel = (s: string) => { const d = new Date(`${s}T12:00:00Z`); return Number.isNaN(d.valueOf()) ? s : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(d); };
export const dateTimeLabel = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.valueOf()) ? '—' : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(d) + ' UTC'; };
const escapeCsv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
export function downloadCsv(observations: FireObservation[], date: string) {
  if (!observations.length) return;
  const columns: (keyof FireObservation)[] = ['acquisitionDate', 'acquisitionTime', 'instrument', 'satellite', 'sourceDataset', 'latitude', 'longitude', 'confidence', 'frp', 'brightness', 'dayNight'];
  const text = [columns.join(','), ...observations.map(o => columns.map(c => escapeCsv(o[c])).join(','))].join('\r\n');
  downloadFile(`fireweave-observations-${date || 'export'}.csv`, `\ufeff${text}`, 'text/csv;charset=utf-8');
}
export function downloadGeoJson(observations: FireObservation[], date: string, retrievedAt: string, windowDays: number) {
  if (!observations.length) return;
  const data = { type: 'FeatureCollection', name: 'FIREWEAVE · Central Kalimantan fire observations', copyright: 'NASA FIRMS · Contains modified NASA data.', retrievedAt, windowDays, notes: 'Satellite hotspot detections are not unique fire counts or burned area. MODIS and VIIRS use different pixel sizes.', features: observations.map(({ rawRecord: _rawRecord, ...observation }) => ({ type: 'Feature', id: observation.id, properties: observation, geometry: { type: 'Point', coordinates: [observation.longitude, observation.latitude] } })) };
  downloadFile(`fireweave-central-kalimantan-${date || 'observations'}.geojson`, JSON.stringify(data, null, 2), 'application/geo+json;charset=utf-8');
}
function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const signalState = (connected: boolean | undefined) => connected === undefined ? 'checking' : connected ? 'connected' : 'disconnected';
