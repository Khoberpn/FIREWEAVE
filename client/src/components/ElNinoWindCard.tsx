import React from 'react';
import { Wind, Compass, AlertTriangle, ArrowUpRight, Flame, Droplets } from 'lucide-react';

export interface ElNinoWindCardProps {
  phase?: string;
  speedKmh?: number;
  directionDegrees?: number;
  directionLabel?: string;
}

export default function ElNinoWindCard({
  phase = 'Moderate El Niño (ONI +1.38°C)',
  speedKmh = 18.5,
  directionDegrees = 295,
  directionLabel = 'East-Southeast to West-Northwest (ESE → WNW)',
}: ElNinoWindCardProps) {
  return (
    <div className="card" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-app)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border-app)', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Wind size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              El Niño Climate Anomaly & Wind Vector
            </h3>
            <span style={{ fontSize: '0.6875rem', color: '#0369a1', fontWeight: 700 }}>
              {phase} · Active Monsoonal Stream
            </span>
          </div>
        </div>

        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.6875rem', fontWeight: 800 }}>
          HIGH DRYING RISK
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {/* Metric 1: Wind Heading */}
        <div style={{ padding: '0.65rem 0.75rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Wind Vector</span>
            <Compass size={14} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-navy)' }}>
            {directionDegrees}° WNW
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
            {directionLabel}
          </div>
        </div>

        {/* Metric 2: Wind Speed */}
        <div style={{ padding: '0.65rem 0.75rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Velocity & Gusts</span>
            <Wind size={14} color="#f97316" />
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#ea580c' }}>
            {speedKmh} km/h
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
            Peak Gusts: 28.0 km/h
          </div>
        </div>

        {/* Metric 3: Peat Moisture Impact */}
        <div style={{ padding: '0.65rem 0.75rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Peat Dehydration</span>
            <Droplets size={14} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#b91c1c' }}>
            -2.4 cm/day
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
            Rainfall Deficit: -42%
          </div>
        </div>

        {/* Metric 4: Smoke Dispersion Corridor */}
        <div style={{ padding: '0.65rem 0.75rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Smoke Dispersion</span>
            <ArrowUpRight size={14} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-navy)', marginTop: '4px' }}>
            NW Transboundary
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
            Borneo/Sumatra → NW Straits
          </div>
        </div>
      </div>
    </div>
  );
}
