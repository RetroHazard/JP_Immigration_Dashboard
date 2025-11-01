// src/__mocks__/mockEStatData.ts
// Mock e-Stat API response data for testing

import type { EStatResponse } from '../types/estat';

export const mockEStatResponse: EStatResponse = {
  GET_STATS_DATA: {
    RESULT: {
      STATUS: 0,
      ERROR_MSG: '',
      DATE: '2024-01-01T00:00:00Z',
    },
    PARAMETER: {
      LANG: 'J',
      STATS_DATA_ID: '0003411576',
      DATA_FORMAT: 'J',
      START_POSITION: 1,
      METAGET_FLG: 'N',
      REPLACE_SP_CHARS: 0,
      SECTION_HEADER_FLG: 1,
    },
    STATISTICAL_DATA: {
      RESULT_INF: {
        TOTAL_NUMBER: 100,
        FROM_NUMBER: 1,
        TO_NUMBER: 100,
      },
      TABLE_INF: {
        '@id': '0003411576',
        STAT_NAME: {
          '@code': '00350030',
          $: '出入国管理統計',
        },
        GOV_ORG: {
          '@code': '00350',
          $: '出入国在留管理庁',
        },
        STATISTICS_NAME: '在留外国人統計',
        TITLE: {
          '@no': '1',
          $: '在留審査処理数',
        },
        CYCLE: '月次',
        SURVEY_DATE: 202401,
        OPEN_DATE: '2024-02-01',
        SMALL_AREA: 0,
        COLLECT_AREA: '全国',
        MAIN_CATEGORY: {
          '@code': '02',
          $: '人口・世帯',
        },
        SUB_CATEGORY: {
          '@code': '02',
          $: '人口',
        },
        OVERALL_TOTAL_NUMBER: 1000,
        UPDATED_DATE: '2024-02-01',
        STATISTICS_NAME_SPEC: {
          TABULATION_CATEGORY: '在留審査処理数',
          TABULATION_SUB_CATEGORY1: '月次',
        },
        DESCRIPTION: 'Test data',
        TITLE_SPEC: {
          TABLE_CATEGORY: '在留審査処理数',
          TABLE_NAME: '月次',
        },
      },
      CLASS_INF: {
        CLASS_OBJ: [
          {
            '@id': 'tab',
            '@name': '表章項目',
            CLASS: {
              '@code': '01',
              '@name': '在留審査処理数',
            },
          },
          {
            '@id': 'cat01',
            '@name': '処理状況',
            CLASS: [
              { '@code': '100000', '@name': '前月末現在在留数' },
              { '@code': '103000', '@name': '新規受付' },
              { '@code': '300000', '@name': '処理数' },
            ],
          },
          {
            '@id': 'cat02',
            '@name': '申請種別',
            CLASS: [
              { '@code': '20', '@name': '在留期間更新許可' },
              { '@code': '30', '@name': '在留資格変更許可' },
              { '@code': '60', '@name': '永住許可' },
            ],
          },
          {
            '@id': 'cat03',
            '@name': '地方出入国在留管理局',
            CLASS: [
              { '@code': '101170', '@name': '東京 管内' },
              { '@code': '101210', '@name': '横浜' },
              { '@code': '101190', '@name': '成田空港' },
              { '@code': '101200', '@name': '羽田空港' },
              { '@code': '101460', '@name': '大阪 管内' },
              { '@code': '101480', '@name': '関西空港' },
              { '@code': '101490', '@name': '神戸' },
            ],
          },
        ],
      },
      DATA_INF: {
        VALUE: [
          // Shinagawa (Tokyo regional) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101170', // Shinagawa (aggregate bureau)
            '@cat02': '20', // Extension of Stay
            '@cat01': '100000', // Carried over
            '$': '15000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101170',
            '@cat02': '20',
            '@cat01': '103000', // New applications
            '$': '8000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101170',
            '@cat02': '20',
            '@cat01': '300000', // Processed
            '$': '7500',
          },
          // Yokohama (branch of Shinagawa) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101210',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '3000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101210',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '1500',
          },
          {
            '@time': '2024000701',
            '@cat03': '101210',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '1400',
          },
          // Narita Airport (branch of Shinagawa) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101190',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '500',
          },
          {
            '@time': '2024000701',
            '@cat03': '101190',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '300',
          },
          {
            '@time': '2024000701',
            '@cat03': '101190',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '280',
          },
          // Haneda Airport (branch of Shinagawa) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101200',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '400',
          },
          {
            '@time': '2024000701',
            '@cat03': '101200',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '200',
          },
          {
            '@time': '2024000701',
            '@cat03': '101200',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '190',
          },
          // Osaka (regional aggregate) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101460',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '8000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101460',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '4000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101460',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '3800',
          },
          // Kansai Airport (branch of Osaka) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101480',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '600',
          },
          {
            '@time': '2024000701',
            '@cat03': '101480',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '350',
          },
          {
            '@time': '2024000701',
            '@cat03': '101480',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '330',
          },
          // Kobe (branch of Osaka) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101490',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '1200',
          },
          {
            '@time': '2024000701',
            '@cat03': '101490',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '600',
          },
          {
            '@time': '2024000701',
            '@cat03': '101490',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '570',
          },
          // February 2024 data - Shinagawa
          {
            '@time': '2024000802',
            '@cat03': '101170',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '15500',
          },
          {
            '@time': '2024000802',
            '@cat03': '101170',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '8200',
          },
          {
            '@time': '2024000802',
            '@cat03': '101170',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '7700',
          },
          // Change of Status - Shinagawa - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101170',
            '@cat02': '30', // Change of Status
            '@cat01': '100000',
            '$': '5000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101170',
            '@cat02': '30',
            '@cat01': '103000',
            '$': '2500',
          },
          {
            '@time': '2024000701',
            '@cat03': '101170',
            '@cat02': '30',
            '@cat01': '300000',
            '$': '2300',
          },
          // Permanent Residence - Shinagawa - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101170',
            '@cat02': '60', // Permanent Residence
            '@cat01': '100000',
            '$': '12000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101170',
            '@cat02': '60',
            '@cat01': '103000',
            '$': '3000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101170',
            '@cat02': '60',
            '@cat01': '300000',
            '$': '2800',
          },
        ],
      },
    },
  },
};

// Minimal mock data for edge case testing
export const mockEStatMinimal = {
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
      DATA_INF: {
        VALUE: {
          '@time': '2024000701',
          '@cat03': '101170',
          '@cat02': '20',
          '@cat01': '103000',
          '$': '1000',
        },
      },
    },
  },
} as unknown as EStatResponse;

// Empty data for error handling tests
export const mockEStatEmpty = {
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
      DATA_INF: {
        VALUE: [],
      },
    },
  },
} as unknown as EStatResponse;