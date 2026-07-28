// src/i18n/types.ts
// Types shared across the i18n module. Everything keys off the English
// catalogue, so adding a string there is what makes it addressable.
import type { en } from './locales/en';

/** Every key defined in the English catalogue. */
export type DictionaryKey = keyof typeof en;

/**
 * A locale's catalogue. Partial by design: missing keys fall back to English,
 * so a half-finished translation is always safe to ship.
 */
export type Dictionary = Partial<Record<DictionaryKey, string>>;

/** Values substituted into a string's `{placeholder}` slots. */
export type TParams = Record<string, string | number>;

/** The CLDR plural categories, used as catalogue key suffixes. */
export type PluralSuffix = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Base names of plural key families. Defining `foo_one` and `foo_other` in the
 * catalogue is what makes `tPlural('foo', n)` type-check.
 */
export type PluralKey<K = DictionaryKey> = K extends `${infer Base}_${PluralSuffix}` ? Base : never;

export type TranslateFn = (key: DictionaryKey, params?: TParams) => string;
export type TranslatePluralFn = (key: PluralKey, count: number, params?: TParams) => string;
