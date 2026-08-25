// src/components/common/PolicyEventList.tsx
// The two halves of the policy-event annotation layer, shared by Intake &
// Processing and Population Growth: turning a curated event list into the
// chart's markers, and the collapsible list of sources underneath it.
//
// The list is not a nicety. A marker circle is an SVG shape reachable by
// pointer only, and its icon says which *kind* of change it is but not which
// change, so on its own it can't tell a reader where it leads. The list gives
// every event a labelled link, untruncated text, and a keyboard path.
'use client';

import { useMemo, useState } from 'react';

import { Banknote, ChevronDown, ChevronUp, ExternalLink, Landmark, Scale, Split } from 'lucide-react';
import type React from 'react';

import type { PolicyEvent, PolicyEventCategory } from '../../constants/policyEvents';
import { useLocale } from '../../i18n/LocaleContext';
import { periodToDate } from '../../utils/residentPeriod';
import type { ChartMarker } from '../bklit/charts/markers';

/** The icon is all that separates one kind of event from another on the plot,
 *  so the four stay visually distinct rather than four shades of "document". */
export const CATEGORY_ICON: Record<PolicyEventCategory, React.ReactNode> = {
  legislation: <Scale className="size-3.5" aria-hidden="true" />,
  fees: <Banknote className="size-3.5" aria-hidden="true" />,
  operations: <Landmark className="size-3.5" aria-hidden="true" />,
  reporting: <Split className="size-3.5" aria-hidden="true" />,
};

/**
 * Selects the events a chart can actually draw and builds their markers.
 *
 * `plotted` is the set of periods on the axis right now. Filtering against it
 * is required, not cosmetic: `ChartMarkers` positions by `xScale(date)` with no
 * clamping and renders outside the reveal clip, so an event beyond the window
 * would draw over the axis gutter or past the right edge.
 *
 * A marker only carries its `href` when it is alone on its period. One circle
 * cannot lead to two sources, and `MarkerTooltipContent` shows its clickable ↗
 * for anything with an href — so handing an href to a shared circle would
 * advertise a link that cannot be followed. Those events keep their links in
 * the list below.
 */
export const usePolicyMarkers = (
  events: readonly PolicyEvent[],
  plotted: readonly string[]
): { visible: PolicyEvent[]; markers: ChartMarker[] } => {
  const { t } = useLocale();

  const visible = useMemo(() => {
    const periods = new Set(plotted);
    return events.filter((event) => periods.has(event.period));
  }, [events, plotted]);

  const markers = useMemo(() => {
    const perPeriod = new Map<string, number>();
    for (const event of visible) perPeriod.set(event.period, (perPeriod.get(event.period) ?? 0) + 1);

    return visible.map((event) => ({
      date: periodToDate(event.period),
      icon: CATEGORY_ICON[event.category],
      title: t(event.titleKey),
      description: t(event.descriptionKey),
      ...(perPeriod.get(event.period) === 1
        ? // `_self` would navigate the dashboard away; `_blank` routes through
          // window.open(..., 'noopener,noreferrer').
          { href: event.href, target: '_blank' as const }
        : {}),
    }));
  }, [visible, t]);

  return { visible, markers };
};

/**
 * Sources for the events currently on the plot. Collapsed by default — it is
 * reference material, not something to read on the way past — and mirrors the
 * disclosure `ChartDataTable` uses directly below it.
 */
export const PolicyEventList: React.FC<{ events: readonly PolicyEvent[] }> = ({ events }) => {
  const { t, formatters } = useLocale();
  const [open, setOpen] = useState(false);

  if (events.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-2">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1 text-xs text-primary hover:opacity-80"
      >
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        {t(open ? 'policy.eventsHide' : 'policy.eventsShow')}
      </button>
      {open && (
        <ul className="mt-2 space-y-2" aria-label={t('a11y.policyEvents')}>
          {events.map((event) => (
            <li key={event.titleKey} className="flex items-start gap-2 text-xs">
              <span
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-secondary-foreground"
                aria-hidden="true"
              >
                {CATEGORY_ICON[event.category]}
              </span>
              <span className="min-w-0">
                <span className="text-muted-foreground">{formatters.monthYear(periodToDate(event.period))}</span>
                {' · '}
                <a
                  href={event.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:opacity-80"
                >
                  {t(event.titleKey)}
                  <ExternalLink className="ml-1 inline size-3 align-[-1px]" aria-hidden="true" />
                </a>
                <span className="block text-muted-foreground">{t(event.descriptionKey)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
