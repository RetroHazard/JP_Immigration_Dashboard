// src/utils/loadLocalData.ts
import type { RawData } from './dataTransform';
import { logger } from './logger';

export const loadLocalData = async (): Promise<RawData | null> => {
  try {
    const response = await fetch('/datastore/statData.json');

    if (!response.ok) {
      // Handle HTTP errors explicitly
      logger.error('HTTP error loading data:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    // Catch network errors or JSON parsing issues
    logger.error('Error loading local data:', error);
    return null;
  }
};
