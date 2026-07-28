// src/components/DashboardShell.tsx
// The single responsive shell. Replaces the old always-both-mounted
// DesktopLayout/MobileLayout pair with one layout tree:
// - icon chart tabs, the active one expanding its label (real tablist semantics via Radix)
// - global filter bar with visible "not used by this view" explanations
// - the Processing Time Estimator as a permanent sidebar (desktop) or a
//   bottom sheet (mobile) sharing the same controlled state
// - chart tab, filters, and time range are all URL state (shareable links)
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { animate, stagger } from 'animejs';
import { Calculator, Check, ChevronsLeft, History, Menu, Moon, Sun } from 'lucide-react';
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from 'nuqs';
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
import { excludeAirportData } from '../utils/excludeAirportData';
import { AIRPORT_BUREAU_CODES, getBureauLabel } from '../utils/getBureauData';
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
  // Global airport toggle: when off, the airport branch offices drop out of
  // every chart, stat, and table (the estimator keeps the full dataset).
  const [includeAirports, setIncludeAirports] = useQueryState('airports', parseAsBoolean.withDefault(true));

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
  // An airport bureau selection is likewise neutralized while airports are
  // excluded (hand-edited URLs can still produce that combination).
  const effectiveFilters = useMemo(
    () => ({
      bureau:
        activeChart.filters.bureau && (includeAirports || !AIRPORT_BUREAU_CODES.has(bureau)) ? bureau : 'all',
      type: activeChart.filters.appType ? type : 'all',
    }),
    [activeChart.filters.bureau, activeChart.filters.appType, bureau, type, includeAirports]
  );

  // What the charts, stats, and data table see; the airport branch offices
  // are removed as rows AND subtracted from the nationwide aggregate, so
  // totals reflect only the visible bureaus (parents already exclude their
  // branches via the build-time deaggregation).
  const chartData = useMemo(() => (includeAirports ? data : excludeAirportData(data)), [data, includeAirports]);

  // Data coverage, shown beside the period selector (moved out of the
  // filter card to keep it a single row).
  const coverage = useMemo(() => {
    if (data.length === 0) return null;
    const months = [...new Set(data.map((entry) => entry.month))].sort();
    const fmt = (month: string) => {
      const [year, monthNum] = month.split('-');
      return new Date(Number(year), Number(monthNum) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    };
    return `${fmt(months[0])} – ${fmt(months[months.length - 1])}`;
  }, [data]);

  // Compare mode: a second bureau rendered as a side-by-side small multiple,
  // on views that opt in via the registry (single-view charts like the
  // treemap, sankey, and bubble plot already show every bureau at once).
  const compareEnabled = activeChart.filters.bureau && activeChart.compare;
  const compareBureau =
    compareEnabled && compare && compare !== bureau && (includeAirports || !AIRPORT_BUREAU_CODES.has(compare))
      ? compare
      : null;

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
  // Mobile settings drawer: below sm the language, theme, and changelog
  // controls collapse into it rather than vanishing.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                className="hidden size-9 items-center justify-center rounded-full border border-border text-secondary-foreground transition-colors hover:bg-muted sm:flex"
              >
                <Sun className="size-4 dark:hidden" aria-hidden="true" />
                <Moon className="hidden size-4 dark:block" aria-hidden="true" />
              </button>

              {/* Mobile: the controls above collapse into a settings drawer */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label="Open the settings menu"
                    className="flex size-9 items-center justify-center rounded-full border border-border text-secondary-foreground transition-colors hover:bg-muted sm:hidden"
                  >
                    <Menu className="size-4" aria-hidden="true" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 gap-0 p-0">
                  <SheetHeader className="border-b border-border">
                    <SheetTitle className="text-sm">Settings</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 overflow-y-auto p-4">
                    <section aria-label="Language">
                      <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
                        Language
                      </h3>
                      <div className="mt-2 grid gap-1.5">
                        {(
                          [
                            { code: 'en', label: 'English' },
                            { code: 'ja', label: '日本語' },
                          ] as const
                        ).map((language) => (
                          <button
                            key={language.code}
                            onClick={() => setLocale(language.code)}
                            aria-pressed={locale === language.code}
                            lang={language.code}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                              locale === language.code
                                ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                                : 'border-border text-secondary-foreground hover:bg-muted'
                            }`}
                          >
                            {language.label}
                            {locale === language.code && <Check className="size-4" aria-hidden="true" />}
                          </button>
                        ))}
                      </div>
                    </section>
                    <section aria-label="Theme">
                      <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">Theme</h3>
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => isDarkMode && toggleTheme()}
                          aria-pressed={!isDarkMode}
                          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            !isDarkMode
                              ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                              : 'border-border text-secondary-foreground hover:bg-muted'
                          }`}
                        >
                          <Sun className="size-4" aria-hidden="true" />
                          Light
                        </button>
                        <button
                          onClick={() => !isDarkMode && toggleTheme()}
                          aria-pressed={isDarkMode}
                          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            isDarkMode
                              ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                              : 'border-border text-secondary-foreground hover:bg-muted'
                          }`}
                        >
                          <Moon className="size-4" aria-hidden="true" />
                          Dark
                        </button>
                      </div>
                    </section>
                    <section aria-label="About">
                      <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsChangelogOpen(true);
                        }}
                        className="mt-2 flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-2">
                          <History className="size-4" aria-hidden="true" />
                          Changelog
                        </span>
                        <span className="text-xs text-muted-foreground">v{buildInfo.buildVersion}</span>
                      </button>
                    </section>
                  </div>
                </SheetContent>
              </Sheet>
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
          <StatsSummary data={chartData} filters={effectiveFilters} />
        </div>
        <div
          className={`grid gap-4 transition-[grid-template-columns] duration-300 lg:items-start ${
            isEstimatorCollapsed
              ? 'lg:grid-cols-[minmax(0,1fr)_64px]'
              : // Narrower sidebar at lg: the main column is at its most cramped
                // right where the sidebar first engages
                'lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'
          }`}
        >
          {/* Main column */}
          <div className="flex min-w-0 flex-col gap-4">
            <div data-animate="card">
            <FilterPanel
              filters={{ bureau, type }}
              onChange={(next) => {
                void setBureau(next.bureau);
                void setType(next.type);
              }}
              filterConfig={activeChart.filters}
              compare={compare}
              compareEnabled={compareEnabled}
              onCompareChange={(next) => void setCompare(next)}
              includeAirports={includeAirports}
              onAirportsChange={(include) => {
                // null clears the param back to its default (included)
                void setIncludeAirports(include ? null : false);
                if (!include) {
                  if (AIRPORT_BUREAU_CODES.has(bureau)) void setBureau(null);
                  if (compare && AIRPORT_BUREAU_CODES.has(compare)) void setCompare(null);
                }
              }}
              onReset={() => {
                void setBureau(null);
                void setType(null);
                void setCompare(null);
                void setIncludeAirports(null);
              }}
            />
            </div>

            <Tabs value={activeChart.key} onValueChange={(key) => void setChartKey(key)}>
              {/* No horizontal scrolling at any width: inactive tabs collapse to
                  their icons (title/sr-only keep the names), and only the active
                  tab expands its label — hidden entirely below sm, where the
                  chart card's own title carries the name */}
              <TabsList className="max-sm:w-full sm:w-max">
                {CHART_COMPONENTS.map((chart) => (
                  <TabsTrigger key={chart.key} value={chart.key} className="group gap-0" title={chart.label}>
                    <chart.icon className="size-4" aria-hidden="true" />
                    <span className="sr-only">{chart.label}</span>
                    <span
                      aria-hidden="true"
                      className="hidden max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,padding] duration-300 group-data-[state=active]:max-w-44 group-data-[state=active]:pl-1.5 group-data-[state=active]:opacity-100 sm:block"
                    >
                      {chart.label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {CHART_COMPONENTS.map((chart, index) => (
                <TabsContent key={chart.key} value={chart.key} className="mt-2">
                  <div className="base-container" data-chart-panel data-animate="card">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="section-title">{chart.label}</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">{chart.description}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <PeriodSelector
                          ranges={chart.ranges}
                          value={range}
                          onChange={(next) => void setRangeParam(next)}
                        />
                        {coverage && (
                          <span className="whitespace-nowrap text-xxs text-muted-foreground">Data: {coverage}</span>
                        )}
                      </div>
                    </div>
                    {index === activeIndex && (
                      <>
                        <div className={compareBureau ? 'grid gap-x-4 gap-y-4 md:grid-cols-2' : undefined}>
                          <div className="min-w-0">
                            {compareBureau && (
                              <p className="mb-1 hidden text-xs font-semibold text-secondary-foreground md:block">
                                {getBureauLabel(effectiveFilters.bureau)}
                              </p>
                            )}
                            <ActiveChart
                              activeChartIndex={activeIndex}
                              data={chartData}
                              filters={effectiveFilters}
                              range={range}
                            />
                          </div>
                          {/* The comparison pane follows its control: both are
                              hidden below md, where a side-by-side has no room */}
                          {compareBureau && (
                            <div className="hidden min-w-0 md:block md:border-l md:border-border md:pl-4">
                              <p className="mb-1 text-xs font-semibold text-secondary-foreground">
                                {getBureauLabel(compareBureau)} <span className="font-normal text-muted-foreground">(comparison)</span>
                              </p>
                              <ActiveChart
                                activeChartIndex={activeIndex}
                                data={chartData}
                                filters={{ bureau: compareBureau, type: effectiveFilters.type }}
                                range={range}
                              />
                            </div>
                          )}
                        </div>
                        <ChartDataTable data={chartData} filters={effectiveFilters} range={range} />
                      </>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

          </div>

          {/* Estimator: collapsible sidebar on desktop. Collapsed, the rail
              stretches to the bottom of the main column (self-stretch beats
              the grid's items-start) so it lines up with the chart card. */}
          <aside
            className={`hidden lg:block ${isEstimatorCollapsed ? 'self-stretch' : 'sticky top-4'}`}
            data-animate="card"
          >
            {isEstimatorCollapsed ? (
              <button
                onClick={() => setEstimatorCollapsed(false)}
                aria-label="Expand the Processing Time Estimator"
                aria-expanded={false}
                className="group flex h-full w-full flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 py-4 text-primary shadow-soft transition-colors hover:border-primary/50 hover:bg-primary/10"
              >
                <ChevronsLeft
                  className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
                  <Calculator className="size-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold tracking-wide" style={{ writingMode: 'vertical-rl' }}>
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
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Processing Time Estimator</SheetTitle>
            </SheetHeader>
            <EstimationCard
              data={data}
              details={estimatorDetails}
              onDetailsChange={setEstimatorDetails}
              onClose={() => setIsEstimatorSheetOpen(false)}
            />
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
