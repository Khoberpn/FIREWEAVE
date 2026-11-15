import React, { useState, useEffect } from 'react';
import { Bell, Menu, ShieldCheck, Database, Clock, Bot } from 'lucide-react';
import type { ActiveNavKey } from './Sidebar';

export interface HeaderProps {
  currentKey: ActiveNavKey;
  alertCount?: number;
  onOpenMobileMenu?: () => void;
  onSelectKey?: (key: ActiveNavKey) => void;
  onOpenFia?: () => void;
}

const NAV_TITLES: Record<ActiveNavKey, { group: string; title: string }> = {
  overview: { group: '01. SCIENTIFIC OVERVIEW', title: 'Overview — Satellite Fire Intelligence' },
  'fire-atlas': { group: '02. GEOSPATIAL FEATURE', title: 'Fire Atlas — Multi-Sensor Earth Observation Map' },
  'activity-calendar': { group: '03. CORE CHALLENGE REQUIREMENT', title: 'Burning Activity Calendar (Year × Month)' },
  'harmonization-lab': { group: '04. SCIENTIFIC WORKSPACE', title: 'Harmonization Lab — Cross-Sensor Analytics' },
  'fire-season': { group: '05. SIGNATURE FEATURE', title: 'Fire Season Intelligence — Fingerprint & Rhythm' },
  'regional-reports': { group: '06. REGIONAL AUDIT', title: 'Regional Satellite Fire Reports' },
  'data-methodology': { group: '07. PEER-REVIEWED CITATIONS', title: 'Data & Harmonization Methodology' },
  'data-hub': { group: 'SECONDARY CAPABILITY', title: 'NASA FIRMS Data Integration Hub' },
  'scenario-archive': { group: 'SECONDARY CAPABILITY', title: 'Scenario & Archive Analytics' },
};

export default function Header({
  currentKey,
  alertCount = 0,
  onOpenMobileMenu,
  onSelectKey,
  onOpenFia,
}: HeaderProps) {
  const [wibTime, setWibTime] = useState('');
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // UTC time
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`UTC ${utcHours}:${utcMinutes}:${utcSeconds}`);

      // WIB (UTC+7)
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const wibDate = new Date(utcMs + 7 * 3600000);
      const hours = String(wibDate.getHours()).padStart(2, '0');
      const minutes = String(wibDate.getMinutes()).padStart(2, '0');
      const seconds = String(wibDate.getSeconds()).padStart(2, '0');
      setWibTime(`WIB ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { group, title } = NAV_TITLES[currentKey] || {
    group: '01. SCIENTIFIC OVERVIEW',
    title: 'Overview — Satellite Fire Intelligence',
  };

  return (
    <header className="fireweave-header">
      {/* Left: Mobile Trigger & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="btn-icon lg:hidden"
          style={{ width: '2.25rem', height: '2.25rem' }}
          aria-label="Open mobile menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0284c7' }}>
            {group}
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-navy)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Telemetry Badges & Live Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Real-time UTC & WIB clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-app)', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#334155' }}>
          <span style={{ color: '#0284c7' }}>{utcTime || 'UTC 00:00:00'}</span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ color: '#475569' }}>{wibTime || 'WIB 07:00:00'}</span>
        </div>

        {/* Challenge #9 Tag */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', borderRadius: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.6875rem', fontWeight: 800 }}>
          <ShieldCheck size={14} />
          <span>CHALLENGE #9 HARMONIZED</span>
        </div>

        {/* Quick FIA Trigger Button */}
        {onOpenFia && (
          <button
            type="button"
            onClick={onOpenFia}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.75rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Bot size={15} color="#22d3ee" />
            <span>Ask FIA</span>
          </button>
        )}
      </div>
    </header>
  );
}
