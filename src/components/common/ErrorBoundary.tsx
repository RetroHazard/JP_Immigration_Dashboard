// src/components/common/ErrorBoundary.tsx
import React from 'react';

import { useLocale } from '../../i18n/LocaleContext';
import { logger } from '../../utils/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Default fallback, split out as a function component so it can read the
 * catalogue — a class can't call hooks. The boundary sits inside
 * LocaleProvider, so this always has a locale to work with.
 */
const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="rounded-xl border border-border bg-card p-8 shadow-soft">
        <h1 className="mb-4 text-2xl font-bold text-destructive">{t('errors.renderTitle')}</h1>
        <p className="mb-4 text-secondary-foreground">{t('errors.renderBody')}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          {t('errors.reload')}
        </button>
        {process.env.NODE_ENV === 'development' && error && (
          <pre className="mt-4 overflow-auto rounded bg-muted p-4 text-xs">{error.toString()}</pre>
        )}
      </div>
    </div>
  );
};

/**
 * Error boundary component that catches rendering errors and displays a fallback UI.
 * Prevents the entire app from crashing when a component throws an error.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details using environment-aware logger
    logger.error('ErrorBoundary caught an error:', error, errorInfo);

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
