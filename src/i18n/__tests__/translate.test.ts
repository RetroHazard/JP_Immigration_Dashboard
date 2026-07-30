// src/i18n/__tests__/translate.test.ts
import { describe, expect, it } from 'vitest';

import { interpolate, lookup, translate, translatePlural } from '../translate';
import type { Dictionary, DictionaryKey } from '../types';

// A synthetic catalogue keeps these tests independent of the real strings,
// which change constantly as extraction proceeds.
const dict = (entries: Record<string, string>) => entries as Dictionary;
const key = (name: string) => name as DictionaryKey;

describe('interpolate', () => {
  it('substitutes named placeholders', () => {
    expect(interpolate('Showing {chart} for {bureau}', { chart: 'Outcomes', bureau: 'Osaka' })).toBe(
      'Showing Outcomes for Osaka'
    );
  });

  it('coerces numbers', () => {
    expect(interpolate('{count} ahead of you', { count: 1234 })).toBe('1234 ahead of you');
  });

  it('leaves an unmatched placeholder intact rather than blanking it', () => {
    expect(interpolate('Showing {chart} for {bureau}', { chart: 'Outcomes' })).toBe('Showing Outcomes for {bureau}');
  });

  it('returns the template untouched when no params are given', () => {
    expect(interpolate('No placeholders here')).toBe('No placeholders here');
  });
});

describe('lookup', () => {
  it('prefers the active catalogue', () => {
    expect(lookup(dict({ 'app.title': '日本 在留審査統計' }), key('app.title'))).toBe('日本 在留審査統計');
  });

  it('falls back to English for an untranslated key', () => {
    expect(lookup(dict({}), key('app.title'))).toBe('Japan Immigration Statistics');
  });

  it('falls back to the key itself when nothing defines it', () => {
    expect(lookup(dict({}), key('totally.unknown'))).toBe('totally.unknown');
  });
});

describe('translate', () => {
  it('looks up and interpolates in one step', () => {
    expect(translate(dict({ 'a.b': 'Hello {name}' }), key('a.b'), { name: 'world' })).toBe('Hello world');
  });
});

describe('translatePlural', () => {
  const catalogue = dict({
    'estimator.days_one': '± {count} day',
    'estimator.days_other': '± {count} days',
  });

  it('selects the singular form for English at one', () => {
    const rules = new Intl.PluralRules('en-US');
    expect(translatePlural(catalogue, rules, 'estimator.days', 1)).toBe('± 1 day');
  });

  it('selects the plural form for English above one', () => {
    const rules = new Intl.PluralRules('en-US');
    expect(translatePlural(catalogue, rules, 'estimator.days', 5)).toBe('± 5 days');
  });

  it('uses the single Japanese category for every count', () => {
    const rules = new Intl.PluralRules('ja-JP');
    const jaCatalogue = dict({ 'estimator.days_other': '± {count} 日' });
    expect(translatePlural(jaCatalogue, rules, 'estimator.days', 1)).toBe('± 1 日');
    expect(translatePlural(jaCatalogue, rules, 'estimator.days', 5)).toBe('± 5 日');
  });

  it('falls back to the _other member when the selected category is missing', () => {
    const rules = new Intl.PluralRules('en-US');
    const sparse = dict({ 'estimator.days_other': '± {count} days' });
    expect(translatePlural(sparse, rules, 'estimator.days', 1)).toBe('± 1 days');
  });

  it('lets an explicit count param override the injected one', () => {
    const rules = new Intl.PluralRules('en-US');
    expect(translatePlural(catalogue, rules, 'estimator.days', 1234, { count: '1,234' })).toBe('± 1,234 days');
  });
});
