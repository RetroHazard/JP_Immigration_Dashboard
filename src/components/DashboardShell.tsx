// src/components/DashboardShell.tsx
// The single responsive shell. Replaces the old always-both-mounted
// DesktopLayout/MobileLayout pair with one layout tree:
// - labeled chart tabs (real tablist semantics via Radix)
// - global filter bar with visible "not used by this view" explanations
// - the Processing Time Estimator as a permanent sidebar (desktop) or a
//   bottom sheet (mobile) sharing the same controlled state
// - chart tab, filters, and time range are all URL state (shareable links)
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { animate, stagger } from 'animejs';
import { Calculator, ChevronsLeft, History, Moon, Sun } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import buildInfo from '../buildInfo';
import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { useTheme } from '../contexts/ThemeContext';
import type { DashboardMeta, ImmigrationData } from '../hooks/useImmigrationData';
import { useLocale } from '../i18n/LocaleContext';
import { prefersReducedMotion, useAnimeScope } from '../lib/motion';
import { getBureauLabel } from '../utils/getBureauData';
import type { ChartRange } from '../utils/selectors';
import type { ApplicationDetails } from '../utils/urlApplicationDetails';
import { getApplicationDetailsFromParams, isEstimatorPermalink } from '../utils/urlApplicationDetails';
import { CHART_COMPONENTS, CHART_KEYS } from './common/ChartComponents';
import { PeriodSelector } from './common/PeriodSelector';
import { ActiveChart } from './ActiveChart';
import { ChangelogModal } from './ChangelogModal';
import { ChartDataTable } from './ChartDataTable';
import { EstimationCard } from './EstimationCard';
import { FilterPanel } from './FilterPanel';
import { StatsSummary } from './StatsSummary';

const BUREAU_VALUES = bureauOptions.map((option) => option.value);
const TYPE_VALUES = applicationOptions.map((option) => option.value);
const RANGE_VALUES: ChartRange[] = ['latest', '6', '12', '24', '36', 'all'];
const COMPARE_VALUES = bureauOptions.filter((option) => option.value !== 'all').map((option) => option.value);

interface DashboardShellProps {
  data: ImmigrationData[];
  meta: DashboardMeta | null;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ data, meta }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const searchParams = useSearchParams();

  // --- URL state (shareable): active chart, global filters, time range ---
  const [chartKey, setChartKey] = useQueryState(
    'chart',
    parseAsStringLiteral(CHART_KEYS).withDefault(CHART_KEYS[0])
  );
  const [bureau, setBureau] = useQueryState('bureau', parseAsStringLiteral(BUREAU_VALUES).withDefault('all'));
  const [type, setType] = useQueryState('type', parseAsStringLiteral(TYPE_VALUES).withDefault('all'));
  const [rangeParam, setRangeParam] = useQueryState('range', parseAsStringLiteral(RANGE_VALUES));
  const [compare, setCompare] = useQueryState('compare', parseAsStringLiteral(COMPARE_VALUES));

  const activeIndex = Math.max(
    0,
    CHART_COMPONENTS.findIndex((chart) => chart.key === chartKey)
  );
  const activeChart = CHART_COMPONENTS[activeIndex];

  // The single ?range= param applies to the active chart, clamped to what it offers.
  const range: ChartRange =
    rangeParam && activeChart.ranges.includes(rangeParam) ? rangeParam : activeChart.defaultRange;

  // Filters the active chart doesn't support are neutralized so the chart,
  // stat badges, and estimator always agree on what a filter value means.
  const effectiveFilters = useMemo(
    () => ({
      bureau: activeChart.filters.bureau ? bureau : 'all',
      type: activeChart.filters.appType ? type : 'all',
    }),
    [activeChart.filters.bureau, activeChart.filters.appType, bureau, type]
  );

  // Compare mode: a second bureau rendered as a small multiple below the
  // chart, on every view that supports the bureau filter.
  const compareBureau = activeChart.filters.bureau && compare && compare !== bureau ? compare : null;

  // --- Estimator state, lifted so the sidebar and the mobile sheet share it ---
  const [estimatorDetails, setEstimatorDetails] = useState<ApplicationDetails>(() =>
    getApplicationDetailsFromParams(searchParams)
  );
  // Auto-open the mobile sheet for estimator permalinks - but only below the
  // desktop breakpoint, where the sidebar isn't visible (the sheet's portal
  // is not constrained by its lg:hidden trigger bar).
  const [isEstimatorSheetOpen, setIsEstimatorSheetOpen] = useState(
    () =>
      isEstimatorPermalink(searchParams) &&
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1023px)').matches
  );
  // Desktop sidebar collapse, remembered across visits
  const [isEstimatorCollapsed, setIsEstimatorCollapsed] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem('estimator-collapsed') === '1'
  );
  const setEstimatorCollapsed = (collapsed: boolean) => {
    setIsEstimatorCollapsed(collapsed);
    window.localStorage.setItem('estimator-collapsed', collapsed ? '1' : '0');
  };
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  // One-time entrance: header cards cascade in.
  const motionRoot = useAnimeScope<HTMLDivElement>(() => {
    animate('[data-animate="card"]', {
      opacity: [0, 1],
      translateY: [14, 0],
      delay: stagger(70),
      duration: 550,
      ease: 'out(3)',
    });
  }, []);

  // Cross-fade the chart panel when switching tabs (not on first paint).
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (prefersReducedMotion()) return;
    const panel = motionRoot.current?.querySelector('[data-chart-panel]');
    if (!panel) return;
    const animation = animate(panel, { opacity: [0, 1], translateY: [10, 0], duration: 380, ease: 'out(2)' });
    return () => {
      animation.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartKey]);

  return (
    <div ref={motionRoot} className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50"
      >
        {t('app.skipToContent')}
      </a>

      <nav className="header-block">
        <div className="marginals">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground"
              >
                JP
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold leading-tight md:text-base">{t('app.title')}</h1>
                <p className="truncate text-xxs text-muted-foreground sm:text-xs">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div
                className="hidden overflow-hidden rounded-full border border-border text-xs sm:flex"
                role="group"
                aria-label="Language"
              >
                <button
                  onClick={() => setLocale('en')}
                  aria-pressed={locale === 'en'}
                  className={`px-2.5 py-1.5 transition-colors ${locale === 'en' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:bg-muted'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLocale('ja')}
                  aria-pressed={locale === 'ja'}
                  lang="ja"
                  className={`px-2.5 py-1.5 transition-colors ${locale === 'ja' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:bg-muted'}`}
                >
                  日本語
                </button>
              </div>
              <button
                onClick={() => setIsChangelogOpen(true)}
                className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-muted sm:flex"
              >
                <History className="size-3.5" aria-hidden="true" />
                v{buildInfo.buildVersion}
              </button>
              <button
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                className="flex size-9 items-center justify-center rounded-full border border-border text-secondary-foreground transition-colors hover:bg-muted"
              >
                <Sun className="size-4 dark:hidden" aria-hidden="true" />
                <Moon className="hidden size-4 dark:block" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="marginals w-full flex-1 py-6 md:py-8">
        <p className="sr-only" aria-live="polite">
          Showing {activeChart.label} for {getBureauLabel(effectiveFilters.bureau)}
          {effectiveFilters.type !== 'all'
            ? `, ${applicationOptions.find((option) => option.value === effectiveFilters.type)?.label ?? ''}`
            : ''}
        </p>
        <div className="mb-4" data-animate="card">
          <StatsSummary data={data} filters={effectiveFilters} />
        </div>
        <div
          className={`grid gap-4 transition-[grid-template-columns] duration-300 lg:items-start ${
            isEstimatorCollapsed ? 'lg:grid-cols-[minmax(0,1fr)_52px]' : 'lg:grid-cols-[minmax(0,1fr)_400px]'
          }`}
        >
          {/* Main column */}
          <div className="flex min-w-0 flex-col gap-4">
            <div data-animate="card">
            <FilterPanel
              data={data}
              filters={{ bureau, type }}
              onChange={(next) => {
                void setBureau(next.bureau);
                void setType(next.type);
              }}
              filterConfig={activeChart.filters}
              compare={compare}
              onCompareChange={(next) => void setCompare(next)}
            />
            </div>

            <Tabs value={activeChart.key} onValueChange={(key) => void setChartKey(key)}>
              <div className="overflow-x-auto pb-1">
                <TabsList className="w-max">
                  {CHART_COMPONENTS.map((chart) => (
                    <TabsTrigger key={chart.key} value={chart.key} className="gap-1.5">
                      <chart.icon className="size-4" aria-hidden="true" />
                      <span className="whitespace-nowrap">{chart.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {CHART_COMPONENTS.map((chart, index) => (
                <TabsContent key={chart.key} value={chart.key} className="mt-2">
                  <div className="base-container" data-chart-panel data-animate="card">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="section-title">{chart.label}</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">{chart.description}</p>
                      </div>
                      <PeriodSelector ranges={chart.ranges} value={range} onChange={(next) => void setRangeParam(next)} />
                    </div>
                    {index === activeIndex && (
                      <>
                        {compareBureau && (
                          <p className="mb-1 text-xs font-semibold text-secondary-foreground">
                            {getBureauLabel(effectiveFilters.bureau)}
                          </p>
                        )}
                        <ActiveChart
                          activeChartIndex={activeIndex}
                          data={data}
                          filters={effectiveFilters}
                          range={range}
                        />
                        {compareBureau && (
                          <div className="mt-4 border-t border-border pt-3">
                            <p className="mb-1 text-xs font-semibold text-secondary-foreground">
                              {getBureauLabel(compareBureau)} <span className="font-normal text-muted-foreground">(comparison)</span>
                            </p>
                            <ActiveChart
                              activeChartIndex={activeIndex}
                              data={data}
                              filters={{ bureau: compareBureau, type: effectiveFilters.type }}
                              range={range}
                            />
                          </div>
                        )}
                        <ChartDataTable data={data} filters={effectiveFilters} range={range} />
                      </>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

          </div>

          {/* Estimator: collapsible sidebar on desktop */}
          <aside className="sticky top-4 hidden lg:block" data-animate="card">
            {isEstimatorCollapsed ? (
              <button
                onClick={() => setEstimatorCollapsed(false)}
                aria-label="Expand the Processing Time Estimator"
                aria-expanded={false}
                className="flex w-full flex-col items-center gap-3 rounded-xl border border-border bg-card py-4 text-secondary-foreground shadow-soft transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronsLeft className="size-4" aria-hidden="true" />
                <Calculator className="size-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-semibold" style={{ writingMode: 'vertical-rl' }}>
                  Estimator
                </span>
              </button>
            ) : (
              <EstimationCard
                data={data}
                details={estimatorDetails}
                onDetailsChange={setEstimatorDetails}
                onCollapse={() => setEstimatorCollapsed(true)}
              />
            )}
          </aside>
        </div>
      </main>

      {/* Estimator: bottom sheet on mobile */}
      <div className="sticky bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <Sheet open={isEstimatorSheetOpen} onOpenChange={setIsEstimatorSheetOpen}>
          <SheetTrigger asChild>
            <Button className="w-full gap-2" size="lg">
              <Calculator className="size-4" aria-hidden="true" />
              Processing Time Estimator
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Processing Time Estimator</SheetTitle>
            </SheetHeader>
            <EstimationCard data={data} details={estimatorDetails} onDetailsChange={setEstimatorDetails} />
          </SheetContent>
        </Sheet>
      </div>

      <footer className="footer-block mt-auto">
        <div className="marginals">
          <div className="footer-text">
            {t('footer.attribution')}
            <br />
            Data acquisition provided by{' '}
            <a href="https://www.e-stat.go.jp/" target="_blank" rel="noreferrer" className="hyperlink">
              e-Stat
            </a>
            {meta?.source === 'fixture' && ' · showing generated fixture data'}
          </div>
          <div className="footer-text-small">
            Built by{' '}
            <a href="https://github.com/RetroHazard" className="hyperlink" target="_blank" rel="noreferrer">
              RetroHazard
            </a>{' '}
            · data updated{' '}
            {new Date(buildInfo.buildDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </footer>

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
    </div>
  );
};
