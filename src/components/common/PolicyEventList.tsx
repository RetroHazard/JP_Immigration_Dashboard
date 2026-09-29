// The policy-event annotation layer shared by Intake & Processing and
// Population Growth: markers built from a curated event list, and the
// collapsible list of sources under the chart. The list is the accessible
// path: a marker is pointer-only and its icon names the kind of change, not
// which one, so the list gives each event a labelled link and keyboard access.
'use client';

import { useId, useMemo, useState } from 'react';

import { Banknote, ChevronDown, ChevronUp, ExternalLink, Landmark, Scale, Split } from 'lucide-react';
import type React from 'react';

import type { PolicyEvent, PolicyEventCategory } from '../../constants/policyEvents';
import { useLocale } from '../../i18n/LocaleContext';
import { periodToDate } from '../../utils/residentPeriod';
import type { ChartMarker } from '../bklit/charts/markers';

/** The icon is all that separates one kind of event from another on the plot,
 *  so the four stay visually distinct. */
export const CATEGORY_ICON: Record<PolicyEventCategory, React.ReactNode> = {
  legislation: <Scale className="size-3.5" aria-hidden="true" />,
  fees: <Banknote className="size-3.5" aria-hidden="true" />,
  operations: <Landmark className="size-3.5" aria-hidden="true" />,
  reporting: <Split className="size-3.5" aria-hidden="true" />,
};

/**
 * Selects the events a chart can draw and builds their markers.
 *
 * `plotted` is the set of periods on the axis. The filter is required:
 * `ChartMarkers` positions by `xScale(date)` unclamped and outside the reveal
 * clip, so an event beyond the window would draw over the axis gutter.
 *
 * Markers are never links: a shared circle can't lead to two sources, and
 * identical circles should behave alike. Sources live in the list. Leaving
 * `href` off also keeps the clickable ↗ in `MarkerTooltipContent`, derived from
 * `onClick || href`, from appearing.
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

  const markers = useMemo(
    () =>
      visible.map((event) => ({
        date: periodToDate(event.period),
        icon: CATEGORY_ICON[event.category],
        title: t(event.titleKey),
        description: t(event.descriptionKey),
      })),
    [visible, t]
  );

  return { visible, markers };
};

/**
 * Sources for the events currently on the plot. Collapsed by default, like the
 * `ChartDataTable` disclosure directly below it.
 */
export const PolicyEventList: React.FC<{ events: readonly PolicyEvent[] }> = ({ events }) => {
  const { t, formatters } = useLocale();
  const [open, setOpen] = useState(false);
  // Ties aria-controls to the list so aria-expanded points at something real.
  const listId = useId();

  if (events.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-2">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={listId}
        className="flex items-center gap-1 text-xs text-primary hover:opacity-80"
      >
        {open ? (
          <ChevronUp className="size-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-3.5" aria-hidden="true" />
        )}
        {t(open ? 'policy.eventsHide' : 'policy.eventsShow')}
      </button>
      {open && (
        <ul id={listId} className="mt-2 space-y-2" aria-label={t('a11y.policyEvents')}>
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
