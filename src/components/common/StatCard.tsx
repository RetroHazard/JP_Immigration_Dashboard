// src/components/common/StatCard.tsx
import { memo } from 'react';

import type { LucideIcon } from 'lucide-react';
import type React from 'react';

import { useCountUp } from '../../lib/motion';

type StatBadgeColor = 'blue' | 'yellow' | 'green' | 'red' | 'gray';

// Tailwind needs complete class names at build time, so badge colors are a
// static map onto the chart/status tokens.
const BADGE_CLASSES: Record<StatBadgeColor, string> = {
  blue: 'bg-chart-1/15 text-chart-1',
  yellow: 'bg-chart-4/15 text-chart-4',
  green: 'bg-chart-3/15 text-chart-3',
  red: 'bg-destructive/15 text-destructive',
  gray: 'bg-muted text-muted-foreground',
};

export type StatDelta = {
  /** Percent change vs the previous month, e.g. +3.2 */
  percent: number;
  /** Whether an increase is good news (granted) or a warning (pending) */
  direction: 'up-good' | 'up-warn' | 'neutral';
} | null;

interface StatCardProps {
  title: string;
  /** Compact title shown below the xl breakpoint — five-across tiles are at
      their narrowest from lg (where the row forms) until xl */
  shortTitle?: string;
  subtitle: string;
  value: number;
  formatValue: (value: number) => string;
  color: StatBadgeColor;
  icon: LucideIcon;
  delta?: StatDelta;
  spark?: number[];
  className?: string;
}

const Sparkline: React.FC<{ points: number[]; className?: string; stretch?: boolean }> = ({
  points,
  className,
  stretch,
}) => {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const w = 56;
  const h = 20;
  const coords = points
    .map(
      (v, i) =>
        `${(((i / (points.length - 1)) * (w - 2)) + 1).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`
    )
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      {...(stretch ? { preserveAspectRatio: 'none' } : { width: w, height: h })}
      className={className}
      aria-hidden="true"
    >
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        opacity="0.5"
      />
    </svg>
  );
};

const StatCardComponent: React.FC<StatCardProps> = ({
  title,
  shortTitle,
  subtitle,
  value,
  formatValue,
  color,
  icon: Icon,
  delta,
  spark,
  className,
}) => {
  const valueRef = useCountUp(value, formatValue);
  const deltaClass =
    !delta || delta.direction === 'neutral'
      ? 'text-muted-foreground'
      : (delta.percent >= 0) === (delta.direction === 'up-good')
        ? 'text-success'
        : 'text-warning';

  return (
    <div
      className={`relative flex flex-col gap-0.5 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-soft transition-shadow hover:shadow-soft-lg sm:p-3 lg:p-4 ${className ?? ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xxs font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
          {shortTitle && <span className="xl:hidden">{shortTitle}</span>}
          <span className={shortTitle ? 'hidden xl:inline' : undefined}>{title}</span>
        </span>
        <span className={`flex size-6 shrink-0 items-center justify-center rounded-md ${BADGE_CLASSES[color]}`}>
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
      </div>
      <span ref={valueRef} className="text-base font-bold tabular-nums text-foreground sm:text-lg lg:text-2xl">
        {formatValue(value)}
      </span>
      <div className="flex items-end justify-between gap-2">
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-xxs tabular-nums sm:text-xs ${deltaClass}`}>
            {delta
              ? `${delta.percent >= 0 ? '+' : '−'}${Math.abs(delta.percent).toFixed(1)}% MoM`
              : subtitle}
          </span>
          {delta && <span className="hidden truncate text-xxs text-muted-foreground lg:block">{subtitle}</span>}
        </span>
        {spark && <Sparkline points={spark} className="hidden shrink-0 text-chart-1 lg:block" />}
      </div>
      {/* Compact cards trade the inline sparkline for a full-width one along
          the bottom, where it doesn't compete with the delta for room */}
      {spark && <Sparkline points={spark} stretch className="mt-1 h-4 w-full text-chart-1 lg:hidden" />}
    </div>
  );
};

export const StatCard = memo(StatCardComponent);

StatCard.displayName = 'StatCard';
