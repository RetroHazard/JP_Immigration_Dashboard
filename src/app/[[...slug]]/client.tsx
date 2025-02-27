'use client';
import { Suspense } from 'react';
import { PreLoadingSpinner } from '../../components/common/LoadingSpinner';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => <PreLoadingSpinner />
});

export function ClientWrapper() {
  return (
    <Suspense fallback={<PreLoadingSpinner />}>
      <App />
    </Suspense>
  );
}