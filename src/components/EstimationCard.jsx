// components/EstimationCard.jsx
import { useState, useMemo } from 'react';

export const EstimationCard = ({ data }) => {
    const [applicationDetails, setApplicationDetails] = useState({
        bureau: '',
        type: '',
        applicationDate: ''
    });

    const estimatedDate = useMemo(() => {
        if (!applicationDetails.bureau || !applicationDetails.type || !applicationDetails.applicationDate) {
            return null;
        }

        return calculateEstimatedDate(data, applicationDetails);
    }, [data, applicationDetails]);

    const calculateEstimatedDate = (data, details) => {
        const { bureau, type, applicationDate } = details;
        const applicationMonth = applicationDate.slice(0, 7);

        // Filter relevant data
        const bureauData = data.filter(entry =>
            entry['@cat03'] === bureau &&
            entry['@cat02'] === type &&
            entry['@time'].startsWith('2024')
        );

        // Calculate monthly processing rate
        const processedApplications = bureauData.reduce((sum, entry) =>
            entry['@cat01'] === '300000' ? sum + parseInt(entry['$']) : sum, 0);
        const monthlyAverage = processedApplications / 3; // Using last 3 months average

        // Get pending applications
        const pendingApplications = bureauData.find(entry =>
            entry['@cat01'] === '400000' &&
            entry['@time'] === applicationMonth
        );
        const pendingCount = pendingApplications ? parseInt(pendingApplications['$']) : 0;

        // Calculate estimated processing time
        const daysToProcess = Math.ceil((pendingCount / monthlyAverage) * 30);
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + daysToProcess);

        return estimatedDate;
    };

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
                        <option value="101010">Sapporo</option>
                        <option value="101090">Sendai</option>
                        <option value="101170">Tokyo</option>
                        <option value="101350">Nagoya</option>
                        <option value="101460">Osaka</option>
                        <option value="101580">Hiroshima</option>
                        <option value="101720">Fukuoka</option>
                        <option value="101830">Yokohama</option>
                        <option value="101860">Takamatsu</option>
                        <option value="101870">Naha</option>
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
                        max={new Date().toISOString().slice(0, 7)}
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
