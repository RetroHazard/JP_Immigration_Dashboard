// src/utils/loadResidentsData.ts
// Loads the pre-transformed Foreign Residents file emitted at build time by
// scripts/transform-data.mts and unpacks it into ResidentRecord[].
import { logger } from './logger';
import type { ResidentsDataFile } from './residentsData';
import { unpackResidentsData } from './residentsData';

export interface LoadedResidentsData {
  meta: ResidentsDataFile['meta'];
  records: ReturnType<typeof unpackResidentsData>;
}

export const loadResidentsData = async (): Promise<LoadedResidentsData | null> => {
  try {
    const response = await fetch('/data/residents.json');

    if (!response.ok) {
      logger.error('HTTP error loading residents data:', response.status);
      return null;
    }

    const file = (await response.json()) as ResidentsDataFile;
    // `kind` is what stops the processing file being unpacked with a stride of
    // 4, which would silently produce three-quarters as many nonsense records.
    if (file?.meta?.schema !== 1 || file?.meta?.kind !== 'residents' || !Array.isArray(file.values)) {
      logger.error('Unexpected residents data schema:', file?.meta);
      return null;
    }

    return { meta: file.meta, records: unpackResidentsData(file) };
  } catch (error) {
    logger.error('Error loading residents data:', error);
    return null;
  }
};
