// src/constants/applicationOptions.ts

export interface ApplicationOption {
  /** e-Stat application type code — the stable identifier. */
  value: string;
  label: string;
  /** Abbreviation for the stat-tile subtitle, e.g. "EXT". */
  short: string;
  /**
   * One-word form for cramped chart labels. The narrow Sankey used to derive
   * this from a map keyed by the English `label`, which stops resolving the
   * moment labels are translated.
   */
  compact: string;
}

export const applicationOptions: ApplicationOption[] = [
  { value: 'all', label: 'All Types', short: 'ALL', compact: 'All' },
  { value: '10', label: 'Status Acquisition', short: 'ACQ', compact: 'Acquisition' },
  { value: '20', label: 'Extension of Stay', short: 'EXT', compact: 'Extension' },
  { value: '30', label: 'Change of Status', short: 'CHG', compact: 'Change' },
  { value: '40', label: 'Permission for Activities', short: 'ACT', compact: 'Permission' },
  { value: '50', label: 'Re-entry', short: 'RET', compact: 'Re-entry' },
  { value: '60', label: 'Permanent Residence', short: 'PR', compact: 'Permanent' },
];
