// src/i18n/config.ts
import type { Locale } from './locales';

export const DEFAULT_LOCALE: Locale = 'en';

/** localStorage key holding the visitor's explicit language choice. */
export const LOCALE_STORAGE_KEY = 'locale';

/** Query param used to force a locale, e.g. `?lang=ja`. */
export const LOCALE_QUERY_PARAM = 'lang';

/**
 * Whether the language switcher is offered in the UI.
 *
 * The extraction work is done — every string is addressable — but the
 * Japanese catalogue is still mostly English fallbacks, and shipping a visible
 * switcher before a locale is actually translated is what got the original
 * switcher pulled in v1.1.0. Flip this to `true` once a locale reaches
 * meaningful coverage; `?lang=` works regardless, for testing.
 *
 * This flag also gates browser-language detection: auto-detecting Japanese
 * while the switcher is hidden would strand Japanese visitors in a
 * mostly-English dashboard with no way back to English.
 */
export const LOCALE_SWITCHER_ENABLED = false;
