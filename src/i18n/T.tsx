// src/i18n/T.tsx
// Renders a catalogue string whose placeholders are React nodes rather than
// text — the footer's e-Stat link, for instance. Splitting those sentences
// into "before" and "after" keys would strand translators with fragments they
// can't reorder, and a general rich-text/markdown renderer is far more
// machinery than the handful of cases here justify.
'use client';

import { Fragment, type ReactNode } from 'react';

import { useLocale } from './LocaleContext';
import type { DictionaryKey } from './types';

const PLACEHOLDER = /\{(\w+)\}/g;

interface TProps {
  /** Catalogue key. */
  k: DictionaryKey;
  /** Node per placeholder name. A placeholder with no value renders as-is. */
  values: Record<string, ReactNode>;
}

export const T = ({ k, values }: TProps) => {
  // Called without params, `t` leaves the placeholders in place — which is
  // exactly the template this needs to split.
  const template = useLocale().t(k);
  const parts: ReactNode[] = [];
  const pattern = new RegExp(PLACEHOLDER.source, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(template)) !== null) {
    if (match.index > lastIndex) parts.push(template.slice(lastIndex, match.index));
    parts.push(match[1] in values ? values[match[1]] : match[0]);
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < template.length) parts.push(template.slice(lastIndex));

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </>
  );
};
