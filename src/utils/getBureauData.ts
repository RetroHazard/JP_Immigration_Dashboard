// src/utils/getBureauData.ts
import { bureauOptions } from '../constants/bureauOptions';

export const getBureauLabel = (bureauCode: string): string => {
  const bureau = bureauOptions.find((option) => option.value === bureauCode);
  return bureau ? bureau.label : bureauCode;
};

export const nonAirportBureaus = bureauOptions.filter((option) => option.value !== 'all' && !option.isAirport);

/** Bureau codes of the airport branch offices (Narita, Haneda, Kansai, Chubu) */
export const AIRPORT_BUREAU_CODES: ReadonlySet<string> = new Set(
  bureauOptions.filter((option) => option.isAirport).map((option) => option.value)
);
