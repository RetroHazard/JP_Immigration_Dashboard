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

import type { ChartDefinition, Dataset } from '../components/common/ChartComponents';
import { CHARTS_BY_DATASET } from '../components/common/ChartComponents';
import type { ApplicationOption } from '../constants/applicationOptions';
import { applicationOptions } from '../constants/applicationOptions';
import type { BureauOption } from '../constants/bureauOptions';
import { bureauOptions } from '../constants/bureauOptions';
import type { Prefecture } from '../constants/japanPrefectures';
import { japanPrefectures } from '../constants/japanPrefectures';
import type { Nationality } from '../constants/nationalities';
import { nationalities, NATIONALITY_REGIONS, REGION_M49 } from '../constants/nationalities';
import type { ResidenceStatus, StatusGroup } from '../constants/residenceStatuses';
import { residenceStatuses, STATUS_GROUPS } from '../constants/residenceStatuses';
import { AIRPORT_BUREAU_CODES } from '../utils/getBureauData';
import { useLocale } from './LocaleContext';
import { LOCALES } from './locales';
import type { DictionaryKey } from './types';

export interface LabeledBureau extends BureauOption {
  label: string;
  short: string;
  /** The form the width-constrained surfaces use — see `bureau.*.compact`. */
  compact: string;
}

export interface LabeledApplicationType extends ApplicationOption {
  label: string;
  short: string;
  compact: string;
}

export interface LabeledPrefecture extends Prefecture {
  name: string;
}

export interface LabeledNationality extends Nationality {
  name: string;
}

export interface LabeledResidenceStatus extends ResidenceStatus {
  label: string;
}

/**
 * An intersection rather than an `extends`: ChartDefinition is a union
 * discriminated on `dataset`, and extending it would collapse the two members
 * into one shape the shell could no longer narrow.
 */
export type LabeledChart = ChartDefinition & {
  /** Canonical display name, used by the tab AND the card header. */
  label: string;
  /** One sentence: what question this chart answers. */
  description: string;
};

/** One dataset's charts, with tab labels and card subtitles resolved. */
export const useChartRegistry = (dataset: Dataset = 'processing'): LabeledChart[] => {
  const { t } = useLocale();
  return useMemo(
    () =>
      CHARTS_BY_DATASET[dataset].map((chart) => ({
        ...chart,
        label: t(`charts.${chart.key}.label` as DictionaryKey),
        description: t(`charts.${chart.key}.description` as DictionaryKey),
      })),
    [dataset, t]
  );
};

/** `(dataset) => name` for the dataset switcher. */
export const useDatasetLabel = (): ((dataset: Dataset, compact?: boolean) => string) => {
  const { t } = useLocale();
  return useMemo(
    () => (dataset: Dataset, compact = false) =>
      t(`dataset.${dataset}${compact ? '.compact' : ''}` as DictionaryKey),
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
        compact: t(`bureau.${option.value}.compact` as DictionaryKey),
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

/**
 * `(code) => short name`, for the surfaces that measure in pixels rather than
 * words: the efficiency chart's label column, the ring-chart legend, and the
 * treemap's on-tile label. Same fallback as `useBureauLabel`.
 */
export const useBureauCompact = (): ((code: string) => string) => {
  const bureaus = useBureauOptions();
  return useMemo(() => {
    const byCode = new Map(bureaus.map((option) => [option.value, option.compact]));
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


// ── Foreign Residents dataset ──────────────────────────────────────────────
// Country and continent names come from ICU rather than the catalogue. There
// are 202 of them across twelve locales, and every one is a name the platform
// already knows how to render — hand-maintaining 2,400 strings would be worse
// translations, not better ones. Only the rows with no ISO/M49 identity
// (朝鮮, 韓国・朝鮮, the dissolved states, 無国籍) carry a catalogue key.

/**
 * A locale-bound `Intl.DisplayNames`, or null when the runtime cannot build
 * one. Callers fall back to the catalogue, so an old engine degrades to the
 * handful of hand-written names rather than throwing on first render.
 */
const useRegionDisplayNames = (): Intl.DisplayNames | null => {
  const { locale } = useLocale();
  return useMemo(() => {
    try {
      return new Intl.DisplayNames([LOCALES[locale].intlTag], { type: 'region' });
    } catch {
      return null;
    }
  }, [locale]);
};

/**
 * `(code) => name` for e-Stat's cat02 dimension.
 *
 * `DisplayNames.of` returns its input unchanged when ICU has no name for the
 * code, so that case is treated the same as having no code at all — otherwise
 * an unmapped country would render as a bare "XK".
 */
export const useNationalityLabel = (): ((code: string) => string) => {
  const { t } = useLocale();
  const display = useRegionDisplayNames();
  return useMemo(() => {
    const byCode = new Map(nationalities.map((nationality) => [nationality.value, nationality]));
    return (code: string) => {
      const nationality = byCode.get(code);
      const iso2 = nationality?.iso2;
      if (iso2 && display) {
        const name = display.of(iso2);
        if (name && name !== iso2) return name;
      }
      return t(`nationality.${code}` as DictionaryKey);
    };
  }, [display, t]);
};

/** Every nationality with its localized name, sorted for a select list. */
export const useNationalityOptions = (): LabeledNationality[] => {
  const { locale } = useLocale();
  const label = useNationalityLabel();
  return useMemo(() => {
    const collator = new Intl.Collator(LOCALES[locale].intlTag);
    return nationalities
      // The nested 「うち」 rows are pruned from the shipped data, so offering
      // them as filters would produce views that are always empty.
      .filter((nationality) => !nationality.isSubset)
      .map((nationality) => ({ ...nationality, name: label(nationality.value) }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [label, locale]);
};

/**
 * `(code) => continent name`. The six continent rollups map to UN M49 codes,
 * which ICU localizes exactly like country codes; 無国籍 has no M49 equivalent
 * and comes from the catalogue.
 */
export const useRegionLabel = (): ((code: string) => string) => {
  const { t } = useLocale();
  const display = useRegionDisplayNames();
  return useMemo(
    () => (code: string) => {
      const m49 = REGION_M49[code];
      if (m49 && display) {
        const name = display.of(m49);
        if (name && name !== m49) return name;
      }
      return t(`region.${code}` as DictionaryKey);
    },
    [display, t]
  );
};

export const useRegionOptions = (): { value: string; label: string }[] => {
  const label = useRegionLabel();
  return useMemo(
    () => NATIONALITY_REGIONS.map((code) => ({ value: code, label: label(code) })),
    [label]
  );
};

export const useResidenceStatusOptions = (): LabeledResidenceStatus[] => {
  const { t } = useLocale();
  return useMemo(
    () =>
      residenceStatuses.map((status) => ({
        ...status,
        label: t(`status.${status.value}` as DictionaryKey),
      })),
    [t]
  );
};

/** `(code) => name`, falling back to the code so an unknown status is visible. */
export const useResidenceStatusLabel = (): ((code: string) => string) => {
  const statuses = useResidenceStatusOptions();
  return useMemo(() => {
    const byCode = new Map(statuses.map((status) => [status.value, status.label]));
    return (code: string) => byCode.get(code) ?? code;
  }, [statuses]);
};

/** `(group) => name` for the middle ring of the status-mix hierarchy. */
export const useStatusGroupLabel = (): ((group: StatusGroup) => string) => {
  const { t } = useLocale();
  return useMemo(() => (group: StatusGroup) => t(`statusGroup.${group}` as DictionaryKey), [t]);
};

export const useStatusGroupOptions = (): { value: StatusGroup; label: string }[] => {
  const label = useStatusGroupLabel();
  return useMemo(() => STATUS_GROUPS.map((group) => ({ value: group, label: label(group) })), [label]);
};
