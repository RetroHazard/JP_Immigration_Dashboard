// src/constants/policyEvents.ts
// The policy changes worth pinning to a chart's timeline: law revisions, new and
// retired residence statuses, fee changes, border measures, and the operational
// shifts that change how an application is filed.
//
// Three rules govern what goes in here.
//
// A date is the period whose figures the change moved, which is the
// commencement date far more often than the announcement — a fee rise shows up
// as a rush to file in the weeks before it bites, not on the day it was
// published. Where enactment and commencement are both worth seeing, they are
// two entries, not one.
//
// An entry has to be a change, not a publication. If the most you can say about
// it is that a document was issued or revised, it is news about policy rather
// than policy, and it does not belong here: a consultation that opened, a
// guideline that was restated. The test is whether the title and description can
// state what actually became different, in our own words.
//
// That wording is ours and stays ours. These strings describe the change; they
// are never a rendition of the linked page's own headline. An external title we
// paraphrased would be a title we had to re-check, and re-translate into twelve
// languages, every time the ministry reworded its page — and the catalogue is for
// this site's own data and interface, not for mirroring someone else's.
//
// Every entry carries the government page that establishes its date, because a
// marker asserting a policy date on a statistics dashboard has to be checkable.
// Nothing goes in here on the strength of a secondary summary. Border measures
// were the Foreign Ministry's to announce and residence procedure the
// Immigration Services Agency's, so both hosts appear.
//
// Entries outside the loaded window cost nothing — each chart filters them
// against the periods it actually plots — so history is kept against the day a
// table's coverage reaches further back than it does today.
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
 * earlier entries are kept and simply filtered out.
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
    // ISA notice of 2022-10-07 on certificate validity. Deliberately shares a
    // month with the reopening above: the pair is what the count badge is for.
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
 * Resident Population — half-yearly, so every period here is a June or December
 * key that the table actually publishes. An event is pinned to the first
 * snapshot that could show it: the October 2022 reopening lands on 2022-12,
 * because December is when the count next reflects people arriving.
 *
 * Kept sparser than the processing list on purpose. Twenty-seven half-years
 * across the plot leaves roughly a marker's width between neighbouring periods,
 * so a dense list here would collide where the monthly one has room.
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
