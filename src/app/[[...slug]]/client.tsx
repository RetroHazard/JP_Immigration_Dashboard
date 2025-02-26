'use client';
import { Suspense } from 'react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export function ClientWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <App />
    </Suspense>
  );
}