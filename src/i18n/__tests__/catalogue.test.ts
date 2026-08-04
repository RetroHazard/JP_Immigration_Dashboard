// src/i18n/__tests__/catalogue.test.ts
// Integrity checks every locale file must pass. These are what make a
// community-contributed language file safe to accept: a reviewer does not have
// to diff 300 keys by eye to know it lines up with English.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildTemplate, EN_RELATIVE, TEMPLATE_RELATIVE } from '../../../scripts/localeTemplate';
import type { Locale, LocaleMeta } from '../locales';
import { LOCALE_CODES, LOCALES } from '../locales';
import { en } from '../locales/en';
import type { DictionaryKey, PluralSuffix } from '../types';

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

/**
 * The keys a locale must define to call itself complete.
 *
 * Not simply "every English key": plural families are the exception. English
 * needs `_one` and `_other`, but Japanese has a single CLDR category, so
 * demanding a `period.months_one` from it would force a meaningless duplicate.
 * Each language owes only the members its own `Intl.PluralRules` can select,
 * plus `_other` as the universal fallback.
 */
const requiredKeysFor = (intlTag: string): string[] => {
  const categories = new Set<string>([...new Intl.PluralRules(intlTag).resolvedOptions().pluralCategories, 'other']);
  return Object.keys(en).filter((key) => {
    const base = pluralBaseOf(key);
    if (base === null) return true;
    return categories.has(key.slice(base.length + 1));
  });
};

describe.each(translatedLocales)('%s catalogue', (code) => {
  // Read through LocaleMeta rather than off the `as const` registry: with one
  // translated locale today, the literal types collapse to it and the
  // completeness branch below would read as dead code.
  const meta: LocaleMeta = LOCALES[code];
  const dictionary = meta.dictionary as Record<string, string>;
  const entries = Object.entries(dictionary);
  const required = requiredKeysFor(meta.intlTag);
  const missing = required.filter((key) => dictionary[key] === undefined);

  if (meta.status === 'complete') {
    it('covers every English key', () => {
      // English is the ground truth. A locale that claims completeness fails
      // here the moment English gains a key it does not carry.
      expect(missing).toEqual([]);
    });
  } else {
    it('reports its coverage while translation is in progress', () => {
      const done = required.length - missing.length;
      const pct = ((done / required.length) * 100).toFixed(1);
      console.log(`  ${code}: ${done}/${required.length} keys (${pct}%) — ${missing.length} missing, in progress`);
      // A registered locale with an empty dictionary renders entirely in
      // English while still offering itself in the switcher.
      expect(entries.length).toBeGreaterThan(0);
    });
  }

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

// Coverage is only half of "translated". A key can be present and still be the
// English string — copied across and never revisited — which the checks above
// count as done. These two catch that, and they run per locale rather than for
// `ja` specifically, so the next language inherits them.
//
// Values a complete locale is expected to leave in Latin script for every
// locale, `ja` included: airport-style bureau/application codes, a version
// number, and a value carrying nothing but an SI unit symbol. Anything else
// still reading as English is an oversight, not a choice.
const LATIN_BY_DESIGN = new Set<string>([
  'nav.version',
  'map.areaValue',
  'map.densityValue',
  ...Object.keys(en).filter((key) => key.startsWith('bureau.') && key.endsWith('.short')),
  ...Object.keys(en).filter((key) => key.startsWith('appType.') && key.endsWith('.short')),
]);

/**
 * Bureau and prefecture names are Japanese proper nouns. Every Latin-script
 * locale romanizes them the same way — French, German, Spanish, Italian, and
 * Portuguese all render 北海道 as "Hokkaido" — so a value identical to English
 * here is the correct translation, not a leftover.
 *
 * Kept separate from `LATIN_BY_DESIGN`: a locale with its own script (`ja`)
 * has no such excuse, and is still held to translating these — which is what
 * actually happens (北海道, not "Hokkaido"). Applied only below, and only to
 * locales without a `SCRIPT_OF` entry.
 */
const isRomanizedProperNoun = (key: string): boolean => key.startsWith('prefecture.') || /^bureau\.\d+$/.test(key);

/** Strips placeholders, digits, and punctuation — what's left is prose, if any. */
const proseOf = (value: string): string => value.replace(PLACEHOLDER, '').replace(/[\s\d\p{P}\p{S}]/gu, '');

/** Kana and kanji — the scripts a Japanese value has to be written in. */
const SCRIPT_OF = { ja: /[぀-ヿ㐀-䶿一-鿿]/ } as const satisfies Partial<Record<Locale, RegExp>>;

describe.each(translatedLocales)('%s catalogue, beyond coverage', (code) => {
  const meta: LocaleMeta = LOCALES[code];
  const dictionary = meta.dictionary as Record<string, string>;
  const script = SCRIPT_OF[code as keyof typeof SCRIPT_OF];
  // Only a key the locale actually claims: an in-progress file is expected to
  // be missing keys, but the ones it does define should be real translations.
  // Deliberately not filtered by `isRomanizedProperNoun` — the script check
  // below still needs these keys for `ja`.
  const translatable = Object.keys(dictionary).filter(
    (key) => !LATIN_BY_DESIGN.has(key) && proseOf(dictionary[key]) !== ''
  );

  it('leaves nothing sitting at its English value by accident', () => {
    const untouched = translatable.filter(
      (key) => dictionary[key] === en[key as DictionaryKey] && !(!script && isRomanizedProperNoun(key))
    );
    expect(untouched).toEqual([]);
  });

  if (script) {
    it("writes every prose value in the language's own script", () => {
      // Catches what the equality check above misses: a value edited just
      // enough to differ from English while still being English. Not
      // exempted for romanized proper nouns — a script-bearing locale still
      // owes these a translation into its own script.
      expect(translatable.filter((key) => !script.test(dictionary[key]))).toEqual([]);
    });
  }
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

  it('holds English to being complete, since everything falls back to it', () => {
    expect(LOCALES.en.status).toBe('complete');
  });
});

describe('contributor template', () => {
  const template = readFileSync(resolve(process.cwd(), TEMPLATE_RELATIVE), 'utf8');

  it('matches the English catalogue it is generated from', () => {
    // Regenerating is one command; a stale template silently hands the next
    // translator a key list that no longer matches the app.
    expect(template).toBe(buildTemplate(readFileSync(resolve(process.cwd(), EN_RELATIVE), 'utf8')));
  });

  it('offers every English key, commented out', () => {
    const missing = Object.keys(en).filter((key) => !template.includes(`// '${key}':`));
    expect(missing).toEqual([]);
  });
});
