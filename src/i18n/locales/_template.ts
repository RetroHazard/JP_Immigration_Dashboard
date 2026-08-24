// src/i18n/locales/_template.ts
// TEMPLATE — not a locale. Nothing imports this file and the registry does not
// list it; it exists to be copied.
//
// GENERATED from en.ts by `npm run i18n:template`. Do not edit it by hand —
// regenerate it instead, or your changes will be overwritten.
//
// To start a language:
//   1. Copy this file to <code>.ts (ko, zh, vi, pt — the code the language is
//      normally written with) and rename the exported constant to match.
//   2. Uncomment the lines you have translated and replace the English value.
//      Leave the rest commented: a missing key falls back to English, which
//      reads better than a blank space or a half-translated sentence.
//   3. Register it in index.ts, starting at status: 'in-progress'.
//   4. Run `npx vitest run src/i18n` and `npx tsc --noEmit`.
//
// Rules the catalogue tests enforce (see README.md):
//   - Keep every {placeholder}. You may reorder them, and often should.
//   - Never leave a value empty — re-comment the line instead.
//   - Underscores mark plural families. Translate the members your language
//     actually uses; `_other` alone is correct for a language that does not
//     inflect for number, and anything absent falls back to it.
import type { Dictionary } from '../types';

export const template: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  // 'app.title': 'Japan Immigration Statistics',
  // 'app.subtitle': 'Bureau processing data from e-Stat, updated with each release',
  // 'app.skipToContent': 'Skip to content',
  // 'app.loadingData': 'Crunching Immigration Data...',
  // 'app.loadingDashboard': 'Loading Dashboard...',
  // 'app.retry': 'Retry',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  // 'meta.title': 'Japan Immigration Statistics Dashboard',
  // 'meta.description':
  //   'Visa processing times, bureau workloads, and a queue-model estimator for your own application - built on official Immigration Services Agency statistics, updated whenever e-Stat releases new data (typically monthly).',
  // 'meta.keywords':
  //   'Japan visa processing times, immigration bureau statistics, visa application tracker, Immigration Services Agency, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  // 'nav.version': 'v{version}',
  // 'nav.language': 'Language',
  // 'nav.switchToLightTheme': 'Switch to light theme',
  // 'nav.switchToDarkTheme': 'Switch to dark theme',
  // 'nav.openSettings': 'Open the settings menu',
  // 'nav.settings': 'Settings',
  // 'nav.theme': 'Theme',
  // 'nav.themeLight': 'Light',
  // 'nav.themeDark': 'Dark',
  // 'nav.about': 'About',
  // 'nav.changelog': 'Changelog',
  // 'nav.sourceCode': 'Source code',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  // 'dashboard.dataCoverage': 'Data: {range}',
  // 'dashboard.coverageRange': '{from} – {to}',
  // 'dashboard.comparisonSuffix': '(comparison)',
  // 'dashboard.expandEstimator': 'Expand the Processing Time Estimator',
  // 'dashboard.estimatorRail': 'Estimator',

  // ── Filters ──────────────────────────────────────────────────────────────
  // 'filters.bureau': 'Immigration Bureau',
  // 'filters.appType': 'Application Type',
  // 'filters.compare': 'Compare With',
  // 'filters.compareNone': 'None',
  // 'filters.excludeAirports': 'Exclude airport offices',
  // 'filters.includeAirports': 'Include airport offices',
  // 'filters.reset': 'Reset filters',
  // 'filters.selectPlaceholder': 'Select',

  // ── Time range selector ──────────────────────────────────────────────────
  // 'period.label': 'Time range',
  // 'period.latest': 'Latest month',
  // 'period.all': 'All data',
  // 'period.months_one': '{count} month',
  // 'period.months_other': '{count} months',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  // 'stats.totalApplications': 'Total Applications',
  // 'stats.totalApplications.short': 'Total',
  // 'stats.pending': 'Pending',
  // 'stats.granted': 'Granted',
  // 'stats.denied': 'Denied',
  // 'stats.approvalRate': 'Approval Rate',
  // 'stats.approvalRate.short': 'Approval',
  // 'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  // 'stats.momDelta': '{delta} MoM',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  // 'metric.carriedOver': 'Carried over',
  // 'metric.pending': 'Pending (carried over)',
  // 'metric.received': 'Received',
  // 'metric.processed': 'Processed',
  // 'metric.granted': 'Granted',
  // 'metric.denied': 'Denied',
  // 'metric.other': 'Other',
  // 'metric.completion': 'Completion',
  // 'metric.applications': 'Applications',
  // 'metric.population': 'Population',
  // 'metric.area': 'Area',
  // 'metric.density': 'Density',
  // 'common.noDataForFilters': 'No data for this combination of filters.',

  // ── Data table ───────────────────────────────────────────────────────────
  // 'table.view': 'View data table',
  // 'table.hide': 'Hide data table',
  // 'table.downloadCsv': 'Download CSV',
  // 'table.caption': 'Monthly application statistics for {bureau}',
  // 'table.month': 'Month',

  // ── Estimator ────────────────────────────────────────────────────────────
  // 'estimator.title': 'Processing Time Estimator',
  // 'estimator.description': 'Queue-model estimate from the last six months of bureau throughput.',
  // 'estimator.selectBureau': 'Select Bureau',
  // 'estimator.selectType': 'Select Type',
  // 'estimator.applicationDate': 'Application Date',
  // 'estimator.empty':
  //   'Select your bureau, application type, and application date to estimate when your application will be processed.',
  // 'estimator.estimatedCompletion': 'Estimated completion',
  // 'estimator.queuePosition': 'Queue position',
  // 'estimator.aheadOfYou': '≈ {count} ahead of you',
  // 'estimator.howCalculated': 'How is this calculated?',
  // 'estimator.showMath': 'Show the math',
  // 'estimator.hideMath': 'Hide the math',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  // 'estimator.reset': 'Reset the estimator',
  // 'estimator.resetAria': 'Reset the Processing Time Estimator',
  // 'estimator.collapse': 'Collapse the estimator',
  // 'estimator.collapseAria': 'Collapse the Processing Time Estimator',
  // 'estimator.close': 'Close the estimator',
  // 'estimator.closeAria': 'Close the Processing Time Estimator',
  // 'estimator.copyPermalink': 'Copy a permalink to this estimate',
  // 'estimator.copied': 'Copied!',
  // Result note, joined with " · ".
  // 'estimator.uncertaintyDays_one': '± {count} day',
  // 'estimator.uncertaintyDays_other': '± {count} days',
  // 'estimator.uncertaintyWeeks_one': '± {count} week',
  // 'estimator.uncertaintyWeeks_other': '± {count} weeks',
  // 'estimator.basedOnMonths_one': 'based on {count} month of throughput',
  // 'estimator.basedOnMonths_other': 'based on {count} months of throughput',
  // Warnings.
  // 'estimator.limitedDataTitle': 'Estimated with limited data:',
  // 'estimator.limitedDataBody_one':
  //   'Your application date is beyond available data. This estimate is based on simulated processing rates from {count} month of historical data and may be less accurate.',
  // 'estimator.limitedDataBody_other':
  //   'Your application date is beyond available data. This estimate is based on simulated processing rates from {count} months of historical data and may be less accurate.',
  // 'estimator.pastDueTitle': 'Possibly past due:',
  // 'estimator.pastDueBody':
  //   'Based on expected processing rates, completion of this application may be past due. If you have not yet received additional requests and/or a decision on this application, please contact the bureau for more information.',
  // {emphasis} is the word "estimate", rendered bold and underlined.
  // 'estimator.disclaimer':
  //   '*This is an {emphasis} based on current processing rates, expected queue position, and pending applications. Actual processing time for your application may vary.',
  // 'estimator.disclaimerEmphasis': 'estimate',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  // 'estimator.formula.step1': 'Throughput baseline',
  // 'estimator.formula.step2': 'Queue at application',
  // 'estimator.formula.step3': 'Processed since application',
  // 'estimator.formula.step4': 'Queue position & remaining days',
  // 'estimator.formula.step5': 'Completion offset & spread',
  // 'estimator.formula.explainAria': 'Explain the variables in the {title} formula',
  // Step 1 — throughput baseline.
  // 'estimator.formula.var.sigmaP.title': 'Total Processed',
  // 'estimator.formula.var.sigmaP.description':
  //   'Applications completed across the sampled window — the last six published months, or fewer where that is all there is.',
  // 'estimator.formula.var.sigmaN.title': 'Total Received',
  // 'estimator.formula.var.sigmaN.description': 'Applications taken in across the same sampled window.',
  // 'estimator.formula.var.sigmaD.title': 'Total Days',
  // 'estimator.formula.var.sigmaD.description': 'Calendar days in the sampled window, added up month by month.',
  // 'estimator.formula.var.rProc.title': 'Processing Rate',
  // 'estimator.formula.var.rProc.description': 'Applications completed per day, averaged across the sampled window.',
  // 'estimator.formula.var.rNew.title': 'Intake Rate',
  // 'estimator.formula.var.rNew.description': 'Applications received per day, averaged across the same window.',
  // Step 2 — the queue on the application date.
  // 'estimator.formula.var.tPrev.title': 'Previous Month Total',
  // 'estimator.formula.var.tPrev.description':
  //   'Total applications on record for the month before yours — carried in plus newly received.',
  // 'estimator.formula.var.pPrev.title': 'Previous Month Processed',
  // 'estimator.formula.var.pPrev.description': 'Applications completed in the month before yours.',
  // 'estimator.formula.var.cSeed.title': 'Simulation Start',
  // 'estimator.formula.var.cSeed.description':
  //   'The last published carry-over, used as the starting point when the month before yours has no figures of its own.',
  // 'estimator.formula.var.mSim.title': 'Months Simulated',
  // 'estimator.formula.var.mSim.description':
  //   'How many months the carry-over was rolled forward to reach your application month.',
  // 'estimator.formula.var.cPrev.title': 'Carried Over',
  // 'estimator.formula.var.cPrev.description':
  //   'Applications still waiting when your application month began. Read from the previous month where it is published, otherwise rolled forward one month at a time from the last month that has figures.',
  // 'estimator.formula.var.nMonth.title': 'Month Received',
  // 'estimator.formula.var.nMonth.description': 'Applications received across the whole of your application month.',
  // 'estimator.formula.var.pMonth.title': 'Month Processed',
  // 'estimator.formula.var.pMonth.description': 'Applications completed across the whole of your application month.',
  // 'estimator.formula.var.dMonth.title': 'Days in Month',
  // 'estimator.formula.var.dMonth.description':
  //   'Calendar days in your application month, used to spread its monthly totals evenly across the days.',
  // 'estimator.formula.var.aDay.title': 'Application Day',
  // 'estimator.formula.var.aDay.description':
  //   'The day of the month you applied — how far into the month the queue had built up.',
  // 'estimator.formula.var.nApp.title': 'Received Before You',
  // 'estimator.formula.var.nApp.description':
  //   'Applications received earlier in your application month, pro-rated to the day you applied.',
  // 'estimator.formula.var.pApp.title': 'Processed Before You',
  // 'estimator.formula.var.pApp.description':
  //   'Applications completed earlier in your application month, pro-rated the same way.',
  // 'estimator.formula.var.qApp.title': 'Application Queue',
  // 'estimator.formula.var.qApp.description': 'How many applications were ahead of yours the day you applied.',
  // Step 3 — progress since the application date.
  // 'estimator.formula.var.pAfter.title': 'Later Months Processed',
  // 'estimator.formula.var.pAfter.description':
  //   'Applications completed in the published months that follow your application month.',
  // 'estimator.formula.var.tApp.title': 'Days Since Applying',
  // 'estimator.formula.var.tApp.description': 'Calendar days between your application date and today.',
  // 'estimator.formula.var.tData.title': 'Days Since Last Data',
  // 'estimator.formula.var.tData.description':
  //   'Calendar days between the end of the most recently published month and today.',
  // 'estimator.formula.var.cProc.title': 'Confirmed Processed',
  // 'estimator.formula.var.cProc.description':
  //   'Applications completed since you applied that published figures already account for.',
  // 'estimator.formula.var.eProc.title': 'Projected Processed',
  // 'estimator.formula.var.eProc.description':
  //   'Applications assumed completed over the stretch no published figures cover yet. Goes negative when those figures already account for more than the average rate predicts.',
  // 'estimator.formula.var.sProc.title': 'Processed Since',
  // 'estimator.formula.var.sProc.description':
  //   'Everything worked through since you applied — confirmed and projected together, rounded to whole applications.',
  // Step 4 — position in the queue, and how long it takes to clear.
  // 'estimator.formula.var.qPos.title': 'Queue Position',
  // 'estimator.formula.var.qPos.description':
  //   'How many applications are still ahead of yours. Zero or below means the estimate has already passed.',
  // 'estimator.formula.var.dRem.title': 'Remaining Days',
  // 'estimator.formula.var.dRem.description': 'Days needed to clear the rest of the queue at the current rate.',
  // Step 5 — the whole-day offset, and the spread around it.
  // 'estimator.formula.var.dEst.title': 'Whole Days',
  // 'estimator.formula.var.dEst.description':
  //   'The remaining days rounded away from zero — the offset added to today to give the date shown above.',
  // 'estimator.formula.var.sigmaR.title': 'Rate Spread',
  // 'estimator.formula.var.sigmaR.description':
  //   'Standard deviation of the monthly processing rates — how much the pace varies from month to month.',
  // 'estimator.formula.var.rBar.title': 'Mean Monthly Rate',
  // 'estimator.formula.var.rBar.description':
  //   'The monthly processing rates averaged one weight per month, rather than weighted by volume.',
  // 'estimator.formula.var.uDays.title': 'Uncertainty',
  // 'estimator.formula.var.uDays.description':
  //   'The ± band shown beside the result: how far the estimate moves if the pace varies as much as it recently has.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  // 'charts.intake.label': 'Intake & Processing',
  // 'charts.intake.description':
  //   'Applications carried over and received each month, against the volume the bureaus completed.',
  // 'charts.intake.aria': 'Stacked bars of pending and received applications per month, with processed volume as a line',
  // 'charts.types.label': 'Application Types',
  // 'charts.types.description':
  //   'Monthly new submissions broken down by application type — click a legend entry to toggle a series.',
  // 'charts.types.aria': 'Line chart of monthly new submissions per application type',
  // 'charts.outcomes.label': 'Outcomes',
  // 'charts.outcomes.description': 'Where applications end up: each type’s flow into granted, denied, or other outcomes.',
  // 'charts.outcomes.aria': 'Sankey diagram of application types flowing to outcomes',
  // 'charts.share.label': 'Bureau Share',
  // 'charts.share.description': 'Where applications were filed: each bureau’s share of total intake.',
  // 'charts.share.aria': "Donut chart of each bureau's share of received applications",
  // 'charts.mix.label': 'Category Mix',
  // 'charts.mix.description': 'All applications by type and bureau — click a category to zoom into its breakdown.',
  // 'charts.efficiency.label': 'Processing Efficiency',
  // 'charts.efficiency.description':
  //   'Bureaus ranked by completion rate — stem weight carries intake volume, with the nationwide rate as a guide.',
  // 'charts.efficiency.aria': 'Bureaus ranked by completion rate, with intake volume as stem weight',
  // 'charts.map.label': 'Regional Map',
  // 'charts.map.description': 'Bureau service areas and population density, with bureau and airport office locations.',
  // Alternate views, kept swap-ready but not currently registered.
  // 'charts.mixSunburst.aria': 'Sunburst of applications by type and bureau; interactive drill-down',
  // 'charts.efficiencyQuadrant.aria':
  //   'Quadrant chart of completion rate against received volume per bureau; bubble size shows processed volume',

  // ── Charts: shared ───────────────────────────────────────────────────────
  // 'chart.legendShow': 'Show {series}',
  // 'chart.legendHide': 'Hide {series}',
  // 'chart.allSeriesHidden': 'All series hidden — click a legend entry to show one.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  // 'chart.types.series.acquisition': 'Acquisition',
  // 'chart.types.series.extension': 'Extension',
  // 'chart.types.series.change': 'Change of Status',
  // 'chart.types.series.activity': 'Activity Permission',
  // 'chart.types.series.reentry': 'Re-entry',
  // 'chart.types.series.permanent': 'Permanent Residence',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  // 'chart.outcomes.otherWithdrawn': 'Other / Withdrawn',
  // 'chart.outcomes.valueUnit': 'applications',
  // 'chart.outcomes.tooltipValueLabel': 'Applications',
  // 'chart.outcomes.tooltipFlowLabel': 'Flow',
  // 'chart.outcomes.approvalRate': 'Approval rate',
  // 'chart.outcomes.ofProcessed': 'of {count} processed applications',
  // 'chart.outcomes.empty': 'No processed applications in this period.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  // 'chart.share.otherSlice': 'Other ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  // 'chart.mix.root': 'All applications',
  // 'chart.mix.breadcrumbAria': 'Treemap drill-down path',
  // 'chart.mix.zoomInHint': 'Click a category to zoom in',
  // 'chart.mix.zoomOutHint': 'Click the background (or press Esc) to zoom out',
  // Touch takes two taps where a mouse takes a hover and a click: the first
  // shows the figures, the second drills in.
  // 'chart.mix.zoomInHintTap': 'Tap a category to inspect it, tap again to zoom in',
  // 'chart.mix.zoomOutHintTap': 'Tap the background to zoom out',
  // 'chart.mix.others': 'Others',
  // 'chart.mix.categoryAria': '{category}: {count} applications. Zoom in.',
  // 'chart.mix.tooltipValue': '{count} applications · {percent} of {scope}',
  // 'chart.mix.scopeAll': 'all applications',
  // 'chart.mix.sunburstHint': '{trail} — {count} applications ({percent} of total)',
  // Shown under any sunburst when nothing is selected. Bklit's own fallback
  // for this is hardcoded English, so the charts pass these in instead.
  // 'chart.sunburst.hintClick': 'Click a segment to zoom in · hover to inspect',
  // 'chart.sunburst.hintTap': 'Tap a segment to inspect it, tap again to zoom in',
  // 'chart.sunburst.zoomOutClick': 'Click the center to zoom out',
  // 'chart.sunburst.zoomOutTap': 'Tap the center to zoom out',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  // 'chart.efficiency.branchOffice': 'branch office',
  // 'chart.efficiency.receivedCount': '{count} received',
  // 'chart.efficiency.nationwide': 'Nationwide {rate}',
  // 'chart.efficiency.pointAria': '{bureau}: {rate} percent completion, {count} applications received',
  // 'chart.efficiency.xAxis': 'Applications received',
  // 'chart.efficiency.fullCompletion': '100% of intake completed',
  // 'chart.efficiency.quadrantKeepingPace': 'HIGH VOLUME · KEEPING PACE',
  // 'chart.efficiency.quadrantFallingBehind': 'HIGH VOLUME · FALLING BEHIND',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  // 'map.bureauMarkerAria': '{bureau} bureau',
  // 'map.airportMarkerAria': '{bureau} airport office',
  // 'map.bureauSuffix': '{bureau} Bureau',
  // 'map.airportSuffix': '{bureau} Airport Office',
  // 'map.servicePopulation': 'Service population',
  // 'map.serviceArea': 'Service area',
  // 'map.serviceBureau': 'Service bureau',
  // 'map.portOfEntry': 'Port-of-entry office',
  // 'map.legendNote': 'Color = service bureau · intensity = population density',
  // 'map.bureau': 'Bureau',
  // 'map.airportOffice': 'Airport office',
  // 'map.loadError': 'Unable to load the map data. Try reloading the page.',
  // 'map.loading': 'Loading Map Data...',
  // 'map.areaValue': '{value} km²',
  // 'map.densityValue': '{value} /km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  // 'changelog.title': 'Changelog',
  // 'changelog.loading': 'Loading...',

  // ── Errors ───────────────────────────────────────────────────────────────
  // 'errors.dataTitle': 'Error Loading Data',
  // 'errors.noData': 'No data available',
  // 'errors.unknown': 'Unknown error occurred',
  // 'errors.fetchFailed': 'Failed to fetch data',
  // 'errors.renderTitle': 'Something went wrong',
  // 'errors.renderBody': 'An error occurred while rendering the application.',
  // 'errors.reload': 'Reload Page',
  // 'errors.changelogUnavailable': 'Unable to load the changelog.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  // 'a11y.showingChart': 'Showing {chart} for {bureau}',
  // 'a11y.showingChartWithType': 'Showing {chart} for {bureau}, {type}',

  // ── Footer ───────────────────────────────────────────────────────────────
  // 'footer.attribution': 'Official statistics provided by the Immigration Services Agency of Japan',
  // 'footer.dataAcquisition': 'Data acquisition provided by {source}',
  // 'footer.fixtureNotice': 'showing generated fixture data',
  // 'footer.builtBy': 'Built by {author}',
  // 'footer.dataUpdated': 'data updated {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Keyed by e-Stat bureau code, in three widths — the same shape the
  // application types use.
  //
  // `.short` is the terminal-style abbreviation; leave it as the Latin code in
  // most languages. `.compact` is the form the width-constrained surfaces use:
  // the efficiency chart's 92px label column, the ring-chart legend, and the
  // treemap's on-tile label. English says the same thing at both widths, but a
  // language whose official office names run long — Japanese writes Yokohama as
  // 東京出入国在留管理局横浜支局 — needs somewhere to put the short form, or every
  // office in a region truncates to the same prefix and they stop being
  // distinguishable.
  // 'bureau.all': 'Nationwide',
  // 'bureau.all.short': 'ALL',
  // 'bureau.all.compact': 'Nationwide',
  // 'bureau.101010': 'Sapporo',
  // 'bureau.101010.short': 'CTS',
  // 'bureau.101010.compact': 'Sapporo',
  // 'bureau.101090': 'Sendai',
  // 'bureau.101090.short': 'SDJ',
  // 'bureau.101090.compact': 'Sendai',
  // 'bureau.101170': 'Shinagawa',
  // 'bureau.101170.short': 'SGW',
  // 'bureau.101170.compact': 'Shinagawa',
  // 'bureau.101190': 'Narita Airport',
  // 'bureau.101190.short': 'NRT',
  // 'bureau.101190.compact': 'Narita Airport',
  // 'bureau.101200': 'Haneda Airport',
  // 'bureau.101200.short': 'HND',
  // 'bureau.101200.compact': 'Haneda Airport',
  // 'bureau.101210': 'Yokohama',
  // 'bureau.101210.short': 'YOK',
  // 'bureau.101210.compact': 'Yokohama',
  // 'bureau.101350': 'Nagoya',
  // 'bureau.101350.short': 'NAG',
  // 'bureau.101350.compact': 'Nagoya',
  // 'bureau.101370': 'Chubu Airport',
  // 'bureau.101370.short': 'NGO',
  // 'bureau.101370.compact': 'Chubu Airport',
  // 'bureau.101460': 'Osaka',
  // 'bureau.101460.short': 'ITM',
  // 'bureau.101460.compact': 'Osaka',
  // 'bureau.101480': 'Kansai Airport',
  // 'bureau.101480.short': 'KIX',
  // 'bureau.101480.compact': 'Kansai Airport',
  // 'bureau.101490': 'Kobe',
  // 'bureau.101490.short': 'UKB',
  // 'bureau.101490.compact': 'Kobe',
  // 'bureau.101580': 'Hiroshima',
  // 'bureau.101580.short': 'HIJ',
  // 'bureau.101580.compact': 'Hiroshima',
  // 'bureau.101670': 'Takamatsu',
  // 'bureau.101670.short': 'TAK',
  // 'bureau.101670.compact': 'Takamatsu',
  // 'bureau.101720': 'Fukuoka',
  // 'bureau.101720.short': 'FUK',
  // 'bureau.101720.compact': 'Fukuoka',
  // 'bureau.101740': 'Naha',
  // 'bureau.101740.short': 'OKA',
  // 'bureau.101740.compact': 'Naha',

  // ── Domain: application types ────────────────────────────────────────────
  // Keyed by e-Stat application type code. `.short` is the stat-tile
  // abbreviation; `.compact` is the one-word form the narrow Sankey uses.
  // 'appType.all': 'All Types',
  // 'appType.all.short': 'ALL',
  // 'appType.all.compact': 'All',
  // 'appType.10': 'Status Acquisition',
  // 'appType.10.short': 'ACQ',
  // 'appType.10.compact': 'Acquisition',
  // 'appType.20': 'Extension of Stay',
  // 'appType.20.short': 'EXT',
  // 'appType.20.compact': 'Extension',
  // 'appType.30': 'Change of Status',
  // 'appType.30.short': 'CHG',
  // 'appType.30.compact': 'Change',
  // 'appType.40': 'Permission for Activities',
  // 'appType.40.short': 'ACT',
  // 'appType.40.compact': 'Permission',
  // 'appType.50': 'Re-entry',
  // 'appType.50.short': 'RET',
  // 'appType.50.compact': 'Re-entry',
  // 'appType.60': 'Permanent Residence',
  // 'appType.60.short': 'PR',
  // 'appType.60.compact': 'Permanent',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code (1 Hokkaido … 47 Okinawa).
  // 'prefecture.1': 'Hokkaido',
  // 'prefecture.2': 'Aomori',
  // 'prefecture.3': 'Iwate',
  // 'prefecture.4': 'Miyagi',
  // 'prefecture.5': 'Akita',
  // 'prefecture.6': 'Yamagata',
  // 'prefecture.7': 'Fukushima',
  // 'prefecture.8': 'Ibaraki',
  // 'prefecture.9': 'Tochigi',
  // 'prefecture.10': 'Gunma',
  // 'prefecture.11': 'Saitama',
  // 'prefecture.12': 'Chiba',
  // 'prefecture.13': 'Tokyo',
  // 'prefecture.14': 'Kanagawa',
  // 'prefecture.15': 'Niigata',
  // 'prefecture.16': 'Toyama',
  // 'prefecture.17': 'Ishikawa',
  // 'prefecture.18': 'Fukui',
  // 'prefecture.19': 'Yamanashi',
  // 'prefecture.20': 'Nagano',
  // 'prefecture.21': 'Gifu',
  // 'prefecture.22': 'Shizuoka',
  // 'prefecture.23': 'Aichi',
  // 'prefecture.24': 'Mie',
  // 'prefecture.25': 'Shiga',
  // 'prefecture.26': 'Kyoto',
  // 'prefecture.27': 'Osaka',
  // 'prefecture.28': 'Hyogo',
  // 'prefecture.29': 'Nara',
  // 'prefecture.30': 'Wakayama',
  // 'prefecture.31': 'Tottori',
  // 'prefecture.32': 'Shimane',
  // 'prefecture.33': 'Okayama',
  // 'prefecture.34': 'Hiroshima',
  // 'prefecture.35': 'Yamaguchi',
  // 'prefecture.36': 'Tokushima',
  // 'prefecture.37': 'Kagawa',
  // 'prefecture.38': 'Ehime',
  // 'prefecture.39': 'Kochi',
  // 'prefecture.40': 'Fukuoka',
  // 'prefecture.41': 'Saga',
  // 'prefecture.42': 'Nagasaki',
  // 'prefecture.43': 'Kumamoto',
  // 'prefecture.44': 'Oita',
  // 'prefecture.45': 'Miyazaki',
  // 'prefecture.46': 'Kagoshima',
  // 'prefecture.47': 'Okinawa',

  // ── Resident population dataset ──────────────────────────────────────────
  // Nationality names are NOT here: they come from Intl.DisplayNames via the
  // ISO codes in constants/nationalities.ts, so all thirteen locales get them
  // without a catalogue entry apiece. Only the handful of rows with no ISO
  // identity are listed under `nationality.*`.
  // The `region.*` continents ARE all listed: ICU is still tried first via
  // REGION_M49, but Chrome ships no display names for M49 macro-regions, so
  // the catalogue has to be able to name every one of them. See below.
  // 'dataset.label': 'Dataset',
  // 'dataset.aria': 'Choose which dataset to explore',
  // 'dataset.processing': 'Application Processing',
  // 'dataset.processing.compact': 'Processing',
  // 'dataset.residents': 'Resident Population',
  // 'dataset.residents.compact': 'Residents',
  // 'dataset.residentsUnavailable': 'Resident population data is unavailable right now.',

  // 'charts.growth.label': 'Population Growth',
  // 'charts.growth.description':
  //   'The whole foreign-resident population, half-year by half-year, stacked by purpose of stay or by world region.',
  // 'charts.growth.aria': 'Stacked bar chart of total foreign residents per half-year, split by status group or by region',
  // 'charts.origins.label': 'Origins Over Time',
  // 'charts.origins.description':
  //   'How the largest nationalities have grown or shrunk across every half-year the statistics cover.',
  // 'charts.origins.aria': 'Stacked area chart of resident numbers per nationality over time',
  // 'charts.flows.label': 'Origin to Status Flows',
  // 'charts.flows.description':
  //   'World regions flowing through countries into purposes of stay — pick a region or nationality to trace its profile.',
  // 'charts.flows.aria':
  //   'Sankey diagram of residents flowing from world regions through countries into residence-status categories',
  // 'charts.statuses.label': 'Residence Status Mix',
  // 'charts.statuses.description':
  //   'Which visas residents hold, grouped by purpose of stay — click a group to zoom into its statuses.',
  // 'charts.statuses.aria': 'Sunburst chart of residents by residence-status group and individual status',
  // 'charts.worldmap.label': 'World Origins',
  // 'charts.worldmap.description': 'Where Japan’s foreign residents come from, shaded by how many hold each nationality.',
  // 'charts.worldmap.aria': 'World map shaded by the number of residents from each country of origin',
  // 'charts.movers.label': 'Biggest Movers',
  // 'charts.movers.description':
  //   'The largest gains and losses between two periods, by nationality or by residence status.',
  // 'charts.movers.aria': 'Diverging bar chart of the largest increases and decreases between two periods',

  // 'filters.region': 'Region',
  // 'filters.allRegions': 'All regions',
  // 'filters.nationality': 'Nationality',
  // 'filters.residenceStatus': 'Residence Status',
  // 'filters.allNationalities': 'All nationalities',
  // 'filters.allStatuses': 'All statuses',
  // 'filters.allCategories': 'All categories',

  // 'period.snapshotLabel': 'Snapshot period',
  // 'period.latestPeriod': 'Latest period',
  // 'period.years_one': '{count} year',
  // 'period.years_other': '{count} years',

  // 'residents.total': 'Foreign Residents',
  // 'residents.total.short': 'Residents',
  // 'residents.delta': '{delta} vs previous half',
  // 'residents.populationShare': 'Share of Population',
  // 'residents.populationShare.short': 'Pop. Share',
  // 'residents.populationShareOf': 'of Japan’s {population} people',
  // 'residents.topNationality': 'Largest Nationality',
  // 'residents.topNationality.short': 'Top Origin',
  // 'residents.topStatus': 'Largest Status',
  // 'residents.topStatus.short': 'Top Status',
  // 'residents.share': '{share} of the total',
  // 'residents.scope': '{nationality} ({status})',
  // 'residents.otherNationalities': 'Other nationalities',
  // 'residents.noMapArea': '{count} nationalities have no area on the map and are not shaded.',
  // 'residents.legendScale': 'Residents',
  // 'residents.discontinued': 'Series ends {period}: the category was merged or renamed.',
  // 'residents.comparePeriod': 'vs {period}',
  // 'residents.byNationality': 'By nationality',
  // 'residents.byStatus': 'By residence status',
  // 'residents.increase': 'Increase',
  // 'residents.decrease': 'Decrease',
  // 'residents.asOf': 'As of {period}',
  // 'residents.noChange': 'No measurable change between these periods.',
  // 'residents.coverageRange': '{from} – {to}',
  // 'residents.stackByGroup': 'By purpose of stay',
  // 'residents.stackByRegion': 'By world region',
  // 'residents.stackByNationality': 'By nationality',
  // 'residents.growthTotal': 'Total',
  // 'residents.viewAbsolute': 'Counts',
  // 'residents.viewIndexed': 'Growth (indexed)',
  // 'residents.indexedTooltip': '×{multiple}',
  // 'residents.flowsValueUnit': 'residents',
  // 'residents.flowsTooltipValueLabel': 'Residents',
  // 'residents.flowsTooltipFlowLabel': 'Flow',
  // 'residents.sunburstHint': '{trail} — {count} residents ({percent} of total)',
  // 'residents.markerSsw.title': 'Specified Skilled Worker launched',
  // 'residents.markerSsw.description': 'The April 2019 visa opened over a dozen industries to skilled foreign workers.',
  // 'residents.markerCovid.title': 'COVID-19 border closure',
  // 'residents.markerCovid.description': 'Entry restrictions froze new arrivals; the population dipped until mid-2022.',
  // 'residents.markerKoreaSplit.title': 'Korea reporting split',
  // 'residents.markerKoreaSplit.description':
  //   'Korea (combined) became separate South Korea and Korea (Chosen) series — a reporting change, not a population change.',

  // 'statusGroup.work': 'Work',
  // 'statusGroup.training': 'Training',
  // 'statusGroup.study': 'Study',
  // 'statusGroup.family': 'Family',
  // 'statusGroup.residency': 'Residency',
  // 'statusGroup.other': 'Other',

  // Every continent rollup: `Intl.DisplayNames` is tried first, but Chrome and
  // Edge ship no names for UN M49 macro-regions (`.of('142')` gives back '142',
  // not "Asia"), so these are what actually renders there. 4000 is M49 003 —
  // e-Stat's 北アメリカ spans Central America and the Caribbean, so it is
  // "North America", not 021's "Northern America". 7000 has no M49 code at all.
  // 'region.1000': 'Asia',
  // 'region.2000': 'Europe',
  // 'region.3000': 'Africa',
  // 'region.4000': 'North America',
  // 'region.5000': 'South America',
  // 'region.6000': 'Oceania',
  // 'region.7000': 'Stateless',

  // Only the rows with no ISO 3166-1 identity; everything else is ICU.
  // 'nationality.1120': 'Korea (Chosen)',
  // 'nationality.1130': 'Korea (combined)',
  // 'nationality.2290': 'Serbia and Montenegro',
  // 'nationality.2500': 'Yugoslavia',
  // 'nationality.7000': 'Stateless',

  // ── Residence statuses (e-Stat cat01) ────────────────────────────────────
  // English follows the Immigration Services Agency's own naming for the
  // statuses in the Immigration Control Act's appended tables.
  // 'status.1010': 'Total',
  // 'status.1040': 'Professor',
  // 'status.1050': 'Artist',
  // 'status.1060': 'Religious Activities',
  // 'status.1070': 'Journalist',
  // 'status.1080': 'Highly Skilled Professional',
  // 'status.1090': 'Highly Skilled Professional (i)(a)',
  // 'status.1100': 'Highly Skilled Professional (i)(b)',
  // 'status.1110': 'Highly Skilled Professional (i)(c)',
  // 'status.1120': 'Highly Skilled Professional (ii)',
  // 'status.1130': 'Investor / Business Manager',
  // 'status.1140': 'Business Manager',
  // 'status.1150': 'Legal / Accounting Services',
  // 'status.1160': 'Medical Services',
  // 'status.1170': 'Researcher',
  // 'status.1180': 'Instructor',
  // 'status.1190': 'Engineer',
  // 'status.1200': 'Specialist in Humanities / International Services',
  // 'status.1210': 'Engineer / Specialist in Humanities / International Services',
  // 'status.1220': 'Intra-company Transferee',
  // 'status.1230': 'Nursing Care',
  // 'status.1240': 'Entertainer',
  // 'status.1250': 'Skilled Labour',
  // 'status.1260': 'Specified Skilled Worker',
  // 'status.1270': 'Specified Skilled Worker (i)',
  // 'status.1280': 'Specified Skilled Worker (ii)',
  // 'status.1290': 'Technical Intern Training',
  // 'status.1300': 'Technical Intern Training (i)(a)',
  // 'status.1310': 'Technical Intern Training (i)(b)',
  // 'status.1320': 'Technical Intern Training (ii)(a)',
  // 'status.1330': 'Technical Intern Training (ii)(b)',
  // 'status.1340': 'Technical Intern Training (iii)(a)',
  // 'status.1350': 'Technical Intern Training (iii)(b)',
  // 'status.1360': 'Cultural Activities',
  // 'status.1380': 'Student',
  // 'status.1400': 'Trainee',
  // 'status.1410': 'Dependent',
  // 'status.1420': 'Designated Activities',
  // 'status.1430': 'Permanent Resident',
  // 'status.1440': 'Spouse or Child of Japanese National',
  // 'status.1450': 'Spouse or Child of Permanent Resident',
  // 'status.1460': 'Long-Term Resident',
  // 'status.1470': 'Special Permanent Resident',
  // 'residents.mixRoot': 'All residents',
  // 'residents.mixScopeAll': 'all residents',
  // 'residents.mixCategoryAria': '{category}: {count} residents. Zoom in.',
  // 'residents.mixTooltipValue': '{count} residents · {percent} of {scope}',
};
