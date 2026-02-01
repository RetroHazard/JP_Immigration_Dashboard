// src/components/charts/GeographicDistributionChart.tsx
import { useEffect, useMemo, useRef, useState } from 'react';

import type { FeatureCollection } from 'geojson';
import type React from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Icon } from '@iconify/react';
import Tippy from '@tippyjs/react';

import { type BureauOption,bureauOptions } from '../../constants/bureauOptions';
import { japanPrefectures } from '../../constants/japanPrefectures';
import { useTheme } from '../../contexts/ThemeContext';
import { nonAirportBureaus } from '../../utils/getBureauData';
import { logger } from '../../utils/logger';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { LoadingSpinner } from '../common/LoadingSpinner';

import 'tippy.js/dist/tippy.css';

const geoUrl = '/static/japan.topo.json';

interface TooltipInfo {
  name: string;
  name_ja: string;
  bureau: string;
  population: string;
  area: string;
  density: string;
  mousePosition: [number, number];
}

// Calculate color based on density
const adjustColor = (originalColor: string, density: number, minDensity: number, maxDensity: number): string => {
  if (!originalColor) return 'rgba(221, 221, 221, 0.8)';

  // Parse color values
  const colorParts = originalColor.replace(/ /g, '').match(/(\d+\.?\d*)/g) || [];
  const [r, g, b] = colorParts.slice(0, 3).map((c) => parseInt(c) / 255);
  const originalAlpha = colorParts[3] ? parseFloat(colorParts[3]) : 0.4;

  // Calculate density scale factor
  const densityScale = maxDensity !== minDensity ? (density - minDensity) / (maxDensity - minDensity) : 0.5;

  // Convert to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Apply density-based adjustments
  s = Math.min(s + densityScale * 0.8, 1); // Enhanced saturation
  l = l * (1 - densityScale * 0.6); // Enhanced lightness

  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const rgb = [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map((x) => Math.round(x * 255));

  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${originalAlpha})`;
};

export const GeographicDistributionChart: React.FC<ImmigrationChartData> = () => {
  const { isDarkMode } = useTheme();
  const [geographyData, setGeographyData] = useState<FeatureCollection | null>(null);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo | null>(null);
  const [markerTooltip, setMarkerTooltip] = useState<BureauOption | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [136, 36],
    zoom: 1,
  });
  const geographyRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const markerRefs = useRef<Map<string, SVGGElement>>(new Map());

  const getReferenceClientRect = () => {
    if (!tooltipInfo || !tooltipInfo.mousePosition) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        toJSON: () => ({}),
      } as DOMRect;
    }

    const rect = tooltipInfo.mousePosition;
    return {
      x: rect[0],
      y: rect[1],
      width: 0,
      height: 0,
      top: rect[1],
      left: rect[0],
      right: rect[0],
      bottom: rect[1],
      toJSON: () => ({}),
    } as DOMRect;
  };

  // Loading Indication
  useEffect(() => {
    const abortController = new AbortController();

    fetch(geoUrl, { signal: abortController.signal })
      .then((response) => response.json())
      .then((data) => {
        setGeographyData(data);
        setIsMapLoading(false);
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          logger.log('Map data fetch aborted');
          return;
        }
        logger.error('Error loading map data:', error);
        setIsMapLoading(false);
      });

    // Cleanup function to abort fetch if component unmounts
    return () => {
      abortController.abort();
    };
  }, []);

  // Zoom controls
  const handleZoomIn = () => setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 2, 32) }));
  const handleZoomOut = () => setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 2) }));
  const handleReset = () => setPosition({ coordinates: [136, 36], zoom: 2 });

  // Bureau density calculations
  const bureauDensityRanges = useMemo(() => {
    // First create the groups
    const groups = japanPrefectures.reduce(
      (acc, prefecture) => {
        const bureau = prefecture.bureau;
        acc[bureau] = acc[bureau] || [];
        acc[bureau].push(parseFloat(prefecture.density));
        return acc;
      },
      {} as Record<string, number[]>
    );

    // Then process the ranges
    return Object.entries(groups).reduce(
      (acc, [bureau, densities]) => {
        acc[bureau] = {
          min: Math.min(...densities),
          max: Math.max(...densities) || Math.min(...densities), // Fallback for single-value
        };
        return acc;
      },
      {} as Record<string, { min: number; max: number }>
    );
  }, []);

  // Prefecture and bureau data maps
  const [bureauColorMap, prefectureMap] = useMemo(() => {
    const bureauMap = bureauOptions.reduce(
      (acc, bureau) => {
        acc[bureau.value] = bureau;
        return acc;
      },
      {} as Record<string, (typeof bureauOptions)[0]>
    );

    const prefectureMap = japanPrefectures.reduce(
      (acc, prefecture) => {
        acc[prefecture.name] = prefecture;
        return acc;
      },
      {} as Record<string, (typeof japanPrefectures)[0]>
    );

    return [bureauMap, prefectureMap];
  }, []);

  // Pre-calculate all prefecture colors (47 prefectures, calculated once instead of on every render)
  const prefectureColors = useMemo(() => {
    return japanPrefectures.reduce(
      (acc, prefecture) => {
        const bureau = bureauColorMap[prefecture.bureau];
        if (!bureau) {
          acc[prefecture.name] = '#DDD';
          return acc;
        }

        const range = bureauDensityRanges[prefecture.bureau];
        acc[prefecture.name] = range
          ? adjustColor(bureau.background, parseFloat(prefecture.density), range.min, range.max)
          : bureau.background;

        return acc;
      },
      {} as Record<string, string>
    );
  }, [bureauColorMap, bureauDensityRanges]);

  // O(1) lookup for fill colors
  const getFillColor = (prefectureName: string): string => {
    return prefectureColors[prefectureName] || '#DDD';
  };

  // Calculate Bureau Regional Statistics
  const bureauStats = useMemo(() => {
    const stats = {} as Record<string, { population: number; area: number; count: number }>;
    bureauOptions.forEach((bureau) => {
      if (bureau.value === 'all') return;
      const prefectures = japanPrefectures.filter((p) => p.bureau === bureau.value);
      stats[bureau.value] = prefectures.reduce(
        (acc, p) => ({
          population: acc.population + p.population,
          area: acc.area + p.area,
          count: acc.count + 1,
        }),
        { population: 0, area: 0, count: 0 }
      );
    });
    return stats;
  }, []);

  return (
    <div className="card-content">
      <div className="mb-4 flex items-center justify-between">
        <div className="section-title">Service Area Coverage/Density</div>
        <div className="flex gap-2">
          <button onClick={handleZoomIn} className="zoom-button">
            +
          </button>
          <button onClick={handleZoomOut} className="zoom-button">
            –
          </button>
          <button onClick={handleReset} className="zoom-button">
            ⟲
          </button>
        </div>
      </div>

      <div className="map-container">
        {isMapLoading ? (
          <LoadingSpinner icon="svg-spinners:blocks-wave" message="Loading Map Data..." />
        ) : (
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1000, center: [136, 36] }}>
            <ZoomableGroup
              center={position.coordinates}
              zoom={position.zoom}
              onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
              maxZoom={32}
              minZoom={2}
            >
              <Geographies geography={geographyData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const prefecture = prefectureMap[geo.properties.name];

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getFillColor(geo.properties.name)}
                        stroke={isDarkMode ? 'rgba(225, 225, 225, 0.75)' : 'rgba(30, 30, 30, 0.75)'}
                        strokeWidth={0.075}
                        onMouseMove={(event) => {
                          if (!prefecture) return;
                          setTooltipInfo({
                            name: geo.properties.name,
                            name_ja: geo.properties.name_ja,
                            bureau: bureauColorMap[prefecture.bureau]?.label,
                            population: prefecture.population.toLocaleString(),
                            area: `${prefecture.area.toLocaleString()} km²`,
                            density: prefecture.density,
                            mousePosition: [event.clientX, event.clientY],
                          });
                        }}
                        onMouseLeave={() => setTooltipInfo(null)}
                        ref={(node) => {
                          if (node instanceof SVGPathElement) {
                            geographyRefs.current.set(geo.properties.name, node);
                          }
                        }}
                        style={{
                          default: {
                            outline: 'none',
                            fillOpacity: 1,
                            cursor: 'pointer',
                          },
                          hover: {
                            outline: 'none',
                            fillOpacity: 0.9,
                          },
                          pressed: {
                            outline: 'none',
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {bureauOptions
                .filter((b) => b.value !== 'all')
                .map((bureau) => {
                  const isAirport = !nonAirportBureaus.find((b) => b.value === bureau.value);
                  const baseSize = Math.min(10, Math.max(1, 50 / position.zoom));
                  const iconSize = isAirport ? baseSize * 0.85 : baseSize;

                  return (
                    <Marker key={bureau.value} coordinates={bureau.coordinates}>
                      <g
                        transform={`translate(-${iconSize / 2}, -${iconSize / 2})`}
                        onMouseEnter={() => setMarkerTooltip(bureau)}
                        onMouseLeave={() => setMarkerTooltip(null)}
                        ref={(node) => {
                          if (node instanceof SVGGElement) {
                            markerRefs.current.set(bureau.value, node);
                          }
                        }}
                        pointerEvents="bounding-box"
                      >
                        <Icon
                          icon={isAirport ? 'material-symbols:multiple-airports-rounded' : 'f7:building-2-fill'}
                          width={iconSize}
                          height={iconSize}
                          color={'rgba(225, 225, 225, 0.9)'}
                          stroke={bureau.border}
                          strokeWidth={0.75}
                        />
                      </g>
                    </Marker>
                  );
                })}
            </ZoomableGroup>
          </ComposableMap>
        )}
        {/* Prefecture Tooltips */}
        <Tippy
          visible={!!tooltipInfo}
          content={
            tooltipInfo && (
              <div>
                <div className="font-semibold">
                  {tooltipInfo.name} ({tooltipInfo.name_ja})
                </div>
                <div>Service Bureau: {tooltipInfo.bureau}</div>
                <div>Population: {tooltipInfo.population}</div>
                <div>Area: {tooltipInfo.area}</div>
                <div>Density Rating: {tooltipInfo.density}</div>
              </div>
            )
          }
          placement="auto"
          arrow={true}
          animation="shift-away"
          theme="stat-tooltip"
          delay={[300, 50]}
          followCursor={true}
          getReferenceClientRect={getReferenceClientRect}
          popperOptions={{
            modifiers: [
              {
                name: 'preventOverflow',
                options: {
                  padding: 8,
                  boundariesElement: 'viewport',
                },
              },
            ],
          }}
        />
        {/* Bureau Tooltips */}
        <Tippy
          visible={!!markerTooltip}
          content={
            markerTooltip && (
              <>
                <div
                  className={`mb-1 flex items-center gap-2 font-semibold ${
                    nonAirportBureaus.find((b) => b.value === markerTooltip.value)
                      ? 'border-b border-gray-500 pb-1'
                      : ''
                  }`}
                >
                  {nonAirportBureaus.find((b) => b.value === markerTooltip.value) && (
                    <div
                      className="size-3 rounded-full border border-white dark:border-black"
                      style={{ backgroundColor: markerTooltip.background }}
                    />
                  )}
                  {nonAirportBureaus.find((b) => b.value === markerTooltip.value)
                    ? `${markerTooltip.label} Regional Immigration Bureau`
                    : markerTooltip.label}
                </div>
                {nonAirportBureaus.find((b) => b.value === markerTooltip.value) && (
                  <div className="flex-row p-0.5">
                    <div>
                      Population of Service Area: {bureauStats[markerTooltip.value]?.population.toLocaleString()}
                    </div>
                    <div>Total Service Area: {bureauStats[markerTooltip.value]?.area.toLocaleString()} km²</div>
                    <div>
                      Density of Service Area:{' '}
                      {(bureauStats[markerTooltip.value]?.population / bureauStats[markerTooltip.value]?.area).toFixed(
                        2
                      )}
                    </div>
                  </div>
                )}
              </>
            )
          }
          placement="top"
          arrow={true}
          animation="shift-away"
          theme="stat-tooltip"
          delay={[300, 50]}
          onClickOutside={() => setMarkerTooltip(null)}
          interactive={true}
          hideOnClick={false}
          appendTo={document.body}
          reference={markerRefs.current.get(markerTooltip?.value)}
          popperOptions={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 15],
                },
              },
              {
                name: 'preventOverflow',
                options: {
                  padding: 8,
                  boundariesElement: 'viewport',
                },
              },
            ],
          }}
        />
      </div>
    </div>
  );
};
