// hooks/useFollowCursorTooltip.ts
import { useEffect,useRef, useState } from 'react';

import {
  arrow,
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  useFloating,
} from '@floating-ui/react';

export interface FollowCursorTooltipOptions {
  placement?: Placement;
  offset?: number;
  showArrow?: boolean;
}

export const useFollowCursorTooltip = (options: FollowCursorTooltipOptions = {}) => {
  const {
    placement = 'top',
    offset: offsetValue = 8,
    showArrow = true,
  } = options;

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open: !!mousePosition,
    strategy: 'fixed',
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

  // Update position with virtual element when mouse position changes
  useEffect(() => {
    if (mousePosition && refs.setPositionReference) {
      refs.setPositionReference({
        getBoundingClientRect: () => ({
          x: mousePosition.x,
          y: mousePosition.y,
          width: 0,
          height: 0,
          top: mousePosition.y,
          left: mousePosition.x,
          right: mousePosition.x,
          bottom: mousePosition.y,
        }),
      });
    }
  }, [mousePosition, refs]);

  return {
    mousePosition,
    setMousePosition,
    arrowRef,
    refs,
    floatingStyles,
    context,
  };
};
