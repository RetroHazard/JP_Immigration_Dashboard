// src/i18n/locales/tl.ts
// Tagalog (Filipino) overrides. A complete translation: every key English
// defines has a Tagalog counterpart, including both members of every plural
// family Tagalog needs (`_one` and `_other` — Filipino, like English, resolves
// counts to one of those two CLDR categories, though its `one` rule matches a
// count of 0 as well as 1, so each `_one` string is phrased to read naturally
// for both).
import type { Dictionary } from '../types';

export const tl: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': 'Estadistika ng Imigrasyon sa Japan',
  'app.subtitle': 'Datos ng pagproseso ng mga tanggapan mula sa e-Stat, ina-update sa bawat paglabas',
  'app.skipToContent': 'Lumaktaw sa nilalaman',
  'app.loadingData': 'Pinoproseso ang Datos ng Imigrasyon...',
  'app.loadingDashboard': 'Ikinakarga ang Dashboard...',
  'app.retry': 'Subukan Muli',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  'meta.title': 'Dashboard ng Estadistika ng Imigrasyon sa Japan',
  'meta.description':
    'Mga oras ng pagproseso ng visa, dami ng trabaho ng mga tanggapan, at isang queue-model na tagatantiya para sa iyong sariling aplikasyon - batay sa opisyal na estadistika ng Immigration Services Agency, ina-update sa tuwing maglabas ng bagong datos ang e-Stat (karaniwan ay buwan-buwan).',
  'meta.keywords':
    'mga oras ng pagproseso ng visa sa Japan, estadistika ng tanggapan ng imigrasyon, tracker ng aplikasyon ng visa, Immigration Services Agency, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': 'Wika',
  'nav.switchToLightTheme': 'Lumipat sa maliwanag na tema',
  'nav.switchToDarkTheme': 'Lumipat sa madilim na tema',
  'nav.openSettings': 'Buksan ang menu ng mga setting',
  'nav.settings': 'Mga Setting',
  'nav.theme': 'Tema',
  'nav.themeLight': 'Maliwanag',
  'nav.themeDark': 'Madilim',
  'nav.about': 'Tungkol Dito',
  'nav.changelog': 'Listahan ng Pagbabago',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': 'Datos: {range}',
  'dashboard.coverageRange': '{from} – {to}',
  'dashboard.comparisonSuffix': '(paghahambing)',
  'dashboard.expandEstimator': 'Palawakin ang Tagatantiya ng Oras ng Pagproseso',
  'dashboard.estimatorRail': 'Tagatantiya',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': 'Kawanihan ng Imigrasyon',
  'filters.appType': 'Uri ng Aplikasyon',
  'filters.compare': 'Ikumpara Sa',
  'filters.compareNone': 'Wala',
  'filters.excludeAirports': 'Huwag isama ang mga tanggapan sa paliparan',
  'filters.includeAirports': 'Isama ang mga tanggapan sa paliparan',
  'filters.reset': 'I-reset ang mga filter',
  'filters.selectPlaceholder': 'Pumili',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': 'Saklaw ng Panahon',
  'period.latest': 'Pinakahuling buwan',
  'period.all': 'Lahat ng Datos',
  'period.months_one': '{count} buwan',
  'period.months_other': '{count} buwan',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': 'Kabuuang Aplikasyon',
  'stats.totalApplications.short': 'Kabuuan',
  'stats.pending': 'Nakabinbin',
  'stats.granted': 'Naaprubahan',
  'stats.denied': 'Tinanggihan',
  'stats.approvalRate': 'Rate ng Pag-apruba',
  'stats.approvalRate.short': 'Pag-apruba',
  'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '{delta} kumpara sa nakaraang buwan',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': 'Dinalang Balanse',
  'metric.pending': 'Nakabinbin (dinalang balanse)',
  'metric.received': 'Natanggap',
  'metric.processed': 'Naiproseso',
  'metric.granted': 'Naaprubahan',
  'metric.denied': 'Tinanggihan',
  'metric.other': 'Iba Pa',
  'metric.completion': 'Pagkumpleto',
  'metric.applications': 'Mga Aplikasyon',
  'metric.population': 'Populasyon',
  'metric.area': 'Lawak',
  'metric.density': 'Densidad',
  'common.noDataForFilters': 'Walang datos para sa kombinasyong ito ng mga filter.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'Tingnan ang talaan ng datos',
  'table.hide': 'Itago ang talaan ng datos',
  'table.downloadCsv': 'I-download ang CSV',
  'table.caption': 'Buwanang estadistika ng aplikasyon para sa {bureau}',
  'table.month': 'Buwan',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Tagatantiya ng Oras ng Pagproseso',
  'estimator.description': 'Pagtantiya batay sa queue-model mula sa huling anim na buwan ng throughput ng tanggapan.',
  'estimator.selectBureau': 'Pumili ng Tanggapan',
  'estimator.selectType': 'Pumili ng Uri',
  'estimator.applicationDate': 'Petsa ng Aplikasyon',
  'estimator.empty':
    'Piliin ang iyong tanggapan, uri ng aplikasyon, at petsa ng aplikasyon upang matantiya kung kailan maiproseso ang iyong aplikasyon.',
  'estimator.estimatedCompletion': 'Tinatayang pagkumpleto',
  'estimator.queuePosition': 'Posisyon sa pila',
  'estimator.aheadOfYou': '≈ {count} nasa unahan mo',
  'estimator.howCalculated': 'Paano ito kinakalkula?',
  'estimator.showMath': 'Ipakita ang kalkulasyon',
  'estimator.hideMath': 'Itago ang kalkulasyon',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': 'I-reset ang tagatantiya',
  'estimator.resetAria': 'I-reset ang Tagatantiya ng Oras ng Pagproseso',
  'estimator.collapse': 'Paliitin ang tagatantiya',
  'estimator.collapseAria': 'Paliitin ang Tagatantiya ng Oras ng Pagproseso',
  'estimator.close': 'Isara ang tagatantiya',
  'estimator.closeAria': 'Isara ang Tagatantiya ng Oras ng Pagproseso',
  'estimator.copyPermalink': 'Kopyahin ang permalink sa tantiyang ito',
  'estimator.copied': 'Nakopya!',
  // Result note, joined with " · ".
  'estimator.uncertaintyDays_one': '± {count} araw',
  'estimator.uncertaintyDays_other': '± {count} araw',
  'estimator.uncertaintyWeeks_one': '± {count} linggo',
  'estimator.uncertaintyWeeks_other': '± {count} linggo',
  'estimator.basedOnMonths_one': 'batay sa {count} buwan ng naiprosesong dami',
  'estimator.basedOnMonths_other': 'batay sa {count} buwan ng naiprosesong dami',
  // Warnings.
  'estimator.limitedDataTitle': 'Tinantiya gamit ang limitadong datos:',
  'estimator.limitedDataBody_one':
    'Ang petsa ng iyong aplikasyon ay lampas sa available na datos. Ang tantiyang ito ay batay sa simulated na rate ng pagproseso mula sa {count} buwan ng makasaysayang datos at maaaring hindi gaanong tumpak.',
  'estimator.limitedDataBody_other':
    'Ang petsa ng iyong aplikasyon ay lampas sa available na datos. Ang tantiyang ito ay batay sa simulated na rate ng pagproseso mula sa {count} buwan ng makasaysayang datos at maaaring hindi gaanong tumpak.',
  'estimator.pastDueTitle': 'Posibleng lampas na sa taning:',
  'estimator.pastDueBody':
    'Batay sa inaasahang rate ng pagproseso, maaaring lampas na sa takdang oras ang pagkumpleto ng aplikasyong ito. Kung hindi mo pa natatanggap ang karagdagang kahilingan at/o desisyon sa aplikasyong ito, mangyaring makipag-ugnayan sa tanggapan para sa karagdagang impormasyon.',
  // {emphasis} is the word "estimate", rendered bold and underlined.
  'estimator.disclaimer':
    '*Ito ay isang {emphasis} batay sa kasalukuyang rate ng pagproseso, inaasahang posisyon sa pila, at mga nakabinbing aplikasyon. Maaaring mag-iba ang aktwal na oras ng pagproseso ng iyong aplikasyon.',
  'estimator.disclaimerEmphasis': 'tantiya',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': 'Pila sa oras ng aplikasyon',
  'estimator.formula.step2': 'Posisyon sa pila at araw-araw na rate',
  'estimator.formula.step3': 'Natitirang araw',
  'estimator.formula.explainAria': 'Ipaliwanag ang mga variable sa formula ng {title}',
  'estimator.formula.var.dRem.title': 'Natitirang Araw',
  'estimator.formula.var.dRem.description': 'Tinatayang bilang ng araw bago makumpleto ang pagproseso.',
  'estimator.formula.var.qPos.title': 'Posisyon sa Pila',
  'estimator.formula.var.qPos.description': 'Tinatayang posisyon sa pila ng pagproseso.',
  'estimator.formula.var.rDaily.title': 'Araw-araw na Rate',
  'estimator.formula.var.rDaily.description': 'Karaniwang bilang ng aplikasyong naiproseso kada araw.',
  'estimator.formula.var.cProc.title': 'Kumpirmadong Naiproseso',
  'estimator.formula.var.cProc.description': 'Kumpirmadong bilang ng aplikasyong naiproseso mula nang isumite.',
  'estimator.formula.var.eProc.title': 'Tinatayang Naiproseso',
  'estimator.formula.var.eProc.description': 'Tinatayang bilang ng aplikasyong naiproseso mula sa huling datos.',
  'estimator.formula.var.sigmaP.title': 'Kabuuang Naiproseso',
  'estimator.formula.var.sigmaP.description': 'Kabuuan ng naiprosesong aplikasyon na ginamit sa pagkalkula ng average.',
  'estimator.formula.var.sigmaD.title': 'Kabuuang Araw',
  'estimator.formula.var.sigmaD.description': 'Kabuuan ng araw na ginamit sa pagkalkula ng average.',
  'estimator.formula.var.qApp.title': 'Pila ng Aplikasyon',
  'estimator.formula.var.qApp.description': 'Tinatayang posisyon sa pila sa oras ng pagsumite.',
  'estimator.formula.var.cPrev.title': 'Dinalang Balanse',
  'estimator.formula.var.cPrev.description': 'Mga aplikasyong dinala mula sa nakaraang buwan.',
  'estimator.formula.var.nApp.title': 'Bagong Aplikasyon',
  'estimator.formula.var.nApp.description': 'Tinatayang aplikasyong natanggap bago ang pagsumite.',
  'estimator.formula.var.pApp.title': 'Naiprosesong Aplikasyon',
  'estimator.formula.var.pApp.description': 'Tinatayang aplikasyong naiproseso bago ang pagsumite.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': 'Pagtanggap at Pagproseso',
  'charts.intake.description':
    'Mga aplikasyong dinala mula sa nakaraan at natanggap kada buwan, laban sa dami na nakumpleto ng mga tanggapan.',
  'charts.intake.aria':
    'Stacked bars ng nakabinbin at natanggap na aplikasyon kada buwan, may naiprosesong dami bilang linya',
  'charts.types.label': 'Mga Uri ng Aplikasyon',
  'charts.types.description':
    'Buwanang bagong pagsusumite na hinati ayon sa uri ng aplikasyon — i-click ang isang entry sa legend para i-toggle ang isang serye.',
  'charts.types.aria': 'Line chart ng buwanang bagong pagsusumite kada uri ng aplikasyon',
  'charts.outcomes.label': 'Mga Resulta',
  'charts.outcomes.description':
    'Kung saan napupunta ang mga aplikasyon: ang daloy ng bawat uri patungo sa naaprubahan, tinanggihan, o iba pang resulta.',
  'charts.outcomes.aria': 'Sankey diagram ng mga uri ng aplikasyon na dumadaloy patungo sa mga resulta',
  'charts.share.label': 'Bahagi ng Tanggapan',
  'charts.share.description':
    'Kung saan isinumite ang mga aplikasyon: ang bahagi ng bawat tanggapan sa kabuuang natanggap.',
  'charts.share.aria': 'Donut chart ng bahagi ng bawat tanggapan sa mga natanggap na aplikasyon',
  'charts.mix.label': 'Halo ng Kategorya',
  'charts.mix.description':
    'Lahat ng aplikasyon ayon sa uri at tanggapan — i-click ang isang kategorya para mag-zoom sa breakdown nito.',
  'charts.efficiency.label': 'Kahusayan sa Pagproseso',
  'charts.efficiency.description':
    'Mga tanggapan na inayos ayon sa rate ng pagkumpleto — ang bigat ng stem ay kumakatawan sa dami ng natanggap, may pambansang rate bilang gabay.',
  'charts.efficiency.aria':
    'Mga tanggapan na inayos ayon sa rate ng pagkumpleto, may dami ng natanggap bilang bigat ng stem',
  'charts.map.label': 'Rehiyonal na Mapa',
  'charts.map.description':
    'Mga service area ng tanggapan at densidad ng populasyon, kasama ang lokasyon ng mga tanggapan at paliparan.',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': 'Sunburst ng mga aplikasyon ayon sa uri at tanggapan; interactive na drill-down',
  'charts.efficiencyQuadrant.aria':
    'Quadrant chart ng rate ng pagkumpleto laban sa natanggap na dami kada tanggapan; ang laki ng bubble ay nagpapakita ng naiprosesong dami',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': 'Ipakita ang {series}',
  'chart.legendHide': 'Itago ang {series}',
  'chart.allSeriesHidden': 'Nakatago ang lahat ng serye — i-click ang isang entry sa legend para magpakita ng isa.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': 'Pagkuha',
  'chart.types.series.extension': 'Ekstensyon',
  'chart.types.series.change': 'Pagbabago ng Katayuan',
  'chart.types.series.activity': 'Pahintulot sa Aktibidad',
  'chart.types.series.reentry': 'Muling Pagpasok',
  'chart.types.series.permanent': 'Permanenteng Paninirahan',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': 'Iba Pa / Binawi',
  'chart.outcomes.valueUnit': 'aplikasyon',
  'chart.outcomes.tooltipValueLabel': 'Mga Aplikasyon',
  'chart.outcomes.tooltipFlowLabel': 'Daloy',
  'chart.outcomes.approvalRate': 'Rate ng pag-apruba',
  'chart.outcomes.ofProcessed': 'sa {count} naiprosesong aplikasyon',
  'chart.outcomes.empty': 'Walang naiprosesong aplikasyon sa panahong ito.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': 'Iba Pa ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': 'Lahat ng aplikasyon',
  'chart.mix.breadcrumbAria': 'Landas ng drill-down ng treemap',
  'chart.mix.zoomInHint': 'I-click ang isang kategorya para mag-zoom in',
  'chart.mix.zoomOutHint': 'I-click ang background (o pindutin ang Esc) para mag-zoom out',
  'chart.mix.others': 'Iba Pa',
  'chart.mix.categoryAria': '{category}: {count} aplikasyon. Mag-zoom in.',
  'chart.mix.tooltipValue': '{count} aplikasyon · {percent} ng {scope}',
  'chart.mix.scopeAll': 'lahat ng aplikasyon',
  'chart.mix.sunburstHint': '{trail} — {count} aplikasyon ({percent} ng kabuuan)',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': 'sangay na tanggapan',
  'chart.efficiency.receivedCount': '{count} natanggap',
  'chart.efficiency.nationwide': 'Buong Bansa {rate}',
  'chart.efficiency.pointAria': '{bureau}: {rate} porsyentong pagkumpleto, {count} aplikasyong natanggap',
  'chart.efficiency.xAxis': 'Mga aplikasyong natanggap',
  'chart.efficiency.fullCompletion': '100% ng natanggap ay nakumpleto',
  'chart.efficiency.quadrantKeepingPace': 'MATAAS NA DAMI · NAKAKASABAY',
  'chart.efficiency.quadrantFallingBehind': 'MATAAS NA DAMI · NAHUHULI',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  'map.bureauMarkerAria': 'Tanggapan ng {bureau}',
  'map.airportMarkerAria': 'Tanggapan sa paliparan ng {bureau}',
  'map.bureauSuffix': 'Tanggapan ng {bureau}',
  'map.airportSuffix': 'Tanggapan sa Paliparan ng {bureau}',
  'map.servicePopulation': 'Populasyong sinisilbihan',
  'map.serviceArea': 'Sakop na lugar',
  'map.serviceBureau': 'Tanggapang naglilingkod',
  'map.portOfEntry': 'Tanggapan sa punto ng pagpasok',
  'map.legendNote': 'Kulay = tanggapang naglilingkod · intensity = densidad ng populasyon',
  'map.bureau': 'Tanggapan',
  'map.airportOffice': 'Tanggapan sa Paliparan',
  'map.loadError': 'Hindi ma-load ang datos ng mapa. Subukang i-reload ang page.',
  'map.loading': 'Ikinakarga ang Datos ng Mapa...',
  'map.areaValue': '{value} km²',
  'map.densityValue': '{value} /km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': 'Listahan ng Pagbabago',
  'changelog.loading': 'Ikinakarga...',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': 'Error sa Pag-load ng Datos',
  'errors.noData': 'Walang available na datos',
  'errors.unknown': 'Naganap ang hindi kilalang error',
  'errors.fetchFailed': 'Nabigong kunin ang datos',
  'errors.renderTitle': 'May Nangyaring Mali',
  'errors.renderBody': 'Naganap ang error habang niri-render ang application.',
  'errors.reload': 'I-reload ang Page',
  'errors.changelogUnavailable': 'Hindi ma-load ang listahan ng pagbabago.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': 'Ipinapakita ang {chart} para sa {bureau}',
  'a11y.showingChartWithType': 'Ipinapakita ang {chart} para sa {bureau}, {type}',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': 'Opisyal na estadistika mula sa Immigration Services Agency ng Japan',
  'footer.dataAcquisition': 'Pagkuha ng datos mula sa {source}',
  'footer.fixtureNotice': 'nagpapakita ng ginawang fixture data',
  'footer.builtBy': 'Ginawa ni {author}',
  'footer.dataUpdated': 'na-update ang datos noong {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Keyed by e-Stat bureau code, in three widths — the same shape the
  // application types use.
  //
  // `.short` is the terminal-style abbreviation; left as the Latin code, as in
  // every other Latin-script locale. `.compact` is the form the
  // width-constrained surfaces use: the efficiency chart's 92px label column,
  // the ring-chart legend, and the treemap's on-tile label. City-only bureaus
  // mirror the English/romanized city name, same as fr/es/de/it/pt — "Sapporo"
  // is "Sapporo" in Tagalog too. The four airport bureaus get a real Tagalog
  // phrase since it genuinely differs from English.
  'bureau.all': 'Buong Bansa',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': 'Buong Bansa',
  'bureau.101010': 'Sapporo',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': 'Sapporo',
  'bureau.101090': 'Sendai',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': 'Sendai',
  'bureau.101170': 'Shinagawa',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': 'Shinagawa',
  'bureau.101190': 'Paliparan ng Narita',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': 'Paliparan ng Narita',
  'bureau.101200': 'Paliparan ng Haneda',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': 'Paliparan ng Haneda',
  'bureau.101210': 'Yokohama',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': 'Yokohama',
  'bureau.101350': 'Nagoya',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': 'Nagoya',
  'bureau.101370': 'Paliparan ng Chubu',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': 'Paliparan ng Chubu',
  'bureau.101460': 'Osaka',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': 'Osaka',
  'bureau.101480': 'Paliparan ng Kansai',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': 'Paliparan ng Kansai',
  'bureau.101490': 'Kobe',
  'bureau.101490.short': 'UKB',
  'bureau.101490.compact': 'Kobe',
  'bureau.101580': 'Hiroshima',
  'bureau.101580.short': 'HIJ',
  'bureau.101580.compact': 'Hiroshima',
  'bureau.101670': 'Takamatsu',
  'bureau.101670.short': 'TAK',
  'bureau.101670.compact': 'Takamatsu',
  'bureau.101720': 'Fukuoka',
  'bureau.101720.short': 'FUK',
  'bureau.101720.compact': 'Fukuoka',
  'bureau.101740': 'Naha',
  'bureau.101740.short': 'OKA',
  'bureau.101740.compact': 'Naha',

  // ── Domain: application types ────────────────────────────────────────────
  // Keyed by e-Stat application type code. `.short` is the stat-tile
  // abbreviation, left as the Latin code. `.compact` is the one-word form the
  // narrow Sankey uses — kept deliberately short here, since Filipino affixing
  // tends to run longer than English and the Sankey does not truncate.
  'appType.all': 'Lahat ng Uri',
  'appType.all.short': 'ALL',
  'appType.all.compact': 'Lahat',
  'appType.10': 'Pagkuha ng Katayuan',
  'appType.10.short': 'ACQ',
  'appType.10.compact': 'Pagkuha',
  'appType.20': 'Pagpapalawig ng Pananatili',
  'appType.20.short': 'EXT',
  'appType.20.compact': 'Ekstensyon',
  'appType.30': 'Pagbabago ng Katayuan',
  'appType.30.short': 'CHG',
  'appType.30.compact': 'Pagbabago',
  'appType.40': 'Pahintulot para sa Aktibidad',
  'appType.40.short': 'ACT',
  'appType.40.compact': 'Permiso',
  'appType.50': 'Muling Pagpasok',
  'appType.50.short': 'RET',
  'appType.50.compact': 'Muling-Pasok',
  'appType.60': 'Permanenteng Paninirahan',
  'appType.60.short': 'PR',
  'appType.60.compact': 'Permanente',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code (1 Hokkaido … 47 Okinawa). Japanese proper
  // nouns romanize the same way in Tagalog as in English — "Hokkaido" stays
  // "Hokkaido" — matching how every other Latin-script locale handles them.
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

  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.label': 'Set ng datos',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': 'Piliin kung aling set ng datos ang tatanawin',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': 'Pagproseso ng aplikasyon',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': 'Pagproseso',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': 'Populasyon ng dayuhang naninirahan',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': 'Naninirahan',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': 'Hindi makuha sa ngayon ang datos tungkol sa dayuhang naninirahan.',
  'charts.growth.label': 'Paglago ng Populasyon',
  'charts.growth.description': 'Ang kabuuang bilang ng mga dayuhang residente kada kalahating taon, nakasalansan ayon sa layunin ng pananatili o ayon sa rehiyon ng mundo.',
  'charts.growth.aria': 'Stacked bar chart ng kabuuang dayuhang residente kada kalahating taon, hati ayon sa grupo ng status o rehiyon',
  'charts.origins.label': 'Pinagmulan sa paglipas ng panahon',
  'charts.origins.description':
    'Kung paano lumaki o lumiit ang pinakamalalaking nasyonalidad sa bawat kalahating taon na saklaw ng estadistika.',
  'charts.origins.aria':
    'Nakasalansang area chart ng bilang ng naninirahan ayon sa nasyonalidad sa paglipas ng panahon',
  'charts.flows.label': 'Mula Nasyonalidad Patungong Status',
  'charts.flows.description': 'Mula sa mga rehiyon ng mundo, dumadaan sa mga bansa, patungo sa layunin ng pananatili — pumili ng rehiyon o nasyonalidad para masundan ang profile nito.',
  'charts.flows.aria': 'Sankey diagram ng mga residenteng dumadaloy mula sa mga rehiyon ng mundo, dumadaan sa mga bansa, patungo sa mga kategorya ng residence status',
  'charts.statuses.label': 'Kabuuan ng katayuan sa paninirahan',
  'charts.statuses.description':
    'Anong visa ang hawak ng mga naninirahan, nakagrupo ayon sa layunin ng pananatili — pindutin ang isang grupo para lumawak.',
  'charts.statuses.aria': 'Sunburst chart ng mga residente ayon sa grupo ng residence status at bawat status',
  'charts.worldmap.label': 'Pinagmulan sa buong mundo',
  'charts.worldmap.description':
    'Saan nagmula ang mga dayuhang naninirahan sa Japan, may kulay ayon sa dami ng may hawak ng bawat nasyonalidad.',
  'charts.worldmap.aria': 'Mapa ng mundo na kinulayan ayon sa bilang ng naninirahan mula sa bawat bansang pinagmulan',
  'charts.movers.label': 'Pinakamalaking pagbabago',
  'charts.movers.description':
    'Ang pinakamalaking pagtaas at pagbaba sa pagitan ng dalawang panahon, ayon sa nasyonalidad o katayuan sa paninirahan.',
  'charts.movers.aria':
    'Magkasalungat na bar chart ng pinakamalaking pagtaas at pagbaba sa pagitan ng dalawang panahon',

  'filters.region': 'Rehiyon',
  'filters.allRegions': 'Lahat ng rehiyon',
  'filters.nationality': 'Nasyonalidad',
  'filters.residenceStatus': 'Katayuan sa paninirahan',
  'filters.allNationalities': 'Lahat ng nasyonalidad',
  'filters.allStatuses': 'Lahat ng katayuan',
  'filters.allCategories': 'Lahat ng kategorya',

  'period.snapshotLabel': 'Panahon ng snapshot',
  'period.latestPeriod': 'Pinakahuling panahon',
  'period.years_one': '{count} taon',
  'period.years_other': '{count} taon',

  'residents.total': 'Dayuhang naninirahan',
  'residents.total.short': 'Naninirahan',
  'residents.delta': '{delta} kumpara sa nakaraang kalahating taon',
  'residents.populationShare': 'Bahagi ng Populasyon',
  'residents.populationShare.short': 'Bahagi ng pop.',
  'residents.populationShareOf': 'ng {population} na tao ng Japan',
  'residents.topNationality': 'Pinakamalaking nasyonalidad',
  'residents.topNationality.short': 'Nangungunang bansa',
  'residents.topStatus': 'Pinakalaganap na katayuan',
  'residents.topStatus.short': 'Nangungunang status',
  'residents.share': '{share} ng kabuuan',
  'residents.scope': '{nationality} ({status})',
  'residents.otherNationalities': 'Iba pang nasyonalidad',
  'residents.noMapArea': 'May {count} nasyonalidad na walang teritoryo sa mapa kaya hindi nakukulayan.',
  'residents.legendScale': 'Naninirahan',
  'residents.discontinued': 'Nagtatapos ang serye sa {period}: pinagsama o pinalitan ng pangalan ang kategorya.',
  'residents.comparePeriod': 'kumpara sa {period}',
  'residents.byNationality': 'Ayon sa nasyonalidad',
  'residents.byStatus': 'Ayon sa katayuan sa paninirahan',
  'residents.increase': 'Pagtaas',
  'residents.decrease': 'Pagbaba',
  'residents.asOf': 'Sa {period}',
  'residents.noChange': 'Walang masusukat na pagbabago sa pagitan ng dalawang panahong ito.',
  'residents.coverageRange': '{from} – {to}',
  'residents.stackByGroup': 'Ayon sa layunin',
  'residents.stackByRegion': 'Ayon sa rehiyon',
  'residents.stackByNationality': 'Ayon sa nasyonalidad',
  'residents.growthTotal': 'Kabuuan',
  'residents.viewAbsolute': 'Bilang',
  'residents.viewIndexed': 'Paglago (indexed)',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': 'residente',
  'residents.flowsTooltipValueLabel': 'Mga residente',
  'residents.flowsTooltipFlowLabel': 'Daloy',
  'residents.sunburstHint': '{trail} — {count} residente ({percent} ng kabuuan)',
  'residents.markerSsw.title': 'Paglulunsad ng Specified Skilled Worker',
  'residents.markerSsw.description': 'Binuksan ng visa noong Abril 2019 ang mahigit isang dosenang industriya para sa mga skilled na dayuhang manggagawa.',
  'residents.markerCovid.title': 'Pagsasara ng border dahil sa COVID-19',
  'residents.markerCovid.description': 'Huminto ang mga bagong dating dahil sa entry restrictions; bumaba ang populasyon hanggang kalagitnaan ng 2022.',
  'residents.markerKoreaSplit.title': 'Paghahati ng estadistika ng Korea',
  'residents.markerKoreaSplit.description': 'Ang pinagsamang Korea ay naging magkahiwalay na serye ng South Korea at Korea (Chosen) — pagbabago sa pag-uulat, hindi sa populasyon.',

  'statusGroup.work': 'Trabaho',
  'statusGroup.training': 'Pagsasanay',
  'statusGroup.study': 'Pag-aaral',
  'statusGroup.family': 'Pamilya',
  'statusGroup.residency': 'Paninirahan',
  'statusGroup.other': 'Iba pa',
  // ── World regions. ICU is tried first, but Chrome ships no names for M49
  // macro-regions, so these are what actually renders there. ────────────────
  'region.1000': 'Asya',
  'region.2000': 'Europa',
  'region.3000': 'Africa',
  'region.4000': 'Hilagang Amerika',
  'region.5000': 'Timog Amerika',
  'region.6000': 'Oceania',
  'region.7000': 'Walang bansa',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'nationality.1120': 'Korea (rehistrong Chosen)',
  'nationality.1130': 'Korea (pinagsama)',
  'nationality.2290': 'Serbia at Montenegro',
  'nationality.2500': 'Yugoslavya',
  'nationality.7000': 'Walang bansa',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': 'Kabuuan',
  'status.1040': 'Propesor',
  'status.1050': 'Artista',
  'status.1060': 'Gawaing panrelihiyon',
  'status.1070': 'Mamamahayag',
  'status.1080': 'Propesyonal na may mataas na kasanayan',
  'status.1090': 'Propesyonal na may mataas na kasanayan (i)(a)',
  'status.1100': 'Propesyonal na may mataas na kasanayan (i)(b)',
  'status.1110': 'Propesyonal na may mataas na kasanayan (i)(c)',
  'status.1120': 'Propesyonal na may mataas na kasanayan (ii)',
  'status.1130': 'Namumuhunan / tagapamahala ng negosyo',
  'status.1140': 'Tagapamahala ng negosyo',
  'status.1150': 'Serbisyong legal at accounting',
  'status.1160': 'Serbisyong medikal',
  'status.1170': 'Mananaliksik',
  'status.1180': 'Guro',
  'status.1190': 'Inhinyero',
  'status.1200': 'Espesyalista sa humanidades / internasyonal na serbisyo',
  'status.1210': 'Inhinyero / humanidades / internasyonal na serbisyo',
  'status.1220': 'Paglipat sa loob ng kompanya',
  'status.1230': 'Pag-aalaga ng maysakit',
  'status.1240': 'Mang-aaliw',
  'status.1250': 'Bihasang manggagawa',
  'status.1260': 'Manggagawang may tiyak na kasanayan',
  'status.1270': 'Manggagawang may tiyak na kasanayan (i)',
  'status.1280': 'Manggagawang may tiyak na kasanayan (ii)',
  'status.1290': 'Teknikal na pagsasanay ng intern',
  'status.1300': 'Teknikal na pagsasanay ng intern (i)(a)',
  'status.1310': 'Teknikal na pagsasanay ng intern (i)(b)',
  'status.1320': 'Teknikal na pagsasanay ng intern (ii)(a)',
  'status.1330': 'Teknikal na pagsasanay ng intern (ii)(b)',
  'status.1340': 'Teknikal na pagsasanay ng intern (iii)(a)',
  'status.1350': 'Teknikal na pagsasanay ng intern (iii)(b)',
  'status.1360': 'Gawaing pangkultura',
  'status.1380': 'Mag-aaral',
  'status.1400': 'Nagsasanay',
  'status.1410': 'Umaasang kapamilya',
  'status.1420': 'Itinakdang gawain',
  'status.1430': 'Permanenteng residente',
  'status.1440': 'Asawa o anak ng mamamayang Hapon',
  'status.1450': 'Asawa o anak ng permanenteng residente',
  'status.1460': 'Pangmatagalang residente',
  'status.1470': 'Espesyal na permanenteng residente',
  'residents.mixRoot': 'Lahat ng naninirahan',
  'residents.mixScopeAll': 'lahat ng naninirahan',
  'residents.mixCategoryAria': '{category}: {count} naninirahan. Palakihin.',
  'residents.mixTooltipValue': '{count} naninirahan · {percent} ng {scope}',
};
