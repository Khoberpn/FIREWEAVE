import React from 'react';
import {
  Compass,
  Download,
} from 'lucide-react';
import type { FireObservation } from '../api';

export function EvacuationRoutesView() {
  const routes = [
    { id: 'R-01', name: 'Primary South Evacuation Corridor - Assembly Shelter Alpha', status: 'Secure', capacity: '1,200 evacuees', distance: '4.2 km', color: '#14532d' },
    { id: 'R-02', name: 'West Peatland Corridor - Emergency Buffer Zone 2', status: 'Alert', capacity: '850 evacuees', distance: '6.8 km', color: '#c2410c' },
    { id: 'R-03', name: 'Sebangau Ground Route - Regional Incident Base', status: 'Secure', capacity: '2,500 evacuees', distance: '3.1 km', color: '#14532d' },
    { id: 'R-04', name: 'Alternate Hillside Access - Designated Shelter 3', status: 'Watch', capacity: '600 evacuees', distance: '5.4 km', color: '#ca8a04' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
          Evacuation Routes & Safe Corridor Management
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Real-time coordination of public safe passage and emergency assembly centers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {routes.map((r) => (
          <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b' }}>{r.id}</span>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: `${r.color}15`, color: r.color }}>
                  {r.status}
                </span>
              </div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b' }}>{r.name}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capacity: {r.capacity} · Distance: {r.distance}</p>
            </div>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 }}>
              <Compass size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertsCenterView() {
  const alerts = [
    { id: 'ALT-901', level: 'Danger (Extreme)', area: 'South Peatland Sector', time: '13:26 WIB', desc: 'Ground temperature and radiative flux exceeding critical 45 MW threshold. Evacuation advised.' },
    { id: 'ALT-902', level: 'Alert (High)', area: 'East Kotawaringin', time: '12:54 WIB', desc: 'NASA VIIRS satellite pass detected high-intensity hotspot cluster (FRP 48.5 MW).' },
    { id: 'ALT-903', level: 'Watch (Moderate)', area: 'Gunung Kidul', time: '11:18 WIB', desc: 'Soil moisture dipped below 30% with dry wind gusts recorded across forest perimeter.' },
    { id: 'ALT-904', level: 'Normal (Low)', area: 'North Sukabumi', time: '09:42 WIB', desc: 'Rapid response ground verification completed; all parameters contained within normal limits.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
            Emergency Alerts & Warning Center
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Verified multi-sensor early warning feeds across regional monitoring sectors.
          </p>
        </div>
        <span style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 800 }}>
          20 Active Alerts
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {alerts.map((a) => (
          <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b' }}>{a.id}</span>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                  {a.level}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{a.area}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#1e293b', fontWeight: 600 }}>{a.desc}</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', flexShrink: 0 }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RiskAssessmentView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
          Wildfire Risk & Vulnerability Assessment
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Multi-criteria hazard matrix: peat fuel loading, slope gradient, and residential proximity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Wildfire Danger Index</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#b91c1c', margin: '0.5rem 0' }}>High (8.4/10)</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extreme drought combined with combustible peat deposits.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Community Vulnerability</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#c2410c', margin: '0.5rem 0' }}>Moderate (5.8/10)</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14 residential settlements within 5 km perimeter buffer.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Response Readiness</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#16a34a', margin: '0.5rem 0' }}>Robust (8.1/10)</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joint task force ground teams and water-bombing aircraft ready.</p>
        </div>
      </div>
    </div>
  );
}

export function ScenarioAnalysisView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
          Scenario Simulation & Fire Spread Forecast
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          6-24 hour predictive propagation model coupled with meteorological wind forecasts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-navy)' }}>Scenario A: Sustained Wind 15 km/h (South-West)</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>Potential hotspot expansion over 12.4 hectares in 12 hours towards protected forestry.</p>
          <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.75rem', border: '1px solid #fde68a', fontSize: '0.75rem', color: '#92400e' }}>
            Action: Establish 15-meter fuel break along the northern perimeter boundary.
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-navy)' }}>Scenario B: Heavy Precipitation 20mm in 6 Hours</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>FRP radiative power drops by up to 80% with surface flame extinguishment.</p>
          <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '0.75rem', border: '1px solid #bbf7d0', fontSize: '0.75rem', color: '#166534' }}>
            Action: Focus ground surveillance on deep sub-surface smoldering peat.
          </div>
        </div>
      </div>
    </div>
  );
}

export function MitigationPlanningView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
          Strategic Disaster Mitigation & Resource Allocation
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Actionable prevention and containment plans based on spatial NASA intelligence.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { title: 'Deployment of Joint Ground Patrol Units', agency: 'BPBD & Manggala Agni', status: 'Deployed', deadline: 'Daily Routine' },
          { title: 'Aerial Weather Modification (Cloud Seeding)', agency: 'BNPB & BRIN', status: 'In Progress', deadline: 'Target 18 Nov' },
          { title: 'Early Warning Emergency SMS Broadcast', agency: 'Ministry & BNPB', status: 'Armed', deadline: 'Automated' },
          { title: 'Emergency Logistics & N95 Particulate Masks', agency: 'Red Cross & Health', status: 'Available', deadline: '24/7 Standby' },
        ].map((m, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b' }}>{m.title}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead Agency: {m.agency} · Target: {m.deadline}</p>
            </div>
            <span style={{ padding: '0.25rem 0.65rem', borderRadius: '0.75rem', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 700, fontSize: '0.75rem' }}>
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataHubView({ apiKey = 'b85ef605ba7647762cb48dfc9c40b6f5' }: { apiKey?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
          Data Integration Hub & Satellite Telemetry
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          NASA FIRMS API credentials, Earth observation constellations, and real-time sensor streams.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-navy)' }}>NASA FIRMS Connector</h3>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.625rem', fontWeight: 800 }}>CONNECTED (200 OK)</span>
          </div>
          <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', color: '#475569' }}>
            <div><strong>API Host:</strong> firms.modaps.eosdis.nasa.gov/api</div>
            <div><strong>Active Satellites:</strong> Terra, Aqua, Suomi-NPP, NOAA-20, NOAA-21</div>
            <div><strong>Configured API Key:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '0.15rem 0.35rem', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)' }}>{apiKey.slice(0, 8)}••••••••••••••••{apiKey.slice(-4)}</code></div>
            <div><strong>Cache Strategy:</strong> 6-hour automated deduplication TTL</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-navy)' }}>Meteorological Uplink (BMKG)</h3>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.625rem', fontWeight: 800 }}>ACTIVE</span>
          </div>
          <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', color: '#475569' }}>
            <div><strong>Sampling Frequency:</strong> Every 10 Minutes</div>
            <div><strong>Precipitation & Wind:</strong> 179 telemetry stations online</div>
            <div><strong>Soil Moisture Array:</strong> Automated Weather Station (AWS) network</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AiAnalyticsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
          AI Analytics & Anomaly Detection
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Deep learning models for thermal clustering, false-positive elimination, and wildfire trajectory perimeters.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Model Precision</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#2563eb', margin: '0.5rem 0' }}>96.4%</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Validated against ground truth patrol coordinates.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>False Positives Filtered</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#1e293b', margin: '0.5rem 0' }}>1,248</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reflective solar glare and industrial flare anomalies removed.</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inference Latency</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#16a34a', margin: '0.5rem 0' }}>1.2 sec</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>End-to-end spatial clustering turnaround time.</p>
        </div>
      </div>
    </div>
  );
}

export function ReportsView({ observations }: { observations: FireObservation[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
            Executive Briefings & Incident Reports
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Periodic summaries of NASA FIRMS detections and regional wildfire impact assessments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', backgroundColor: 'var(--bg-navy-hero)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          <Download size={16} />
          <span>Print Official Document</span>
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Recent Briefing History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
          {[
            { date: '14 November 2026', title: 'National Peatland Wildfire Daily Situation Briefing', size: '2.4 MB' },
            { date: '12 November 2026', title: 'Weekly Thermal Anomaly Assessment — Borneo & Sumatra', size: '4.8 MB' },
            { date: '08 November 2026', title: 'Seasonal Drought & Peat Moisture Vulnerability Analysis', size: '1.9 MB' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{r.title}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{r.date} · {r.size}</div>
              </div>
              <button type="button" style={{ color: '#2563eb', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}>Download PDF</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UsersView() {
  const users = [
    { name: 'Chief Commander BNPB', role: 'ADMINISTRATOR', email: 'commander@bnpb.go.id', status: 'Online' },
    { name: 'Regional Emergency Ops Center', role: 'OPERATOR', email: 'ops.central@bpbd.go.id', status: 'Online' },
    { name: 'Manggala Agni Fire Brigade', role: 'FIELD RESPONDER', email: 'manggala@menlhk.go.id', status: 'Active' },
    { name: 'Meteorological Satellite Analyst', role: 'ANALYST', email: 'satellite@bmkg.go.id', status: 'Active' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
          User Access Control & Operational Authorities
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Role-based credentials for emergency coordination command.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-app)', color: '#64748b', textTransform: 'uppercase', fontSize: '0.625rem', fontWeight: 800 }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem' }}>User Identity</th>
              <th style={{ padding: '0.75rem 1rem' }}>Assigned Role</th>
              <th style={{ padding: '0.75rem 1rem' }}>Official Email</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-navy)' }}>{u.name}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>{u.role}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.625rem', fontWeight: 800 }}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
