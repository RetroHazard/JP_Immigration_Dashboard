// src/i18n/locales/en.ts
// English UI strings — the source of truth for the whole catalogue. Every
// other locale is a partial override of this file, and `DictionaryKey` is
// derived from it, so `tsc --noEmit` flags any key that is referenced in the
// app but not defined here.
//
// Conventions (see src/i18n/README.md):
// - Keys are dot-namespaced, grouped by the surface they appear on.
// - `{placeholder}` slots are substituted at render time; a translation must
//   use the same set of placeholders as the English string.
// - A `_one` / `_other` suffix pair marks a plural family, addressed by its
//   base name through `tPlural`. Underscores are reserved for that purpose.
export const en = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': 'Japan Immigration Statistics',
  'app.subtitle': 'Bureau processing data from e-Stat, updated with each release',
  'app.skipToContent': 'Skip to content',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Processing Time Estimator',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': 'Official statistics provided by the Immigration Services Agency of Japan',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Keyed by e-Stat bureau code. `.short` is the terminal-style abbreviation
  // shown on the stat tiles; leave it as the Latin code in most languages.
  'bureau.all': 'Nationwide',
  'bureau.all.short': 'ALL',
  'bureau.101010': 'Sapporo',
  'bureau.101010.short': 'CTS',
  'bureau.101090': 'Sendai',
  'bureau.101090.short': 'SDJ',
  'bureau.101170': 'Shinagawa',
  'bureau.101170.short': 'SGW',
  'bureau.101190': 'Narita Airport',
  'bureau.101190.short': 'NRT',
  'bureau.101200': 'Haneda Airport',
  'bureau.101200.short': 'HND',
  'bureau.101210': 'Yokohama',
  'bureau.101210.short': 'YOK',
  'bureau.101350': 'Nagoya',
  'bureau.101350.short': 'NAG',
  'bureau.101370': 'Chubu Airport',
  'bureau.101370.short': 'NGO',
  'bureau.101460': 'Osaka',
  'bureau.101460.short': 'ITM',
  'bureau.101480': 'Kansai Airport',
  'bureau.101480.short': 'KIX',
  'bureau.101490': 'Kobe',
  'bureau.101490.short': 'UKB',
  'bureau.101580': 'Hiroshima',
  'bureau.101580.short': 'HIJ',
  'bureau.101670': 'Takamatsu',
  'bureau.101670.short': 'TAK',
  'bureau.101720': 'Fukuoka',
  'bureau.101720.short': 'FUK',
  'bureau.101740': 'Naha',
  'bureau.101740.short': 'OKA',

  // ── Domain: application types ────────────────────────────────────────────
  // Keyed by e-Stat application type code. `.short` is the stat-tile
  // abbreviation; `.compact` is the one-word form the narrow Sankey uses.
  'appType.all': 'All Types',
  'appType.all.short': 'ALL',
  'appType.all.compact': 'All',
  'appType.10': 'Status Acquisition',
  'appType.10.short': 'ACQ',
  'appType.10.compact': 'Acquisition',
  'appType.20': 'Extension of Stay',
  'appType.20.short': 'EXT',
  'appType.20.compact': 'Extension',
  'appType.30': 'Change of Status',
  'appType.30.short': 'CHG',
  'appType.30.compact': 'Change',
  'appType.40': 'Permission for Activities',
  'appType.40.short': 'ACT',
  'appType.40.compact': 'Permission',
  'appType.50': 'Re-entry',
  'appType.50.short': 'RET',
  'appType.50.compact': 'Re-entry',
  'appType.60': 'Permanent Residence',
  'appType.60.short': 'PR',
  'appType.60.compact': 'Permanent',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code (1 Hokkaido … 47 Okinawa).
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
} as const;
