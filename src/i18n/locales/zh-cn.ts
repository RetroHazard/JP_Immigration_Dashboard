// src/i18n/locales/zh-cn.ts
// Simplified Chinese catalogue — complete coverage of the English source.
//
// Conventions, kept deliberately consistent so the file reads as one voice:
//
// - Verb-final, noun-phrase labels for anything that labels a control:
//   buttons, tabs, filter labels, column headers, stat-tile titles. Full
//   sentences for anything that speaks to the reader: explanatory prose,
//   warnings, empty and error states.
// - Official 出入国在留管理厅 terminology for the domain nouns, translated into
//   Simplified Chinese characters rather than left in Japanese kanji or
//   romanized: application types use the agency's own procedure names
//   (在留资格取得许可申请 and so on), and bureaus their full office names
//   including 支局 (branch office) status.
// - Full-width punctuation for parentheses and the enumeration comma （、）,
//   half-width for the colon and percent sign commonly set that way in
//   Chinese UI text, and no space between a number and its unit —
//   12,345件, 6个月, 1,234平方公里.
// - Chinese has a single CLDR plural category, so plural families define only
//   their `_other` member. `Intl.PluralRules('zh-CN')` never selects
//   anything else, and translate.ts falls back to `_other` regardless.
//
// A few values are intentionally identical to English: `nav.version` is a
// version number, and `bureau.*.short` are IATA-style codes that stay Latin in
// every language (see the note in en.ts).
import type { Dictionary } from '../types';

export const zhCn: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': '日本在留审查统计',
  'app.subtitle': '出入国在留管理厅的审查数据（随e-Stat发布同步更新）',
  'app.skipToContent': '跳转到内容',
  'app.loadingData': '正在汇总在留统计数据…',
  'app.loadingDashboard': '正在加载仪表盘…',
  'app.retry': '重试',

  // ── Document metadata ────────────────────────────────────────────────────
  // Not yet reachable: the static export prerenders one English document (see
  // src/i18n/README.md). Translated so it is ready when per-locale routes are.
  'meta.title': '日本在留审查统计仪表盘',
  'meta.description':
    '在留资格审查处理时间、各出入国在留管理局的处理情况，以及针对您自己申请的排队模型完成时间预估——基于出入国在留管理厅的官方统计数据，随e-Stat发布新数据（通常为每月一次）同步更新。',
  'meta.keywords': '日本签证处理时间, 出入国在留管理局统计, 签证申请进度查询, 出入国在留管理厅, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': '语言',
  'nav.switchToLightTheme': '切换至浅色主题',
  'nav.switchToDarkTheme': '切换至深色主题',
  'nav.openSettings': '打开设置菜单',
  'nav.settings': '设置',
  'nav.theme': '主题',
  'nav.themeLight': '浅色',
  'nav.themeDark': '深色',
  'nav.about': '关于本站',
  'nav.changelog': '更新日志',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': '数据范围：{range}',
  'dashboard.coverageRange': '{from}至{to}',
  'dashboard.comparisonSuffix': '（对比）',
  'dashboard.expandEstimator': '展开处理时间预估器',
  'dashboard.estimatorRail': '预估器',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': '出入国在留管理局',
  'filters.appType': '申请类型',
  'filters.compare': '比较对象',
  'filters.compareNone': '无',
  'filters.excludeAirports': '排除机场支局',
  'filters.includeAirports': '包含机场支局',
  'filters.reset': '重置筛选条件',
  'filters.selectPlaceholder': '请选择',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': '时间范围',
  'period.latest': '最新月份',
  'period.all': '全部数据',
  'period.months_other': '{count}个月',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': '申请总数',
  'stats.totalApplications.short': '总数',
  'stats.pending': '待处理',
  'stats.granted': '已批准',
  'stats.denied': '已拒绝',
  'stats.approvalRate': '批准率',
  'stats.approvalRate.short': '批准率',
  'stats.scopeWithType': '{bureau}（{type}）',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '环比{delta}',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': '结转',
  'metric.pending': '待处理（结转）',
  'metric.received': '受理',
  'metric.processed': '已处理',
  'metric.granted': '批准',
  'metric.denied': '拒绝',
  'metric.other': '其他',
  'metric.completion': '处理率',
  'metric.applications': '申请数',
  'metric.population': '人口',
  'metric.area': '面积',
  'metric.density': '人口密度',
  'common.noDataForFilters': '当前筛选条件下没有数据。',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': '查看数据表',
  'table.hide': '隐藏数据表',
  'table.downloadCsv': '下载CSV',
  'table.caption': '{bureau}的月度申请统计',
  'table.month': '月份',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': '处理时间预估器',
  'estimator.description': '基于过去六个月受理局处理量的排队模型预估。',
  'estimator.selectBureau': '选择受理局',
  'estimator.selectType': '选择申请类型',
  'estimator.applicationDate': '申请日期',
  'estimator.empty': '请选择受理局、申请类型和申请日期，以预估您的申请何时会处理完成。',
  'estimator.estimatedCompletion': '预计完成时间',
  'estimator.queuePosition': '排队位置',
  'estimator.aheadOfYou': '您前面约有{count}件',
  'estimator.howCalculated': '计算方式说明',
  'estimator.showMath': '显示计算过程',
  'estimator.hideMath': '隐藏计算过程',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': '重置预估器',
  'estimator.resetAria': '重置处理时间预估器',
  'estimator.collapse': '收起预估器',
  'estimator.collapseAria': '收起处理时间预估器',
  'estimator.close': '关闭预估器',
  'estimator.closeAria': '关闭处理时间预估器',
  'estimator.copyPermalink': '复制此预估结果的永久链接',
  'estimator.copied': '已复制！',
  // Joined with " · " at the call site, so each half stands on its own.
  'estimator.uncertaintyDays_other': '±{count}天',
  'estimator.uncertaintyWeeks_other': '±{count}周',
  'estimator.basedOnMonths_other': '基于{count}个月的处理数据',
  // Warnings.
  'estimator.limitedDataTitle': '基于有限数据的预估：',
  'estimator.limitedDataBody_other':
    '您的申请日期超出了现有数据范围。此预估基于{count}个月历史数据模拟得出的处理速率，准确性可能较低。',
  'estimator.pastDueTitle': '可能已超出预计完成时间：',
  'estimator.pastDueBody':
    '根据预期处理速率，此申请可能已超出预计完成时间。如果您尚未收到补充材料要求和/或结果通知，请联系受理局咨询详情。',
  // {emphasis} is the word 预估值, rendered bold and underlined.
  'estimator.disclaimer':
    '*这是根据当前处理速率、预计排队位置和待处理申请数量得出的{emphasis}。您的实际处理时间可能有所不同。',
  'estimator.disclaimerEmphasis': '预估值',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': '申请时的排队人数',
  'estimator.formula.step2': '排队位置与日处理速率',
  'estimator.formula.step3': '剩余天数',
  'estimator.formula.explainAria': '说明{title}公式中的变量',
  'estimator.formula.var.dRem.title': '剩余天数',
  'estimator.formula.var.dRem.description': '预计距处理完成的天数。',
  'estimator.formula.var.qPos.title': '排队位置',
  'estimator.formula.var.qPos.description': '在处理队列中的预计位置。',
  'estimator.formula.var.rDaily.title': '日处理速率',
  'estimator.formula.var.rDaily.description': '每日平均处理的申请件数。',
  'estimator.formula.var.cProc.title': '已确认处理数',
  'estimator.formula.var.cProc.description': '提交申请以来已确认处理的申请件数。',
  'estimator.formula.var.eProc.title': '预估处理数',
  'estimator.formula.var.eProc.description': '自最近数据点以来预计已处理的申请件数。',
  'estimator.formula.var.sigmaP.title': '处理总数',
  'estimator.formula.var.sigmaP.description': '用于计算平均值的处理件数总和。',
  'estimator.formula.var.sigmaD.title': '天数总和',
  'estimator.formula.var.sigmaD.description': '用于计算平均值的天数总和。',
  'estimator.formula.var.qApp.title': '申请时排队人数',
  'estimator.formula.var.qApp.description': '提交申请时的预计排队位置。',
  'estimator.formula.var.cPrev.title': '上月结转',
  'estimator.formula.var.cPrev.description': '从上月结转的申请件数。',
  'estimator.formula.var.nApp.title': '新申请',
  'estimator.formula.var.nApp.description': '预计在提交前受理的申请件数。',
  'estimator.formula.var.pApp.title': '已处理申请',
  'estimator.formula.var.pApp.description': '预计在提交前已处理的申请件数。',

  // ── Charts: registry ─────────────────────────────────────────────────────
  'charts.intake.label': '受理与处理',
  'charts.intake.description': '每月结转和受理的申请件数，与受理局完成处理的件数对比。',
  'charts.intake.aria': '按月堆叠显示待处理和受理申请数量的柱状图，并以折线叠加显示处理量',
  'charts.types.label': '申请类型',
  'charts.types.description': '按申请类型划分的每月新受理件数——点击图例条目可切换某一系列的显示。',
  'charts.types.aria': '各申请类型每月新受理件数的折线图',
  'charts.outcomes.label': '处理结果',
  'charts.outcomes.description': '申请最终去向：各类型流向批准、拒绝或其他结果的情况。',
  'charts.outcomes.aria': '显示申请类型流向处理结果的桑基图',
  'charts.share.label': '受理局占比',
  'charts.share.description': '申请提交地点分布：各受理局占总受理量的比例。',
  'charts.share.aria': '各受理局受理申请占比的环形图',
  'charts.mix.label': '类型构成',
  'charts.mix.description': '按类型和受理局划分的全部申请——点击某类别可放大查看其明细。',
  'charts.efficiency.label': '处理效率',
  'charts.efficiency.description': '按完成率排序的受理局列表——枝干粗细代表受理量，并以全国完成率作为参考基准。',
  'charts.efficiency.aria': '按完成率排序的受理局排名，枝干粗细代表受理量',
  'charts.map.label': '区域地图',
  'charts.map.description': '各受理局管辖区域及人口密度，以及受理局和机场支局的所在位置。',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': '按类型和受理局划分申请的旭日图，可交互下钻',
  'charts.efficiencyQuadrant.aria': '各受理局完成率与受理量的四象限图，气泡大小代表处理量',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': '显示{series}',
  'chart.legendHide': '隐藏{series}',
  'chart.allSeriesHidden': '所有系列均已隐藏——点击图例条目可显示。',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Series names for the wrapping legend, so these can be fuller than the
  // Sankey's `appType.*.compact` forms.
  'chart.types.series.acquisition': '在留资格取得',
  'chart.types.series.extension': '在留期间更新',
  'chart.types.series.change': '在留资格变更',
  'chart.types.series.activity': '资格外活动',
  'chart.types.series.reentry': '再入国',
  'chart.types.series.permanent': '永住',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': '其他／撤回',
  'chart.outcomes.valueUnit': '件',
  // Row labels in the Sankey tooltip: the node row counts applications, the
  // link row measures what flows along that connection.
  'chart.outcomes.tooltipValueLabel': '申请数',
  'chart.outcomes.tooltipFlowLabel': '流量',
  'chart.outcomes.approvalRate': '批准率',
  'chart.outcomes.ofProcessed': '占已处理{count}件申请的比例',
  'chart.outcomes.empty': '此期间内没有已处理的申请。',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': '其他（{count}）',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': '全部申请',
  'chart.mix.breadcrumbAria': '树状图下钻路径',
  'chart.mix.zoomInHint': '点击某类别可放大',
  'chart.mix.zoomOutHint': '点击背景（或按Esc键）可缩小还原',
  'chart.mix.others': '其他',
  'chart.mix.categoryAria': '{category}：{count}件申请。点击可放大。',
  'chart.mix.tooltipValue': '{count}件 · 占{scope}的{percent}',
  'chart.mix.scopeAll': '全部申请',
  'chart.mix.sunburstHint': '{trail} — {count}件（占总数的{percent}）',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': '支局',
  'chart.efficiency.receivedCount': '受理{count}件',
  'chart.efficiency.nationwide': '全国 {rate}',
  'chart.efficiency.pointAria': '{bureau}：完成率{rate}%，受理{count}件',
  'chart.efficiency.xAxis': '受理件数',
  'chart.efficiency.fullCompletion': '已处理受理量的100%',
  'chart.efficiency.quadrantKeepingPace': '高受理量 · 处理跟上进度',
  'chart.efficiency.quadrantFallingBehind': '高受理量 · 处理滞后',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  // The bureau labels already end in 出入国在留管理局 / 支局, so these carry no
  // suffix of their own — appending one would repeat the office type.
  'map.bureauMarkerAria': '{bureau}',
  'map.airportMarkerAria': '{bureau}',
  'map.bureauSuffix': '{bureau}',
  'map.airportSuffix': '{bureau}',
  'map.servicePopulation': '管辖人口',
  'map.serviceArea': '管辖面积',
  'map.serviceBureau': '管辖受理局',
  'map.portOfEntry': '出入境口岸办事处',
  'map.legendNote': '颜色 = 管辖受理局 · 深浅 = 人口密度',
  'map.bureau': '管理局',
  'map.airportOffice': '机场支局',
  'map.zoomIn': '放大',
  'map.zoomOut': '缩小',
  'map.resetView': '重置视图',
  'map.loadError': '无法加载地图数据，请尝试重新加载页面。',
  'map.loading': '正在加载地图数据…',
  'map.areaValue': '{value}km²',
  'map.densityValue': '{value}人/km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': '更新日志',
  'changelog.loading': '加载中…',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': '数据加载错误',
  'errors.noData': '暂无数据',
  'errors.unknown': '发生未知错误',
  'errors.fetchFailed': '数据获取失败',
  'errors.renderTitle': '出现了一些问题',
  'errors.renderBody': '渲染应用程序时发生错误。',
  'errors.reload': '重新加载页面',
  'errors.changelogUnavailable': '无法加载更新日志。',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': '正在显示{bureau}的{chart}',
  'a11y.showingChartWithType': '正在显示{bureau}（{type}）的{chart}',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': '官方统计数据由日本出入国在留管理厅提供',
  'footer.dataAcquisition': '数据获取由{source}提供',
  'footer.fixtureNotice': '当前显示为生成的示例数据',
  'footer.builtBy': '由{author}开发',
  'footer.dataUpdated': '数据更新于{date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Full official office names, including 支局 (branch office) status: the
  // eight regional 地方出入国在留管理局 plus seven branch offices, translated
  // into Simplified Chinese characters (机场 for 空港, 滨/户/冈/霸 for the
  // Japanese shinjitai forms 浜/戸/岡/覇). `.short` stays Latin (IATA codes).
  // `.compact` is the place name alone, for the surfaces that measure in
  // pixels — without it every 东京-family office truncates to the same prefix.
  'bureau.all': '全国',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': '全国',
  'bureau.101010': '札幌出入国在留管理局',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': '札幌',
  'bureau.101090': '仙台出入国在留管理局',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': '仙台',
  'bureau.101170': '东京出入国在留管理局',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': '东京',
  'bureau.101190': '东京出入国在留管理局成田机场支局',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': '成田机场',
  'bureau.101200': '东京出入国在留管理局羽田机场支局',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': '羽田机场',
  'bureau.101210': '东京出入国在留管理局横滨支局',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': '横滨',
  'bureau.101350': '名古屋出入国在留管理局',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': '名古屋',
  'bureau.101370': '名古屋出入国在留管理局中部机场支局',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': '中部机场',
  'bureau.101460': '大阪出入国在留管理局',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': '大阪',
  'bureau.101480': '大阪出入国在留管理局关西机场支局',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': '关西机场',
  'bureau.101490': '大阪出入国在留管理局神户支局',
  'bureau.101490.short': 'UKB',
  'bureau.101490.compact': '神户',
  'bureau.101580': '广岛出入国在留管理局',
  'bureau.101580.short': 'HIJ',
  'bureau.101580.compact': '广岛',
  'bureau.101670': '高松出入国在留管理局',
  'bureau.101670.short': 'TAK',
  'bureau.101670.compact': '高松',
  'bureau.101720': '福冈出入国在留管理局',
  'bureau.101720.short': 'FUK',
  'bureau.101720.compact': '福冈',
  'bureau.101740': '福冈出入国在留管理局那霸支局',
  'bureau.101740.short': 'OKA',
  'bureau.101740.compact': '那霸',

  // ── Domain: application types ────────────────────────────────────────────
  // The agency's own procedure names, translated into Simplified Chinese.
  // `.short` uses the two-to-three character forms already familiar from
  // Chinese-language guides for residents of Japan; `.compact` is the narrow
  // Sankey's one-word form.
  'appType.all': '所有类型',
  'appType.all.short': 'ALL',
  'appType.all.compact': '全部',
  'appType.10': '在留资格取得许可申请',
  'appType.10.short': '取得',
  'appType.10.compact': '资格取得',
  'appType.20': '在留期间更新许可申请',
  'appType.20.short': '更新',
  'appType.20.compact': '期间更新',
  'appType.30': '在留资格变更许可申请',
  'appType.30.short': '变更',
  'appType.30.compact': '资格变更',
  'appType.40': '资格外活动许可申请',
  'appType.40.short': '资格外',
  'appType.40.compact': '资格外活动',
  'appType.50': '再入国许可申请',
  'appType.50.short': '再入国',
  'appType.50.compact': '再入国',
  'appType.60': '永住许可申请',
  'appType.60.short': '永住',
  'appType.60.compact': '永住',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code, using the Chinese hanzi form conventional in
  // Chinese-language references (e.g. Chinese Wikipedia), converted to
  // Simplified characters where the Japanese kanji form differs — 岡→冈,
  // 廣/広→广, 榮 and others follow the same substitution — and carrying the
  // 都・道・府・县 suffix (県 becomes 县, not the Japanese shinjitai).
  'prefecture.1': '北海道',
  'prefecture.2': '青森县',
  'prefecture.3': '岩手县',
  'prefecture.4': '宫城县',
  'prefecture.5': '秋田县',
  'prefecture.6': '山形县',
  'prefecture.7': '福岛县',
  'prefecture.8': '茨城县',
  'prefecture.9': '枥木县',
  'prefecture.10': '群马县',
  'prefecture.11': '埼玉县',
  'prefecture.12': '千叶县',
  'prefecture.13': '东京都',
  'prefecture.14': '神奈川县',
  'prefecture.15': '新潟县',
  'prefecture.16': '富山县',
  'prefecture.17': '石川县',
  'prefecture.18': '福井县',
  'prefecture.19': '山梨县',
  'prefecture.20': '长野县',
  'prefecture.21': '岐阜县',
  'prefecture.22': '静冈县',
  'prefecture.23': '爱知县',
  'prefecture.24': '三重县',
  'prefecture.25': '滋贺县',
  'prefecture.26': '京都府',
  'prefecture.27': '大阪府',
  'prefecture.28': '兵库县',
  'prefecture.29': '奈良县',
  'prefecture.30': '和歌山县',
  'prefecture.31': '鸟取县',
  'prefecture.32': '岛根县',
  'prefecture.33': '冈山县',
  'prefecture.34': '广岛县',
  'prefecture.35': '山口县',
  'prefecture.36': '德岛县',
  'prefecture.37': '香川县',
  'prefecture.38': '爱媛县',
  'prefecture.39': '高知县',
  'prefecture.40': '福冈县',
  'prefecture.41': '佐贺县',
  'prefecture.42': '长崎县',
  'prefecture.43': '熊本县',
  'prefecture.44': '大分县',
  'prefecture.45': '宫崎县',
  'prefecture.46': '鹿儿岛县',
  'prefecture.47': '冲绳县',

  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.label': '数据集',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': '选择要查看的数据集',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': '在留审查办理',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': '审查办理',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': '在留外国人人口',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': '在留外国人',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': '目前无法加载在留外国人数据。',
  'charts.origins.label': '各国籍人数变化',
  'charts.origins.description': '在统计涵盖的每个半年期内，主要国籍的人数是如何增减的。',
  'charts.origins.aria': '按国籍显示在留人数随时间变化的堆叠面积图',
  'charts.statuses.label': '在留资格构成',
  'charts.statuses.description': '在留者持有的签证，按居留目的分组。点击某个分组可展开其下的具体资格。',
  'charts.statuses.aria': '按在留资格分组及具体资格显示在留人数的矩形树图',
  'charts.worldmap.label': '来源国分布',
  'charts.worldmap.description': '日本在留外国人的来源国，按持有各国籍的人数深浅着色。',
  'charts.worldmap.aria': '按来源国在留人数着色的世界地图',
  'charts.movers.label': '增减最大的项目',
  'charts.movers.description': '两个时期之间增减幅度最大的国籍或在留资格。',
  'charts.movers.aria': '将两个时期之间的增加与减少按幅度左右排列的条形图',

  'filters.nationality': '国籍・地区',
  'filters.residenceStatus': '在留资格',
  'filters.allNationalities': '所有国籍',
  'filters.allStatuses': '所有在留资格',

  'period.latestPeriod': '最新时期',
  // 'period.years_one': '{count} year',
  'period.years_other': '{count}年',

  'residents.total': '在留外国人数',
  'residents.total.short': '在留人数',
  'residents.delta': '较上期 {delta}',
  'residents.topNationality': '人数最多的国籍',
  'residents.topStatus': '人数最多的在留资格',
  'residents.share': '占总数的 {share}',
  'residents.scope': '{nationality}（{status}）',
  'residents.otherNationalities': '其他国籍',
  'residents.noMapArea': '有 {count} 个国籍在地图上没有对应区域，因此未着色。',
  'residents.legendScale': '在留人数',
  'residents.discontinued': '该系列在 {period} 结束：此类别已被合并或改名。',
  'residents.comparePeriod': '与 {period} 相比',
  'residents.byNationality': '按国籍',
  'residents.byStatus': '按在留资格',
  'residents.increase': '增加',
  'residents.decrease': '减少',
  'residents.asOf': '截至 {period}',
  'residents.noChange': '这两个时期之间没有明显变化。',
  'residents.coverageRange': '{from} – {to}',

  'statusGroup.work': '就业',
  'statusGroup.training': '研修实习',
  'statusGroup.study': '留学文化',
  'statusGroup.family': '家庭',
  'statusGroup.residency': '居住',
  'statusGroup.other': '其他',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'region.7000': '无国籍',
  'nationality.1120': '朝鲜籍',
  'nationality.1130': '韩国・朝鲜合计',
  'nationality.2290': '塞尔维亚和黑山',
  'nationality.2500': '南斯拉夫',
  'nationality.7000': '无国籍',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': '总数',
  'status.1040': '教授',
  'status.1050': '艺术',
  'status.1060': '宗教',
  'status.1070': '报道',
  'status.1080': '高度专门职',
  'status.1090': '高度专门职1号（甲）',
  'status.1100': '高度专门职1号（乙）',
  'status.1110': '高度专门职1号（丙）',
  'status.1120': '高度专门职2号',
  'status.1130': '投资・经营',
  'status.1140': '经营・管理',
  'status.1150': '法律・会计业务',
  'status.1160': '医疗',
  'status.1170': '研究',
  'status.1180': '教育',
  'status.1190': '技术',
  'status.1200': '人文知识・国际业务',
  'status.1210': '技术・人文知识・国际业务',
  'status.1220': '企业内调动',
  'status.1230': '护理',
  'status.1240': '演出',
  'status.1250': '技能',
  'status.1260': '特定技能',
  'status.1270': '特定技能1号',
  'status.1280': '特定技能2号',
  'status.1290': '技能实习',
  'status.1300': '技能实习1号（甲）',
  'status.1310': '技能实习1号（乙）',
  'status.1320': '技能实习2号（甲）',
  'status.1330': '技能实习2号（乙）',
  'status.1340': '技能实习3号（甲）',
  'status.1350': '技能实习3号（乙）',
  'status.1360': '文化活动',
  'status.1380': '留学',
  'status.1400': '研修',
  'status.1410': '家属滞在',
  'status.1420': '特定活动',
  'status.1430': '永住者',
  'status.1440': '日本人的配偶等',
  'status.1450': '永住者的配偶等',
  'status.1460': '定住者',
  'status.1470': '特别永住者',
};
