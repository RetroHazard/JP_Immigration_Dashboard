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

export const nonAirportBureaus = bureauOptions.filter((option: BureauOption) => {
  return option.value !== 'all' && !option.label.toLowerCase().includes('airport');
});

export const isAirportBureau = (bureauCode: string): boolean => {
  return !nonAirportBureaus.some((b: BureauOption) => b.value === bureauCode);
};