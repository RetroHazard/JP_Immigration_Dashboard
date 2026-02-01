'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ThemeProvider } from '../../contexts/ThemeContext';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading Dashboard..." />,
});

export function ClientWrapper() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading Dashboard..." />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
