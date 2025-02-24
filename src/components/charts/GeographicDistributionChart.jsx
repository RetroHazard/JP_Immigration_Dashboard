// src/components/charts/GeographicDistributionChart.jsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Icon } from '@iconify/react';
import { japanPrefectures } from '../../constants/japanPrefectures';
import { bureauOptions } from '../../constants/bureauOptions';
import { nonAirportBureaus } from '../../utils/getBureauData';

const geoUrl = '/static/japan.topo.json';

// Calculate color based on density
const adjustColor = (originalColor, density, minDensity, maxDensity) => {
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
    // eslint-disable-next-line
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
  const hue2rgb = (p, q, t) => {
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

export const GeographicDistributionChart = ({ isDarkMode }) => {
  const [geographyData, setGeographyData] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [markerTooltip, setMarkerTooltip] = useState(null);
  const [position, setPosition] = useState({ coordinates: [136, 36], zoom: 1 });
  const geographyRefs = useRef(new Map());
  const markerRefs = useRef(new Map());

  // Loading Indication
  useEffect(() => {
    fetch(geoUrl)
      .then((response) => response.json())
      .then((data) => {
        setGeographyData(data);
        setIsMapLoading(false);
      })
      .catch((error) => {
        console.error('Error loading map data:', error);
        setIsMapLoading(false);
      });
  }, []);

  // Zoom controls
  const handleZoomIn = () => setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 2, 32) }));
  const handleZoomOut = () => setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 2) }));
  const handleReset = () => setPosition({ coordinates: [136, 36], zoom: 2 });

  // Bureau density calculations
  const bureauDensityRanges = useMemo(() => {
    // First create the groups
    const groups = japanPrefectures.reduce((acc, prefecture) => {
      const bureau = prefecture.bureau;
      acc[bureau] = acc[bureau] || [];
      acc[bureau].push(parseFloat(prefecture.density));
      return acc;
    }, {});

    // Then process the ranges
    return Object.entries(groups).reduce((acc, [bureau, densities]) => {
      acc[bureau] = {
        min: Math.min(...densities),
        max: Math.max(...densities) || Math.min(...densities), // Fallback for single-value
      };
      return acc;
    }, {});
  }, []);

  // Prefecture and bureau data maps
  const [bureauColorMap, prefectureMap] = useMemo(() => {
    const bureauMap = bureauOptions.reduce((acc, bureau) => {
      acc[bureau.value] = bureau;
      return acc;
    }, {});

    const prefectureMap = japanPrefectures.reduce((acc, prefecture) => {
      acc[prefecture.name] = prefecture;
      return acc;
    }, {});

    return [bureauMap, prefectureMap];
  }, []);

  // Style calculations
  const getFillColor = (prefectureName) => {
    const prefecture = prefectureMap[prefectureName];
    if (!prefecture) return '#DDD';

    const bureau = bureauColorMap[prefecture.bureau];
    if (!bureau) return '#DDD';

    const range = bureauDensityRanges[prefecture.bureau];
    return range
      ? adjustColor(bureau.background, parseFloat(prefecture.density), range.min, range.max)
      : bureau.background;
  };

  // Calculate Bureau Regional Statistics
  const bureauStats = useMemo(() => {
    const stats = {};
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
        <div className="section-title">Service Area Density</div>
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
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-300">
              <Icon
                icon="svg-spinners:90-ring-with-bg"
                className="h-8 w-8 text-indigo-600 dark:text-indigo-300"
                aria-hidden="true"
              />
              <span className="text-sm">Loading map data...</span>
            </div>
          </div>
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
                        stroke={isDarkMode ? '#475569' : '#CBD5E1'}
                        strokeWidth={0.1}
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
                        ref={(node) => geographyRefs.current.set(geo.properties.name, node)}
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
                  const baseSize = Math.min(32, Math.max(2, 35 / position.zoom));
                  const iconSize = isAirport ? baseSize * 0.65 : baseSize;

                  return (
                    <Marker key={bureau.value} coordinates={bureau.coordinates}>
                      <g
                        transform={`translate(-${iconSize / 2}, -${iconSize / 2})`}
                        onMouseEnter={() => setMarkerTooltip(bureau)}
                        onMouseLeave={() => setMarkerTooltip(null)}
                        ref={(node) => markerRefs.current.set(bureau.value, node)}
                        pointerEvents="bounding-box"
                      >
                        <Icon
                          icon={
                            isAirport ? 'material-symbols:multiple-airports-rounded' : 'f7:building-2-crop-circle-fill'
                          }
                          width={iconSize}
                          height={iconSize}
                          color={bureau.border}
                          stroke={'#000000'}
                          strokeWidth={0.5}
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
          followCursor="initial"
          getReferenceClientRect={() => ({
            width: 0,
            height: 0,
            top: tooltipInfo?.mousePosition[1] || 0,
            left: tooltipInfo?.mousePosition[0] || 0,
            right: tooltipInfo?.mousePosition[0] || 0,
            bottom: tooltipInfo?.mousePosition[1] || 0,
          })}
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
                <div className="mb-1 flex items-center gap-2 border-b border-gray-500 pb-1 font-semibold">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: markerTooltip.border }} />
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
                      Average Density of Service Area:{' '}
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
