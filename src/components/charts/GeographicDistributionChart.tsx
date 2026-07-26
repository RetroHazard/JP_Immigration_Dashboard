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

const SCALE_VARS = [
  'var(--chart-scale-01)',
  'var(--chart-scale-02)',
  'var(--chart-scale-03)',
  'var(--chart-scale-04)',
  'var(--chart-scale-05)',
];
// Population density bin edges (people/km²), chosen for Japan's distribution
const DENSITY_BINS = [100, 250, 500, 1500];
const densityBin = (density: number) => DENSITY_BINS.filter((edge) => density >= edge).length;

const prefectureByName = new Map(japanPrefectures.map((prefecture) => [prefecture.name, prefecture]));
const bureauByCode = new Map(bureauOptions.map((bureau) => [bureau.value, bureau]));

interface MarkerInfo {
  code: string;
  label: string;
  isAirport: boolean;
  coordinates: [number, number];
  population: number;
  area: number;
}

const MARKERS: MarkerInfo[] = bureauOptions
  .filter((bureau) => bureau.value !== 'all' && bureau.coordinates)
  .map((bureau) => {
    const served = japanPrefectures.filter((prefecture) => prefecture.bureau === bureau.value);
    return {
      code: bureau.value,
      label: bureau.label,
      isAirport: bureau.label.toLowerCase().includes('airport'),
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

  const transform = zoom?.transformMatrix;
  const project = (coords: [number, number]): [number, number] | null => {
    const point = projectPoint(coords);
    if (!point) return null;
    if (!transform) return point;
    return [point[0] * transform.scaleX + transform.translateX, point[1] * transform.scaleY + transform.translateY];
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      {MARKERS.map((marker) => {
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
      const prefecture = prefectureByName.get(String(geoFeature.properties?.name));
      if (!prefecture) return 'var(--muted)';
      return SCALE_VARS[densityBin(Number(prefecture.density))];
    },
    []
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
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xxs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Population density</span>
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {SCALE_VARS.map((color) => (
              <span key={color} className="h-2.5 w-5 first:rounded-l-sm last:rounded-r-sm" style={{ background: color }} />
            ))}
          </span>
          <span>low → high /km²</span>
        </div>
        <div className="flex items-center gap-3">
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
            const name = String(geoFeature.properties?.name ?? '');
            const prefecture = prefectureByName.get(name);
            const bureau = prefecture ? bureauByCode.get(prefecture.bureau) : undefined;
            return (
              <div className="text-xs">
                <div className="font-semibold">
                  {name}
                  {geoFeature.properties?.name_ja ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      {String(geoFeature.properties.name_ja)}
                    </span>
                  ) : null}
                </div>
                {prefecture && (
                  <div className="mt-1 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 tabular-nums text-muted-foreground">
                    <span>Service bureau</span>
                    <span className="text-right">{bureau?.label ?? prefecture.bureau}</span>
                    <span>Population</span>
                    <span className="text-right">{prefecture.population.toLocaleString()}</span>
                    <span>Area</span>
                    <span className="text-right">{prefecture.area.toLocaleString()} km²</span>
                    <span>Density</span>
                    <span className="text-right">{prefecture.density} /km²</span>
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
