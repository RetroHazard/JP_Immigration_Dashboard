// src/i18n/__tests__/catalogue.test.ts
// Integrity checks every locale file must pass. These are what make a
// community-contributed language file safe to accept: a reviewer does not have
// to diff 300 keys by eye to know it lines up with English.
import { describe, expect, it } from 'vitest';

import { LOCALE_CODES, LOCALES } from '../locales';
import { en } from '../locales/en';
import type { PluralSuffix } from '../types';

const PLURAL_SUFFIXES: PluralSuffix[] = ['zero', 'one', 'two', 'few', 'many', 'other'];
const PLACEHOLDER = /\{(\w+)\}/g;

const englishKeys = new Set(Object.keys(en));
const translatedLocales = LOCALE_CODES.filter((code) => code !== 'en');

const placeholdersIn = (value: string): Set<string> =>
  new Set(Array.from(value.matchAll(PLACEHOLDER), (match) => match[1]));

const pluralBaseOf = (key: string): string | null => {
  const suffix = PLURAL_SUFFIXES.find((candidate) => key.endsWith(`_${candidate}`));
  return suffix ? key.slice(0, -(suffix.length + 1)) : null;
};

describe('English catalogue', () => {
  it('has no empty or whitespace-only values', () => {
    const blank = Object.entries(en).filter(([, value]) => value.trim() === '');
    expect(blank).toEqual([]);
  });

  it('gives every plural family an _other member', () => {
    const bases = new Set(Object.keys(en).map(pluralBaseOf).filter((base): base is string => base !== null));
    const missing = [...bases].filter((base) => !englishKeys.has(`${base}_other`));
    expect(missing).toEqual([]);
  });

  it('reserves underscores for plural suffixes', () => {
    const misused = Object.keys(en).filter((key) => key.includes('_') && pluralBaseOf(key) === null);
    expect(misused).toEqual([]);
  });
});

describe.each(translatedLocales)('%s catalogue', (code) => {
  const dictionary = LOCALES[code].dictionary as Record<string, string>;
  const entries = Object.entries(dictionary);

  it('defines no key that English does not', () => {
    const unknown = Object.keys(dictionary).filter((key) => !englishKeys.has(key));
    expect(unknown).toEqual([]);
  });

  it('has no empty or whitespace-only values', () => {
    const blank = entries.filter(([, value]) => value.trim() === '').map(([key]) => key);
    expect(blank).toEqual([]);
  });

  it('uses the same placeholders as the English string', () => {
    const mismatched = entries
      .filter(([key, value]) => {
        const source = en[key as keyof typeof en];
        if (source === undefined) return false;
        const expected = placeholdersIn(source);
        const actual = placeholdersIn(value);
        return expected.size !== actual.size || [...expected].some((name) => !actual.has(name));
      })
      .map(([key]) => key);
    expect(mismatched).toEqual([]);
  });

  it('covers the _other member of any plural family it translates', () => {
    const bases = new Set(Object.keys(dictionary).map(pluralBaseOf).filter((base): base is string => base !== null));
    const missing = [...bases].filter((base) => dictionary[`${base}_other`] === undefined);
    expect(missing).toEqual([]);
  });
});

describe('locale registry', () => {
  it('gives every locale a usable Intl tag', () => {
    for (const code of LOCALE_CODES) {
      const { intlTag } = LOCALES[code];
      expect(Intl.DateTimeFormat.supportedLocalesOf([intlTag])).toEqual([intlTag]);
    }
  });

  it('keys every entry by its own code', () => {
    for (const code of LOCALE_CODES) {
      expect(LOCALES[code].code).toBe(code);
    }
  });
});
