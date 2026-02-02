// src/utils/logger.ts

/**
 * Logging utility that only outputs in development mode
 * Keeps console clean in production builds
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
   * Log warning messages (development only)
   */
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, ...args);
    }
  },

  /**
   * Log error messages (development only)
   */
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, ...args);
    }
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
