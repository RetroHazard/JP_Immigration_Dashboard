// src/i18n/ja.ts
// Japanese overrides (partial while translation is in progress; untranslated
// keys fall back to English).
import type { DictionaryKey } from './en';

export const ja: Partial<Record<DictionaryKey, string>> = {
  'app.title': '日本 在留審査統計',
  'app.subtitle': '出入国在留管理庁の審査データ（e-Stat から毎日更新）',
  'app.skipToContent': '本文へスキップ',
  'estimator.title': '審査期間の目安',
  'footer.attribution': '統計データ提供：出入国在留管理庁',
};
