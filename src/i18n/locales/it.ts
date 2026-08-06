// src/i18n/locales/it.ts
// Italian overrides. Complete: every key English defines has an Italian
// translation.
//
// Italian shares English's two CLDR cardinal plural categories (`one` for
// exactly 1, `other` for everything else), so every plural family below
// translates both members naturally rather than mechanically inflecting the
// singular.
import type { Dictionary } from '../types';

export const it: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': "Statistiche sull'immigrazione in Giappone",
  'app.subtitle': 'Dati di elaborazione degli uffici forniti da e-Stat, aggiornati a ogni pubblicazione',
  'app.skipToContent': 'Vai al contenuto',
  'app.loadingData': "Elaborazione dei dati sull'immigrazione...",
  'app.loadingDashboard': 'Caricamento della dashboard...',
  'app.retry': 'Riprova',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  'meta.title': "Dashboard delle statistiche sull'immigrazione in Giappone",
  'meta.description':
    "Tempi di elaborazione dei visti, carico di lavoro degli uffici e uno stimatore basato su modello di coda per la propria domanda, costruito sulle statistiche ufficiali dell'Agenzia per i Servizi dell'Immigrazione, aggiornato ogni volta che e-Stat pubblica nuovi dati (generalmente ogni mese).",
  'meta.keywords':
    "tempi di elaborazione dei visti in Giappone, statistiche degli uffici immigrazione, tracciamento domande di visto, Agenzia per i Servizi dell'Immigrazione, e-Stat",

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': 'Lingua',
  'nav.switchToLightTheme': 'Passa al tema chiaro',
  'nav.switchToDarkTheme': 'Passa al tema scuro',
  'nav.openSettings': 'Apri il menu delle impostazioni',
  'nav.settings': 'Impostazioni',
  'nav.theme': 'Tema',
  'nav.themeLight': 'Chiaro',
  'nav.themeDark': 'Scuro',
  'nav.about': 'Informazioni',
  'nav.changelog': 'Registro delle modifiche',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': 'Dati: {range}',
  'dashboard.coverageRange': '{from} – {to}',
  'dashboard.comparisonSuffix': '(confronto)',
  'dashboard.expandEstimator': 'Espandi lo stimatore dei tempi di elaborazione',
  'dashboard.estimatorRail': 'Stimatore',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': 'Ufficio immigrazione',
  'filters.appType': 'Tipo di domanda',
  'filters.compare': 'Confronta con',
  'filters.compareNone': 'Nessuno',
  'filters.excludeAirports': 'Escludi gli uffici aeroportuali',
  'filters.includeAirports': 'Includi gli uffici aeroportuali',
  'filters.reset': 'Reimposta i filtri',
  'filters.selectPlaceholder': 'Seleziona',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': 'Intervallo di tempo',
  'period.latest': 'Ultimo mese',
  'period.all': 'Tutti i dati',
  'period.months_one': '{count} mese',
  'period.months_other': '{count} mesi',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': 'Domande totali',
  'stats.totalApplications.short': 'Totale',
  'stats.pending': 'In attesa',
  'stats.granted': 'Concesse',
  'stats.denied': 'Respinte',
  'stats.approvalRate': 'Tasso di approvazione',
  'stats.approvalRate.short': 'Approvazione',
  'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '{delta} m/m',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': 'Riportate',
  'metric.pending': 'In attesa (riportate)',
  'metric.received': 'Ricevute',
  'metric.processed': 'Elaborate',
  'metric.granted': 'Concesse',
  'metric.denied': 'Respinte',
  'metric.other': 'Altro',
  'metric.completion': 'Completamento',
  'metric.applications': 'Domande',
  'metric.population': 'Popolazione',
  'metric.area': 'Superficie',
  'metric.density': 'Densità',
  'common.noDataForFilters': 'Nessun dato per questa combinazione di filtri.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'Visualizza tabella dati',
  'table.hide': 'Nascondi tabella dati',
  'table.downloadCsv': 'Scarica CSV',
  'table.caption': 'Statistiche mensili delle domande per {bureau}',
  'table.month': 'Mese',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Stimatore dei tempi di elaborazione',
  'estimator.description':
    'Stima basata su un modello di coda calcolata sugli ultimi sei mesi di produttività degli uffici.',
  'estimator.selectBureau': 'Seleziona ufficio',
  'estimator.selectType': 'Seleziona tipo',
  'estimator.applicationDate': 'Data della domanda',
  'estimator.empty':
    'Seleziona il tuo ufficio, il tipo di domanda e la data di presentazione per stimare quando la tua domanda sarà elaborata.',
  'estimator.estimatedCompletion': 'Completamento stimato',
  'estimator.queuePosition': 'Posizione in coda',
  'estimator.aheadOfYou': '≈ {count} davanti a te',
  'estimator.howCalculated': 'Come viene calcolato?',
  'estimator.showMath': 'Mostra i calcoli',
  'estimator.hideMath': 'Nascondi i calcoli',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': 'Reimposta lo stimatore',
  'estimator.resetAria': 'Reimposta lo stimatore dei tempi di elaborazione',
  'estimator.collapse': 'Comprimi lo stimatore',
  'estimator.collapseAria': 'Comprimi lo stimatore dei tempi di elaborazione',
  'estimator.close': 'Chiudi lo stimatore',
  'estimator.closeAria': 'Chiudi lo stimatore dei tempi di elaborazione',
  'estimator.copyPermalink': 'Copia un link permanente a questa stima',
  'estimator.copied': 'Copiato!',
  // Result note, joined with " · ".
  'estimator.uncertaintyDays_one': '± {count} giorno',
  'estimator.uncertaintyDays_other': '± {count} giorni',
  'estimator.uncertaintyWeeks_one': '± {count} settimana',
  'estimator.uncertaintyWeeks_other': '± {count} settimane',
  'estimator.basedOnMonths_one': 'basato su {count} mese di produttività',
  'estimator.basedOnMonths_other': 'basato su {count} mesi di produttività',
  // Warnings.
  'estimator.limitedDataTitle': 'Stima con dati limitati:',
  'estimator.limitedDataBody_one':
    'La data della tua domanda va oltre i dati disponibili. Questa stima si basa su tassi di elaborazione simulati a partire da {count} mese di dati storici e potrebbe essere meno accurata.',
  'estimator.limitedDataBody_other':
    'La data della tua domanda va oltre i dati disponibili. Questa stima si basa su tassi di elaborazione simulati a partire da {count} mesi di dati storici e potrebbe essere meno accurata.',
  'estimator.pastDueTitle': 'Possibile ritardo:',
  'estimator.pastDueBody':
    "In base ai tassi di elaborazione previsti, il completamento di questa domanda potrebbe essere in ritardo. Se non hai ancora ricevuto richieste aggiuntive e/o una decisione su questa domanda, contatta l'ufficio per maggiori informazioni.",
  // {emphasis} is the word "estimate", rendered bold and underlined.
  'estimator.disclaimer':
    '*Questa è una {emphasis} basata sui tassi di elaborazione attuali, sulla posizione prevista in coda e sulle domande in attesa. Il tempo di elaborazione effettivo della tua domanda può variare.',
  'estimator.disclaimerEmphasis': 'stima',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': 'Coda al momento della domanda',
  'estimator.formula.step2': 'Posizione in coda e tasso giornaliero',
  'estimator.formula.step3': 'Giorni rimanenti',
  'estimator.formula.explainAria': 'Spiega le variabili della formula {title}',
  'estimator.formula.var.dRem.title': 'Giorni rimanenti',
  'estimator.formula.var.dRem.description': "Giorni stimati fino al completamento dell'elaborazione.",
  'estimator.formula.var.qPos.title': 'Posizione in coda',
  'estimator.formula.var.qPos.description': 'Posizione stimata nella coda di elaborazione.',
  'estimator.formula.var.rDaily.title': 'Tasso giornaliero',
  'estimator.formula.var.rDaily.description': 'Numero medio di domande elaborate al giorno.',
  'estimator.formula.var.cProc.title': 'Elaborate confermate',
  'estimator.formula.var.cProc.description': 'Numero confermato di domande elaborate dalla presentazione.',
  'estimator.formula.var.eProc.title': 'Elaborate stimate',
  'estimator.formula.var.eProc.description': "Numero stimato di domande elaborate dall'ultimo dato disponibile.",
  'estimator.formula.var.sigmaP.title': 'Totale elaborate',
  'estimator.formula.var.sigmaP.description': 'Somma delle domande elaborate usata per calcolare le medie.',
  'estimator.formula.var.sigmaD.title': 'Totale giorni',
  'estimator.formula.var.sigmaD.description': 'Somma dei giorni usata per calcolare le medie.',
  'estimator.formula.var.qApp.title': 'Coda delle domande',
  'estimator.formula.var.qApp.description': 'Posizione stimata in coda al momento della presentazione.',
  'estimator.formula.var.cPrev.title': 'Riportate',
  'estimator.formula.var.cPrev.description': 'Domande riportate dal mese precedente.',
  'estimator.formula.var.nApp.title': 'Nuove domande',
  'estimator.formula.var.nApp.description': 'Domande stimate ricevute prima della presentazione.',
  'estimator.formula.var.pApp.title': 'Domande elaborate',
  'estimator.formula.var.pApp.description': 'Domande stimate elaborate prima della presentazione.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': 'Ricezione ed elaborazione',
  'charts.intake.description':
    'Domande riportate e ricevute ogni mese, a confronto con il volume completato dagli uffici.',
  'charts.intake.aria':
    'Barre impilate delle domande in attesa e ricevute per mese, con il volume elaborato rappresentato da una linea',
  'charts.types.label': 'Tipi di domanda',
  'charts.types.description':
    'Nuove domande mensili suddivise per tipo — fai clic su una voce della legenda per attivare o disattivare una serie.',
  'charts.types.aria': 'Grafico a linee delle nuove domande mensili per tipo di domanda',
  'charts.outcomes.label': 'Esiti',
  'charts.outcomes.description':
    'Dove finiscono le domande: il flusso di ciascun tipo verso concessione, diniego o altri esiti.',
  'charts.outcomes.aria': 'Diagramma di Sankey dei tipi di domanda che confluiscono negli esiti',
  'charts.share.label': 'Quota per ufficio',
  'charts.share.description': 'Dove sono state presentate le domande: la quota di ciascun ufficio sul totale ricevuto.',
  'charts.share.aria': 'Grafico a ciambella della quota di domande ricevute per ciascun ufficio',
  'charts.mix.label': 'Composizione per categoria',
  'charts.mix.description':
    'Tutte le domande per tipo e ufficio — fai clic su una categoria per ingrandire la sua suddivisione.',
  'charts.efficiency.label': 'Efficienza di elaborazione',
  'charts.efficiency.description':
    'Uffici classificati per tasso di completamento — lo spessore dello stelo indica il volume ricevuto, con il tasso nazionale come riferimento.',
  'charts.efficiency.aria':
    'Uffici classificati per tasso di completamento, con il volume ricevuto rappresentato dallo spessore dello stelo',
  'charts.map.label': 'Mappa regionale',
  'charts.map.description':
    'Aree di competenza degli uffici e densità di popolazione, con la posizione degli uffici e degli uffici aeroportuali.',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': 'Grafico a sunburst delle domande per tipo e ufficio, con esplorazione interattiva',
  'charts.efficiencyQuadrant.aria':
    'Grafico a quadranti del tasso di completamento rispetto al volume ricevuto per ufficio; la dimensione delle bolle indica il volume elaborato',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': 'Mostra {series}',
  'chart.legendHide': 'Nascondi {series}',
  'chart.allSeriesHidden': 'Tutte le serie sono nascoste — fai clic su una voce della legenda per mostrarne una.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': 'Acquisizione',
  'chart.types.series.extension': 'Proroga',
  'chart.types.series.change': 'Cambio di status',
  'chart.types.series.activity': 'Permesso di attività',
  'chart.types.series.reentry': 'Reingresso',
  'chart.types.series.permanent': 'Residenza permanente',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': 'Altro / Ritirata',
  'chart.outcomes.valueUnit': 'domande',
  'chart.outcomes.tooltipValueLabel': 'Domande',
  'chart.outcomes.tooltipFlowLabel': 'Flusso',
  'chart.outcomes.approvalRate': 'Approvazione',
  'chart.outcomes.ofProcessed': 'su {count} domande elaborate',
  'chart.outcomes.empty': 'Nessuna domanda elaborata in questo periodo.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': 'Altro ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': 'Tutte le domande',
  'chart.mix.breadcrumbAria': 'Percorso di esplorazione della treemap',
  'chart.mix.zoomInHint': 'Fai clic su una categoria per ingrandire',
  'chart.mix.zoomOutHint': 'Fai clic sullo sfondo (o premi Esc) per rimpicciolire',
  'chart.mix.others': 'Altri',
  'chart.mix.categoryAria': '{category}: {count} domande. Ingrandisci.',
  'chart.mix.tooltipValue': '{count} domande · {percent} di {scope}',
  'chart.mix.scopeAll': 'tutte le domande',
  'chart.mix.sunburstHint': '{trail} — {count} domande ({percent} del totale)',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': 'ufficio distaccato',
  'chart.efficiency.receivedCount': '{count} ricevute',
  'chart.efficiency.nationwide': 'Nazionale {rate}',
  'chart.efficiency.pointAria': '{bureau}: {rate} per cento di completamento, {count} domande ricevute',
  'chart.efficiency.xAxis': 'Domande ricevute',
  'chart.efficiency.fullCompletion': '100% delle domande ricevute completato',
  'chart.efficiency.quadrantKeepingPace': 'VOLUME ELEVATO · AL PASSO',
  'chart.efficiency.quadrantFallingBehind': 'VOLUME ELEVATO · IN RITARDO',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  'map.bureauMarkerAria': 'Ufficio {bureau}',
  'map.airportMarkerAria': 'Ufficio aeroportuale {bureau}',
  'map.bureauSuffix': 'Ufficio di {bureau}',
  'map.airportSuffix': 'Ufficio aeroportuale di {bureau}',
  'map.servicePopulation': 'Popolazione servita',
  'map.serviceArea': 'Area di competenza',
  'map.serviceBureau': 'Ufficio competente',
  'map.portOfEntry': 'Ufficio di frontiera',
  'map.legendNote': 'Colore = ufficio competente · intensità = densità di popolazione',
  'map.bureau': 'Ufficio',
  'map.airportOffice': 'Ufficio aeroportuale',
  'map.zoomIn': 'Ingrandisci',
  'map.zoomOut': 'Rimpicciolisci',
  'map.resetView': 'Reimposta vista',
  'map.loadError': 'Impossibile caricare i dati della mappa. Prova a ricaricare la pagina.',
  'map.loading': 'Caricamento dei dati della mappa...',
  'map.areaValue': '{value} km²',
  'map.densityValue': '{value} /km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': 'Registro delle modifiche',
  'changelog.loading': 'Caricamento...',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': 'Errore nel caricamento dei dati',
  'errors.noData': 'Nessun dato disponibile',
  'errors.unknown': 'Si è verificato un errore sconosciuto',
  'errors.fetchFailed': 'Recupero dei dati non riuscito',
  'errors.renderTitle': 'Qualcosa è andato storto',
  'errors.renderBody': "Si è verificato un errore durante il rendering dell'applicazione.",
  'errors.reload': 'Ricarica pagina',
  'errors.changelogUnavailable': 'Impossibile caricare il registro delle modifiche.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': 'Visualizzazione di {chart} per {bureau}',
  'a11y.showingChartWithType': 'Visualizzazione di {chart} per {bureau}, {type}',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': "Statistiche ufficiali fornite dall'Agenzia per i Servizi dell'Immigrazione del Giappone",
  'footer.dataAcquisition': 'Acquisizione dati fornita da {source}',
  'footer.fixtureNotice': 'visualizzazione di dati di esempio generati',
  'footer.builtBy': 'Realizzato da {author}',
  'footer.dataUpdated': 'dati aggiornati al {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Keyed by e-Stat bureau code. `.short` is the terminal-style abbreviation
  // shown on the stat tiles; kept as the Latin/IATA-style code.
  'bureau.all': 'Nazionale',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': 'Nazionale',
  'bureau.101010': 'Sapporo',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': 'Sapporo',
  'bureau.101090': 'Sendai',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': 'Sendai',
  'bureau.101170': 'Shinagawa',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': 'Shinagawa',
  'bureau.101190': 'Aeroporto di Narita',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': 'Aeroporto di Narita',
  'bureau.101200': 'Aeroporto di Haneda',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': 'Aeroporto di Haneda',
  'bureau.101210': 'Yokohama',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': 'Yokohama',
  'bureau.101350': 'Nagoya',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': 'Nagoya',
  'bureau.101370': 'Aeroporto del Chubu',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': 'Aeroporto del Chubu',
  'bureau.101460': 'Osaka',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': 'Osaka',
  'bureau.101480': 'Aeroporto del Kansai',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': 'Aeroporto del Kansai',
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
  // abbreviation; `.compact` is the one-word form the narrow Sankey uses.
  'appType.all': 'Tutti i tipi',
  'appType.all.short': 'TUTTI',
  'appType.all.compact': 'Tutti',
  'appType.10': 'Acquisizione di status',
  'appType.10.short': 'ACQ',
  'appType.10.compact': 'Acquisizione',
  'appType.20': 'Proroga di soggiorno',
  'appType.20.short': 'PRO',
  'appType.20.compact': 'Proroga',
  'appType.30': 'Cambio di status',
  'appType.30.short': 'CAM',
  'appType.30.compact': 'Cambio',
  'appType.40': 'Permesso di attività',
  'appType.40.short': 'ATT',
  'appType.40.compact': 'Permesso',
  'appType.50': 'Reingresso',
  'appType.50.short': 'REI',
  'appType.50.compact': 'Reingresso',
  'appType.60': 'Residenza permanente',
  'appType.60.short': 'RP',
  'appType.60.compact': 'Permanente',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code (1 Hokkaido … 47 Okinawa). Prefecture names
  // are romanized proper nouns and keep the same spelling in Italian.
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
  'dataset.label': 'Set di dati',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': 'Scegli quale set di dati esplorare',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': 'Trattazione delle domande',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': 'Trattazione',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': 'Popolazione straniera residente',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': 'Residenti',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': 'I dati sulla popolazione straniera residente non sono al momento disponibili.',
  'charts.origins.label': 'Origini nel tempo',
  'charts.origins.description':
    'Come sono cresciute o diminuite le principali cittadinanze in ciascun semestre coperto dalle statistiche.',
  'charts.origins.aria': 'Grafico ad aree impilate del numero di residenti per cittadinanza nel tempo',
  'charts.statuses.label': 'Composizione dei permessi di soggiorno',
  'charts.statuses.description':
    'Quali permessi possiedono i residenti, raggruppati per finalità del soggiorno: fai clic su un gruppo per aprirlo.',
  'charts.statuses.aria': 'Treemap dei residenti per gruppo di permessi e per singolo permesso',
  'charts.worldmap.label': 'Origini nel mondo',
  'charts.worldmap.description':
    'Da dove provengono i residenti stranieri in Giappone, con sfumature in base a quanti hanno ciascuna cittadinanza.',
  'charts.worldmap.aria': 'Mappa del mondo sfumata in base al numero di residenti per paese di origine',
  'charts.movers.label': 'Variazioni maggiori',
  'charts.movers.description':
    'Gli aumenti e i cali più marcati fra due periodi, per cittadinanza o per permesso di soggiorno.',
  'charts.movers.aria': 'Grafico a barre divergenti degli aumenti e dei cali maggiori fra due periodi',

  'filters.nationality': 'Cittadinanza / Regione',
  'filters.residenceStatus': 'Permesso di soggiorno',
  'filters.allNationalities': 'Tutte le cittadinanze',
  'filters.allStatuses': 'Tutti i permessi',

  'period.latestPeriod': 'Ultimo periodo',
  'period.years_one': '{count} anno',
  'period.years_other': '{count} anni',

  'residents.total': 'Residenti stranieri',
  'residents.total.short': 'Residenti',
  'residents.delta': '{delta} rispetto al semestre precedente',
  'residents.topNationality': 'Cittadinanza più numerosa',
  'residents.topStatus': 'Permesso più diffuso',
  'residents.share': '{share} del totale',
  'residents.scope': '{nationality} ({status})',
  'residents.otherNationalities': 'Altre cittadinanze',
  'residents.noMapArea': '{count} cittadinanze non hanno un territorio sulla mappa e restano non colorate.',
  'residents.legendScale': 'Residenti',
  'residents.discontinued': 'La serie si interrompe nel {period}: la categoria è stata accorpata o rinominata.',
  'residents.comparePeriod': 'rispetto a {period}',
  'residents.byNationality': 'Per cittadinanza',
  'residents.byStatus': 'Per permesso di soggiorno',
  'residents.increase': 'Aumento',
  'residents.decrease': 'Calo',
  'residents.asOf': 'Al {period}',
  'residents.noChange': 'Nessuna variazione apprezzabile fra questi due periodi.',
  'residents.coverageRange': '{from} – {to}',

  'statusGroup.work': 'Lavoro',
  'statusGroup.training': 'Tirocinio',
  'statusGroup.study': 'Studio',
  'statusGroup.family': 'Famiglia',
  'statusGroup.residency': 'Residenza',
  'statusGroup.other': 'Altro',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'region.7000': 'Apolide',
  'nationality.1120': 'Corea (Chosen)',
  'nationality.1130': 'Corea (aggregata)',
  'nationality.2290': 'Serbia e Montenegro',
  'nationality.2500': 'Iugoslavia',
  'nationality.7000': 'Apolide',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': 'Totale',
  'status.1040': 'Professore universitario',
  'status.1050': 'Artista',
  'status.1060': 'Attività religiose',
  'status.1070': 'Giornalista',
  'status.1080': 'Professionista altamente qualificato',
  'status.1090': 'Professionista altamente qualificato (i)(a)',
  'status.1100': 'Professionista altamente qualificato (i)(b)',
  'status.1110': 'Professionista altamente qualificato (i)(c)',
  'status.1120': 'Professionista altamente qualificato (ii)',
  'status.1130': 'Investitore / amministratore d’impresa',
  'status.1140': 'Gestione d’impresa',
  'status.1150': 'Servizi legali e contabili',
  'status.1160': 'Servizi medici',
  'status.1170': 'Ricerca',
  'status.1180': 'Insegnante',
  'status.1190': 'Ingegneria',
  'status.1200': 'Specialista in discipline umanistiche / servizi internazionali',
  'status.1210': 'Ingegneria / discipline umanistiche / servizi internazionali',
  'status.1220': 'Trasferimento infragruppo',
  'status.1230': 'Assistenza sanitaria',
  'status.1240': 'Artista di spettacolo',
  'status.1250': 'Lavoro specializzato',
  'status.1260': 'Lavoratore con competenze specificate',
  'status.1270': 'Lavoratore con competenze specificate (i)',
  'status.1280': 'Lavoratore con competenze specificate (ii)',
  'status.1290': 'Tirocinio tecnico',
  'status.1300': 'Tirocinio tecnico (i)(a)',
  'status.1310': 'Tirocinio tecnico (i)(b)',
  'status.1320': 'Tirocinio tecnico (ii)(a)',
  'status.1330': 'Tirocinio tecnico (ii)(b)',
  'status.1340': 'Tirocinio tecnico (iii)(a)',
  'status.1350': 'Tirocinio tecnico (iii)(b)',
  'status.1360': 'Attività culturali',
  'status.1380': 'Studente',
  'status.1400': 'Apprendista',
  'status.1410': 'Familiare a carico',
  'status.1420': 'Attività designate',
  'status.1430': 'Residente permanente',
  'status.1440': 'Coniuge o figlio di cittadino giapponese',
  'status.1450': 'Coniuge o figlio di residente permanente',
  'status.1460': 'Residente di lungo periodo',
  'status.1470': 'Residente permanente speciale',
  'residents.mixRoot': 'Tutti i residenti',
  'residents.mixScopeAll': 'tutti i residenti',
  'residents.mixCategoryAria': '{category}: {count} residenti. Ingrandisci.',
  'residents.mixTooltipValue': '{count} residenti · {percent} di {scope}',
};
