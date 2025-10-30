// src/types/bureau.ts

/**
 * Bureau option type for immigration bureaus
 */
export interface BureauOption {
  /** Bureau code or 'all' for nationwide */
  value: string;
  /** Full name of the bureau */
  label: string;
  /** Short abbreviation for the bureau */
  short: string;
  /** GPS coordinates [longitude, latitude] for map display */
  coordinates?: [number, number];
  /** Border color for bureau visualization */
  border?: string;
  /** Background color for bureau visualization */
  background?: string;
  /** Array of child bureau codes (for regional bureaus with branches) */
  children?: string[];
}
