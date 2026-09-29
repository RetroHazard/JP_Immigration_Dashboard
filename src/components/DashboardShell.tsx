// One responsive layout tree: chart tabs, the global filter bar, and the estimator as a desktop
// sidebar or mobile bottom sheet sharing one controlled state. Chart, filters, and time range
// live in the URL so views are shareable.
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { animate, stagger } from 'animejs';
import { Calculator, ChevronsLeft, ExternalLink, History, Menu, Moon, Sun } from 'lucide-react';
import { createParser, parseAsBoolean, parseAsStringLiteral, useQueryState } from 'nuqs';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import buildInfo from '../buildInfo';
import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { nationalities, NATIONALITY_REGIONS, nationalityByCode } from '../constants/nationalities';
import { POLICY_EVENTS } from '../constants/policyEvents';
import { useTheme } from '../contexts/ThemeContext';
import type { DashboardMeta, ImmigrationData } from '../hooks/useImmigrationData';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useLocale } from '../i18n/LocaleContext';
import { T } from '../i18n/T';
import {
  useApplicationType,
  useBureauLabel,
  useChartRegistry,
  useDatasetLabel,
  useNationalityLabel,
  useStatusGroupLabel,
} from '../i18n/useDomainLabels';
import { prefersReducedMotion, useAnimeScope } from '../lib/motion';
import { excludeAirportData } from '../utils/excludeAirportData';
import { AIRPORT_BUREAU_CODES } from '../utils/getBureauData';
import { formatPeriod } from '../utils/residentPeriod';
import type { ResidentRecord } from '../utils/residentsData';
import type { ResidentRange } from '../utils/residentsSelectors';
import { getAllPeriods } from '../utils/residentsSelectors';
import { parsePeriodParam, parseStatusParam } from '../utils/residentUrlParams';
import { type ChartRange, getAllMonths, monthsForRange } from '../utils/selectors';
import type { ApplicationDetails } from '../utils/urlApplicationDetails';
import { getApplicationDetailsFromParams, isEstimatorPermalink } from '../utils/urlApplicationDetails';
import type { Dataset } from './common/ChartComponents';
import { CHART_KEYS, CHARTS_BY_DATASET, datasetForChart,DATASETS } from './common/ChartComponents';
import { LanguageSwitcher } from './common/LanguageSwitcher';
import { PeriodSelector } from './common/PeriodSelector';
import { PolicyEventList } from './common/PolicyEventList';
import { SnapshotPeriodSelector } from './common/SnapshotPeriodSelector';
import { GitHubIcon } from './icons/GitHubIcon';
import { JapanFlagIcon } from './icons/JapanFlagIcon';
import { ActiveChart } from './ActiveChart';
import { ChangelogModal } from './ChangelogModal';
import { ChartDataTable } from './ChartDataTable';
import { EstimationCard } from './EstimationCard';
import { FilterPanel } from './FilterPanel';
import { ResidentFilterPanel } from './ResidentFilterPanel';
import { ResidentsStatsSummary } from './ResidentsStatsSummary';
import { StatsSummary } from './StatsSummary';

const REPO_URL = 'https://github.com/RetroHazard/JP_Immigration_Dashboard';

const BUREAU_VALUES = bureauOptions.map((option) => option.value);
const TYPE_VALUES = applicationOptions.map((option) => option.value);
const RANGE_VALUES = ['latest', '6', '12', '24', '36', 'all', '3y', '5y', '10y'] as const;
const NATIONALITY_VALUES = ['all', ...nationalities.map((nationality) => nationality.value)];
const REGION_VALUES = ['all', ...NATIONALITY_REGIONS];
const COMPARE_VALUES = bureauOptions.filter((option) => option.value !== 'all').map((option) => option.value);

// ?status carries a status category; the parser also accepts an individual
// status code (from older links) and resolves it to its category. ?period
// names the snapshot the stock views draw.
const statusGroupParser = createParser({
  parse: parseStatusParam,
  serialize: (value: string) => value,
});
const periodParser = createParser({
  parse: parsePeriodParam,
  serialize: (value: string) => value,
});

interface DashboardShellProps {
  data: ImmigrationData[];
  meta: DashboardMeta | null;
  /** null when the residents file failed to load — the switcher stays disabled */
  residents: ResidentRecord[] | null;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ data, meta, residents }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, formatters } = useLocale();
  const bureauLabel = useBureauLabel();
  const applicationType = useApplicationType();
  const datasetLabel = useDatasetLabel();
  const nationalityLabel = useNationalityLabel();
  const statusGroupLabel = useStatusGroupLabel();
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
  const [region, setRegion] = useQueryState('region', parseAsStringLiteral(REGION_VALUES).withDefault('all'));
  const [nationality, setNationality] = useQueryState(
    'nationality',
    parseAsStringLiteral(NATIONALITY_VALUES).withDefault('all')
  );
  const [statusGroup, setStatusGroup] = useQueryState('status', statusGroupParser.withDefault('all'));
  // The as-of snapshot for the stock views; null = latest period.
  const [periodParam, setPeriodParam] = useQueryState('period', periodParser);

  // The dataset is derived from ?chart=, not a param of its own: chart keys are
  // unique across both registries, so the dataset and chart can never disagree.
  const residentsAvailable = residents !== null && residents.length > 0;
  const requestedDataset = datasetForChart(chartKey);
  const dataset: Dataset = requestedDataset === 'residents' && !residentsAvailable ? 'processing' : requestedDataset;
  const charts = useChartRegistry(dataset);
  // Airport toggle: when off, the airport branch offices drop out of every
  // chart, stat, and cube-backed table (see chartData). The estimator keeps the
  // full dataset.
  const [includeAirports, setIncludeAirports] = useQueryState('airports', parseAsBoolean.withDefault(true));

  const activeIndex = Math.max(
    0,
    charts.findIndex((chart) => chart.key === chartKey)
  );
  const activeChart = charts[activeIndex];

  // ?range= applies to the active chart, clamped to the ranges it offers. The
  // datasets' range vocabularies are disjoint ('12' months vs '5y'), so a value
  // from the other dataset falls back to this chart's default.
  const range: ChartRange | ResidentRange = (
    activeChart.ranges as readonly string[]
  ).includes(rangeParam ?? '')
    ? (rangeParam as ChartRange | ResidentRange)
    : activeChart.defaultRange;

  // Filters the active chart doesn't support are neutralized so the chart, its
  // data table, and the stat badges agree. The table caption and CSV filename
  // use these values too (utils/chartTables.ts), so an ignored filter never
  // names a download. An airport bureau is also neutralized while airports are
  // excluded (a hand-edited URL can pair them).
  const processingFilterConfig =
    activeChart.dataset === 'processing' ? activeChart.filters : { bureau: false, appType: false };
  const residentFilterConfig =
    activeChart.dataset === 'residents'
      ? activeChart.filters
      : { region: false, nationality: false, group: false };

  const effectiveFilters = useMemo(
    () => ({
      bureau:
        processingFilterConfig.bureau && (includeAirports || !AIRPORT_BUREAU_CODES.has(bureau)) ? bureau : 'all',
      type: processingFilterConfig.appType ? type : 'all',
    }),
    [processingFilterConfig.bureau, processingFilterConfig.appType, bureau, type, includeAirports]
  );

  const effectiveResidentFilters = useMemo(() => {
    const effectiveRegion = residentFilterConfig.region ? region : 'all';
    // Region wins when the two disagree: the panel clears nationality on a
    // region change, but a hand-edited URL can pair ?region=2000 with a Chinese
    // nationality, which would empty every chart.
    const inRegion =
      effectiveRegion === 'all' || nationality === 'all' || nationalityByCode(nationality)?.region === effectiveRegion;
    return {
      region: effectiveRegion,
      nationality: residentFilterConfig.nationality && inRegion ? nationality : 'all',
      group: residentFilterConfig.group ? statusGroup : 'all',
    };
  }, [residentFilterConfig.region, residentFilterConfig.nationality, residentFilterConfig.group, region, nationality, statusGroup]);

  // The snapshot the stock views draw. Sticky across the snapshot tabs, but
  // never leaks into the range charts.
  const effectivePeriod =
    activeChart.dataset === 'residents' && activeChart.timeControl === 'snapshot' ? periodParam : null;

  // Stable identity: `residents ?? []` would be a new array every render,
  // invalidating every memo keyed on it (and ActiveChart's memo comparison).
  const residentsData = useMemo(() => residents ?? [], [residents]);

  // Options for the snapshot picker: every published half-year, newest first.
  const residentPeriodsNewestFirst = useMemo(() => getAllPeriods(residentsData).reverse(), [residentsData]);

  // Airport offices are removed as rows and subtracted from the nationwide
  // aggregate, so totals reflect only the visible bureaus (parents already
  // exclude their branches via the build-time deaggregation). The Regional
  // Map's table is reference geography, not a slice of the cube, so this never
  // reaches it.
  const chartData = useMemo(() => (includeAirports ? data : excludeAirportData(data)), [data, includeAirports]);

  // Data coverage, shown beside the period selector.
  const coverage = useMemo(() => {
    if (dataset === 'residents') {
      const periods = getAllPeriods(residentsData);
      if (periods.length === 0) return null;
      return t('dashboard.coverageRange', {
        from: formatPeriod(periods[0], formatters),
        to: formatPeriod(periods[periods.length - 1], formatters),
      });
    }
    if (data.length === 0) return null;
    const months = [...new Set(data.map((entry) => entry.month))].sort();
    const fmt = (month: string) => {
      const [year, monthNum] = month.split('-');
      return formatters.monthYear(new Date(Number(year), Number(monthNum) - 1));
    };
    return t('dashboard.coverageRange', { from: fmt(months[0]), to: fmt(months[months.length - 1]) });
  }, [data, dataset, residentsData, t, formatters]);

  // Compare mode: a second bureau as a side-by-side small multiple, on views
  // that opt in via the registry (the treemap, sankey, and bubble plot already
  // show every bureau).
  const compareEnabled = activeChart.dataset === 'processing' && activeChart.filters.bureau && activeChart.compare;
  const compareBureau =
    compareEnabled && compare && compare !== bureau && (includeAirports || !AIRPORT_BUREAU_CODES.has(compare))
      ? compare
      : null;

  // Both panes plot to one count axis so bar heights and line positions can be
  // read across. The pane pair is only on screen from md up (Tailwind's 768px);
  // below that the primary chart is alone and keeps its own scale.
  const sideBySide = useMediaQuery('(min-width: 768px)');
  const sharedYMax = useMemo(() => {
    if (!compareBureau || !sideBySide || activeChart.dataset !== 'processing' || !activeChart.axisMax) return undefined;
    const { axisMax } = activeChart;
    const rangeArg = range as ChartRange;
    const max = Math.max(
      axisMax(chartData, effectiveFilters, rangeArg),
      axisMax(chartData, { bureau: compareBureau, type: effectiveFilters.type }, rangeArg)
    );
    return max > 0 ? max : undefined;
  }, [compareBureau, sideBySide, activeChart, chartData, effectiveFilters, range]);

  // The events on the plot for the shared list; same rule the chart applies.
  const compareEvents = useMemo(() => {
    const periods = new Set(monthsForRange(getAllMonths(chartData), range as ChartRange));
    return POLICY_EVENTS.filter((event) => periods.has(event.period));
  }, [chartData, range]);

  // --- Estimator state, lifted so the sidebar and the mobile sheet share it ---
  const [estimatorDetails, setEstimatorDetails] = useState<ApplicationDetails>(() =>
    getApplicationDetailsFromParams(searchParams)
  );
  // Auto-open the mobile sheet for estimator permalinks, but only below the
  // desktop breakpoint (the sheet's portal ignores its lg:hidden trigger bar).
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
  // controls collapse into it.
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
              {/* The same hinomaru as the favicon and PWA icons. */}
              <JapanFlagIcon className="h-6 w-9 shrink-0" />
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold leading-tight md:text-base">{t('app.title')}</h1>
                <p className="truncate text-xxs text-muted-foreground sm:text-xs">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {/* Renders nothing while LOCALE_SWITCHER_ENABLED (src/i18n/config.ts) is false. */}
              <LanguageSwitcher />
              <button
                onClick={() => setIsChangelogOpen(true)}
                className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-muted sm:flex"
              >
                <History className="size-3.5" aria-hidden="true" />
                {t('nav.version', { version: buildInfo.buildVersion })}
              </button>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={t('nav.sourceCode')}
                className="hidden size-9 items-center justify-center rounded-full border border-border text-secondary-foreground transition-colors hover:bg-muted sm:flex"
              >
                <GitHubIcon className="size-4" />
              </a>
              <button
                onClick={toggleTheme}
                aria-label={t(isDarkMode ? 'nav.switchToLightTheme' : 'nav.switchToDarkTheme')}
                className="hidden size-9 items-center justify-center rounded-full border border-border text-secondary-foreground transition-colors hover:bg-muted sm:flex"
              >
                <Sun className="size-4 dark:hidden" aria-hidden="true" />
                <Moon className="hidden size-4 dark:block" aria-hidden="true" />
              </button>

              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label={t('nav.openSettings')}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-secondary-foreground transition-colors hover:bg-muted sm:hidden"
                  >
                    <Menu className="size-4" aria-hidden="true" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 gap-0 p-0">
                  <SheetHeader className="border-b border-border">
                    <SheetTitle className="text-sm">{t('nav.settings')}</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 overflow-y-auto p-4">
                    <LanguageSwitcher variant="popover" trigger="row" />
                    <section aria-label={t('nav.theme')}>
                      <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('nav.theme')}
                      </h3>
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
                          {t('nav.themeLight')}
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
                          {t('nav.themeDark')}
                        </button>
                      </div>
                    </section>
                    <section aria-label={t('nav.about')}>
                      <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('nav.about')}
                      </h3>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsChangelogOpen(true);
                        }}
                        className="mt-2 flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-2">
                          <History className="size-4" aria-hidden="true" />
                          {t('nav.changelog')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t('nav.version', { version: buildInfo.buildVersion })}
                        </span>
                      </button>
                      <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setIsMenuOpen(false)}
                        className="mt-2 flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-2">
                          <GitHubIcon className="size-4" />
                          {t('nav.sourceCode')}
                        </span>
                        <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      </a>
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
          {dataset === 'residents'
            ? t('a11y.showingChart', {
                chart: activeChart.label,
                bureau: t('residents.scope', {
                  nationality:
                    effectiveResidentFilters.nationality === 'all'
                      ? t('filters.allNationalities')
                      : nationalityLabel(effectiveResidentFilters.nationality),
                  status:
                    effectiveResidentFilters.group === 'all'
                      ? t('filters.allStatuses')
                      : statusGroupLabel(effectiveResidentFilters.group),
                }),
              })
            : effectiveFilters.type === 'all'
            ? t('a11y.showingChart', {
                chart: activeChart.label,
                bureau: bureauLabel(effectiveFilters.bureau),
              })
            : t('a11y.showingChartWithType', {
                chart: activeChart.label,
                bureau: bureauLabel(effectiveFilters.bureau),
                type: applicationType(effectiveFilters.type)?.label ?? '',
              })}
        </p>
        <div className="mb-4" data-animate="card">
          {dataset === 'residents' ? (
            <ResidentsStatsSummary data={residentsData} filters={effectiveResidentFilters} />
          ) : (
            <StatsSummary data={chartData} filters={effectiveFilters} />
          )}
        </div>
        <div
          className={`grid gap-4 transition-[grid-template-columns] duration-300 lg:items-start ${
            dataset === 'residents'
              ? // The estimator models bureau throughput, which this dataset
                // lacks, so the sidebar column collapses away.
                'lg:grid-cols-[minmax(0,1fr)]'
              : isEstimatorCollapsed
                ? 'lg:grid-cols-[minmax(0,1fr)_64px]'
                : // Narrower sidebar at lg: the main column is at its most cramped
                  // right where the sidebar first engages
                  'lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'
          }`}
        >
          <div className="flex min-w-0 flex-col gap-4">
            <div data-animate="card">
            {dataset === 'residents' ? (
            <ResidentFilterPanel
              filters={{ region, nationality, group: statusGroup }}
              onChange={(next) => {
                // null clears a param back to its 'all' default, keeping URLs clean.
                void setRegion(next.region === 'all' ? null : next.region);
                void setNationality(next.nationality === 'all' ? null : next.nationality);
                void setStatusGroup(next.group === 'all' ? null : next.group);
              }}
              filterConfig={residentFilterConfig}
              onReset={() => {
                void setRegion(null);
                void setNationality(null);
                void setStatusGroup(null);
                // ?period stays: the snapshot picker is a view control, not a filter.
              }}
            />
            ) : (
            <FilterPanel
              filters={{ bureau, type }}
              onChange={(next) => {
                void setBureau(next.bureau);
                void setType(next.type);
              }}
              filterConfig={processingFilterConfig}
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
            )}
            </div>

            {/* Dataset switcher. Selecting a dataset jumps to its first chart,
                since the dataset is derived from ?chart=. */}
            <div className="flex items-center gap-1" role="group" aria-label={t('dataset.aria')}>
              {DATASETS.map((option) => {
                const disabled = option === 'residents' && !residentsAvailable;
                return (
                  <button
                    key={option}
                    onClick={() => void setChartKey(CHARTS_BY_DATASET[option][0].key)}
                    disabled={disabled}
                    aria-pressed={dataset === option}
                    title={disabled ? t('dataset.residentsUnavailable') : datasetLabel(option)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      dataset === option
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : 'border border-border text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="hidden sm:inline">{datasetLabel(option)}</span>
                    <span className="sm:hidden">{datasetLabel(option, true)}</span>
                  </button>
                );
              })}
            </div>

            <Tabs value={activeChart.key} onValueChange={(key) => void setChartKey(key)}>
              {/* No horizontal scrolling: inactive tabs collapse to icons
                  (title/sr-only keep the names) and only the active tab shows
                  its label, except below sm, where the card title carries it */}
              <TabsList className="max-sm:w-full sm:w-max">
                {charts.map((chart) => (
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
              {charts.map((chart, index) => (
                <TabsContent key={chart.key} value={chart.key} className="mt-2">
                  <div className="base-container" data-chart-panel data-animate="card">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="section-title">{chart.label}</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">{chart.description}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {chart.dataset === 'residents' && chart.timeControl === 'snapshot' ? (
                          <SnapshotPeriodSelector
                            periods={residentPeriodsNewestFirst}
                            value={periodParam}
                            onChange={(next) => void setPeriodParam(next)}
                          />
                        ) : (
                          <PeriodSelector
                            ranges={chart.ranges}
                            value={range}
                            onChange={(next) => void setRangeParam(next)}
                          />
                        )}
                        {coverage && (
                          <span className="whitespace-nowrap text-xxs text-muted-foreground">
                            {t('dashboard.dataCoverage', { range: coverage })}
                          </span>
                        )}
                      </div>
                    </div>
                    {index === activeIndex && (
                      <>
                        <div className={compareBureau ? 'grid gap-x-4 gap-y-4 md:grid-cols-2' : undefined}>
                          <div className="min-w-0">
                            {compareBureau && (
                              <p className="mb-1 hidden text-xs font-semibold text-secondary-foreground md:block">
                                {bureauLabel(effectiveFilters.bureau)}
                              </p>
                            )}
                            <ActiveChart
                              chart={activeChart}
                              processingData={chartData}
                              residentsData={residentsData}
                              filters={effectiveFilters}
                              residentFilters={effectiveResidentFilters}
                              range={range}
                              period={effectivePeriod}
                              yMax={sharedYMax}
                              hidePolicyList={Boolean(compareBureau)}
                            />
                          </div>
                          {/* The comparison pane follows its control: both are
                              hidden below md, where a side-by-side has no room */}
                          {compareBureau && (
                            <div className="hidden min-w-0 md:block md:border-l md:border-border md:pl-4">
                              <p className="mb-1 text-xs font-semibold text-secondary-foreground">
                                {bureauLabel(compareBureau)}{' '}
                                <span className="font-normal text-muted-foreground">
                                  {t('dashboard.comparisonSuffix')}
                                </span>
                              </p>
                              <ActiveChart
                                chart={activeChart}
                                processingData={chartData}
                                residentsData={residentsData}
                                filters={{ bureau: compareBureau, type: effectiveFilters.type }}
                                residentFilters={effectiveResidentFilters}
                                range={range}
                                period={effectivePeriod}
                                yMax={sharedYMax}
                                hidePolicyList
                              />
                            </div>
                          )}
                        </div>
                        {/* Policy events are national — the same for every bureau —
                            so compare mode lists them once, full width, rather
                            than once per pane. */}
                        {compareBureau && activeChart.dataset === 'processing' && activeChart.policyEvents && (
                          <PolicyEventList events={compareEvents} />
                        )}
                        {/* Narrowed on activeChart, not `dataset`, so TypeScript
                            can reach `table` on the processing half of the
                            registry union. One table per bureau when comparing,
                            so each keeps its own CSV download. */}
                        {activeChart.dataset === 'processing' && (
                          <div className={compareBureau ? 'grid gap-x-4 md:grid-cols-2' : undefined}>
                            <div className="min-w-0">
                              <ChartDataTable
                                table={activeChart.table}
                                chartKey={activeChart.key}
                                data={chartData}
                                filters={effectiveFilters}
                                range={range as ChartRange}
                                label={compareBureau ? bureauLabel(effectiveFilters.bureau) : undefined}
                              />
                            </div>
                            {compareBureau && (
                              <div className="hidden min-w-0 md:block">
                                <ChartDataTable
                                  table={activeChart.table}
                                  chartKey={activeChart.key}
                                  data={chartData}
                                  filters={{ bureau: compareBureau, type: effectiveFilters.type }}
                                  range={range as ChartRange}
                                  label={bureauLabel(compareBureau)}
                                />
                              </div>
                            )}
                          </div>
                        )}
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
            className={`hidden ${dataset === 'residents' ? '' : 'lg:block'} ${
              isEstimatorCollapsed ? 'self-stretch' : 'sticky top-4'
            }`}
            data-animate="card"
          >
            {isEstimatorCollapsed ? (
              <button
                onClick={() => setEstimatorCollapsed(false)}
                aria-label={t('dashboard.expandEstimator')}
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
                  {t('dashboard.estimatorRail')}
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

      {/* Estimator: bottom sheet on mobile, hidden on the residents dataset
          like the sidebar. */}
      <div
        className={`sticky bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden ${
          dataset === 'residents' ? 'hidden' : ''
        }`}
      >
        <Sheet open={isEstimatorSheetOpen} onOpenChange={setIsEstimatorSheetOpen}>
          <SheetTrigger asChild>
            <Button className="w-full gap-2" size="lg">
              <Calculator className="size-4" aria-hidden="true" />
              {t('estimator.title')}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{t('estimator.title')}</SheetTitle>
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
            {/* One catalogue entry with <T> substituting the anchor, so
                translators can reorder the sentence around the link. */}
            <T
              k="footer.dataAcquisition"
              values={{
                source: (
                  <a href="https://www.e-stat.go.jp/" target="_blank" rel="noreferrer" className="hyperlink">
                    e-Stat
                  </a>
                ),
              }}
            />
            {meta?.source === 'fixture' && ` · ${t('footer.fixtureNotice')}`}
          </div>
          <div className="footer-text-small">
            <T
              k="footer.builtBy"
              values={{
                author: (
                  <a href="https://github.com/RetroHazard" className="hyperlink" target="_blank" rel="noreferrer">
                    RetroHazard
                  </a>
                ),
              }}
            />{' '}
            ·{' '}
            {t('footer.dataUpdated', {
              date: formatters.longDate(new Date(buildInfo.buildDate)),
            })}
          </div>
        </div>
      </footer>

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
    </div>
  );
};
