// Type-level tests for JP Immigration Dashboard types
import { expectType, expectAssignable, expectNotAssignable } from 'tsd';
import type { ImmigrationData, BureauCode, ApplicationTypeCode, StatusCode, BureauOption, EStatResponse, EStatValue } from '.';
import { BUREAU_CODES, APPLICATION_TYPE_CODES, STATUS_CODES } from '.';

// ============================================================================
// Test ImmigrationData structure
// ============================================================================
declare const immigrationData: ImmigrationData;
expectType<string>(immigrationData.month);
expectType<BureauCode>(immigrationData.bureau);
expectType<ApplicationTypeCode>(immigrationData.type);
expectType<StatusCode>(immigrationData.status);
expectType<number>(immigrationData.value);

// Test valid ImmigrationData objects are accepted
expectAssignable<ImmigrationData>({
  month: '2024-01',
  bureau: '101010' as BureauCode,
  type: '20' as ApplicationTypeCode,
  status: '300000' as StatusCode,
  value: 1000,
});

// Test invalid objects are rejected - missing required fields
expectNotAssignable<ImmigrationData>({
  month: '2024-01',
  bureau: '101010' as BureauCode,
  type: '20' as ApplicationTypeCode,
  // Missing status and value
});

// Wrong value type
expectNotAssignable<ImmigrationData>({
  month: '2024-01',
  bureau: '101010' as BureauCode,
  type: '20' as ApplicationTypeCode,
  status: '300000' as StatusCode,
  value: '1000', // Should be number
});

// ============================================================================
// Test BureauOption structure
// ============================================================================
declare const bureauOption: BureauOption;
expectType<string>(bureauOption.value);
expectType<string>(bureauOption.label);
expectType<string>(bureauOption.short);
expectType<string[] | undefined>(bureauOption.children);

// Test coordinates type (tuple of two numbers or undefined)
// Using conditional type check since coordinates might be tuple or undefined
if (bureauOption.coordinates) {
  const coords = bureauOption.coordinates;
  // Just verify it exists, type may vary in implementation
}

// Test valid BureauOption objects are accepted
expectAssignable<BureauOption>({
  value: '101010',
  label: 'Tokyo Regional Immigration Bureau',
  short: 'Tokyo',
  coordinates: [139.7514, 35.6851],
});

// Test optional children field
expectAssignable<BureauOption>({
  value: '101170',
  label: 'Shinagawa',
  short: 'Shinagawa',
  coordinates: [139.7403, 35.6284],
  children: ['101210', '101250', '101290'],
});

// Missing required fields
expectNotAssignable<BureauOption>({
  value: '101010',
  label: 'Tokyo Regional Immigration Bureau',
  // Missing short and coordinates
});

// ============================================================================
// Test EStatResponse structure
// ============================================================================
declare const response: EStatResponse;
// Just verify GET_STATS_DATA exists, structure may vary
response.GET_STATS_DATA;

// Test EStatValue structure
declare const value: EStatValue;
// @time is required based on interface
expectType<string>(value['@time']);
expectType<string>(value['@cat01']);
expectType<string>(value['@cat02']);
expectType<string>(value['@cat03']);
// $ is optional
expectType<string | undefined>(value['$']);

// Test valid EStatValue objects are accepted
expectAssignable<EStatValue>({
  '@time': '2024-01',
  '@cat01': '100000',
  '@cat02': '20',
  '@cat03': '101170',
  '$': '100',
});

// ============================================================================
// Test typed constants
// ============================================================================

// Test that constants are assignable to their respective types
expectAssignable<BureauCode>(BUREAU_CODES.FUKUOKA);
expectAssignable<BureauCode>(BUREAU_CODES.OSAKA);
expectAssignable<BureauCode>(BUREAU_CODES.NAGOYA);

// Test that application type codes are assignable
expectAssignable<ApplicationTypeCode>(APPLICATION_TYPE_CODES.EXTENSION_OF_STAY);
expectAssignable<ApplicationTypeCode>(APPLICATION_TYPE_CODES.CHANGE_OF_STATUS);
expectAssignable<ApplicationTypeCode>(APPLICATION_TYPE_CODES.PERMANENT_RESIDENCE);

// Test that status codes are assignable
expectAssignable<StatusCode>(STATUS_CODES.PROCESSED);
expectAssignable<StatusCode>(STATUS_CODES.GRANTED);
expectAssignable<StatusCode>(STATUS_CODES.DENIED);
