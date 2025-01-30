// components/EstimationCard.jsx
import { useMemo, useState } from 'react';
import { FilterInput } from './common/FilterInput';
import { nonAirportBureaus } from '../utils/getBureauData';
import { applicationOptions } from '../constants/applicationOptions';
import { Icon } from '@iconify/react';
import { calculateEstimatedDate } from '../utils/calculateEstimates';

export const EstimationCard = ({ data, variant = 'drawer', isExpanded, onCollapse, onClose }) => {
  const [applicationDetails, setApplicationDetails] = useState({
    bureau: '',
    type: '',
    applicationDate: '',
  });
  const [showDetails, setShowDetails] = useState(false);

  const estimatedDate = useMemo(() => calculateEstimatedDate(data, applicationDetails), [data, applicationDetails]);

  // Get valid date range for the application date input
  const dateRange = useMemo(() => {
    if (!data || data.length === 0) return { min: '', max: '' };

    const months = [...new Set(data.map((entry) => entry.month))].sort();
    const currentDate = new Date().toISOString().slice(0, 7); // YYYY-MM format

    return {
      min: months[0],
      max: currentDate, // Allow selection up to current month
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
              type="month"
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Estimated Completion Date</h3>
            <p
              className={`mt-2 text-2xl font-bold ${
                estimatedDate.details.isPastDue
                  ? 'text-amber-600 dark:text-amber-500'
                  : 'text-indigo-600 dark:text-indigo-500'
              }`}
            >
              {estimatedDate.estimatedDate.toLocaleDateString(
                'en-US',
                estimatedDate.details.useDailyEstimate
                  ? {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  : {
                      year: 'numeric',
                      month: 'long',
                    }
              )}
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
              <div className="mt-2.5 space-y-1 border-t pt-3 text-xs text-gray-600 dark:text-gray-200">
                {estimatedDate.details.isPastDue ? (
                  <>
                    <p className="text-amber-600 dark:text-amber-500">
                      <strong>Applications at Submission:</strong>
                      {estimatedDate.details.adjustedQueueTotal.toLocaleString()}
                    </p>
                    <p className="text-amber-600 dark:text-amber-500">
                      <strong>Processed Since Submission:</strong>
                      {estimatedDate.details.processedSince.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs italic text-amber-600 dark:text-amber-500">
                      Based on our expected processing rates, it appears that completion of this application is past
                      due. If you have not yet received a decision on this application, please contact the bureau for
                      more information.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Applications at Submission:</strong>
                      {estimatedDate.details.adjustedQueueTotal.toLocaleString()}
                    </p>
                    <p>
                      <strong>Processed Since Submission:</strong>
                      {estimatedDate.details.processedSince.toLocaleString()}
                    </p>
                    <p>
                      <strong>
                        Estimated Queue Position <i>(QP)</i>:
                      </strong>
                      {estimatedDate.details.queuePosition.toLocaleString()}
                    </p>
                    <p>
                      <strong>
                        Application Processing Rate <i>(APR)</i>:
                      </strong>
                      {estimatedDate.details.monthlyRate.toLocaleString()} /month
                    </p>
                    <div className="rounded-lg bg-gray-100 p-5 text-xxs dark:bg-gray-600">
                      <p className="text-xs font-semibold">Calculation Formula:</p>
                      <p>Estimated Months = QP ÷ APR</p>
                      <p>
                        = {estimatedDate.details.queuePosition.toLocaleString()} ÷{' '}
                        {estimatedDate.details.monthlyRate.toLocaleString()}
                      </p>
                      <p>= {estimatedDate.details.estimatedMonths.toFixed(0)}~ months remaining</p>
                    </div>
                  </>
                )}
              </div>
            )}

            <p className="mt-4 text-xs italic text-gray-500 dark:text-gray-200">
              *This is an{' '}
              <strong>
                <u>estimate</u>
              </strong>{' '}
              based on current processing rates and pending applications. The actual completion date may vary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
