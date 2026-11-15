# FIREWEAVE — NASA Space Apps Challenge 2026
## Submission Compliance & Scientific Verification Checklist

**Project Name:** FIREWEAVE  
**Challenge:** Challenge #9 — Harmonization of MODIS and VIIRS Hot Spots  
**Challenge URL:** https://www.spaceappschallenge.org/2026/challenges/modis-and-viirs-hot-spots/  
**Team Name:** Fireweave Team / MAN 1 Surakarta  
**Team Members:** Akbar Prasetya Nugraha & Rizqi Rahmahsari Wahono  
**Institution:** MAN 1 Surakarta (Madrasah Aliyah Negeri 1 Surakarta)  
**Local Event:** Yogyakarta, Indonesia  
**Submission Date:** November 2026  

---

## 1. NASA Space Apps Challenge Compliance Matrix

| Rule / Requirement | Mandatory Standard | FIREWEAVE Presentation Status | Evidence / Verification |
|---|---|---|---|
| **Slide Count Limit** | Maximum 7 slides total (including title) | ✅ **EXACTLY 7 SLIDES** (0 appendix slides) | Verified by `python-pptx` inspection (Slides 1 to 7) |
| **Language** | English throughout | ✅ **100% English** | Complete technical and editorial English text |
| **Official Challenge Name** | Challenge #9 — Harmonization of MODIS and VIIRS Hot Spots | ✅ **Included on Slides 1, 2, 7 & metadata** | Clearly displayed in header and challenge tags |
| **Team Identification** | Team Name & Member Names | ✅ **Akbar Prasetya Nugraha & Rizqi Rahmahsari Wahono** | Displayed on Slide 1 and final metadata |
| **Local Event** | Must be stated | ✅ **Yogyakarta, Indonesia** | Displayed on Slides 1 & 7 |
| **Role of NASA Data** | NASA data must remain central | ✅ **NASA FIRMS is the core telemetry source** | Ingestion from Terra, Aqua, Suomi-NPP, NOAA-20, NOAA-21 |
| **Data Attribution & Provenance** | Clear citations & provenance notes | ✅ **Included on all slides & speaker notes** | Citations to Giglio et al. (2016), Schroeder et al. (2014) |
| **AI Generation Watermarks** | No un-watermarked AI images | ✅ **Zero AI-generated imagery used** | Uses authentic browser runtime screenshots only |
| **NASA Branding Protection** | Never recreate/modify official NASA insignias | ✅ **Fully Compliant** | No NASA logos or mission meatball insignias created |
| **Minor Protection** | No likenesses of minors | ✅ **Fully Compliant** | Only satellite telemetry, maps, and system UI |
| **Editable PPTX & PDF** | Both formats delivered and matching | ✅ **Delivered (.pptx & .pdf)** | PDF converted directly via PowerPoint COM engine |

---

## 2. Deliverable File Manifest

1. **PowerPoint Presentation (.pptx)**:  
   [FIREWEAVE_NASA_Space_Apps_2026.pptx](file:///d:/FIREWEAVE/FIREWEAVE_NASA_Space_Apps_2026.pptx) (900 KB, 16:9 widescreen, 7 slides, embedded speaker notes)
2. **PDF Presentation (.pdf)**:  
   [FIREWEAVE_NASA_Space_Apps_2026.pdf](file:///d:/FIREWEAVE/FIREWEAVE_NASA_Space_Apps_2026.pdf) (1.22 MB, vector-rendered from PPTX via PowerPoint COM)
3. **Scientific Evidence Audit**:  
   [FIREWEAVE_EVIDENCE_AUDIT.md](file:///d:/FIREWEAVE/FIREWEAVE_EVIDENCE_AUDIT.md) (10.7 KB, 42-file classification matrix across Verified, Partially Verified, Proposed, and Unverified)
4. **Presentation Generator Script**:  
   [generate_presentation.py](file:///d:/FIREWEAVE/generate_presentation.py) (reproducible Python generator using `python-pptx`)

---

## 3. Slide-by-Slide Scientific Narrative & Speaker Notes

### SLIDE 1 — PROJECT IDENTITY
- **Headline / Title**: FIREWEAVE — Understanding Two Decades of Earth's Burning Patterns
- **Core Message**: *"FIREWEAVE transforms fragmented satellite fire observations into harmonized historical intelligence, helping people understand how Earth's burning patterns change over time."*
- **Visual**: Authentic runtime screenshot showing the live MapLibre WebGL interface rendering 10,115 active thermal anomalies across Indonesia with El Niño ONI +1.38°C climate diagnostic and 295° WNW monsoonal wind drift vectors.
- **Speaker Notes**: Welcomes judges to Challenge #9; establishes the project identity, team provenance (MAN 1 Surakarta), and Central Kalimantan peatland demonstration focus.

### SLIDE 2 — THE SCIENTIFIC PROBLEM
- **Headline**: "Two Satellite Records. Different Sensors. One Historical Understanding."
- **Content**: Contrast between MODIS (1 km pixel footprint at nadir, 10:30 & 13:30 overpass, 0-100% confidence) and VIIRS (375 m I-band pixel footprint, ~10x smaller surface area, 13:30 overpass, low/nominal/high confidence). Explains why naive aggregation fails (artificial 5x-10x post-2012 trend inflation, incompatible quality filters, diurnal sampling biases).
- **Speaker Notes**: References peer-reviewed literature (Giglio et al. 2016, Schroeder et al. 2014, NASA FIRMS documentation). Emphasizes that detection count is an artifact of sensor resolution, not direct burned area.

### SLIDE 3 — THE FIREWEAVE APPROACH
- **Headline**: "From Fragmented Observations to Sensor-Aware Fire Intelligence."
- **Content**: 4-stage pipeline with explicit verification status:
  - Stage 1: Ingestion & QC (VERIFIED) — secure proxy, 1 req/s throttle, backoff, schema validation, rejection tracking.
  - Stage 2: Spatial-Temporal Binning (VERIFIED) — 0.1° × 0.1° (~11 km) grid cells maintaining separate `modisCount` and `viirsCount`.
  - Stage 3: Harmonization & NFAI (VERIFIED) — independent monthly baselines (Median & MAD), robust Z-score, ratio agreement.
  - Stage 4: Compound Insight (PARTIALLY VERIFIED) — El Niño atmospheric coupling, 295° wind vectors, and proposed GPM IMERG integration.
- **Speaker Notes**: Highlights that FIREWEAVE is not a superficial API viewer; it models physical sensor differences at each pipeline stage.

### SLIDE 4 — THE PRODUCT EXPERIENCE
- **Headline**: "Explore Earth's Burning Patterns Through Space and Time."
- **Content**: Dual genuine application screenshots: (1) Full-screen WebGL MapLibre live map rendering 10,115 active detections across Indonesia, and (2) Executive disaster command dashboard with 4-tier FRP risk classification (Danger ≥25 MW, Alert 12-25 MW, Watch 4-12 MW, Normal <4 MW). Outlines 5-step operational workflow.
- **Speaker Notes**: Documents runtime capabilities verified in live browser tests; transparently notes that evacuation routes and predictive spread simulations represent demonstrated prototype concepts.

### SLIDE 5 — SIGNATURE FEATURE: FIRE SEASON FINGERPRINT
- **Headline**: "Every Region Has a Different Burning Rhythm."
- **Content**: Central Kalimantan Year × Month seasonal fire rhythm model. Empirical data audit from active NASA FIRMS ingest: VIIRS NOAA-20 (5,013) + NOAA-21 (3,823) + S-NPP (741) = 9,577 records (93.1%); MODIS Terra/Aqua = 708 records (6.9%). Demonstrates empirical 13.5:1 sub-pixel sensitivity ratio in tropical peatlands. Explains algorithmic 3-year baseline completeness gate.
- **Speaker Notes**: Explains why the non-parametric MAD baseline protects against extreme historical outlier years (e.g. 2015 El Niño). Transparently discloses that current active dataset covers November 2026 NRT observations, and outlines multi-year SP historical archive requirements.

### SLIDE 6 — SCIENTIFIC VALIDITY & DATA TRANSPARENCY
- **Headline**: "Science Before AI. Evidence Before Interpretation."
- **Content**: Full mathematical formulation of the Normalized Fire Activity Index (NFAI):
  $$Scale = 1.4826 \times MAD + 1, \quad Z_{robust} = \frac{Observed - Median}{Scale}, \quad NFAI = clamp\left(\frac{Z_{robust}}{3}, -1, 1\right)$$
  Lists 5 non-negotiable remote sensing limitations: (1) Detections ≠ unique fires or burned area, (2) Missing observations ≠ zero fire, (3) Sensor physics drive raw discrepancies, (4) Statistical anomalies ≠ proved causality, (5) Historical patterns ≠ future guarantee.
- **Speaker Notes**: Re-iterates "Science Before AI" philosophy; documents 17 automated unit tests in `processing.test.ts` verifying NFAI math, clamping boundaries, and sensor ratio logic.

### SLIDE 7 — IMPACT & THE WAY FORWARD
- **Headline**: "Turning Satellite Observations into Better Historical Understanding."
- **Content**: Practical value delivered for 3 key stakeholder communities: (1) Climate & Earth scientists (decoupled climate trends from sensor upgrades), (2) Land & Peatland Managers (tactical 295° wind-drift containment, canal-blocking water table > -40 cm), (3) Disaster Authorities (sensor-neutral benchmarks, audit-grade regional reporting). Concluding statement and future roadmap.
- **Speaker Notes**: Concludes the presentation with the core mission statement: *"FIREWEAVE transforms fragmented satellite fire observations into harmonized historical intelligence, helping people understand how Earth's burning patterns change over time."*

---
*Checked and verified for official submission to the 2026 NASA Space Apps Challenge Global Judging Panel.*
