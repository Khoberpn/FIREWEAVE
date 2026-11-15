import React from 'react';
import { Download, RefreshCw, GitCompare, Calendar, FileText } from 'lucide-react';

export default function QuickActions({
  onExportReport,
  onHarmonize,
  onSyncFirms,
  onOpenCalendar,
}: {
  onExportReport?: () => void;
  onHarmonize?: () => void;
  onSyncFirms?: () => void;
  onOpenCalendar?: () => void;
}) {
  return (
    <div className="card">
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
          Scientific Workflows
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Harmonization pipelines and analytical tools.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem', margin: '0.875rem 0' }}>
        <button
          type="button"
          onClick={onHarmonize}
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-app)', backgroundColor: '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
            <GitCompare size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)' }}>Harmonize Grid</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>0.1° Binning & NFAI</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenCalendar}
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-app)', backgroundColor: '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
            <Calendar size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)' }}>Burning Calendar</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Year × Month Heatmap</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onSyncFirms}
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-app)', backgroundColor: '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <RefreshCw size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)' }}>Sync NASA Feed</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Live NRT Query</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onExportReport}
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-app)', backgroundColor: '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
        >
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', flexShrink: 0 }}>
            <FileText size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)' }}>Audit Report</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>CSV / PDF Export</div>
          </div>
        </button>
      </div>

      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
        Compliant with NASA Space Apps Challenge #9 specifications.
      </div>
    </div>
  );
}
