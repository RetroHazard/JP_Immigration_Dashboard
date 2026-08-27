// src/components/EstimationCard.tsx
// The Processing Time Estimator, promoted to a first-class, always-visible
// panel. State is controlled by the shell so the desktop sidebar and the
// mobile sheet share one set of inputs.
//
// Opening "Show the math" folds the entry area away: five steps of derivation
// outrun the 360px rail on their own, and a reader studying one is not editing
// the form. A summary row takes its place, naming the bureau, type and date the
// derivation belongs to and doubling as the way back to the inputs.
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { animate } from 'animejs';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  ChevronsRight,
  Link as LinkIcon,
  OctagonAlert,
  Pencil,
  RotateCcw,
  X,
} from 'lucide-react';
import type React from 'react';

import type { ImmigrationData } from '../hooks/useImmigrationData';
import { useLocale } from '../i18n/LocaleContext';
import { T } from '../i18n/T';
import { useApplicationOptions, useNonAirportBureaus } from '../i18n/useDomainLabels';
import { prefersReducedMotion } from '../lib/motion';
import type { EstimatedDateResult } from '../utils/calculateEstimates';
import { calculateEstimatedDate } from '../utils/calculateEstimates';
import type { ApplicationDetails } from '../utils/urlApplicationDetails';
import { ESTIMATOR_PARAM_NAMES } from '../utils/urlApplicationDetails';
import { FilterInput } from './common/FilterInput';
import { IconTooltip } from './common/IconTooltip';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { EstimationFormula } from './EstimationFormula';

interface EstimationCardProps {
  data: ImmigrationData[];
  details: ApplicationDetails;
  onDetailsChange: (details: ApplicationDetails) => void;
  /** When provided (desktop sidebar), renders a collapse control in the header */
  onCollapse?: () => void;
  /** When provided (mobile sheet), renders a close control in the header */
  onClose?: () => void;
}

const ShareButton: React.FC<{ appDetails: ApplicationDetails }> = ({ appDetails }) => {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [copied, setCopied] = useState(false);

  const doShare = async () => {
    const mutableParams = new URLSearchParams(searchParams.toString());

    // The estimator's params are namespaced (est*) so a shared estimate never
    // overwrites the chart's ?bureau=/?type= filters. Only params with a
    // selected value are kept, so sharing a partially-filled form doesn't
    // leave empty params in the URL.
    (Object.keys(ESTIMATOR_PARAM_NAMES) as Array<keyof ApplicationDetails>).forEach((key) => {
      const value = appDetails[key];
      if (value) {
        mutableParams.set(ESTIMATOR_PARAM_NAMES[key], value);
      } else {
        mutableParams.delete(ESTIMATOR_PARAM_NAMES[key]);
      }
    });
    // Drop the pre-rename estimator date param if the visitor arrived on one.
    mutableParams.delete('applicationDate');

    const newRelativePath = `${pathname}?${mutableParams.toString()}`;
    router.push(newRelativePath, { scroll: false });

    try {
      const fullUrl = `${window.location.origin}${newRelativePath}`;
      await navigator.clipboard.writeText(fullUrl);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (permissions); the URL bar still has the link.
    }
  };

  return (
    <IconTooltip label={t(copied ? 'estimator.copied' : 'estimator.copyPermalink')}>
      <button
        onClick={doShare}
        aria-label={t('estimator.copyPermalink')}
        className={`flex size-7 items-center justify-center rounded-full transition-colors ${
          copied ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-primary'
        }`}
      >
        {copied ? <Check className="size-4" /> : <LinkIcon className="size-4" />}
      </button>
    </IconTooltip>
  );
};

export const EstimationCard: React.FC<EstimationCardProps> = ({
  data,
  details,
  onDetailsChange,
  onCollapse,
  onClose,
}) => {
  const { t, tPlural, formatters } = useLocale();
  const nonAirportBureaus = useNonAirportBureaus();
  const applicationOptions = useApplicationOptions();
  const [showMath, setShowMath] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const queueFillRef = useRef<HTMLDivElement>(null);

  const estimatedDate: EstimatedDateResult | null = useMemo(
    () => calculateEstimatedDate(data, details),
    [data, details]
  );

  // How far through the original queue the application has moved: drives the
  // queue-position bar. Past due (Q_pos <= 0) reads as a full bar.
  const queue = useMemo(() => {
    if (!estimatedDate) return null;
    const { Q_pos, Q_app } = estimatedDate.details.modelVariables;
    return {
      ahead: Math.max(0, Math.round(Q_pos)),
      progress: Q_app > 0 ? Math.min(1, Math.max(0, 1 - Q_pos / Q_app)) : 1,
    };
  }, [estimatedDate]);

  // The disclosure only renders alongside an estimate, but `showMath` outlives
  // one - Reset empties the details, and so can a permalink. Left stale, it
  // would hold the entry area closed with nothing on screen to reopen it.
  const mathOpen = showMath && estimatedDate !== null;
  useEffect(() => {
    if (!estimatedDate) setShowMath(false);
  }, [estimatedDate]);

  const resultKey = estimatedDate ? estimatedDate.estimatedDate.getTime() : null;
  useEffect(() => {
    if (resultKey === null || prefersReducedMotion() || !resultRef.current) return;
    const animation = animate(resultRef.current, {
      opacity: [0.4, 1],
      scale: [0.975, 1],
      duration: 450,
      ease: 'out(3)',
    });
    return () => {
      animation.cancel();
    };
  }, [resultKey]);

  useEffect(() => {
    const fill = queueFillRef.current;
    if (!fill || !queue) return;
    const width = `${queue.progress * 100}%`;
    if (prefersReducedMotion()) {
      fill.style.width = width;
      return;
    }
    fill.style.width = '0%';
    const animation = animate(fill, { width, duration: 1100, ease: 'out(3)', delay: 150 });
    return () => {
      animation.cancel();
    };
  }, [queue]);

  // Valid range for the application date input
  const dateRange = useMemo(() => {
    if (!data || data.length === 0) return { min: '', max: '' };
    const dates = [...new Set(data.map((entry) => entry.month))].sort();
    // Today on Japan's calendar (UTC+9, no DST), matching the estimator's own
    // JST-pinned clock — plain toISOString() would be UTC's today, a day
    // behind Japan every evening.
    const currentDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return { min: `${dates[0]}-01`, max: currentDate };
  }, [data]);

  const vars = estimatedDate?.details.modelVariables;

  // Stands in for the inputs while they are folded away. Application types take
  // their one-word `compact` name rather than the full label, which does not fit
  // beside a bureau and a date in the rail.
  const selectionSummary = useMemo(
    () =>
      t('estimator.selectionSummary', {
        bureau: nonAirportBureaus.find((option) => option.value === details.bureau)?.label ?? details.bureau,
        type: applicationOptions.find((option) => option.value === details.type)?.compact ?? details.type,
        // Parsed as local time: a bare `YYYY-MM-DD` is UTC midnight to `new
        // Date`, which a viewer west of UTC then sees as the previous day.
        date: details.applicationDate ? formatters.mediumDate(new Date(`${details.applicationDate}T00:00:00`)) : '',
      }),
    [t, details, nonAirportBureaus, applicationOptions, formatters]
  );

  // Under ten days the spread reads in days, above that in weeks; both are
  // plural families, so a locale with more than two forms gets them right.
  const formatUncertainty = (days: number): string | null => {
    if (days < 1) return null;
    if (days < 10) return tPlural('estimator.uncertaintyDays', days);
    return tPlural('estimator.uncertaintyWeeks', Math.round(days / 7));
  };

  const resultNote = estimatedDate
    ? [
        formatUncertainty(estimatedDate.details.uncertaintyDays),
        tPlural('estimator.basedOnMonths', estimatedDate.details.monthsUsed),
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <section aria-label={t('estimator.title')} className="estimator-container">
      <div className="flex items-start justify-between gap-2 border-b border-border p-2">
        {/* Sized explicitly (not section-title): the sidebar is 360px wide at
            lg, where section-title's lg:text-lg would truncate this heading.
            Longer translations ("Estimateur de délai de traitement",
            "Estimador de tiempo de tramitación") still don't fit that column
            on one line even at the widest tested viewport, so this wraps to
            a second line instead of losing words to an ellipsis. */}
        <h2 className="min-w-0 text-sm font-semibold leading-snug md:text-base xl:text-lg">{t('estimator.title')}</h2>
        <div className="flex shrink-0 items-center gap-1">
          <IconTooltip label={t('estimator.reset')}>
            <button
              onClick={() => onDetailsChange({ bureau: '', type: '', applicationDate: '' })}
              disabled={!details.bureau && !details.type && !details.applicationDate}
              aria-label={t('estimator.resetAria')}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <RotateCcw className="size-4" />
            </button>
          </IconTooltip>
          <ShareButton appDetails={details} />
          {onCollapse && (
            <IconTooltip label={t('estimator.collapse')}>
              <button
                onClick={onCollapse}
                aria-label={t('estimator.collapseAria')}
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronsRight className="size-4" />
              </button>
            </IconTooltip>
          )}
          {onClose && (
            <IconTooltip label={t('estimator.close')}>
              <button
                onClick={onClose}
                aria-label={t('estimator.closeAria')}
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </IconTooltip>
          )}
        </div>
      </div>
      <div className="card-content-padded flex-1">
        {/* Both halves live under one wrapper: they are mutually exclusive, and
            as direct children of `card-content`'s space-y-4 the collapsed one
            would still collect a gap around its zero height. Each animates, so
            the panel does not grow before it shrinks on the way in. */}
        <div>
          <Collapsible open={mathOpen}>
            <CollapsibleContent>
              <button
                onClick={() => setShowMath(false)}
                // The visible summary leads the name (WCAG 2.5.3): voice
                // control matches what's on screen, and a screen reader hears
                // which selection the derivation belongs to before the action.
                aria-label={`${selectionSummary} — ${t('estimator.editDetails')}`}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-left text-xs text-secondary-foreground transition-colors hover:bg-muted"
              >
                <span className="truncate">{selectionSummary}</span>
                <Pencil className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={!mathOpen}>
            <CollapsibleContent>
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">{t('estimator.description')}</p>

                <FilterInput
                  type="select"
                  label={t('filters.bureau')}
                  labelVariant="eyebrow"
                  options={nonAirportBureaus}
                  value={details.bureau}
                  includeDefaultOption
                  defaultOptionLabel={t('estimator.selectBureau')}
                  onChange={(value) => onDetailsChange({ ...details, bureau: value })}
                />

                <FilterInput
                  type="select"
                  label={t('filters.appType')}
                  labelVariant="eyebrow"
                  options={applicationOptions}
                  value={details.type}
                  includeDefaultOption
                  defaultOptionLabel={t('estimator.selectType')}
                  filterFn={(option) => option.value !== 'all'}
                  onChange={(value) => onDetailsChange({ ...details, type: value })}
                />

                <FilterInput
                  type="date"
                  label={t('estimator.applicationDate')}
                  labelVariant="eyebrow"
                  value={details.applicationDate}
                  min={dateRange.min}
                  max={dateRange.max}
                  onChange={(value) => onDetailsChange({ ...details, applicationDate: value })}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {!estimatedDate && (
          <p className="mt-3 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            {t('estimator.empty')}
          </p>
        )}

        {estimatedDate && queue && (
          <div className="space-y-3">
            <div
              ref={resultRef}
              className={`rounded-xl border p-4 shadow-soft ${
                estimatedDate.details.isPastDue ? 'border-warning/40 bg-warning/10' : 'border-primary/25 bg-primary/5'
              }`}
            >
              <div className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('estimator.estimatedCompletion')}
              </div>
              <p
                className={`mt-1 text-2xl font-bold tabular-nums ${
                  estimatedDate.details.isPastDue ? 'text-warning' : 'text-foreground'
                }`}
              >
                {formatters.mediumDate(estimatedDate.estimatedDate)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{resultNote}</p>

              {estimatedDate.details.dataQuality === 'low' && (
                <div className="mt-3 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <strong>{t('estimator.limitedDataTitle')}</strong>{' '}
                      {tPlural('estimator.limitedDataBody', estimatedDate.details.monthsUsed)}
                    </div>
                  </div>
                </div>
              )}

              {estimatedDate.details.isPastDue && (
                <div className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <div className="flex items-start gap-2">
                    <OctagonAlert className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <strong>{t('estimator.pastDueTitle')}</strong> {t('estimator.pastDueBody')}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    ref={queueFillRef}
                    className={`h-full rounded-full ${estimatedDate.details.isPastDue ? 'bg-warning' : 'bg-primary'}`}
                    style={{ width: 0 }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between gap-2 text-xxs tabular-nums text-muted-foreground">
                  <span>{t('estimator.queuePosition')}</span>
                  <span>{t('estimator.aheadOfYou', { count: formatters.number(queue.ahead) })}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMath(!mathOpen)}
              aria-expanded={mathOpen}
              className="flex w-full items-center justify-between gap-2 border-t border-dashed border-border pt-3 text-xs hover:opacity-80"
            >
              <span className="text-secondary-foreground">{t('estimator.howCalculated')}</span>
              <span className="flex items-center gap-0.5 text-muted-foreground">
                {t(mathOpen ? 'estimator.hideMath' : 'estimator.showMath')}
                <ChevronRight
                  className={`size-3.5 transition-transform motion-reduce:transition-none ${mathOpen ? 'rotate-90' : ''}`}
                />
              </span>
            </button>

            {mathOpen && vars && <EstimationFormula vars={vars} branches={estimatedDate.details.branches} />}

            <p className="text-xxs italic text-muted-foreground sm:text-xs">
              {/* The emphasised word sits mid-sentence, so the sentence stays
                  one catalogue entry and <T> substitutes the styled span. */}
              <T
                k="estimator.disclaimer"
                values={{
                  emphasis: (
                    <strong>
                      <u>{t('estimator.disclaimerEmphasis')}</u>
                    </strong>
                  ),
                }}
              />
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
