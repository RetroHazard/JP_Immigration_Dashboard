// src/utils/getBureauData.ts
import { bureauOptions } from '../constants/bureauOptions';
import type { BureauOption } from '../types/bureau';

// O(1) lookup maps for bureau data
const bureauLabelMap = new Map(bureauOptions.map((b) => [b.value, b.label]));

const bureauShortMap = new Map(bureauOptions.map((b) => [b.value, b.short]));

export const getBureauLabel = (bureauCode: string): string => bureauLabelMap.get(bureauCode) ?? bureauCode;

export const getBureauShort = (bureauCode: string): string => bureauShortMap.get(bureauCode) ?? bureauCode;

export const nonAirportBureaus = bureauOptions.filter((option: BureauOption) => {
  return option.value !== 'all' && !option.label.toLowerCase().includes('airport');
});
