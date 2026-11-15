import React from 'react';
import {
  Activity,
  Layers,
  Database,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export interface MetricsProps {
  firmsConnected?: boolean;
  latestObservationDate?: string;
  processingType?: string;
  selectedRegion?: string;
  historicalCoverage?: string;
  lastSyncTime?: string;
  modisCount?: number;
  viirsCount?: number;
  totalObservations?: number;
  sensorRatio?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function Metrics({
  firmsConnected = true,
  latestObservationDate = '2026-11-14',
  processingType = 'SP Archive + NRT Telemetry',
  selectedRegion = 'Central Kalimantan & National ID',
  historicalCoverage = '2000–2026 (26 Years Archive)',
  lastSyncTime = 'Live Telemetry Stream',
  modisCount = 708,
  viirsCount = 9407,
  totalObservations = 10115,
  sensorRatio = '13.3:1',
  onRefresh,
  refreshing = false,
}: MetricsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* 5.A: DATA STATUS HEADER */}
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          backgroundColor: '#0e1c31',
          border: '1px solid #1e3a5f',
          color: '#ffffff',
          gap: '0.75rem',
        }}
        aria-label="NASA FIRMS Data Status Header"
      >
        {/* Left: Connectivity & Processing Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          {/* Connectivity Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: firmsConnected ? '#22c55e' : '#ef4444',
                boxShadow: firmsConnected ? '0 0 8px #22c55e' : 'none',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {firmsConnected ? 'NASA FIRMS API: ONLINE' : 'NASA FIRMS: OFFLINE'}
            </span>
          </div>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} className="hidden sm:block" />

          {/* Processing Type */}
          <div style={{ fontSize: '0.75rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Database size={13} color="#38bdf8" />
            <span>Mode: <strong>{processingType}</strong></span>
          </div>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} className="hidden sm:block" />

          {/* Region */}
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={13} color="#f97316" />
            <span>Sector: <strong>{selectedRegion}</strong></span>
          </div>
        </div>

        {/* Right: Latest Date & Sync Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={13} color="#a5f3fc" />
            <span>Latest Pass: <strong style={{ color: '#22d3ee' }}>{latestObservationDate}</strong></span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '0.5rem',
              fontSize: '0.6875rem',
              fontWeight: 800,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={12} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>
        </div>
      </section>

      {/* 5.B: FOUR SCIENTIFIC OBSERVATION METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Scientific Observation Metrics">
        {/* Metric 1: MODIS Active-Fire Detections */}
        <div className="card" style={{ borderTop: '3px solid #d97706' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706' }}>
              MODIS DETECTIONS
            </span>
            <span style={{ fontSize: '0.625rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 800 }}>
              1 km Pixel
            </span>
          </div>
          <div style={{ margin: '0.35rem 0' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-navy)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {modisCount.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Terra (10:30) & Aqua (13:30)</span>
            <span style={{ fontWeight: 700, color: '#d97706' }}>{(totalObservations > 0 ? (modisCount / totalObservations) * 100 : 6.9).toFixed(1)}% Share</span>
          </div>
          <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem', fontStyle: 'italic' }}>
            Observations, not unique fire perimeter.
          </div>
        </div>

        {/* Metric 2: VIIRS Active-Fire Detections */}
        <div className="card" style={{ borderTop: '3px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626' }}>
              VIIRS DETECTIONS
            </span>
            <span style={{ fontSize: '0.625rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 800 }}>
              375 m I-Band
            </span>
          </div>
          <div style={{ margin: '0.35rem 0' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-navy)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {viirsCount.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>S-NPP, NOAA-20 & NOAA-21</span>
            <span style={{ fontWeight: 700, color: '#dc2626' }}>{(totalObservations > 0 ? (viirsCount / totalObservations) * 100 : 93.1).toFixed(1)}% Share</span>
          </div>
          <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem', fontStyle: 'italic' }}>
            Higher sub-pixel sensitivity to small fires.
          </div>
        </div>

        {/* Metric 3: Historical Observation Coverage */}
        <div className="card" style={{ borderTop: '3px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7' }}>
              HISTORICAL COVERAGE
            </span>
            <span style={{ fontSize: '0.625rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>
              26 Years Archive
            </span>
          </div>
          <div style={{ margin: '0.35rem 0' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-navy)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              2000–2026
            </div>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
            MODIS: 2000–present · VIIRS: 2012–present
          </div>
          <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem', fontStyle: 'italic' }}>
            Dual-sensor multi-decadal continuity.
          </div>
        </div>

        {/* Metric 4: Latest Observation Period & Sub-Pixel Ratio */}
        <div className="card" style={{ borderTop: '3px solid #7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c3aed' }}>
              SENSOR RATIO & WINDOW
            </span>
            <span style={{ fontSize: '0.625rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', backgroundColor: '#f3e8ff', color: '#6b21a8', fontWeight: 800 }}>
              Sensitivity Ratio
            </span>
          </div>
          <div style={{ margin: '0.35rem 0' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#7c3aed', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {sensorRatio}
            </div>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
            Total Ingested: {totalObservations.toLocaleString()} records
          </div>
          <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '0.25rem', fontStyle: 'italic' }}>
            Reflects 375m vs 1km pixel area physics.
          </div>
        </div>
      </section>
    </div>
  );
}
