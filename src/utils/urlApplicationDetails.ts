// src/utils/urlApplicationDetails.ts
import { applicationOptions } from '../constants/applicationOptions';
import { nonAirportBureaus } from './getBureauData';

export interface ApplicationDetails {
  bureau: string;
  type: string;
  applicationDate: string;
}

// The estimator permalink writes namespaced params so a shared estimate never
// collides with the dashboard-wide ?bureau=/?type= chart filter params.
export const ESTIMATOR_PARAM_NAMES: Record<keyof ApplicationDetails, string> = {
  bureau: 'estBureau',
  type: 'estType',
  applicationDate: 'estDate',
};

// Pre-rename permalinks reused the filter param names directly. Keep reading
// them - keyed off ?applicationDate=, which only old estimator links carry -
// so links shared before the rename still restore the estimate.
const LEGACY_DATE_PARAM = 'applicationDate';

const isValidBureau = (value: string): boolean => nonAirportBureaus.some((bureau) => bureau.value === value);

const isValidType = (value: string): boolean =>
  value !== 'all' && applicationOptions.some((option) => option.value === value);

const isValidApplicationDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime());

// Only a link that pins an application date is an ESTIMATOR permalink; the
// chart filter params shouldn't pop the estimator sheet open on mobile.
export const isEstimatorPermalink = (searchParams: URLSearchParams): boolean =>
  searchParams.has(ESTIMATOR_PARAM_NAMES.applicationDate) || searchParams.has(LEGACY_DATE_PARAM);

// Reads permalink params from the URL, dropping any value that doesn't match a real
// bureau/type/date so an invalid or tampered link can't leave the estimator in a broken state.
export const getApplicationDetailsFromParams = (searchParams: URLSearchParams): ApplicationDetails => {
  const isLegacy = !searchParams.has(ESTIMATOR_PARAM_NAMES.applicationDate) && searchParams.has(LEGACY_DATE_PARAM);
  const read = (key: keyof ApplicationDetails): string =>
    searchParams.get(ESTIMATOR_PARAM_NAMES[key]) ?? (isLegacy ? searchParams.get(key) : null) ?? '';

  const bureau = read('bureau');
  const type = read('type');
  const applicationDate = read('applicationDate');

  return {
    bureau: isValidBureau(bureau) ? bureau : '',
    type: isValidType(type) ? type : '',
    applicationDate: isValidApplicationDate(applicationDate) ? applicationDate : '',
  };
};
