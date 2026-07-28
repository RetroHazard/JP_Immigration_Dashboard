// src/components/charts/GeographicDistributionChart.tsx
// Regional Map on Bklit's ChoroplethChart: prefectures shaded by population
// density on the sequential scale tokens (with a legend - the old map had
// none), bureau HQ / airport-office markers as constant-size HTML overlay
// pins, built-in zoom/pan, and a proper tooltip for both layers.
'use client';

import { useEffect, useMemo, useState } from 'react';

import type { FeatureCollection, Geometry } from 'geojson';
import { Building2, Minus, Plane, Plus, RotateCcw } from 'lucide-react';
import type React from 'react';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';

import { bureauOptions } from '../../constants/bureauOptions';
import { japanPrefectures } from '../../constants/japanPrefectures';
import { useTheme } from '../../contexts/ThemeContext';
import { useBureauLabel, useBureauOptions, usePrefectureById } from '../../i18n/useDomainLabels';
import { visibleBureauColor, withAlpha } from '../../utils/bureauColors';
import { AIRPORT_BUREAU_CODES } from '../../utils/getBureauData';
import { logger } from '../../utils/logger';
import {
  ChoroplethChart,
  type ChoroplethFeature,
  ChoroplethFeatureComponent,
  type ChoroplethFeatureProperties,
  ChoroplethTooltip,
  useChoropleth,
  useChoroplethZoom,
} from '../bklit/charts/choropleth';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { SeriesLegend } from '../common/SeriesLegend';

// Population density bin edges (people/km²), chosen for Japan's distribution
const DENSITY_BINS = [100, 250, 500, 1500];
const densityBin = (density: number) => DENSITY_BINS.filter((edge) => density >= edge).length;
// Prefectures fill with their service bureau's flag color; density picks the
// intensity step (alpha blends against the card background in both themes).
const DENSITY_ALPHAS = [0.3, 0.45, 0.6, 0.78, 0.92];


const bureauByCode = new Map(bureauOptions.map((bureau) => [bureau.value, bureau]));

/**
 * The TopoJSON carries the JIS prefecture code as `properties.id`, which is
 * what we join on — matching on the English `properties.name` would break as
 * soon as prefecture names come from the catalogue.
 */
const prefectureIdOf = (geoFeature: ChoroplethFeature) => Number(geoFeature.properties?.id);

interface MarkerInfo {
  code: string;
  label: string;
  isAirport: boolean;
  coordinates: [number, number];
  population: number;
  area: number;
}

// Pin geometry is language-neutral and computed once; only the label depends
// on the locale, so it is joined in at render.
const MARKER_GEOMETRY = bureauOptions
  .filter((bureau) => bureau.value !== 'all' && bureau.coordinates)
  .map((bureau) => {
    const served = japanPrefectures.filter((prefecture) => prefecture.bureau === bureau.value);
    return {
      code: bureau.value,
      isAirport: bureau.isAirport,
      coordinates: bureau.coordinates as [number, number],
      population: served.reduce((sum, prefecture) => sum + prefecture.population, 0),
      area: served.reduce((sum, prefecture) => sum + prefecture.area, 0),
    };
  });

/** Bureau/airport pins: HTML overlay so they stay constant-size across zoom. */
const BureauMarkers: React.FC = () => {
  const { projectPoint, width, height } = useChoropleth();
  const { zoom } = useChoroplethZoom();
  const [hovered, setHovered] = useState<MarkerInfo | null>(null);
  const bureaus = useBureauOptions();
  const markers: MarkerInfo[] = useMemo(() => {
    const labelByCode = new Map(bureaus.map((bureau) => [bureau.value, bureau.label]));
    return MARKER_GEOMETRY.map((marker) => ({ ...marker, label: labelByCode.get(marker.code) ?? marker.code }));
  }, [bureaus]);

  const transform = zoom?.transformMatrix;
  const project = (coords: [number, number]): [number, number] | null => {
    const point = projectPoint(coords);
    if (!point) return null;
    if (!transform) return point;
    return [point[0] * transform.scaleX + transform.translateX, point[1] * transform.scaleY + transform.translateY];
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      {markers.map((marker) => {
        const point = project(marker.coordinates);
        if (!point || point[0] < 0 || point[1] < 0 || point[0] > width || point[1] > height) return null;
        const Icon = marker.isAirport ? Plane : Building2;
        return (
          <button
            key={marker.code}
            aria-label={`${marker.label} ${marker.isAirport ? 'airport office' : 'bureau'}`}
            className={`pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-soft transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring ${
              marker.isAirport
                ? 'size-5 border-border bg-card text-secondary-foreground'
                : 'size-6 border-primary/40 bg-primary text-primary-foreground'
            }`}
            style={{ left: point[0], top: point[1] }}
            onMouseEnter={() => setHovered(marker)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(marker)}
            onBlur={() => setHovered(null)}
          >
            <Icon className={marker.isAirport ? 'size-3' : 'size-3.5'} aria-hidden="true" />
          </button>
        );
      })}
      {hovered && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-soft-lg backdrop-blur">
          <div className="flex items-center gap-1.5 font-semibold">
            {hovered.isAirport ? <Plane className="size-3.5" /> : <Building2 className="size-3.5" />}
            {hovered.label}
            {hovered.isAirport ? ' Airport Office' : ' Bureau'}
          </div>
          {hovered.population > 0 ? (
            <div className="mt-1 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 tabular-nums text-muted-foreground">
              <span>Service population</span>
              <span className="text-right text-popover-foreground">{hovered.population.toLocaleString()}</span>
              <span>Service area</span>
              <span className="text-right text-popover-foreground">{hovered.area.toLocaleString()} km²</span>
              <span>Density</span>
              <span className="text-right text-popover-foreground">
                {(hovered.population / hovered.area).toFixed(1)} /km²
              </span>
            </div>
          ) : (
            <div className="mt-1 text-muted-foreground">Port-of-entry office</div>
          )}
        </div>
      )}
    </div>
  );
};

/** Zoom controls using the chart's own zoom instance (labeled, iconized). */
const ZoomControls: React.FC = () => {
  const { zoom } = useChoroplethZoom();
  if (!zoom) return null;
  return (
    <div className="absolute right-2 top-2 flex flex-col gap-1.5">
      <button onClick={() => zoom.scale({ scaleX: 1.4, scaleY: 1.4 })} className="zoom-button" aria-label="Zoom in">
        <Plus className="size-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => zoom.scale({ scaleX: 1 / 1.4, scaleY: 1 / 1.4 })}
        className="zoom-button"
        aria-label="Zoom out"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <button onClick={() => zoom.reset()} className="zoom-button" aria-label="Reset view">
        <RotateCcw className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export const GeographicDistributionChart: React.FC<ImmigrationChartData> = () => {
  const { isDarkMode } = useTheme();
  const prefectureById = usePrefectureById();
  const bureaus = useBureauOptions();
  const bureauLabelOf = useBureauLabel();
  const legendBureaus = bureaus.filter((bureau) => !AIRPORT_BUREAU_CODES.has(bureau.value) && bureau.value !== 'all');
  const [features, setFeatures] = useState<FeatureCollection<Geometry, ChoroplethFeatureProperties> | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/static/japan.topo.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((topology: Topology) => {
        const japan = feature(topology, topology.objects.japan) as FeatureCollection<
          Geometry,
          ChoroplethFeatureProperties
        >;
        setFeatures(japan);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === 'AbortError') return;
        logger.error('Error loading map data:', error);
        setLoadError(true);
      });
    return () => controller.abort();
  }, []);

  const getFeatureColor = useMemo(
    () => (geoFeature: ChoroplethFeature) => {
      const prefecture = prefectureById(prefectureIdOf(geoFeature));
      const bureau = prefecture ? bureauByCode.get(prefecture.bureau) : undefined;
      if (!prefecture || !bureau?.border) return 'var(--muted)';
      return withAlpha(visibleBureauColor(bureau.border, isDarkMode), DENSITY_ALPHAS[densityBin(prefecture.density)]);
    },
    [isDarkMode, prefectureById]
  );

  if (loadError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        Unable to load the map data. Try reloading the page.
      </div>
    );
  }

  if (!features) {
    return (
      <div className="map-container">
        <LoadingSpinner fullScreen={false} message="Loading Map Data..." />
      </div>
    );
  }

  return (
    <div className="card-content">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 text-xxs text-muted-foreground">
        <div className="min-w-0">
          <SeriesLegend
            items={legendBureaus
              .filter((bureau) => bureau.border)
              .map((bureau) => ({
                id: bureau.value,
                label: bureau.label,
                color: visibleBureauColor(bureau.border as string, isDarkMode),
              }))}
          />
          <p className="mt-1">Color = service bureau · intensity = population density</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Building2 className="size-2.5" aria-hidden="true" />
            </span>
            Bureau
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="flex size-4 items-center justify-center rounded-full border border-border bg-card text-secondary-foreground">
              <Plane className="size-2.5" aria-hidden="true" />
            </span>
            Airport office
          </span>
        </div>
      </div>
      <ChoroplethChart
        data={features}
        aspectRatio="16 / 11"
        center={[136.8, 36.2]}
        scale={(innerWidth) => innerWidth * 1.55}
        zoomEnabled
        zoomMin={0.8}
        zoomMax={16}
      >
        <ChoroplethFeatureComponent
          getFeatureColor={(geoFeature) => getFeatureColor(geoFeature)}
          stroke="var(--card)"
          strokeWidth={0.75}
        />
        <ChoroplethTooltip
          content={({ feature: geoFeature }) => {
            const prefecture = prefectureById(prefectureIdOf(geoFeature));
            const name = prefecture?.name ?? String(geoFeature.properties?.name ?? '');
            // The Japanese name rides along as a secondary, but only when it
            // isn't already what the catalogue resolved to — otherwise the
            // Japanese locale would print the same name twice.
            const nameJa = String(geoFeature.properties?.name_ja ?? '');
            return (
              <div className="px-3 py-2.5 text-xs">
                <div className="font-semibold">
                  {name}
                  {nameJa && nameJa !== name ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">{nameJa}</span>
                  ) : null}
                </div>
                {prefecture && (
                  <div className="mt-1 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 tabular-nums text-muted-foreground">
                    <span>Service bureau</span>
                    <span className="text-right">{bureauLabelOf(prefecture.bureau)}</span>
                    <span>Population</span>
                    <span className="text-right">{prefecture.population.toLocaleString()}</span>
                    <span>Area</span>
                    <span className="text-right">{prefecture.area.toLocaleString()} km²</span>
                    <span>Density</span>
                    <span className="text-right">{prefecture.density.toFixed(2)} /km²</span>
                  </div>
                )}
              </div>
            );
          }}
        />
        <BureauMarkers />
        <ZoomControls />
      </ChoroplethChart>
    </div>
  );
};
