// Policy changes pinned to chart timelines. Inclusion rules:
// - Date an entry by the period whose figures it moved, usually commencement rather than
//   announcement. List enactment and commencement separately when both matter.
// - Only actual changes, not publications (a consultation opening, a restated guideline).
// - Titles and descriptions are our own wording, never the linked page's headline, so a
//   ministry rewording its page doesn't force a re-check and re-translation.
// - Every entry links the government page that establishes its date.
// Each chart filters entries to the periods it plots, so older entries can stay.
import type { DictionaryKey } from '../i18n/types';

/** Drives the marker icon only; no user-visible text of its own. */
export type PolicyEventCategory = 'legislation' | 'fees' | 'operations' | 'reporting';

export interface PolicyEvent {
  /**
   * The period the event belongs to, `YYYY-MM`, matched against the periods a
   * chart plots. Monthly for application processing; a June or December
   * half-year key for resident population, where an event is pinned to the
   * first snapshot that could reflect it.
   */
  period: string;
  category: PolicyEventCategory;
  titleKey: DictionaryKey;
  descriptionKey: DictionaryKey;
  /** Government page establishing the date. */
  href: string;
}

/**
 * Application Processing — monthly. The table's coverage begins 2020-11;
 * earlier entries are filtered out.
 */
export const POLICY_EVENTS = [
  {
    // Both the Immigration Services Agency and 特定技能 date from 2019-04-01.
    period: '2019-04',
    category: 'legislation',
    titleKey: 'policy.ssw2019.title',
    descriptionKey: 'policy.ssw2019.description',
    href: 'https://www.moj.go.jp/isa/applications/status/specifiedskilledworker.html',
  },
  {
    // Landing denial widened to most of the world through April 2020.
    period: '2020-04',
    category: 'operations',
    titleKey: 'policy.covidClosure.title',
    descriptionKey: 'policy.covidClosure.description',
    href: 'https://www.moj.go.jp/isa/hisho06_00099.html',
  },
  {
    // New entry by any foreign national suspended from 2020-12-28.
    period: '2020-12',
    category: 'operations',
    titleKey: 'policy.covidSuspension.title',
    descriptionKey: 'policy.covidSuspension.description',
    href: 'https://www.mofa.go.jp/mofaj/ca/cp/page22_003380.html',
  },
  {
    // Opened 2021-11-08, shut again from 2021-11-30 over Omicron.
    period: '2021-11',
    category: 'operations',
    titleKey: 'policy.covidOmicron.title',
    descriptionKey: 'policy.covidOmicron.description',
    href: 'https://www.mofa.go.jp/mofaj/ca/fna/page4_005130.html',
  },
  {
    // Students, workers and business travellers again from 2022-03-01.
    period: '2022-03',
    category: 'operations',
    titleKey: 'policy.covidResume.title',
    descriptionKey: 'policy.covidResume.description',
    href: 'https://www.mofa.go.jp/mofaj/ca/cp/page22_003380.html',
  },
  {
    // Visa exemptions restored and the daily cap dropped, 2022-10-11.
    period: '2022-10',
    category: 'operations',
    titleKey: 'policy.covidVisaFree.title',
    descriptionKey: 'policy.covidVisaFree.description',
    href: 'https://www.mofa.go.jp/mofaj/ca/cp/page22_003380.html',
  },
  {
    // ISA notice of 2022-10-07 on certificate validity. Shares its month with
    // the reopening above, so the marker shows a count badge.
    period: '2022-10',
    category: 'operations',
    titleKey: 'policy.covidCoe.title',
    descriptionKey: 'policy.covidCoe.description',
    href: 'https://www.moj.go.jp/isa/nyuukokukanri01_00155_1.html',
  },
  {
    // Border checks ended 2023-04-29; COVID moved to Class 5 on 2023-05-08.
    period: '2023-05',
    category: 'operations',
    titleKey: 'policy.covidEnd.title',
    descriptionKey: 'policy.covidEnd.description',
    href: 'https://www.moj.go.jp/isa/covid-19_index.html',
  },
  {
    // 令和5年改正入管法, promulgated 2023-06-16.
    period: '2023-06',
    category: 'legislation',
    titleKey: 'policy.act2023.title',
    descriptionKey: 'policy.act2023.description',
    href: 'https://www.moj.go.jp/isa/01_00457.html',
  },
  {
    period: '2024-03',
    category: 'legislation',
    titleKey: 'policy.digitalNomad.title',
    descriptionKey: 'policy.digitalNomad.description',
    href: 'https://www.moj.go.jp/isa/applications/status/designatedactivities10_00001.html',
  },
  {
    // Cabinet decision of 2024-03-29.
    period: '2024-03',
    category: 'legislation',
    titleKey: 'policy.sswExpansion.title',
    descriptionKey: 'policy.sswExpansion.description',
    href: 'https://www.moj.go.jp/isa/applications/ssw/2024.03.29.kakugikettei.html',
  },
  {
    // Main provisions of the 2023 revision in force 2024-06-10.
    period: '2024-06',
    category: 'legislation',
    titleKey: 'policy.act2023Effect.title',
    descriptionKey: 'policy.act2023Effect.description',
    href: 'https://www.moj.go.jp/isa/01_00457.html',
  },
  {
    // 令和6年入管法等改正法, promulgated 2024-06-21.
    period: '2024-06',
    category: 'legislation',
    titleKey: 'policy.act2024.title',
    descriptionKey: 'policy.act2024.description',
    href: 'https://www.moj.go.jp/isa/01_00461.html',
  },
  {
    // Effective 2025-04-01: extension 4,000 → 6,000 yen (5,500 online),
    // permanent residence 8,000 → 10,000 yen.
    period: '2025-04',
    category: 'fees',
    titleKey: 'policy.feeRevision2025.title',
    descriptionKey: 'policy.feeRevision2025.description',
    href: 'https://www.moj.go.jp/isa/01_00518.html',
  },
  {
    // Revised landing criteria in force 2025-10-16.
    period: '2025-10',
    category: 'legislation',
    titleKey: 'policy.businessManager2025.title',
    descriptionKey: 'policy.businessManager2025.description',
    href: 'https://www.moj.go.jp/isa/applications/resources/10_00237.html',
  },
  {
    // 特定在留カード in service from 2026-06-14.
    period: '2026-06',
    category: 'operations',
    titleKey: 'policy.residenceCard2026.title',
    descriptionKey: 'policy.residenceCard2026.description',
    href: 'https://www.moj.go.jp/isa/tokutei.html',
  },
  {
    // 令和8年入管法等改正法, promulgated 2026-06-05. Raises the statutory ceiling
    // on residence permit fees; the amounts themselves are set by a cabinet
    // order, so this entry claims the cap, not a figure.
    period: '2026-06',
    category: 'fees',
    titleKey: 'policy.act2026.title',
    descriptionKey: 'policy.act2026.description',
    href: 'https://www.moj.go.jp/isa/01_00643.html',
  },
] as const satisfies readonly PolicyEvent[];

/**
 * Resident Population — half-yearly, so every period is a June or December key
 * the table publishes. An event is pinned to the first snapshot that could show
 * it (the October 2022 reopening lands on 2022-12). Kept sparser than the
 * processing list: neighbouring half-years sit about a marker's width apart.
 */
export const RESIDENT_EVENTS = [
  {
    // 在留カード replaced alien registration in July 2012; this table starts at
    // the first snapshot taken under the new system.
    period: '2012-12',
    category: 'reporting',
    titleKey: 'residents.markerResidenceCard.title',
    descriptionKey: 'residents.markerResidenceCard.description',
    href: 'https://www.moj.go.jp/isa/applications/procedures/whatzairyu_00001.html',
  },
  {
    period: '2015-12',
    category: 'reporting',
    titleKey: 'residents.markerKoreaSplit.title',
    descriptionKey: 'residents.markerKoreaSplit.description',
    href: 'https://www.e-stat.go.jp/stat-search/files?toukei=00250012',
  },
  {
    period: '2019-06',
    category: 'legislation',
    titleKey: 'residents.markerSsw.title',
    descriptionKey: 'residents.markerSsw.description',
    href: 'https://www.moj.go.jp/isa/applications/status/specifiedskilledworker.html',
  },
  {
    period: '2020-06',
    category: 'operations',
    titleKey: 'residents.markerCovid.title',
    descriptionKey: 'residents.markerCovid.description',
    href: 'https://www.moj.go.jp/isa/hisho06_00099.html',
  },
  {
    // Borders reopened 2022-10-11; December is the first count to show it.
    period: '2022-12',
    category: 'operations',
    titleKey: 'residents.markerReopening.title',
    descriptionKey: 'residents.markerReopening.description',
    href: 'https://www.mofa.go.jp/mofaj/press/release/press6_001139.html',
  },
  {
    // 令和6年入管法等改正法, promulgated 2024-06-21.
    period: '2024-06',
    category: 'legislation',
    titleKey: 'residents.markerTraining.title',
    descriptionKey: 'residents.markerTraining.description',
    href: 'https://www.moj.go.jp/isa/01_00461.html',
  },
  {
    // Revised landing criteria in force 2025-10-16.
    period: '2025-12',
    category: 'legislation',
    titleKey: 'residents.markerBusinessManager.title',
    descriptionKey: 'residents.markerBusinessManager.description',
    href: 'https://www.moj.go.jp/isa/applications/resources/10_00237.html',
  },
] as const satisfies readonly PolicyEvent[];
