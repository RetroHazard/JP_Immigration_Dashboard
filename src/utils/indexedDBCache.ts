// src/utils/indexedDBCache.ts
// IndexedDB caching for immigration data to avoid re-parsing on repeat visits
// This provides near-instant load times for returning users by skipping both
// network fetch and data transformation steps

import { logger } from './logger';

const DB_NAME = 'immigration-data-cache';
const DB_VERSION = 1;
const STORE_NAME = 'json-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Opens the IndexedDB database, creating it if it doesn't exist.
 * IndexedDB is asynchronous and provides much larger storage than localStorage
 * (typically 50MB+ vs 5MB limit).
 *
 * @returns Promise resolving to IDBDatabase instance
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        logger.info('IndexedDB object store created');
      }
    };
  });
}

/**
 * Gets cached data from IndexedDB if it exists and is not expired.
 * Returns null if cache miss or expired, triggering fallback to network fetch.
 *
 * @param key - Cache key to retrieve
 * @returns Cached data or null if not found/expired
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onerror = () => {
        logger.error('IndexedDB get error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const cached = request.result as CachedData<T> | undefined;

        if (!cached) {
          logger.info('No cached data found for key:', key);
          resolve(null);
          return;
        }

        // Check if cache is expired (24 hour TTL)
        const now = Date.now();
        if (now - cached.timestamp > CACHE_TTL) {
          logger.info('Cached data expired for key:', key);
          resolve(null);
          return;
        }

        logger.info('Valid cached data found for key:', key);
        resolve(cached.data);
      };
    });
  } catch (error) {
    logger.error('Error getting cached data:', error);
    return null; // Fail gracefully - proceed with network fetch
  }
}

/**
 * Stores data in IndexedDB with current timestamp for TTL tracking.
 * Caching errors are logged but don't throw - caching is an enhancement,
 * not a requirement.
 *
 * @param key - Cache key to store under
 * @param data - Data to cache
 */
export async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cachedData, key);

      request.onerror = () => {
        logger.error('IndexedDB put error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        logger.info('Data cached successfully for key:', key);
        resolve();
      };
    });
  } catch (error) {
    logger.error('Error setting cached data:', error);
    // Don't throw - caching is optional, app should work without it
  }
}

/**
 * Clears all cached data from IndexedDB.
 * Useful for debugging or when data structure changes require cache invalidation.
 */
export async function clearCache(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onerror = () => {
        logger.error('IndexedDB clear error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        logger.info('Cache cleared successfully');
        resolve();
      };
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    throw error;
  }
}
