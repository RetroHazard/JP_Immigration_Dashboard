// src/utils/logger.ts
// Environment-based logger that only outputs in development mode
// This prevents console logs from appearing in production builds

const isDev = process.env.NODE_ENV === 'development';

// Use unknown[] instead of any[] for variadic console methods
// This is type-safe because we're just forwarding args to console methods
export const logger = {
  error: (...args: unknown[]) => isDev && console.error(...args),
  warn: (...args: unknown[]) => isDev && console.warn(...args),
  info: (...args: unknown[]) => isDev && console.info(...args),
  debug: (...args: unknown[]) => isDev && console.log(...args),
};
