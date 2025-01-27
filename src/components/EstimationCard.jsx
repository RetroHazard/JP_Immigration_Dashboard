// components/EstimationCard.jsx
import { useMemo, useState } from 'react';
import { bureauOptions } from '../constants/bureauOptions';
import { applicationOptions } from '../constants/applicationOptions';
import { Icon } from '@iconify/react';
import { calculateEstimatedDate } from '../utils/calculateEstimates';

const nonAirportBureaus = bureauOptions.filter((option) => {
  return option.value !== 'all' && !option.label.toLowerCase().includes('airport');
});

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
          className="section-title whitespace-nowrap text-gray-500 hover:text-gray-700"
          style={{ writingMode: 'vertical-rl' }}
        >
          <h2>Processing Time Estimator</h2>
        </div>
        <Icon icon="ci:chevron-left-duo" className="flashing-chevron" />
      </div>
    );
  }
  return (
    <div className="estimator-container flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-5">
        <h2 className="section-title">Processing Time Estimator</h2>
        <button onClick={variant === 'drawer' ? onClose : onCollapse} className="p-2 text-gray-500 hover:text-gray-700">
          <Icon icon={variant === 'drawer' ? 'ci:close-md' : 'ci:chevron-right-duo'} className="flashing-chevron" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          {!showDetails && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Immigration Bureau</label>
                <select
                  className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={applicationDetails.bureau}
                  onChange={(e) =>
                    setApplicationDetails({
                      ...applicationDetails,
                      bureau: e.target.value,
                    })
                  }
                >
                  <option value="">Select Bureau</option>
                  {nonAirportBureaus.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Application Type</label>
                <select
                  className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={applicationDetails.type}
                  onChange={(e) =>
                    setApplicationDetails({
                      ...applicationDetails,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="">Select Type</option>
                  {applicationOptions
                    .filter((option) => option.value !== 'all')
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Application Date</label>
                <input
                  type="month"
                  placeholder="YYYY-MM"
                  className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={applicationDetails.applicationDate}
                  onChange={(e) =>
                    setApplicationDetails({
                      ...applicationDetails,
                      applicationDate: e.target.value,
                    })
                  }
                  min={dateRange.min}
                  max={dateRange.max}
                />
              </div>
            </>
          )}

          {estimatedDate && (
            <div className="rounded-lg bg-gray-50 p-4 drop-shadow-xl">
              <h3 className="text-lg font-medium text-gray-900">Estimated Completion Date</h3>
              <p
                className={`mt-2 text-2xl font-bold ${
                  estimatedDate.details.isPastDue ? 'text-amber-600' : 'text-indigo-600'
                }`}
              >
                {estimatedDate.estimatedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                <Icon
                  icon={showDetails ? 'material-symbols:settings' : 'material-symbols:info-outline'}
                  className="mr-1"
                />
                {showDetails ? 'Show Filters' : 'Show Details'}
              </button>

              {showDetails && (
                <div className="mt-2.5 space-y-2 border-t pt-3 text-xs text-gray-600">
                  {estimatedDate.details.isPastDue ? (
                    <>
                      <p className="text-amber-600">
                        <strong>Applications at Submission:</strong>
                        {estimatedDate.details.adjustedQueueTotal.toLocaleString()}
                      </p>
                      <p className="text-amber-600">
                        <strong>Processed Since Submission:</strong>
                        {estimatedDate.details.processedSince.toLocaleString()}
                      </p>
                      <p className="mt-2 text-xs italic text-amber-600">
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
                      <div className="rounded bg-gray-100 p-5 text-xs">
                        <p className="font-medium">Calculation Formula:</p>
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

              <p className="mt-4 text-xs italic text-gray-500">
                *This is an estimate based on current processing rates and pending applications. The actual completion
                date may vary.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
