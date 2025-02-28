'use client';
import { Suspense } from 'react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading Dashboard..." />
});

export function ClientWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading Dashboard..." />}>
      <App />
    </Suspense>
  );
}