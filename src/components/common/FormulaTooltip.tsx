// components/common/FormulaTooltip.tsx
// One step of the estimator's "Show the math" breakdown: a labeled card with
// a numbered header and an inline help popover explaining the variables. The
// popover is click/tap-toggled so it works on touch devices - exactly where
// the estimator sheet lives. Keeping the trigger in the header row (instead
// of overlaying the formula) also keeps it clear of the KaTeX block.
'use client';

import { CircleHelp } from 'lucide-react';
import type React from 'react';
import { InlineMath } from 'react-katex';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

export const variableExplanations: VariableExplanations = {
  D_rem: { title: 'Remaining Days', description: 'Estimated days until processing completes.' },
  Q_pos: { title: 'Queue Position', description: 'Estimated position in the processing queue.' },
  R_daily: { title: 'Daily Rate', description: 'Average applications processed per day.' },
  C_proc: { title: 'Confirmed Processed', description: 'Confirmed number of applications processed since submission.' },
  E_proc: { title: 'Estimated Processed', description: 'Estimated number of applications processed since last data point.' },
  Sigma_P: { title: 'Total Processed', description: 'Sum of processed applications used for calculating averages.' },
  Sigma_D: { title: 'Total Days', description: 'Sum of days used for calculating averages.' },
  Q_app: { title: 'Application Queue', description: 'Estimated queue position at submission time.' },
  C_prev: { title: 'Carried Over', description: 'Applications carried forward from the previous month.' },
  N_app: { title: 'New Applications', description: 'Estimated applications received prior to submission.' },
  P_app: { title: 'Processed Applications', description: 'Estimated applications processed prior to submission.' },
};

export const FormulaTooltip: React.FC<FormulaTooltipProps> = ({ step, title, variables, children }) => (
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
            aria-label={`Explain the variables in the ${title} formula`}
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
