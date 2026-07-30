// components/common/FormulaTooltip.tsx
// One step of the estimator's "Show the math" breakdown: a labeled card with
// a numbered header and an inline help popover explaining the variables. The
// popover is click/tap-toggled so it works on touch devices - exactly where
// the estimator sheet lives. Keeping the trigger in the header row (instead
// of overlaying the formula) also keeps it clear of the KaTeX block.
'use client';

import { useMemo } from 'react';

import { CircleHelp } from 'lucide-react';
import type React from 'react';
import { InlineMath } from 'react-katex';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useLocale } from '../../i18n/LocaleContext';
import type { DictionaryKey } from '../../i18n/types';

import 'katex/dist/katex.min.css';

interface VariableExplanations {
  [key: string]: { title: string; description: string };
}

interface FormulaTooltipProps {
  step: number;
  title: string;
  variables: VariableExplanations;
  children: React.ReactNode;
}

/**
 * Model variable ids, in the order they appear in the breakdown. Kept
 * camelCase rather than mirroring the LaTeX subscripts (`D_rem`) because the
 * catalogue reserves underscores for plural suffixes.
 */
const VARIABLE_IDS = [
  'dRem',
  'qPos',
  'rDaily',
  'cProc',
  'eProc',
  'sigmaP',
  'sigmaD',
  'qApp',
  'cPrev',
  'nApp',
  'pApp',
] as const;

export type VariableId = (typeof VARIABLE_IDS)[number];

/** The glossary behind each step's help popover. */
export const useVariableExplanations = (): Record<VariableId, { title: string; description: string }> => {
  const { t } = useLocale();
  return useMemo(
    () =>
      Object.fromEntries(
        VARIABLE_IDS.map((id) => [
          id,
          {
            title: t(`estimator.formula.var.${id}.title` as DictionaryKey),
            description: t(`estimator.formula.var.${id}.description` as DictionaryKey),
          },
        ])
      ) as Record<VariableId, { title: string; description: string }>,
    [t]
  );
};

export const FormulaTooltip: React.FC<FormulaTooltipProps> = ({ step, title, variables, children }) => {
  const { t } = useLocale();
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 shadow-soft">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xxs font-bold tabular-nums text-primary"
        >
          {step}
        </span>
        <span className="min-w-0 truncate text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              aria-label={t('estimator.formula.explainAria', { title })}
              className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <CircleHelp className="size-3.5" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-72 p-3">
            <ul className="space-y-2 text-xs">
              {Object.entries(variables).map(([symbol, explanation]) => (
                <li key={symbol} className="flex gap-2">
                  <span className="shrink-0 font-semibold">
                    <InlineMath math={symbol} />
                  </span>
                  <span>
                    <span className="font-medium">{explanation.title}</span>
                    <span className="text-muted-foreground"> — {explanation.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      <div className="overflow-x-auto text-xxs text-secondary-foreground [&_.katex-display]:my-1.5">{children}</div>
    </div>
  );
};
