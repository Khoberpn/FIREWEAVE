/* FIREWEAVE  - regional burning activity report (PDF + CSV export). */

import { Router } from 'express';
import { z } from 'zod';
import { PDFDocument, rgb } from 'pdf-lib';
import {
  aggregateGrid,
  buildBaseline,
  computeNfai,
  detectAnomalies,
} from '../services/harmonization.js';
import { storage } from '../services/storage.js';
import type { FireObservation } from '../types.js';

const router = Router();

const DateRangeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function getRegion(req: any): string {
  return (req.query.region as string) ?? 'Central_Kalimantan_ID';
}

function filterByWindow(obs: FireObservation[], start: string, end: string): FireObservation[] {
  return obs.filter((o) => o.acquisitionDate >= start && o.acquisitionDate <= end);
}

async function buildPdf(report: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const fontSize = 10;
  let y = height - 50;

  const wrap = (text: string, maxWidth: number, size: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const trial = cur ? `${cur} ${w}` : w;
      if (trial.length * 0.5 * size > maxWidth) {
        if (cur) lines.push(cur);
        cur = w;
      } else cur = trial;
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const writeLine = (text: string, size = fontSize, dy = 14) => {
    const lines = wrap(text, width - 80, size);
    for (const l of lines) {
      page.drawText(l, { x: 50, y, size, color: rgb(0, 0, 0) });
      y -= dy;
      if (y < 60) {
        const p = pdfDoc.addPage([612, 792]);
        y = height - 50;
      }
    }
  };

  writeLine('FIREWEAVE  - REGIONAL BURNING ACTIVITY REPORT', 16, 24);
  writeLine('Sensor-Aware Fire Activity Intelligence  - NASA Space Apps Challenge 2026', 11, 18);
  writeLine('Derived analytical report. FIREWEAVE metrics are NOT official NASA products.', 9, 16);
  y -= 10;
  writeLine(`Study area: ${report.region}`);
  writeLine(`Observation period: ${report.window.start} to ${report.window.end}`);
  writeLine(`Generated: ${report.generatedAt}`);
  writeLine(`Total observations: ${report.summary.totalObservations} (MODIS: ${report.summary.modisCount}, VIIRS: ${report.summary.viirsCount})`);
  y -= 6;
  writeLine('DATA SOURCES', 12, 16);
  for (const s of report.summary.sources) {
    writeLine(`- ${s.source} (${s.satellite}, ${s.instrument}, ${s.processingType}): ${s.count} observations`);
  }
  y -= 6;
  writeLine('HARMONIZATION METHODOLOGY', 12, 16);
  writeLine(report.method.summary);
  writeLine('NFAI: FIREWEAVE Normalized Fire Activity Index  - a derived experimental indicator, not an official NASA metric.');
  y -= 6;
  writeLine('FINDINGS', 12, 16);
  for (const f of report.findings) {
    writeLine(`- ${f}`);
  }
  y -= 6;
  writeLine('DATA LIMITATIONS', 12, 16);
  writeLine(report.limitations.join(' '));
  writeLine('SOURCE: NASA FIRMS (https://firms.modaps.eosdis.nasa.gov/). Contains modified NASA data.', 8, 12);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// GET /api/reports/regional?format=pdf|csv|json
router.get('/regional', async (req, res, next) => {
  try {
    const { start, end } = DateRangeSchema.parse({
      start: req.query.start,
      end: req.query.end,
    });
    const region = getRegion(req);
    const format = (req.query.format as string) ?? 'json';
    const obs = filterByWindow(storage.readObservations(), start, end).filter((o) => o.regionCode === region);

    if (obs.length === 0 && format !== 'json') {
      res.status(404).json({ error: 'No observations found for the requested region and period' });
      return;
    }

    const cells = aggregateGrid(obs, region);
    const modisObs = obs.filter((o) => o.instrument === 'MODIS');
    const viirsObs = obs.filter((o) => o.instrument === 'VIIRS');

    const sources = [...new Set(obs.map((o) => o.sourceDataset))].map((src) => {
      const subset = obs.filter((o) => o.sourceDataset === src);
      return {
        source: src,
        satellite: subset[0]?.satellite ?? '',
        instrument: subset[0]?.instrument ?? 'MODIS',
        processingType: subset[0]?.processingType ?? 'STANDARD',
        count: subset.length,
      };
    });

    const modisBaseline = buildBaseline(obs, 'MODIS', 'MODIS_SP', region);
    const viirsBaseline = buildBaseline(obs, 'VIIRS', 'VIIRS_SNPP_SP', region);

    const months = new Set(cells.map((c) => c.yearMonth));
    const findings: string[] = [];
    const nfaiList: any[] = [];
    for (const ym of months) {
      const [y, m] = ym.split('-').map(Number);
      const mNfai = computeNfai(obs, 'MODIS', 'MODIS_SP', region, y, m);
      const vNfai = computeNfai(obs, 'VIIRS', 'VIIRS_SNPP_SP', region, y, m);
      nfaiList.push(mNfai, vNfai);
      if (mNfai.direction === 'increase' && mNfai.uncertainty !== 'high') {
        findings.push(`MODIS activity in ${mNfai.period} was above the historical seasonal baseline (NFAI ${mNfai.nfai}).`);
      }
      if (vNfai.direction === 'increase' && vNfai.uncertainty !== 'high') {
        findings.push(`VIIRS activity in ${vNfai.period} was above the historical seasonal baseline (NFAI ${vNfai.nfai}).`);
      }
    }

    const anomalies = detectAnomalies(obs, 'MODIS', 'MODIS_SP', region, start, end).filter((a) => a.severity !== 'none');
    for (const a of anomalies.slice(0, 5)) {
      findings.push(`Anomaly: ${a.period} MODIS observed ${a.observed} vs expected median ${a.expectedMedian} (robust z ${a.robustZ}).`);
    }

    const report = {
      title: 'FIREWEAVE  - REGIONAL BURNING ACTIVITY REPORT',
      region,
      window: { start, end },
      generatedAt: new Date().toISOString(),
      summary: {
        totalObservations: obs.length,
        modisCount: modisObs.length,
        viirsCount: viirsObs.length,
        sources,
        gridCells: cells.length,
      },
      baselines: { modis: modisBaseline, viirs: viirsBaseline },
      nfai: nfaiList,
      anomalies,
      findings: findings.length ? findings : ['No statistically supported unusual patterns detected in this period.'],
      limitations: [
        'Hotspot detection count is not equivalent to unique fire count or burned area.',
        'MODIS and VIIRS raw counts are not directly interchangeable (different pixel sizes, overpass times, sensors).',
        'Near-Real-Time and Standard Processing records are not silently merged.',
        'Insufficient historical baseline periods are explicitly flagged rather than inferred.',
        'FIREWEAVE NFAI is a derived experimental indicator, not an official NASA product.',
      ],
      method: {
        summary: 'Observations normalized to a common schema, quality-controlled per sensor, aggregated into 0.1Â° spatial bins at monthly resolution, and compared against per-sensor historical baselines (median & MAD).',
        provenance: 'NASA FIRMS active-fire archive. Retrieval timestamp and processing timestamp recorded per record.',
      },
    };

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="fireweave_report_${region}.csv"`);
      const lines = ['yearMonth,modisCount,viirsCount,totalCount,nfaiModis,nfaiViirs'];
      for (const ym of [...months].sort()) {
        const [y, m] = ym.split('-').map(Number);
        const monthCells = cells.filter((c) => c.yearMonth === ym);
        const mN = nfaiList.find((n) => n.sensor === 'MODIS' && n.year === y && n.month === m);
        const vN = nfaiList.find((n) => n.sensor === 'VIIRS' && n.year === y && n.month === m);
        lines.push(`${ym},${monthCells.reduce((s, c) => s + c.modisCount, 0)},${monthCells.reduce((s, c) => s + c.viirsCount, 0)},${monthCells.reduce((s, c) => s + c.totalCount, 0)},${mN?.nfai ?? ''},${vN?.nfai ?? ''}`);
      }
      res.send(lines.join('\n'));
      return;
    }

    if (format === 'pdf') {
      const pdfBuffer = await buildPdf(report);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="fireweave_report_${region}.pdf"`);
      res.send(pdfBuffer);
      return;
    }

    res.json(report);
  } catch (err: any) {
    next(err);
  }
});

export default router;

