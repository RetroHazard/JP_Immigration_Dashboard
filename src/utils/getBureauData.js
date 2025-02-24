// src/utils/getBureauData.js
import { bureauOptions } from '../constants/bureauOptions';

export const getBureauLabel = (bureauCode) => {
  const bureau = bureauOptions.find((b) => b.value === bureauCode);
  return bureau ? bureau.label : bureauCode;
};

export const nonAirportBureaus = bureauOptions.filter((option) => {
  return option.value !== 'all' && !option.label.toLowerCase().includes('airport');
});

export const isAirportBureau = (bureauCode) => {
  return !nonAirportBureaus.some((b) => b.value === bureauCode);
};
