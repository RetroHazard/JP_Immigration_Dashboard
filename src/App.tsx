// App.tsx
import type React from 'react';

import { LoadingSpinner } from './components/common/LoadingSpinner';
import { DashboardShell } from './components/DashboardShell';
import { useImmigrationData } from './hooks/useImmigrationData';

const App: React.FC = () => {
  const { data, meta, loading, error } = useImmigrationData();

  if (loading) {
    return <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Crunching Immigration Data..." />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-card p-8 shadow-soft">
          <h1 className="mb-4 text-2xl font-bold text-destructive">Error Loading Data</h1>
          <p className="mb-4 text-secondary-foreground">{error ?? 'No data available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <DashboardShell data={data} meta={meta} />;
};

export default App;
