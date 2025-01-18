// components/EstimationCard.jsx
import { useState, useMemo } from 'react';
import { bureauOptions } from '../constants/bureauOptions';

const calculateEstimatedDate = (data, details) => {
    if (!data || !details.bureau || !details.type || !details.applicationDate) {
        return null;
    }

    const monthsToUse = 6;
    const { bureau, type, applicationDate } = details;

    // Filter data first to only include relevant bureau and type
    const filteredData = data.filter(entry =>
        entry.bureau === bureau &&
        entry.type === type
    );

    if (filteredData.length === 0) return null;

    // Get unique months from filtered data
    const months = [...new Set(filteredData.map(entry => entry.month))].sort();

    // Split months into before and after application date
    const beforeMonths = months.filter(month => month < applicationDate);
    const afterMonths = months.filter(month => month >= applicationDate);

    // Select months for trend calculation
    const selectedMonths = [
        ...afterMonths.slice(0, monthsToUse),
        ...beforeMonths.slice(-(monthsToUse - afterMonths.length))
    ].slice(0, monthsToUse);

    if (selectedMonths.length === 0) return null;

    // Calculate processing rate using only filtered data
    const processedApplications = selectedMonths.reduce((total, month) => {
        const monthProcessed = filteredData.filter(entry =>
            entry.month === month &&
            entry.status === '300000'
        ).reduce((sum, entry) => sum + entry.value, 0);
        return total + monthProcessed;
    }, 0);

    const monthlyAverage = processedApplications / selectedMonths.length;

    // Get current pending for specific bureau and type
    const latestMonth = months[months.length - 1];
    const currentPending = filteredData
        .filter(entry => entry.month === latestMonth)
        .reduce((sum, entry) => {
            if (entry.status === '100000') return sum + entry.value;
            if (entry.status === '300000') return sum - entry.value;
            return sum;
        }, 0);

    if (monthlyAverage <= 0 || currentPending <= 0) return null;

    const estimatedDays = Math.ceil((currentPending / monthlyAverage) * 30);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

    return estimatedDate;
};

export const EstimationCard = ({ data }) => {
    const [applicationDetails, setApplicationDetails] = useState({
        bureau: '',
        type: '',
        applicationDate: ''
    });

    const estimatedDate = useMemo(() => {
        return calculateEstimatedDate(data, applicationDetails);
    }, [data, applicationDetails]);

    // Get valid date range for the application date input
    const dateRange = useMemo(() => {
        if (!data || data.length === 0) return { min: '', max: '' };

        const months = [...new Set(data.map(entry => entry.month))].sort();
        return {
            min: months[0],
            max: months[months.length - 1]
        };
    }, [data]);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
                Processing Time Estimator
            </h2>

            <div className="space-y-4">
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
                        {bureauOptions.filter(option => option.value !== 'all').map(option => (
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
                        <option value="10">Status Acquisition</option>
                        <option value="20">Extension</option>
                        <option value="30">Change of Status</option>
                        <option value="40">Permission for Activity</option>
                        <option value="50">Re-entry</option>
                        <option value="60">Permanent Residence</option>
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

                {estimatedDate && (
                    <div className="h-full mt-6 p-4 bg-gray-50 rounded-md">
                        <h3 className="text-lg font-medium text-gray-900">
                            Estimated Completion Date
                        </h3>
                        <p className="mt-2 text-2xl font-bold text-indigo-600">
                            {estimatedDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                            })}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 italic">
                            *This is an estimate based on current processing rates and pending applications. The actual completion date may vary.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
