// src/i18n/locales/index.ts
// The locale registry. Adding a language is: drop `<code>.ts` in this folder,
// import it, and add one entry below. Nothing else in the app needs to change
// — the switcher, the `?lang=` parser, and the catalogue tests all read from
// this registry.
import type { Dictionary } from '../types';
import { en } from './en';
import { ja } from './ja';

/**
 * How complete a translation claims to be.
 *
 * `complete` is a promise the catalogue tests enforce: the locale must define
 * every key English defines, and CI fails if English later adds one it lacks.
 * `in-progress` only reports its coverage, so a translation can land a section
 * at a time without wedging the build.
 */
export type LocaleStatus = 'complete' | 'in-progress';

export interface LocaleMeta {
  /** Short code used in `?lang=`, localStorage, and `<html lang>`. */
  code: string;
  /** The language's own name, as shown in the language switcher. */
  nativeName: string;
  /** BCP 47 tag handed to `Intl.*` for number, date, and plural formatting. */
  intlTag: string;
  /** Flip to `complete` once the file covers every English key. */
  status: LocaleStatus;
  dictionary: Dictionary;
}

export const LOCALES = {
  en: { code: 'en', nativeName: 'English', intlTag: 'en-US', status: 'complete', dictionary: en },
  ja: { code: 'ja', nativeName: '日本語', intlTag: 'ja-JP', status: 'complete', dictionary: ja },
} as const satisfies Record<string, LocaleMeta>;

export type Locale = keyof typeof LOCALES;

export const LOCALE_CODES = Object.keys(LOCALES) as Locale[];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(LOCALES, value);
