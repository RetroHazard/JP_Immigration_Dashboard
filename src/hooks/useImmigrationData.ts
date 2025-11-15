// src/hooks/useImmigrationData.ts
// Hybrid optimization strategy: Web Worker (Option 4) + IndexedDB Caching (Option 2)
// - First visit: Web Worker transforms data in background thread (main thread stays responsive)
// - Repeat visits: IndexedDB returns cached data instantly (skips fetch + transformation)
// Expected performance: First visit Score 71/TBT 210ms, Repeat visit Score 95+/TBT ~0ms

import { useEffect, useRef, useState } from 'react';

import type { ApplicationTypeCode } from '../constants/applicationTypes';
import type { BureauCode } from '../constants/bureauCodes';
import type { StatusCode } from '../constants/statusCodes';
import { getCachedData, setCachedData } from '../utils/indexedDBCache';
import { loadLocalData } from '../utils/loadLocalData';
import { logger } from '../utils/logger';

export interface ImmigrationData {
  month: string;
  bureau: BureauCode;
  type: ApplicationTypeCode;
  value: number;
  status: StatusCode;
}

const CACHE_KEY = 'immigration-transformed-data';

/**
 * Hook for loading immigration data with hybrid optimization strategy.
 *
 * Performance strategy:
 * 1. Check IndexedDB cache first (instant if cached)
 * 2. On cache miss, use Web Worker for background transformation (keeps main thread responsive)
 * 3. Cache transformed data for next visit
 * 4. Fallback to synchronous transformation if Web Workers not supported (SSR, old browsers)
 */
export const useImmigrationData = () => {
  const [data, setData] = useState<ImmigrationData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    // Check if Web Workers are supported (not available during SSR)
    const supportsWorkers = typeof Worker !== 'undefined';

    const fetchData = async () => {
      try {
        // Step 1: Try to load from IndexedDB cache (Option 2)
        logger.info('Checking IndexedDB cache...');
        const cachedData = await getCachedData<ImmigrationData[]>(CACHE_KEY);

        if (cachedData) {
          logger.info('Cache hit! Loading from IndexedDB');
          setData(cachedData);
          setLoading(false);
          return; // Exit early - best case scenario!
        }

        // Step 2: Cache miss - fetch raw data
        logger.info('Cache miss - fetching raw data');
        const jsonData = await loadLocalData();

        if (!jsonData) {
          setError('No data available');
          setLoading(false);
          return;
        }

        // Step 3: Transform data using Web Worker (Option 4) or fallback
        if (supportsWorkers) {
          logger.info('Using Web Worker for data transformation');

          // Create worker and send data for transformation
          const worker = new Worker('/workers/dataTransform.worker.js');
          workerRef.current = worker;

          const requestId = requestIdRef.current++;

          worker.onmessage = async (event) => {
            const { type, data: transformedData, error: workerError, id } = event.data;

            // Ignore messages from old requests (if component remounted)
            if (id !== requestId) return;

            if (type === 'TRANSFORM_COMPLETE') {
              setData(transformedData);
              setLoading(false);
              logger.info('Data transformation complete (Web Worker)');

              // Step 4: Cache transformed data for next visit (Option 2)
              logger.info('Caching transformed data to IndexedDB');
              await setCachedData(CACHE_KEY, transformedData);
            } else if (type === 'TRANSFORM_ERROR') {
              setError(workerError || 'Worker transformation failed');
              setLoading(false);
              logger.error('Worker transformation error:', workerError);
            }
          };

          worker.onerror = (err) => {
            logger.error('Worker error:', err);
            setError('Worker failed to load');
            setLoading(false);
          };

          // Send data to worker for transformation
          worker.postMessage({
            type: 'TRANSFORM_DATA',
            data: jsonData,
            id: requestId,
          });
        } else {
          // Fallback: Import and use synchronous transformation (SSR or old browsers)
          logger.warn('Web Workers not supported, using synchronous transformation');
          const { transformData } = await import('../utils/dataTransform');
          const transformedData = transformData(jsonData);
          setData(transformedData);
          setLoading(false);

          // Still cache for next visit even in fallback mode
          logger.info('Caching transformed data to IndexedDB');
          await setCachedData(CACHE_KEY, transformedData);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(message);
        setLoading(false);
        logger.error('Error loading data:', error);
      }
    };

    fetchData().catch((error: unknown) => {
      logger.error('Unexpected error in fetchData:', error);
      setError('Failed to fetch data');
      setLoading(false);
    });

    // Cleanup: terminate worker when component unmounts
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return { data, loading, error };
};
