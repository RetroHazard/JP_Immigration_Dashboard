// src/constants/nationalities.ts
// Identity-only table for the e-Stat `cat02` (国籍・地域) dimension of the
// Foreign Residents table (0004019020). Display names deliberately live
// elsewhere, same as applicationOptions/bureauOptions: `useNationalityLabel`
// (src/i18n/useDomainLabels.ts) resolves `iso2` through Intl.DisplayNames so
// all 13 locales get country names for free, and falls back to the
// `nationality.<value>` catalogue key for the handful of rows below that have
// no ISO identity.
//
// The `@parentCode`/`@level` metadata in the payload is NOT used to build this
// table — see `isSubset` below for why.

export interface Nationality {
  /** e-Stat cat02 code — the stable identifier and the catalogue key suffix. */
  value: string;
  /** ISO 3166-1 alpha-2, or null when the row has no ISO identity. */
  iso2: string | null;
  /**
   * ISO 3166-1 numeric — what the world TopoJSON keys its features on.
   * Kosovo has no assigned code; scripts/vendor-world-topology.mjs stamps the
   * conventional 926 onto its feature so the two still join.
   */
  iso3n: number | null;
  /** Continent grouping (`region.<code>` in the catalogue). */
  region: string;
  /**
   * True for rows CONTAINED IN another row, which would double-count if
   * summed: うち中国〔香港〕/〔その他〕 sit inside 中国, and うち英国〔香港〕
   * inside 英国. Verified numerically — with these three excluded the leaves
   * sum to the published 総数 exactly, and including them overshoots it.
   */
  isSubset?: boolean;
  /**
   * A series that stops (or starts) partway through the 2012-2025 span
   * because the reporting category changed. 韓国・朝鮮 is the pre-2015 combined
   * Korea series: it runs 2012-12 to 2015-06, and 韓国 + 朝鮮 take over from
   * 2015-12. The two never overlap, so this is a discontinuity for charts to
   * render as a gap — NOT a subset to exclude from sums.
   */
  legacy?: boolean;
}

/** The nationwide 総数 row. Derivable from the leaves, so it is never shipped. */
export const NATIONALITY_TOTAL = '0000';

/**
 * Continent rollups. e-Stat publishes a row for each of these that is the sum
 * of its member countries, so they are derivable and never shipped.
 */
export const NATIONALITY_ROLLUP_REGIONS = [
  '1000', // アジア
  '2000', // ヨーロッパ
  '3000', // アフリカ
  '4000', // 北アメリカ
  '5000', // 南アメリカ
  '6000', // オセアニア
] as const;

/** 無国籍: published at region level but with no members. */
export const STATELESS = '7000';

/**
 * Buckets the UI groups nationalities into. Same as the rollups above plus
 * 無国籍, which e-Stat publishes at region level but with no members — it is a
 * leaf carrying its own figure, not a sum of anything, so it must be kept.
 */
export const NATIONALITY_REGIONS = [...NATIONALITY_ROLLUP_REGIONS, STATELESS] as const;

/**
 * UN M49 codes for the continent rollups, including e-Stat's 北アメリカ, which
 * spans Central America and the Caribbean and so is M49 003 (the continent)
 * rather than 021 (Northern America). 無国籍 has no M49 equivalent at all.
 *
 * `useRegionLabel` tries these through Intl.DisplayNames first, but they are
 * not a substitute for catalogue entries: Chrome and Edge ship no display
 * names for M49 macro-regions, so `.of('142')` hands back '142' instead of
 * "Asia" and the label falls through to `region.*`. Node and Firefox do
 * resolve them, which is why this only ever showed up in the browser. Every
 * region therefore has a catalogue entry in all thirteen locales.
 */
export const REGION_M49: Record<string, string> = {
  '1000': '142', // Asia
  '2000': '150', // Europe
  '3000': '002', // Africa
  '4000': '003', // North America
  '5000': '005', // South America
  '6000': '009', // Oceania
};

export const nationalities: Nationality[] = [
  { value: '1010', iso2: 'AF', iso3n: 4, region: '1000' }, // アフガニスタン
  { value: '1020', iso2: 'AE', iso3n: 784, region: '1000' }, // アラブ首長国連邦
  { value: '1030', iso2: 'YE', iso3n: 887, region: '1000' }, // イエメン
  { value: '1040', iso2: 'IL', iso3n: 376, region: '1000' }, // イスラエル
  { value: '1050', iso2: 'IQ', iso3n: 368, region: '1000' }, // イラク
  { value: '1060', iso2: 'IR', iso3n: 364, region: '1000' }, // イラン
  { value: '1070', iso2: 'IN', iso3n: 356, region: '1000' }, // インド
  { value: '1080', iso2: 'ID', iso3n: 360, region: '1000' }, // インドネシア
  { value: '1090', iso2: 'OM', iso3n: 512, region: '1000' }, // オマーン
  { value: '1100', iso2: 'QA', iso3n: 634, region: '1000' }, // カタール
  { value: '1110', iso2: 'KR', iso3n: 410, region: '1000' }, // 韓国
  { value: '1120', iso2: null, iso3n: null, region: '1000' }, // 朝鮮
  { value: '1130', iso2: null, iso3n: null, region: '1000', legacy: true }, // 韓国・朝鮮 (→ 韓国 + 朝鮮, 2015)
  { value: '1140', iso2: 'KH', iso3n: 116, region: '1000' }, // カンボジア
  { value: '1150', iso2: 'CY', iso3n: 196, region: '1000' }, // キプロス
  { value: '1160', iso2: 'KW', iso3n: 414, region: '1000' }, // クウェート
  { value: '1170', iso2: 'SA', iso3n: 682, region: '1000' }, // サウジアラビア
  { value: '1180', iso2: 'SY', iso3n: 760, region: '1000' }, // シリア
  { value: '1190', iso2: 'SG', iso3n: 702, region: '1000' }, // シンガポール
  { value: '1200', iso2: 'LK', iso3n: 144, region: '1000' }, // スリランカ
  { value: '1210', iso2: 'TH', iso3n: 764, region: '1000' }, // タイ
  { value: '1220', iso2: 'TW', iso3n: 158, region: '1000' }, // 台湾
  { value: '1230', iso2: 'CN', iso3n: 156, region: '1000' }, // 中国
  { value: '1240', iso2: 'HK', iso3n: 344, region: '1000', isSubset: true }, // うち中国〔香港〕
  { value: '1250', iso2: null, iso3n: null, region: '1000', isSubset: true }, // うち中国〔その他〕
  { value: '1260', iso2: 'TR', iso3n: 792, region: '1000' }, // トルコ
  { value: '1270', iso2: 'NP', iso3n: 524, region: '1000' }, // ネパール
  { value: '1280', iso2: 'BH', iso3n: 48, region: '1000' }, // バーレーン
  { value: '1290', iso2: 'PK', iso3n: 586, region: '1000' }, // パキスタン
  { value: '1300', iso2: 'PS', iso3n: 275, region: '1000' }, // パレスチナ
  { value: '1310', iso2: 'BD', iso3n: 50, region: '1000' }, // バングラデシュ
  { value: '1320', iso2: 'TL', iso3n: 626, region: '1000' }, // 東ティモール
  { value: '1330', iso2: 'PH', iso3n: 608, region: '1000' }, // フィリピン
  { value: '1340', iso2: 'BT', iso3n: 64, region: '1000' }, // ブータン
  { value: '1350', iso2: 'BN', iso3n: 96, region: '1000' }, // ブルネイ
  { value: '1360', iso2: 'VN', iso3n: 704, region: '1000' }, // ベトナム
  { value: '1370', iso2: 'MY', iso3n: 458, region: '1000' }, // マレーシア
  { value: '1380', iso2: 'MM', iso3n: 104, region: '1000' }, // ミャンマー
  { value: '1390', iso2: 'MV', iso3n: 462, region: '1000' }, // モルディブ
  { value: '1400', iso2: 'MN', iso3n: 496, region: '1000' }, // モンゴル
  { value: '1410', iso2: 'JO', iso3n: 400, region: '1000' }, // ヨルダン
  { value: '1420', iso2: 'LA', iso3n: 418, region: '1000' }, // ラオス
  { value: '1430', iso2: 'LB', iso3n: 422, region: '1000' }, // レバノン
  { value: '2010', iso2: 'IS', iso3n: 352, region: '2000' }, // アイスランド
  { value: '2020', iso2: 'IE', iso3n: 372, region: '2000' }, // アイルランド
  { value: '2030', iso2: 'AZ', iso3n: 31, region: '2000' }, // アゼルバイジャン
  { value: '2040', iso2: 'AL', iso3n: 8, region: '2000' }, // アルバニア
  { value: '2050', iso2: 'AM', iso3n: 51, region: '2000' }, // アルメニア
  { value: '2060', iso2: 'AD', iso3n: 20, region: '2000' }, // アンドラ
  { value: '2070', iso2: 'IT', iso3n: 380, region: '2000' }, // イタリア
  { value: '2080', iso2: 'UA', iso3n: 804, region: '2000' }, // ウクライナ
  { value: '2090', iso2: 'UZ', iso3n: 860, region: '2000' }, // ウズベキスタン
  { value: '2100', iso2: 'GB', iso3n: 826, region: '2000' }, // 英国
  { value: '2110', iso2: null, iso3n: null, region: '2000', isSubset: true }, // うち英国〔香港〕
  { value: '2120', iso2: 'EE', iso3n: 233, region: '2000' }, // エストニア
  { value: '2130', iso2: 'AT', iso3n: 40, region: '2000' }, // オーストリア
  { value: '2140', iso2: 'NL', iso3n: 528, region: '2000' }, // オランダ
  { value: '2150', iso2: 'KZ', iso3n: 398, region: '2000' }, // カザフスタン
  { value: '2160', iso2: 'MK', iso3n: 807, region: '2000' }, // 北マケドニア
  { value: '2170', iso2: 'GR', iso3n: 300, region: '2000' }, // ギリシャ
  { value: '2180', iso2: 'KG', iso3n: 417, region: '2000' }, // キルギス
  { value: '2190', iso2: 'HR', iso3n: 191, region: '2000' }, // クロアチア
  { value: '2200', iso2: 'XK', iso3n: 926, region: '2000' }, // コソボ共和国 (XK/926 are conventional, not ISO-assigned)
  { value: '2210', iso2: 'SM', iso3n: 674, region: '2000' }, // サンマリノ
  { value: '2220', iso2: 'GE', iso3n: 268, region: '2000' }, // ジョージア
  { value: '2230', iso2: 'CH', iso3n: 756, region: '2000' }, // スイス
  { value: '2240', iso2: 'SE', iso3n: 752, region: '2000' }, // スウェーデン
  { value: '2250', iso2: 'ES', iso3n: 724, region: '2000' }, // スペイン
  { value: '2260', iso2: 'SK', iso3n: 703, region: '2000' }, // スロバキア
  { value: '2270', iso2: 'SI', iso3n: 705, region: '2000' }, // スロベニア
  { value: '2280', iso2: 'RS', iso3n: 688, region: '2000' }, // セルビア
  { value: '2290', iso2: null, iso3n: null, region: '2000' }, // セルビア・モンテネグロ
  { value: '2300', iso2: 'TJ', iso3n: 762, region: '2000' }, // タジキスタン
  { value: '2310', iso2: 'CZ', iso3n: 203, region: '2000' }, // チェコ
  { value: '2320', iso2: 'DK', iso3n: 208, region: '2000' }, // デンマーク
  { value: '2330', iso2: 'DE', iso3n: 276, region: '2000' }, // ドイツ
  { value: '2340', iso2: 'TM', iso3n: 795, region: '2000' }, // トルクメニスタン
  { value: '2350', iso2: 'NO', iso3n: 578, region: '2000' }, // ノルウェー
  { value: '2370', iso2: 'HU', iso3n: 348, region: '2000' }, // ハンガリー
  { value: '2380', iso2: 'FI', iso3n: 246, region: '2000' }, // フィンランド
  { value: '2390', iso2: 'FR', iso3n: 250, region: '2000' }, // フランス
  { value: '2400', iso2: 'BG', iso3n: 100, region: '2000' }, // ブルガリア
  { value: '2410', iso2: 'BY', iso3n: 112, region: '2000' }, // ベラルーシ
  { value: '2420', iso2: 'BE', iso3n: 56, region: '2000' }, // ベルギー
  { value: '2430', iso2: 'PL', iso3n: 616, region: '2000' }, // ポーランド
  { value: '2440', iso2: 'BA', iso3n: 70, region: '2000' }, // ボスニア・ヘルツェゴビナ
  { value: '2450', iso2: 'PT', iso3n: 620, region: '2000' }, // ポルトガル
  { value: '2460', iso2: 'MT', iso3n: 470, region: '2000' }, // マルタ
  { value: '2470', iso2: 'MC', iso3n: 492, region: '2000' }, // モナコ
  { value: '2480', iso2: 'MD', iso3n: 498, region: '2000' }, // モルドバ
  { value: '2490', iso2: 'ME', iso3n: 499, region: '2000' }, // モンテネグロ
  { value: '2500', iso2: null, iso3n: null, region: '2000', legacy: true }, // ユーゴスラヴィア
  { value: '2510', iso2: 'LV', iso3n: 428, region: '2000' }, // ラトビア
  { value: '2520', iso2: 'LT', iso3n: 440, region: '2000' }, // リトアニア
  { value: '2530', iso2: 'LI', iso3n: 438, region: '2000' }, // リヒテンシュタイン
  { value: '2540', iso2: 'RO', iso3n: 642, region: '2000' }, // ルーマニア
  { value: '2550', iso2: 'LU', iso3n: 442, region: '2000' }, // ルクセンブルク
  { value: '2560', iso2: 'RU', iso3n: 643, region: '2000' }, // ロシア
  { value: '3010', iso2: 'DZ', iso3n: 12, region: '3000' }, // アルジェリア
  { value: '3020', iso2: 'AO', iso3n: 24, region: '3000' }, // アンゴラ
  { value: '3030', iso2: 'UG', iso3n: 800, region: '3000' }, // ウガンダ
  { value: '3040', iso2: 'EG', iso3n: 818, region: '3000' }, // エジプト
  { value: '3050', iso2: 'SZ', iso3n: 748, region: '3000' }, // エスワティニ
  { value: '3060', iso2: 'ET', iso3n: 231, region: '3000' }, // エチオピア
  { value: '3070', iso2: 'ER', iso3n: 232, region: '3000' }, // エリトリア
  { value: '3080', iso2: 'GH', iso3n: 288, region: '3000' }, // ガーナ
  { value: '3090', iso2: 'CV', iso3n: 132, region: '3000' }, // カーボベルデ
  { value: '3100', iso2: 'GA', iso3n: 266, region: '3000' }, // ガボン
  { value: '3110', iso2: 'CM', iso3n: 120, region: '3000' }, // カメルーン
  { value: '3120', iso2: 'GM', iso3n: 270, region: '3000' }, // ガンビア
  { value: '3130', iso2: 'GN', iso3n: 324, region: '3000' }, // ギニア
  { value: '3140', iso2: 'GW', iso3n: 624, region: '3000' }, // ギニアビサウ
  { value: '3150', iso2: 'KE', iso3n: 404, region: '3000' }, // ケニア
  { value: '3160', iso2: 'CI', iso3n: 384, region: '3000' }, // コートジボワール
  { value: '3170', iso2: 'KM', iso3n: 174, region: '3000' }, // コモロ
  { value: '3180', iso2: 'CG', iso3n: 178, region: '3000' }, // コンゴ共和国
  { value: '3190', iso2: 'CD', iso3n: 180, region: '3000' }, // コンゴ民主共和国
  { value: '3200', iso2: 'ST', iso3n: 678, region: '3000' }, // サントメ・プリンシペ
  { value: '3210', iso2: 'ZM', iso3n: 894, region: '3000' }, // ザンビア
  { value: '3220', iso2: 'SL', iso3n: 694, region: '3000' }, // シエラレオネ
  { value: '3230', iso2: 'DJ', iso3n: 262, region: '3000' }, // ジブチ
  { value: '3240', iso2: 'ZW', iso3n: 716, region: '3000' }, // ジンバブエ
  { value: '3250', iso2: 'SD', iso3n: 729, region: '3000' }, // スーダン
  { value: '3260', iso2: 'SC', iso3n: 690, region: '3000' }, // セーシェル
  { value: '3270', iso2: 'GQ', iso3n: 226, region: '3000' }, // 赤道ギニア
  { value: '3280', iso2: 'SN', iso3n: 686, region: '3000' }, // セネガル
  { value: '3290', iso2: 'SO', iso3n: 706, region: '3000' }, // ソマリア
  { value: '3300', iso2: 'TZ', iso3n: 834, region: '3000' }, // タンザニア
  { value: '3310', iso2: 'TD', iso3n: 148, region: '3000' }, // チャド
  { value: '3320', iso2: 'CF', iso3n: 140, region: '3000' }, // 中央アフリカ
  { value: '3330', iso2: 'TN', iso3n: 788, region: '3000' }, // チュニジア
  { value: '3340', iso2: 'TG', iso3n: 768, region: '3000' }, // トーゴ
  { value: '3350', iso2: 'NG', iso3n: 566, region: '3000' }, // ナイジェリア
  { value: '3360', iso2: 'NA', iso3n: 516, region: '3000' }, // ナミビア
  { value: '3370', iso2: 'NE', iso3n: 562, region: '3000' }, // ニジェール
  { value: '3380', iso2: 'BF', iso3n: 854, region: '3000' }, // ブルキナファソ
  { value: '3390', iso2: 'BI', iso3n: 108, region: '3000' }, // ブルンジ
  { value: '3400', iso2: 'BJ', iso3n: 204, region: '3000' }, // ベナン
  { value: '3410', iso2: 'BW', iso3n: 72, region: '3000' }, // ボツワナ
  { value: '3420', iso2: 'MG', iso3n: 450, region: '3000' }, // マダガスカル
  { value: '3430', iso2: 'MW', iso3n: 454, region: '3000' }, // マラウイ
  { value: '3440', iso2: 'ML', iso3n: 466, region: '3000' }, // マリ
  { value: '3450', iso2: 'ZA', iso3n: 710, region: '3000' }, // 南アフリカ共和国
  { value: '3460', iso2: 'SS', iso3n: 728, region: '3000' }, // 南スーダン共和国
  { value: '3470', iso2: 'MU', iso3n: 480, region: '3000' }, // モーリシャス
  { value: '3480', iso2: 'MR', iso3n: 478, region: '3000' }, // モーリタニア
  { value: '3490', iso2: 'MZ', iso3n: 508, region: '3000' }, // モザンビーク
  { value: '3500', iso2: 'MA', iso3n: 504, region: '3000' }, // モロッコ
  { value: '3510', iso2: 'LY', iso3n: 434, region: '3000' }, // リビア
  { value: '3520', iso2: 'LR', iso3n: 430, region: '3000' }, // リベリア
  { value: '3530', iso2: 'RW', iso3n: 646, region: '3000' }, // ルワンダ
  { value: '3540', iso2: 'LS', iso3n: 426, region: '3000' }, // レソト
  { value: '4010', iso2: 'AG', iso3n: 28, region: '4000' }, // アンティグア・バーブーダ
  { value: '4020', iso2: 'SV', iso3n: 222, region: '4000' }, // エルサルバドル
  { value: '4030', iso2: 'CA', iso3n: 124, region: '4000' }, // カナダ
  { value: '4040', iso2: 'CU', iso3n: 192, region: '4000' }, // キューバ
  { value: '4050', iso2: 'GT', iso3n: 320, region: '4000' }, // グアテマラ
  { value: '4060', iso2: 'GD', iso3n: 308, region: '4000' }, // グレナダ
  { value: '4070', iso2: 'CR', iso3n: 188, region: '4000' }, // コスタリカ
  { value: '4080', iso2: 'JM', iso3n: 388, region: '4000' }, // ジャマイカ
  { value: '4090', iso2: 'KN', iso3n: 659, region: '4000' }, // セントクリストファー・ネービス
  { value: '4100', iso2: 'VC', iso3n: 670, region: '4000' }, // セントビンセント
  { value: '4110', iso2: 'LC', iso3n: 662, region: '4000' }, // セントルシア
  { value: '4120', iso2: 'DM', iso3n: 212, region: '4000' }, // ドミニカ
  { value: '4130', iso2: 'DO', iso3n: 214, region: '4000' }, // ドミニカ共和国
  { value: '4140', iso2: 'TT', iso3n: 780, region: '4000' }, // トリニダード・トバゴ
  { value: '4150', iso2: 'NI', iso3n: 558, region: '4000' }, // ニカラグア
  { value: '4160', iso2: 'HT', iso3n: 332, region: '4000' }, // ハイチ
  { value: '4170', iso2: 'PA', iso3n: 591, region: '4000' }, // パナマ
  { value: '4180', iso2: 'BS', iso3n: 44, region: '4000' }, // バハマ
  { value: '4190', iso2: 'BB', iso3n: 52, region: '4000' }, // バルバドス
  { value: '4200', iso2: 'US', iso3n: 840, region: '4000' }, // 米国
  { value: '4210', iso2: 'BZ', iso3n: 84, region: '4000' }, // ベリーズ
  { value: '4220', iso2: 'HN', iso3n: 340, region: '4000' }, // ホンジュラス
  { value: '4230', iso2: 'MX', iso3n: 484, region: '4000' }, // メキシコ
  { value: '5010', iso2: 'AR', iso3n: 32, region: '5000' }, // アルゼンチン
  { value: '5020', iso2: 'UY', iso3n: 858, region: '5000' }, // ウルグアイ
  { value: '5030', iso2: 'EC', iso3n: 218, region: '5000' }, // エクアドル
  { value: '5040', iso2: 'GY', iso3n: 328, region: '5000' }, // ガイアナ
  { value: '5050', iso2: 'CO', iso3n: 170, region: '5000' }, // コロンビア
  { value: '5060', iso2: 'SR', iso3n: 740, region: '5000' }, // スリナム
  { value: '5070', iso2: 'CL', iso3n: 152, region: '5000' }, // チリ
  { value: '5080', iso2: 'PY', iso3n: 600, region: '5000' }, // パラグアイ
  { value: '5090', iso2: 'BR', iso3n: 76, region: '5000' }, // ブラジル
  { value: '5100', iso2: 'VE', iso3n: 862, region: '5000' }, // ベネズエラ
  { value: '5110', iso2: 'PE', iso3n: 604, region: '5000' }, // ペルー
  { value: '5120', iso2: 'BO', iso3n: 68, region: '5000' }, // ボリビア
  { value: '6010', iso2: 'AU', iso3n: 36, region: '6000' }, // オーストラリア
  { value: '6020', iso2: 'KI', iso3n: 296, region: '6000' }, // キリバス
  { value: '6030', iso2: 'WS', iso3n: 882, region: '6000' }, // サモア
  { value: '6040', iso2: 'SB', iso3n: 90, region: '6000' }, // ソロモン
  { value: '6060', iso2: 'TV', iso3n: 798, region: '6000' }, // ツバル
  { value: '6070', iso2: 'TO', iso3n: 776, region: '6000' }, // トンガ
  { value: '6080', iso2: 'NR', iso3n: 520, region: '6000' }, // ナウル
  { value: '6090', iso2: 'NZ', iso3n: 554, region: '6000' }, // ニュージーランド
  { value: '6100', iso2: 'VU', iso3n: 548, region: '6000' }, // バヌアツ
  { value: '6110', iso2: 'PG', iso3n: 598, region: '6000' }, // パプアニューギニア
  { value: '6120', iso2: 'PW', iso3n: 585, region: '6000' }, // パラオ
  { value: '6130', iso2: 'FJ', iso3n: 242, region: '6000' }, // フィジー
  { value: '6140', iso2: 'MH', iso3n: 584, region: '6000' }, // マーシャル
  { value: '6150', iso2: 'FM', iso3n: 583, region: '6000' }, // ミクロネシア
  { value: '7000', iso2: null, iso3n: null, region: '7000' }, // 無国籍
];

const byCode = new Map(nationalities.map((nationality) => [nationality.value, nationality]));

export const nationalityByCode = (code: string): Nationality | undefined => byCode.get(code);

/** Rows safe to sum: every leaf except the ones nested inside another leaf. */
export const summableNationalities = nationalities.filter((nationality) => !nationality.isSubset);

/**
 * Codes that are the later half of a series that changed identity mid-history,
 * mapped to the code the series ran under before.
 *
 * 韓国・朝鮮 (1130) is published up to 2015-06; from 2015-12 the same
 * population is split into 韓国 (1110) and 朝鮮 (1120). Charts that plot across
 * that boundary have to fold the three back into one series — the alternative
 * is a line that appears to collapse to zero in 2015 and another that appears
 * from nowhere, neither of which happened. Views of a single period leave the
 * codes alone, since only one of them exists in any given period anyway.
 */
export const NATIONALITY_SERIES_KEY: Record<string, string> = {
  '1110': '1130', // 韓国 → 韓国・朝鮮
  '1120': '1130', // 朝鮮 → 韓国・朝鮮
};

/** Codes that must never be added into a total (see `isSubset`). */
export const NATIONALITY_SUBSET_CODES = new Set(
  nationalities.filter((nationality) => nationality.isSubset).map((nationality) => nationality.value)
);
