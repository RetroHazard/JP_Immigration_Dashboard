// components/EstimationCard.jsx
import { useState, useMemo } from 'react';
import { bureauOptions } from '../constants/bureauOptions';
import { applicationOptions } from '../constants/applicationOptions';
import { Icon } from '@iconify/react';

const nonAirportBureaus = bureauOptions.filter(option => {
    return option.value !== 'all' &&
        !option.label.toLowerCase().includes('airport');
});

const calculateEstimatedDate = (data, details) => {
    if (!data || !details.bureau || !details.type || !details.applicationDate) {
        return null;
    }

    const minMonths = 3;
    const maxMonths = 12;
    const maxBackwardMonths = 3;

    const { bureau, type, applicationDate } = details;

    // Filter data for specific bureau and type
    const filteredData = data.filter(entry =>
        entry.bureau === bureau &&
        entry.type === type
    );

    if (filteredData.length === 0) return null;

    // Get unique months from filtered data
    const months = [...new Set(filteredData.map(entry => entry.month))].sort();
    const lastAvailableMonth = months[months.length - 1];

    // If application date is after last available data, use last available month's data
    const effectiveApplicationDate = applicationDate > lastAvailableMonth
        ? lastAvailableMonth
        : applicationDate;

    // Split months into before and after application date
    const beforeMonths = months.filter(month => month < effectiveApplicationDate);
    const afterMonths = months.filter(month => month >= effectiveApplicationDate);

    // Start with forward-looking months
    let selectedMonths = afterMonths.slice(0, maxMonths);

    // If we don't have minimum months, add backward data (up to 3 months)
    if (selectedMonths.length < minMonths) {
        const needed = Math.min(minMonths - selectedMonths.length, maxBackwardMonths);
        selectedMonths = [
            ...beforeMonths.slice(-needed),
            ...selectedMonths
        ];
    }

    if (selectedMonths.length === 0) return null;

    // Find the first month after application date or use last available month
    let applicationMonth;
    if (applicationDate > lastAvailableMonth) {
        // For future dates, use the last available month's data
        applicationMonth = lastAvailableMonth;
    } else {
        // For past dates, find the first month after application
        applicationMonth = months.find(month => month > applicationDate) || lastAvailableMonth;
    }

    if (!applicationMonth) return null;

    // Calculate applications processed since user's application date
    const processedSinceApplication = filteredData
        .filter(entry =>
            entry.month > applicationDate &&
            entry.month <= lastAvailableMonth &&
            entry.status === '300000'
        )
        .reduce((sum, entry) => sum + entry.value, 0);

    // Get total applications in queue at application month
    const totalInQueue = filteredData
        .filter(entry =>
            entry.month === applicationMonth &&
            entry.status === '102000'
        )
        .reduce((sum, entry) => sum + entry.value, 0);

    // Calculate remaining applications ahead in queue
    const remainingAhead = Math.max(0, totalInQueue - processedSinceApplication);

    // Calculate processing rate using trend data
    const totalProcessed = selectedMonths.reduce((total, month) => {
        const monthProcessed = filteredData
            .filter(entry =>
                entry.month === month &&
                entry.status === '300000'
            )
            .reduce((sum, entry) => sum + entry.value, 0);
        return total + monthProcessed;
    }, 0);

    const monthlyProcessingRate = Math.round(totalProcessed / selectedMonths.length);

    if (monthlyProcessingRate <= 0 || remainingAhead <= 0) return null;

    // Calculate estimated months based on remaining queue position
    const estimatedMonths = Math.ceil(remainingAhead / monthlyProcessingRate);

    // Calculate estimated completion date from current date
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + estimatedMonths);

    const calculationDetails = {
        totalInQueue,
        monthlyRate: monthlyProcessingRate,
        processedSince: processedSinceApplication,
        queuePosition: remainingAhead,
        estimatedMonths: estimatedMonths
    };

    return {
        estimatedDate,
        details: calculationDetails
    };
};


export const EstimationCard = ({ data }) => {
    const [applicationDetails, setApplicationDetails] = useState({
        bureau: '',
        type: '',
        applicationDate: ''
    });
    const [showDetails, setShowDetails] = useState(false);

    const estimatedDate = useMemo(() => {
        return calculateEstimatedDate(data, applicationDetails);
    }, [data, applicationDetails]);

    // Get valid date range for the application date input
    const dateRange = useMemo(() => {
        if (!data || data.length === 0) return { min: '', max: '' };

        const months = [...new Set(data.map(entry => entry.month))].sort();
        const currentDate = new Date().toISOString().slice(0, 7); // YYYY-MM format

        return {
            min: months[0],
            max: currentDate // Allow selection up to current month
        };
    }, [data]);

    return (
        <div className="bg-white rounded-lg shadow-lg p-5 space-y-4 h-full">
            <h2 className="text-lg font-semibold">
                Processing Time Estimator
            </h2>

            {!showDetails ? (
                <div className="space-y-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Immigration Bureau
                        </label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={applicationDetails.bureau}
                            onChange={(e) => setApplicationDetails({
                                ...applicationDetails,
                                bureau: e.target.value
                            })}
                        >
                            <option value="">Select Bureau</option>
                            {nonAirportBureaus.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Application Type
                        </label>
                        <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={applicationDetails.type}
                            onChange={(e) => setApplicationDetails({
                                ...applicationDetails,
                                type: e.target.value
                            })}
                        >
                            <option value="">Select Type</option>
                            {applicationOptions
                                .filter(option => option.value !== 'all')
                                .map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Application Date
                        </label>
                        <input
                            type="month"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={applicationDetails.applicationDate}
                            onChange={(e) => setApplicationDetails({
                                ...applicationDetails,
                                applicationDate: e.target.value
                            })}
                            min={dateRange.min}
                            max={dateRange.max}
                        />
                    </div>
                </div>
            ) : null}

            {estimatedDate && (
                <div className="p-2 bg-gray-100 rounded-lg shadow-lg">
                    <h3 className="text-lg font-medium text-gray-900">
                        Estimated Completion Date
                    </h3>
                    <p className="mt-2 text-2xl font-bold text-indigo-600">
                        {estimatedDate.estimatedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                        })}
                    </p>

                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                        <Icon
                            icon={showDetails ? 'material-symbols:settings' : 'material-symbols:info-outline'}
                            className="mr-1"
                        />
                        {showDetails ? 'Show Filters' : 'Show Details'}
                    </button>

                    {showDetails && (
                        <div className="mt-2.5 text-xs text-gray-600 space-y-2 border-t pt-3">
                            <p><strong>Applications in Queue:</strong> {estimatedDate.details.totalInQueue.toLocaleString()}</p>
                            <p><strong>Processed Since Submission:</strong> {estimatedDate.details.processedSince.toLocaleString()}</p>
                            <p><strong>Estimated Queue Position <i>(QP)</i>:</strong> {estimatedDate.details.queuePosition.toLocaleString()}</p>
                            <p><strong>Application Processing Rate <i>(APR)</i>:</strong> {estimatedDate.details.monthlyRate.toLocaleString()} /month</p>
                            <div className="p-5 bg-gray-100 rounded text-xs">
                                <p className="font-medium">Calculation Formula:</p>
                                <p>Estimated Months = QP ÷ APR</p>
                                <p>= {estimatedDate.details.queuePosition.toLocaleString()} ÷ {estimatedDate.details.monthlyRate.toLocaleString()}</p>
                                <p>= {estimatedDate.details.estimatedMonths.toFixed(1)} months</p>
                            </div>
                        </div>
                    )}

                    <p className="mt-4 text-xs text-gray-500 italic">
                        *This is an estimate based on current processing rates and pending applications. The actual completion date may vary.
                    </p>
                </div>
            )}
        </div>
    );
};
