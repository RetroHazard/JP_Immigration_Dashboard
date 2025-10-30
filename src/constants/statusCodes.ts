// src/constants/statusCodes.ts

/**
 * Immigration application status codes used in e-Stat data
 * These codes represent different stages of application processing
 */
export const STATUS_CODES = {
  /** Total applications (aggregate of carried over + newly received) */
  TOTAL: '100000',
  /** Applications carried over from previous month */
  CARRIED_OVER: '102000',
  /** New applications received in current month */
  NEWLY_RECEIVED: '103000',
  /** Total processed applications (aggregate) */
  PROCESSED: '300000',
  /** Applications granted/approved */
  GRANTED: '301000',
  /** Applications denied/rejected */
  DENIED: '302000',
  /** Other dispositions (withdrawn, transferred, etc.) */
  OTHER: '305000',
} as const;

/**
 * Type representing valid status codes
 */
export type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];
