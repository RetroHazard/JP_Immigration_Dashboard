// src/hooks/useImmigrationData.js
import { useEffect, useState } from 'react';
import { loadLocalData } from '../utils/loadLocalData';
import { transformData } from '../utils/dataTransform';

export const useImmigrationData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jsonData = await loadLocalData();
                if (jsonData) {
                    const transformedData = transformData(jsonData);
                    setData(transformedData);
                } else {
                    setError('No data available');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
