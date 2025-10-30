// src/constants/bureauCodes.ts

/**
 * Immigration bureau codes used in e-Stat data
 * These codes identify specific Regional Immigration Services Bureaus
 * and their branch offices throughout Japan
 */
export const BUREAU_CODES = {
  /** Nationwide aggregate statistics */
  NATIONWIDE: '100000',

  // Regional Bureaus (Main Offices)
  /** Fukuoka Regional Immigration Services Bureau */
  FUKUOKA: '101720',
  /** Hiroshima Regional Immigration Services Bureau */
  HIROSHIMA: '101580',
  /** Kobe Branch Office */
  KOBE: '101490',
  /** Nagoya Regional Immigration Services Bureau */
  NAGOYA: '101350',
  /** Osaka Regional Immigration Services Bureau */
  OSAKA: '101460',
  /** Sapporo Regional Immigration Services Bureau */
  SAPPORO: '101010',
  /** Sendai Regional Immigration Services Bureau */
  SENDAI: '101090',
  /** Shinagawa (Tokyo) Regional Immigration Services Bureau */
  SHINAGAWA: '101170',
  /** Takamatsu Regional Immigration Services Bureau */
  TAKAMATSU: '101670',
  /** Yokohama Branch Office */
  YOKOHAMA: '101210',

  // Branch Offices (Naha)
  /** Naha Branch Office */
  NAHA: '101740',

  // Airport Branches
  /** Narita Airport Branch Office */
  NARITA_AIRPORT: '101190',
  /** Haneda Airport Branch Office */
  HANEDA_AIRPORT: '101200',
  /** Kansai Airport Branch Office */
  KANSAI_AIRPORT: '101480',
  /** Chubu Airport Branch Office */
  CHUBU_AIRPORT: '101370',
} as const;

/**
 * Type representing valid bureau codes
 */
export type BureauCode = (typeof BUREAU_CODES)[keyof typeof BUREAU_CODES];

/**
 * Special UI value for "all bureaus" filter option
 * Note: This differs from NATIONWIDE ('100000') which is an aggregate in the data
 */
export const BUREAU_FILTER_ALL = 'all' as const;
