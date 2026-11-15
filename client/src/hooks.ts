import { useCallback, useEffect, useRef, useState } from 'react';
import { getDataStatus, getObservations, type DataStatus, type LiveResult, type SourceDataset } from './api';

export interface FeedState { status: 'loading' | 'ready' | 'error'; result?: LiveResult; error?: string }
export type FeedMap = Partial<Record<SourceDataset, FeedState>>;
export const SENSOR_IDS: SourceDataset[] = ['MODIS_NRT', 'VIIRS_SNPP_NRT', 'VIIRS_NOAA20_NRT', 'VIIRS_NOAA21_NRT'];
const EVERY_SENSOR = new Set<SourceDataset>(SENSOR_IDS);

export function useFirmsFeed() {
  const [windowDays, setWindowDays] = useState<1 | 3 | 5>(5);
  const [selected, setSelected] = useState<Set<SourceDataset>>(EVERY_SENSOR);
  const [feeds, setFeeds] = useState<FeedMap>({});
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState('');
  const [status, setStatus] = useState<DataStatus['nasaHealth'] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async (range: 1 | 3 | 5 = windowDays, sources: Set<SourceDataset> = selected) => {
    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    setRefreshing(true); setError('');
    setFeeds(previous => {
      const updated = { ...previous };
      for (const source of sources) updated[source] = { ...previous[source], status: 'loading' };
      return updated;
    });
    try {
      const selectedSources = [...sources];
      const outcomes = await Promise.allSettled(selectedSources.map(async source => ({ source, result: await getObservations(source, range, controller.signal) })));
      if (controller.signal.aborted) return;
      const failed = outcomes.flatMap((result, index) => {
        if (result.status === 'fulfilled') return [];
        const reason = result.reason;
        if (reason instanceof DOMException && reason.name === 'AbortError') return [];
        return [{ source: selectedSources[index]!, reason }];
      });
      setFeeds(previous => {
        const updated = { ...previous };
        for (let index = 0; index < outcomes.length; index++) {
          const result = outcomes[index]!;
          if (result.status === 'fulfilled') updated[result.value.source] = { status: 'ready', result: result.value.result };
          else if (controller.signal.aborted) return previous;
          else {
            const reason = result.reason;
            if (reason instanceof DOMException && reason.name === 'AbortError') continue;
            updated[selectedSources[index]!] = { status: 'error', error: reason instanceof Error ? reason.message : 'NASA FIRMS is unavailable.' };
          }
        }
        return updated;
      });
      const successful = outcomes.some(result => result.status === 'fulfilled');
      if (!successful && failed.length) {
        const reason = failed[0]!.reason;
        setError(reason instanceof Error ? reason.message : 'NASA FIRMS is unavailable. Check the server connection and retry.');
      }
      setLastRefresh(new Date().toISOString());
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not refresh NASA FIRMS.');
    } finally {
      if (!controller.signal.aborted) setRefreshing(false);
    }
  }, [windowDays, selected]);

  useEffect(() => {
    void refresh(windowDays, selected);
    return () => abortRef.current?.abort();
  }, [refresh, windowDays, selected]);

  useEffect(() => {
    const controller = new AbortController();
    const update = () => void getDataStatus(controller.signal)
      .then(result => setStatus(result.nasaHealth ?? { ok: !!result.configured }))
      .catch(() => { if (!controller.signal.aborted) setStatus({ ok: false, error: 'Server unavailable' }); });
    update();
    const interval = window.setInterval(update, 300_000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);

  return { windowDays, setWindowDays, selected, setSelected, feeds, error, lastRefresh, status, refreshing, refresh };
}
