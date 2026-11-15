import React from 'react';
import FireMap from '../FireMap';
import type { FireObservation } from '../../api';
import { Compass, Flame, Info, Layers, Wind } from 'lucide-react';

export default function FireAtlasView({
  observations,
  refreshing,
  onRefresh,
}: {
  observations: FireObservation[];
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Informational Header */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-firms">PRIMARY GEOSPATIAL FEATURE</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748b' }}>
              CHALLENGE #9 SENSOR ATLAS
            </span>
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
            Fire Atlas — Multi-Sensor Earth Observation Map
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            High-resolution WebGL geospatial interface with independent layer activation for MODIS (Terra, Aqua) and VIIRS (S-NPP, NOAA-20, NOAA-21).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 800 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d97706' }} />
            MODIS (1 km)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 800 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
            VIIRS (375 m)
          </div>
        </div>
      </div>

      {/* Main Full-Screen Map */}
      <FireMap
        observations={observations}
        refreshing={refreshing}
        onRefresh={onRefresh}
        sectorName="Multi-Constellation Satellite Active-Fire Tracking — NASA FIRMS & Climate Coupling"
        height="700px"
      />

      {/* Contextual Peatland and El Niño Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card" style={{ backgroundColor: '#f8fafc' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={15} color="#0284c7" /> Equatorial Peatland Sensitivity
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            Subsurface peat fires in Central Kalimantan (Sebangau, Sampit) burn with lower thermal radiation (~300–450°C smoldering combustion) often partially shaded by remaining forest canopy. The 375 m VIIRS I-band sensor triggers with high sensitivity, whereas 1 km MODIS requires larger thermal energy flux to register a detection.
          </p>
        </div>

        <div className="card" style={{ backgroundColor: '#f8fafc' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-navy)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Wind size={15} color="#0284c7" /> Transboundary Monsoonal Transport
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            The active <strong>295° WNW</strong> wind vectors indicate dry southeasterly trade winds blowing across the Java Sea and Southern Borneo towards West Kalimantan and Singapore/Malaysia, defining the critical smoke and PM2.5 dispersion path.
          </p>
        </div>
      </div>
    </div>
  );
}
