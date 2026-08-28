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
  'app.subtitle': 'Thống kê xử lý hồ sơ và dân số người nước ngoài cư trú, từ e-Stat',
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
    'Thời gian xử lý visa, khối lượng công việc của các cục quản lý, diễn biến dân số người nước ngoài cư trú, và công cụ ước tính theo mô hình hàng đợi cho hồ sơ của bạn - xây dựng dựa trên số liệu thống kê chính thức của Cục Quản lý Xuất nhập cảnh và Lưu trú, cập nhật khi e-Stat công bố dữ liệu mới.',
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
  'nav.sourceCode': 'Mã nguồn',

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
  'metric.approvalRate': 'Tỷ lệ chấp thuận',
  'metric.efficiency': 'Hiệu suất',
  'metric.applications': 'Hồ sơ',
  'metric.population': 'Dân số',
  'metric.area': 'Diện tích',
  'metric.density': 'Mật độ',
  'common.noDataForFilters': 'Không có dữ liệu cho tổ hợp bộ lọc này.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'Xem bảng dữ liệu',
  'table.hide': 'Ẩn bảng dữ liệu',
  'table.downloadCsv': 'Tải xuống CSV',
  'table.month': 'Tháng',
  'table.prefecture': 'Tỉnh',
  'table.shareOfTotal': 'Tỷ trọng',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Công cụ Ước tính Thời gian Xử lý',
  'estimator.description': 'Ước tính theo mô hình hàng đợi dựa trên năng suất xử lý của cục trong sáu tháng gần nhất.',
  'estimator.selectBureau': 'Chọn cục quản lý',
  'estimator.selectType': 'Chọn loại hồ sơ',
  'estimator.applicationDate': 'Ngày nộp hồ sơ',
  'estimator.selectionSummary': '{bureau} · {type} · {date}',
  'estimator.editDetails': 'Chỉnh sửa thông tin hồ sơ của bạn',
  'estimator.empty': 'Chọn cục quản lý, loại hồ sơ và ngày nộp hồ sơ để ước tính thời điểm hồ sơ của bạn được xử lý.',
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
  'estimator.formula.step1': 'Năng suất nền',
  'estimator.formula.step2': 'Hàng chờ lúc nộp',
  'estimator.formula.step3': 'Đã xử lý từ khi nộp',
  'estimator.formula.step4': 'Vị trí hàng chờ và số ngày còn lại',
  'estimator.formula.step5': 'Số ngày tròn và biên sai số',
  'estimator.formula.explainAria': 'Giải thích các biến trong công thức {title}',
  // Step 1 — throughput baseline.
  'estimator.formula.var.sigmaP.title': 'Tổng đã xử lý',
  'estimator.formula.var.sigmaP.description':
    'Số hồ sơ hoàn tất trong khoảng lấy mẫu, tức sáu tháng công bố gần nhất, hoặc ít hơn nếu dữ liệu dừng sớm hơn.',
  'estimator.formula.var.sigmaN.title': 'Tổng đã tiếp nhận',
  'estimator.formula.var.sigmaN.description': 'Số hồ sơ tiếp nhận trong cùng khoảng lấy mẫu đó.',
  'estimator.formula.var.sigmaD.title': 'Tổng số ngày',
  'estimator.formula.var.sigmaD.description': 'Số ngày theo lịch trong khoảng lấy mẫu, cộng dồn theo từng tháng.',
  'estimator.formula.var.rProc.title': 'Tốc độ xử lý',
  'estimator.formula.var.rProc.description': 'Số hồ sơ hoàn tất mỗi ngày, tính trung bình trên toàn khoảng lấy mẫu.',
  'estimator.formula.var.rNew.title': 'Tốc độ tiếp nhận',
  'estimator.formula.var.rNew.description': 'Số hồ sơ tiếp nhận mỗi ngày, tính trung bình trên cùng khoảng đó.',
  // Step 2 — the queue on the application date.
  'estimator.formula.var.tPrev.title': 'Tổng của tháng trước',
  'estimator.formula.var.tPrev.description':
    'Toàn bộ hồ sơ cơ quan đang giữ trong tháng liền trước tháng của bạn, gồm phần chuyển sang cộng với phần mới tiếp nhận.',
  'estimator.formula.var.pPrev.title': 'Đã xử lý tháng trước',
  'estimator.formula.var.pPrev.description': 'Số hồ sơ hoàn tất trong tháng liền trước tháng của bạn.',
  'estimator.formula.var.cSeed.title': 'Điểm khởi đầu mô phỏng',
  'estimator.formula.var.cSeed.description':
    'Số hồ sơ chuyển sang được công bố gần nhất, dùng làm điểm xuất phát khi tháng liền trước tháng của bạn chưa có số liệu riêng.',
  'estimator.formula.var.mSim.title': 'Số tháng mô phỏng',
  'estimator.formula.var.mSim.description':
    'Số hồ sơ chuyển sang đã được đẩy tới trước bao nhiêu tháng để chạm tới tháng bạn nộp.',
  'estimator.formula.var.cPrev.title': 'Chuyển sang',
  'estimator.formula.var.cPrev.description':
    'Số hồ sơ vẫn còn chờ khi tháng bạn nộp bắt đầu. Lấy theo tháng liền trước nếu tháng đó đã công bố, nếu không thì đẩy tới từng tháng một kể từ tháng gần nhất có số liệu.',
  'estimator.formula.var.nMonth.title': 'Tiếp nhận trong tháng',
  'estimator.formula.var.nMonth.description': 'Số hồ sơ tiếp nhận trong suốt cả tháng bạn nộp.',
  'estimator.formula.var.pMonth.title': 'Xử lý trong tháng',
  'estimator.formula.var.pMonth.description': 'Số hồ sơ hoàn tất trong suốt cả tháng bạn nộp.',
  'estimator.formula.var.dMonth.title': 'Số ngày trong tháng',
  'estimator.formula.var.dMonth.description':
    'Số ngày theo lịch của tháng bạn nộp, dùng để chia đều tổng của cả tháng cho từng ngày.',
  'estimator.formula.var.aDay.title': 'Ngày nộp',
  'estimator.formula.var.aDay.description': 'Bạn nộp vào ngày thứ mấy của tháng, cho biết hàng chờ đã dồn tới đâu.',
  'estimator.formula.var.nApp.title': 'Tiếp nhận trước bạn',
  'estimator.formula.var.nApp.description':
    'Số hồ sơ tiếp nhận sớm hơn trong tháng bạn nộp, chia theo tỷ lệ tới đúng ngày bạn nộp.',
  'estimator.formula.var.pApp.title': 'Xử lý trước bạn',
  'estimator.formula.var.pApp.description': 'Số hồ sơ hoàn tất sớm hơn trong tháng bạn nộp, chia theo tỷ lệ tương tự.',
  'estimator.formula.var.qApp.title': 'Hàng chờ khi nộp',
  'estimator.formula.var.qApp.description': 'Có bao nhiêu hồ sơ đứng trước hồ sơ của bạn vào ngày bạn nộp.',
  // Step 3 — progress since the application date.
  'estimator.formula.var.pAfter.title': 'Xử lý các tháng sau',
  'estimator.formula.var.pAfter.description': 'Số hồ sơ hoàn tất trong những tháng đã công bố nằm sau tháng bạn nộp.',
  'estimator.formula.var.tApp.title': 'Số ngày từ khi nộp',
  'estimator.formula.var.tApp.description': 'Số ngày theo lịch giữa ngày bạn nộp và hôm nay.',
  'estimator.formula.var.tData.title': 'Số ngày từ dữ liệu',
  'estimator.formula.var.tData.description': 'Số ngày theo lịch giữa ngày cuối của tháng công bố gần nhất và hôm nay.',
  'estimator.formula.var.cProc.title': 'Đã xử lý xác nhận',
  'estimator.formula.var.cProc.description': 'Phần hồ sơ hoàn tất kể từ khi bạn nộp mà số liệu công bố đã ghi nhận.',
  'estimator.formula.var.eProc.title': 'Đã xử lý ước tính',
  'estimator.formula.var.eProc.description':
    'Số hồ sơ được cho là đã hoàn tất trong quãng mà số liệu công bố chưa vươn tới. Giá trị này âm khi số liệu đã công bố vượt quá mức mà tốc độ trung bình dự đoán.',
  'estimator.formula.var.sProc.title': 'Đã xử lý từ đó',
  'estimator.formula.var.sProc.description':
    'Toàn bộ phần đã giải quyết kể từ khi bạn nộp, gồm phần xác nhận và phần ước tính cộng lại rồi làm tròn thành số hồ sơ nguyên.',
  // Step 4 — position in the queue, and how long it takes to clear.
  'estimator.formula.var.qPos.title': 'Vị trí hàng chờ',
  'estimator.formula.var.qPos.description':
    'Còn bao nhiêu hồ sơ đứng trước hồ sơ của bạn. Bằng không hoặc thấp hơn nghĩa là mốc ước tính đã trôi qua.',
  'estimator.formula.var.dRem.title': 'Số ngày còn lại',
  'estimator.formula.var.dRem.description': 'Số ngày cần để giải quyết hết phần hàng chờ còn lại theo tốc độ hiện tại.',
  // Step 5 — the whole-day offset, and the spread around it.
  'estimator.formula.var.dEst.title': 'Số ngày tròn',
  'estimator.formula.var.dEst.description':
    'Số ngày còn lại được làm tròn ra xa số không, chính là phần cộng thêm vào hôm nay để ra ngày hiển thị phía trên.',
  'estimator.formula.var.sigmaR.title': 'Độ dao động tốc độ',
  'estimator.formula.var.sigmaR.description':
    'Độ lệch chuẩn của các tốc độ xử lý theo tháng, cho thấy nhịp xử lý thay đổi nhiều hay ít giữa các tháng.',
  'estimator.formula.var.rBar.title': 'Tốc độ trung bình tháng',
  'estimator.formula.var.rBar.description':
    'Trung bình các tốc độ theo tháng với trọng số bằng nhau cho mỗi tháng, không tính theo khối lượng.',
  'estimator.formula.var.uDays.title': 'Biên sai số',
  'estimator.formula.var.uDays.description':
    'Biên ± hiển thị cạnh kết quả, cho biết mốc ước tính xê dịch bao nhiêu nếu nhịp xử lý dao động như thời gian gần đây.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': 'Tiếp nhận & xử lý',
  'charts.intake.description':
    'Hồ sơ chuyển từ kỳ trước và tiếp nhận mỗi tháng, so với khối lượng mà các cục đã xử lý xong và tỷ lệ được chấp thuận trong đó.',
  'charts.intake.aria':
    'Biểu đồ cột chồng thể hiện hồ sơ đang chờ và đã tiếp nhận theo tháng, cùng khối lượng đã xử lý dưới dạng đường và tỷ lệ chấp thuận dưới dạng đường thứ hai trên trục bên phải chạy từ 0 đến 100 phần trăm',
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
  'charts.map.description':
    'Khu vực quản lý của các cục và mật độ dân số, cùng vị trí văn phòng cục và văn phòng sân bay.',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria':
    'Biểu đồ hình tia thể hiện hồ sơ theo loại và theo cục; có thể tương tác đi sâu vào chi tiết',
  'charts.efficiencyQuadrant.aria':
    'Biểu đồ góc phần tư thể hiện tỷ lệ hoàn thành theo khối lượng tiếp nhận của từng cục; kích thước bong bóng thể hiện khối lượng đã xử lý',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': 'Hiện {series}',
  'chart.legendHide': 'Ẩn {series}',
  'chart.allSeriesHidden': 'Tất cả chuỗi dữ liệu đang bị ẩn — nhấp vào một mục chú giải để hiện.',

  // ── Chart: Intake & Processing — policy event markers ────────────────────
  'policy.eventsShow': 'Hiện các sự kiện chính sách',
  'policy.eventsHide': 'Ẩn các sự kiện chính sách',
  'policy.ssw2019.title': 'Lập tư cách Kỹ năng đặc định',
  'policy.ssw2019.description':
    'Tư cách cho các ngành thiếu nhân lực; cơ quan quản lý xuất nhập cảnh ra đời cùng ngày.',
  'policy.covidClosure.title': 'Hạn chế nhập cảnh thời dịch',
  'policy.covidClosure.description': 'Diện từ chối nhập cảnh mở rộng ra gần như toàn thế giới.',
  'policy.covidSuspension.title': 'Dừng nhập cảnh mới toàn cầu',
  'policy.covidSuspension.description':
    'Từ cuối tháng 12, không người nước ngoài nào được nhập cảnh mới, dù có thị thực.',
  'policy.covidOmicron.title': 'Đảo ngược mở cửa vì Omicron',
  'policy.covidOmicron.description': 'Việc nhập cảnh mở lại ngày 8 tháng 11 bị dừng lại sau ba tuần.',
  'policy.covidResume.title': 'Đón lại du học sinh và lao động',
  'policy.covidResume.description': 'Mở lại nhập cảnh để học tập, làm việc và kinh doanh, có giới hạn mỗi ngày.',
  'policy.covidVisaFree.title': 'Khôi phục đi lại miễn thị thực',
  'policy.covidVisaFree.description': 'Miễn thị thực được khôi phục và bỏ giới hạn số người nhập cảnh mỗi ngày.',
  'policy.covidCoe.title': 'Gia hạn hiệu lực giấy chứng nhận',
  'policy.covidCoe.description': 'Giấy chứng nhận bị kẹt vì đóng cửa vẫn có hiệu lực quá ba tháng.',
  'policy.covidEnd.title': 'Kết thúc biện pháp biên giới',
  'policy.covidEnd.description': 'Ngừng xét nghiệm và kiểm tra chứng nhận tiêm chủng; bệnh chuyển sang nhóm 5.',
  'policy.act2023.title': 'Sửa đổi luật nhập cư',
  'policy.act2023.description': 'Bổ sung biện pháp giám sát thay cho tạm giữ và quy chế bảo vệ bổ sung.',
  'policy.digitalNomad.title': 'Lập tư cách cho người du mục số',
  'policy.digitalNomad.description': 'Tư cách sáu tháng cho người làm việc từ xa và gia đình họ.',
  'policy.sswExpansion.title': 'Mở rộng Kỹ năng đặc định',
  'policy.sswExpansion.description': 'Nội các bổ sung bốn ngành và đặt lại chỉ tiêu tiếp nhận năm năm.',
  'policy.act2023Effect.title': 'Quy định trục xuất có hiệu lực',
  'policy.act2023Effect.description': 'Các quy định chính của lần sửa đổi năm 2023 đã có hiệu lực.',
  'policy.act2024.title': 'Thay thế thực tập kỹ năng',
  'policy.act2024.description': 'Từ năm 2027, chương trình đào tạo mới thay cho thực tập kỹ năng.',
  'policy.feeRevision2025.title': 'Tăng lệ phí hồ sơ',
  'policy.feeRevision2025.description': 'Gia hạn tăng lên 6.000 yên và vĩnh trú lên 10.000 yên.',
  'policy.businessManager2025.title': 'Siết chặt quy định Kinh doanh quản lý',
  'policy.businessManager2025.description': 'Cần vốn lớn hơn, một nhân viên toàn thời gian và kế hoạch được thẩm định.',
  'policy.residenceCard2026.title': 'Thẻ cư trú tích hợp My Number',
  'policy.residenceCard2026.description': 'Thẻ cư trú tích hợp My Number đã được đưa vào sử dụng.',
  'policy.act2026.title': 'Nâng trần lệ phí theo luật',
  'policy.act2026.description': 'Lần sửa đổi năm 2026 đã nâng trần pháp định của lệ phí cư trú.',

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
  'chart.mix.zoomInHintTap': 'Chạm vào một danh mục để xem, chạm lần nữa để phóng to',
  'chart.mix.zoomOutHintTap': 'Chạm vào nền để thu nhỏ',
  'chart.mix.others': 'Khác',
  'chart.mix.categoryAria': '{category}: {count} hồ sơ. Phóng to.',
  'chart.mix.tooltipValue': '{count} hồ sơ · {percent} của {scope}',
  'chart.mix.scopeAll': 'tất cả hồ sơ',
  'chart.mix.sunburstHint': '{trail} — {count} hồ sơ ({percent} trên tổng số)',
  'chart.sunburst.hintClick': 'Nhấp vào một phân đoạn để phóng to · di chuột để xem',
  'chart.sunburst.hintTap': 'Chạm vào một phân đoạn để xem, chạm lần nữa để phóng to',
  'chart.sunburst.zoomOutClick': 'Nhấp vào tâm để thu nhỏ',
  'chart.sunburst.zoomOutTap': 'Chạm vào tâm để thu nhỏ',

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
  'a11y.policyEvents': 'Các sự kiện chính sách hiển thị trên biểu đồ này',

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

  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.label': 'Bộ dữ liệu',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': 'Chọn bộ dữ liệu bạn muốn xem',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': 'Xử lý hồ sơ lưu trú',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': 'Xử lý hồ sơ',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': 'Dân số người nước ngoài cư trú',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': 'Người cư trú',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': 'Hiện chưa tải được dữ liệu về người nước ngoài cư trú.',
  'charts.growth.label': 'Tăng trưởng dân số',
  'charts.growth.description':
    'Tổng số cư dân nước ngoài theo từng nửa năm, xếp chồng theo mục đích lưu trú hoặc theo khu vực trên thế giới.',
  'charts.growth.aria':
    'Biểu đồ cột chồng về tổng số cư dân nước ngoài mỗi nửa năm, chia theo nhóm tư cách lưu trú hoặc khu vực',
  'charts.origins.label': 'Quốc tịch theo thời gian',
  'charts.origins.description':
    'Các quốc tịch đông nhất đã tăng hay giảm ra sao qua từng nửa năm mà thống kê ghi nhận.',
  'charts.origins.aria': 'Biểu đồ vùng chồng thể hiện số người cư trú theo quốc tịch qua thời gian',
  'charts.flows.label': 'Từ quốc tịch đến tư cách lưu trú',
  'charts.flows.description':
    'Từ khu vực trên thế giới qua từng quốc gia đến mục đích lưu trú — chọn khu vực hoặc quốc tịch để theo dõi hồ sơ.',
  'charts.flows.aria': 'Sơ đồ Sankey thể hiện cư dân từ khu vực thế giới qua quốc gia vào các danh mục tư cách lưu trú',
  'charts.statuses.label': 'Cơ cấu tư cách lưu trú',
  'charts.statuses.description':
    'Người cư trú đang giữ tư cách lưu trú nào, nhóm theo mục đích cư trú — bấm vào một nhóm để xem chi tiết.',
  'charts.statuses.aria': 'Biểu đồ sunburst về cư dân theo nhóm tư cách lưu trú và từng tư cách',
  'charts.worldmap.label': 'Quốc gia xuất thân',
  'charts.worldmap.description':
    'Người nước ngoài ở Nhật Bản đến từ đâu, tô đậm nhạt theo số người mang mỗi quốc tịch.',
  'charts.worldmap.aria': 'Bản đồ thế giới tô màu theo số người cư trú đến từ mỗi quốc gia',
  'charts.movers.label': 'Biến động lớn nhất',
  'charts.movers.description': 'Mức tăng và giảm lớn nhất giữa hai kỳ, theo quốc tịch hoặc theo tư cách lưu trú.',
  'charts.movers.aria': 'Biểu đồ thanh hai chiều thể hiện mức tăng và giảm lớn nhất giữa hai kỳ',

  'filters.region': 'Khu vực',
  'filters.allRegions': 'Tất cả khu vực',
  'filters.nationality': 'Quốc tịch',
  'filters.residenceStatus': 'Tư cách lưu trú',
  'filters.allNationalities': 'Tất cả quốc tịch',
  'filters.allStatuses': 'Tất cả tư cách lưu trú',
  'filters.allCategories': 'Tất cả danh mục',

  'period.snapshotLabel': 'Thời điểm hiển thị',
  'period.latestPeriod': 'Kỳ mới nhất',
  // 'period.years_one': '{count} year',
  'period.years_other': '{count} năm',

  'residents.total': 'Người nước ngoài cư trú',
  'residents.total.short': 'Người cư trú',
  'residents.delta': '{delta} so với nửa năm trước',
  'residents.populationShare': 'Tỷ lệ trên dân số',
  'residents.populationShare.short': 'Tỷ lệ dân số',
  'residents.populationShareOf': 'trên {population} dân của Nhật Bản',
  'residents.topNationality': 'Quốc tịch đông nhất',
  'residents.topNationality.short': 'Quốc tịch',
  'residents.topStatus': 'Tư cách lưu trú phổ biến nhất',
  'residents.topStatus.short': 'Tư cách',
  'residents.share': '{share} tổng số',
  'residents.scope': '{nationality} ({status})',
  'residents.otherNationalities': 'Quốc tịch khác',
  'residents.noMapArea': 'Có {count} quốc tịch không có lãnh thổ trên bản đồ nên không được tô màu.',
  'residents.legendScale': 'Người cư trú',
  'residents.discontinued': 'Chuỗi kết thúc vào {period}: hạng mục này đã được gộp hoặc đổi tên.',
  'residents.comparePeriod': 'so với {period}',
  'residents.byNationality': 'Theo quốc tịch',
  'residents.byStatus': 'Theo tư cách lưu trú',
  'residents.increase': 'Tăng',
  'residents.decrease': 'Giảm',
  'residents.asOf': 'Tính đến {period}',
  'residents.noChange': 'Không có thay đổi đáng kể giữa hai kỳ này.',
  'residents.coverageRange': '{from} – {to}',
  'residents.stackByGroup': 'Theo mục đích lưu trú',
  'residents.stackByRegion': 'Theo khu vực',
  'residents.stackByNationality': 'Theo quốc tịch',
  'residents.growthTotal': 'Tổng cộng',
  'residents.viewAbsolute': 'Số người',
  'residents.viewIndexed': 'Tăng trưởng (chỉ số)',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': 'cư dân',
  'residents.flowsTooltipValueLabel': 'Cư dân',
  'residents.flowsTooltipFlowLabel': 'Dòng chảy',
  'residents.sunburstHint': '{trail} — {count} cư dân ({percent} tổng số)',
  'residents.markerResidenceCard.title': 'Bắt đầu chế độ thẻ cư trú',
  'residents.markerResidenceCard.description':
    'Thẻ cư trú thay cho đăng ký người nước ngoài; thống kê này bắt đầu từ đó.',
  'residents.markerReopening.title': 'Mở lại biên giới',
  'residents.markerReopening.description': 'Đi lại miễn thị thực trở lại vào tháng 10 năm 2022 và dân số lại tăng.',
  'residents.markerTraining.title': 'Thay thế thực tập kỹ năng',
  'residents.markerTraining.description':
    'Lần sửa đổi năm 2024 lập chương trình đào tạo mới và siết điều kiện vĩnh trú.',
  'residents.markerBusinessManager.title': 'Siết chặt quy định Kinh doanh quản lý',
  'residents.markerBusinessManager.description':
    'Từ tháng 10 năm 2025 cần vốn lớn hơn, nhân viên toàn thời gian và kế hoạch được thẩm định.',
  'residents.markerSsw.title': 'Ra mắt visa Kỹ năng đặc định',
  'residents.markerSsw.description':
    'Loại visa tháng 4/2019 mở hơn một chục ngành nghề cho lao động nước ngoài có tay nghề.',
  'residents.markerCovid.title': 'Đóng cửa biên giới vì COVID-19',
  'residents.markerCovid.description':
    'Hạn chế nhập cảnh khiến người mới đến ngừng lại; dân số giảm cho đến giữa năm 2022.',
  'residents.markerKoreaSplit.title': 'Tách thống kê Hàn Quốc / Triều Tiên',
  'residents.markerKoreaSplit.description':
    'Mục Hàn Quốc·Triều Tiên gộp chung tách thành hai chuỗi Hàn Quốc và Triều Tiên — thay đổi cách thống kê, không phải biến động dân số.',

  'statusGroup.work': 'Lao động',
  'statusGroup.training': 'Thực tập',
  'statusGroup.study': 'Du học',
  'statusGroup.family': 'Gia đình',
  'statusGroup.residency': 'Định cư',
  'statusGroup.other': 'Khác',
  // ── World regions. ICU is tried first, but Chrome ships no names for M49
  // macro-regions, so these are what actually renders there. ────────────────
  'region.1000': 'Châu Á',
  'region.2000': 'Châu Âu',
  'region.3000': 'Châu Phi',
  'region.4000': 'Bắc Mỹ',
  'region.5000': 'Nam Mỹ',
  'region.6000': 'Châu Đại Dương',
  'region.7000': 'Không quốc tịch',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'nationality.1120': 'Triều Tiên (Chosen)',
  'nationality.1130': 'Hàn Quốc và Triều Tiên (gộp)',
  'nationality.2290': 'Serbia và Montenegro',
  'nationality.2500': 'Nam Tư',
  'nationality.7000': 'Không quốc tịch',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': 'Tổng số',
  'status.1040': 'Giáo sư',
  'status.1050': 'Nghệ thuật',
  'status.1060': 'Hoạt động tôn giáo',
  'status.1070': 'Báo chí',
  'status.1080': 'Nhân lực trình độ cao',
  'status.1090': 'Nhân lực trình độ cao loại 1 (a)',
  'status.1100': 'Nhân lực trình độ cao loại 1 (b)',
  'status.1110': 'Nhân lực trình độ cao loại 1 (c)',
  'status.1120': 'Nhân lực trình độ cao loại 2',
  'status.1130': 'Đầu tư / kinh doanh',
  'status.1140': 'Quản lý kinh doanh',
  'status.1150': 'Dịch vụ pháp lý và kế toán',
  'status.1160': 'Dịch vụ y tế',
  'status.1170': 'Nghiên cứu',
  'status.1180': 'Giảng dạy',
  'status.1190': 'Kỹ thuật',
  'status.1200': 'Chuyên môn nhân văn / nghiệp vụ quốc tế',
  'status.1210': 'Kỹ thuật / nhân văn / nghiệp vụ quốc tế',
  'status.1220': 'Điều chuyển nội bộ công ty',
  'status.1230': 'Điều dưỡng',
  'status.1240': 'Biểu diễn',
  'status.1250': 'Lao động có tay nghề',
  'status.1260': 'Kỹ năng đặc định',
  'status.1270': 'Kỹ năng đặc định loại 1',
  'status.1280': 'Kỹ năng đặc định loại 2',
  'status.1290': 'Thực tập kỹ năng',
  'status.1300': 'Thực tập kỹ năng loại 1 (a)',
  'status.1310': 'Thực tập kỹ năng loại 1 (b)',
  'status.1320': 'Thực tập kỹ năng loại 2 (a)',
  'status.1330': 'Thực tập kỹ năng loại 2 (b)',
  'status.1340': 'Thực tập kỹ năng loại 3 (a)',
  'status.1350': 'Thực tập kỹ năng loại 3 (b)',
  'status.1360': 'Hoạt động văn hóa',
  'status.1380': 'Du học',
  'status.1400': 'Tu nghiệp',
  'status.1410': 'Người phụ thuộc',
  'status.1420': 'Hoạt động đặc định',
  'status.1430': 'Vĩnh trú',
  'status.1440': 'Vợ/chồng hoặc con của công dân Nhật Bản',
  'status.1450': 'Vợ/chồng hoặc con của người vĩnh trú',
  'status.1460': 'Định trú',
  'status.1470': 'Vĩnh trú đặc biệt',
  'residents.mixRoot': 'Toàn bộ người cư trú',
  'residents.mixScopeAll': 'toàn bộ người cư trú',
  'residents.mixCategoryAria': '{category}: {count} người. Xem chi tiết.',
  'residents.mixTooltipValue': '{count} người · {percent} của {scope}',
};
