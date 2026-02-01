// hooks/useTooltip.ts
import { useRef, useState } from 'react';

import {
  arrow,
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';

export interface TooltipOptions {
  placement?: Placement;
  offset?: number;
  showDelay?: number;
  hideDelay?: number;
  interactive?: boolean;
  showArrow?: boolean;
}

export const useTooltip = (options: TooltipOptions = {}) => {
  const {
    placement = 'top',
    offset: offsetValue = 8,
    showDelay = 300,
    hideDelay = 0,
    showArrow = true,
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetValue),
      flip({
        fallbackAxisSideDirection: 'start',
        padding: 8,
      }),
      shift({ padding: 8 }),
      ...(showArrow ? [arrow({ element: arrowRef })] : []),
    ],
  });

  const hover = useHover(context, {
    delay: {
      open: showDelay,
      close: hideDelay,
    },
    move: false,
  });

  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return {
    isOpen,
    setIsOpen,
    arrowRef,
    refs,
    floatingStyles,
    context,
    getReferenceProps,
    getFloatingProps,
  };
};
