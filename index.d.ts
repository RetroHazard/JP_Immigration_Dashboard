// Type definition entry point for tsd testing
// This file re-exports all the types we want to test

export type {
  EStatResponse,
  EStatValue,
  ClassObj,
  ResultInfo,
  TableInfo,
} from './src/types/estat';

export type { BureauOption } from './src/types/bureau';

export type { ImmigrationData } from './src/hooks/useImmigrationData';

export type { BureauCode } from './src/constants/bureauCodes';
export type { ApplicationTypeCode } from './src/constants/applicationTypes';
export type { StatusCode } from './src/constants/statusCodes';

export { BUREAU_CODES } from './src/constants/bureauCodes';
export { APPLICATION_TYPE_CODES } from './src/constants/applicationTypes';
export { STATUS_CODES } from './src/constants/statusCodes';
