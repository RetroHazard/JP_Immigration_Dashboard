// src/components/common/StatCard.tsx
import { memo } from 'react';

import type { LucideIcon } from 'lucide-react';
import type React from 'react';

import { useLocale } from '../../i18n/LocaleContext';
import type { DictionaryKey } from '../../i18n/types';
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
  /** Percent change vs the previous period, e.g. +3.2 */
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
  /**
   * Catalogue key wrapping the formatted delta. Defaults to the month-over-
   * month phrasing the processing tiles use; the residents tiles compare
   * half-years, where "MoM" would be simply wrong.
   */
  deltaKey?: DictionaryKey;
  spark?: number[];
  className?: string;
  /**
   * Compact styling below the sm breakpoint, for grids that keep all their
   * tiles on one row on phones (the residents four-across row): tighter
   * padding, a smaller value, and no icon badge. From sm up, identical to
   * the default.
   */
  dense?: boolean;
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
  deltaKey = 'stats.momDelta',
  spark,
  className,
  dense = false,
}) => {
  const { t, formatters } = useLocale();
  const valueRef = useCountUp(value, formatValue);
  const deltaClass =
    !delta || delta.direction === 'neutral'
      ? 'text-muted-foreground'
      : (delta.percent >= 0) === (delta.direction === 'up-good')
        ? 'text-success'
        : 'text-warning';

  return (
    <div
      className={`relative flex flex-col gap-0.5 overflow-hidden rounded-xl border border-border bg-card ${
        dense ? 'p-1.5' : 'p-2'
      } shadow-soft transition-shadow hover:shadow-soft-lg sm:p-3 lg:p-4 ${className ?? ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* line-clamp rather than a hard single-line truncate: only Total and
            Approval carry a shortTitle today, so Granted/Denied/Pending
            always render their full translated title — fine for English's
            "Granted"/"Denied", but Portuguese/Spanish equivalents ("Concedidas",
            "PENDIENTES") are long enough to lose characters at the cramped
            widths a 5-across card row hits before xl. Wrapping to a second
            line costs a little vertical room; silently dropped text costs
            more.
            The clamp has to live on the span that actually holds the text —
            `-webkit-line-clamp` on a wrapper around a nested <span> doesn't
            reflow the child at all, it just measures one unbroken line and
            clips whatever doesn't fit. */}
        <span className="min-w-0 text-xxs font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
          {/* break-words: line-clamp only wraps at a natural space, and a
              single long translated word ("Concedidas", "PENDIENTES") has
              none — without it the clamp has nowhere to break and just
              clips the one line it's given instead of using the second. */}
          {shortTitle && <span className="line-clamp-2 break-words xl:hidden">{shortTitle}</span>}
          <span className={`break-words ${shortTitle ? 'hidden xl:line-clamp-2' : 'line-clamp-2'}`}>{title}</span>
        </span>
        <span
          className={`${dense ? 'hidden sm:flex' : 'flex'} size-6 shrink-0 items-center justify-center rounded-md ${BADGE_CLASSES[color]}`}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
      </div>
      <span
        ref={valueRef}
        className={`${dense ? 'text-sm' : 'text-base'} font-bold tabular-nums text-foreground sm:text-lg lg:text-2xl`}
      >
        {formatValue(value)}
      </span>
      <div className="flex items-end justify-between gap-2">
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-xxs tabular-nums sm:text-xs ${deltaClass}`}>
            {delta
              ? t(deltaKey, {
                  delta: `${delta.percent >= 0 ? '+' : '−'}${formatters.percent(Math.abs(delta.percent))}`,
                })
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
