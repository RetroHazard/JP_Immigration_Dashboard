// src/constants/applicationOptions.ts

interface ApplicationOption {
  value: string;
  label: string;
  short: string;
}

export const applicationOptions: ApplicationOption[] = [
  { value: 'all', label: 'All Types', short: 'ALL' },
  { value: '10', label: 'Status Acquisition', short: 'ACQ' },
  { value: '20', label: 'Extension of Stay', short: 'EXT' },
  { value: '30', label: 'Change of Status', short: 'CHG' },
  { value: '40', label: 'Permission for Activities', short: 'ACT' },
  { value: '50', label: 'Re-entry', short: 'RET' },
  { value: '60', label: 'Permanent Residence', short: 'PR' },
];
