// src/i18n/locales/ja.ts
// Japanese catalogue — complete coverage of the English source.
//
// Conventions, kept deliberately consistent so the file reads as one voice:
//
// - 体言止め for anything that labels a control: buttons, tabs, filter labels,
//   column headers, stat-tile titles. です・ます for anything that speaks to the
//   reader: explanatory prose, warnings, empty and error states.
// - Official 出入国在留管理庁 terminology for the domain nouns. Application types
//   use the agency's own procedure names (在留資格取得許可申請 and so on), and
//   bureaus their full office names including 支局 status.
// - Full-width punctuation (：（）、。), ranges joined with 〜, and no space
//   between a number and its unit — 12,345件, 6か月, 1,234km².
// - Japanese has a single CLDR plural category, so plural families define only
//   their `_other` member. `Intl.PluralRules('ja-JP')` never selects anything
//   else, and translate.ts falls back to `_other` regardless.
//
// A few values are intentionally identical to English: `nav.version` is a
// version number, and `bureau.*.short` are IATA-style codes that stay Latin in
// every language (see the note in en.ts).
import type { Dictionary } from '../types';

export const ja: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': '日本 在留審査統計',
  'app.subtitle': '出入国在留管理庁の審査データ（e-Stat の公表に合わせて更新）',
  'app.skipToContent': '本文へスキップ',
  'app.loadingData': '在留統計を集計しています…',
  'app.loadingDashboard': 'ダッシュボードを読み込んでいます…',
  'app.retry': '再試行',

  // ── Document metadata ────────────────────────────────────────────────────
  // Not yet reachable: the static export prerenders one English document (see
  // src/i18n/README.md). Translated so it is ready when per-locale routes are.
  'meta.title': '日本 在留審査統計ダッシュボード',
  'meta.description':
    '在留審査の処理期間、地方出入国在留管理局ごとの処理状況、そして自分の申請に合わせた待ち行列モデルによる完了時期の推定。出入国在留管理庁の公式統計にもとづき、e-Stat の新規データ公表（おおむね月次）に合わせて更新しています。',
  'meta.keywords': '在留審査 処理期間, 出入国在留管理局 統計, 在留申請 進捗, 出入国在留管理庁, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': '言語',
  'nav.switchToLightTheme': 'ライトテーマに切り替え',
  'nav.switchToDarkTheme': 'ダークテーマに切り替え',
  'nav.openSettings': '設定メニューを開く',
  'nav.settings': '設定',
  'nav.theme': 'テーマ',
  'nav.themeLight': 'ライト',
  'nav.themeDark': 'ダーク',
  'nav.about': 'このサイトについて',
  'nav.changelog': '更新履歴',
  'nav.sourceCode': 'ソースコード',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': '対象期間：{range}',
  'dashboard.coverageRange': '{from}〜{to}',
  'dashboard.comparisonSuffix': '（比較）',
  'dashboard.expandEstimator': '審査期間の目安を開く',
  'dashboard.estimatorRail': '審査目安',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': '出入国在留管理局',
  'filters.appType': '申請種別',
  'filters.compare': '比較対象',
  'filters.compareNone': 'なし',
  'filters.excludeAirports': '空港支局を除く',
  'filters.includeAirports': '空港支局を含む',
  'filters.reset': 'フィルターをリセット',
  'filters.selectPlaceholder': '選択',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': '表示期間',
  'period.latest': '最新月',
  'period.all': '全期間',
  'period.months_other': '{count}か月',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': '申請総数',
  'stats.totalApplications.short': '総数',
  'stats.pending': '未処理',
  'stats.granted': '許可',
  'stats.denied': '不許可',
  'stats.approvalRate': '許可率',
  'stats.approvalRate.short': '許可率',
  'stats.scopeWithType': '{bureau}（{type}）',
  // {delta} arrives already signed and formatted, so it follows 前月比 directly.
  'stats.momDelta': '前月比{delta}',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // e-Stat's own column vocabulary for the source table (在留資格の取得等の
  // 受理及び処理人員), kept consistent across the table, legends, and hover cards.
  'metric.carriedOver': '繰越',
  'metric.pending': '未処理（繰越）',
  'metric.received': '受理',
  'metric.processed': '処理',
  'metric.granted': '許可',
  'metric.denied': '不許可',
  'metric.other': 'その他',
  'metric.approvalRate': '許可率',
  'metric.completion': '処理率',
  'metric.applications': '申請数',
  'metric.population': '人口',
  'metric.area': '面積',
  'metric.density': '人口密度',
  'common.noDataForFilters': 'この条件に該当するデータはありません。',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'データ表を表示',
  'table.hide': 'データ表を非表示',
  'table.downloadCsv': 'CSV をダウンロード',
  'table.month': '月',
  'table.prefecture': '都道府県',
  'table.shareOfTotal': '全体に占める割合',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': '審査期間の目安',
  'estimator.description': '直近6か月の処理実績にもとづく待ち行列モデルによる推定です。',
  'estimator.selectBureau': '管理局を選択',
  'estimator.selectType': '申請種別を選択',
  'estimator.applicationDate': '申請日',
  'estimator.empty': '出入国在留管理局、申請種別、申請日を選択すると、審査が完了する時期の目安が表示されます。',
  'estimator.estimatedCompletion': '完了予定時期',
  'estimator.queuePosition': '待ち順位',
  'estimator.aheadOfYou': '前に約{count}件',
  'estimator.howCalculated': '算出方法について',
  'estimator.showMath': '計算式を表示',
  'estimator.hideMath': '計算式を非表示',
  'estimator.reset': '目安をリセット',
  'estimator.resetAria': '審査期間の目安をリセット',
  'estimator.collapse': '目安を折りたたむ',
  'estimator.collapseAria': '審査期間の目安を折りたたむ',
  'estimator.close': '目安を閉じる',
  'estimator.closeAria': '審査期間の目安を閉じる',
  'estimator.copyPermalink': 'この推定結果のリンクをコピー',
  'estimator.copied': 'コピーしました',
  // Joined with " · " at the call site, so each half stands on its own.
  'estimator.uncertaintyDays_other': '±{count}日',
  'estimator.uncertaintyWeeks_other': '±{count}週間',
  'estimator.basedOnMonths_other': '直近{count}か月の処理実績にもとづく',
  // Warnings.
  'estimator.limitedDataTitle': 'データが限られています：',
  'estimator.limitedDataBody_other':
    '申請日がデータの対象期間を超えています。この推定は{count}か月分の実績から処理速度を推計したものであり、精度が低くなる場合があります。',
  'estimator.pastDueTitle': '完了予定を過ぎている可能性があります：',
  'estimator.pastDueBody':
    '想定される処理速度からみて、この申請は完了予定時期を過ぎている可能性があります。追加資料の求めや処分の通知がまだ届いていない場合は、申請先の官署にお問い合わせください。',
  // {emphasis} is the word 推定値, rendered bold and underlined.
  'estimator.disclaimer':
    '※これは現在の処理速度、想定される待ち順位、未処理件数にもとづく{emphasis}です。実際の審査期間は異なる場合があります。',
  'estimator.disclaimerEmphasis': '推定値',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': '処理能力の基準値',
  'estimator.formula.step2': '申請時点の待ち行列',
  'estimator.formula.step3': '申請後の処理件数',
  'estimator.formula.step4': '待ち順位と残り日数',
  'estimator.formula.step5': '完了日数と誤差の幅',
  'estimator.formula.explainAria': '{title}の計算式に含まれる変数の説明',
  // Step 1 — throughput baseline.
  'estimator.formula.var.sigmaP.title': '処理件数の合計',
  'estimator.formula.var.sigmaP.description': '対象期間に処理された申請の合計件数。対象期間は直近6か月分、データがそれより少ない場合はその全期間です。',
  'estimator.formula.var.sigmaN.title': '受理件数の合計',
  'estimator.formula.var.sigmaN.description': '同じ対象期間に受理された申請の合計件数。',
  'estimator.formula.var.sigmaD.title': '日数の合計',
  'estimator.formula.var.sigmaD.description': '対象期間に含まれる暦日数を、月ごとに合計した値。',
  'estimator.formula.var.rProc.title': '処理速度',
  'estimator.formula.var.rProc.description': '対象期間を通じて、1日あたりに処理された申請の平均件数。',
  'estimator.formula.var.rNew.title': '受理速度',
  'estimator.formula.var.rNew.description': '同じ期間を通じて、1日あたりに受理された申請の平均件数。',
  // Step 2 — the queue on the application date.
  'estimator.formula.var.tPrev.title': '前月の総件数',
  'estimator.formula.var.tPrev.description': '申請した月の前月に官署が抱えていた申請の総数。繰越分と新規受理分の合計です。',
  'estimator.formula.var.pPrev.title': '前月の処理件数',
  'estimator.formula.var.pPrev.description': '申請した月の前月に処理された申請の件数。',
  'estimator.formula.var.cSeed.title': '推計の起点',
  'estimator.formula.var.cSeed.description': '申請月の前月が未公表の場合に起点として用いる、最後に公表された繰越件数。',
  'estimator.formula.var.mSim.title': '推計した月数',
  'estimator.formula.var.mSim.description': '申請した月に到達するまでに、繰越件数を何か月分繰り上げたか。',
  'estimator.formula.var.cPrev.title': '前月からの繰越',
  'estimator.formula.var.cPrev.description': '申請した月の開始時点で未処理だった申請件数。前月の公表値があればそれを用い、なければ公表値のある直近の月から1か月ずつ繰り上げて推計します。',
  'estimator.formula.var.nMonth.title': '当月の受理件数',
  'estimator.formula.var.nMonth.description': '申請した月の全体で受理された申請件数。',
  'estimator.formula.var.pMonth.title': '当月の処理件数',
  'estimator.formula.var.pMonth.description': '申請した月の全体で処理された申請件数。',
  'estimator.formula.var.dMonth.title': '当月の日数',
  'estimator.formula.var.dMonth.description': '申請した月の暦日数。月間の合計を日ごとに均等に配分するために用います。',
  'estimator.formula.var.aDay.title': '申請日',
  'estimator.formula.var.aDay.description': '申請した日が、その月の何日目にあたるか。待ち行列がどこまで積み上がっていたかを表します。',
  'estimator.formula.var.nApp.title': '申請前の受理件数',
  'estimator.formula.var.nApp.description': '申請した月のうち、自分より前に受理された申請件数。申請日までで日割りした値です。',
  'estimator.formula.var.pApp.title': '申請前の処理件数',
  'estimator.formula.var.pApp.description': '申請した月のうち、自分より前に処理された申請件数。同じ日割りで求めます。',
  'estimator.formula.var.qApp.title': '申請時の待ち行列',
  'estimator.formula.var.qApp.description': '申請した日の時点で、自分より前に並んでいた申請の件数。',
  // Step 3 — progress since the application date.
  'estimator.formula.var.pAfter.title': '翌月以降の処理件数',
  'estimator.formula.var.pAfter.description': '申請した月より後の、公表済みの各月に処理された申請件数。',
  'estimator.formula.var.tApp.title': '申請からの日数',
  'estimator.formula.var.tApp.description': '申請日から本日までの暦日数。',
  'estimator.formula.var.tData.title': '最新データからの日数',
  'estimator.formula.var.tData.description': '最後に公表された月の末日から本日までの暦日数。',
  'estimator.formula.var.cProc.title': '処理済（実績）',
  'estimator.formula.var.cProc.description': '申請以降に処理された件数のうち、公表済みのデータで裏付けられている分。',
  'estimator.formula.var.eProc.title': '処理済（推定）',
  'estimator.formula.var.eProc.description': '公表データがまだ及んでいない期間に処理されたと見込まれる件数。公表済みの月が平均速度による予測を上回っている場合は、負の値になります。',
  'estimator.formula.var.sProc.title': '申請後の処理件数',
  'estimator.formula.var.sProc.description': '申請以降に処理された件数の合計。実績と推定を足し合わせ、整数に丸めた値です。',
  // Step 4 — position in the queue, and how long it takes to clear.
  'estimator.formula.var.qPos.title': '待ち順位',
  'estimator.formula.var.qPos.description': '自分より前に残っている申請の件数。0以下であれば、推定完了日をすでに過ぎています。',
  'estimator.formula.var.dRem.title': '残り日数',
  'estimator.formula.var.dRem.description': '現在の処理速度で、残りの待ち行列を消化するのに必要な日数。',
  // Step 5 — the whole-day offset, and the spread around it.
  'estimator.formula.var.dEst.title': '日数（整数）',
  'estimator.formula.var.dEst.description': '残り日数を0から遠ざかる向きに丸めた値。本日に加算して、上部の完了予定日を求めます。',
  'estimator.formula.var.sigmaR.title': '処理速度のばらつき',
  'estimator.formula.var.sigmaR.description': '月ごとの処理速度の標準偏差。処理ペースが月によってどれだけ変動するかを表します。',
  'estimator.formula.var.rBar.title': '月平均の処理速度',
  'estimator.formula.var.rBar.description': '月ごとの処理速度を、件数ではなく月数で均等に平均した値。',
  'estimator.formula.var.uDays.title': '誤差の幅',
  'estimator.formula.var.uDays.description': '結果の横に表示される±の幅。処理ペースが近年と同程度に変動した場合、推定日がどれだけ動くかを示します。',

  // ── Charts: registry ─────────────────────────────────────────────────────
  'charts.intake.label': '受理と処理',
  'charts.intake.description':
    '月ごとの繰越・受理件数と、各官署が処理した件数、そのうち許可された割合の推移です。',
  'charts.intake.aria':
    '月別の未処理件数と受理件数を積み上げた棒グラフ。処理件数を折れ線で重ね、許可率を0〜100%の右側の軸にもう一本の折れ線で表示',
  'charts.types.label': '申請種別',
  'charts.types.description':
    '月ごとの新規受理件数を申請種別ごとに表示します。凡例をクリックすると系列の表示を切り替えられます。',
  'charts.types.aria': '申請種別ごとの月別新規受理件数の折れ線グラフ',
  'charts.outcomes.label': '処理結果',
  'charts.outcomes.description': '申請がどの結果に至ったか。申請種別ごとの許可・不許可・その他への流れです。',
  'charts.outcomes.aria': '申請種別から処理結果への流れを示すサンキー図',
  'charts.share.label': '官署別割合',
  'charts.share.description': 'どの官署に申請が集まっているか。受理件数全体に占める各官署の割合です。',
  'charts.share.aria': '各官署の受理件数の割合を示すドーナツグラフ',
  'charts.mix.label': '種別構成',
  'charts.mix.description': '申請種別と官署による全申請の構成です。カテゴリをクリックすると内訳を拡大できます。',
  'charts.efficiency.label': '処理効率',
  'charts.efficiency.description':
    '処理率の高い順に並べた官署の一覧です。軸の太さは受理件数を、基準線は全国の処理率を表します。',
  'charts.efficiency.aria': '処理率順に並べた官署のランキング。軸の太さは受理件数を表す',
  'charts.map.label': '地域別マップ',
  'charts.map.description': '各官署の管轄区域と人口密度、および管理局・空港支局の所在地です。',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': '申請種別と官署による申請のサンバースト図。ドリルダウン操作が可能',
  'charts.efficiencyQuadrant.aria': '官署ごとの処理率と受理件数の四象限グラフ。バブルの大きさは処理件数を表す',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': '{series}を表示',
  'chart.legendHide': '{series}を非表示',
  'chart.allSeriesHidden': 'すべての系列が非表示です。凡例をクリックすると表示されます。',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Series names for the wrapping legend, so these can be fuller than the
  // Sankey's `appType.*.compact` forms.
  'chart.types.series.acquisition': '在留資格取得',
  'chart.types.series.extension': '在留期間更新',
  'chart.types.series.change': '在留資格変更',
  'chart.types.series.activity': '資格外活動',
  'chart.types.series.reentry': '再入国',
  'chart.types.series.permanent': '永住',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': 'その他・取下げ',
  'chart.outcomes.valueUnit': '件',
  // Row labels in the Sankey tooltip: the node row counts applications, the
  // link row measures what flows along that connection.
  'chart.outcomes.tooltipValueLabel': '申請数',
  'chart.outcomes.tooltipFlowLabel': '流量',
  'chart.outcomes.approvalRate': '許可率',
  'chart.outcomes.ofProcessed': '処理済{count}件に対する割合',
  'chart.outcomes.empty': 'この期間に処理された申請はありません。',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': 'その他（{count}）',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': '全申請',
  'chart.mix.breadcrumbAria': 'ツリーマップの階層パス',
  'chart.mix.zoomInHint': 'カテゴリをクリックすると拡大します',
  'chart.mix.zoomOutHint': '背景をクリック（または Esc キー）で戻ります',
  'chart.mix.zoomInHintTap': 'カテゴリをタップすると詳細、もう一度タップで拡大します',
  'chart.mix.zoomOutHintTap': '背景をタップすると戻ります',
  'chart.mix.others': 'その他',
  'chart.mix.categoryAria': '{category}：{count}件。拡大します。',
  'chart.mix.tooltipValue': '{count}件・{scope}の{percent}',
  'chart.mix.scopeAll': '全申請',
  'chart.mix.sunburstHint': '{trail} — {count}件（全体の{percent}）',
  'chart.sunburst.hintClick': 'セグメントをクリックすると拡大、カーソルを合わせると詳細が表示されます',
  'chart.sunburst.hintTap': 'セグメントをタップすると詳細、もう一度タップで拡大します',
  'chart.sunburst.zoomOutClick': '中央をクリックすると戻ります',
  'chart.sunburst.zoomOutTap': '中央をタップすると戻ります',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': '支局',
  'chart.efficiency.receivedCount': '受理{count}件',
  'chart.efficiency.nationwide': '全国 {rate}',
  'chart.efficiency.pointAria': '{bureau}：処理率{rate}パーセント、受理{count}件',
  'chart.efficiency.xAxis': '受理件数',
  'chart.efficiency.fullCompletion': '受理件数の100%を処理',
  'chart.efficiency.quadrantKeepingPace': '高負荷・処理は追随',
  'chart.efficiency.quadrantFallingBehind': '高負荷・処理が遅延',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  // The bureau labels already end in 出入国在留管理局 / 支局, so these carry no
  // suffix of their own — appending one would repeat the office type.
  'map.bureauMarkerAria': '{bureau}',
  'map.airportMarkerAria': '{bureau}',
  'map.bureauSuffix': '{bureau}',
  'map.airportSuffix': '{bureau}',
  'map.servicePopulation': '管轄人口',
  'map.serviceArea': '管轄面積',
  'map.serviceBureau': '管轄官署',
  'map.portOfEntry': '出入国港の官署',
  'map.legendNote': '色＝管轄官署・濃さ＝人口密度',
  'map.bureau': '管理局',
  'map.airportOffice': '空港支局',
  'map.loadError': '地図データを読み込めませんでした。ページを再読み込みしてください。',
  'map.loading': '地図データを読み込んでいます…',
  'map.areaValue': '{value}km²',
  'map.densityValue': '{value}人/km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': '更新履歴',
  'changelog.loading': '読み込み中…',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': 'データの読み込みエラー',
  'errors.noData': 'データがありません',
  'errors.unknown': '不明なエラーが発生しました',
  'errors.fetchFailed': 'データを取得できませんでした',
  'errors.renderTitle': '問題が発生しました',
  'errors.renderBody': '画面の表示中にエラーが発生しました。',
  'errors.reload': 'ページを再読み込み',
  'errors.changelogUnavailable': '更新履歴を読み込めませんでした。',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': '{bureau}の{chart}を表示中',
  'a11y.showingChartWithType': '{bureau}・{type}の{chart}を表示中',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': '統計データ提供：出入国在留管理庁',
  'footer.dataAcquisition': 'データ取得元：{source}',
  'footer.fixtureNotice': '生成されたサンプルデータを表示中',
  'footer.builtBy': '制作：{author}',
  'footer.dataUpdated': 'データ更新日 {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Full official office names, including 支局 status: the eight regional
  // 地方出入国在留管理局 plus seven branch offices. `.short` stays Latin (IATA
  // codes). `.compact` is the place name alone, for the surfaces that measure
  // in pixels — without it every 東京-family office truncates to 「東京出入国在留」.
  'bureau.all': '全国',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': '全国',
  'bureau.101010': '札幌出入国在留管理局',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': '札幌',
  'bureau.101090': '仙台出入国在留管理局',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': '仙台',
  'bureau.101170': '東京出入国在留管理局',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': '東京',
  'bureau.101190': '東京出入国在留管理局成田空港支局',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': '成田空港',
  'bureau.101200': '東京出入国在留管理局羽田空港支局',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': '羽田空港',
  'bureau.101210': '東京出入国在留管理局横浜支局',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': '横浜',
  'bureau.101350': '名古屋出入国在留管理局',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': '名古屋',
  'bureau.101370': '名古屋出入国在留管理局中部空港支局',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': '中部空港',
  'bureau.101460': '大阪出入国在留管理局',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': '大阪',
  'bureau.101480': '大阪出入国在留管理局関西空港支局',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': '関西空港',
  'bureau.101490': '大阪出入国在留管理局神戸支局',
  'bureau.101490.short': 'UKB',
  'bureau.101490.compact': '神戸',
  'bureau.101580': '広島出入国在留管理局',
  'bureau.101580.short': 'HIJ',
  'bureau.101580.compact': '広島',
  'bureau.101670': '高松出入国在留管理局',
  'bureau.101670.short': 'TAK',
  'bureau.101670.compact': '高松',
  'bureau.101720': '福岡出入国在留管理局',
  'bureau.101720.short': 'FUK',
  'bureau.101720.compact': '福岡',
  'bureau.101740': '福岡出入国在留管理局那覇支局',
  'bureau.101740.short': 'OKA',
  'bureau.101740.compact': '那覇',

  // ── Domain: application types ────────────────────────────────────────────
  // The agency's own procedure names. `.short` uses the two-character forms a
  // Japanese reader can scan on a stat tile, where the Latin codes English uses
  // would carry no meaning; `.compact` is the narrow Sankey's one-word form.
  'appType.all': 'すべての種別',
  'appType.all.short': '全種別',
  'appType.all.compact': 'すべて',
  'appType.10': '在留資格取得許可申請',
  'appType.10.short': '取得',
  'appType.10.compact': '資格取得',
  'appType.20': '在留期間更新許可申請',
  'appType.20.short': '更新',
  'appType.20.compact': '期間更新',
  'appType.30': '在留資格変更許可申請',
  'appType.30.short': '変更',
  'appType.30.compact': '資格変更',
  'appType.40': '資格外活動許可申請',
  'appType.40.short': '資格外',
  'appType.40.compact': '資格外活動',
  'appType.50': '再入国許可申請',
  'appType.50.short': '再入国',
  'appType.50.compact': '再入国',
  'appType.60': '永住許可申請',
  'appType.60.short': '永住',
  'appType.60.compact': '永住',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code, carrying the 都・道・府・県 suffix. These match
  // the `name_ja` property in public/static/japan.topo.json exactly, which is
  // what stops the choropleth tooltip printing every name twice — it shows the
  // Japanese name as a secondary only when it differs from the catalogue's.
  'prefecture.1': '北海道',
  'prefecture.2': '青森県',
  'prefecture.3': '岩手県',
  'prefecture.4': '宮城県',
  'prefecture.5': '秋田県',
  'prefecture.6': '山形県',
  'prefecture.7': '福島県',
  'prefecture.8': '茨城県',
  'prefecture.9': '栃木県',
  'prefecture.10': '群馬県',
  'prefecture.11': '埼玉県',
  'prefecture.12': '千葉県',
  'prefecture.13': '東京都',
  'prefecture.14': '神奈川県',
  'prefecture.15': '新潟県',
  'prefecture.16': '富山県',
  'prefecture.17': '石川県',
  'prefecture.18': '福井県',
  'prefecture.19': '山梨県',
  'prefecture.20': '長野県',
  'prefecture.21': '岐阜県',
  'prefecture.22': '静岡県',
  'prefecture.23': '愛知県',
  'prefecture.24': '三重県',
  'prefecture.25': '滋賀県',
  'prefecture.26': '京都府',
  'prefecture.27': '大阪府',
  'prefecture.28': '兵庫県',
  'prefecture.29': '奈良県',
  'prefecture.30': '和歌山県',
  'prefecture.31': '鳥取県',
  'prefecture.32': '島根県',
  'prefecture.33': '岡山県',
  'prefecture.34': '広島県',
  'prefecture.35': '山口県',
  'prefecture.36': '徳島県',
  'prefecture.37': '香川県',
  'prefecture.38': '愛媛県',
  'prefecture.39': '高知県',
  'prefecture.40': '福岡県',
  'prefecture.41': '佐賀県',
  'prefecture.42': '長崎県',
  'prefecture.43': '熊本県',
  'prefecture.44': '大分県',
  'prefecture.45': '宮崎県',
  'prefecture.46': '鹿児島県',
  'prefecture.47': '沖縄県',

  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.label': 'データセット',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': '表示するデータセットを選択します',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': '在留審査の処理状況',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': '審査処理',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': '在留外国人の人口',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': '在留外国人',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': '在留外国人のデータを現在読み込めません。',
  'charts.growth.label': '在留者数の推移',
  'charts.growth.description': '外国人在留者の総数を半年ごとに、滞在目的別または地域別に積み上げて表示します。',
  'charts.growth.aria': '半年ごとの外国人在留者総数を在留資格グループ別または地域別に積み上げた棒グラフ',
  'charts.origins.label': '国籍別の推移',
  'charts.origins.description': '統計が対象とする各半期において、主要な国籍がどのように増減してきたか。',
  'charts.origins.aria': '国籍別の在留者数の推移を示す積み上げ面グラフ',
  'charts.flows.label': '国籍から在留資格へ',
  'charts.flows.description': '世界の地域から国、滞在目的へと流れを表示。地域や国籍を選ぶとそのプロファイルをたどれます。',
  'charts.flows.aria': '地域から国、在留資格カテゴリへの在留者の流れを示すサンキーダイアグラム',
  'charts.statuses.label': '在留資格の構成',
  'charts.statuses.description': '在留者が保持する在留資格を滞在目的別に分類。グループをクリックすると内訳が開きます。',
  'charts.statuses.aria': '在留資格のグループ別および資格別の在留者数を示すサンバーストチャート',
  'charts.worldmap.label': '出身国の分布',
  'charts.worldmap.description': '日本の在留外国人の出身国を、その国籍を持つ人数に応じた濃淡で表示します。',
  'charts.worldmap.aria': '出身国別の在留者数を濃淡で示す世界地図',
  'charts.movers.label': '増減の大きい項目',
  'charts.movers.description': '2つの期間の間で最も増減が大きかった国籍または在留資格。',
  'charts.movers.aria': '2期間の増減を大きい順に左右へ並べた棒グラフ',

  'filters.region': '地域',
  'filters.allRegions': 'すべての地域',
  'filters.nationality': '国籍',
  'filters.residenceStatus': '在留資格',
  'filters.allNationalities': 'すべての国籍',
  'filters.allStatuses': 'すべての在留資格',
  'filters.allCategories': 'すべてのカテゴリ',

  'period.snapshotLabel': '表示時点',
  'period.latestPeriod': '最新期',
  // 'period.years_one': '{count} year',
  'period.years_other': '{count}年',

  'residents.total': '在留外国人数',
  'residents.total.short': '在留者数',
  'residents.delta': '前期比 {delta}',
  'residents.populationShare': '総人口に占める割合',
  'residents.populationShare.short': '人口比',
  'residents.populationShareOf': '日本の総人口{population}人に対して',
  'residents.topNationality': '最も多い国籍',
  'residents.topNationality.short': '最多国籍',
  'residents.topStatus': '最も多い在留資格',
  'residents.topStatus.short': '最多資格',
  'residents.share': '全体の {share}',
  'residents.scope': '{nationality}（{status}）',
  'residents.otherNationalities': 'その他の国籍',
  'residents.noMapArea': '{count} の国籍は地図上に領域がないため着色されません。',
  'residents.legendScale': '在留者数',
  'residents.discontinued': '{period} で系列が終了します。区分が統合または改称されました。',
  'residents.comparePeriod': '{period} との比較',
  'residents.byNationality': '国籍別',
  'residents.byStatus': '在留資格別',
  'residents.increase': '増加',
  'residents.decrease': '減少',
  'residents.asOf': '{period} 時点',
  'residents.noChange': 'この2期間で目立った変化はありません。',
  'residents.coverageRange': '{from}〜{to}',
  'residents.stackByGroup': '滞在目的別',
  'residents.stackByRegion': '地域別',
  'residents.stackByNationality': '国籍別',
  'residents.growthTotal': '合計',
  'residents.viewAbsolute': '実数',
  'residents.viewIndexed': '指数(伸び率)',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': '人',
  'residents.flowsTooltipValueLabel': '在留者数',
  'residents.flowsTooltipFlowLabel': 'フロー',
  'residents.sunburstHint': '{trail} — {count}人(全体の{percent})',
  'residents.markerSsw.title': '特定技能の創設',
  'residents.markerSsw.description': '2019年4月に新設された在留資格。十数の産業分野で外国人労働者の受け入れが始まりました。',
  'residents.markerCovid.title': '新型コロナによる入国制限',
  'residents.markerCovid.description': '入国制限で新規入国が停止し、2022年半ばまで在留者数が減少しました。',
  'residents.markerKoreaSplit.title': '韓国・朝鮮の統計分割',
  'residents.markerKoreaSplit.description': '統計上「韓国・朝鮮」が「韓国」と「朝鮮」に分割されました。集計方法の変更であり、人口の変動ではありません。',

  'statusGroup.work': '就労',
  'statusGroup.training': '研修・実習',
  'statusGroup.study': '留学・文化活動',
  'statusGroup.family': '家族',
  'statusGroup.residency': '居住',
  'statusGroup.other': 'その他',
  // ── World regions. ICU is tried first, but Chrome ships no names for M49
  // macro-regions, so these are what actually renders there. ────────────────
  'region.1000': 'アジア',
  'region.2000': 'ヨーロッパ',
  'region.3000': 'アフリカ',
  'region.4000': '北アメリカ',
  'region.5000': '南アメリカ',
  'region.6000': 'オセアニア',
  'region.7000': '無国籍',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'nationality.1120': '朝鮮',
  'nationality.1130': '韓国・朝鮮',
  'nationality.2290': 'セルビア・モンテネグロ',
  'nationality.2500': 'ユーゴスラヴィア',
  'nationality.7000': '無国籍',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': '総数',
  'status.1040': '教授',
  'status.1050': '芸術',
  'status.1060': '宗教',
  'status.1070': '報道',
  'status.1080': '高度専門職',
  'status.1090': '高度専門職1号イ',
  'status.1100': '高度専門職1号ロ',
  'status.1110': '高度専門職1号ハ',
  'status.1120': '高度専門職2号',
  'status.1130': '投資・経営',
  'status.1140': '経営・管理',
  'status.1150': '法律・会計業務',
  'status.1160': '医療',
  'status.1170': '研究',
  'status.1180': '教育',
  'status.1190': '技術',
  'status.1200': '人文知識・国際業務',
  'status.1210': '技術・人文知識・国際業務',
  'status.1220': '企業内転勤',
  'status.1230': '介護',
  'status.1240': '興行',
  'status.1250': '技能',
  'status.1260': '特定技能',
  'status.1270': '特定技能1号',
  'status.1280': '特定技能2号',
  'status.1290': '技能実習',
  'status.1300': '技能実習1号イ',
  'status.1310': '技能実習1号ロ',
  'status.1320': '技能実習2号イ',
  'status.1330': '技能実習2号ロ',
  'status.1340': '技能実習3号イ',
  'status.1350': '技能実習3号ロ',
  'status.1360': '文化活動',
  'status.1380': '留学',
  'status.1400': '研修',
  'status.1410': '家族滞在',
  'status.1420': '特定活動',
  'status.1430': '永住者',
  'status.1440': '日本人の配偶者等',
  'status.1450': '永住者の配偶者等',
  'status.1460': '定住者',
  'status.1470': '特別永住者',
  'residents.mixRoot': 'すべての在留者',
  'residents.mixScopeAll': 'すべての在留者',
  'residents.mixCategoryAria': '{category}：{count}人。詳細を表示。',
  'residents.mixTooltipValue': '{count}人 · {scope}の{percent}',
};
