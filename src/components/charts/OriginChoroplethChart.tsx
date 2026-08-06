// src/components/charts/OriginChoroplethChart.tsx
// World Origins on Bklit's ChoroplethChart: countries shaded by how many of
// their nationals live in Japan, on a log scale (the range spans four orders
// of magnitude, so a linear ramp would leave everything except China, Vietnam
// and Korea indistinguishable from zero).
//
// Features join on ISO 3166-1 numeric, never on the English name in the
// topology — the same rule GeographicDistributionChart follows for
// prefectures, and what keeps the join working in all twelve locales.
'use client';

import { useEffect, useMemo, useState } from 'react';

import type { FeatureCollection, Geometry } from 'geojson';
import type React from 'react';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';

import { nationalities } from '../../constants/nationalities';
import { useLocale } from '../../i18n/LocaleContext';
import { useNationalityLabel } from '../../i18n/useDomainLabels';
import { logger } from '../../utils/logger';
import { formatPeriod } from '../../utils/residentPeriod';
import { getAllPeriods, periodsForRange, selectResidents, totalsBy } from '../../utils/residentsSelectors';
import {
  ChoroplethChart,
  type ChoroplethFeature,
  ChoroplethFeatureComponent,
  type ChoroplethFeatureProperties,
  ChoroplethTooltip,
} from '../bklit/charts/choropleth';
import type { ResidentChartData } from '../common/ChartComponents';
import { LoadingSpinner } from '../common/LoadingSpinner';

/** Five steps of one hue, so the ramp reads as a single quantity. */
const SHADE_ALPHAS = [0.18, 0.34, 0.52, 0.72, 0.92];

/** e-Stat cat02 code, keyed by the ISO numeric the topology uses. */
const CODE_BY_ISO3N = new Map(
  nationalities
    .filter((nationality) => !nationality.isSubset && nationality.iso3n !== null)
    .map((nationality) => [String(nationality.iso3n).padStart(3, '0'), nationality.value])
);

/** Nationalities the 1:110m generalization has no polygon for. */
const NO_MAP_AREA = nationalities.filter(
  (nationality) => !nationality.isSubset && nationality.iso3n === null
).length;

const isoOf = (geoFeature: ChoroplethFeature): string => String(geoFeature.id ?? '').padStart(3, '0');

export const OriginChoroplethChart: React.FC<ResidentChartData> = ({ data, filters, range }) => {
  const { t, formatters } = useLocale();
  const nationalityLabel = useNationalityLabel();
  const [features, setFeatures] = useState<FeatureCollection<Geometry, ChoroplethFeatureProperties> | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/static/world.topo.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((topology: Topology) => {
        setFeatures(
          feature(topology, topology.objects.countries) as FeatureCollection<Geometry, ChoroplethFeatureProperties>
        );
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === 'AbortError') return;
        logger.error('Error loading world map data:', error);
        setLoadError(true);
      });
    return () => controller.abort();
  }, []);

  // Like the status mix, a snapshot rather than a sum: the range picks which
  // period is shaded, not how many are added together.
  const period = useMemo(() => periodsForRange(getAllPeriods(data), range).at(-1) ?? null, [data, range]);

  const { totals, max } = useMemo(() => {
    if (!period) return { totals: new Map<string, number>(), max: 0 };
    const byCode = totalsBy(selectResidents(data, { period, status: filters.status }), 'nationality');
    return { totals: byCode, max: Math.max(...byCode.values(), 0) };
  }, [data, filters.status, period]);

  // Log-scaled bins. `max` moves with the filter, so the ramp always uses its
  // full range rather than collapsing when a narrow status is selected.
  const shadeOf = useMemo(() => {
    const ceiling = Math.log10(max + 1);
    return (value: number) => {
      if (value <= 0 || ceiling <= 0) return null;
      const step = Math.min(SHADE_ALPHAS.length - 1, Math.floor((Math.log10(value + 1) / ceiling) * SHADE_ALPHAS.length));
      return SHADE_ALPHAS[step];
    };
  }, [max]);

  const valueOf = (geoFeature: ChoroplethFeature): { code?: string; value: number } => {
    const code = CODE_BY_ISO3N.get(isoOf(geoFeature));
    return { code, value: code ? (totals.get(code) ?? 0) : 0 };
  };

  if (loadError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        {t('map.loadError')}
      </div>
    );
  }

  if (!features) {
    return (
      <div className="map-container">
        <LoadingSpinner fullScreen={false} message={t('map.loading')} />
      </div>
    );
  }

  return (
    <div className="chart-card-content">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xxs text-muted-foreground">
        <span>{period && t('residents.asOf', { period: formatPeriod(period, formatters) })}</span>
        <span className="flex items-center gap-1.5">
          {t('residents.legendScale')}
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {SHADE_ALPHAS.map((alpha) => (
              <span
                key={alpha}
                className="size-2.5 rounded-[2px]"
                style={{ backgroundColor: `color-mix(in oklab, var(--chart-1) ${alpha * 100}%, transparent)` }}
              />
            ))}
          </span>
          {formatters.compactNumber(max)}
        </span>
      </div>
      <div role="img" aria-label={t('charts.worldmap.aria')}>
        <ChoroplethChart data={features} aspectRatio="16 / 9" zoomEnabled zoomMin={0.9} zoomMax={12}>
          <ChoroplethFeatureComponent
            getFeatureColor={(geoFeature) => {
              const alpha = shadeOf(valueOf(geoFeature).value);
              return alpha === null
                ? 'var(--muted)'
                : `color-mix(in oklab, var(--chart-1) ${alpha * 100}%, transparent)`;
            }}
            stroke="var(--card)"
            strokeWidth={0.4}
          />
          <ChoroplethTooltip
            content={({ feature: geoFeature }) => {
              const { code, value } = valueOf(geoFeature);
              // Falls back to the topology's own name for a country e-Stat
              // does not count (Greenland, Western Sahara, North Korea).
              const name = code ? nationalityLabel(code) : String(geoFeature.properties?.name ?? '');
              return (
                <div className="px-3 py-2.5 text-xs">
                  <div className="font-semibold">{name}</div>
                  <div className="mt-0.5 tabular-nums text-muted-foreground">
                    {code
                      ? `${t('residents.legendScale')}: ${formatters.number(value)}`
                      : t('common.noDataForFilters')}
                  </div>
                </div>
              );
            }}
          />
        </ChoroplethChart>
      </div>
      <p className="mt-1 text-xxs text-muted-foreground">{t('residents.noMapArea', { count: NO_MAP_AREA })}</p>
    </div>
  );
};
