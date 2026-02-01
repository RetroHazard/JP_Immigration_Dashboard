// components/common/FormulaTooltip.tsx
import { useRef, useState } from 'react';

import type React from 'react';
import { InlineMath } from 'react-katex';
import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';

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

export const FormulaTooltip: React.FC<FormulaTooltipProps> = ({ variables, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    whileElementsMounted: autoUpdate,
    elements: { reference: referenceElement },
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, {
    delay: { open: 300, close: 50 },
    handleClose: safePolygon(),
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role]);

  return (
    <>
      <span
        ref={(node) => {
          setReferenceElement(node);
          refs.setReference(node);
        }}
        {...getReferenceProps()}
        className="cursor-help"
      >
        {children}
      </span>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 999 }}
            {...getFloatingProps()}
            className="floating-tooltip"
            data-status="open"
          >
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
            <FloatingArrow
              ref={arrowRef}
              context={context}
              className="fill-gray-600 dark:fill-gray-300"
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
};
