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

const TYPE_CODES = applicationOptions.filter((option) => option.value !== 'all').map((option) => option.value);

/**
 * A type's hue in the charts that color by type (Category Mix, Outcomes):
 * `--chart-mix-1` to `-6` in catalogue order, ACQ to PR. Keyed on the code,
 * not on a position among the types shown, so filtering never repaints one.
 */
export const applicationTypeColor = (value: string): string => `var(--chart-mix-${TYPE_CODES.indexOf(value) + 1})`;
