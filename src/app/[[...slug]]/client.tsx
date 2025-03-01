'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading Dashboard..." />,
});

export function ClientWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading Dashboard..." />}>
      <App />
    </Suspense>
  );
}