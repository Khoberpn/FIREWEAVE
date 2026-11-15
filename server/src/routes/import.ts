/* FIREWEAVE  - NASA CSV import route (authorized demonstration operators). */

import { Router } from 'express';
import { parseFirmsCsv } from '../services/firmsConnector.js';
import { normalizeRows } from '../services/ingestion.js';
import { storage } from '../services/storage.js';
import type {
  SourceDataset,
  ProcessingType,
  ImportBatch,
} from '../types.js';

function makeBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

const router = Router();

// Import via text/csv body. Headers: X-Filename (required), X-Source (optional dataset id), X-Region (optional)
router.post('/nasa-csv', (req, res, next) => {
  try {
    const filename = req.headers['x-filename'] as string | undefined;
    if (!filename) {
      res.status(400).json({ error: 'X-Filename header required' });
      return;
    }
    const source = (req.headers['x-source'] as SourceDataset) ?? undefined;
    const region = (req.headers['x-region'] as string) ?? 'Imported_Region';
    const csvText = typeof req.body === 'string' ? req.body : '';

    if (!csvText.trim()) {
      res.status(400).json({ error: 'Empty CSV body' });
      return;
    }

    let headers: string[] = [];
    let rows: Record<string, string>[] = [];
    try {
      const parsed = parseFirmsCsv(csvText);
      headers = parsed.headers;
      rows = parsed.rows;
    } catch (err: any) {
      res.status(400).json({ error: 'Invalid NASA CSV format', message: String(err?.message ?? err) });
      return;
    }

    if (rows.length === 0) {
      res.status(400).json({ error: 'CSV contains header only, no data rows' });
      return;
    }

    const batchId = makeBatchId();
    const result = normalizeRows(rows, region, source, batchId);

    storage.addObservations(result.accepted);

    const minDate = result.accepted.reduce((min, o) => (o.acquisitionDate < min ? o.acquisitionDate : min), result.accepted[0]?.acquisitionDate ?? '');
    const maxDate = result.accepted.reduce((max, o) => (o.acquisitionDate > max ? o.acquisitionDate : max), result.accepted[0]?.acquisitionDate ?? '');

    const batch = {
      id: batchId,
      filename,
      sourceDataset: source,
      processingType: source
        ? ((source.endsWith('_SP') ? 'STANDARD' : 'NEAR_REAL_TIME') as ProcessingType)
        : undefined,
      acquisitionPeriod: { start: minDate, end: maxDate },
      recordCount: result.stats.totalRows,
      acceptedCount: result.stats.accepted,
      rejectedCount: result.stats.rejected,
      importedAt: new Date().toISOString(),
      status: (result.stats.rejected > 0
        ? 'completed_with_errors'
        : 'completed') as ImportBatch['status'],
      errors: result.rejected.slice(0, 50).map((r) => `row ${r.rowIndex}: ${r.reason}`),
    };
    storage.addImport(batch);

    res.json({
      batch,
      stats: result.stats,
      missingAttributes: result.stats.missingAttributes,
      sampleAccepted: result.accepted.slice(0, 5),
      message: `Imported ${result.stats.accepted} of ${result.stats.totalRows} records from ${filename}`,
    });
  } catch (err: any) {
    next(err);
  }
});

export default router;

