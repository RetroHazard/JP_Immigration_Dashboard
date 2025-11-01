// src/types/estat.ts
// Comprehensive TypeScript types for the e-Stat API response structure

/**
 * Represents a single value entry from the e-Stat API DATA_INF.VALUE array.
 * Contains dimension attributes (prefixed with @) and the numeric value ($).
 */
export interface EStatValue {
  /** Tab classification code */
  '@tab'?: string;
  /** Category 01 - Application status code (e.g., "100000" for total received) */
  '@cat01': string;
  /** Category 02 - Application type code (e.g., "20" for Extension of Stay) */
  '@cat02': string;
  /** Category 03 - Bureau code (e.g., "101170" for Tokyo) */
  '@cat03': string;
  /** Time code in format YYYYMMMM (e.g., "2025000707" for July 2025) */
  '@time': string;
  /** Unit of measurement (usually "人" for people) */
  '@unit'?: string;
  /** The numeric value as a string */
  '$'?: string;
  /** Allow additional @ prefixed attributes for extensibility */
  [key: `@${string}`]: string | undefined;
}

/**
 * Represents a classification entry in the CLASS array
 */
export interface ClassEntry {
  /** The classification code */
  '@code': string;
  /** The human-readable name */
  '@name': string;
  /** Hierarchy level (optional) */
  '@level'?: string;
  /** Parent code for hierarchical data (optional) */
  '@parentCode'?: string;
  /** Unit of measurement (optional) */
  '@unit'?: string;
}

/**
 * Represents a classification object containing classes for a dimension
 */
export interface ClassObj {
  /** Dimension identifier (e.g., "cat01", "cat02", "cat03", "time") */
  '@id': string;
  /** Dimension name */
  '@name': string;
  /** Classification entries - can be single or array */
  CLASS: ClassEntry | ClassEntry[];
}

/**
 * API result information
 */
export interface ResultInfo {
  /** Status code (0 = success) */
  STATUS: number;
  /** Error message (Japanese) */
  ERROR_MSG: string;
  /** Response timestamp */
  DATE: string;
}

/**
 * API parameters used in the request
 */
export interface ApiParameters {
  /** Language code */
  LANG: string;
  /** Statistical data ID */
  STATS_DATA_ID: string;
  /** Data format */
  DATA_FORMAT: string;
  /** Start position for pagination */
  START_POSITION: number;
  /** Metadata flag */
  METAGET_FLG: string;
  /** Replace special characters flag */
  REPLACE_SP_CHARS: number;
  /** Section header flag */
  SECTION_HEADER_FLG: number;
}

/**
 * Result information for the statistical data
 */
export interface StatResultInfo {
  /** Total number of records */
  TOTAL_NUMBER: number;
  /** Starting record number */
  FROM_NUMBER: number;
  /** Ending record number */
  TO_NUMBER: number;
}

/**
 * Statistical table metadata
 */
export interface TableInfo {
  /** Table ID */
  '@id': string;
  /** Statistics name with code */
  STAT_NAME: {
    '@code': string;
    $: string;
  };
  /** Government organization */
  GOV_ORG: {
    '@code': string;
    $: string;
  };
  /** Full statistics name */
  STATISTICS_NAME: string;
  /** Table title */
  TITLE: {
    '@no': string;
    $: string;
  };
  /** Data collection cycle */
  CYCLE: string;
  /** Survey date (YYYYMM) */
  SURVEY_DATE: number;
  /** Publication date */
  OPEN_DATE: string;
  /** Small area flag */
  SMALL_AREA: number;
  /** Collection area description */
  COLLECT_AREA: string;
  /** Main category */
  MAIN_CATEGORY: {
    '@code': string;
    $: string;
  };
  /** Sub category */
  SUB_CATEGORY: {
    '@code': string;
    $: string;
  };
  /** Total number of records */
  OVERALL_TOTAL_NUMBER: number;
  /** Last update date */
  UPDATED_DATE: string;
  /** Statistics name specification */
  STATISTICS_NAME_SPEC: {
    TABULATION_CATEGORY: string;
    TABULATION_SUB_CATEGORY1: string;
  };
  /** Description */
  DESCRIPTION: string;
  /** Title specification */
  TITLE_SPEC: {
    TABLE_CATEGORY: string;
    TABLE_NAME: string;
  };
}

/**
 * Data notes explaining special characters
 */
export interface DataNote {
  /** Special character */
  '@char': string;
  /** Explanation */
  $: string;
}

/**
 * Complete e-Stat API response structure for statistical data
 */
export interface EStatResponse {
  GET_STATS_DATA: {
    /** API result information */
    RESULT: ResultInfo;
    /** Request parameters */
    PARAMETER: ApiParameters;
    /** The actual statistical data */
    STATISTICAL_DATA: {
      /** Result information */
      RESULT_INF: StatResultInfo;
      /** Table metadata */
      TABLE_INF: TableInfo;
      /** Classification information for dimensions */
      CLASS_INF: {
        /** Classification objects - can be single or array */
        CLASS_OBJ: ClassObj | ClassObj[];
      };
      /** The actual data values */
      DATA_INF: {
        /** Notes explaining special characters */
        NOTE?: DataNote | DataNote[];
        /** Data values - can be single or array */
        VALUE: EStatValue | EStatValue[];
      };
    };
  };
}
