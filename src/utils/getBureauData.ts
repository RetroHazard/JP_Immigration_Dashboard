// src/utils/getBureauData.ts
import { bureauOptions } from '../constants/bureauOptions';

interface BureauOption {
  value: string;
  label: string;
}

export const getBureauLabel = (bureauCode: string): string => {
  const bureau = bureauOptions.find((b: BureauOption) => b.value === bureauCode);
  return bureau ? bureau.label : bureauCode;
};

export const isAirportLabel = (label: string): boolean => label.toLowerCase().includes('airport');

export const nonAirportBureaus = bureauOptions.filter((option: BureauOption) => {
  return option.value !== 'all' && !isAirportLabel(option.label);
});

/** Bureau codes of the airport branch offices (Narita, Haneda, Kansai, Chubu) */
export const AIRPORT_BUREAU_CODES: ReadonlySet<string> = new Set(
  bureauOptions.filter((option) => isAirportLabel(option.label)).map((option) => option.value)
);
