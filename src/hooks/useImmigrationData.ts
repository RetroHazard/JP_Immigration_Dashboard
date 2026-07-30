// src/hooks/useImmigrationData.ts
import { useEffect, useState } from 'react';

import type { DictionaryKey } from '../i18n/types';
import type { DashboardDataFile } from '../utils/dashboardData';
import { loadLocalData } from '../utils/loadLocalData';
import { logger } from '../utils/logger';

export interface ImmigrationData {
  month: string;
  bureau: string;
  type: string;
  value: number;
  status: string;
}

export type DashboardMeta = DashboardDataFile['meta'];

export const useImmigrationData = () => {
  const [data, setData] = useState<ImmigrationData[] | null>(null);
  const [meta, setMeta] = useState<DashboardMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // The hook reports a catalogue key rather than a message: it runs outside
  // the render tree's locale context, and the caller has to translate anyway.
  const [error, setError] = useState<DictionaryKey | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loaded = await loadLocalData();
        if (loaded) {
          setData(loaded.records);
          setMeta(loaded.meta);
        } else {
          setError('errors.noData');
        }
      } catch (error: unknown) {
        // The underlying message ("HTTP 404", a JSON parse failure) is
        // diagnostic rather than actionable, and can't be translated — it goes
        // to the log, and the user gets a sentence they can read.
        logger.error('Error loading dashboard data:', error);
        setError('errors.unknown');
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch((error: unknown) => {
      logger.error('Unexpected error in fetchData:', error);
      setError('errors.fetchFailed');
    });
  }, []);

  return { data, meta, loading, error };
};
