// components/EstimationCard.jsx
import { useState, useMemo } from 'react';
import { bureauOptions } from '../constants/bureauOptions';

const calculateEstimatedDate = (data, details) => {
    if (!data || !details.bureau || !details.type || !details.applicationDate) {
        return null;
    }

    const { bureau, type, applicationDate } = details;

    // Get the last 3 months of data for calculating average processing rate
    const months = [...new Set(data.map(entry => entry.month))]
        .sort()
        .slice(-3);

    // Calculate monthly processing rate based on last 3 months
    const processedApplications = months.reduce((total, month) => {
        const monthData = data.filter(entry =>
            entry.month === month &&
            entry.bureau === bureau &&
            entry.type === type &&
            entry.status === '300000'
        );

        return total + monthData.reduce((sum, entry) => sum + entry.value, 0);
    }, 0);

    const monthlyAverage = processedApplications / 3;

    // Get current pending applications for the selected bureau and type
    const currentPending = data.filter(entry =>
        entry.month === months[months.length - 1] &&
        entry.bureau === bureau &&
        entry.type === type
    ).reduce((sum, entry) => {
        if (entry.status === '100000') return sum + entry.value;
        if (entry.status === '300000') return sum - entry.value;
        return sum;
    }, 0);

    // Calculate applications submitted before the selected date
    const applicationMonth = applicationDate;
    const applicationsAhead = data.filter(entry =>
        entry.month <= applicationMonth &&
        entry.month > months[0] &&
        entry.bureau === bureau &&
        entry.type === type &&
        entry.status === '100000'
    ).reduce((sum, entry) => sum + entry.value, 0);

    // If no monthly average, return null
    if (monthlyAverage <= 0) return null;

    // Calculate estimated processing time
    const totalToProcess = applicationsAhead + currentPending;
    const estimatedDays = Math.ceil((totalToProcess / monthlyAverage) * 30);

    // Calculate estimated completion date
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
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h3 className="text-lg font-medium text-gray-900">
                            Estimated Completion Date
                        </h3>
                        <p className="mt-2 text-2xl font-bold text-indigo-600">
                            {estimatedDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            *This is an estimate based on current processing rates and pending applications
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
