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
  'app.subtitle': '出入国在留管理厅的审查数据与在留外国人统计（来自e-Stat）',
  'app.skipToContent': '跳转到内容',
  'app.loadingData': '正在汇总在留统计数据…',
  'app.loadingDashboard': '正在加载仪表盘…',
  'app.retry': '重试',

  // ── Document metadata ────────────────────────────────────────────────────
  // Not yet reachable: the static export prerenders one English document (see
  // src/i18n/README.md). Translated so it is ready when per-locale routes are.
  'meta.title': '日本在留审查统计仪表盘',
  'meta.description':
    '在留资格审查处理时间、各出入国在留管理局的处理情况、在留外国人数的变化趋势，以及针对您自己申请的排队模型完成时间预估——基于出入国在留管理厅的官方统计数据，随e-Stat发布新数据同步更新。',
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
  'nav.sourceCode': '源代码',

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
  'metric.approvalRate': '批准率',
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
  'table.month': '月份',
  'table.prefecture': '都道府县',
  'table.shareOfTotal': '占总量比例',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': '处理时间预估器',
  'estimator.description': '基于过去六个月受理局处理量的排队模型预估。',
  'estimator.selectBureau': '选择受理局',
  'estimator.selectType': '选择申请类型',
  'estimator.applicationDate': '申请日期',
  'estimator.selectionSummary': '{bureau} · {type} · {date}',
  'estimator.editDetails': '修改申请信息',
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
  'estimator.formula.step1': '处理能力基准',
  'estimator.formula.step2': '申请时的排队量',
  'estimator.formula.step3': '申请后的处理量',
  'estimator.formula.step4': '排队位次与剩余天数',
  'estimator.formula.step5': '完成天数与误差范围',
  'estimator.formula.explainAria': '解释{title}公式中的各个变量',
  // Step 1 — throughput baseline.
  'estimator.formula.var.sigmaP.title': '处理总量',
  'estimator.formula.var.sigmaP.description':
    '抽样区间内办结的申请总数。抽样区间为最近六个已公布月份，数据不足时则取现有的全部月份。',
  'estimator.formula.var.sigmaN.title': '受理总量',
  'estimator.formula.var.sigmaN.description': '同一抽样区间内受理的申请总数。',
  'estimator.formula.var.sigmaD.title': '总天数',
  'estimator.formula.var.sigmaD.description': '抽样区间所含的日历天数，按月逐一相加。',
  'estimator.formula.var.rProc.title': '处理速率',
  'estimator.formula.var.rProc.description': '抽样区间内平均每天办结的申请件数。',
  'estimator.formula.var.rNew.title': '受理速率',
  'estimator.formula.var.rNew.description': '同一区间内平均每天受理的申请件数。',
  // Step 2 — the queue on the application date.
  'estimator.formula.var.tPrev.title': '上月总量',
  'estimator.formula.var.tPrev.description': '申请当月的前一个月，该局手上的申请总数，含结转与新受理两部分。',
  'estimator.formula.var.pPrev.title': '上月处理量',
  'estimator.formula.var.pPrev.description': '申请当月的前一个月办结的申请件数。',
  'estimator.formula.var.cSeed.title': '推算起点',
  'estimator.formula.var.cSeed.description': '当申请月的前一个月尚未公布数据时，作为起点使用的最后一期已公布结转量。',
  'estimator.formula.var.mSim.title': '推算月数',
  'estimator.formula.var.mSim.description': '为推进到申请当月，结转量被逐月往前推算了多少个月。',
  'estimator.formula.var.cPrev.title': '上月结转',
  'estimator.formula.var.cPrev.description':
    '申请当月开始时仍在等待的申请件数。前一个月有公布数据时直接采用，没有时则从最近有数据的月份起逐月往前推算。',
  'estimator.formula.var.nMonth.title': '当月受理',
  'estimator.formula.var.nMonth.description': '申请当月整月受理的申请件数。',
  'estimator.formula.var.pMonth.title': '当月处理',
  'estimator.formula.var.pMonth.description': '申请当月整月办结的申请件数。',
  'estimator.formula.var.dMonth.title': '当月天数',
  'estimator.formula.var.dMonth.description': '申请当月的日历天数，用于把整月合计均匀摊到每一天。',
  'estimator.formula.var.aDay.title': '申请日',
  'estimator.formula.var.aDay.description': '申请日期落在当月的第几天，反映排队量已累积到什么程度。',
  'estimator.formula.var.nApp.title': '申请前受理',
  'estimator.formula.var.nApp.description': '申请当月中排在您之前受理的申请件数，按天摊算至申请当日。',
  'estimator.formula.var.pApp.title': '申请前处理',
  'estimator.formula.var.pApp.description': '申请当月中排在您之前办结的申请件数，按同样方式摊算。',
  'estimator.formula.var.qApp.title': '申请时排队量',
  'estimator.formula.var.qApp.description': '申请当日排在您前面的申请件数。',
  // Step 3 — progress since the application date.
  'estimator.formula.var.pAfter.title': '后续月份处理量',
  'estimator.formula.var.pAfter.description': '申请当月之后各已公布月份办结的申请件数。',
  'estimator.formula.var.tApp.title': '申请至今天数',
  'estimator.formula.var.tApp.description': '从申请日期到今天的日历天数。',
  'estimator.formula.var.tData.title': '数据后天数',
  'estimator.formula.var.tData.description': '从最近一期已公布月份的月末到今天的日历天数。',
  'estimator.formula.var.cProc.title': '已确认处理量',
  'estimator.formula.var.cProc.description': '申请之后办结的件数中，已公布数据能够佐证的部分。',
  'estimator.formula.var.eProc.title': '预估处理量',
  'estimator.formula.var.eProc.description':
    '公布数据尚未覆盖的时段内，预计已办结的申请件数。若已公布月份的实际办结量超过按平均速率的预测，该值为负。',
  'estimator.formula.var.sProc.title': '申请后处理总量',
  'estimator.formula.var.sProc.description': '申请之后办结的件数合计，由已确认与预估两部分相加并取整。',
  // Step 4 — position in the queue, and how long it takes to clear.
  'estimator.formula.var.qPos.title': '排队位次',
  'estimator.formula.var.qPos.description': '排在您前面尚未办结的申请件数。为零或更低表示预计完成日已经过去。',
  'estimator.formula.var.dRem.title': '剩余天数',
  'estimator.formula.var.dRem.description': '按当前处理速率消化剩余排队量所需的天数。',
  // Step 5 — the whole-day offset, and the spread around it.
  'estimator.formula.var.dEst.title': '整数天数',
  'estimator.formula.var.dEst.description': '把剩余天数朝远离零的方向取整后的值，加到今天即得上方的预计完成日期。',
  'estimator.formula.var.sigmaR.title': '速率波动',
  'estimator.formula.var.sigmaR.description': '各月处理速率的标准差，反映处理节奏逐月波动的幅度。',
  'estimator.formula.var.rBar.title': '月均处理速率',
  'estimator.formula.var.rBar.description': '把各月处理速率按月份数均等平均，而非按件数加权。',
  'estimator.formula.var.uDays.title': '误差范围',
  'estimator.formula.var.uDays.description':
    '结果旁显示的 ± 幅度，表示处理节奏若像近期一样波动，预计日期会有多大变化。',

  // ── Charts: registry ─────────────────────────────────────────────────────
  'charts.intake.label': '受理与处理',
  'charts.intake.description': '每月结转和受理的申请件数，与受理局完成处理的件数及其中获批的比例对比。',
  'charts.intake.aria':
    '按月堆叠显示待处理和受理申请数量的柱状图，并以折线叠加显示处理量，另以0至100%的右侧纵轴用折线显示批准率',
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

  // ── Chart: Intake & Processing — policy event markers ────────────────────
  'policy.eventsShow': '显示政策事件',
  'policy.eventsHide': '隐藏政策事件',
  'policy.ssw2019.title': '新设特定技能',
  'policy.ssw2019.description': '面向人手短缺行业的居留资格；出入国在留管理厅同日成立。',
  'policy.covidClosure.title': '疫情期间的入境限制',
  'policy.covidClosure.description': '随着疫情扩散，拒绝入境的对象地区扩大到世界大部分国家。',
  'policy.covidSuspension.title': '暂停全球新规入境',
  'policy.covidSuspension.description': '自12月下旬起，无论持何种签证，外国人均不得新规入境。',
  'policy.covidOmicron.title': '因奥密克戎再度关闭',
  'policy.covidOmicron.description': '11月8日恢复的新规入境，三周后再次被叫停。',
  'policy.covidResume.title': '留学生与劳动者重新入境',
  'policy.covidResume.description': '就业、留学与商务的新规入境重启，并设有每日入境人数上限。',
  'policy.covidVisaFree.title': '恢复免签旅行',
  'policy.covidVisaFree.description': '免签措施恢复，每日入境人数上限也被取消。',
  'policy.covidCoe.title': '延长认定证明书有效期',
  'policy.covidCoe.description': '因封关未能入境的在留资格认定证明书，有效期延长至三个月以上。',
  'policy.covidEnd.title': '边境防疫措施结束',
  'policy.covidEnd.description': '检测与疫苗证明查验取消，新冠也调整为第5类传染病。',
  'policy.act2023.title': '修订入管法公布',
  'policy.act2023.description': '新设代替收容的监理措施和补充保护对象制度。',
  'policy.digitalNomad.title': '新设数字游民居留资格',
  'policy.digitalNomad.description': '面向海外企业远程工作者及其家属的六个月特定活动。',
  'policy.sswExpansion.title': '特定技能领域扩大',
  'policy.sswExpansion.description': '内阁决议新增四个领域并重新设定五年接收人数。',
  'policy.act2023Effect.title': '遣返与监理规定生效',
  'policy.act2023Effect.description': '2023年修订入管法的主要规定开始施行。',
  'policy.act2024.title': '育成就劳取代技能实习',
  'policy.act2024.description': '技能实习制度将于2027年过渡为育成就劳制度。',
  'policy.feeRevision2025.title': '在留手续费上调',
  'policy.feeRevision2025.description': '在留期间更新升至6,000日元，永住许可升至10,000日元。',
  'policy.businessManager2025.title': '经营管理标准收紧',
  'policy.businessManager2025.description': '需提高注册资本、雇用全职员工并由专家确认事业计划。',
  'policy.residenceCard2026.title': '特定在留卡开始启用',
  'policy.residenceCard2026.description': '在留卡与个人编号卡实现一体化。',
  'policy.act2026.title': '法定手续费上限提高',
  'policy.act2026.description': '2026年修订法提高了在留许可手续费的法定上限。',

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
  'chart.mix.zoomInHintTap': '点按某类别可查看详情，再次点按可放大',
  'chart.mix.zoomOutHintTap': '点按背景可缩小还原',
  'chart.mix.others': '其他',
  'chart.mix.categoryAria': '{category}：{count}件申请。点击可放大。',
  'chart.mix.tooltipValue': '{count}件 · 占{scope}的{percent}',
  'chart.mix.scopeAll': '全部申请',
  'chart.mix.sunburstHint': '{trail} — {count}件（占总数的{percent}）',
  'chart.sunburst.hintClick': '点击扇区可放大 · 悬停可查看详情',
  'chart.sunburst.hintTap': '点按扇区可查看详情，再次点按可放大',
  'chart.sunburst.zoomOutClick': '点击中心可缩小还原',
  'chart.sunburst.zoomOutTap': '点按中心可缩小还原',

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
  'a11y.policyEvents': '本图表中显示的政策事件',

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
  'charts.growth.label': '在留人口增长',
  'charts.growth.description': '按半年展示外国居民总数,可按居留目的或世界区域堆叠。',
  'charts.growth.aria': '按在留资格组或区域堆叠的半年度外国居民总数条形图',
  'charts.origins.label': '各国籍人数变化',
  'charts.origins.description': '在统计涵盖的每个半年期内，主要国籍的人数是如何增减的。',
  'charts.origins.aria': '按国籍显示在留人数随时间变化的堆叠面积图',
  'charts.flows.label': '从国籍到在留资格',
  'charts.flows.description': '从世界地区经国家流向居留目的——选择地区或国籍即可追踪其构成。',
  'charts.flows.aria': '展示居民从世界地区经国家流向在留资格类别的桑基图',
  'charts.statuses.label': '在留资格构成',
  'charts.statuses.description': '在留者持有的签证，按居留目的分组。点击某个分组可展开其下的具体资格。',
  'charts.statuses.aria': '按在留资格组和具体资格展示居民数的旭日图',
  'charts.worldmap.label': '来源国分布',
  'charts.worldmap.description': '日本在留外国人的来源国，按持有各国籍的人数深浅着色。',
  'charts.worldmap.aria': '按来源国在留人数着色的世界地图',
  'charts.movers.label': '增减最大的项目',
  'charts.movers.description': '两个时期之间增减幅度最大的国籍或在留资格。',
  'charts.movers.aria': '将两个时期之间的增加与减少按幅度左右排列的条形图',

  'filters.region': '地区',
  'filters.allRegions': '所有地区',
  'filters.nationality': '国籍',
  'filters.residenceStatus': '在留资格',
  'filters.allNationalities': '所有国籍',
  'filters.allStatuses': '所有在留资格',
  'filters.allCategories': '所有类别',

  'period.snapshotLabel': '快照时点',
  'period.latestPeriod': '最新时期',
  // 'period.years_one': '{count} year',
  'period.years_other': '{count}年',

  'residents.total': '在留外国人数',
  'residents.total.short': '在留人数',
  'residents.delta': '较上期 {delta}',
  'residents.populationShare': '占总人口比例',
  'residents.populationShare.short': '人口占比',
  'residents.populationShareOf': '占日本总人口 {population} 人',
  'residents.topNationality': '人数最多的国籍',
  'residents.topNationality.short': '最多国籍',
  'residents.topStatus': '人数最多的在留资格',
  'residents.topStatus.short': '最多资格',
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
  'residents.stackByGroup': '按居留目的',
  'residents.stackByRegion': '按世界区域',
  'residents.stackByNationality': '按国籍',
  'residents.growthTotal': '总计',
  'residents.viewAbsolute': '人数',
  'residents.viewIndexed': '增长指数',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': '人',
  'residents.flowsTooltipValueLabel': '居民数',
  'residents.flowsTooltipFlowLabel': '流量',
  'residents.sunburstHint': '{trail} — {count} 人(占总数 {percent})',
  'residents.markerResidenceCard.title': '在留卡制度启用',
  'residents.markerResidenceCard.description': '在留卡取代外国人登记，本统计自启用后的首个时点开始。',
  'residents.markerReopening.title': '边境重新开放',
  'residents.markerReopening.description': '2022年10月免签旅行恢复，在留人数重新回到增长轨道。',
  'residents.markerTraining.title': '育成就劳取代技能实习',
  'residents.markerTraining.description': '2024年修订新设育成就劳制度，并收紧了永住许可的要件。',
  'residents.markerBusinessManager.title': '经营管理标准收紧',
  'residents.markerBusinessManager.description': '自2025年10月起需提高注册资本、雇用全职员工并由专家确认事业计划。',
  'residents.markerSsw.title': '“特定技能”签证启用',
  'residents.markerSsw.description': '2019 年 4 月新设的在留资格,向十余个行业开放技能型外国劳动者。',
  'residents.markerCovid.title': '新冠疫情边境管制',
  'residents.markerCovid.description': '入境限制冻结了新增入境,居民人数下降持续至 2022 年年中。',
  'residents.markerKoreaSplit.title': '韩国·朝鲜统计拆分',
  'residents.markerKoreaSplit.description':
    '统计中“韩国·朝鲜”拆分为“韩国”和“朝鲜”两个序列——是统计口径变化,并非人口变动。',

  'statusGroup.work': '就业',
  'statusGroup.training': '研修实习',
  'statusGroup.study': '留学文化',
  'statusGroup.family': '家庭',
  'statusGroup.residency': '居住',
  'statusGroup.other': '其他',
  // ── World regions. ICU is tried first, but Chrome ships no names for M49
  // macro-regions, so these are what actually renders there. ────────────────
  'region.1000': '亚洲',
  'region.2000': '欧洲',
  'region.3000': '非洲',
  'region.4000': '北美洲',
  'region.5000': '南美洲',
  'region.6000': '大洋洲',
  'region.7000': '无国籍',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
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
  'residents.mixRoot': '全部在留者',
  'residents.mixScopeAll': '全部在留者',
  'residents.mixCategoryAria': '{category}：{count} 人。展开查看。',
  'residents.mixTooltipValue': '{count} 人 · 占{scope}的 {percent}',
};
