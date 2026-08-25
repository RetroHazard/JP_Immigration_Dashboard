// src/constants/policyEvents.ts
// The policy changes worth pinning to the Intake & Processing timeline: law
// revisions, new and retired residence statuses, fee changes, and the
// operational shifts that change how an application is filed.
//
// Two rules govern what goes in here.
//
// A date is the month whose *intake* the change moved, which is the
// commencement date far more often than the announcement — a fee rise shows up
// as a rush to file in the weeks before it bites, not on the day it was
// published. Where enactment and commencement are both worth seeing, they are
// two entries, not one.
//
// Every entry carries the Immigration Services Agency page that establishes its
// date, because a marker asserting a policy date on a statistics dashboard has
// to be checkable. Nothing goes in here on the strength of a secondary summary.
//
// Entries outside the loaded window cost nothing — the chart filters them
// against the months actually plotted — so history is kept as e-Stat's rolling
// window moves past it.
import type { DictionaryKey } from '../i18n/types';

/** Drives the marker icon only; no user-visible text of its own. */
export type PolicyEventCategory =
  | 'legislation'
  | 'fees'
  | 'operations'
  /** Reserved for e-Stat reporting changes that shift the series without a
   *  real-world change — the processing table has no evidenced instance yet,
   *  unlike the residents table's 2015 Korea split. */
  | 'reporting';

export interface PolicyEvent {
  /** Month the event belongs to, `YYYY-MM`, matched against plotted months. */
  period: string;
  category: PolicyEventCategory;
  titleKey: DictionaryKey;
  descriptionKey: DictionaryKey;
  /** Immigration Services Agency page establishing the date. */
  href: string;
}

export const POLICY_EVENTS = [
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
    // Guidelines revised 2026-02-24.
    period: '2026-02',
    category: 'operations',
    titleKey: 'policy.prGuidelines2026.title',
    descriptionKey: 'policy.prGuidelines2026.description',
    href: 'https://www.moj.go.jp/isa/applications/resources/nyukan_nyukan50.html',
  },
  {
    // 令和8年入管法等改正法, promulgated 2026-06-05. Raises the statutory ceiling
    // on residence permit fees; the amounts themselves are set by the cabinet
    // order still out for comment, so this entry claims the cap, not a figure.
    period: '2026-06',
    category: 'fees',
    titleKey: 'policy.act2026.title',
    descriptionKey: 'policy.act2026.description',
    href: 'https://www.moj.go.jp/isa/01_00643.html',
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
    // Public comment opened 2026-07-03.
    period: '2026-07',
    category: 'fees',
    titleKey: 'policy.feeConsultation2026.title',
    descriptionKey: 'policy.feeConsultation2026.description',
    href: 'https://www.moj.go.jp/isa/applications/resources/10_00001.html',
  },
] as const satisfies readonly PolicyEvent[];
