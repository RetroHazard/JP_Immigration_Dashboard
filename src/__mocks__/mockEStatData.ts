// src/__mocks__/mockEStatData.ts
// Mock e-Stat API response data for testing

export const mockEStatResponse = {
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
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
              { '@code': '101200', '@name': '横浜' },
              { '@code': '101210', '@name': '成田空港' },
              { '@code': '101220', '@name': '羽田空港' },
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
            '@cat03': '101200',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '3000',
          },
          {
            '@time': '2024000701',
            '@cat03': '101200',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '1500',
          },
          {
            '@time': '2024000701',
            '@cat03': '101200',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '1400',
          },
          // Narita Airport (branch of Shinagawa) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101210',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '500',
          },
          {
            '@time': '2024000701',
            '@cat03': '101210',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '300',
          },
          {
            '@time': '2024000701',
            '@cat03': '101210',
            '@cat02': '20',
            '@cat01': '300000',
            '$': '280',
          },
          // Haneda Airport (branch of Shinagawa) - Extension of Stay - January 2024
          {
            '@time': '2024000701',
            '@cat03': '101220',
            '@cat02': '20',
            '@cat01': '100000',
            '$': '400',
          },
          {
            '@time': '2024000701',
            '@cat03': '101220',
            '@cat02': '20',
            '@cat01': '103000',
            '$': '200',
          },
          {
            '@time': '2024000701',
            '@cat03': '101220',
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
};

// Empty data for error handling tests
export const mockEStatEmpty = {
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
      DATA_INF: {
        VALUE: [],
      },
    },
  },
};