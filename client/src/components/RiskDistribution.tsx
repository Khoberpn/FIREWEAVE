import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Flame, Layers } from 'lucide-react';

export interface ObservationDistributionProps {
  highCount?: number;
  moderateCount?: number;
  lowCount?: number;
  smolderingCount?: number;
  totalObservations?: number;
  modisShare?: number;
  viirsShare?: number;
}

const TIER_COLORS = {
  high: '#dc2626',       // FRP >= 25 MW
  moderate: '#ea580c',   // FRP 12-25 MW
  low: '#f59e0b',        // FRP 4-12 MW
  smoldering: '#0284c7', // FRP < 4 MW
};

export default function RiskDistribution({
  highCount = 342,
  moderateCount = 890,
  lowCount = 1240,
  smolderingCount = 2489,
  totalObservations = 4961,
  modisShare = 6.9,
  viirsShare = 93.1,
}: ObservationDistributionProps) {
  const data = [
    { name: 'High Intensity (FRP ≥ 25 MW)', value: highCount, color: TIER_COLORS.high },
    { name: 'Moderate (FRP 12–25 MW)', value: moderateCount, color: TIER_COLORS.moderate },
    { name: 'Low (FRP 4–12 MW)', value: lowCount, color: TIER_COLORS.low },
    { name: 'Sub-pixel Smoldering (< 4 MW)', value: smolderingCount, color: TIER_COLORS.smoldering },
  ];

  return (
    <div className="card" style={{ height: '100%', minHeight: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
              Radiative Power Distribution
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Fire Radiative Power (MW) energy tiers
            </p>
          </div>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <Flame size={18} />
          </div>
        </div>

        {/* Donut Chart with Center Text */}
        <div style={{ position: 'relative', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ height: '180px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={56}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      return (
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid var(--border-app)', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          <span style={{ color: item.payload.color }}>{item.name}: </span>
                          <span style={{ color: '#0f172a' }}>{Number(item.value ?? 0).toLocaleString()} obs</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-navy)', lineHeight: 1 }}>
              {totalObservations.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              OBSERVATIONS
            </span>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
          {data.map((item) => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem',
                borderRadius: '0.5rem',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-app)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: item.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {item.name.split(' (')[0]}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-navy)' }}>
                  {item.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Share Progress Bar */}
      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-app)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          <span style={{ color: '#dc2626' }}>VIIRS 375m ({viirsShare}%)</span>
          <span style={{ color: '#d97706' }}>MODIS 1km ({modisShare}%)</span>
        </div>
        <div style={{ width: '100%', height: '6px', borderRadius: '9999px', backgroundColor: '#d97706', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${viirsShare}%`, height: '100%', backgroundColor: '#dc2626' }} />
        </div>
      </div>
    </div>
  );
}
