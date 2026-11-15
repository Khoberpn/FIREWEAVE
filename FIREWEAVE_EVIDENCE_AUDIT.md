# FIREWEAVE — Evidence & Claim Audit Document
## NASA Space Apps Challenge 2026 | Scientific Integrity Audit

**Audit Date:** November 15, 2026  
**Auditor:** Automated codebase analysis across 42+ source files  
**Repository:** `D:\FIREWEAVE` (client + server + data)

---

## 1. Data Inventory Summary

| Asset | Records | Sensors | Date Range | Processing | Geographic Coverage |
|-------|---------|---------|------------|------------|-------------------|
| Server observations | 10,285 | MODIS_NRT (708), VIIRS_NOAA20_NRT (5,013), VIIRS_NOAA21_NRT (3,823), VIIRS_SNPP_NRT (741) | 2026-11-02 to 2026-11-14 | NRT only | Indonesia (bounding box) |
| Client observations | 4,961 | VIIRS_NOAA20_NRT only | 2026-11-10 to 2026-11-14 | NRT only | Indonesia (bounding box) |

> [!IMPORTANT]
> **No Standard Processing (SP) historical data is present.** All observations are Near Real-Time (NRT) covering approximately 12 days in November 2026. There is NO multi-year historical baseline data available for NFAI computation or seasonal fingerprint analysis.

---

## 2. Claim Classification Matrix

### A. VERIFIED — Directly supported by implementation and data

| # | Claim | Evidence Source |
|---|-------|----------------|
| A1 | FIREWEAVE ingests NASA FIRMS active fire data via the official API | `firmsConnector.ts`: Base URL `https://firms.modaps.eosdis.nasa.gov/api`, valid MAP_KEY configured (`b85ef6...`), working proxy endpoints |
| A2 | The system supports MODIS (Terra/Aqua) and VIIRS (Suomi-NPP, NOAA-20, NOAA-21) sensors | `types.ts` L3-11: 8 `SourceDataset` types defined; `ingestion.ts` L53-93: satellite/instrument detection logic |
| A3 | NRT and SP processing types are distinguished in the data model | `types.ts` L16-47: `PROCESSING_BY_SOURCE` lookup; `ingestion.ts`: version string check for `'SP'` |
| A4 | Sensor-specific quality control with rejection traceability exists | `ingestion.ts` L100-213: validates lat/lon ranges, date format, satellite/instrument pairs; records rejected rows with `rowIndex` and `reason` |
| A5 | Spatial-temporal grid aggregation at 0.1° resolution is implemented | `harmonization.ts` L15-83: `GRID_RESOLUTION = 0.1`, separate `modisCount` / `viirsCount` in `GridCell` |
| A6 | NFAI (Normalized Fire Activity Index) is a mathematically defined experimental metric | `harmonization.ts` L168-215: Formula uses MAD-based robust Z-score with 1.4826 normal consistency factor, clamped to [-1, 1] |
| A7 | Anomaly detection with tiered severity is implemented | `harmonization.ts` L218-267: robust Z-score thresholds at 1.5 (minor), 2.5 (moderate), 3.5 (severe) |
| A8 | Cross-sensor comparison logic is implemented | `harmonization.ts` L270-329: ratio-based agreement assessment (consistent ≤2:1, divergent >2:1) |
| A9 | Baseline computation requires minimum 3 years of history | `harmonization.ts` L102-165: `MIN_BASELINE_YEARS = 3`, `sufficient` flag |
| A10 | The frontend is a working React 19 + MapLibre GL application | `package.json`, `App.tsx`, `FireMap.tsx`: functional components with WebGL map rendering |
| A11 | Multi-layer heatmap with FRP-based thermal gradient visualization | `FireMap.tsx` L67-204: 5 map layers including heatmap, glow, points, hit targets, wind vectors |
| A12 | Sensor filtering UI separates MODIS and VIIRS observations | `SensorControls.tsx`, `SensorFilters`: family tabs (ALL/MODIS/VIIRS) |
| A13 | Activity chart showing daily MODIS vs VIIRS detection counts | `ActivityChart.tsx`: groups by `acquisitionDate`, separates by instrument |
| A14 | Data export in CSV and GeoJSON formats with scientific disclaimers | `utils.ts` L16-26: includes `"DETECTIONS ARE SENSOR PIXELS · NOT FIRES"` |
| A15 | Server-side deduplication prevents overlapping query artifacts | `storage.ts` L46-62: composite key deduplication |
| A16 | NASA MAP_KEY is strictly server-side with credential scrubbing | `firmsConnector.ts`: regex replacement of URLs and keys in error messages |
| A17 | Unit tests validate ingestion, harmonization, NFAI, anomalies, and sensor comparison | `processing.test.ts`: 17 tests across 7 describe blocks, all logic paths tested |
| A18 | PDF and CSV report generation with scientific disclaimers | `reports.ts`: `pdf-lib` generation with attribution and limitations |
| A19 | Data provenance display in the UI with scientific notes | `Provenance.tsx`: "DETECTION ≠ FIRE" disclaimer, sensor resolution explanation |
| A20 | The application uses Central Kalimantan as the primary demonstration region | `api.ts` L26-30: `CENTRAL_KALIMANTAN_BOUNDS: { west: 110.7, south: -3.6, east: 115.9, north: 0.9 }` |
| A21 | Request throttling (1 req/sec), exponential backoff (3 retries), and in-flight deduplication for NASA API | `firmsConnector.ts` L50-155 |

### B. PARTIALLY VERIFIED — Implementation exists but coverage/completeness is limited

| # | Claim | Status | Limitation |
|---|-------|--------|------------|
| B1 | Historical seasonal baselines for fire activity | Code implemented (`buildBaseline()`) | **No multi-year historical data loaded.** Only ~12 days of NRT data exists. Baseline computation would flag `sufficient: false` for all regions. |
| B2 | NFAI produces meaningful anomaly scores | Formula implemented and unit-tested with synthetic data | Cannot produce scientifically meaningful results without ≥3 years of monthly observations. Current data covers only November 2026 NRT. |
| B3 | Seasonal fingerprint / activity calendar visualization | Analytics endpoint exists (`/api/analytics/seasonal-fingerprint`, `/activity-calendar`) | Would produce a single-month, single-year fingerprint with current data — insufficient for seasonal pattern detection. |
| B4 | Cross-sensor comparison between MODIS and VIIRS | Logic implemented and tested | Current server data has 708 MODIS vs 9,577 VIIRS NRT observations — comparison is possible but limited to ~12 days. |
| B5 | Standard Processing (SP) data support | Data model and ingestion handle SP datasets | No SP data has been imported; all 10,285 observations are NRT. |
| B6 | Fire Season Fingerprint heatmap (Year × Month) | Backend analytics endpoint exists | Cannot generate a meaningful multi-year heatmap without historical data spanning multiple years. |
| B7 | Central Kalimantan as focused demonstration region | Bounding box defined, camera preset exists | Data was fetched for wider Indonesia bounds; Central Kalimantan observations are a subset, not separately validated. |

### C. PROPOSED — Planned features not yet implemented

| # | Feature | Evidence |
|---|---------|----------|
| C1 | NASA GPM IMERG precipitation integration | Not found in any source file. Only static El Niño / rainfall display values in `ElNinoWindCard.tsx` and `fiaIntelligence.ts`. |
| C2 | Long-term historical SP data ingestion pipeline | Import endpoint exists (`/api/import/nasa-csv`) but no historical data files are present. |
| C3 | Multi-year validated seasonal baselines | Requires data collection over ≥3 years of historical FIRMS archives. |
| C4 | Evacuation route system with real spatial data | `NavigationViews.tsx` shows hardcoded route cards (R-01 to R-04) — conceptual, not GIS-validated. |
| C5 | XGBoost / ML-based fire prediction | Referenced in `lia-assistant.md` (from predecessor project LANDSAFE) — not implemented in FIREWEAVE. |
| C6 | Risk assessment scoring with validated criteria | `NavigationViews.tsx`: Static "Wildfire Danger Index 8.4/10" — not dynamically computed. |
| C7 | BMKG weather station integration | Referenced in UI (`DataHubView`, `Metrics.tsx`) but no actual BMKG API connector exists. |

### D. UNVERIFIED — Insufficient evidence

| # | Claim | Issue |
|---|-------|-------|
| D1 | "179/180 sensors online" display | Hardcoded in `Metrics.tsx`; no actual sensor health monitoring system exists. |
| D2 | "96.4% Model Precision" AI metric | Hardcoded in `NavigationViews.tsx` (`AiAnalyticsView`); no ML model is trained or validated. |
| D3 | "12.4 mm avg rainfall" and "67.2% soil moisture" | Static values in `Metrics.tsx`; no precipitation data source is connected. |
| D4 | Specific El Niño ONI value "+1.38°C" | Hardcoded in `fiaIntelligence.ts` and `ElNinoWindCard.tsx`; no NOAA CPC API integration. |
| D5 | "1,248 false positives filtered" | Static display value; no actual false positive filtering system exists. |
| D6 | 36 total risk zones | Hardcoded in `RiskDistribution.tsx` donut chart data. |

---

## 3. Critical Findings for Presentation Design

### What CAN be presented as achieved:
1. ✅ Working NASA FIRMS API integration with live data ingestion
2. ✅ Multi-sensor support (MODIS + 3 VIIRS platforms) with proper sensor attribution
3. ✅ Sensor-aware data model distinguishing NRT vs SP, MODIS vs VIIRS
4. ✅ Quality control pipeline with rejection tracking
5. ✅ Spatial-temporal grid aggregation (0.1° bins)
6. ✅ NFAI mathematical formulation (experimental, tested with synthetic data)
7. ✅ Anomaly detection with robust statistics
8. ✅ Cross-sensor comparison methodology
9. ✅ Interactive geospatial visualization with WebGL heatmap
10. ✅ Data export with scientific disclaimers
11. ✅ PDF/CSV report generation
12. ✅ Comprehensive unit test suite

### What MUST be qualified:
1. ⚠️ Historical baselines — methodology implemented but insufficient data for validation
2. ⚠️ Seasonal fingerprints — architecture ready but requires multi-year data
3. ⚠️ NFAI results — formula validated with synthetic tests, not with real historical data
4. ⚠️ Central Kalimantan focus — bounding box defined but not separately validated with historical coverage

### What MUST NOT be claimed:
1. ❌ ML/AI prediction capabilities (not implemented)
2. ❌ BMKG weather integration (not connected)
3. ❌ GPM IMERG precipitation data (not integrated)
4. ❌ Validated historical fire trends (no historical data)
5. ❌ Specific sensor health numbers (hardcoded)
6. ❌ Specific AI precision metrics (fabricated)
7. ❌ Specific El Niño ONI values as live data (hardcoded)

---

## 4. NASA Compliance Status

| Requirement | Status |
|-------------|--------|
| Maximum 7 slides | Will comply |
| English language | Will comply |
| Team name included | ⚠️ Team name not found in repository — must be provided |
| Team member names | ⚠️ Not found in repository — must be provided |
| Challenge #9 stated | Will comply |
| NASA data role explained | Will comply — FIRMS is central |
| Data attribution | Will comply — multiple disclaimers in codebase |
| AI tool acknowledgment | Will comply |
| No NASA branding/logos | Will comply |

---

*This audit was conducted by systematic analysis of all source files, data files, configuration files, and test suites in the FIREWEAVE repository.*
