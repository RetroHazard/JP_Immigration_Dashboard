// src/i18n/locales/vi.ts
// Vietnamese overrides. Full coverage of the English catalogue.
//
// Vietnamese has a single CLDR plural category (`other`) — `Intl.PluralRules
// ('vi-VN').resolvedOptions().pluralCategories` returns only `['other']` — so
// the five plural families in the catalogue owe just their `_other` member;
// the `_one` lines stay commented out, same as Japanese and Korean.
import type { Dictionary } from '../types';

export const vi: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': 'Thống Kê Xuất Nhập Cảnh Nhật Bản',
  'app.subtitle': 'Dữ liệu xử lý của các cục quản lý từ e-Stat, cập nhật theo mỗi lần công bố',
  'app.skipToContent': 'Bỏ qua đến nội dung chính',
  'app.loadingData': 'Đang xử lý dữ liệu xuất nhập cảnh...',
  'app.loadingDashboard': 'Đang tải bảng điều khiển...',
  'app.retry': 'Thử lại',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  'meta.title': 'Bảng Điều Khiển Thống Kê Xuất Nhập Cảnh Nhật Bản',
  'meta.description':
    'Thời gian xử lý visa, khối lượng công việc của các cục quản lý, và công cụ ước tính theo mô hình hàng đợi cho hồ sơ của bạn - xây dựng dựa trên số liệu thống kê chính thức của Cục Quản lý Xuất nhập cảnh và Lưu trú, cập nhật mỗi khi e-Stat công bố dữ liệu mới (thường là hàng tháng).',
  'meta.keywords':
    'thời gian xử lý visa Nhật Bản, thống kê cục quản lý xuất nhập cảnh, theo dõi hồ sơ xin visa, Cục Quản lý Xuất nhập cảnh và Lưu trú, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': 'Ngôn ngữ',
  'nav.switchToLightTheme': 'Chuyển sang giao diện sáng',
  'nav.switchToDarkTheme': 'Chuyển sang giao diện tối',
  'nav.openSettings': 'Mở menu cài đặt',
  'nav.settings': 'Cài đặt',
  'nav.theme': 'Giao diện',
  'nav.themeLight': 'Sáng',
  'nav.themeDark': 'Tối',
  'nav.about': 'Giới thiệu',
  'nav.changelog': 'Nhật ký thay đổi',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': 'Dữ liệu: {range}',
  'dashboard.coverageRange': '{from} – {to}',
  'dashboard.comparisonSuffix': '(so sánh)',
  'dashboard.expandEstimator': 'Mở rộng Công cụ Ước tính Thời gian Xử lý',
  'dashboard.estimatorRail': 'Công cụ ước tính',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': 'Cục Quản lý Xuất nhập cảnh',
  'filters.appType': 'Loại hồ sơ',
  'filters.compare': 'So sánh với',
  'filters.compareNone': 'Không có',
  'filters.excludeAirports': 'Loại trừ văn phòng sân bay',
  'filters.includeAirports': 'Bao gồm văn phòng sân bay',
  'filters.reset': 'Đặt lại bộ lọc',
  'filters.selectPlaceholder': 'Chọn',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': 'Khoảng thời gian',
  'period.latest': 'Tháng gần nhất',
  'period.all': 'Toàn bộ dữ liệu',
  // 'period.months_one': '{count} month',
  'period.months_other': '{count} tháng',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': 'Tổng số hồ sơ',
  'stats.totalApplications.short': 'Tổng',
  'stats.pending': 'Đang chờ xử lý',
  'stats.granted': 'Đã chấp thuận',
  'stats.denied': 'Bị từ chối',
  'stats.approvalRate': 'Tỷ lệ chấp thuận',
  'stats.approvalRate.short': 'Chấp thuận',
  'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '{delta} so với tháng trước',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': 'Chuyển từ kỳ trước',
  'metric.pending': 'Đang chờ (chuyển từ kỳ trước)',
  'metric.received': 'Đã tiếp nhận',
  'metric.processed': 'Đã xử lý',
  'metric.granted': 'Đã chấp thuận',
  'metric.denied': 'Bị từ chối',
  'metric.other': 'Khác',
  'metric.completion': 'Hoàn thành',
  'metric.applications': 'Hồ sơ',
  'metric.population': 'Dân số',
  'metric.area': 'Diện tích',
  'metric.density': 'Mật độ',
  'common.noDataForFilters': 'Không có dữ liệu cho tổ hợp bộ lọc này.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'Xem bảng dữ liệu',
  'table.hide': 'Ẩn bảng dữ liệu',
  'table.downloadCsv': 'Tải xuống CSV',
  'table.caption': 'Số liệu thống kê hồ sơ hàng tháng của {bureau}',
  'table.month': 'Tháng',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Công cụ Ước tính Thời gian Xử lý',
  'estimator.description': 'Ước tính theo mô hình hàng đợi dựa trên năng suất xử lý của cục trong sáu tháng gần nhất.',
  'estimator.selectBureau': 'Chọn cục quản lý',
  'estimator.selectType': 'Chọn loại hồ sơ',
  'estimator.applicationDate': 'Ngày nộp hồ sơ',
  'estimator.empty':
    'Chọn cục quản lý, loại hồ sơ và ngày nộp hồ sơ để ước tính thời điểm hồ sơ của bạn được xử lý.',
  'estimator.estimatedCompletion': 'Thời điểm hoàn thành dự kiến',
  'estimator.queuePosition': 'Vị trí trong hàng đợi',
  'estimator.aheadOfYou': '≈ {count} hồ sơ trước bạn',
  'estimator.howCalculated': 'Cách tính này như thế nào?',
  'estimator.showMath': 'Hiện công thức tính',
  'estimator.hideMath': 'Ẩn công thức tính',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': 'Đặt lại công cụ ước tính',
  'estimator.resetAria': 'Đặt lại Công cụ Ước tính Thời gian Xử lý',
  'estimator.collapse': 'Thu gọn công cụ ước tính',
  'estimator.collapseAria': 'Thu gọn Công cụ Ước tính Thời gian Xử lý',
  'estimator.close': 'Đóng công cụ ước tính',
  'estimator.closeAria': 'Đóng Công cụ Ước tính Thời gian Xử lý',
  'estimator.copyPermalink': 'Sao chép liên kết cố định đến ước tính này',
  'estimator.copied': 'Đã sao chép!',
  // Result note, joined with " · ".
  // 'estimator.uncertaintyDays_one': '± {count} day',
  'estimator.uncertaintyDays_other': '± {count} ngày',
  // 'estimator.uncertaintyWeeks_one': '± {count} week',
  'estimator.uncertaintyWeeks_other': '± {count} tuần',
  // 'estimator.basedOnMonths_one': 'based on {count} month of throughput',
  'estimator.basedOnMonths_other': 'dựa trên {count} tháng dữ liệu năng suất xử lý',
  // Warnings.
  'estimator.limitedDataTitle': 'Ước tính với dữ liệu hạn chế:',
  // 'estimator.limitedDataBody_one':
  //   'Your application date is beyond available data. This estimate is based on simulated processing rates from {count} month of historical data and may be less accurate.',
  'estimator.limitedDataBody_other':
    'Ngày nộp hồ sơ của bạn vượt quá phạm vi dữ liệu hiện có. Ước tính này dựa trên tốc độ xử lý mô phỏng từ {count} tháng dữ liệu lịch sử và có thể kém chính xác hơn.',
  'estimator.pastDueTitle': 'Có thể đã quá hạn:',
  'estimator.pastDueBody':
    'Dựa trên tốc độ xử lý dự kiến, việc hoàn thành hồ sơ này có thể đã quá hạn. Nếu bạn chưa nhận được yêu cầu bổ sung và/hoặc quyết định về hồ sơ này, vui lòng liên hệ với cục quản lý để biết thêm thông tin.',
  // {emphasis} is the word "estimate", rendered bold and underlined.
  'estimator.disclaimer':
    '*Đây là một {emphasis} dựa trên tốc độ xử lý hiện tại, vị trí hàng đợi dự kiến và các hồ sơ đang chờ xử lý. Thời gian xử lý thực tế cho hồ sơ của bạn có thể khác.',
  'estimator.disclaimerEmphasis': 'ước tính',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': 'Hàng đợi tại thời điểm nộp hồ sơ',
  'estimator.formula.step2': 'Vị trí hàng đợi & tốc độ hàng ngày',
  'estimator.formula.step3': 'Số ngày còn lại',
  'estimator.formula.explainAria': 'Giải thích các biến trong công thức {title}',
  'estimator.formula.var.dRem.title': 'Số ngày còn lại',
  'estimator.formula.var.dRem.description': 'Số ngày ước tính cho đến khi hoàn tất xử lý.',
  'estimator.formula.var.qPos.title': 'Vị trí hàng đợi',
  'estimator.formula.var.qPos.description': 'Vị trí ước tính trong hàng đợi xử lý.',
  'estimator.formula.var.rDaily.title': 'Tốc độ hàng ngày',
  'estimator.formula.var.rDaily.description': 'Số hồ sơ trung bình được xử lý mỗi ngày.',
  'estimator.formula.var.cProc.title': 'Đã xử lý (xác nhận)',
  'estimator.formula.var.cProc.description': 'Số hồ sơ đã xử lý được xác nhận kể từ khi nộp.',
  'estimator.formula.var.eProc.title': 'Đã xử lý (ước tính)',
  'estimator.formula.var.eProc.description': 'Số hồ sơ ước tính đã xử lý kể từ mốc dữ liệu gần nhất.',
  'estimator.formula.var.sigmaP.title': 'Tổng số đã xử lý',
  'estimator.formula.var.sigmaP.description': 'Tổng số hồ sơ đã xử lý dùng để tính giá trị trung bình.',
  'estimator.formula.var.sigmaD.title': 'Tổng số ngày',
  'estimator.formula.var.sigmaD.description': 'Tổng số ngày dùng để tính giá trị trung bình.',
  'estimator.formula.var.qApp.title': 'Hàng đợi hồ sơ',
  'estimator.formula.var.qApp.description': 'Vị trí hàng đợi ước tính tại thời điểm nộp hồ sơ.',
  'estimator.formula.var.cPrev.title': 'Chuyển từ kỳ trước',
  'estimator.formula.var.cPrev.description': 'Hồ sơ được chuyển tiếp từ tháng trước.',
  'estimator.formula.var.nApp.title': 'Hồ sơ mới',
  'estimator.formula.var.nApp.description': 'Số hồ sơ ước tính được tiếp nhận trước khi nộp.',
  'estimator.formula.var.pApp.title': 'Hồ sơ đã xử lý',
  'estimator.formula.var.pApp.description': 'Số hồ sơ ước tính đã được xử lý trước khi nộp.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': 'Tiếp nhận & xử lý',
  'charts.intake.description':
    'Hồ sơ chuyển từ kỳ trước và tiếp nhận mỗi tháng, so với khối lượng mà các cục đã xử lý xong.',
  'charts.intake.aria':
    'Biểu đồ cột chồng thể hiện hồ sơ đang chờ và đã tiếp nhận theo tháng, cùng khối lượng đã xử lý dưới dạng đường',
  'charts.types.label': 'Loại hồ sơ',
  'charts.types.description':
    'Số hồ sơ mới nộp hàng tháng phân theo loại hồ sơ — nhấp vào một mục chú giải để bật/tắt chuỗi dữ liệu.',
  'charts.types.aria': 'Biểu đồ đường thể hiện số hồ sơ mới nộp hàng tháng theo từng loại hồ sơ',
  'charts.outcomes.label': 'Kết quả xử lý',
  'charts.outcomes.description':
    'Kết quả cuối cùng của hồ sơ: dòng chảy của từng loại hồ sơ đến kết quả chấp thuận, từ chối hoặc khác.',
  'charts.outcomes.aria': 'Sơ đồ Sankey thể hiện dòng chảy từ loại hồ sơ đến kết quả xử lý',
  'charts.share.label': 'Tỷ trọng theo cục',
  'charts.share.description': 'Nơi hồ sơ được nộp: tỷ trọng của từng cục trong tổng số hồ sơ tiếp nhận.',
  'charts.share.aria': 'Biểu đồ vành khuyên thể hiện tỷ trọng hồ sơ tiếp nhận của từng cục',
  'charts.mix.label': 'Cơ cấu danh mục',
  'charts.mix.description': 'Toàn bộ hồ sơ theo loại và theo cục — nhấp vào một danh mục để phóng to xem chi tiết.',
  'charts.efficiency.label': 'Hiệu suất xử lý',
  'charts.efficiency.description':
    'Các cục được xếp hạng theo tỷ lệ hoàn thành — độ dày thân biểu đồ thể hiện khối lượng tiếp nhận, với tỷ lệ toàn quốc làm mốc tham chiếu.',
  'charts.efficiency.aria':
    'Các cục được xếp hạng theo tỷ lệ hoàn thành, với khối lượng tiếp nhận thể hiện qua độ dày thân biểu đồ',
  'charts.map.label': 'Bản đồ khu vực',
  'charts.map.description': 'Khu vực quản lý của các cục và mật độ dân số, cùng vị trí văn phòng cục và văn phòng sân bay.',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': 'Biểu đồ hình tia thể hiện hồ sơ theo loại và theo cục; có thể tương tác đi sâu vào chi tiết',
  'charts.efficiencyQuadrant.aria':
    'Biểu đồ góc phần tư thể hiện tỷ lệ hoàn thành theo khối lượng tiếp nhận của từng cục; kích thước bong bóng thể hiện khối lượng đã xử lý',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': 'Hiện {series}',
  'chart.legendHide': 'Ẩn {series}',
  'chart.allSeriesHidden': 'Tất cả chuỗi dữ liệu đang bị ẩn — nhấp vào một mục chú giải để hiện.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': 'Xin cấp tư cách lưu trú',
  'chart.types.series.extension': 'Gia hạn lưu trú',
  'chart.types.series.change': 'Thay đổi tư cách lưu trú',
  'chart.types.series.activity': 'Giấy phép hoạt động',
  'chart.types.series.reentry': 'Tái nhập cảnh',
  'chart.types.series.permanent': 'Thường trú',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': 'Khác / Rút hồ sơ',
  'chart.outcomes.valueUnit': 'hồ sơ',
  'chart.outcomes.tooltipValueLabel': 'Hồ sơ',
  'chart.outcomes.tooltipFlowLabel': 'Dòng chảy',
  'chart.outcomes.approvalRate': 'Tỷ lệ chấp thuận',
  'chart.outcomes.ofProcessed': 'trong số {count} hồ sơ đã xử lý',
  'chart.outcomes.empty': 'Không có hồ sơ nào được xử lý trong kỳ này.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': 'Khác ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': 'Tất cả hồ sơ',
  'chart.mix.breadcrumbAria': 'Đường dẫn khám phá biểu đồ cây',
  'chart.mix.zoomInHint': 'Nhấp vào một danh mục để phóng to',
  'chart.mix.zoomOutHint': 'Nhấp vào nền (hoặc nhấn Esc) để thu nhỏ',
  'chart.mix.others': 'Khác',
  'chart.mix.categoryAria': '{category}: {count} hồ sơ. Phóng to.',
  'chart.mix.tooltipValue': '{count} hồ sơ · {percent} của {scope}',
  'chart.mix.scopeAll': 'tất cả hồ sơ',
  'chart.mix.sunburstHint': '{trail} — {count} hồ sơ ({percent} trên tổng số)',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': 'chi nhánh',
  'chart.efficiency.receivedCount': '{count} đã tiếp nhận',
  'chart.efficiency.nationwide': 'Toàn quốc {rate}',
  'chart.efficiency.pointAria': '{bureau}: hoàn thành {rate} phần trăm, đã tiếp nhận {count} hồ sơ',
  'chart.efficiency.xAxis': 'Hồ sơ đã tiếp nhận',
  'chart.efficiency.fullCompletion': 'Hoàn thành 100% số hồ sơ tiếp nhận',
  'chart.efficiency.quadrantKeepingPace': 'KHỐI LƯỢNG CAO · THEO KỊP TIẾN ĐỘ',
  'chart.efficiency.quadrantFallingBehind': 'KHỐI LƯỢNG CAO · CHẬM TIẾN ĐỘ',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  'map.bureauMarkerAria': 'Cục {bureau}',
  'map.airportMarkerAria': 'Văn phòng sân bay {bureau}',
  'map.bureauSuffix': 'Cục {bureau}',
  'map.airportSuffix': 'Văn phòng Sân bay {bureau}',
  'map.servicePopulation': 'Dân số quản lý',
  'map.serviceArea': 'Khu vực quản lý',
  'map.serviceBureau': 'Cục quản lý',
  'map.portOfEntry': 'Văn phòng cửa khẩu',
  'map.legendNote': 'Màu = cục quản lý · độ đậm = mật độ dân số',
  'map.bureau': 'Trụ sở cục',
  'map.airportOffice': 'Văn phòng sân bay',
  'map.zoomIn': 'Phóng to',
  'map.zoomOut': 'Thu nhỏ',
  'map.resetView': 'Đặt lại chế độ xem',
  'map.loadError': 'Không thể tải dữ liệu bản đồ. Hãy thử tải lại trang.',
  'map.loading': 'Đang tải dữ liệu bản đồ...',
  'map.areaValue': '{value} km²',
  'map.densityValue': '{value} /km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': 'Nhật ký thay đổi',
  'changelog.loading': 'Đang tải...',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': 'Lỗi tải dữ liệu',
  'errors.noData': 'Không có dữ liệu',
  'errors.unknown': 'Đã xảy ra lỗi không xác định',
  'errors.fetchFailed': 'Không thể tải dữ liệu',
  'errors.renderTitle': 'Đã xảy ra sự cố',
  'errors.renderBody': 'Đã xảy ra lỗi khi hiển thị ứng dụng.',
  'errors.reload': 'Tải lại trang',
  'errors.changelogUnavailable': 'Không thể tải nhật ký thay đổi.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': 'Đang hiển thị {chart} cho {bureau}',
  'a11y.showingChartWithType': 'Đang hiển thị {chart} cho {bureau}, {type}',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': 'Số liệu thống kê chính thức do Cục Quản lý Xuất nhập cảnh và Lưu trú Nhật Bản cung cấp',
  'footer.dataAcquisition': 'Dữ liệu được thu thập bởi {source}',
  'footer.fixtureNotice': 'đang hiển thị dữ liệu mẫu được tạo tự động',
  'footer.builtBy': 'Được xây dựng bởi {author}',
  'footer.dataUpdated': 'dữ liệu cập nhật {date}',

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
  //
  // Vietnamese is Latin-script, so city-only bureau names romanize the same
  // way English does (Sapporo, Yokohama, Nagoya, ...) — a genuine translation,
  // not a leftover. The four airport bureaus get a real Vietnamese phrase for
  // `.label`, with `.compact` trimmed back to the bare place name so the
  // "Sân bay " prefix doesn't crowd out the ~92px column.
  'bureau.all': 'Toàn quốc',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': 'Toàn quốc',
  'bureau.101010': 'Sapporo',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': 'Sapporo',
  'bureau.101090': 'Sendai',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': 'Sendai',
  'bureau.101170': 'Shinagawa',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': 'Shinagawa',
  'bureau.101190': 'Sân bay Narita',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': 'Narita',
  'bureau.101200': 'Sân bay Haneda',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': 'Haneda',
  'bureau.101210': 'Yokohama',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': 'Yokohama',
  'bureau.101350': 'Nagoya',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': 'Nagoya',
  'bureau.101370': 'Sân bay Chubu',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': 'Chubu',
  'bureau.101460': 'Osaka',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': 'Osaka',
  'bureau.101480': 'Sân bay Kansai',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': 'Kansai',
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
  //
  // `.compact` here is the real width risk for Vietnamese: the Sankey's
  // narrow layout does not truncate, so these are kept to short, familiar
  // abbreviations rather than full precise phrasing.
  'appType.all': 'Tất cả loại hồ sơ',
  'appType.all.short': 'ALL',
  'appType.all.compact': 'Tất cả',
  'appType.10': 'Xin cấp tư cách lưu trú',
  'appType.10.short': 'ACQ',
  'appType.10.compact': 'Cấp mới',
  'appType.20': 'Gia hạn thời gian lưu trú',
  'appType.20.short': 'EXT',
  'appType.20.compact': 'Gia hạn',
  'appType.30': 'Thay đổi tư cách lưu trú',
  'appType.30.short': 'CHG',
  'appType.30.compact': 'Thay đổi',
  'appType.40': 'Giấy phép hoạt động',
  'appType.40.short': 'ACT',
  'appType.40.compact': 'Hoạt động',
  'appType.50': 'Tái nhập cảnh',
  'appType.50.short': 'RET',
  'appType.50.compact': 'Tái nhập',
  'appType.60': 'Thường trú',
  'appType.60.short': 'PR',
  'appType.60.compact': 'Thường trú',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code (1 Hokkaido … 47 Okinawa). Vietnamese is
  // Latin-script, so these romanize the same way English does, matching the
  // precedent set by fr/de/es/it/pt.
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
};
