// src/components/common/IconTooltip.tsx
import { useRef, useState } from 'react';

import type React from 'react';
import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';

interface IconTooltipProps {
  label: string;
  children: React.ReactNode;
}

export const IconTooltip: React.FC<IconTooltipProps> = ({ label, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    elements: { reference: referenceElement },
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 }), arrow({ element: arrowRef })],
  });

  const hover = useHover(context, { delay: { open: 300, close: 50 } });
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
            {label}
            <FloatingArrow ref={arrowRef} context={context} className="fill-gray-600 dark:fill-gray-300" />
          </div>
        </FloatingPortal>
      )}
    </>
  );
};
