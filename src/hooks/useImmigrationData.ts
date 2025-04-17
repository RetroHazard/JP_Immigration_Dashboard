// src/hooks/useImmigrationData.ts
import { useEffect, useState } from 'react';

import { transformData } from '../utils/dataTransform';
import { loadLocalData } from '../utils/loadLocalData';

export interface ImmigrationData {
  month: string;
  bureau: string;
  type: string;
  value: number;
  status: string;
}

export const useImmigrationData = () => {
  const [data, setData] = useState<ImmigrationData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch((error: any) => {
      console.error('Unexpected error in fetchData:', error);
      setError('Failed to fetch data');
    });
  }, []);

  return { data, loading, error };
};
