'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { TooltipProvider } from '@/components/ui/tooltip';

import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LocaleProvider, useLocale } from '../../i18n/LocaleContext';

// Both boot fallbacks render inside LocaleProvider, so they can read the
// catalogue rather than carrying a hardcoded string apiece.
const BootSpinner = () => {
  const { t } = useLocale();
  return <LoadingSpinner message={t('app.loadingDashboard')} />;
};

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => <BootSpinner />,
});

export function ClientWrapper() {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <LocaleProvider>
          <TooltipProvider delayDuration={300}>
            <ErrorBoundary>
              <Suspense fallback={<BootSpinner />}>
                <App />
              </Suspense>
            </ErrorBoundary>
          </TooltipProvider>
        </LocaleProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
