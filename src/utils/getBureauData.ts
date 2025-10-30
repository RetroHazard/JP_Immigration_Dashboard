// src/utils/getBureauData.ts
import { bureauOptions } from '../constants/bureauOptions';
import type { BureauOption } from '../types/bureau';

export const getBureauLabel = (bureauCode: string): string => {
  const bureau = bureauOptions.find((b: BureauOption) => b.value === bureauCode);
  return bureau ? bureau.label : bureauCode;
};

export const nonAirportBureaus = bureauOptions.filter((option: BureauOption) => {
  return option.value !== 'all' && !option.label.toLowerCase().includes('airport');
});
