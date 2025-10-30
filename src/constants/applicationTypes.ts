// src/constants/applicationTypes.ts

/**
 * Immigration application type codes used in e-Stat data
 * These codes represent different categories of applications
 */
export const APPLICATION_TYPE_CODES = {
  /** Status of Residence Acquisition (在留資格取得) */
  STATUS_ACQUISITION: '10',
  /** Extension of Period of Stay (在留期間更新) */
  EXTENSION_OF_STAY: '20',
  /** Change of Status of Residence (在留資格変更) */
  CHANGE_OF_STATUS: '30',
  /** Permission to Engage in Activity Other Than That Permitted (資格外活動許可) */
  PERMISSION_FOR_ACTIVITY: '40',
  /** Re-entry Permit (再入国許可) */
  REENTRY: '50',
  /** Permanent Residence (永住許可) */
  PERMANENT_RESIDENCE: '60',
} as const;

/**
 * Type representing valid application type codes
 */
export type ApplicationTypeCode = (typeof APPLICATION_TYPE_CODES)[keyof typeof APPLICATION_TYPE_CODES];

/**
 * Special UI value for "all types" filter option
 */
export const APPLICATION_TYPE_FILTER_ALL = 'all' as const;
