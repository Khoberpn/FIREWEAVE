import React, { useState } from 'react';
import {
  Flame,
  Activity,
  MapPin,
  Calendar,
  GitCompare,
  TrendingUp,
  FileText,
  BookOpen,
  Database,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Layers,
  ChevronDown,
} from 'lucide-react';

export type ActiveNavKey =
  | 'overview'
  | 'fire-atlas'
  | 'activity-calendar'
  | 'harmonization-lab'
  | 'fire-season'
  | 'regional-reports'
  | 'data-methodology'
  // Secondary Capabilities (separated)
  | 'data-hub'
  | 'scenario-archive';

export interface SidebarProps {
  currentKey: ActiveNavKey;
  onSelectKey: (key: ActiveNavKey) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  currentKey,
  onSelectKey,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [showSecondary, setShowSecondary] = useState(false);

  // The 7 Core Scientific Sections (Section 4 Requirements)
  const primaryNavigation = [
    { key: 'overview' as const, num: '01', label: 'Overview', icon: Activity, desc: 'Satellite Fire Intelligence' },
    { key: 'fire-atlas' as const, num: '02', label: 'Fire Atlas', icon: Flame, desc: 'Multi-Sensor Geospatial Map' },
    { key: 'activity-calendar' as const, num: '03', label: 'Burning Calendar', icon: Calendar, desc: 'Year × Month Heatmap' },
    { key: 'harmonization-lab' as const, num: '04', label: 'Harmonization Lab', icon: GitCompare, desc: 'Sensor Comparison & NFAI' },
    { key: 'fire-season' as const, num: '05', label: 'Fire Season Intel', icon: TrendingUp, desc: 'Seasonal Rhythm & Fingerprint' },
    { key: 'regional-reports' as const, num: '06', label: 'Regional Reports', icon: FileText, desc: 'Audit-Grade Summaries' },
    { key: 'data-methodology' as const, num: '07', label: 'Data & Methodology', icon: BookOpen, desc: 'Scientific Equations & Citations' },
  ];

  // Secondary Capabilities (retained without compromising core product)
  const secondaryCapabilities = [
    { key: 'data-hub' as const, label: 'Data Ingestion Hub', icon: Database },
    { key: 'scenario-archive' as const, label: 'Scenario & Archive', icon: Layers },
  ];

  return (
    <aside
      className={`fireweave-sidebar ${collapsed ? 'collapsed' : ''}`}
      aria-label="Sidebar navigation"
    >
      {/* Top Header / Branding */}
      <div>
        <div className="sidebar-header">
          <div className="sidebar-brand-box">
            <Flame size={20} />
          </div>
          {!collapsed && (
            <div>
              <div className="sidebar-brand-title">FIREWEAVE</div>
              <div className="sidebar-brand-sub">SATELLITE FIRE INTELLIGENCE</div>
            </div>
          )}
        </div>

        {/* Challenge #9 Mission Badge */}
        {!collapsed && (
          <div style={{ margin: '0.5rem 1rem 1rem', padding: '0.45rem 0.65rem', borderRadius: '0.5rem', backgroundColor: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              NASA Space Apps 2026
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#e2e8f0', marginTop: '2px', lineHeight: 1.25 }}>
              Challenge #9: Harmonization of MODIS & VIIRS Hot Spots
            </div>
          </div>
        )}

        {/* 7 Core Scientific Navigation Links */}
        <div className="sidebar-scroll">
          {!collapsed && (
            <div className="sidebar-group-title">
              SCIENTIFIC NAVIGATION
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {primaryNavigation.map((item) => {
              const isActive = currentKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectKey(item.key)}
                  title={`${item.num}. ${item.label} — ${item.desc}`}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  style={{ position: 'relative' }}
                >
                  <item.icon className="icon" />
                  {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{item.label}</span>
                      <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', opacity: 0.6, fontWeight: 700 }}>
                        {item.num}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Secondary Capabilities Accordion */}
          {!collapsed && (
            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setShowSecondary((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                <span>Secondary Tools</span>
                <ChevronDown size={12} style={{ transform: showSecondary ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>

              {showSecondary && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.35rem' }}>
                  {secondaryCapabilities.map((item) => {
                    const isActive = currentKey === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onSelectKey(item.key)}
                        title={item.label}
                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                        style={{ fontSize: '0.75rem', opacity: 0.8 }}
                      >
                        <item.icon className="icon" size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status & Controls */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div style={{ padding: '0.5rem 0.65rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', fontSize: '0.6875rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#22d3ee', fontWeight: 800 }}>
              <ShieldCheck size={13} />
              <span>NASA FIRMS CONNECTED</span>
            </div>
            <div style={{ fontSize: '0.625rem', marginTop: '2px', opacity: 0.8 }}>
              MODIS (Terra/Aqua) + VIIRS (NOAA/SNPP)
            </div>
          </div>
        )}

        {/* Status Pill & Collapse Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', paddingLeft: '0.25rem', paddingRight: '0.25rem', fontSize: '0.6875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pulse-dot-green" />
            {!collapsed && <span style={{ fontWeight: 700, color: '#34d399', letterSpacing: '0.04em' }}>TELEMETRY ACTIVE</span>}
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', backgroundColor: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
