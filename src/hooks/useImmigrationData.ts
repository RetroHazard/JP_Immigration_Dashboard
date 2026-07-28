// src/hooks/useImmigrationData.ts
import { useEffect, useState } from 'react';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loaded = await loadLocalData();
        if (loaded) {
          setData(loaded.records);
          setMeta(loaded.meta);
        } else {
          setError('No data available');
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch((error: unknown) => {
      logger.error('Unexpected error in fetchData:', error);
      setError('Failed to fetch data');
    });
  }, []);

  return { data, meta, loading, error };
};
