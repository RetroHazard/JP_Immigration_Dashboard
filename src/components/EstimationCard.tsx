// src/components/EstimationCard.tsx
// The Processing Time Estimator, promoted to a first-class, always-visible
// panel. State is controlled by the shell so the desktop sidebar and the
// mobile sheet share one set of inputs, and "Show the math" is a disclosure
// that no longer hides the inputs.
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { animate } from 'animejs';
import { AlertTriangle, Check, ChevronDown, ChevronsRight, ChevronUp, Link as LinkIcon, OctagonAlert } from 'lucide-react';
import type React from 'react';
import { BlockMath } from 'react-katex';

import { applicationOptions } from '../constants/applicationOptions';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { prefersReducedMotion } from '../lib/motion';
import type { EstimatedDateResult } from '../utils/calculateEstimates';
import { calculateEstimatedDate } from '../utils/calculateEstimates';
import { nonAirportBureaus } from '../utils/getBureauData';
import type { ApplicationDetails } from '../utils/urlApplicationDetails';
import { FilterInput } from './common/FilterInput';
import { FormulaTooltip, variableExplanations } from './common/FormulaTooltip';
import { IconTooltip } from './common/IconTooltip';

interface EstimationCardProps {
  data: ImmigrationData[];
  details: ApplicationDetails;
  onDetailsChange: (details: ApplicationDetails) => void;
  /** When provided (desktop sidebar), renders a collapse control in the header */
  onCollapse?: () => void;
}

const ShareButton: React.FC<{ appDetails: ApplicationDetails }> = ({ appDetails }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [copied, setCopied] = useState(false);

  const doShare = async () => {
    const mutableParams = new URLSearchParams(searchParams.toString());

    // Only keep params with a selected value, so sharing a partially-filled form
    // doesn't leave empty bureau/type/applicationDate params in the URL.
    Object.entries(appDetails).forEach(([key, value]) => {
      if (value) {
        mutableParams.set(key, value);
      } else {
        mutableParams.delete(key);
      }
    });

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

export const EstimationCard: React.FC<EstimationCardProps> = ({ data, details, onDetailsChange, onCollapse }) => {
  const [showMath, setShowMath] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const estimatedDate: EstimatedDateResult | null = useMemo(
    () => calculateEstimatedDate(data, details),
    [data, details]
  );

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

  // Valid range for the application date input
  const dateRange = useMemo(() => {
    if (!data || data.length === 0) return { min: '', max: '' };
    const dates = [...new Set(data.map((entry) => entry.month))].sort();
    const currentDate = new Date().toISOString().slice(0, 10);
    return { min: `${dates[0]}-01`, max: currentDate };
  }, [data]);

  const vars = estimatedDate?.details.modelVariables;

  return (
    <section aria-label="Processing Time Estimator" className="estimator-container">
      <div className="flex-between gap-2 border-b border-border p-2">
        <h2 className="section-title min-w-0 truncate">Processing Time Estimator</h2>
        <div className="flex shrink-0 items-center gap-1">
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
        </div>
      </div>
      <div className="card-content-padded flex-1">
        <FilterInput
          type="select"
          label="Immigration Bureau"
          options={nonAirportBureaus}
          value={details.bureau}
          includeDefaultOption
          defaultOptionLabel="Select Bureau"
          onChange={(value) => onDetailsChange({ ...details, bureau: value })}
        />

        <FilterInput
          type="select"
          label="Application Type"
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

        {estimatedDate && (
          <div
            ref={resultRef}
            className={`card-base-gray border-t-4 ${
              estimatedDate.details.isPastDue ? 'border-warning' : 'border-primary'
            }`}
          >
            <div className="text-center text-sm font-medium text-muted-foreground">Estimated Completion Date</div>
            <p
              className={`mt-1 text-center text-2xl font-bold tabular-nums ${
                estimatedDate.details.isPastDue ? 'text-warning' : 'text-primary'
              }`}
            >
              {estimatedDate.estimatedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {estimatedDate.details.dataQuality === 'low' && (
              <div className="mt-2 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
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
              <div className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
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

            <button
              onClick={() => setShowMath(!showMath)}
              aria-expanded={showMath}
              className="mt-3 flex items-center gap-1 text-sm text-primary hover:opacity-80"
            >
              {showMath ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              {showMath ? 'Hide the math' : 'Show the math'}
            </button>

            {showMath && vars && (
              <div className="mt-2.5 space-y-1 border-t border-border pt-3 text-xs">
                <div className="rounded-xl bg-muted p-2.5 text-xxs text-secondary-foreground shadow-soft">
                  <FormulaTooltip
                    variables={{
                      'D_{\\text{rem}}': variableExplanations['D_rem'],
                      'Q_{\\text{pos}}': variableExplanations['Q_pos'],
                      'R_{\\text{daily}}': variableExplanations['R_daily'],
                    }}
                  >
                    <div className="mt-2 border-b border-border text-xxs">
                      <BlockMath
                        math={`
                        \\begin{aligned}
                        &D_{\\text{rem}} \\approx \\left\\lbrack\\dfrac{Q_{\\text{pos}}}{R_{\\text{daily}}}\\right\\rbrack = \\left\\lbrack\\dfrac{{${vars.Q_pos.toFixed()}}}{${vars.R_daily.toFixed(2)}}\\right\\rbrack \\approx ${vars.D_rem.toFixed()} \\ \\text{d} \\\\
                        \\end{aligned}
                      `}
                      />
                    </div>
                  </FormulaTooltip>
                  <FormulaTooltip
                    variables={{
                      'C_{\\text{proc}}': variableExplanations['C_proc'],
                      'E_{\\text{proc}}': variableExplanations['E_proc'],
                      '\\sum P': variableExplanations['Sigma_P'],
                      '\\sum D': variableExplanations['Sigma_D'],
                    }}
                  >
                    <div className="mt-2 border-b border-border text-xxs">
                      <BlockMath
                        math={`
                        \\begin{aligned}
                        &\\text{where}\\
                        \\begin{cases}
                        Q_{\\text{pos}} \\approx \\underbrace{Q_{\\text{app}}}_{${vars.Q_app.toFixed()}} - \\underbrace{C_{\\text{proc}}}_{${vars.C_proc.toFixed()}} - \\underbrace{E_{\\text{proc}}}_{${vars.E_proc.toFixed()}} \\\\
                        \\\\
                        R_{\\text{daily}} \\approx \\left\\lbrack\\dfrac{\\sum P}{\\sum D}\\right\\rbrack = \\left\\lbrack\\dfrac{${vars.Sigma_P}}{${vars.Sigma_D}}\\right\\rbrack \\\\
                        \\end{cases}
                        \\end{aligned}
                      `}
                      />
                    </div>
                  </FormulaTooltip>
                  <FormulaTooltip
                    variables={{
                      'Q_{\\text{app}}': variableExplanations['Q_app'],
                      'C_{\\text{prev}}': variableExplanations['C_prev'],
                      'N_{\\text{app}}': variableExplanations['N_app'],
                      'P_{\\text{app}}': variableExplanations['P_app'],
                    }}
                  >
                    <div className="mt-2 text-xxs">
                      <BlockMath
                        math={`
                        \\begin{aligned}
                        &Q_{\\text{app}} \\approx \\underbrace{C_{\\text{prev}}}_{${vars.C_prev.toFixed()}} + \\underbrace{N_{\\text{app}}}_{${vars.N_app.toFixed()}} - \\underbrace{P_{\\text{app}}}_{${vars.P_app.toFixed()}} \\\\
                        \\end{aligned}
                      `}
                      />
                    </div>
                  </FormulaTooltip>
                </div>
              </div>
            )}

            <p className="mt-4 text-xxs italic text-muted-foreground sm:text-xs">
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
