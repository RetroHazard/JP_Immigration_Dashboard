// components/common/FormulaTooltip.tsx
import type React from 'react';
import { InlineMath } from 'react-katex';
import Tippy, { useSingleton } from '@tippyjs/react';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
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
  Q_adj: { title: 'Adjusted Queue', description: 'Accounts for new applications and processing rates.' },
  C_proc: { title: 'Confirmed Processed', description: 'Known applications processed since submission.' },
  P_proc: { title: 'Predicted Processed', description: 'Estimated applications processed since submission.' },
  Sigma_P: { title: 'Total Processed', description: 'Sum of processed applications in historical data.' },
  Sigma_D: { title: 'Total Days', description: 'Sum of relevant days in historical data.' },
  R_new: { title: 'New Rate', description: 'Average applications received per day.' },
  Q_app: { title: 'Application Queue', description: 'Estimated queue position at submission time.' },
  Delta_net: { title: 'Net Change', description: 'Daily change in queue; received vs processed.' },
  t_pred: { title: 'Prediction Time', description: 'Days since last data point; days where predictive data is used.' },
};

export const FormulaTooltip: React.FC<FormulaTooltipProps> = ({ variables, children }) => {
  const [source, target] = useSingleton({});

  return (
    <>
      <Tippy
        singleton={source}
        appendTo={document.body}
        placement="auto"
        arrow={true}
        animation="shift-away"
        theme="stat-tooltip"
        delay={[300, 50]}
        interactive={true}
        allowHTML={true}
        hideOnClick={true}
        zIndex={999}
      />

      <Tippy
        singleton={target}
        content={
          <div className="space-y-2 p-2">
            {Object.entries(variables).map(([symbol, explanation]) => (
              <div key={symbol} className="flex flex-col">
                <div className="flex items-baseline">
                  <InlineMath>{`${symbol}:`}</InlineMath>
                  <div className="mt-1 text-xs font-semibold">{explanation.title}</div>
                </div>
                <div className="mb-1 text-xxs font-normal">{explanation.description}</div>
              </div>
            ))}
          </div>
        }
      >
        <span className="cursor-help">{children}</span>
      </Tippy>
    </>
  );
};