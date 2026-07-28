'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { TooltipProvider } from '@/components/ui/tooltip';

import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LocaleProvider } from '../../i18n/LocaleContext';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading Dashboard..." />,
});

export function ClientWrapper() {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <LocaleProvider>
        <TooltipProvider delayDuration={300}>
        <ErrorBoundary>
          <Suspense
            fallback={<LoadingSpinner message="Loading Dashboard..." />}
          >
            <App />
          </Suspense>
        </ErrorBoundary>
        </TooltipProvider>
        </LocaleProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
