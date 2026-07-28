// src/components/charts/EfficiencyHoverCard.tsx
// Shared hover card for the Processing Efficiency views. Fixed-positioned so
// it can follow both SVG marks and HTML rows from pointer coordinates
// (mouse and touch alike), clamped to the viewport edges. Portaled to <body>
// because the chart panel keeps an inline transform after its entrance
// animation, which would otherwise re-anchor position:fixed to the panel.
'use client';

import type React from 'react';
import { createPortal } from 'react-dom';

import type { EfficiencyPoint } from '../../utils/processingEfficiency';

interface EfficiencyHoverCardProps {
  point: EfficiencyPoint;
  /** Viewport (client) coordinates of the pointer or focused mark */
  x: number;
  y: number;
}

export const EfficiencyHoverCard: React.FC<EfficiencyHoverCardProps> = ({ point, x, y }) => createPortal(
  <div
    role="status"
    className="pointer-events-none fixed z-50 min-w-[168px] rounded-[10px] border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-soft-lg"
    style={{
      left: `clamp(98px, ${x}px, calc(100vw - 98px))`,
      top: Math.max(y, 96),
      transform: 'translate(-50%, calc(-100% - 14px))',
    }}
  >
    <div className="flex items-center gap-[7px] font-semibold">
      <span
        aria-hidden="true"
        className="size-[9px] shrink-0 rounded-full"
        style={{ background: point.color, boxShadow: `0 0 0 1.5px ${point.outline}` }}
      />
      {point.label}
    </div>
    <div className="mt-[5px] grid grid-cols-[auto_auto] gap-x-3.5 gap-y-0.5 text-muted-foreground tabular-nums">
      <span>Received</span>
      <span className="text-right text-popover-foreground">{point.received.toLocaleString()}</span>
      <span>Processed</span>
      <span className="text-right text-popover-foreground">{point.processed.toLocaleString()}</span>
      <span>Completion</span>
      <span className="text-right text-popover-foreground">{point.rate.toFixed(1)}%</span>
    </div>
  </div>,
  document.body
);
