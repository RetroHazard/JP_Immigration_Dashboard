// src/i18n/locales/ko.ts
// Korean catalogue — complete coverage of the English source.
//
// Conventions, kept deliberately consistent so the file reads as one voice:
//
// - Noun-phrase endings (체언止め) for anything that labels a control: buttons,
//   tabs, filter labels, column headers, stat-tile titles. Formal polite
//   endings (-습니다/-입니다) for anything that speaks to the reader:
//   explanatory prose, warnings, empty and error states.
// - Institutional/official terminology is rendered with the Sino-Korean
//   reading of Japan's own agency vocabulary — 出入国在留管理庁 as
//   출입국재류관리청, 支局 as 지국 — the same way Korean news coverage refers to
//   Japanese ministries and agencies. Application types use that same
//   register: 재류자격 취득허가 신청, and so on.
// - Place names (bureaus' city names, prefectures) are transliterated by sound
//   per modern Korean convention (외래어 표기법), not by Sino-Korean Hanja
//   reading — 東京 is 도쿄, not 동경; 大阪 is 오사카, not 대판 — matching how
//   Korean atlases and news media render Japanese place names today.
// - No space between a number and its unit — 12,345건, 6개월, 1,234km².
// - Korean has a single CLDR plural category, so plural families define only
//   their `_other` member. `Intl.PluralRules('ko-KR')` never selects anything
//   else, and translate.ts falls back to `_other` regardless.
//
// A few values are intentionally identical to English: `nav.version` is a
// version number, and `bureau.*.short` are IATA-style codes that stay Latin in
// every language (see the note in en.ts).
import type { Dictionary } from '../types';

export const ko: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': '일본 출입국 통계',
  'app.subtitle': 'e-Stat 제공 관리국 처리 데이터 (자료 공개마다 갱신)',
  'app.skipToContent': '본문으로 건너뛰기',
  'app.loadingData': '출입국 통계 집계 중…',
  'app.loadingDashboard': '대시보드 불러오는 중…',
  'app.retry': '다시 시도',

  // ── Document metadata ────────────────────────────────────────────────────
  // Not yet reachable: the static export prerenders one English document (see
  // src/i18n/README.md). Translated so it is ready when per-locale routes are.
  'meta.title': '일본 출입국 통계 대시보드',
  'meta.description':
    '일본 출입국재류관리청의 공식 통계를 바탕으로 한 비자 처리 기간, 관리국별 업무량, 그리고 본인의 신청에 맞춘 대기열 모델 완료 시점 추정 - e-Stat에 새 데이터가 공개될 때마다(대개 매월) 갱신됩니다.',
  'meta.keywords': '일본 비자 처리 기간, 출입국관리국 통계, 비자 신청 추적, 출입국재류관리청, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': '언어',
  'nav.switchToLightTheme': '라이트 테마로 전환',
  'nav.switchToDarkTheme': '다크 테마로 전환',
  'nav.openSettings': '설정 메뉴 열기',
  'nav.settings': '설정',
  'nav.theme': '테마',
  'nav.themeLight': '라이트',
  'nav.themeDark': '다크',
  'nav.about': '소개',
  'nav.changelog': '변경 이력',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': '데이터: {range}',
  'dashboard.coverageRange': '{from} ~ {to}',
  'dashboard.comparisonSuffix': '(비교)',
  'dashboard.expandEstimator': '처리 기간 예상 도구 펼치기',
  'dashboard.estimatorRail': '예상 도구',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': '출입국관리국',
  'filters.appType': '신청 유형',
  'filters.compare': '비교 대상',
  'filters.compareNone': '없음',
  'filters.excludeAirports': '공항 지국 제외',
  'filters.includeAirports': '공항 지국 포함',
  'filters.reset': '필터 초기화',
  'filters.selectPlaceholder': '선택',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': '기간',
  'period.latest': '최근 월',
  'period.all': '전체 기간',
  'period.months_other': '{count}개월',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': '총 신청 건수',
  'stats.totalApplications.short': '총계',
  'stats.pending': '처리 대기',
  'stats.granted': '허가',
  'stats.denied': '불허가',
  'stats.approvalRate': '허가율',
  'stats.approvalRate.short': '허가율',
  'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '전월 대비 {delta}',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': '이월',
  'metric.pending': '미처리(이월)',
  'metric.received': '접수',
  'metric.processed': '처리',
  'metric.granted': '허가',
  'metric.denied': '불허가',
  'metric.other': '기타',
  'metric.completion': '처리율',
  'metric.applications': '신청 건수',
  'metric.population': '인구',
  'metric.area': '면적',
  'metric.density': '인구 밀도',
  'common.noDataForFilters': '이 필터 조합에 해당하는 데이터가 없습니다.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': '데이터 표 보기',
  'table.hide': '데이터 표 숨기기',
  'table.downloadCsv': 'CSV 다운로드',
  'table.caption': '{bureau}의 월별 신청 통계',
  'table.month': '월',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': '처리 기간 예상 도구',
  'estimator.description': '최근 6개월간 관리국 처리 실적을 바탕으로 한 대기열 모델 추정치입니다.',
  'estimator.selectBureau': '관리국 선택',
  'estimator.selectType': '유형 선택',
  'estimator.applicationDate': '신청일',
  'estimator.empty': '관리국, 신청 유형, 신청일을 선택하면 신청이 처리되는 시점을 예상할 수 있습니다.',
  'estimator.estimatedCompletion': '예상 완료 시점',
  'estimator.queuePosition': '대기 순위',
  'estimator.aheadOfYou': '약 {count}건 앞서 대기 중',
  'estimator.howCalculated': '이 값은 어떻게 계산되나요?',
  'estimator.showMath': '계산식 보기',
  'estimator.hideMath': '계산식 숨기기',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': '예상 도구 초기화',
  'estimator.resetAria': '처리 기간 예상 도구 초기화',
  'estimator.collapse': '예상 도구 접기',
  'estimator.collapseAria': '처리 기간 예상 도구 접기',
  'estimator.close': '예상 도구 닫기',
  'estimator.closeAria': '처리 기간 예상 도구 닫기',
  'estimator.copyPermalink': '이 예상 결과의 고정 링크 복사',
  'estimator.copied': '복사됨!',
  // Joined with " · " at the call site, so each half stands on its own.
  'estimator.uncertaintyDays_other': '±{count}일',
  'estimator.uncertaintyWeeks_other': '±{count}주',
  'estimator.basedOnMonths_other': '최근 {count}개월간의 처리 실적 기준',
  // Warnings.
  'estimator.limitedDataTitle': '제한된 데이터로 추정됨:',
  'estimator.limitedDataBody_other':
    '신청일이 확보된 데이터 범위를 벗어났습니다. 이 예상치는 {count}개월간의 과거 데이터를 바탕으로 시뮬레이션한 처리 속도를 기준으로 하며, 정확도가 낮을 수 있습니다.',
  'estimator.pastDueTitle': '처리 예정일이 지났을 수 있습니다:',
  'estimator.pastDueBody':
    '예상 처리 속도를 기준으로 볼 때, 이 신청은 완료 예정 시점이 지났을 가능성이 있습니다. 추가 서류 요청이나 처분 통지를 아직 받지 못하셨다면 관할 관리국에 문의하시기 바랍니다.',
  // {emphasis} is the word "예상치", rendered bold and underlined.
  'estimator.disclaimer':
    '*이는 현재 처리 속도, 예상 대기 순위, 미처리 신청 건수를 바탕으로 한 {emphasis}입니다. 실제 처리 기간은 다를 수 있습니다.',
  'estimator.disclaimerEmphasis': '예상치',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': '신청 시점의 대기열',
  'estimator.formula.step2': '대기 순위 및 일일 처리율',
  'estimator.formula.step3': '남은 일수',
  'estimator.formula.explainAria': '{title} 계산식의 변수 설명',
  'estimator.formula.var.dRem.title': '남은 일수',
  'estimator.formula.var.dRem.description': '처리가 완료될 때까지 예상되는 일수입니다.',
  'estimator.formula.var.qPos.title': '대기 순위',
  'estimator.formula.var.qPos.description': '처리 대기열 내 예상 순위입니다.',
  'estimator.formula.var.rDaily.title': '일일 처리율',
  'estimator.formula.var.rDaily.description': '하루 평균 처리 건수입니다.',
  'estimator.formula.var.cProc.title': '확정 처리 건수',
  'estimator.formula.var.cProc.description': '신청 이후 실제로 처리된 것으로 확인된 건수입니다.',
  'estimator.formula.var.eProc.title': '추정 처리 건수',
  'estimator.formula.var.eProc.description': '마지막 데이터 시점 이후 처리되었을 것으로 추정되는 건수입니다.',
  'estimator.formula.var.sigmaP.title': '총 처리 건수',
  'estimator.formula.var.sigmaP.description': '평균 계산에 사용된 처리 건수의 합계입니다.',
  'estimator.formula.var.sigmaD.title': '총 일수',
  'estimator.formula.var.sigmaD.description': '평균 계산에 사용된 일수의 합계입니다.',
  'estimator.formula.var.qApp.title': '신청 시점 대기열',
  'estimator.formula.var.qApp.description': '신청 시점의 예상 대기 순위입니다.',
  'estimator.formula.var.cPrev.title': '전월 이월',
  'estimator.formula.var.cPrev.description': '전월에서 이월된 신청 건수입니다.',
  'estimator.formula.var.nApp.title': '신규 신청',
  'estimator.formula.var.nApp.description': '신청 이전에 접수되었을 것으로 추정되는 건수입니다.',
  'estimator.formula.var.pApp.title': '처리된 신청',
  'estimator.formula.var.pApp.description': '신청 이전에 처리되었을 것으로 추정되는 건수입니다.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': '접수 및 처리',
  'charts.intake.description': '매월 이월 및 접수된 신청 건수와 관리국이 처리한 건수를 함께 보여줍니다.',
  'charts.intake.aria': '월별 미처리 및 접수 건수를 누적 막대로, 처리 건수를 선으로 표시한 그래프',
  'charts.types.label': '신청 유형',
  'charts.types.description':
    '월별 신규 접수 건수를 신청 유형별로 나눈 그래프입니다. 범례를 클릭하면 계열을 표시하거나 숨길 수 있습니다.',
  'charts.types.aria': '신청 유형별 월별 신규 접수 건수를 나타낸 선 그래프',
  'charts.outcomes.label': '처리 결과',
  'charts.outcomes.description': '신청이 어떤 결과로 이어지는지, 유형별로 허가·불허가·기타로 흐르는 흐름을 보여줍니다.',
  'charts.outcomes.aria': '신청 유형이 처리 결과로 흐르는 모습을 나타낸 산키 다이어그램',
  'charts.share.label': '관리국별 비중',
  'charts.share.description': '신청이 어느 관리국에 접수되었는지, 전체 접수 건수에서 각 관리국이 차지하는 비중입니다.',
  'charts.share.aria': '각 관리국의 접수 건수 비중을 나타낸 도넛 차트',
  'charts.mix.label': '유형 구성',
  'charts.mix.description':
    '신청 유형과 관리국별 전체 신청 구성입니다. 항목을 클릭하면 세부 내역을 확대해 볼 수 있습니다.',
  'charts.efficiency.label': '처리 효율',
  'charts.efficiency.description':
    '처리율 순으로 정렬된 관리국 목록입니다. 선의 굵기는 접수 건수를 나타내며, 전국 처리율을 기준선으로 표시합니다.',
  'charts.efficiency.aria': '처리율 순으로 정렬된 관리국 목록. 선의 굵기는 접수 건수를 나타냄',
  'charts.map.label': '지역별 지도',
  'charts.map.description': '관리국 관할 구역과 인구 밀도, 관리국 및 공항 지국의 위치를 보여줍니다.',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': '신청 유형과 관리국별 신청 건수를 나타낸 선버스트 차트. 드릴다운 조작 가능',
  'charts.efficiencyQuadrant.aria': '관리국별 처리율과 접수 건수를 나타낸 사분면 차트. 버블 크기는 처리 건수를 나타냄',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': '{series} 표시',
  'chart.legendHide': '{series} 숨기기',
  'chart.allSeriesHidden': '모든 계열이 숨겨져 있습니다. 범례를 클릭하면 표시됩니다.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': '자격취득',
  'chart.types.series.extension': '기간갱신',
  'chart.types.series.change': '자격변경',
  'chart.types.series.activity': '자격외활동',
  'chart.types.series.reentry': '재입국',
  'chart.types.series.permanent': '영주',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': '기타/취하',
  'chart.outcomes.valueUnit': '건',
  'chart.outcomes.tooltipValueLabel': '신청 건수',
  'chart.outcomes.tooltipFlowLabel': '흐름',
  'chart.outcomes.approvalRate': '허가율',
  'chart.outcomes.ofProcessed': '처리 건수 {count}건 중',
  'chart.outcomes.empty': '이 기간에 처리된 신청이 없습니다.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': '기타 ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': '전체 신청',
  'chart.mix.breadcrumbAria': '트리맵 드릴다운 경로',
  'chart.mix.zoomInHint': '항목을 클릭하면 확대됩니다',
  'chart.mix.zoomOutHint': '배경을 클릭하거나 Esc 키를 누르면 축소됩니다',
  'chart.mix.others': '기타',
  'chart.mix.categoryAria': '{category}: {count}건. 확대.',
  'chart.mix.tooltipValue': '{count}건 · {scope}의 {percent}',
  'chart.mix.scopeAll': '전체 신청',
  'chart.mix.sunburstHint': '{trail} — {count}건 (전체의 {percent})',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': '지국',
  'chart.efficiency.receivedCount': '접수 {count}건',
  'chart.efficiency.nationwide': '전국 {rate}',
  'chart.efficiency.pointAria': '{bureau}: 처리율 {rate}퍼센트, 접수 {count}건',
  'chart.efficiency.xAxis': '접수 건수',
  'chart.efficiency.fullCompletion': '접수 건수의 100% 처리',
  'chart.efficiency.quadrantKeepingPace': '대량 접수 · 처리 순조',
  'chart.efficiency.quadrantFallingBehind': '대량 접수 · 처리 지연',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  'map.bureauMarkerAria': '{bureau} 관리국',
  'map.airportMarkerAria': '{bureau} 공항 지국',
  'map.bureauSuffix': '{bureau} 관리국',
  'map.airportSuffix': '{bureau} 공항 지국',
  'map.servicePopulation': '관할 인구',
  'map.serviceArea': '관할 면적',
  'map.serviceBureau': '관할 관리국',
  'map.portOfEntry': '출입국항 사무소',
  'map.legendNote': '색상 = 관할 관리국 · 명도 = 인구 밀도',
  'map.bureau': '관리국',
  'map.airportOffice': '공항 지국',
  'map.zoomIn': '확대',
  'map.zoomOut': '축소',
  'map.resetView': '보기 초기화',
  'map.loadError': '지도 데이터를 불러올 수 없습니다. 페이지를 새로고침해 주세요.',
  'map.loading': '지도 데이터 불러오는 중…',
  'map.areaValue': '{value}km²',
  'map.densityValue': '{value}명/km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': '변경 이력',
  'changelog.loading': '불러오는 중…',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': '데이터 로딩 오류',
  'errors.noData': '데이터가 없습니다',
  'errors.unknown': '알 수 없는 오류가 발생했습니다',
  'errors.fetchFailed': '데이터를 가져오지 못했습니다',
  'errors.renderTitle': '문제가 발생했습니다',
  'errors.renderBody': '화면을 표시하는 중 오류가 발생했습니다.',
  'errors.reload': '페이지 새로고침',
  'errors.changelogUnavailable': '변경 이력을 불러올 수 없습니다.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': '{bureau}의 {chart} 표시 중',
  'a11y.showingChartWithType': '{bureau}, {type}의 {chart} 표시 중',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': '일본 출입국재류관리청 제공 공식 통계',
  'footer.dataAcquisition': '데이터 수집: {source}',
  'footer.fixtureNotice': '생성된 예시 데이터를 표시 중',
  'footer.builtBy': '제작: {author}',
  'footer.dataUpdated': '데이터 갱신일 {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Full official office names, rendered with the Sino-Korean reading of the
  // agency's own terminology (출입국재류관리국, 지국 for 支局), and city names
  // transliterated by sound. `.short` stays Latin (IATA codes). `.compact` is
  // the place name alone, for the surfaces that measure in pixels — without it
  // every Tokyo-family office truncates to the same prefix.
  'bureau.all': '전국',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': '전국',
  'bureau.101010': '삿포로출입국재류관리국',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': '삿포로',
  'bureau.101090': '센다이출입국재류관리국',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': '센다이',
  'bureau.101170': '도쿄출입국재류관리국',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': '도쿄',
  'bureau.101190': '도쿄출입국재류관리국 나리타공항지국',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': '나리타공항',
  'bureau.101200': '도쿄출입국재류관리국 하네다공항지국',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': '하네다공항',
  'bureau.101210': '도쿄출입국재류관리국 요코하마지국',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': '요코하마',
  'bureau.101350': '나고야출입국재류관리국',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': '나고야',
  'bureau.101370': '나고야출입국재류관리국 주부공항지국',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': '주부공항',
  'bureau.101460': '오사카출입국재류관리국',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': '오사카',
  'bureau.101480': '오사카출입국재류관리국 간사이공항지국',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': '간사이공항',
  'bureau.101490': '오사카출입국재류관리국 고베지국',
  'bureau.101490.short': 'UKB',
  'bureau.101490.compact': '고베',
  'bureau.101580': '히로시마출입국재류관리국',
  'bureau.101580.short': 'HIJ',
  'bureau.101580.compact': '히로시마',
  'bureau.101670': '다카마쓰출입국재류관리국',
  'bureau.101670.short': 'TAK',
  'bureau.101670.compact': '다카마쓰',
  'bureau.101720': '후쿠오카출입국재류관리국',
  'bureau.101720.short': 'FUK',
  'bureau.101720.compact': '후쿠오카',
  'bureau.101740': '후쿠오카출입국재류관리국 나하지국',
  'bureau.101740.short': 'OKA',
  'bureau.101740.compact': '나하',

  // ── Domain: application types ────────────────────────────────────────────
  // The agency's own procedure names, in Sino-Korean reading. `.short` uses
  // two-character forms a Korean reader can scan on a stat tile, where the
  // Latin codes English uses would carry no meaning; `.compact` is the narrow
  // Sankey's one-word form.
  'appType.all': '전체 유형',
  'appType.all.short': '전체',
  'appType.all.compact': '전체',
  'appType.10': '재류자격 취득허가 신청',
  'appType.10.short': '취득',
  'appType.10.compact': '자격취득',
  'appType.20': '재류기간 갱신허가 신청',
  'appType.20.short': '갱신',
  'appType.20.compact': '기간갱신',
  'appType.30': '재류자격 변경허가 신청',
  'appType.30.short': '변경',
  'appType.30.compact': '자격변경',
  'appType.40': '자격외활동 허가 신청',
  'appType.40.short': '자격외',
  'appType.40.compact': '자격외활동',
  'appType.50': '재입국허가 신청',
  'appType.50.short': '재입국',
  'appType.50.compact': '재입국',
  'appType.60': '영주허가 신청',
  'appType.60.short': '영주',
  'appType.60.compact': '영주',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code, transliterated by sound with the
  // administrative suffix (도/부/현) matching the prefecture's own type —
  // 都 as 도, 府 as 부, 県 as 현 — the same pattern Korean reference works use
  // for Japanese prefectures. Hokkaido already ends in 道/도 and takes no
  // further suffix.
  'prefecture.1': '홋카이도',
  'prefecture.2': '아오모리현',
  'prefecture.3': '이와테현',
  'prefecture.4': '미야기현',
  'prefecture.5': '아키타현',
  'prefecture.6': '야마가타현',
  'prefecture.7': '후쿠시마현',
  'prefecture.8': '이바라키현',
  'prefecture.9': '도치기현',
  'prefecture.10': '군마현',
  'prefecture.11': '사이타마현',
  'prefecture.12': '지바현',
  'prefecture.13': '도쿄도',
  'prefecture.14': '가나가와현',
  'prefecture.15': '니가타현',
  'prefecture.16': '도야마현',
  'prefecture.17': '이시카와현',
  'prefecture.18': '후쿠이현',
  'prefecture.19': '야마나시현',
  'prefecture.20': '나가노현',
  'prefecture.21': '기후현',
  'prefecture.22': '시즈오카현',
  'prefecture.23': '아이치현',
  'prefecture.24': '미에현',
  'prefecture.25': '시가현',
  'prefecture.26': '교토부',
  'prefecture.27': '오사카부',
  'prefecture.28': '효고현',
  'prefecture.29': '나라현',
  'prefecture.30': '와카야마현',
  'prefecture.31': '돗토리현',
  'prefecture.32': '시마네현',
  'prefecture.33': '오카야마현',
  'prefecture.34': '히로시마현',
  'prefecture.35': '야마구치현',
  'prefecture.36': '도쿠시마현',
  'prefecture.37': '가가와현',
  'prefecture.38': '에히메현',
  'prefecture.39': '고치현',
  'prefecture.40': '후쿠오카현',
  'prefecture.41': '사가현',
  'prefecture.42': '나가사키현',
  'prefecture.43': '구마모토현',
  'prefecture.44': '오이타현',
  'prefecture.45': '미야자키현',
  'prefecture.46': '가고시마현',
  'prefecture.47': '오키나와현',

  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.label': '데이터 세트',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': '살펴볼 데이터 세트를 선택합니다',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': '체류 심사 처리',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': '심사 처리',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': '체류 외국인 인구',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': '체류 외국인',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': '체류 외국인 데이터를 지금은 불러올 수 없습니다.',
  'charts.growth.label': '체류자 수 추이',
  'charts.growth.description': '외국인 체류자 총수를 반기별로 체류 목적별 또는 지역별로 누적해 표시합니다.',
  'charts.growth.aria': '반기별 외국인 체류자 총수를 체류자격 그룹 또는 지역별로 누적한 막대 차트',
  'charts.origins.label': '국적별 추이',
  'charts.origins.description': '통계가 다루는 각 반기 동안 주요 국적이 어떻게 늘고 줄었는지 보여 줍니다.',
  'charts.origins.aria': '국적별 체류자 수의 추이를 나타낸 누적 영역 차트',
  'charts.flows.label': '국적에서 체류자격으로',
  'charts.flows.description': '세계 지역에서 국가, 체류 목적으로 이어지는 흐름. 지역이나 국적을 선택하면 해당 프로필을 추적할 수 있습니다.',
  'charts.flows.aria': '지역에서 국가, 체류자격 카테고리로 이어지는 체류자 흐름을 나타내는 생키 다이어그램',
  'charts.statuses.label': '체류 자격 구성',
  'charts.statuses.description':
    '체류자가 보유한 비자를 체류 목적별로 묶었습니다. 그룹을 클릭하면 세부 자격이 열립니다.',
  'charts.statuses.aria': '체류자격 그룹 및 개별 자격별 체류자 수를 나타내는 선버스트 차트',
  'charts.worldmap.label': '출신국 분포',
  'charts.worldmap.description': '일본에 사는 외국인의 출신국을, 해당 국적자 수에 따른 음영으로 표시합니다.',
  'charts.worldmap.aria': '출신국별 체류자 수를 음영으로 나타낸 세계 지도',
  'charts.movers.label': '증감이 큰 항목',
  'charts.movers.description': '두 시점 사이에 가장 크게 늘거나 줄어든 국적 또는 체류 자격입니다.',
  'charts.movers.aria': '두 시점 사이의 증가와 감소를 좌우로 나눠 큰 순서대로 배열한 막대 차트',

  'filters.region': '지역',
  'filters.allRegions': '모든 지역',
  'filters.nationality': '국적',
  'filters.residenceStatus': '체류 자격',
  'filters.allNationalities': '모든 국적',
  'filters.allStatuses': '모든 체류 자격',
  'filters.allCategories': '모든 카테고리',

  'period.snapshotLabel': '표시 시점',
  'period.latestPeriod': '최신 시점',
  // 'period.years_one': '{count} year',
  'period.years_other': '{count}년',

  'residents.total': '체류 외국인 수',
  'residents.total.short': '체류자 수',
  'residents.delta': '전기 대비 {delta}',
  'residents.populationShare': '총인구 대비 비율',
  'residents.populationShare.short': '인구 비율',
  'residents.populationShareOf': '일본 총인구 {population}명 대비',
  'residents.topNationality': '가장 많은 국적',
  'residents.topNationality.short': '최다 국적',
  'residents.topStatus': '가장 많은 체류 자격',
  'residents.topStatus.short': '최다 자격',
  'residents.share': '전체의 {share}',
  'residents.scope': '{nationality} ({status})',
  'residents.otherNationalities': '그 밖의 국적',
  'residents.noMapArea': '{count}개 국적은 지도에 영역이 없어 음영으로 표시되지 않습니다.',
  'residents.legendScale': '체류자 수',
  'residents.discontinued': '{period}에 계열이 끝납니다. 구분이 통합되거나 이름이 바뀌었습니다.',
  'residents.comparePeriod': '{period} 대비',
  'residents.byNationality': '국적별',
  'residents.byStatus': '체류 자격별',
  'residents.increase': '증가',
  'residents.decrease': '감소',
  'residents.asOf': '{period} 기준',
  'residents.noChange': '두 시점 사이에 뚜렷한 변화가 없습니다.',
  'residents.coverageRange': '{from} ~ {to}',
  'residents.stackByGroup': '체류 목적별',
  'residents.stackByRegion': '지역별',
  'residents.stackByNationality': '국적별',
  'residents.growthTotal': '합계',
  'residents.viewAbsolute': '인원수',
  'residents.viewIndexed': '지수(증가율)',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': '명',
  'residents.flowsTooltipValueLabel': '체류자 수',
  'residents.flowsTooltipFlowLabel': '흐름',
  'residents.sunburstHint': '{trail} — {count}명 (전체의 {percent})',
  'residents.markerSsw.title': '특정기능 제도 시행',
  'residents.markerSsw.description': '2019년 4월 신설된 체류자격으로, 여러 산업 분야에서 외국인 노동자 수용이 시작되었습니다.',
  'residents.markerCovid.title': '코로나19 국경 제한',
  'residents.markerCovid.description': '입국 제한으로 신규 입국이 중단되어 2022년 중반까지 체류자 수가 감소했습니다.',
  'residents.markerKoreaSplit.title': '한국·조선 통계 분리',
  'residents.markerKoreaSplit.description': '통계상 ‘한국·조선’ 항목이 ‘한국’과 ‘조선’으로 분리되었습니다. 집계 방식 변경일 뿐 인구 변동이 아닙니다.',

  'statusGroup.work': '취업',
  'statusGroup.training': '연수・실습',
  'statusGroup.study': '유학・문화',
  'statusGroup.family': '가족',
  'statusGroup.residency': '거주',
  'statusGroup.other': '기타',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'region.7000': '무국적',
  'nationality.1120': '조선적',
  'nationality.1130': '한국・조선 합계',
  'nationality.2290': '세르비아 몬테네그로',
  'nationality.2500': '유고슬라비아',
  'nationality.7000': '무국적',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': '총수',
  'status.1040': '교수',
  'status.1050': '예술',
  'status.1060': '종교',
  'status.1070': '보도',
  'status.1080': '고도 전문직',
  'status.1090': '고도 전문직 1호 (가)',
  'status.1100': '고도 전문직 1호 (나)',
  'status.1110': '고도 전문직 1호 (다)',
  'status.1120': '고도 전문직 2호',
  'status.1130': '투자・경영',
  'status.1140': '경영・관리',
  'status.1150': '법률・회계 업무',
  'status.1160': '의료',
  'status.1170': '연구',
  'status.1180': '교육',
  'status.1190': '기술',
  'status.1200': '인문 지식・국제 업무',
  'status.1210': '기술・인문 지식・국제 업무',
  'status.1220': '기업 내 전근',
  'status.1230': '간병',
  'status.1240': '흥행',
  'status.1250': '기능',
  'status.1260': '특정 기능',
  'status.1270': '특정 기능 1호',
  'status.1280': '특정 기능 2호',
  'status.1290': '기능 실습',
  'status.1300': '기능 실습 1호 (가)',
  'status.1310': '기능 실습 1호 (나)',
  'status.1320': '기능 실습 2호 (가)',
  'status.1330': '기능 실습 2호 (나)',
  'status.1340': '기능 실습 3호 (가)',
  'status.1350': '기능 실습 3호 (나)',
  'status.1360': '문화 활동',
  'status.1380': '유학',
  'status.1400': '연수',
  'status.1410': '가족 체재',
  'status.1420': '특정 활동',
  'status.1430': '영주자',
  'status.1440': '일본인의 배우자 등',
  'status.1450': '영주자의 배우자 등',
  'status.1460': '정주자',
  'status.1470': '특별 영주자',
  'residents.mixRoot': '모든 체류자',
  'residents.mixScopeAll': '모든 체류자',
  'residents.mixCategoryAria': '{category}: {count}명. 자세히 보기.',
  'residents.mixTooltipValue': '{count}명 · {scope}의 {percent}',
};
