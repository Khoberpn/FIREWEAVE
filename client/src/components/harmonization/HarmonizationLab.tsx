import React, { useState } from 'react';
import {
  GitCompare,
  Layers,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  Activity,
  ArrowRight,
  Database,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export default function HarmonizationLab() {
  const [activeTab, setActiveTab] = useState<'comparison' | 'preprocessing' | 'grid' | 'divergence' | 'axioms'>('comparison');
  const [selectedFireType, setSelectedFireType] = useState<'peatland' | 'savanna' | 'deforestation'>('peatland');

  // Sensor Characteristics Matrix
  const sensors = [
    {
      satellite: 'Terra',
      instrument: 'MODIS',
      agency: 'NASA',
      launchYear: 1999,
      nadirResolution: '1,000 m (1 km)',
      edgeResolution: '~4,800 m (4.8 km bow-tie)',
      overpassTimes: '10:30 (Desc) / 22:30 (Asc)',
      fireChannels: '4.0 µm (Ch 21/22), 11.0 µm (Ch 31)',
      confidenceType: 'Continuous numeric (0–100%)',
      status: 'Active (26 Years Data Archive)',
      color: '#d97706',
    },
    {
      satellite: 'Aqua',
      instrument: 'MODIS',
      agency: 'NASA',
      launchYear: 2002,
      nadirResolution: '1,000 m (1 km)',
      edgeResolution: '~4,800 m (4.8 km bow-tie)',
      overpassTimes: '13:30 (Asc) / 01:30 (Desc)',
      fireChannels: '4.0 µm (Ch 21/22), 11.0 µm (Ch 31)',
      confidenceType: 'Continuous numeric (0–100%)',
      status: 'Active (24 Years Data Archive)',
      color: '#b45309',
    },
    {
      satellite: 'Suomi-NPP',
      instrument: 'VIIRS',
      agency: 'NASA / NOAA',
      launchYear: 2011,
      nadirResolution: '375 m (I-Band)',
      edgeResolution: '~800 m (pixel aggregation)',
      overpassTimes: '13:30 (Asc) / 01:30 (Desc)',
      fireChannels: '3.74 µm (I4), 11.45 µm (I5)',
      confidenceType: 'Categorical (low, nominal, high)',
      status: 'Active (14 Years Operations)',
      color: '#dc2626',
    },
    {
      satellite: 'NOAA-20 (JPSS-1)',
      instrument: 'VIIRS',
      agency: 'NOAA / NASA',
      launchYear: 2017,
      nadirResolution: '375 m (I-Band)',
      edgeResolution: '~800 m (pixel aggregation)',
      overpassTimes: '13:30 (Asc) / 01:30 (Desc)',
      fireChannels: '3.74 µm (I4), 11.45 µm (I5)',
      confidenceType: 'Categorical (low, nominal, high)',
      status: 'Active (Primary Operational Stream)',
      color: '#ea580c',
    },
    {
      satellite: 'NOAA-21 (JPSS-2)',
      instrument: 'VIIRS',
      agency: 'NOAA / NASA',
      launchYear: 2022,
      nadirResolution: '375 m (I-Band)',
      edgeResolution: '~800 m (pixel aggregation)',
      overpassTimes: '13:30 (Asc) / 01:30 (Desc)',
      fireChannels: '3.74 µm (I4), 11.45 µm (I5)',
      confidenceType: 'Categorical (low, nominal, high)',
      status: 'Active (Latest Constellation Member)',
      color: '#e11d48',
    },
  ];

  // Ratio Comparison Data across fire biomes
  const divergenceByBiome = [
    { biome: 'Tropical Peatland (Kalimantan)', modisDetections: 708, viirsDetections: 9577, ratio: 13.5, reason: 'Small, cool smoldering subsurface combustion beneath canopy' },
    { biome: 'Secondary Forest Clearing (Sumatra)', modisDetections: 1250, viirsDetections: 6890, ratio: 5.5, reason: 'Fragmented agricultural slash piles and edge fires' },
    { biome: 'Savanna Grassland (Papua Merauke)', modisDetections: 3200, viirsDetections: 7900, ratio: 2.5, reason: 'Rapid-moving large surface flaming front; high thermal flux' },
    { biome: 'Mixed Forest Edge (Java)', modisDetections: 420, viirsDetections: 1890, ratio: 4.5, reason: 'Agricultural residue burns and ravine brush fires' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge-firms">SCIENTIFIC DIFFERENTIATION WORKSPACE</span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b' }}>
                CHALLENGE #9 METHODOLOGY
              </span>
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
              Harmonization Lab
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Transparent mathematical and geometric framework making MODIS and VIIRS active-fire observations scientifically comparable across time.
            </p>
          </div>

          {/* Navigation Pills inside Harmonization Lab */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid var(--border-app)',
                cursor: 'pointer',
                backgroundColor: activeTab === 'comparison' ? '#0f172a' : '#ffffff',
                color: activeTab === 'comparison' ? '#ffffff' : '#475569',
              }}
            >
              A. Sensor Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preprocessing')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid var(--border-app)',
                cursor: 'pointer',
                backgroundColor: activeTab === 'preprocessing' ? '#0f172a' : '#ffffff',
                color: activeTab === 'preprocessing' ? '#ffffff' : '#475569',
              }}
            >
              B. Preprocessing & QA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid var(--border-app)',
                cursor: 'pointer',
                backgroundColor: activeTab === 'grid' ? '#0f172a' : '#ffffff',
                color: activeTab === 'grid' ? '#ffffff' : '#475569',
              }}
            >
              C. 0.1° Grid Binning
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('divergence')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid var(--border-app)',
                cursor: 'pointer',
                backgroundColor: activeTab === 'divergence' ? '#0f172a' : '#ffffff',
                color: activeTab === 'divergence' ? '#ffffff' : '#475569',
              }}
            >
              D. Divergence Ratio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('axioms')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid var(--border-app)',
                cursor: 'pointer',
                backgroundColor: activeTab === 'axioms' ? 'var(--primary-flame)' : '#ffffff',
                color: activeTab === 'axioms' ? '#ffffff' : '#475569',
              }}
            >
              E. 5 Remote Sensing Axioms
            </button>
          </div>
        </div>
      </div>

      {/* TAB A: SENSOR MATRIX */}
      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ overflowX: 'auto', padding: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.75rem' }}>
              Instrument Physical Characteristics Matrix
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-app)' }}>
                  <th style={{ padding: '0.625rem', fontWeight: 800, color: 'var(--text-navy)' }}>SATELLITE & SENSOR</th>
                  <th style={{ padding: '0.625rem', fontWeight: 800, color: 'var(--text-navy)' }}>NADIR PIXEL</th>
                  <th style={{ padding: '0.625rem', fontWeight: 800, color: 'var(--text-navy)' }}>SCAN-EDGE PIXEL</th>
                  <th style={{ padding: '0.625rem', fontWeight: 800, color: 'var(--text-navy)' }}>LOCAL OVERPASS</th>
                  <th style={{ padding: '0.625rem', fontWeight: 800, color: 'var(--text-navy)' }}>FIRE CHANNELS</th>
                  <th style={{ padding: '0.625rem', fontWeight: 800, color: 'var(--text-navy)' }}>CONFIDENCE MODEL</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map((s) => (
                  <tr key={s.satellite} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.625rem', fontWeight: 800 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color }} />
                        <div>
                          <div style={{ color: 'var(--text-navy)', fontWeight: 800 }}>{s.instrument} {s.satellite}</div>
                          <div style={{ fontSize: '0.625rem', color: '#64748b' }}>Launched {s.launchYear} · {s.agency}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                      {s.nadirResolution}
                    </td>
                    <td style={{ padding: '0.625rem', fontFamily: 'var(--font-mono)', color: '#475569' }}>
                      {s.edgeResolution}
                    </td>
                    <td style={{ padding: '0.625rem', fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 700 }}>
                      {s.overpassTimes}
                    </td>
                    <td style={{ padding: '0.625rem', fontFamily: 'var(--font-mono)', color: '#475569' }}>
                      {s.fireChannels}
                    </td>
                    <td style={{ padding: '0.625rem', color: '#334155' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.375rem', backgroundColor: '#f1f5f9', fontWeight: 700, fontSize: '0.6875rem' }}>
                        {s.confidenceType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Physical takeaway card */}
          <div className="card" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.35rem' }}>
              Why MODIS and VIIRS Cannot Be Naively Summed:
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#7c2d12', lineHeight: 1.5 }}>
              A single 1 km MODIS pixel covers <strong>1,000,000 m²</strong> of ground area. A 375 m VIIRS pixel covers only <strong>140,625 m²</strong> (~1/7th the area). When a fire burns on the landscape, VIIRS slices the thermal signature into multiple distinct active pixels where MODIS triggers only a single detection. Directly adding their raw counts creates an artificial ~5x to 10x surge after 2012 that reflects sensor engineering, not real burning growth.
            </p>
          </div>
        </div>
      )}

      {/* TAB B: PREPROCESSING & QA/QC */}
      {activeTab === 'preprocessing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#2563eb" /> MODIS QA/QC Protocol
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: '#475569' }}>
              <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
                <strong>Confidence Parsing:</strong> Continuous 0–100% Bayesian probability. FIREWEAVE treats &lt;30% as low, 30–80% as nominal, and &gt;80% as high confidence.
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
                <strong>Bow-Tie Pixel Growth Mitigation:</strong> Towards scan angles (&gt;45°), MODIS pixels stretch to ~4.8 km. We preserve the original scan angle metadata to avoid geometric distortion.
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
                <strong>Cloud & Glint Mask:</strong> Sun glint over tropical inland water bodies is systematically filtered using solar zenith and reflection angle geometry.
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#dc2626" /> VIIRS QA/QC Protocol
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: '#475569' }}>
              <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
                <strong>Categorical Confidence Mapping:</strong> High (h) mapped to 90%, Nominal (n) mapped to 60%, Low (l) mapped to 30% for mathematical baseline consistency.
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
                <strong>Pixel Trimming & Constrained Growth:</strong> VIIRS uses onboard sample aggregation (3:1 nadir, 2:1 mid-scan, 1:1 edge), preventing pixel growth beyond ~800 m.
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
                <strong>South Atlantic Anomaly (SAA) Rejection:</strong> High-energy particle hits that trigger false thermal spikes are purged during pre-ingest validation.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: 0.1° GRID BINNING */}
      {activeTab === 'grid' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-navy)' }}>
            Spatial-Temporal Equal-Area Binning (0.1° × 0.1°)
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            To compare observations without erasing their distinct physics, FIREWEAVE partitions the globe into uniform <strong>0.1° × 0.1° (~11 km × 11 km)</strong> spatial grid cells and weekly/monthly temporal slices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ margin: '0.5rem 0' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b' }}>GRID RESOLUTION</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-navy)' }}>0.1° (~11 km)</div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Standard equal-area bin size</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b' }}>DUAL SENSOR TRACKING</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>modisCount & viirsCount</div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Preserved separately in every cell</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b' }}>TEMPORAL RESOLUTION</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-flame)' }}>ISO Weeks & Months</div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Matched to regional fire seasons</div>
            </div>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#334155' }}>
            <code>Cell ID Format: &#123;region&#125;|&#123;latBin&#125;|&#123;lonBin&#125;|&#123;YYYY-MM&#125;|&#123;Week&#125;</code><br />
            <code>Example: Central_Kalimantan_ID|-2.2000|113.9000|2026-11|W46 (modis: 4, viirs: 38)</code>
          </div>
        </div>
      )}

      {/* TAB D: DIVERGENCE & BIOME RATIOS */}
      {activeTab === 'divergence' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-navy)' }}>
              Empirical Sensor Divergence by Ecosystem & Fire Type
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              The ratio of VIIRS to MODIS detections varies dramatically based on vegetation structure and fire mechanics.
            </p>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divergenceByBiome}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="biome" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val.toLocaleString()} Detections`,
                    name === 'modisDetections' ? 'MODIS (1 km)' : 'VIIRS (375 m)',
                  ]}
                />
                <Legend />
                <Bar dataKey="modisDetections" name="MODIS (1 km)" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="viirsDetections" name="VIIRS (375 m)" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {divergenceByBiome.map((b) => (
              <div key={b.biome} style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)' }}>{b.biome}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '0.25rem', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                    Ratio: {b.ratio}:1
                  </span>
                </div>
                <p style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {b.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB E: 5 REMOTE SENSING AXIOMS */}
      {activeTab === 'axioms' && (
        <div className="card" style={{ borderLeft: '4px solid var(--primary-flame)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Scale size={20} color="var(--primary-flame)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-navy)', letterSpacing: '-0.01em' }}>
              The Five Non-Negotiable Remote Sensing Axioms
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem' }}>
            Scientific integrity requires acknowledging what satellite thermal observations can and cannot prove:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#b91c1c' }}>
                1. Detections ≠ Unique Fires or Burned Area
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                A hotspot point indicates that an instrument detected a sub-pixel thermal anomaly exceeding the background threshold during an overpass. It does NOT represent a distinct fire perimeter or quantify hectare burn area.
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#c2410c' }}>
                2. Missing Observations ≠ Zero Fire
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                Dense cloud cover, heavy smoke attenuation, or satellite orbit gaps can obscure active flaming. Zero detections means no thermal anomaly was detected through the atmosphere, not guaranteed absence of fire.
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#d97706' }}>
                3. Sensor Physics Drive Raw Discrepancies
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                The 3x–10x divergence between VIIRS and MODIS is a direct consequence of pixel footprint geometry (375 m vs 1 km) and detector spectral responses, NOT sudden changes in Earth climate or fire activity.
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0284c7' }}>
                4. Statistical Anomalies ≠ Proved Causality
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                A high NFAI value indicates a statistical departure from the historical median. Attributing causality (e.g. land clearing, lightning, arson) requires independent ground truth and contextual data.
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-app)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#475569' }}>
                5. Historical Baselines Must Be Sensor-Specific
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                VIIRS observations must only be evaluated against VIIRS historical baselines; MODIS against MODIS. Cross-sensor normalization occurs ONLY after independent baseline normalization.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
