// src/constants/applicationOptions.ts

export interface ApplicationOption {
  /** e-Stat application type code — the stable identifier, and the catalogue
   *  key suffix for its label (`appType.<value>`), abbreviation
   *  (`appType.<value>.short`), and one-word form (`appType.<value>.compact`). */
  value: string;
}

export const applicationOptions: ApplicationOption[] = [
  { value: 'all' },
  { value: '10' },
  { value: '20' },
  { value: '30' },
  { value: '40' },
  { value: '50' },
  { value: '60' },
];
