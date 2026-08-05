// src/i18n/locales/zh-tw.ts
// Traditional Chinese (Taiwan/Hong Kong) catalogue — complete coverage of the
// English source.
//
// Conventions, kept deliberately consistent so the file reads as one voice:
//
// - Concise, label-style phrasing for anything that names a control: buttons,
//   tabs, filter labels, column headers, stat-tile titles. Fuller sentences
//   for anything that speaks to the reader: explanatory prose, warnings,
//   empty and error states.
// - Japan's own immigration terminology, written in Traditional characters:
//   出入國在留管理廳, 出入國在留管理局, 在留資格, 分局 for a 支局. Application
//   types keep the agency's own procedure names.
// - Full-width punctuation for CJK prose (：（）、。), no space between a
//   number and a Chinese unit.
// - Chinese has a single CLDR plural category, so plural families define only
//   their `_other` member. `Intl.PluralRules('zh-TW')` never selects anything
//   else, and translate.ts falls back to `_other` regardless.
//
// A few values are intentionally identical to English: `nav.version` is a
// version number, and `bureau.*.short` are IATA-style codes that stay Latin
// in every language (see the note in en.ts). `map.areaValue` and
// `map.densityValue` carry nothing but an SI unit symbol.
//
// Prefecture and bureau names are genuinely translated rather than
// romanized: Japanese place names use the same or near-identical characters
// in Traditional Chinese (北海道, 東京), so the convention is to use that
// Traditional Chinese form directly rather than the English romanization —
// e.g. 廣島, not "Hiroshima". Where Japanese shinjitai forms exist (広→廣,
// 神奈川県 の 県→縣, 沖縄→沖繩), this file uses the Traditional Chinese form,
// not a literal copy of the Japanese orthography.
import type { Dictionary } from '../types';

export const zhTw: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': '日本入國管理統計',
  'app.subtitle': '出入國管理局處理數據，來自 e-Stat，隨每次發布更新',
  'app.skipToContent': '跳至主要內容',
  'app.loadingData': '正在整理入國管理統計資料…',
  'app.loadingDashboard': '儀表板載入中…',
  'app.retry': '重試',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  'meta.title': '日本入國管理統計儀表板',
  'meta.description':
    '簽證審查期間、各出入國管理局的工作量，以及針對您個人申請的排隊模型預估——根據出入國在留管理廳的官方統計資料建置，並隨 e-Stat 發布新資料（通常為每月）更新。',
  'meta.keywords': '日本簽證審查期間, 出入國管理局統計, 簽證申請追蹤, 出入國在留管理廳, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': '語言',
  'nav.switchToLightTheme': '切換為淺色主題',
  'nav.switchToDarkTheme': '切換為深色主題',
  'nav.openSettings': '開啟設定選單',
  'nav.settings': '設定',
  'nav.theme': '主題',
  'nav.themeLight': '淺色',
  'nav.themeDark': '深色',
  'nav.about': '關於',
  'nav.changelog': '更新日誌',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': '資料範圍：{range}',
  'dashboard.coverageRange': '{from} 至 {to}',
  'dashboard.comparisonSuffix': '（比較）',
  'dashboard.expandEstimator': '展開審查期間預估工具',
  'dashboard.estimatorRail': '預估工具',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': '出入國管理局',
  'filters.appType': '申請類型',
  'filters.compare': '比較對象',
  'filters.compareNone': '無',
  'filters.excludeAirports': '排除機場分局',
  'filters.includeAirports': '包含機場分局',
  'filters.reset': '重設篩選條件',
  'filters.selectPlaceholder': '請選擇',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': '時間範圍',
  'period.latest': '最新月份',
  'period.all': '所有資料',
  // 'period.months_one': '{count} month',
  'period.months_other': '{count} 個月',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': '申請總數',
  'stats.totalApplications.short': '總數',
  'stats.pending': '待處理',
  'stats.granted': '核准',
  'stats.denied': '不核准',
  'stats.approvalRate': '核准率',
  'stats.approvalRate.short': '核准率',
  'stats.scopeWithType': '{bureau}（{type}）',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '較上月 {delta}',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': '結轉',
  'metric.pending': '待處理（結轉）',
  'metric.received': '受理',
  'metric.processed': '已處理',
  'metric.granted': '核准',
  'metric.denied': '不核准',
  'metric.other': '其他',
  'metric.completion': '處理完成率',
  'metric.applications': '申請數',
  'metric.population': '人口',
  'metric.area': '面積',
  'metric.density': '人口密度',
  'common.noDataForFilters': '此篩選條件組合沒有資料。',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': '顯示資料表',
  'table.hide': '隱藏資料表',
  'table.downloadCsv': '下載 CSV',
  'table.caption': '{bureau}的每月申請統計',
  'table.month': '月份',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': '審查期間預估工具',
  'estimator.description': '根據過去六個月管理局處理量所建立的排隊模型預估結果。',
  'estimator.selectBureau': '選擇管理局',
  'estimator.selectType': '選擇申請類型',
  'estimator.applicationDate': '申請日期',
  'estimator.empty': '請選擇管理局、申請類型與申請日期，以預估您的申請何時會處理完成。',
  'estimator.estimatedCompletion': '預估完成時間',
  'estimator.queuePosition': '排隊位置',
  'estimator.aheadOfYou': '約有 {count} 件排在您之前',
  'estimator.howCalculated': '這是如何計算的？',
  'estimator.showMath': '顯示計算過程',
  'estimator.hideMath': '隱藏計算過程',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': '重設預估工具',
  'estimator.resetAria': '重設審查期間預估工具',
  'estimator.collapse': '收合預估工具',
  'estimator.collapseAria': '收合審查期間預估工具',
  'estimator.close': '關閉預估工具',
  'estimator.closeAria': '關閉審查期間預估工具',
  'estimator.copyPermalink': '複製此預估結果的永久連結',
  'estimator.copied': '已複製！',
  // Result note, joined with " · ".
  // 'estimator.uncertaintyDays_one': '± {count} day',
  'estimator.uncertaintyDays_other': '±{count} 天',
  // 'estimator.uncertaintyWeeks_one': '± {count} week',
  'estimator.uncertaintyWeeks_other': '±{count} 週',
  // 'estimator.basedOnMonths_one': 'based on {count} month of throughput',
  'estimator.basedOnMonths_other': '根據 {count} 個月的處理量',
  // Warnings.
  'estimator.limitedDataTitle': '以有限資料預估：',
  // 'estimator.limitedDataBody_one':
  //   'Your application date is beyond available data. This estimate is based on simulated processing rates from {count} month of historical data and may be less accurate.',
  'estimator.limitedDataBody_other':
    '您的申請日期超出現有資料範圍。此預估是根據 {count} 個月歷史資料模擬的處理速度所得出，準確度可能較低。',
  'estimator.pastDueTitle': '可能已逾期：',
  'estimator.pastDueBody':
    '根據預期的處理速度，此申請的完成時間可能已經逾期。如果您尚未收到補件通知或審查結果，請聯繫該管理局以取得更多資訊。',
  // {emphasis} is the word "estimate", rendered bold and underlined.
  'estimator.disclaimer':
    '＊這是根據目前處理速度、預估排隊位置與待處理申請量所得出的{emphasis}。您實際申請的處理時間可能有所不同。',
  'estimator.disclaimerEmphasis': '預估值',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': '申請時的排隊人數',
  'estimator.formula.step2': '排隊位置與每日處理速度',
  'estimator.formula.step3': '剩餘天數',
  'estimator.formula.explainAria': '說明{title}公式中的變數',
  'estimator.formula.var.dRem.title': '剩餘天數',
  'estimator.formula.var.dRem.description': '預估至處理完成所需的天數。',
  'estimator.formula.var.qPos.title': '排隊位置',
  'estimator.formula.var.qPos.description': '在處理佇列中的預估位置。',
  'estimator.formula.var.rDaily.title': '每日處理速度',
  'estimator.formula.var.rDaily.description': '平均每天處理的申請件數。',
  'estimator.formula.var.cProc.title': '已確認處理數',
  'estimator.formula.var.cProc.description': '自申請以來已確認處理完成的申請件數。',
  'estimator.formula.var.eProc.title': '預估處理數',
  'estimator.formula.var.eProc.description': '自最新資料點以來預估已處理的申請件數。',
  'estimator.formula.var.sigmaP.title': '處理總數',
  'estimator.formula.var.sigmaP.description': '用於計算平均值的已處理申請總數。',
  'estimator.formula.var.sigmaD.title': '天數總計',
  'estimator.formula.var.sigmaD.description': '用於計算平均值的天數總計。',
  'estimator.formula.var.qApp.title': '申請時的佇列',
  'estimator.formula.var.qApp.description': '申請當下的預估排隊位置。',
  'estimator.formula.var.cPrev.title': '前月結轉',
  'estimator.formula.var.cPrev.description': '自上個月結轉的申請件數。',
  'estimator.formula.var.nApp.title': '新增申請',
  'estimator.formula.var.nApp.description': '預估於申請日之前受理的申請件數。',
  'estimator.formula.var.pApp.title': '已處理申請',
  'estimator.formula.var.pApp.description': '預估於申請日之前已處理的申請件數。',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': '受理與處理',
  'charts.intake.description': '每月結轉與受理的申請件數，對照各管理局完成處理的數量。',
  'charts.intake.aria': '每月待處理與受理申請件數的堆疊長條圖，並以折線呈現已處理數量',
  'charts.types.label': '申請類型',
  'charts.types.description': '按申請類型分類的每月新申請件數——點選圖例項目可切換該系列的顯示。',
  'charts.types.aria': '各申請類型每月新申請件數的折線圖',
  'charts.outcomes.label': '審查結果',
  'charts.outcomes.description': '申請案件的最終流向：各申請類型流向核准、不核准或其他結果的情形。',
  'charts.outcomes.aria': '申請類型流向審查結果的桑基圖',
  'charts.share.label': '管理局占比',
  'charts.share.description': '申請案件的提出地點：各管理局占整體受理量的比例。',
  'charts.share.aria': '各管理局受理申請占比的環圈圖',
  'charts.mix.label': '類型組成',
  'charts.mix.description': '依申請類型與管理局分類的所有申請——點選類別可放大檢視其細項。',
  'charts.efficiency.label': '處理效率',
  'charts.efficiency.description': '依處理完成率排序的管理局——莖幹粗細代表受理量，並以全國處理率作為參考基準。',
  'charts.efficiency.aria': '依處理完成率排序的管理局，莖幹粗細代表受理量',
  'charts.map.label': '區域地圖',
  'charts.map.description': '各管理局的管轄範圍與人口密度，並標示管理局與機場分局的位置。',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': '依申請類型與管理局分類的旭日圖，可互動下鑽檢視',
  'charts.efficiencyQuadrant.aria': '各管理局處理完成率與受理量的象限圖，泡泡大小代表處理量',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': '顯示{series}',
  'chart.legendHide': '隱藏{series}',
  'chart.allSeriesHidden': '所有系列皆已隱藏——點選圖例項目以顯示。',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': '資格取得',
  'chart.types.series.extension': '期間更新',
  'chart.types.series.change': '資格變更',
  'chart.types.series.activity': '資格外活動許可',
  'chart.types.series.reentry': '再入國',
  'chart.types.series.permanent': '永住',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': '其他／撤回',
  'chart.outcomes.valueUnit': '件',
  'chart.outcomes.tooltipValueLabel': '申請數',
  'chart.outcomes.tooltipFlowLabel': '流量',
  'chart.outcomes.approvalRate': '核准率',
  'chart.outcomes.ofProcessed': '占已處理 {count} 件申請的比例',
  'chart.outcomes.empty': '此期間內沒有已處理的申請。',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': '其他（{count}）',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': '所有申請',
  'chart.mix.breadcrumbAria': '樹狀圖下鑽路徑',
  'chart.mix.zoomInHint': '點選類別以放大',
  'chart.mix.zoomOutHint': '點選背景（或按 Esc 鍵）以縮小',
  'chart.mix.others': '其他',
  'chart.mix.categoryAria': '{category}：{count} 件申請。放大檢視。',
  'chart.mix.tooltipValue': '{count} 件申請・占{scope}的 {percent}',
  'chart.mix.scopeAll': '所有申請',
  'chart.mix.sunburstHint': '{trail} — {count} 件申請（占整體 {percent}）',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': '分局',
  'chart.efficiency.receivedCount': '受理 {count} 件',
  'chart.efficiency.nationwide': '全國 {rate}',
  'chart.efficiency.pointAria': '{bureau}：處理完成率 {rate}%，受理 {count} 件申請',
  'chart.efficiency.xAxis': '受理件數',
  'chart.efficiency.fullCompletion': '已處理 100% 受理量',
  'chart.efficiency.quadrantKeepingPace': '高受理量・處理進度正常',
  'chart.efficiency.quadrantFallingBehind': '高受理量・處理進度落後',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  // The bureau labels already end in 出入國在留管理局／分局, so these carry no
  // suffix of their own — appending one would repeat the office type.
  'map.bureauMarkerAria': '{bureau}',
  'map.airportMarkerAria': '{bureau}',
  'map.bureauSuffix': '{bureau}',
  'map.airportSuffix': '{bureau}',
  'map.servicePopulation': '管轄人口',
  'map.serviceArea': '管轄面積',
  'map.serviceBureau': '管轄機關',
  'map.portOfEntry': '出入境口岸機關',
  'map.legendNote': '顏色＝管轄機關・深淺＝人口密度',
  'map.bureau': '管理局',
  'map.airportOffice': '機場分局',
  'map.zoomIn': '放大',
  'map.zoomOut': '縮小',
  'map.resetView': '重設檢視',
  'map.loadError': '無法載入地圖資料，請嘗試重新載入頁面。',
  'map.loading': '地圖資料載入中…',
  'map.areaValue': '{value}km²',
  'map.densityValue': '{value}/km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': '更新日誌',
  'changelog.loading': '載入中…',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': '資料載入錯誤',
  'errors.noData': '沒有可用資料',
  'errors.unknown': '發生未知錯誤',
  'errors.fetchFailed': '資料擷取失敗',
  'errors.renderTitle': '發生錯誤',
  'errors.renderBody': '呈現此應用程式時發生錯誤。',
  'errors.reload': '重新載入頁面',
  'errors.changelogUnavailable': '無法載入更新日誌。',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': '正在顯示{bureau}的{chart}',
  'a11y.showingChartWithType': '正在顯示{bureau}、{type}的{chart}',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': '官方統計資料由日本出入國在留管理廳提供',
  'footer.dataAcquisition': '資料擷取服務由 {source} 提供',
  'footer.fixtureNotice': '目前顯示的是產生的範例資料',
  'footer.builtBy': '由 {author} 製作',
  'footer.dataUpdated': '資料更新於 {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Full official office names, in Traditional Chinese: the eight regional
  // 出入國在留管理局 plus seven branch offices (支局 → 分局). `.short` stays
  // Latin (IATA codes). `.compact` is the place name alone, for the surfaces
  // that measure in pixels — without it every Tokyo-family office truncates
  // to the same 「東京出入國在留」.
  'bureau.all': '全國',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': '全國',
  'bureau.101010': '札幌出入國在留管理局',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': '札幌',
  'bureau.101090': '仙台出入國在留管理局',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': '仙台',
  'bureau.101170': '東京出入國在留管理局',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': '東京',
  'bureau.101190': '東京出入國在留管理局成田機場分局',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': '成田機場',
  'bureau.101200': '東京出入國在留管理局羽田機場分局',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': '羽田機場',
  'bureau.101210': '東京出入國在留管理局橫濱分局',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': '橫濱',
  'bureau.101350': '名古屋出入國在留管理局',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': '名古屋',
  'bureau.101370': '名古屋出入國在留管理局中部機場分局',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': '中部機場',
  'bureau.101460': '大阪出入國在留管理局',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': '大阪',
  'bureau.101480': '大阪出入國在留管理局關西機場分局',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': '關西機場',
  'bureau.101490': '大阪出入國在留管理局神戶分局',
  'bureau.101490.short': 'UKB',
  'bureau.101490.compact': '神戶',
  'bureau.101580': '廣島出入國在留管理局',
  'bureau.101580.short': 'HIJ',
  'bureau.101580.compact': '廣島',
  'bureau.101670': '高松出入國在留管理局',
  'bureau.101670.short': 'TAK',
  'bureau.101670.compact': '高松',
  'bureau.101720': '福岡出入國在留管理局',
  'bureau.101720.short': 'FUK',
  'bureau.101720.compact': '福岡',
  'bureau.101740': '福岡出入國在留管理局那霸分局',
  'bureau.101740.short': 'OKA',
  'bureau.101740.compact': '那霸',

  // ── Domain: application types ────────────────────────────────────────────
  // The agency's own procedure names, in Traditional Chinese. `.short` uses
  // two-character forms a Chinese reader can scan on a stat tile, rather than
  // the Latin codes English uses, which would carry no meaning; `.compact` is
  // the narrow Sankey's one-word form.
  'appType.all': '所有類型',
  'appType.all.short': '全類型',
  'appType.all.compact': '全部',
  'appType.10': '在留資格取得許可申請',
  'appType.10.short': '取得',
  'appType.10.compact': '資格取得',
  'appType.20': '在留期間更新許可申請',
  'appType.20.short': '更新',
  'appType.20.compact': '期間更新',
  'appType.30': '在留資格變更許可申請',
  'appType.30.short': '變更',
  'appType.30.compact': '資格變更',
  'appType.40': '資格外活動許可申請',
  'appType.40.short': '資格外',
  'appType.40.compact': '資格外活動',
  'appType.50': '再入國許可申請',
  'appType.50.short': '再入國',
  'appType.50.compact': '再入國',
  'appType.60': '永住許可申請',
  'appType.60.short': '永住',
  'appType.60.compact': '永住',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code (1 Hokkaido … 47 Okinawa), written with the
  // Traditional Chinese convention for Japanese prefectures: 都 for Tokyo,
  // 府 for Kyoto and Osaka, 縣 (not the Japanese shinjitai 県) for the
  // remaining prefectures, and no suffix for Hokkaido since 道 is already
  // part of its name.
  'prefecture.1': '北海道',
  'prefecture.2': '青森縣',
  'prefecture.3': '岩手縣',
  'prefecture.4': '宮城縣',
  'prefecture.5': '秋田縣',
  'prefecture.6': '山形縣',
  'prefecture.7': '福島縣',
  'prefecture.8': '茨城縣',
  'prefecture.9': '栃木縣',
  'prefecture.10': '群馬縣',
  'prefecture.11': '埼玉縣',
  'prefecture.12': '千葉縣',
  'prefecture.13': '東京都',
  'prefecture.14': '神奈川縣',
  'prefecture.15': '新潟縣',
  'prefecture.16': '富山縣',
  'prefecture.17': '石川縣',
  'prefecture.18': '福井縣',
  'prefecture.19': '山梨縣',
  'prefecture.20': '長野縣',
  'prefecture.21': '岐阜縣',
  'prefecture.22': '靜岡縣',
  'prefecture.23': '愛知縣',
  'prefecture.24': '三重縣',
  'prefecture.25': '滋賀縣',
  'prefecture.26': '京都府',
  'prefecture.27': '大阪府',
  'prefecture.28': '兵庫縣',
  'prefecture.29': '奈良縣',
  'prefecture.30': '和歌山縣',
  'prefecture.31': '鳥取縣',
  'prefecture.32': '島根縣',
  'prefecture.33': '岡山縣',
  'prefecture.34': '廣島縣',
  'prefecture.35': '山口縣',
  'prefecture.36': '德島縣',
  'prefecture.37': '香川縣',
  'prefecture.38': '愛媛縣',
  'prefecture.39': '高知縣',
  'prefecture.40': '福岡縣',
  'prefecture.41': '佐賀縣',
  'prefecture.42': '長崎縣',
  'prefecture.43': '熊本縣',
  'prefecture.44': '大分縣',
  'prefecture.45': '宮崎縣',
  'prefecture.46': '鹿兒島縣',
  'prefecture.47': '沖繩縣',
};
