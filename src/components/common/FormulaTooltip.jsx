// components/common/FormulaTooltip.jsx
import Tippy, { useSingleton } from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export const variableExplanations = {
  D_rem: 'Remaining Days: Estimated days until processing completes.',
  Q_pos: 'Queue Position: Estimated position in the processing queue.',
  R_daily: 'Daily Rate: Average applications processed per day.',
  Q_adj: 'Adjusted Queue: Accounts for new applications and processing rates.',
  C_proc: 'Confirmed Processed: Applications processed since submission (confirmed).',
  P_proc: 'Predicted Processed: Applications processed since submission (predicted).',
  Sigma_P: 'Total Processed: Sum of processed applications in historical data.',
  Sigma_D: 'Total Days: Sum of relevant days in historical data.',
  R_new: 'New Rate: Rate of new applications entering the queue.',
  Q_app: 'Application Queue: Estimated queue position at submission time.',
  Delta_net: 'Net Change: Difference between new applications and processing rate.',
  t_pred: 'Prediction Time: Days since last data point; days where predictive data is used.',
};

export const FormulaTooltip = ({ variables, children }) => {
  const [source, target] = useSingleton({
    overrides: ['placement', 'arrow'],
  });

  return (
    <>
      <Tippy
        singleton={source}
        placement="auto"
        arrow={true}
        animation="shift-away"
        theme="stat-tooltip"
        delay={[300, 50]}
        interactive={true}
        allowHTML={true}
        zIndex={999}
      />

      <Tippy
        singleton={target}
        content={
          <div className="space-y-2 p-2">
            {Object.entries(variables).map(([symbol, explanation]) => (
              <div key={symbol} className="flex items-baseline gap-2">
                <InlineMath>{`${symbol}:`}</InlineMath>
                <span className="text-xs">{explanation}</span>
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
