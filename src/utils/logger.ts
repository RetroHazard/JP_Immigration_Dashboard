// src/utils/logger.ts
// Environment-based logger that only outputs in development mode
// This prevents console logs from appearing in production builds

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...args: any[]) => isDev && console.error(...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (...args: any[]) => isDev && console.warn(...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (...args: any[]) => isDev && console.info(...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (...args: any[]) => isDev && console.log(...args),
};
