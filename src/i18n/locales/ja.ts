// src/i18n/locales/ja.ts
// Japanese overrides. Partial while translation is in progress — any key left
// out falls back to the English string, so this file can grow one section at a
// time without ever leaving a blank in the UI.
//
// Japanese has a single CLDR plural category, so plural families only ever
// need their `_other` member here.
import type { Dictionary } from '../types';

export const ja: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': '日本 在留審査統計',
  'app.subtitle': '出入国在留管理庁の審査データ（e-Stat の公表に合わせて更新）',
  'app.skipToContent': '本文へスキップ',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': '審査期間の目安',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': '統計データ提供：出入国在留管理庁',
};
