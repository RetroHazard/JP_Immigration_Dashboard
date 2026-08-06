// src/hooks/useResidentsData.ts
import { useEffect, useState } from 'react';

import type { DictionaryKey } from '../i18n/types';
import { loadResidentsData } from '../utils/loadResidentsData';
import { logger } from '../utils/logger';
import type { ResidentRecord, ResidentsDataFile } from '../utils/residentsData';

export type { ResidentRecord };
export type ResidentsMeta = ResidentsDataFile['meta'];

/**
 * Companion to useImmigrationData for the Foreign Residents dataset. A failure
 * here is not fatal to the page — the shell disables the Residents half of the
 * switcher and the processing dashboard carries on — so the error is reported
 * as a catalogue key the caller may or may not choose to surface.
 */
export const useResidentsData = () => {
  const [data, setData] = useState<ResidentRecord[] | null>(null);
  const [meta, setMeta] = useState<ResidentsMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<DictionaryKey | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loaded = await loadResidentsData();
        if (loaded) {
          setData(loaded.records);
          setMeta(loaded.meta);
        } else {
          setError('errors.noData');
        }
      } catch (error: unknown) {
        logger.error('Error loading residents data:', error);
        setError('errors.unknown');
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch((error: unknown) => {
      logger.error('Unexpected error in residents fetchData:', error);
      setError('errors.fetchFailed');
    });
  }, []);

  return { data, meta, loading, error };
};
