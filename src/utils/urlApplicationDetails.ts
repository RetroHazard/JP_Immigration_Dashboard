// src/utils/urlApplicationDetails.ts
import { applicationOptions } from '../constants/applicationOptions';
import { nonAirportBureaus } from './getBureauData';

export interface ApplicationDetails {
  bureau: string;
  type: string;
  applicationDate: string;
}

const PERMALINK_PARAM_KEYS = ['bureau', 'type', 'applicationDate'] as const;

const isValidBureau = (value: string): boolean => nonAirportBureaus.some((bureau) => bureau.value === value);

const isValidType = (value: string): boolean =>
  value !== 'all' && applicationOptions.some((option) => option.value === value);

const isValidApplicationDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime());

// True when the URL carries at least one recognized permalink param, regardless of validity.
export const hasPermalinkParams = (searchParams: URLSearchParams): boolean =>
  PERMALINK_PARAM_KEYS.some((key) => searchParams.has(key));

// Reads permalink params from the URL, dropping any value that doesn't match a real
// bureau/type/date so an invalid or tampered link can't leave the estimator in a broken state.
export const getApplicationDetailsFromParams = (searchParams: URLSearchParams): ApplicationDetails => {
  const bureau = searchParams.get('bureau') ?? '';
  const type = searchParams.get('type') ?? '';
  const applicationDate = searchParams.get('applicationDate') ?? '';

  return {
    bureau: isValidBureau(bureau) ? bureau : '',
    type: isValidType(type) ? type : '',
    applicationDate: isValidApplicationDate(applicationDate) ? applicationDate : '',
  };
};
