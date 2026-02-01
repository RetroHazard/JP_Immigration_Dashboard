// src/utils/logger.ts

/**
 * Logging utility that only outputs in development mode
 * console.warn and console.error are always enabled for production debugging
 */
export const logger = {
  /**
   * Log informational messages (development only)
   */
  log: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  },

  /**
   * Log warning messages (always enabled)
   */
  warn: (message: string, ...args: unknown[]) => {
    console.warn(message, ...args);
  },

  /**
   * Log error messages (always enabled)
   */
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },

  /**
   * Log debug messages (development only)
   */
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message, ...args);
    }
  },
};
