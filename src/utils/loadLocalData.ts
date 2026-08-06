// src/utils/loadLocalData.ts
// Loads the pre-transformed dashboard data emitted at build time by
// scripts/transform-data.mts and unpacks it into ImmigrationData[].
import type { DashboardDataFile } from './dashboardData';
import { unpackDashboardData } from './dashboardData';
import { logger } from './logger';

export interface LoadedDashboardData {
  meta: DashboardDataFile['meta'];
  records: ReturnType<typeof unpackDashboardData>;
}

export const loadLocalData = async (): Promise<LoadedDashboardData | null> => {
  try {
    const response = await fetch('/data/dashboard.json');

    if (!response.ok) {
      logger.error('HTTP error loading data:', response.status);
      return null;
    }

    const file = (await response.json()) as DashboardDataFile & { meta?: { kind?: string } };
    // The residents file carries `kind: 'residents'` and a stride of 4; this
    // unpacker's stride is 5, so reading it here would produce plausible-
    // looking garbage rather than an obvious failure.
    if (file?.meta?.schema !== 1 || file?.meta?.kind !== undefined || !Array.isArray(file.values)) {
      logger.error('Unexpected dashboard data schema:', file?.meta);
      return null;
    }

    return { meta: file.meta, records: unpackDashboardData(file) };
  } catch (error) {
    logger.error('Error loading local data:', error);
    return null;
  }
};
