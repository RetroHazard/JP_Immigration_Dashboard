import type { Locale } from './locales';

export const DEFAULT_LOCALE: Locale = 'en';

/** localStorage key holding the visitor's explicit language choice. */
export const LOCALE_STORAGE_KEY = 'locale';

/** Query param used to force a locale, e.g. `?lang=ja`. */
export const LOCALE_QUERY_PARAM = 'lang';

/**
 * Whether the language switcher is offered in the UI.
 *
 * Also gates browser-language detection, and the two belong together:
 * auto-detecting a language is only safe while the switcher gives the visitor
 * a way back to English. Don't turn this off to hide an unfinished locale; it
 * would hide every finished one too.
 */
export const LOCALE_SWITCHER_ENABLED = true;
