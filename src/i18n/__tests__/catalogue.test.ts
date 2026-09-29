// Integrity checks every locale file must pass, so a reviewer can accept a
// contributed language file without diffing it against English by eye.
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
 * The keys a locale must define to call itself complete: every English key,
 * except that a plural family needs only the members the locale's own
 * `Intl.PluralRules` can select, plus `_other` (so Japanese owes no `_one`).
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
  // Typed as LocaleMeta rather than the `as const` registry entry, whose literal
  // `status` type would make one branch below read as dead code.
  const meta: LocaleMeta = LOCALES[code];
  const dictionary = meta.dictionary as Record<string, string>;
  const entries = Object.entries(dictionary);
  const required = requiredKeysFor(meta.intlTag);
  const missing = required.filter((key) => dictionary[key] === undefined);

  if (meta.status === 'complete') {
    it('covers every English key', () => {
      // Fails as soon as English gains a key this locale lacks.
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

// Coverage counts a key copied from English as done. The checks below catch
// values left at, or still written as, English.
//
// Values any locale may leave in Latin script, exempt from both checks:
// airport-style bureau and application codes, a version number, and values
// that are only an SI unit.
const LATIN_BY_DESIGN = new Set<string>([
  'nav.version',
  'map.areaValue',
  'map.densityValue',
  ...Object.keys(en).filter((key) => key.startsWith('bureau.') && key.endsWith('.short')),
  ...Object.keys(en).filter((key) => key.startsWith('appType.') && key.endsWith('.short')),
]);

/**
 * Bureau and prefecture names are Japanese proper nouns that every Latin-script
 * locale romanizes as English does ("Hokkaido"), so matching English is correct.
 * Separate from `LATIN_BY_DESIGN` because it applies only to locales without a
 * `SCRIPT_OF` entry; a locale with its own script still owes them (北海道).
 */
const isRomanizedProperNoun = (key: string): boolean =>
  key.startsWith('prefecture.') || /^bureau\.\d+(\.compact)?$/.test(key);

/**
 * `<locale>:<key>` pairs whose correct translation is the English string. An
 * explicit list rather than a rule, because "identical to English" is almost
 * always an oversight. So far only place names spelled the English way:
 * Yugoslavia in Spanish, and some continents in Romance languages and Tagalog.
 */
const IDENTICAL_BY_DESIGN = new Set<string>([
  'es:nationality.2500',
  'es:region.1000',
  'fr:region.2000',
  'it:region.1000',
  'it:region.3000',
  'it:region.6000',
  'pt:region.6000',
  'tl:region.3000',
  'tl:region.6000',
]);

/** Strips placeholders, digits, and punctuation — what's left is prose, if any. */
const proseOf = (value: string): string => value.replace(PLACEHOLDER, '').replace(/[\s\d\p{P}\p{S}]/gu, '');

/** The script a locale's prose must be written in. Latin-script locales opt out. */
const SCRIPT_OF = {
  ja: /[぀-ヿ㐀-䶿一-鿿]/,
  ko: /[가-힣ᄀ-ᇿ㄰-㆏]/,
  'zh-CN': /[㐀-䶿一-鿿]/,
  'zh-TW': /[㐀-䶿一-鿿]/,
} as const satisfies Partial<Record<Locale, RegExp>>;

describe.each(translatedLocales)('%s catalogue, beyond coverage', (code) => {
  const meta: LocaleMeta = LOCALES[code];
  const dictionary = meta.dictionary as Record<string, string>;
  const script = SCRIPT_OF[code as keyof typeof SCRIPT_OF];
  // Only keys the locale defines. Not filtered by `isRomanizedProperNoun`: the
  // script check below still applies to them.
  const translatable = Object.keys(dictionary).filter(
    (key) => !LATIN_BY_DESIGN.has(key) && proseOf(dictionary[key]) !== ''
  );

  it('leaves nothing sitting at its English value by accident', () => {
    const untouched = translatable.filter(
      (key) =>
        dictionary[key] === en[key as DictionaryKey] &&
        !IDENTICAL_BY_DESIGN.has(`${code}:${key}`) &&
        !(!script && isRomanizedProperNoun(key))
    );
    expect(untouched).toEqual([]);
  });

  if (script) {
    it("writes every prose value in the language's own script", () => {
      // Catches a value edited just enough to differ from English while still
      // being English.
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
    // A stale template hands the next translator a key list that no longer
    // matches the app.
    expect(template).toBe(buildTemplate(readFileSync(resolve(process.cwd(), EN_RELATIVE), 'utf8')));
  });

  it('offers every English key, commented out', () => {
    const missing = Object.keys(en).filter((key) => !template.includes(`// '${key}':`));
    expect(missing).toEqual([]);
  });
});
