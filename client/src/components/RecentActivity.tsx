import React from 'react';
import { Database, Flame, Clock, CheckCircle2, ShieldCheck, Satellite } from 'lucide-react';

export interface TelemetryEvent {
  id: string;
  satellite: string;
  instrument: string;
  footprint: string;
  region: string;
  timeUtc: string;
  detections: number;
  maxFrp: number;
  status: 'verified' | 'qc_passed' | 'ingested';
}

const DEFAULT_EVENTS: TelemetryEvent[] = [
  {
    id: 'pass-01',
    satellite: 'NOAA-20',
    instrument: 'VIIRS',
    footprint: '375 m I-Band',
    region: 'Central Kalimantan Peat Dome (Sebangau / Sampit)',
    timeUtc: '05:30 UTC',
    detections: 1842,
    maxFrp: 98.4,
    status: 'verified',
  },
  {
    id: 'pass-02',
    satellite: 'NOAA-21',
    instrument: 'VIIRS',
    footprint: '375 m I-Band',
    region: 'South Sumatra & Riau Peatland Basin',
    timeUtc: '06:12 UTC',
    detections: 1240,
    maxFrp: 74.2,
    status: 'verified',
  },
  {
    id: 'pass-03',
    satellite: 'Aqua',
    instrument: 'MODIS',
    footprint: '1,000 m Nadir',
    region: 'Southern Indonesian Archipelago Transboundary Pass',
    timeUtc: '06:15 UTC',
    detections: 310,
    maxFrp: 112.5,
    status: 'qc_passed',
  },
  {
    id: 'pass-04',
    satellite: 'Terra',
    instrument: 'MODIS',
    footprint: '1,000 m Nadir',
    region: 'Morning Descending Overpass — West/Central Java',
    timeUtc: '03:10 UTC',
    detections: 95,
    maxFrp: 48.0,
    status: 'qc_passed',
  },
];

export default function RecentActivity({
  events = DEFAULT_EVENTS,
  onViewAll,
}: {
  events?: TelemetryEvent[];
  onViewAll?: () => void;
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-app)', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Satellite size={16} />
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
            Satellite Orbit Ingestion & QA/QC Feed
          </h2>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Full Ingest Log
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {events.map((e) => (
          <div
            key={e.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-app)',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.375rem',
                  backgroundColor: e.instrument === 'MODIS' ? '#fef3c7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: e.instrument === 'MODIS' ? '#b45309' : '#dc2626',
                  flexShrink: 0,
                }}
              >
                <Flame size={16} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)' }}>
                    {e.instrument} {e.satellite}
                  </span>
                  <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem', borderRadius: '0.25rem', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 700 }}>
                    {e.footprint}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ShieldCheck size={11} /> QC Passed
                  </span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
                  {e.region}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-navy)' }}>
                {e.detections.toLocaleString()} obs
              </div>
              <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                Max FRP {e.maxFrp} MW · {e.timeUtc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
