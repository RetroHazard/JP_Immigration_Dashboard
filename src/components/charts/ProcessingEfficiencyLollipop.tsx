// src/components/charts/ProcessingEfficiencyLollipop.tsx
// Processing Efficiency as a ranked lollipop: bureaus sorted by completion
// rate, stem weight carrying intake volume, with a dashed guide at the
// official nationwide completion rate. Rate = processed / received, so the
// scatter's bubble-size channel is redundant here — the ranking is the
// message, and labelled rows reflow cleanly at any screen width.
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { animate } from 'animejs';
import type React from 'react';

import { useTheme } from '../../contexts/ThemeContext';
import { useCoarsePointer } from '../../hooks/useCoarsePointer';
import { useTapPin } from '../../hooks/useTapPin';
import { useLocale } from '../../i18n/LocaleContext';
import { useBureauCompact, useBureauLabel } from '../../i18n/useDomainLabels';
import { useAnimeScope } from '../../lib/motion';
import type { EfficiencyPoint } from '../../utils/processingEfficiency';
import { computeEfficiencyPoints, nationwideCompletionRate } from '../../utils/processingEfficiency';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { EfficiencyHoverCard } from './EfficiencyHoverCard';

// Label | track | figures — one definition shared by rows, the reference
// overlay, and the axis so their columns always align.
const ROW_GRID = 'grid grid-cols-[92px_1fr_74px] gap-2 sm:grid-cols-[118px_1fr_88px] sm:gap-3';

interface Hover {
  point: EfficiencyPoint;
  x: number;
  y: number;
}

export const ProcessingEfficiencyLollipop: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const { isDarkMode } = useTheme();
  const { t, formatters } = useLocale();
  const bureauLabel = useBureauLabel();
  const bureauCompact = useBureauCompact();
  const [hovered, setHovered] = useState<Hover | null>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const coarsePointer = useCoarsePointer();
  const clearHover = useCallback(() => setHovered(null), []);
  const tapMode = useTapPin({ enabled: coarsePointer, containerRef: rowsRef, onDismiss: clearHover });

  const points = useMemo(
    () => computeEfficiencyPoints(data, filters, range, isDarkMode, bureauLabel),
    [data, filters, range, isDarkMode, bureauLabel]
  );
  const nationwide = useMemo(() => nationwideCompletionRate(data, filters, range), [data, filters, range]);
  const ranked = useMemo(() => [...points].sort((a, b) => b.rate - a.rate), [points]);
  const maxReceived = Math.max(...points.map((point) => point.received), 1);

  // Backlog-clearing months can push completion rates past 100%, so the axis
  // grows to fit the highest value (rounded up to a clean tick) and never
  // shrinks below the full 0-100% range.
  const maxRate = Math.max(...points.map((point) => point.rate), nationwide ?? 0, 100);
  const tickStep = maxRate <= 125 ? 25 : maxRate <= 250 ? 50 : 100;
  const axisMax = Math.ceil(maxRate / tickStep) * tickStep;
  const ticks = Array.from({ length: axisMax / tickStep + 1 }, (_, i) => i * tickStep);
  const toTrackPct = (rate: number) => (rate / axisMax) * 100;

  const selectionKey = `${filters.bureau}|${filters.type}|${range}`;
  useEffect(() => setHovered(null), [selectionKey]);
  const motionRoot = useAnimeScope<HTMLDivElement>(() => {
    const root = motionRoot.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[data-stem]').forEach((stem, index) => {
      animate(stem, {
        width: ['0%', `${stem.dataset.pct}%`],
        duration: 620,
        delay: 45 * index,
        ease: 'cubicBezier(0.22, 1, 0.36, 1)',
      });
    });
    root.querySelectorAll<HTMLElement>('[data-dot]').forEach((dot, index) => {
      animate(dot, {
        scale: [0, 1.25, 1],
        duration: 380,
        delay: 45 * index + 420,
        ease: 'cubicBezier(0.22, 1, 0.36, 1)',
      });
    });
  }, [selectionKey]);

  if (points.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        {t('common.noDataForFilters')}
      </div>
    );
  }

  // Anchoring at the row rather than the pointer, which is what the keyboard
  // path already does: on touch the pointer is a finger sitting on top of the
  // row the card is describing.
  const showAtRow = (point: EfficiencyPoint, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setHovered({ point, x: rect.left + rect.width / 2, y: rect.top });
  };

  // On touch the pointer handlers are left off rather than guarded: pointerleave
  // fires on finger-up, so keeping them would close the card the tap opened.
  const hoverProps = (point: EfficiencyPoint) => ({
    ...(tapMode
      ? {
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            // Otherwise the card's "tapped a gap" handler undoes this.
            e.stopPropagation();
            const target = e.currentTarget;
            if (tapMode.tap(point.code) === 'unpinned') {
              setHovered(null);
              return;
            }
            showAtRow(point, target);
          },
        }
      : {
          onPointerEnter: (e: React.PointerEvent) => setHovered({ point, x: e.clientX, y: e.clientY }),
          onPointerMove: (e: React.PointerEvent) => setHovered({ point, x: e.clientX, y: e.clientY }),
          onPointerLeave: () => setHovered(null),
        }),
    // Kept on both: this is the keyboard path, and it is unaffected by pointer type.
    onFocus: (e: React.FocusEvent<HTMLElement>) => showAtRow(point, e.currentTarget),
    onBlur: () => setHovered(null),
  });

  return (
    // The ref marks the tap boundary: a tap anywhere inside is the chart's to
    // interpret, and the click handler covers the gaps between rows.
    <div
      className="chart-card-content"
      onClick={
        tapMode
          ? () => {
              tapMode.clear();
              setHovered(null);
            }
          : undefined
      }
      ref={rowsRef}
    >
      <div ref={motionRoot}>
        <div className="relative">
          {ranked.map((point) => {
            const pct = toTrackPct(point.rate);
            const stemWeight = 2 + Math.sqrt(point.received / maxReceived) * 8;
            return (
              <div
                key={point.code}
                tabIndex={0}
                aria-label={t('chart.efficiency.pointAria', {
                  bureau: point.label,
                  rate: point.rate.toFixed(1),
                  count: formatters.number(point.received),
                })}
                className={`${ROW_GRID} min-h-[27px] items-center rounded-[8px] px-1.5 py-1 outline-none hover:bg-accent focus-visible:bg-accent`}
                {...hoverProps(point)}
              >
                {/* The compact name, not `point.label`: this cell is 92px and
                    truncates, and the full official names of a region's offices
                    share a long prefix. The aria-label above keeps the full
                    name, so nothing is lost to a screen reader. */}
                <div className="truncate text-xs font-semibold" style={{ color: 'var(--chart-label)' }}>
                  {bureauCompact(point.code)}
                  {point.isAirport && (
                    <span className="block text-xxs font-medium text-muted-foreground">
                      {t('chart.efficiency.branchOffice')}
                    </span>
                  )}
                </div>
                <div className="relative h-[18px]">
                  <div
                    className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
                    style={{ background: 'var(--legend-track)' }}
                  />
                  <div
                    data-stem
                    data-pct={pct.toFixed(2)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: `${pct}%`,
                      height: `${stemWeight}px`,
                      background: point.color,
                      boxShadow: point.isAirport ? `inset 0 0 0 1px ${point.outline}` : undefined,
                    }}
                  />
                  <div
                    data-dot
                    className="absolute top-1/2 size-[11px] rounded-full"
                    style={{
                      left: `${pct}%`,
                      translate: '-50% -50%',
                      background: point.color,
                      outline: `1.5px ${point.isAirport ? 'dashed' : 'solid'} ${point.outline}`,
                      boxShadow: '0 0 0 2px var(--card)',
                    }}
                  />
                </div>
                <div className="whitespace-nowrap text-right text-xs tabular-nums">
                  <span className="font-semibold text-foreground">{formatters.percent(point.rate)}</span>
                  <span className="block text-xxs text-muted-foreground">
                    {t('chart.efficiency.receivedCount', { count: formatters.compactNumber(point.received) })}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Nationwide reference line, aligned to the track column */}
          {nationwide !== null && (
            <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${ROW_GRID} px-1.5`}>
              <div />
              <div className="relative">
                <div
                  className="absolute inset-y-0 opacity-80"
                  style={{ left: `${toTrackPct(nationwide)}%`, borderLeft: '2px dashed var(--chart-crosshair)' }}
                />
              </div>
              <div />
            </div>
          )}
        </div>
        <div className={`${ROW_GRID} px-1.5 pt-1`} aria-hidden="true">
          <div />
          <div className="relative h-[30px] text-xxs" style={{ color: 'var(--chart-foreground)' }}>
            {ticks.map((tick) => (
              <span key={tick} className="absolute bottom-0 -translate-x-1/2" style={{ left: `${toTrackPct(tick)}%` }}>
                {formatters.percent(tick, 0)}
              </span>
            ))}
            {nationwide !== null && (
              <span
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-semibold text-muted-foreground"
                style={{ left: `${toTrackPct(nationwide)}%` }}
              >
                {t('chart.efficiency.nationwide', { rate: formatters.percent(nationwide) })}
              </span>
            )}
          </div>
          <div />
        </div>
      </div>
      {hovered && <EfficiencyHoverCard point={hovered.point} x={hovered.x} y={hovered.y} />}
    </div>
  );
};
