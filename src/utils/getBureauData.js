import { bureauOptions } from '../constants/bureauOptions';

export const getBureauLabel = (bureauCode) => {
  const bureau = bureauOptions.find((b) => b.value === bureauCode);
  return bureau ? bureau.label : bureauCode;
};
