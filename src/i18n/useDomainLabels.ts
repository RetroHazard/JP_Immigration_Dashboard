// src/i18n/useDomainLabels.ts
// Joins the identity-only domain constants to their catalogue text.
//
// The constants deliberately carry no display strings: `t()` is bound to the
// provider, so a module-level array can't call it, and keeping a second copy
// of the names next to the codes is how the app ended up with three divergent
// spellings of the application types. These hooks are the one place the two
// halves meet.
'use client';

import { useMemo } from 'react';

import type { ChartDefinition } from '../components/common/ChartComponents';
import { CHART_COMPONENTS } from '../components/common/ChartComponents';
import type { ApplicationOption } from '../constants/applicationOptions';
import { applicationOptions } from '../constants/applicationOptions';
import type { BureauOption } from '../constants/bureauOptions';
import { bureauOptions } from '../constants/bureauOptions';
import type { Prefecture } from '../constants/japanPrefectures';
import { japanPrefectures } from '../constants/japanPrefectures';
import { AIRPORT_BUREAU_CODES } from '../utils/getBureauData';
import { useLocale } from './LocaleContext';
import type { DictionaryKey } from './types';

export interface LabeledBureau extends BureauOption {
  label: string;
  short: string;
}

export interface LabeledApplicationType extends ApplicationOption {
  label: string;
  short: string;
  compact: string;
}

export interface LabeledPrefecture extends Prefecture {
  name: string;
}

export interface LabeledChart extends ChartDefinition {
  /** Canonical display name, used by the tab AND the card header. */
  label: string;
  /** One sentence: what question this chart answers. */
  description: string;
}

/** The chart registry with its tab labels and card subtitles resolved. */
export const useChartRegistry = (): LabeledChart[] => {
  const { t } = useLocale();
  return useMemo(
    () =>
      CHART_COMPONENTS.map((chart) => ({
        ...chart,
        label: t(`charts.${chart.key}.label` as DictionaryKey),
        description: t(`charts.${chart.key}.description` as DictionaryKey),
      })),
    [t]
  );
};

/** Every bureau, including the `all` nationwide aggregate, with its names. */
export const useBureauOptions = (): LabeledBureau[] => {
  const { t } = useLocale();
  return useMemo(
    () =>
      bureauOptions.map((option) => ({
        ...option,
        label: t(`bureau.${option.value}` as DictionaryKey),
        short: t(`bureau.${option.value}.short` as DictionaryKey),
      })),
    [t]
  );
};

/** Selectable bureaus for the estimator: no aggregate, no airport offices. */
export const useNonAirportBureaus = (): LabeledBureau[] => {
  const bureaus = useBureauOptions();
  return useMemo(
    () => bureaus.filter((option) => option.value !== 'all' && !AIRPORT_BUREAU_CODES.has(option.value)),
    [bureaus]
  );
};

/** `(code) => name`, falling back to the code so an unknown bureau is visible. */
export const useBureauLabel = (): ((code: string) => string) => {
  const bureaus = useBureauOptions();
  return useMemo(() => {
    const byCode = new Map(bureaus.map((option) => [option.value, option.label]));
    return (code: string) => byCode.get(code) ?? code;
  }, [bureaus]);
};

export const useApplicationOptions = (): LabeledApplicationType[] => {
  const { t } = useLocale();
  return useMemo(
    () =>
      applicationOptions.map((option) => ({
        ...option,
        label: t(`appType.${option.value}` as DictionaryKey),
        short: t(`appType.${option.value}.short` as DictionaryKey),
        compact: t(`appType.${option.value}.compact` as DictionaryKey),
      })),
    [t]
  );
};

/** `(code) => type`, for the many places that hold only a filter value. */
export const useApplicationType = (): ((code: string) => LabeledApplicationType | undefined) => {
  const types = useApplicationOptions();
  return useMemo(() => {
    const byCode = new Map(types.map((type) => [type.value, type]));
    return (code: string) => byCode.get(code);
  }, [types]);
};

export const usePrefectures = (): LabeledPrefecture[] => {
  const { t } = useLocale();
  return useMemo(
    () =>
      japanPrefectures.map((prefecture) => ({
        ...prefecture,
        name: t(`prefecture.${prefecture.id}` as DictionaryKey),
      })),
    [t]
  );
};

/** `(id) => prefecture`, keyed by JIS code — what the map joins the TopoJSON on. */
export const usePrefectureById = (): ((id: number) => LabeledPrefecture | undefined) => {
  const prefectures = usePrefectures();
  return useMemo(() => {
    const byId = new Map(prefectures.map((prefecture) => [prefecture.id, prefecture]));
    return (id: number) => byId.get(id);
  }, [prefectures]);
};
