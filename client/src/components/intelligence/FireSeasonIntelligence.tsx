import React, { useState } from 'react';
import {
  Compass,
  TrendingUp,
  AlertTriangle,
  Flame,
  Wind,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
  Bar,
} from 'recharts';

export default function FireSeasonIntelligence() {
  const [selectedRegion, setSelectedRegion] = useState<'Central_Kalimantan' | 'South_Sumatra' | 'National_ID'>('Central_Kalimantan');
  const [selectedSensor, setSelectedSensor] = useState<'VIIRS' | 'MODIS'>('VIIRS');

  // 12-Month Climatology Profiles
  const climatologyData = [
    { month: 'Jan', p10: 180, median: 410, p90: 780, active2026: 390, season: 'Off' },
    { month: 'Feb', p10: 240, median: 590, p90: 1100, active2026: 520, season: 'Off' },
    { month: 'Mar', p10: 380, median: 920, p90: 1650, active2026: 840, season: 'Off' },
    { month: 'Apr', p10: 290, median: 680, p90: 1250, active2026: 610, season: 'Off' },
    { month: 'May', p10: 340, median: 810, p90: 1480, active2026: 790, season: 'Shoulder' },
    { month: 'Jun', p10: 590, median: 1420, p90: 2600, active2026: 1580, season: 'Shoulder' },
    { month: 'Jul', p10: 1100, median: 2580, p90: 4800, active2026: 3100, season: 'Shoulder' },
    { month: 'Aug', p10: 3200, median: 7150, p90: 14200, active2026: 9400, season: 'Peak' },
    { month: 'Sep', p10: 5800, median: 13900, p90: 29800, active2026: 18500, season: 'Peak' }, // Peak Burning Month
    { month: 'Oct', p10: 3900, median: 9450, p90: 19500, active2026: 11200, season: 'Peak' },
    { month: 'Nov', p10: 820, median: 1980, p90: 3950, active2026: 4961, season: 'Shoulder' }, // Active Ingest Window
    { month: 'Dec', p10: 210, median: 520, p90: 980, active2026: null, season: 'Off' },
  ];

  // Historical Anomalies Audit Table
  const historicalAnomalies = [
    { period: '2026-11 (Active)', observed: 4961, expected: 1980, robustZ: 2.14, severity: 'moderate', driver: 'El Niño Monsoonal Rain Delay + Peat Desiccation' },
    { period: '2023-09', observed: 29400, expected: 13900, robustZ: 3.78, severity: 'severe', driver: 'Moderate El Niño + Late Monsoon Onset' },
    { period: '2019-09', observed: 44200, expected: 13900, robustZ: 4.82, severity: 'severe', driver: 'Strong Positive Indian Ocean Dipole (+IOD)' },
    { period: '2015-09', observed: 68500, expected: 13900, robustZ: 6.95, severity: 'severe', driver: 'Historic Super El Niño Peat Crisis (Mega-Fire)' },
    { period: '2010-09', observed: 4100, expected: 13900, robustZ: -2.39, severity: 'minor', driver: 'La Niña Persistent Monsoonal Rainfall' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge-firms">SIGNATURE FEATURE</span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b' }}>
                SEASONAL RHYTHM & FINGERPRINT
              </span>
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
              Fire Season Intelligence
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Every ecosystem exhibits a distinctive burning rhythm. FIREWEAVE isolates seasonal dynamics from multi-year climate anomalies.
            </p>
          </div>

          {/* Region & Sensor Selectors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-app)', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)', cursor: 'pointer' }}
            >
              <option value="Central_Kalimantan">Central Kalimantan Peatlands (Ground Zero)</option>
              <option value="South_Sumatra">South Sumatra & Riau Basin</option>
              <option value="National_ID">National Indonesian Archipelago</option>
            </select>

            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value as any)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-app)', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)', cursor: 'pointer' }}
            >
              <option value="VIIRS">VIIRS Baseline (375 m)</option>
              <option value="MODIS">MODIS Baseline (1 km)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Climatology Chart: 12-Month Envelope */}
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-navy)' }}>
              12-Month Climatological Envelope (2000–2026)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Shaded band represents normal historical variance (10th to 90th percentile). Solid line is the climatological median.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', fontSize: '0.6875rem', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(2, 132, 199, 0.2)', border: '1px solid #0284c7', borderRadius: '2px' }} />
              <span>Normal Range (p10–p90)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '16px', height: '2px', backgroundColor: '#0284c7' }} />
              <span>Historical Median</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#dc2626', borderRadius: '50%' }} />
              <span>Current 2026 Observed</span>
            </div>
          </div>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={climatologyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid var(--border-app)', padding: '0.5rem 0.75rem', fontSize: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.25rem' }}>
                          {label} Climatology ({d.season} Season)
                        </div>
                        <div style={{ color: '#0284c7' }}>Historical Median: {d.median.toLocaleString()} obs</div>
                        <div style={{ color: '#64748b' }}>Normal Range: {d.p10.toLocaleString()} – {d.p90.toLocaleString()} obs</div>
                        {d.active2026 !== null && (
                          <div style={{ color: '#dc2626', fontWeight: 800, marginTop: '0.25rem' }}>
                            2026 Ingested: {d.active2026.toLocaleString()} obs
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="p90" stroke="none" fill="rgba(2, 132, 199, 0.12)" />
              <Area type="monotone" dataKey="p10" stroke="none" fill="#ffffff" />
              <Line type="monotone" dataKey="median" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="active2026" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 5, fill: '#dc2626' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Three Critical Findings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Finding 1: Peak Fire Window */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Calendar size={18} color="#ea580c" />
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-navy)' }}>
              Peak Fire Season: August–October
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            In equatorial peatland ecosystems, burning activity concentrates heavily within a 90-day window when dry trade winds lower the subsurface peat water table below the critical <strong>-40 cm</strong> threshold.
          </p>
        </div>

        {/* Finding 2: Outlier Protection */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="#059669" />
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-navy)' }}>
              Outlier Protection: Median & MAD
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            Using parametric mean and standard deviation inflates baselines due to episodic mega-fire years (2015, 2019). The non-parametric <strong>Median & MAD</strong> ensures baselines remain resilient against skew.
          </p>
        </div>

        {/* Finding 3: El Niño Coupling */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Wind size={18} color="#0284c7" />
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-navy)' }}>
              El Niño Coupling (ONI +1.38°C)
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            A positive Oceanic Niño Index delays the onset of the inter-monsoon rains into late November, extending the fire window and sustaining <strong>295° WNW</strong> wind vectors that drive transboundary smoke.
          </p>
        </div>
      </div>

      {/* 4. Historical Anomaly Detection Audit Table */}
      <div className="card" style={{ overflowX: 'auto', padding: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.75rem' }}>
          Historical Seasonal Anomaly Log (Robust Z-Score ≥ ±1.5σ)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-app)' }}>
              <th style={{ padding: '0.5rem', fontWeight: 800, color: 'var(--text-navy)' }}>PERIOD</th>
              <th style={{ padding: '0.5rem', fontWeight: 800, color: 'var(--text-navy)' }}>OBSERVED</th>
              <th style={{ padding: '0.5rem', fontWeight: 800, color: 'var(--text-navy)' }}>CLIM. MEDIAN</th>
              <th style={{ padding: '0.5rem', fontWeight: 800, color: 'var(--text-navy)' }}>ROBUST Z-SCORE</th>
              <th style={{ padding: '0.5rem', fontWeight: 800, color: 'var(--text-navy)' }}>SEVERITY</th>
              <th style={{ padding: '0.5rem', fontWeight: 800, color: 'var(--text-navy)' }}>PRIMARY CLIMATE DRIVER</th>
            </tr>
          </thead>
          <tbody>
            {historicalAnomalies.map((a) => (
              <tr key={a.period} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-navy)' }}>
                  {a.period}
                </td>
                <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {a.observed.toLocaleString()}
                </td>
                <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                  {a.expected.toLocaleString()}
                </td>
                <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: a.robustZ > 0 ? '#dc2626' : '#059669' }}>
                  {a.robustZ > 0 ? `+${a.robustZ}σ` : `${a.robustZ}σ`}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: a.severity === 'severe' ? '#fee2e2' : a.severity === 'moderate' ? '#ffedd5' : '#f1f5f9', color: a.severity === 'severe' ? '#b91c1c' : a.severity === 'moderate' ? '#c2410c' : '#475569' }}>
                    {a.severity}
                  </span>
                </td>
                <td style={{ padding: '0.5rem', color: '#475569' }}>
                  {a.driver}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
