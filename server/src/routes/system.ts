/* FIREWEAVE  - system status route. */

import { Router } from 'express';
import { storage } from '../services/storage.js';
import { checkHealth } from '../services/firmsConnector.js';

const router = Router();

router.get('/data-status', async (req, res, next) => {
  try {
    const health = await checkHealth();
    const snapshot = storage.statusSnapshot();
    snapshot.nasaAvailabilityChecked = health.ok;
    if (health.ok) snapshot.latestNasaDate = snapshot.observations.dateRange.end ?? null;
    res.json({
      ...snapshot,
      nasaHealth: health,
      configured: !!process.env.FIRMS_MAP_KEY,
    });
  } catch (err: any) {
    next(err);
  }
});

export default router;

