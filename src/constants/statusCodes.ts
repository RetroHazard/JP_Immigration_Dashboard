/**
 * Status code constants for immigration data
 * These codes are used in the e-Stat data to categorize different application statuses
 */
export const STATUS_CODES = {
  /** Previously Received Applications (受理_旧受) */
  OLD_APPLICATIONS: '102000',

  /** Newly Received Applications (受理_新受) */
  NEW_APPLICATIONS: '103000',

  /** Total Applications (受理_計) */
  TOTAL_APPLICATIONS: '100000',

  /** Processed Applications (処理済み) */
  PROCESSED: '300000',

  /** Granted Applications (許可) */
  GRANTED: '301000',

  /** Denied Applications (不許可) */
  DENIED: '302000',

  /** Other Status (その他) */
  OTHER: '305000',

  /** Nationwide Bureau (全国) */
  NATIONWIDE_BUREAU: '100000',
} as const;

/** Type for status code values */
export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES];
