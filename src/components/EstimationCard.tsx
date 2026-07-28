// src/components/EstimationCard.tsx
// The Processing Time Estimator, promoted to a first-class, always-visible
// panel. State is controlled by the shell so the desktop sidebar and the
// mobile sheet share one set of inputs, and "Show the math" is a disclosure
// that no longer hides the inputs.
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
  RotateCcw,
  X,
} from 'lucide-react';
import type React from 'react';
import { BlockMath } from 'react-katex';

import { applicationOptions } from '../constants/applicationOptions';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { prefersReducedMotion } from '../lib/motion';
import type { EstimatedDateResult } from '../utils/calculateEstimates';
import { calculateEstimatedDate } from '../utils/calculateEstimates';
import { nonAirportBureaus } from '../utils/getBureauData';
import type { ApplicationDetails } from '../utils/urlApplicationDetails';
import { ESTIMATOR_PARAM_NAMES } from '../utils/urlApplicationDetails';
import { FilterInput } from './common/FilterInput';
import { FormulaTooltip, variableExplanations } from './common/FormulaTooltip';
import { IconTooltip } from './common/IconTooltip';

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
    <IconTooltip label={copied ? 'Copied!' : 'Copy a permalink to this estimate'}>
      <button
        onClick={doShare}
        aria-label="Copy a permalink to this estimate"
        className={`flex size-7 items-center justify-center rounded-full transition-colors ${
          copied ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-primary'
        }`}
      >
        {copied ? <Check className="size-4" /> : <LinkIcon className="size-4" />}
      </button>
    </IconTooltip>
  );
};

// "22 Sep 2026" - the compact date form the result panel uses.
const formatResultDate = (date: Date) =>
  `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;

const formatUncertainty = (days: number): string | null => {
  if (days < 1) return null;
  if (days < 10) return `± ${days} day${days === 1 ? '' : 's'}`;
  const weeks = Math.round(days / 7);
  return `± ${weeks} week${weeks === 1 ? '' : 's'}`;
};

export const EstimationCard: React.FC<EstimationCardProps> = ({
  data,
  details,
  onDetailsChange,
  onCollapse,
  onClose,
}) => {
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
    const currentDate = new Date().toISOString().slice(0, 10);
    return { min: `${dates[0]}-01`, max: currentDate };
  }, [data]);

  const vars = estimatedDate?.details.modelVariables;

  const resultNote = estimatedDate
    ? [
        formatUncertainty(estimatedDate.details.uncertaintyDays),
        `based on ${estimatedDate.details.monthsUsed} month${
          estimatedDate.details.monthsUsed === 1 ? '' : 's'
        } of throughput`,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <section aria-label="Processing Time Estimator" className="estimator-container">
      <div className="flex-between gap-2 border-b border-border p-2">
        {/* Sized explicitly (not section-title): the sidebar is 360px wide at
            lg, where section-title's lg:text-lg would truncate this heading */}
        <h2 className="min-w-0 truncate text-sm font-semibold md:text-base xl:text-lg">Processing Time Estimator</h2>
        <div className="flex shrink-0 items-center gap-1">
          <IconTooltip label="Reset the estimator">
            <button
              onClick={() => onDetailsChange({ bureau: '', type: '', applicationDate: '' })}
              disabled={!details.bureau && !details.type && !details.applicationDate}
              aria-label="Reset the Processing Time Estimator"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <RotateCcw className="size-4" />
            </button>
          </IconTooltip>
          <ShareButton appDetails={details} />
          {onCollapse && (
            <IconTooltip label="Collapse the estimator">
              <button
                onClick={onCollapse}
                aria-label="Collapse the Processing Time Estimator"
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronsRight className="size-4" />
              </button>
            </IconTooltip>
          )}
          {onClose && (
            <IconTooltip label="Close the estimator">
              <button
                onClick={onClose}
                aria-label="Close the Processing Time Estimator"
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </IconTooltip>
          )}
        </div>
      </div>
      <div className="card-content-padded flex-1">
        <p className="text-xs text-muted-foreground">
          Queue-model estimate from the last six months of bureau throughput.
        </p>

        <FilterInput
          type="select"
          label="Immigration Bureau"
          labelVariant="eyebrow"
          options={nonAirportBureaus}
          value={details.bureau}
          includeDefaultOption
          defaultOptionLabel="Select Bureau"
          onChange={(value) => onDetailsChange({ ...details, bureau: value })}
        />

        <FilterInput
          type="select"
          label="Application Type"
          labelVariant="eyebrow"
          options={applicationOptions}
          value={details.type}
          includeDefaultOption
          defaultOptionLabel="Select Type"
          filterFn={(option) => option.value !== 'all'}
          onChange={(value) => onDetailsChange({ ...details, type: value })}
        />

        <FilterInput
          type="date"
          label="Application Date"
          labelVariant="eyebrow"
          value={details.applicationDate}
          min={dateRange.min}
          max={dateRange.max}
          onChange={(value) => onDetailsChange({ ...details, applicationDate: value })}
        />

        {!estimatedDate && (
          <p className="mt-3 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            Select your bureau, application type, and application date to estimate when your application will be
            processed.
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
                Estimated completion
              </div>
              <p
                className={`mt-1 text-2xl font-bold tabular-nums ${
                  estimatedDate.details.isPastDue ? 'text-warning' : 'text-foreground'
                }`}
              >
                {formatResultDate(estimatedDate.estimatedDate)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{resultNote}</p>

              {estimatedDate.details.dataQuality === 'low' && (
                <div className="mt-3 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <strong>Estimated with limited data:</strong> Your application date is beyond available data. This
                      estimate is based on simulated processing rates from {estimatedDate.details.monthsUsed} month
                      {estimatedDate.details.monthsUsed === 1 ? '' : 's'} of historical data and may be less accurate.
                    </div>
                  </div>
                </div>
              )}

              {estimatedDate.details.isPastDue && (
                <div className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <div className="flex items-start gap-2">
                    <OctagonAlert className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <strong>Possibly past due:</strong> Based on expected processing rates, completion of this
                      application may be past due. If you have not yet received additional requests and/or a decision on
                      this application, please contact the bureau for more information.
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
                  <span>Queue position</span>
                  <span>≈ {queue.ahead.toLocaleString('en-US')} ahead of you</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMath(!showMath)}
              aria-expanded={showMath}
              className="flex w-full items-center justify-between gap-2 border-t border-dashed border-border pt-3 text-xs hover:opacity-80"
            >
              <span className="text-secondary-foreground">How is this calculated?</span>
              <span className="flex items-center gap-0.5 text-muted-foreground">
                {showMath ? 'Hide the math' : 'Show the math'}
                <ChevronRight
                  className={`size-3.5 transition-transform motion-reduce:transition-none ${showMath ? 'rotate-90' : ''}`}
                />
              </span>
            </button>

            {/* Steps follow the dependency order: the queue at application
                feeds the current position and rate, which feed the estimate */}
            {showMath && vars && (
              <div className="space-y-2">
                <FormulaTooltip
                  step={1}
                  title="Queue at application"
                  variables={{
                    'Q_{\\text{app}}': variableExplanations['Q_app'],
                    'C_{\\text{prev}}': variableExplanations['C_prev'],
                    'N_{\\text{app}}': variableExplanations['N_app'],
                    'P_{\\text{app}}': variableExplanations['P_app'],
                  }}
                >
                  <BlockMath
                    math={`
                    \\begin{aligned}
                    &Q_{\\text{app}} \\approx \\underbrace{C_{\\text{prev}}}_{${vars.C_prev.toFixed()}} + \\underbrace{N_{\\text{app}}}_{${vars.N_app.toFixed()}} - \\underbrace{P_{\\text{app}}}_{${vars.P_app.toFixed()}} \\\\
                    \\end{aligned}
                  `}
                  />
                </FormulaTooltip>
                <FormulaTooltip
                  step={2}
                  title="Queue position & daily rate"
                  variables={{
                    'C_{\\text{proc}}': variableExplanations['C_proc'],
                    'E_{\\text{proc}}': variableExplanations['E_proc'],
                    '\\sum P': variableExplanations['Sigma_P'],
                    '\\sum D': variableExplanations['Sigma_D'],
                  }}
                >
                  <BlockMath
                    math={`
                    \\begin{aligned}
                    &\\begin{cases}
                    Q_{\\text{pos}} \\approx \\underbrace{Q_{\\text{app}}}_{${vars.Q_app.toFixed()}} - \\underbrace{C_{\\text{proc}}}_{${vars.C_proc.toFixed()}} - \\underbrace{E_{\\text{proc}}}_{${vars.E_proc.toFixed()}} \\\\
                    \\\\
                    R_{\\text{daily}} \\approx \\left\\lbrack\\dfrac{\\sum P}{\\sum D}\\right\\rbrack = \\left\\lbrack\\dfrac{${vars.Sigma_P}}{${vars.Sigma_D}}\\right\\rbrack \\\\
                    \\end{cases}
                    \\end{aligned}
                  `}
                  />
                </FormulaTooltip>
                <FormulaTooltip
                  step={3}
                  title="Remaining days"
                  variables={{
                    'D_{\\text{rem}}': variableExplanations['D_rem'],
                    'Q_{\\text{pos}}': variableExplanations['Q_pos'],
                    'R_{\\text{daily}}': variableExplanations['R_daily'],
                  }}
                >
                  <BlockMath
                    math={`
                    \\begin{aligned}
                    &D_{\\text{rem}} \\approx \\left\\lbrack\\dfrac{Q_{\\text{pos}}}{R_{\\text{daily}}}\\right\\rbrack = \\left\\lbrack\\dfrac{{${vars.Q_pos.toFixed()}}}{${vars.R_daily.toFixed(2)}}\\right\\rbrack \\approx ${vars.D_rem.toFixed()} \\ \\text{d} \\\\
                    \\end{aligned}
                  `}
                  />
                </FormulaTooltip>
              </div>
            )}

            <p className="text-xxs italic text-muted-foreground sm:text-xs">
              *This is an{' '}
              <strong>
                <u>estimate</u>
              </strong>{' '}
              based on current processing rates, expected queue position, and pending applications. Actual processing
              time for your application may vary.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
