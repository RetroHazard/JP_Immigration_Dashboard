// src/components/EstimationCard.tsx
import React, { useMemo, useState } from 'react';
import { FilterInput } from './common/FilterInput';
import { nonAirportBureaus } from '../utils/getBureauData';
import { applicationOptions } from '../constants/applicationOptions';
import { ImmigrationData } from '../hooks/useImmigrationData';
import { Icon } from '@iconify/react';
import { calculateEstimatedDate, EstimatedDateResult } from '../utils/calculateEstimates';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FormulaTooltip, variableExplanations } from './common/FormulaTooltip';


interface EstimationCardProps {
  data: ImmigrationData[];
  variant?: 'drawer' | 'expandable';
  isExpanded?: boolean;
  onCollapse?: () => void;
  onClose?: () => void;
}

interface ApplicationDetails {
  bureau: string;
  type: string;
  applicationDate: string;
}

export const EstimationCard: React.FC<EstimationCardProps> = ({
                                                                data,
                                                                variant = 'drawer',
                                                                isExpanded,
                                                                onCollapse,
                                                                onClose,
                                                              }) => {
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails>({
    bureau: '',
    type: '',
    applicationDate: '',
  });
  const [showDetails, setShowDetails] = useState(false);

  const estimatedDate: EstimatedDateResult | null = useMemo(
    () => calculateEstimatedDate(data, applicationDetails),
    [data, applicationDetails],
  );

  // Get valid date range for the application date input
  const dateRange = useMemo(() => {
    if (!data || data.length === 0) return { min: '', max: '' };

    // Extract and sort unique dates from data (YYYY-MM-DD format)
    const dates = [...new Set(data.map((entry) => entry.month))].sort();
    // Get current date in UTC (YYYY-MM-DD format)
    const currentDate = new Date().toISOString().slice(0, 10);

    return {
      min: dates[0],
      max: currentDate, // Allow selection up to current date
    };
  }, [data]);

  if (variant === 'expandable' && !isExpanded) {
    return (
      <div className="flex h-full cursor-pointer flex-col items-center justify-between p-5" onClick={onCollapse}>
        <Icon icon="ci:chevron-left-duo" className="flashing-chevron" />
        <div
          className="section-title whitespace-nowrap text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-600"
          style={{ writingMode: 'vertical-rl' }}
        >
          <h2>Processing Time Estimator</h2>
        </div>
        <Icon icon="ci:chevron-left-duo" className="flashing-chevron" />
      </div>
    );
  }

  return (
    <div className="estimator-container">
      <div className="flex-between border-b p-2 dark:border-gray-500">
        <h2 className="section-title">Processing Time Estimator</h2>
        <button onClick={variant === 'drawer' ? onClose : onCollapse} className="p-2 text-gray-500 hover:text-gray-700">
          <Icon icon={variant === 'drawer' ? 'ci:close-md' : 'ci:chevron-right-duo'} className="flashing-chevron" />
        </button>
      </div>
      <div className="card-content-padded flex-1">
        {!showDetails && (
          <>
            <FilterInput
              type="select"
              label="Immigration Bureau"
              options={nonAirportBureaus}
              value={applicationDetails.bureau}
              includeDefaultOption
              defaultOptionLabel="Select Bureau"
              onChange={(value) => setApplicationDetails({ ...applicationDetails, bureau: value })}
            />

            <FilterInput
              type="select"
              label="Application Type"
              options={applicationOptions}
              value={applicationDetails.type}
              includeDefaultOption
              defaultOptionLabel="Select Type"
              filterFn={(option) => option.value !== 'all'}
              onChange={(value) => setApplicationDetails({ ...applicationDetails, type: value })}
            />

            <FilterInput
              type="date"
              label="Application Date"
              value={applicationDetails.applicationDate}
              min={dateRange.min}
              max={dateRange.max}
              onChange={(value) => setApplicationDetails({ ...applicationDetails, applicationDate: value })}
            />
          </>
        )}

        {estimatedDate && (
          <div className="card-base-gray">
            <div className="text-center text-lg font-medium text-gray-900 dark:text-gray-200">
              Estimated Completion Date
            </div>
            <p
              className={`mt-2 text-center text-2xl font-bold ${
                estimatedDate.details.isPastDue
                  ? 'text-amber-600 dark:text-amber-500'
                  : 'text-indigo-600 dark:text-indigo-500'
              }`}
            >
              {estimatedDate.estimatedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-500"
            >
              <Icon
                icon={showDetails ? 'material-symbols:settings' : 'material-symbols:info-outline'}
                className="mr-1"
              />
              {showDetails ? 'Show Filters' : 'Show Details'}
            </button>

            {showDetails && (
              <div className="mt-2.5 space-y-1 border-t pt-3 text-xs text-gray-600 dark:border-gray-500 dark:text-gray-200">
                {estimatedDate.details.isPastDue ? (
                  <>
                    <p className="text-amber-600 dark:text-amber-500">
                      <strong>Applications at Submission: </strong>
                      {estimatedDate.details.queueAtApplication.toLocaleString()}
                    </p>
                    <p className="text-amber-600 dark:text-amber-500">
                      <strong>Processed since Submission: </strong>
                      {estimatedDate.details.totalProcessedSinceApp.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs italic text-amber-600 dark:text-amber-500">
                      Based on our expected processing rates, it appears that completion of this application is past
                      due. If you have not yet received a decision on this application, please contact the bureau for
                      more information.
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      id="calculationModel"
                      className="rounded-xl bg-gray-100 p-2.5 text-xxs shadow-lg dark:bg-gray-600"
                    >
                      <FormulaTooltip
                        variables={{
                          'D_{\\text{rem}}': variableExplanations['D_rem'],
                          'Q_{\\text{pos}}': variableExplanations['Q_pos'],
                          'R_{\\text{daily}}': variableExplanations['R_daily'],
                        }}
                      >
                        <div className="mt-2 border-b border-gray-300 text-xxs text-gray-600 dark:border-gray-500 dark:text-gray-200">
                          <BlockMath
                            math={`
                            \\begin{aligned}
                            &D_{\\text{rem}} \\approx \\left\\lbrack\\dfrac{Q_{\\text{pos}}}{R_{\\text{daily}}}\\right\\rbrack = \\left\\lbrack\\dfrac{{${estimatedDate.details.modelVariables.Q_pos.toFixed()}}}{${estimatedDate.details.modelVariables.R_daily.toFixed(2)}}\\right\\rbrack \\approx ${estimatedDate.details.modelVariables.D_rem.toFixed()} \\ \\text{d} \\\\
                            \\end{aligned}
                          `}
                          />
                        </div>
                      </FormulaTooltip>
                      <FormulaTooltip
                        variables={{
                          'Q_{\\text{adj}}': variableExplanations['Q_adj'],
                          'C_{\\text{proc}}': variableExplanations['C_proc'],
                          'P_{\\text{proc}}': variableExplanations['P_proc'],
                          '\\sum P': variableExplanations['Sigma_P'],
                          '\\sum D': variableExplanations['Sigma_D'],
                        }}
                      >
                        <div className="mt-2 border-b border-gray-300 text-xxs text-gray-600 dark:border-gray-500 dark:text-gray-200">
                          <BlockMath
                            math={`
                            \\begin{aligned}
                            &\\text{where}\\
                            \\begin{cases}
                            Q_{\\text{pos}} \\approx \\underbrace{Q_{\\text{adj}}}_{${estimatedDate.details.modelVariables.Q_adj.toFixed()}} - \\underbrace{C_{\\text{proc}}}_{${estimatedDate.details.modelVariables.C_proc.toFixed()}} - \\underbrace{P_{\\text{proc}}}_{${estimatedDate.details.modelVariables.P_proc.toFixed()}} \\\\
                            \\\\
                            R_{\\text{daily}} \\approx \\left\\lbrack\\dfrac{\\sum P}{\\sum D}\\right\\rbrack = \\left\\lbrack\\dfrac{${estimatedDate.details.modelVariables.Sigma_P}}{${estimatedDate.details.modelVariables.Sigma_D}}\\right\\rbrack \\\\
                            \\end{cases}
                            \\end{aligned}
                          `}
                          />
                        </div>
                      </FormulaTooltip>
                      <FormulaTooltip
                        variables={{
                          'Q_{\\text{app}}': variableExplanations['Q_app'],
                          '\\Delta_{\\text{net}}': variableExplanations['Delta_net'],
                          't_{\\text{pred}}': variableExplanations['t_pred'],
                          'R_{\\text{new}}': variableExplanations['R_new'],
                        }}
                      >
                        <div className="mt-2 border-gray-300 text-xxs text-gray-600 dark:border-gray-500 dark:text-gray-200">
                          <BlockMath
                            math={`
                            \\begin{aligned}
                            &Q_{\\text{adj}}
                            \\begin{cases}
                            &\\approx \\underbrace{Q_{\\text{app}}}_{\\mathclap{${estimatedDate.details.modelVariables.Q_app.toFixed()}}} + \\lparen\\underbrace{\\Delta_{\\text{net}}\\vphantom{Q_{\\text{app}}}}_{\\mathclap{${estimatedDate.details.modelVariables.Delta_net.toFixed(2)}}} \\times \\underbrace{t_{\\text{pred}}\\vphantom{Q_{\\text{app}}}}_{\\mathclap{${estimatedDate.details.modelVariables.t_pred.toFixed()}\\ \\text{d}}}\\rparen \\\\
                            \\\\
                            &\\text{}\\
                            \\begin{cases}
                            \\Delta_{\\text{net}} \\approx \\underbrace{R_{\\text{new}}}_{${estimatedDate.details.modelVariables.R_new.toFixed(2)}} - \\underbrace{R_{\\text{daily}}}_{${estimatedDate.details.modelVariables.R_daily.toFixed(2)}} \\\\
                            \\\\
                            Q_{\\text{app}} \\approx \\underbrace{C_{\\text{prev}}}_{${estimatedDate.details.modelVariables.C_prev.toFixed()}} + \\underbrace{N_{\\text{app}}}_{${estimatedDate.details.modelVariables.N_app.toFixed()}} - \\underbrace{P_{\\text{app}}}_{${estimatedDate.details.modelVariables.P_app.toFixed()}} \\\\
                            \\end{cases}\\end{cases}
                            \\end{aligned}
                          `}
                          />
                        </div>
                      </FormulaTooltip>
                    </div>
                  </>
                )}
              </div>
            )}

            <p className="mt-4 text-xxs italic text-gray-500 dark:text-gray-200 sm:text-xs">
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
    </div>
  );
};