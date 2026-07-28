// src/i18n/locales/en.ts
// English UI strings — the source of truth for the whole catalogue. Every
// other locale is a partial override of this file, and `DictionaryKey` is
// derived from it, so `tsc --noEmit` flags any key that is referenced in the
// app but not defined here.
//
// Conventions (see src/i18n/README.md):
// - Keys are dot-namespaced, grouped by the surface they appear on.
// - `{placeholder}` slots are substituted at render time; a translation must
//   use the same set of placeholders as the English string.
// - A `_one` / `_other` suffix pair marks a plural family, addressed by its
//   base name through `tPlural`. Underscores are reserved for that purpose.
export const en = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': 'Japan Immigration Statistics',
  'app.subtitle': 'Bureau processing data from e-Stat, updated with each release',
  'app.skipToContent': 'Skip to content',
  'app.loadingData': 'Crunching Immigration Data...',
  'app.loadingDashboard': 'Loading Dashboard...',
  'app.retry': 'Retry',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  'meta.title': 'Japan Immigration Statistics Dashboard',
  'meta.description':
    'Visa processing times, bureau workloads, and a queue-model estimator for your own application - built on official Immigration Services Agency statistics, updated whenever e-Stat releases new data (typically monthly).',
  'meta.keywords':
    'Japan visa processing times, immigration bureau statistics, visa application tracker, Immigration Services Agency, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': 'Language',
  'nav.switchToLightTheme': 'Switch to light theme',
  'nav.switchToDarkTheme': 'Switch to dark theme',
  'nav.openSettings': 'Open the settings menu',
  'nav.settings': 'Settings',
  'nav.theme': 'Theme',
  'nav.themeLight': 'Light',
  'nav.themeDark': 'Dark',
  'nav.about': 'About',
  'nav.changelog': 'Changelog',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': 'Data: {range}',
  'dashboard.coverageRange': '{from} – {to}',
  'dashboard.comparisonSuffix': '(comparison)',
  'dashboard.expandEstimator': 'Expand the Processing Time Estimator',
  'dashboard.estimatorRail': 'Estimator',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': 'Immigration Bureau',
  'filters.appType': 'Application Type',
  'filters.compare': 'Compare With',
  'filters.compareNone': 'None',
  'filters.excludeAirports': 'Exclude airport offices',
  'filters.includeAirports': 'Include airport offices',
  'filters.reset': 'Reset filters',
  'filters.selectPlaceholder': 'Select',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': 'Time range',
  'period.latest': 'Latest month',
  'period.all': 'All data',
  'period.months_one': '{count} month',
  'period.months_other': '{count} months',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': 'Total Applications',
  'stats.totalApplications.short': 'Total',
  'stats.pending': 'Pending',
  'stats.granted': 'Granted',
  'stats.denied': 'Denied',
  'stats.approvalRate': 'Approval Rate',
  'stats.approvalRate.short': 'Approval',
  'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '{delta} MoM',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': 'Carried over',
  'metric.pending': 'Pending (carried over)',
  'metric.received': 'Received',
  'metric.processed': 'Processed',
  'metric.granted': 'Granted',
  'metric.denied': 'Denied',
  'metric.other': 'Other',
  'metric.completion': 'Completion',
  'metric.applications': 'Applications',
  'metric.population': 'Population',
  'metric.area': 'Area',
  'metric.density': 'Density',
  'common.noDataForFilters': 'No data for this combination of filters.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'View data table',
  'table.hide': 'Hide data table',
  'table.downloadCsv': 'Download CSV',
  'table.caption': 'Monthly application statistics for {bureau}',
  'table.month': 'Month',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Processing Time Estimator',
  'estimator.description': 'Queue-model estimate from the last six months of bureau throughput.',
  'estimator.selectBureau': 'Select Bureau',
  'estimator.selectType': 'Select Type',
  'estimator.applicationDate': 'Application Date',
  'estimator.empty':
    'Select your bureau, application type, and application date to estimate when your application will be processed.',
  'estimator.estimatedCompletion': 'Estimated completion',
  'estimator.queuePosition': 'Queue position',
  'estimator.aheadOfYou': '≈ {count} ahead of you',
  'estimator.howCalculated': 'How is this calculated?',
  'estimator.showMath': 'Show the math',
  'estimator.hideMath': 'Hide the math',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': 'Reset the estimator',
  'estimator.resetAria': 'Reset the Processing Time Estimator',
  'estimator.collapse': 'Collapse the estimator',
  'estimator.collapseAria': 'Collapse the Processing Time Estimator',
  'estimator.close': 'Close the estimator',
  'estimator.closeAria': 'Close the Processing Time Estimator',
  'estimator.copyPermalink': 'Copy a permalink to this estimate',
  'estimator.copied': 'Copied!',
  // Result note, joined with " · ".
  'estimator.uncertaintyDays_one': '± {count} day',
  'estimator.uncertaintyDays_other': '± {count} days',
  'estimator.uncertaintyWeeks_one': '± {count} week',
  'estimator.uncertaintyWeeks_other': '± {count} weeks',
  'estimator.basedOnMonths_one': 'based on {count} month of throughput',
  'estimator.basedOnMonths_other': 'based on {count} months of throughput',
  // Warnings.
  'estimator.limitedDataTitle': 'Estimated with limited data:',
  'estimator.limitedDataBody_one':
    'Your application date is beyond available data. This estimate is based on simulated processing rates from {count} month of historical data and may be less accurate.',
  'estimator.limitedDataBody_other':
    'Your application date is beyond available data. This estimate is based on simulated processing rates from {count} months of historical data and may be less accurate.',
  'estimator.pastDueTitle': 'Possibly past due:',
  'estimator.pastDueBody':
    'Based on expected processing rates, completion of this application may be past due. If you have not yet received additional requests and/or a decision on this application, please contact the bureau for more information.',
  // {emphasis} is the word "estimate", rendered bold and underlined.
  'estimator.disclaimer':
    '*This is an {emphasis} based on current processing rates, expected queue position, and pending applications. Actual processing time for your application may vary.',
  'estimator.disclaimerEmphasis': 'estimate',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': 'Queue at application',
  'estimator.formula.step2': 'Queue position & daily rate',
  'estimator.formula.step3': 'Remaining days',
  'estimator.formula.explainAria': 'Explain the variables in the {title} formula',
  'estimator.formula.var.dRem.title': 'Remaining Days',
  'estimator.formula.var.dRem.description': 'Estimated days until processing completes.',
  'estimator.formula.var.qPos.title': 'Queue Position',
  'estimator.formula.var.qPos.description': 'Estimated position in the processing queue.',
  'estimator.formula.var.rDaily.title': 'Daily Rate',
  'estimator.formula.var.rDaily.description': 'Average applications processed per day.',
  'estimator.formula.var.cProc.title': 'Confirmed Processed',
  'estimator.formula.var.cProc.description': 'Confirmed number of applications processed since submission.',
  'estimator.formula.var.eProc.title': 'Estimated Processed',
  'estimator.formula.var.eProc.description': 'Estimated number of applications processed since last data point.',
  'estimator.formula.var.sigmaP.title': 'Total Processed',
  'estimator.formula.var.sigmaP.description': 'Sum of processed applications used for calculating averages.',
  'estimator.formula.var.sigmaD.title': 'Total Days',
  'estimator.formula.var.sigmaD.description': 'Sum of days used for calculating averages.',
  'estimator.formula.var.qApp.title': 'Application Queue',
  'estimator.formula.var.qApp.description': 'Estimated queue position at submission time.',
  'estimator.formula.var.cPrev.title': 'Carried Over',
  'estimator.formula.var.cPrev.description': 'Applications carried forward from the previous month.',
  'estimator.formula.var.nApp.title': 'New Applications',
  'estimator.formula.var.nApp.description': 'Estimated applications received prior to submission.',
  'estimator.formula.var.pApp.title': 'Processed Applications',
  'estimator.formula.var.pApp.description': 'Estimated applications processed prior to submission.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': 'Intake & Processing',
  'charts.intake.description':
    'Applications carried over and received each month, against the volume the bureaus completed.',
  'charts.intake.aria':
    'Stacked bars of pending and received applications per month, with processed volume as a line',
  'charts.types.label': 'Application Types',
  'charts.types.description':
    'Monthly new submissions broken down by application type — click a legend entry to toggle a series.',
  'charts.types.aria': 'Line chart of monthly new submissions per application type',
  'charts.outcomes.label': 'Outcomes',
  'charts.outcomes.description': 'Where applications end up: each type’s flow into granted, denied, or other outcomes.',
  'charts.outcomes.aria': 'Sankey diagram of application types flowing to outcomes',
  'charts.share.label': 'Bureau Share',
  'charts.share.description': 'Where applications were filed: each bureau’s share of total intake.',
  'charts.share.aria': "Donut chart of each bureau's share of received applications",
  'charts.mix.label': 'Category Mix',
  'charts.mix.description': 'All applications by type and bureau — click a category to zoom into its breakdown.',
  'charts.efficiency.label': 'Processing Efficiency',
  'charts.efficiency.description':
    'Bureaus ranked by completion rate — stem weight carries intake volume, with the nationwide rate as a guide.',
  'charts.efficiency.aria': 'Bureaus ranked by completion rate, with intake volume as stem weight',
  'charts.map.label': 'Regional Map',
  'charts.map.description': 'Bureau service areas and population density, with bureau and airport office locations.',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': 'Sunburst of applications by type and bureau; interactive drill-down',
  'charts.efficiencyQuadrant.aria':
    'Quadrant chart of completion rate against received volume per bureau; bubble size shows processed volume',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': 'Show {series}',
  'chart.legendHide': 'Hide {series}',
  'chart.allSeriesHidden': 'All series hidden — click a legend entry to show one.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': 'Acquisition',
  'chart.types.series.extension': 'Extension',
  'chart.types.series.change': 'Change of Status',
  'chart.types.series.activity': 'Activity Permission',
  'chart.types.series.reentry': 'Re-entry',
  'chart.types.series.permanent': 'Permanent Residence',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': 'Other / Withdrawn',
  'chart.outcomes.valueUnit': 'applications',
  'chart.outcomes.tooltipValueLabel': 'Applications',
  'chart.outcomes.approvalRate': 'Approval rate',
  'chart.outcomes.ofProcessed': 'of {count} processed applications',
  'chart.outcomes.empty': 'No processed applications in this period.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': 'Other ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': 'All applications',
  'chart.mix.breadcrumbAria': 'Treemap drill-down path',
  'chart.mix.zoomInHint': 'Click a category to zoom in',
  'chart.mix.zoomOutHint': 'Click the background (or press Esc) to zoom out',
  'chart.mix.others': 'Others',
  'chart.mix.categoryAria': '{category}: {count} applications. Zoom in.',
  'chart.mix.tooltipValue': '{count} applications · {percent} of {scope}',
  'chart.mix.scopeAll': 'all applications',
  'chart.mix.sunburstHint': '{trail} — {count} applications ({percent} of total)',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': 'branch office',
  'chart.efficiency.receivedCount': '{count} received',
  'chart.efficiency.nationwide': 'Nationwide {rate}',
  'chart.efficiency.pointAria': '{bureau}: {rate} percent completion, {count} applications received',
  'chart.efficiency.xAxis': 'Applications received',
  'chart.efficiency.fullCompletion': '100% of intake completed',
  'chart.efficiency.quadrantKeepingPace': 'HIGH VOLUME · KEEPING PACE',
  'chart.efficiency.quadrantFallingBehind': 'HIGH VOLUME · FALLING BEHIND',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  'map.bureauMarkerAria': '{bureau} bureau',
  'map.airportMarkerAria': '{bureau} airport office',
  'map.bureauSuffix': '{bureau} Bureau',
  'map.airportSuffix': '{bureau} Airport Office',
  'map.servicePopulation': 'Service population',
  'map.serviceArea': 'Service area',
  'map.serviceBureau': 'Service bureau',
  'map.portOfEntry': 'Port-of-entry office',
  'map.legendNote': 'Color = service bureau · intensity = population density',
  'map.bureau': 'Bureau',
  'map.airportOffice': 'Airport office',
  'map.zoomIn': 'Zoom in',
  'map.zoomOut': 'Zoom out',
  'map.resetView': 'Reset view',
  'map.loadError': 'Unable to load the map data. Try reloading the page.',
  'map.loading': 'Loading Map Data...',
  'map.areaValue': '{value} km²',
  'map.densityValue': '{value} /km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': 'Changelog',
  'changelog.loading': 'Loading...',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': 'Error Loading Data',
  'errors.noData': 'No data available',
  'errors.unknown': 'Unknown error occurred',
  'errors.fetchFailed': 'Failed to fetch data',
  'errors.renderTitle': 'Something went wrong',
  'errors.renderBody': 'An error occurred while rendering the application.',
  'errors.reload': 'Reload Page',
  'errors.changelogUnavailable': 'Unable to load the changelog.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': 'Showing {chart} for {bureau}',
  'a11y.showingChartWithType': 'Showing {chart} for {bureau}, {type}',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': 'Official statistics provided by the Immigration Services Agency of Japan',
  'footer.dataAcquisition': 'Data acquisition provided by {source}',
  'footer.fixtureNotice': 'showing generated fixture data',
  'footer.builtBy': 'Built by {author}',
  'footer.dataUpdated': 'data updated {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Keyed by e-Stat bureau code. `.short` is the terminal-style abbreviation
  // shown on the stat tiles; leave it as the Latin code in most languages.
  'bureau.all': 'Nationwide',
  'bureau.all.short': 'ALL',
  'bureau.101010': 'Sapporo',
  'bureau.101010.short': 'CTS',
  'bureau.101090': 'Sendai',
  'bureau.101090.short': 'SDJ',
  'bureau.101170': 'Shinagawa',
  'bureau.101170.short': 'SGW',
  'bureau.101190': 'Narita Airport',
  'bureau.101190.short': 'NRT',
  'bureau.101200': 'Haneda Airport',
  'bureau.101200.short': 'HND',
  'bureau.101210': 'Yokohama',
  'bureau.101210.short': 'YOK',
  'bureau.101350': 'Nagoya',
  'bureau.101350.short': 'NAG',
  'bureau.101370': 'Chubu Airport',
  'bureau.101370.short': 'NGO',
  'bureau.101460': 'Osaka',
  'bureau.101460.short': 'ITM',
  'bureau.101480': 'Kansai Airport',
  'bureau.101480.short': 'KIX',
  'bureau.101490': 'Kobe',
  'bureau.101490.short': 'UKB',
  'bureau.101580': 'Hiroshima',
  'bureau.101580.short': 'HIJ',
  'bureau.101670': 'Takamatsu',
  'bureau.101670.short': 'TAK',
  'bureau.101720': 'Fukuoka',
  'bureau.101720.short': 'FUK',
  'bureau.101740': 'Naha',
  'bureau.101740.short': 'OKA',

  // ── Domain: application types ────────────────────────────────────────────
  // Keyed by e-Stat application type code. `.short` is the stat-tile
  // abbreviation; `.compact` is the one-word form the narrow Sankey uses.
  'appType.all': 'All Types',
  'appType.all.short': 'ALL',
  'appType.all.compact': 'All',
  'appType.10': 'Status Acquisition',
  'appType.10.short': 'ACQ',
  'appType.10.compact': 'Acquisition',
  'appType.20': 'Extension of Stay',
  'appType.20.short': 'EXT',
  'appType.20.compact': 'Extension',
  'appType.30': 'Change of Status',
  'appType.30.short': 'CHG',
  'appType.30.compact': 'Change',
  'appType.40': 'Permission for Activities',
  'appType.40.short': 'ACT',
  'appType.40.compact': 'Permission',
  'appType.50': 'Re-entry',
  'appType.50.short': 'RET',
  'appType.50.compact': 'Re-entry',
  'appType.60': 'Permanent Residence',
  'appType.60.short': 'PR',
  'appType.60.compact': 'Permanent',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code (1 Hokkaido … 47 Okinawa).
  'prefecture.1': 'Hokkaido',
  'prefecture.2': 'Aomori',
  'prefecture.3': 'Iwate',
  'prefecture.4': 'Miyagi',
  'prefecture.5': 'Akita',
  'prefecture.6': 'Yamagata',
  'prefecture.7': 'Fukushima',
  'prefecture.8': 'Ibaraki',
  'prefecture.9': 'Tochigi',
  'prefecture.10': 'Gunma',
  'prefecture.11': 'Saitama',
  'prefecture.12': 'Chiba',
  'prefecture.13': 'Tokyo',
  'prefecture.14': 'Kanagawa',
  'prefecture.15': 'Niigata',
  'prefecture.16': 'Toyama',
  'prefecture.17': 'Ishikawa',
  'prefecture.18': 'Fukui',
  'prefecture.19': 'Yamanashi',
  'prefecture.20': 'Nagano',
  'prefecture.21': 'Gifu',
  'prefecture.22': 'Shizuoka',
  'prefecture.23': 'Aichi',
  'prefecture.24': 'Mie',
  'prefecture.25': 'Shiga',
  'prefecture.26': 'Kyoto',
  'prefecture.27': 'Osaka',
  'prefecture.28': 'Hyogo',
  'prefecture.29': 'Nara',
  'prefecture.30': 'Wakayama',
  'prefecture.31': 'Tottori',
  'prefecture.32': 'Shimane',
  'prefecture.33': 'Okayama',
  'prefecture.34': 'Hiroshima',
  'prefecture.35': 'Yamaguchi',
  'prefecture.36': 'Tokushima',
  'prefecture.37': 'Kagawa',
  'prefecture.38': 'Ehime',
  'prefecture.39': 'Kochi',
  'prefecture.40': 'Fukuoka',
  'prefecture.41': 'Saga',
  'prefecture.42': 'Nagasaki',
  'prefecture.43': 'Kumamoto',
  'prefecture.44': 'Oita',
  'prefecture.45': 'Miyazaki',
  'prefecture.46': 'Kagoshima',
  'prefecture.47': 'Okinawa',
} as const;
