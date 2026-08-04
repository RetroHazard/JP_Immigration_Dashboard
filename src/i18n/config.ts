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
 * On since the Japanese catalogue reached full coverage — the condition this
 * flag was waiting for. It stayed off through v1.1.0 because shipping a
 * visible switcher over a five-string stub is what got the original switcher
 * pulled, and a partially translated dashboard reads as broken rather than
 * multilingual.
 *
 * The flag also gates browser-language detection, and the two belong together:
 * auto-detecting Japanese is only safe while the switcher is visible, because
 * that is what gives a visitor a way back to English. Turning one on without
 * the other is the failure mode this single flag exists to prevent.
 *
 * A locale that is still in progress should be kept out of the registry (or
 * shipped behind `?lang=`, which works regardless) rather than handled by
 * flipping this off again — that would take Japanese down with it.
 */
export const LOCALE_SWITCHER_ENABLED = true;
