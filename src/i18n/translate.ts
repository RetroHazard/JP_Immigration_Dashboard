// src/i18n/translate.ts
// The lookup and interpolation core, kept free of React so it can be unit
// tested directly and reused outside a component tree: page metadata, and the
// CSV export's English pin (utils/chartTableCsv.ts).
import { en } from './locales/en';
import type { Dictionary, DictionaryKey, PluralSuffix, TParams } from './types';

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Substitutes `{name}` slots. A placeholder with no matching param is left
 * intact rather than blanked, so the mistake shows up in the UI instead of
 * quietly producing a half-empty sentence.
 */
export const interpolate = (template: string, params?: TParams): string =>
  params ? template.replace(PLACEHOLDER, (match, name: string) => (name in params ? String(params[name]) : match)) : template;

/**
 * Resolves a key against the active catalogue, then English, then the key
 * itself — an unknown key renders as `some.missing.key`, which is obvious in
 * review rather than silently blank.
 *
 * The English step is not only a safety net. utils/chartTableCsv.ts pins CSV
 * exports to English by resolving through a permanently empty dictionary, so
 * this fallthrough is what keeps a downloaded file parseable whatever the
 * interface language — collapsing it would silently localize every export.
 */
export const lookup = (dictionary: Dictionary, key: DictionaryKey): string => dictionary[key] ?? en[key] ?? key;

export const translate = (dictionary: Dictionary, key: DictionaryKey, params?: TParams): string =>
  interpolate(lookup(dictionary, key), params);

/**
 * Resolves `<key>_<category>` for `count`, falling back to `_other` — the one
 * category every locale defines, and the only one Japanese uses.
 *
 * `count` is injected as a param automatically; passing an explicit `count`
 * overrides it, which is how a caller substitutes a pre-formatted number.
 */
export const translatePlural = (
  dictionary: Dictionary,
  pluralRules: Intl.PluralRules,
  key: string,
  count: number,
  params?: TParams
): string => {
  const selected = `${key}_${pluralRules.select(count) as PluralSuffix}` as DictionaryKey;
  const other = `${key}_other` as DictionaryKey;
  const template = dictionary[selected] ?? en[selected] ?? dictionary[other] ?? en[other] ?? key;
  return interpolate(template, { count, ...params });
};
