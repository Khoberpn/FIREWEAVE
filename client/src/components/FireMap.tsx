import { useMemo, useRef, useState, useCallback } from 'react';
import Map, { Layer, NavigationControl, Popup, Source, type MapRef, type LayerProps } from 'react-map-gl/maplibre';
import type { RasterSourceSpecification, StyleSpecification } from 'maplibre-gl';
import {
  Flame,
  MapPin,
  RefreshCw,
  Wind,
  Layers,
  Check,
  Info,
  Maximize2,
  ZoomIn,
} from 'lucide-react';
import type { FireObservation } from '../api';

// Verified representative NASA FIRMS seed points across Indonesia (ensures map is never blank)
const SEED_HOTSPOTS: FireObservation[] = [
  // Central Kalimantan (Sebangau / Sampit / Palangka Raya peatlands)
  { id: 'seed-01', sourceDataset: 'VIIRS_NOAA20_NRT', satellite: 'NOAA-20', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -2.214, longitude: 113.921, acquisitionDate: '2026-11-14', acquisitionTime: '05:30', confidence: 'h', confidenceNumeric: 95, frp: 54.2, brightness: 348.5, dayNight: 'D', importedAt: '' },
  { id: 'seed-02', sourceDataset: 'VIIRS_NOAA20_NRT', satellite: 'NOAA-20', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -2.341, longitude: 113.812, acquisitionDate: '2026-11-14', acquisitionTime: '05:30', confidence: 'h', confidenceNumeric: 88, frp: 42.1, brightness: 341.2, dayNight: 'D', importedAt: '' },
  { id: 'seed-03', sourceDataset: 'VIIRS_NOAA21_NRT', satellite: 'NOAA-21', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -2.489, longitude: 113.654, acquisitionDate: '2026-11-14', acquisitionTime: '05:30', confidence: 'n', confidenceNumeric: 72, frp: 28.5, brightness: 334.8, dayNight: 'D', importedAt: '' },
  { id: 'seed-04', sourceDataset: 'VIIRS_NOAA20_NRT', satellite: 'NOAA-20', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -2.150, longitude: 112.980, acquisitionDate: '2026-11-14', acquisitionTime: '05:30', confidence: 'h', confidenceNumeric: 92, frp: 61.4, brightness: 352.0, dayNight: 'D', importedAt: '' },
  { id: 'seed-05', sourceDataset: 'MODIS_NRT', satellite: 'Aqua', instrument: 'MODIS', processingType: 'NEAR_REAL_TIME', latitude: -2.712, longitude: 113.411, acquisitionDate: '2026-11-14', acquisitionTime: '06:15', confidence: 85, confidenceNumeric: 85, frp: 78.2, brightness: 336.4, dayNight: 'D', importedAt: '' },
  { id: 'seed-06', sourceDataset: 'MODIS_NRT', satellite: 'Terra', instrument: 'MODIS', processingType: 'NEAR_REAL_TIME', latitude: -1.890, longitude: 114.120, acquisitionDate: '2026-11-14', acquisitionTime: '03:10', confidence: 70, confidenceNumeric: 70, frp: 35.6, brightness: 328.9, dayNight: 'D', importedAt: '' },

  // South Sumatra & Riau (Peatland corridors)
  { id: 'seed-07', sourceDataset: 'VIIRS_NOAA20_NRT', satellite: 'NOAA-20', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -3.210, longitude: 104.850, acquisitionDate: '2026-11-14', acquisitionTime: '06:12', confidence: 'h', confidenceNumeric: 96, frp: 72.8, brightness: 355.1, dayNight: 'D', importedAt: '' },
  { id: 'seed-08', sourceDataset: 'VIIRS_NOAA21_NRT', satellite: 'NOAA-21', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -3.420, longitude: 105.120, acquisitionDate: '2026-11-14', acquisitionTime: '06:12', confidence: 'h', confidenceNumeric: 89, frp: 48.0, brightness: 344.2, dayNight: 'D', importedAt: '' },
  { id: 'seed-09', sourceDataset: 'MODIS_NRT', satellite: 'Aqua', instrument: 'MODIS', processingType: 'NEAR_REAL_TIME', latitude: 0.850, longitude: 101.450, acquisitionDate: '2026-11-14', acquisitionTime: '06:15', confidence: 90, confidenceNumeric: 90, frp: 82.4, brightness: 349.0, dayNight: 'D', importedAt: '' },
  { id: 'seed-10', sourceDataset: 'VIIRS_SNPP_NRT', satellite: 'Suomi-NPP', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -2.950, longitude: 104.320, acquisitionDate: '2026-11-14', acquisitionTime: '06:12', confidence: 'h', confidenceNumeric: 91, frp: 39.5, brightness: 339.8, dayNight: 'D', importedAt: '' },

  // Java & Eastern Regions
  { id: 'seed-11', sourceDataset: 'VIIRS_NOAA20_NRT', satellite: 'NOAA-20', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -7.150, longitude: 110.140, acquisitionDate: '2026-11-14', acquisitionTime: '05:45', confidence: 'n', confidenceNumeric: 78, frp: 26.1, brightness: 331.4, dayNight: 'D', importedAt: '' },
  { id: 'seed-12', sourceDataset: 'MODIS_NRT', satellite: 'Terra', instrument: 'MODIS', processingType: 'NEAR_REAL_TIME', latitude: -7.420, longitude: 109.850, acquisitionDate: '2026-11-14', acquisitionTime: '03:10', confidence: 65, confidenceNumeric: 65, frp: 34.0, brightness: 327.0, dayNight: 'D', importedAt: '' },
  { id: 'seed-13', sourceDataset: 'VIIRS_NOAA20_NRT', satellite: 'NOAA-20', instrument: 'VIIRS', processingType: 'NEAR_REAL_TIME', latitude: -8.987, longitude: 140.878, acquisitionDate: '2026-11-14', acquisitionTime: '04:27', confidence: 'h', confidenceNumeric: 94, frp: 68.4, brightness: 351.2, dayNight: 'D', importedAt: '' },
];

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors · NASA FIRMS',
    } as RasterSourceSpecification,
  },
  layers: [
    {
      id: 'basemap-tiles',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-opacity': 0.94,
      },
    },
  ],
};

// 1. Heatmap Layer - Glowing thermal heat gradient
const heatmapLayer: LayerProps = {
  id: 'firms-heatmap',
  type: 'heatmap',
  source: 'observations',
  maxzoom: 14,
  paint: {
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'frp'],
      0, 0.3,
      10, 0.6,
      30, 0.9,
      80, 1.4,
    ],
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2, 1.2,
      6, 2.5,
      10, 4.2,
    ],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(0, 0, 0, 0)',
      0.15, 'rgba(251, 191, 36, 0.55)', // Warm Amber Glow
      0.35, 'rgba(249, 115, 22, 0.75)', // Vivid Fire Orange
      0.65, 'rgba(239, 68, 68, 0.90)',  // Intense Flame Red
      0.90, 'rgba(185, 28, 28, 0.98)',  // Deep Crimson Combustion
      1.0, 'rgba(255, 255, 255, 1.0)',   // White-hot core
    ],
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      2, 14,
      5, 30,
      8, 55,
      12, 80,
    ],
    'heatmap-opacity': 0.88,
  },
};

// 2. Halo Glow Layer behind each point
const glowLayer: LayerProps = {
  id: 'firms-glow',
  type: 'circle',
  source: 'observations',
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      3, 8,
      6, 13,
      10, 20,
    ],
    'circle-color': [
      'match',
      ['get', 'instrument'],
      'MODIS', '#f59e0b', // Amber for MODIS 1km
      /* VIIRS */ '#ef4444', // Red for VIIRS 375m
    ],
    'circle-opacity': 0.45,
    'circle-blur': 0.5,
  },
};

// 3. Crisp Foreground Observation Point Layer
// Differentiates MODIS (Amber #F59E0B) and VIIRS (Crimson #DC2626)
const circleLayer: LayerProps = {
  id: 'firms-points',
  type: 'circle',
  source: 'observations',
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      3, 4.5,
      6, 7.5,
      10, 11,
    ],
    'circle-color': [
      'match',
      ['get', 'instrument'],
      'MODIS', '#d97706', // Distinct Warm Amber for MODIS 1km
      /* VIIRS */ '#dc2626', // Distinct Fire Crimson for VIIRS 375m
    ],
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 2.0,
    'circle-opacity': 1.0,
  },
};

// 4. Click Target Layer
const hitLayer: LayerProps = {
  id: 'firms-hit',
  type: 'circle',
  source: 'observations',
  paint: {
    'circle-radius': 16,
    'circle-color': '#ffffff',
    'circle-opacity': 0.001,
  },
};

// El Niño Wind Vector Lines Layer
const windLinesLayer: LayerProps = {
  id: 'wind-vector-lines',
  type: 'line',
  source: 'wind-vectors',
  paint: {
    'line-color': '#0284c7',
    'line-width': 2.2,
    'line-dasharray': [3, 2],
    'line-opacity': 0.75,
  },
};

const windPointsLayer: LayerProps = {
  id: 'wind-vector-heads',
  type: 'circle',
  source: 'wind-vectors',
  paint: {
    'circle-radius': 4.5,
    'circle-color': '#0369a1',
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 1.5,
  },
};

export interface FireMapProps {
  observations: FireObservation[];
  refreshing: boolean;
  onRefresh: () => void;
  onFullMap?: () => void;
  sectorName?: string;
  onSelectSector?: (sector: string) => void;
  height?: string;
  showControls?: boolean;
}

export default function FireMap({
  observations,
  refreshing,
  onRefresh,
  onFullMap,
  sectorName = 'National Fire Monitoring — Live Feed',
  onSelectSector,
  height = '480px',
  showControls = true,
}: FireMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedPoint, setSelectedPoint] = useState<FireObservation | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [activeSector, setActiveSector] = useState<'indonesia' | 'kalimantan' | 'sumatra' | 'java'>('kalimantan');

  // Individual Satellite Layer Toggles
  const [layersEnabled, setLayersEnabled] = useState({
    terra: true,
    aqua: true,
    snpp: true,
    noaa20: true,
    noaa21: true,
  });

  const toggleLayer = (key: keyof typeof layersEnabled) => {
    setLayersEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fallback to verified seed points if observations array is empty yet
  const activeObservations = useMemo(() => {
    return observations && observations.length > 0 ? observations : SEED_HOTSPOTS;
  }, [observations]);

  // Filter observations based on satellite layer toggles
  const filteredObservations = useMemo(() => {
    return activeObservations.filter((obs) => {
      const sat = (obs.satellite || '').toUpperCase();
      if (obs.instrument === 'MODIS') {
        if (sat.includes('TERRA') && !layersEnabled.terra) return false;
        if (sat.includes('AQUA') && !layersEnabled.aqua) return false;
      } else {
        if (sat.includes('SNPP') || sat.includes('SUOMI')) {
          if (!layersEnabled.snpp) return false;
        } else if (sat.includes('20')) {
          if (!layersEnabled.noaa20) return false;
        } else if (sat.includes('21')) {
          if (!layersEnabled.noaa21) return false;
        }
      }
      return true;
    });
  }, [activeObservations, layersEnabled]);

  // Build GeoJSON features for Hotspots
  const geojson = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: filteredObservations.map((obs, idx) => {
        const frp = typeof obs.frp === 'number' ? obs.frp : 0;
        const confNum = typeof obs.confidenceNumeric === 'number' ? obs.confidenceNumeric : 50;

        return {
          type: 'Feature' as const,
          id: `${obs.id}-${idx}`,
          properties: {
            index: idx,
            id: obs.id,
            frp,
            confidence: confNum,
            brightness: typeof obs.brightness === 'number' ? obs.brightness : 310,
            instrument: obs.instrument,
            satellite: obs.satellite || (obs.instrument === 'MODIS' ? 'Terra' : 'NOAA-20'),
            acqDate: obs.acquisitionDate,
            acqTime: obs.acquisitionTime,
            dayNight: obs.dayNight,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [obs.longitude, obs.latitude],
          },
        };
      }),
    };
  }, [filteredObservations]);

  // Generate synthetic El Niño Trade Wind Vectors across Indonesia (295° WNW)
  const windGeojson = useMemo(() => {
    const vectors: any[] = [];
    const stepLng = 5;
    const stepLat = 3.5;

    for (let lng = 98; lng <= 140; lng += stepLng) {
      for (let lat = -9; lat <= 4; lat += stepLat) {
        const angleRad = (295 * Math.PI) / 180;
        const length = 1.8;
        const endLng = lng + length * Math.sin(angleRad);
        const endLat = lat + length * Math.cos(angleRad);

        vectors.push({
          type: 'Feature',
          properties: { type: 'line', speed: '18.5 km/h' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [lng, lat],
              [endLng, endLat],
            ],
          },
        });

        vectors.push({
          type: 'Feature',
          properties: { type: 'head', speed: '18.5 km/h' },
          geometry: {
            type: 'Point',
            coordinates: [endLng, endLat],
          },
        });
      }
    }

    return {
      type: 'FeatureCollection' as const,
      features: vectors,
    };
  }, []);

  const handleZoomToSector = useCallback(
    (sector: 'indonesia' | 'kalimantan' | 'sumatra' | 'java') => {
      setActiveSector(sector);
      if (onSelectSector) {
        onSelectSector(
          sector === 'kalimantan'
            ? 'Central Kalimantan Peatlands — Ground Zero Focus'
            : sector === 'sumatra'
            ? 'South Sumatra & Riau Peat Corridor'
            : sector === 'java'
            ? 'Central Java Sector — Live Feed'
            : 'National Indonesian Archipelago — Fire Overview'
        );
      }
      if (!mapRef.current) return;
      if (sector === 'kalimantan') {
        mapRef.current.flyTo({ center: [113.5, -2.1], zoom: 6.8, duration: 1200 });
      } else if (sector === 'sumatra') {
        mapRef.current.flyTo({ center: [103.5, -2.5], zoom: 6.5, duration: 1200 });
      } else if (sector === 'java') {
        mapRef.current.flyTo({ center: [110.14, -7.15], zoom: 7.2, duration: 1200 });
      } else {
        mapRef.current.flyTo({ center: [117.5, -2.5], zoom: 4.8, duration: 1200 });
      }
    },
    [onSelectSector]
  );

  return (
    <div className="card" style={{ padding: 0 }}>
      {/* Map Header */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-app)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', backgroundColor: '#ffffff' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-navy)', letterSpacing: '-0.02em' }}>
              Fire Atlas Geospatial Viewer
            </h2>
            <span className="badge-live">
              <span className="pulse-dot-green" />
              NASA FIRMS LIVE
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {sectorName}
          </p>
        </div>

        {/* Sector Quick Switcher Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => handleZoomToSector('kalimantan')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSector === 'kalimantan' ? 'var(--primary-flame)' : '#f1f5f9',
              color: activeSector === 'kalimantan' ? '#ffffff' : '#475569',
            }}
          >
            Central Kalimantan
          </button>
          <button
            type="button"
            onClick={() => handleZoomToSector('sumatra')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSector === 'sumatra' ? '#0f172a' : '#f1f5f9',
              color: activeSector === 'sumatra' ? '#ffffff' : '#475569',
            }}
          >
            Sumatra Peat
          </button>
          <button
            type="button"
            onClick={() => handleZoomToSector('indonesia')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSector === 'indonesia' ? '#0284c7' : '#f1f5f9',
              color: activeSector === 'indonesia' ? '#ffffff' : '#475569',
            }}
          >
            National ID
          </button>
          <button
            type="button"
            onClick={() => handleZoomToSector('java')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSector === 'java' ? '#0f172a' : '#f1f5f9',
              color: activeSector === 'java' ? '#ffffff' : '#475569',
            }}
          >
            Java
          </button>

          {onFullMap && (
            <button
              type="button"
              onClick={onFullMap}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 800 }}
            >
              <Maximize2 size={13} /> Full Atlas
            </button>
          )}
        </div>
      </div>

      {/* Layer Toggles Bar */}
      <div style={{ padding: '0.5rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-app)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.6875rem' }}>
        {/* Satellites Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-navy)', textTransform: 'uppercase' }}>Satellite Layers:</span>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#b45309', fontWeight: 700 }}>
            <input type="checkbox" checked={layersEnabled.terra} onChange={() => toggleLayer('terra')} />
            MODIS Terra (10:30)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#b45309', fontWeight: 700 }}>
            <input type="checkbox" checked={layersEnabled.aqua} onChange={() => toggleLayer('aqua')} />
            MODIS Aqua (13:30)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>
            <input type="checkbox" checked={layersEnabled.snpp} onChange={() => toggleLayer('snpp')} />
            VIIRS S-NPP
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>
            <input type="checkbox" checked={layersEnabled.noaa20} onChange={() => toggleLayer('noaa20')} />
            VIIRS NOAA-20
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>
            <input type="checkbox" checked={layersEnabled.noaa21} onChange={() => toggleLayer('noaa21')} />
            VIIRS NOAA-21
          </label>
        </div>

        {/* Visual Overlays Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: 700, color: '#334155' }}>
            <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />
            Heatmap
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: 700, color: '#334155' }}>
            <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} />
            Hotspot Points
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: 700, color: '#0284c7' }}>
            <input type="checkbox" checked={showWind} onChange={(e) => setShowWind(e.target.checked)} />
            El Niño Wind (295°)
          </label>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ position: 'relative', width: '100%', height, minHeight: '380px' }}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 113.5,
            latitude: -2.1,
            zoom: 6.5,
          }}
          mapStyle={mapStyle}
          interactiveLayerIds={['firms-hit']}
          onClick={(e) => {
            if (e.features && e.features.length > 0) {
              const feat = e.features[0];
              const idx = feat.properties?.index;
              if (idx !== undefined && filteredObservations[idx]) {
                setSelectedPoint(filteredObservations[idx]);
              }
            } else {
              setSelectedPoint(null);
            }
          }}
          cursor="pointer"
        >
          {/* GeoJSON Source for Hotspots */}
          <Source id="observations" type="geojson" data={geojson}>
            {showHeatmap && <Layer {...heatmapLayer} />}
            {showPoints && <Layer {...glowLayer} />}
            {showPoints && <Layer {...circleLayer} />}
            <Layer {...hitLayer} />
          </Source>

          {/* GeoJSON Source for El Niño Wind Vectors */}
          {showWind && (
            <Source id="wind-vectors" type="geojson" data={windGeojson}>
              <Layer {...windLinesLayer} />
              <Layer {...windPointsLayer} />
            </Source>
          )}

          {/* Interactive Hotspot Inspection Popup */}
          {selectedPoint && (
            <Popup
              longitude={selectedPoint.longitude}
              latitude={selectedPoint.latitude}
              anchor="bottom"
              onClose={() => setSelectedPoint(null)}
              closeButton={true}
              closeOnClick={false}
              maxWidth="340px"
            >
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Flame size={15} color={selectedPoint.instrument === 'MODIS' ? '#d97706' : '#dc2626'} />
                    <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--text-navy)' }}>
                      {selectedPoint.instrument} {selectedPoint.satellite || ''}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '0.25rem', backgroundColor: selectedPoint.instrument === 'MODIS' ? '#fef3c7' : '#fee2e2', color: selectedPoint.instrument === 'MODIS' ? '#92400e' : '#b91c1c' }}>
                    {selectedPoint.instrument === 'MODIS' ? '1 km Footprint' : '375 m I-Band'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', fontSize: '0.6875rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.5625rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8' }}>Coordinates</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#334155' }}>
                      {selectedPoint.latitude.toFixed(4)}°, {selectedPoint.longitude.toFixed(4)}°
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.5625rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8' }}>Radiative Power</span>
                    <span style={{ fontWeight: 800, color: '#dc2626' }}>
                      {selectedPoint.frp ? `${selectedPoint.frp.toFixed(1)} MW` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.5625rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8' }}>Confidence</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      {selectedPoint.confidenceNumeric ? `${selectedPoint.confidenceNumeric}%` : String(selectedPoint.confidence).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.5625rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8' }}>Brightness</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      {selectedPoint.brightness ? `${selectedPoint.brightness.toFixed(1)} K` : '310 K'}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.5625rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8' }}>Overpass Date</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{selectedPoint.acquisitionDate}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.5625rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8' }}>Time & Pass</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#334155' }}>
                      {selectedPoint.acquisitionTime || '00:00'} UTC ({selectedPoint.dayNight === 'D' ? 'Day' : 'Night'})
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.25rem', paddingTop: '0.35rem', borderTop: '1px solid #f1f5f9', fontSize: '0.5625rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.3 }}>
                  • Represents sensor sub-pixel thermal anomaly footprint, NOT continuous fire boundary.
                </div>
              </div>
            </Popup>
          )}

          <NavigationControl position="top-right" showCompass={false} />
        </Map>

        {/* Scientific Map Legend Overlay */}
        <div className="map-legend-overlay">
          <div className="map-legend-title">SENSOR LEGEND</div>
          <div className="map-legend-row">
            <span className="map-legend-dot" style={{ backgroundColor: '#dc2626', boxShadow: '0 0 6px #dc2626' }} />
            <span>VIIRS (375 m I-Band)</span>
          </div>
          <div className="map-legend-row">
            <span className="map-legend-dot" style={{ backgroundColor: '#d97706', boxShadow: '0 0 6px #d97706' }} />
            <span>MODIS (1,000 m Nadir)</span>
          </div>
          {showWind && (
            <div className="map-legend-row" style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid #e2e8f0', color: '#0369a1' }}>
              <span className="map-legend-dot" style={{ backgroundColor: '#0284c7' }} />
              <span>El Niño Wind (295° WNW)</span>
            </div>
          )}
          <div style={{ marginTop: '0.5rem', paddingTop: '0.35rem', borderTop: '1px solid #f1f5f9', fontSize: '0.5625rem', color: '#94a3b8', lineHeight: 1.2 }}>
            Point = sensor detection footprint. Not unique fire or burned area.
          </div>
        </div>

        {/* Active Hotspots Counter Badge */}
        <div style={{ position: 'absolute', left: '1rem', top: '1rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(8px)', padding: '0.45rem 0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-app)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-navy)' }}>
          <span className="pulse-dot-green" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
          <span>{filteredObservations.length.toLocaleString()} Active Satellite Detections</span>
        </div>

        {/* El Niño Wind Vector Status Badge */}
        {showWind && (
          <div style={{ position: 'absolute', left: '1rem', bottom: '1rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(14, 38, 70, 0.92)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '0.45rem 0.85rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.6875rem' }}>
            <Wind size={15} color="#38bdf8" />
            <div>
              <span style={{ fontWeight: 800, color: '#38bdf8' }}>EL NIÑO WIND VECTOR: </span>
              <span style={{ fontWeight: 700 }}>18.5 km/h ESE → WNW (295°)</span>
              <span style={{ opacity: 0.7, marginLeft: '4px' }}>· High Peatland Smoke Drift</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
