// components/common/FormulaTooltip.tsx
// Variable explanations for the estimator formulas. A click/tap-toggled
// popover replaces the old hover-only tooltip, which was unreachable on
// touch devices - exactly where the estimator sheet lives.
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

export const FormulaTooltip: React.FC<FormulaTooltipProps> = ({ variables, children }) => (
  <div className="relative">
    <div className="absolute right-0 top-0">
      <Popover>
        <PopoverTrigger asChild>
          <button
            aria-label="Explain the variables in this formula"
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
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
    {children}
  </div>
);
