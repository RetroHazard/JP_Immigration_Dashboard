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
  'nav.sourceCode': '原始碼',

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
  'metric.approvalRate': '核准率',
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
  'table.month': '月份',
  'table.prefecture': '都道府縣',
  'table.shareOfTotal': '佔總量比例',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': '審查期間預估工具',
  'estimator.description': '根據過去六個月管理局處理量所建立的排隊模型預估結果。',
  'estimator.selectBureau': '選擇管理局',
  'estimator.selectType': '選擇申請類型',
  'estimator.applicationDate': '申請日期',
  'estimator.selectionSummary': '{bureau} · {type} · {date}',
  'estimator.editDetails': '修改申請資訊',
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
  'estimator.formula.step1': '處理能力基準',
  'estimator.formula.step2': '申請時的排隊量',
  'estimator.formula.step3': '申請後的處理量',
  'estimator.formula.step4': '排隊順位與剩餘天數',
  'estimator.formula.step5': '完成天數與誤差範圍',
  'estimator.formula.explainAria': '說明{title}公式中的各個變數',
  // Step 1 — throughput baseline.
  'estimator.formula.var.sigmaP.title': '處理總量',
  'estimator.formula.var.sigmaP.description': '抽樣區間內辦結的申請總數。抽樣區間為最近六個已公布月份，資料不足時則取現有的全部月份。',
  'estimator.formula.var.sigmaN.title': '受理總量',
  'estimator.formula.var.sigmaN.description': '同一抽樣區間內受理的申請總數。',
  'estimator.formula.var.sigmaD.title': '總天數',
  'estimator.formula.var.sigmaD.description': '抽樣區間所含的日曆天數，按月逐一相加。',
  'estimator.formula.var.rProc.title': '處理速率',
  'estimator.formula.var.rProc.description': '抽樣區間內平均每天辦結的申請件數。',
  'estimator.formula.var.rNew.title': '受理速率',
  'estimator.formula.var.rNew.description': '同一區間內平均每天受理的申請件數。',
  // Step 2 — the queue on the application date.
  'estimator.formula.var.tPrev.title': '上月總量',
  'estimator.formula.var.tPrev.description': '申請當月的前一個月，該局手上的申請總數，含結轉與新受理兩部分。',
  'estimator.formula.var.pPrev.title': '上月處理量',
  'estimator.formula.var.pPrev.description': '申請當月的前一個月辦結的申請件數。',
  'estimator.formula.var.cSeed.title': '推算起點',
  'estimator.formula.var.cSeed.description': '當申請月的前一個月尚未公布資料時，作為起點使用的最後一期已公布結轉量。',
  'estimator.formula.var.mSim.title': '推算月數',
  'estimator.formula.var.mSim.description': '為推進到申請當月，結轉量被逐月往前推算了多少個月。',
  'estimator.formula.var.cPrev.title': '上月結轉',
  'estimator.formula.var.cPrev.description': '申請當月開始時仍在等候的申請件數。前一個月有公布資料時直接採用，沒有時則從最近有資料的月份起逐月往前推算。',
  'estimator.formula.var.nMonth.title': '當月受理',
  'estimator.formula.var.nMonth.description': '申請當月整月受理的申請件數。',
  'estimator.formula.var.pMonth.title': '當月處理',
  'estimator.formula.var.pMonth.description': '申請當月整月辦結的申請件數。',
  'estimator.formula.var.dMonth.title': '當月天數',
  'estimator.formula.var.dMonth.description': '申請當月的日曆天數，用於把整月合計平均攤到每一天。',
  'estimator.formula.var.aDay.title': '申請日',
  'estimator.formula.var.aDay.description': '申請日期落在當月的第幾天，反映排隊量已累積到什麼程度。',
  'estimator.formula.var.nApp.title': '申請前受理',
  'estimator.formula.var.nApp.description': '申請當月中排在您之前受理的申請件數，按天攤算至申請當日。',
  'estimator.formula.var.pApp.title': '申請前處理',
  'estimator.formula.var.pApp.description': '申請當月中排在您之前辦結的申請件數，按同樣方式攤算。',
  'estimator.formula.var.qApp.title': '申請時排隊量',
  'estimator.formula.var.qApp.description': '申請當日排在您前面的申請件數。',
  // Step 3 — progress since the application date.
  'estimator.formula.var.pAfter.title': '後續月份處理量',
  'estimator.formula.var.pAfter.description': '申請當月之後各已公布月份辦結的申請件數。',
  'estimator.formula.var.tApp.title': '申請至今天數',
  'estimator.formula.var.tApp.description': '從申請日期到今天的日曆天數。',
  'estimator.formula.var.tData.title': '資料後天數',
  'estimator.formula.var.tData.description': '從最近一期已公布月份的月底到今天的日曆天數。',
  'estimator.formula.var.cProc.title': '已確認處理量',
  'estimator.formula.var.cProc.description': '申請之後辦結的件數中，已公布資料能夠佐證的部分。',
  'estimator.formula.var.eProc.title': '預估處理量',
  'estimator.formula.var.eProc.description': '公布資料尚未涵蓋的時段內，預計已辦結的申請件數。若已公布月份的實際辦結量超過按平均速率的預測，該值為負。',
  'estimator.formula.var.sProc.title': '申請後處理總量',
  'estimator.formula.var.sProc.description': '申請之後辦結的件數合計，由已確認與預估兩部分相加並取整。',
  // Step 4 — position in the queue, and how long it takes to clear.
  'estimator.formula.var.qPos.title': '排隊順位',
  'estimator.formula.var.qPos.description': '排在您前面尚未辦結的申請件數。為零或更低表示預計完成日已經過去。',
  'estimator.formula.var.dRem.title': '剩餘天數',
  'estimator.formula.var.dRem.description': '按目前處理速率消化剩餘排隊量所需的天數。',
  // Step 5 — the whole-day offset, and the spread around it.
  'estimator.formula.var.dEst.title': '整數天數',
  'estimator.formula.var.dEst.description': '把剩餘天數朝遠離零的方向取整後的值，加到今天即得上方的預計完成日期。',
  'estimator.formula.var.sigmaR.title': '速率波動',
  'estimator.formula.var.sigmaR.description': '各月處理速率的標準差，反映處理步調逐月波動的幅度。',
  'estimator.formula.var.rBar.title': '月均處理速率',
  'estimator.formula.var.rBar.description': '把各月處理速率按月份數均等平均，而非按件數加權。',
  'estimator.formula.var.uDays.title': '誤差範圍',
  'estimator.formula.var.uDays.description': '結果旁顯示的 ± 幅度，表示處理步調若像近期一樣波動，預計日期會有多大變化。',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': '受理與處理',
  'charts.intake.description':
    '每月結轉與受理的申請件數，對照各管理局完成處理的數量及其中獲准的比例。',
  'charts.intake.aria':
    '每月待處理與受理申請件數的堆疊長條圖，並以折線呈現已處理數量，另以0至100%的右側縱軸用折線呈現核准率',
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

  // ── Chart: Intake & Processing — policy event markers ────────────────────
  'policy.eventsShow': '顯示政策事件',
  'policy.eventsHide': '隱藏政策事件',
  'policy.ssw2019.title': '新設特定技能',
  'policy.ssw2019.description': '面向人力短缺產業的居留資格；出入國在留管理廳同日成立。',
  'policy.covidClosure.title': '疫情期間的入境限制',
  'policy.covidClosure.description': '隨著疫情擴散，拒絕入境的對象地區擴大到世界大部分國家。',
  'policy.covidSuspension.title': '暫停全球新規入境',
  'policy.covidSuspension.description': '自12月下旬起，無論持何種簽證，外國人均不得新規入境。',
  'policy.covidOmicron.title': '因變異株再度關閉',
  'policy.covidOmicron.description': '11月8日恢復的新規入境，三週後再次喊停。',
  'policy.covidResume.title': '留學生與勞工重新入境',
  'policy.covidResume.description': '就業、留學與商務的新規入境重啟，並設有每日入境人數上限。',
  'policy.covidVisaFree.title': '恢復免簽旅行',
  'policy.covidVisaFree.description': '免簽措施恢復，每日入境人數上限也遭取消。',
  'policy.covidCoe.title': '延長認定證明書效期',
  'policy.covidCoe.description': '因封關未能入境的在留資格認定證明書，效期延長至三個月以上。',
  'policy.covidEnd.title': '邊境防疫措施結束',
  'policy.covidEnd.description': '檢測與疫苗證明查驗取消，新冠肺炎也調整為第5類傳染病。',
  'policy.act2023.title': '修訂入管法公布',
  'policy.act2023.description': '新設替代收容的監理措施與補充保護對象制度。',
  'policy.digitalNomad.title': '新設數位遊牧居留資格',
  'policy.digitalNomad.description': '提供海外企業遠距工作者及其家屬的六個月特定活動。',
  'policy.sswExpansion.title': '特定技能領域擴大',
  'policy.sswExpansion.description': '內閣決議新增四個領域並重新設定五年接收人數。',
  'policy.act2023Effect.title': '遣返與監理規定生效',
  'policy.act2023Effect.description': '2023年修訂入管法的主要規定開始施行。',
  'policy.act2024.title': '育成就勞取代技能實習',
  'policy.act2024.description': '技能實習制度將於2027年轉為育成就勞制度。',
  'policy.feeRevision2025.title': '在留手續費調漲',
  'policy.feeRevision2025.description': '在留期間更新調至6,000日圓，永住許可調至10,000日圓。',
  'policy.businessManager2025.title': '經營管理標準收緊',
  'policy.businessManager2025.description': '須提高資本額、僱用全職員工並由專家確認事業計畫。',
  'policy.residenceCard2026.title': '特定在留卡開始啟用',
  'policy.residenceCard2026.description': '在留卡與個人編號卡完成一體化。',
  'policy.act2026.title': '法定手續費上限提高',
  'policy.act2026.description': '2026年修訂法提高了在留許可手續費的法定上限。',

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
  'chart.mix.zoomInHintTap': '點按類別可查看詳情，再次點按可放大',
  'chart.mix.zoomOutHintTap': '點按背景以縮小',
  'chart.mix.others': '其他',
  'chart.mix.categoryAria': '{category}：{count} 件申請。放大檢視。',
  'chart.mix.tooltipValue': '{count} 件申請・占{scope}的 {percent}',
  'chart.mix.scopeAll': '所有申請',
  'chart.mix.sunburstHint': '{trail} — {count} 件申請（占整體 {percent}）',
  'chart.sunburst.hintClick': '點選扇區以放大 · 停留可查看詳情',
  'chart.sunburst.hintTap': '點按扇區可查看詳情，再次點按可放大',
  'chart.sunburst.zoomOutClick': '點選中心以縮小',
  'chart.sunburst.zoomOutTap': '點按中心以縮小',

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
  'map.loadError': '無法載入地圖資料，請嘗試重新載入頁面。',
  'map.loading': '地圖資料載入中…',
  'map.areaValue': '{value}km²',
  'map.densityValue': '{value}/km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': '更新日誌',
  'changelog.loading': '載入中…',
  'changelog.expandAll': '全部展開',
  'changelog.collapseAll': '全部收合',

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
  'a11y.policyEvents': '本圖表中顯示的政策事件',

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

  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.label': '資料集',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': '選擇要查看的資料集',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': '在留審查辦理',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': '審查辦理',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': '在留外國人人口',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': '在留外國人',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': '目前無法載入在留外國人資料。',
  'charts.growth.label': '在留人口成長',
  'charts.growth.description': '按半年顯示外國居民總數,可依居留目的或世界區域堆疊。',
  'charts.growth.aria': '依在留資格組或區域堆疊的半年度外國居民總數長條圖',
  'charts.origins.label': '各國籍人數變化',
  'charts.origins.description': '在統計涵蓋的每個半年期內，主要國籍的人數是如何增減的。',
  'charts.origins.aria': '依國籍顯示在留人數隨時間變化的堆疊面積圖',
  'charts.flows.label': '從國籍到在留資格',
  'charts.flows.description': '從世界區域經國家流向居留目的——選擇區域或國籍即可追蹤其組成。',
  'charts.flows.aria': '顯示居民從世界區域經國家流向在留資格類別的桑基圖',
  'charts.statuses.label': '在留資格組成',
  'charts.statuses.description': '在留者持有的簽證，依居留目的分組。點擊某個分組可展開其下的個別資格。',
  'charts.statuses.aria': '依在留資格組與個別資格顯示居民數的旭日圖',
  'charts.worldmap.label': '來源國分布',
  'charts.worldmap.description': '日本在留外國人的來源國，依持有各國籍的人數深淺著色。',
  'charts.worldmap.aria': '依來源國在留人數著色的世界地圖',
  'charts.movers.label': '增減最大的項目',
  'charts.movers.description': '兩個時期之間增減幅度最大的國籍或在留資格。',
  'charts.movers.aria': '將兩個時期之間的增加與減少依幅度左右排列的長條圖',

  'filters.region': '地區',
  'filters.allRegions': '所有地區',
  'filters.nationality': '國籍',
  'filters.residenceStatus': '在留資格',
  'filters.allNationalities': '所有國籍',
  'filters.allStatuses': '所有在留資格',
  'filters.allCategories': '所有類別',

  'period.snapshotLabel': '快照時點',
  'period.latestPeriod': '最新時期',
  // 'period.years_one': '{count} year',
  'period.years_other': '{count}年',

  'residents.total': '在留外國人數',
  'residents.total.short': '在留人數',
  'residents.delta': '較上期 {delta}',
  'residents.populationShare': '佔總人口比例',
  'residents.populationShare.short': '人口佔比',
  'residents.populationShareOf': '佔日本總人口 {population} 人',
  'residents.topNationality': '人數最多的國籍',
  'residents.topNationality.short': '最多國籍',
  'residents.topStatus': '人數最多的在留資格',
  'residents.topStatus.short': '最多資格',
  'residents.share': '占總數的 {share}',
  'residents.scope': '{nationality}（{status}）',
  'residents.otherNationalities': '其他國籍',
  'residents.noMapArea': '有 {count} 個國籍在地圖上沒有對應區域，因此未著色。',
  'residents.legendScale': '在留人數',
  'residents.discontinued': '此系列於 {period} 結束：該類別已被合併或改名。',
  'residents.comparePeriod': '與 {period} 相比',
  'residents.byNationality': '依國籍',
  'residents.byStatus': '依在留資格',
  'residents.increase': '增加',
  'residents.decrease': '減少',
  'residents.asOf': '截至 {period}',
  'residents.noChange': '這兩個時期之間沒有明顯變化。',
  'residents.coverageRange': '{from} – {to}',
  'residents.stackByGroup': '依居留目的',
  'residents.stackByRegion': '依世界區域',
  'residents.stackByNationality': '依國籍',
  'residents.growthTotal': '總計',
  'residents.viewAbsolute': '人數',
  'residents.viewIndexed': '成長指數',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': '人',
  'residents.flowsTooltipValueLabel': '居民數',
  'residents.flowsTooltipFlowLabel': '流量',
  'residents.sunburstHint': '{trail} — {count} 人(佔總數 {percent})',
  'residents.markerResidenceCard.title': '在留卡制度啟用',
  'residents.markerResidenceCard.description': '在留卡取代外國人登錄，本統計自啟用後的首個時點開始。',
  'residents.markerReopening.title': '邊境重新開放',
  'residents.markerReopening.description': '2022年10月免簽旅行恢復，在留人數重新回到成長軌道。',
  'residents.markerTraining.title': '育成就勞取代技能實習',
  'residents.markerTraining.description': '2024年修訂新設育成就勞制度，並收緊永住許可的要件。',
  'residents.markerBusinessManager.title': '經營管理標準收緊',
  'residents.markerBusinessManager.description': '自2025年10月起須提高資本額、僱用全職員工並由專家確認事業計畫。',
  'residents.markerSsw.title': '「特定技能」簽證上路',
  'residents.markerSsw.description': '2019 年 4 月新設的在留資格,向十多個產業開放技能型外國勞工。',
  'residents.markerCovid.title': '新冠疫情邊境管制',
  'residents.markerCovid.description': '入境限制凍結了新入境,居民人數下滑持續至 2022 年年中。',
  'residents.markerKoreaSplit.title': '韓國·朝鮮統計拆分',
  'residents.markerKoreaSplit.description': '統計中「韓國·朝鮮」拆分為「韓國」與「朝鮮」兩個序列——屬統計口徑變更,並非人口變動。',

  'statusGroup.work': '就業',
  'statusGroup.training': '研修實習',
  'statusGroup.study': '留學文化',
  'statusGroup.family': '家庭',
  'statusGroup.residency': '居住',
  'statusGroup.other': '其他',
  // ── World regions. ICU is tried first, but Chrome ships no names for M49
  // macro-regions, so these are what actually renders there. ────────────────
  'region.1000': '亞洲',
  'region.2000': '歐洲',
  'region.3000': '非洲',
  'region.4000': '北美洲',
  'region.5000': '南美洲',
  'region.6000': '大洋洲',
  'region.7000': '無國籍',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'nationality.1120': '朝鮮籍',
  'nationality.1130': '韓國・朝鮮合計',
  'nationality.2290': '塞爾維亞及蒙特內哥羅',
  'nationality.2500': '南斯拉夫',
  'nationality.7000': '無國籍',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': '總數',
  'status.1040': '教授',
  'status.1050': '藝術',
  'status.1060': '宗教',
  'status.1070': '報導',
  'status.1080': '高度專門職',
  'status.1090': '高度專門職1號（甲）',
  'status.1100': '高度專門職1號（乙）',
  'status.1110': '高度專門職1號（丙）',
  'status.1120': '高度專門職2號',
  'status.1130': '投資・經營',
  'status.1140': '經營・管理',
  'status.1150': '法律・會計業務',
  'status.1160': '醫療',
  'status.1170': '研究',
  'status.1180': '教育',
  'status.1190': '技術',
  'status.1200': '人文知識・國際業務',
  'status.1210': '技術・人文知識・國際業務',
  'status.1220': '企業內調動',
  'status.1230': '看護',
  'status.1240': '表演',
  'status.1250': '技能',
  'status.1260': '特定技能',
  'status.1270': '特定技能1號',
  'status.1280': '特定技能2號',
  'status.1290': '技能實習',
  'status.1300': '技能實習1號（甲）',
  'status.1310': '技能實習1號（乙）',
  'status.1320': '技能實習2號（甲）',
  'status.1330': '技能實習2號（乙）',
  'status.1340': '技能實習3號（甲）',
  'status.1350': '技能實習3號（乙）',
  'status.1360': '文化活動',
  'status.1380': '留學',
  'status.1400': '研修',
  'status.1410': '家屬滯在',
  'status.1420': '特定活動',
  'status.1430': '永住者',
  'status.1440': '日本人的配偶等',
  'status.1450': '永住者的配偶等',
  'status.1460': '定住者',
  'status.1470': '特別永住者',
  'residents.mixRoot': '全部在留者',
  'residents.mixScopeAll': '全部在留者',
  'residents.mixCategoryAria': '{category}：{count} 人。展開查看。',
  'residents.mixTooltipValue': '{count} 人 · 占{scope}的 {percent}',
};
