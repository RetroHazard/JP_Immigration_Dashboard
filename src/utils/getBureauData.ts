// src/utils/getBureauData.ts
// Identity-only bureau helpers. Anything that needs a bureau's *name* goes
// through the hooks in src/i18n/useDomainLabels.ts instead — names live in the
// catalogue now, and resolving one requires the active locale.
import { bureauOptions } from '../constants/bureauOptions';

/** Bureau codes of the airport branch offices (Narita, Haneda, Kansai, Chubu) */
export const AIRPORT_BUREAU_CODES: ReadonlySet<string> = new Set(
  bureauOptions.filter((option) => option.isAirport).map((option) => option.value)
);
