import type React from 'react';

import { LoadingSpinner } from './components/common/LoadingSpinner';
import { DashboardShell } from './components/DashboardShell';
import { useImmigrationData } from './hooks/useImmigrationData';
import { useResidentsData } from './hooks/useResidentsData';
import { useLocale } from './i18n/LocaleContext';

const App: React.FC = () => {
  const { data, meta, loading, error } = useImmigrationData();
  // Fetched eagerly alongside the processing data so switching datasets is
  // instant. A failure here is not fatal: the shell disables the Residents half
  // of the switcher.
  const { data: residents } = useResidentsData();
  const { t } = useLocale();

  if (loading) {
    return <LoadingSpinner message={t('app.loadingData')} />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-card p-8 shadow-soft">
          <h1 className="mb-4 text-2xl font-bold text-destructive">{t('errors.dataTitle')}</h1>
          <p className="mb-4 text-secondary-foreground">{t(error ?? 'errors.noData')}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            {t('app.retry')}
          </button>
        </div>
      </div>
    );
  }

  return <DashboardShell data={data} meta={meta} residents={residents} />;
};

export default App;
