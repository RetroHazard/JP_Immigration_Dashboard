// src/components/charts/GeographicDistributionChart.jsx
import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, useZoomPan, ZoomableGroup } from 'react-simple-maps';
import { Tooltip } from '@visx/tooltip';
import { Icon } from '@iconify/react';
import { japanPrefectures } from '../../constants/japanPrefectures';
import { bureauOptions } from '../../constants/bureauOptions';

const geoUrl = '/static/japan.topo.json';

// Calculate alpha channel based on density
const calculateAlpha = (density, minDensity, maxDensity) => {
  const scaled = (density - minDensity) / (maxDensity - minDensity);
  return scaled * 0.25 + 0.5; // Range 0.5-0.75
};

export const GeographicDistributionChart = ({ isDarkMode }) => {
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [markerTooltip, setMarkerTooltip] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([136, 36]);

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);

  const bureauDensityRanges = useMemo(() => {
    const groups = japanPrefectures.reduce((acc, prefecture) => {
      const bureau = prefecture.bureau;
      if (!acc[bureau]) acc[bureau] = [];
      acc[bureau].push(parseFloat(prefecture.density));
      return acc;
    }, {});

    return Object.entries(groups).reduce((acc, [bureau, densities]) => {
      acc[bureau] = {
        min: Math.min(...densities),
        max: Math.max(...densities),
      };
      return acc;
    }, {});
  }, []);

  // Create bureau color map
  const bureauColorMap = useMemo(
    () =>
      bureauOptions.reduce((acc, bureau) => {
        acc[bureau.value] = bureau;
        return acc;
      }, {}),
    []
  );

  // Create prefecture data map
  const prefectureMap = useMemo(
    () =>
      japanPrefectures.reduce((acc, prefecture) => {
        acc[prefecture.name] = prefecture;
        return acc;
      }, {}),
    []
  );

  const getFillColor = (prefectureName) => {
    const prefecture = prefectureMap[prefectureName];
    if (!prefecture) return '#DDD';

    const bureau = bureauColorMap[prefecture.bureau];
    if (!bureau) return '#DDD';

    const range = bureauDensityRanges[prefecture.bureau];
    if (!range) return bureau.background;

    const alpha = calculateAlpha(parseFloat(prefecture.density), range.min, range.max);

    return bureau.background.replace(/0\.4\)$/, `${alpha})`);
  };

  return (
    <div className="chart-container relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1800,
          center: [136, 36],
        }}
      >
        <ZoomableGroup zoom={1} center={[136, 36]}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                geo.centroid = center;
                const prefecture = prefectureMap[geo.properties.name];
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFillColor(geo.properties.name)}
                    stroke={isDarkMode ? '#475569' : '#CBD5E1'}
                    strokeWidth={1}
                    onMouseEnter={() => {
                      if (!prefecture) return;
                      const centroid = geo.centroid;
                      prefecture &&
                        setTooltipInfo({
                          name: geo.properties.name,
                          name_ja: geo.properties.name_ja,
                          bureau: bureauColorMap[prefecture.bureau]?.label,
                          population: prefecture.population.toLocaleString(),
                          area: `${prefecture.area.toLocaleString()} km²`,
                          density: prefecture.density,
                          x: centroid[0],
                          y: centroid[1],
                        });
                    }}
                    onMouseLeave={() => setTooltipInfo(null)}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fillOpacity: 0.8 },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {bureauOptions
            .filter((b) => b.value !== 'all')
            .map((bureau) => (
              <Marker
                key={bureau.value}
                coordinates={bureau.coordinates}
                onMouseEnter={() => setMarkerTooltip(bureau)}
                onMouseLeave={() => setMarkerTooltip(null)}
              >
                <Icon icon="carbon:location-filled" color={bureau.border} stroke={'#000000'} width={24} height={24} />
              </Marker>
            ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Prefecture Tooltip */}
      {tooltipInfo && (
        <Tooltip
          top={tooltipInfo.y - 12}
          left={tooltipInfo.x + 12}
          className="!rounded-lg !bg-gray-700 !p-3 !text-white !shadow-xl"
        >
          <div className="space-y-1">
            <div className="font-semibold">
              {tooltipInfo.name} ({tooltipInfo.name_ja})
            </div>
            <div>Bureau: {tooltipInfo.bureau}</div>
            <div>Population: {tooltipInfo.population}</div>
            <div>Area: {tooltipInfo.area}</div>
            <div>Density: {tooltipInfo.density}/km²</div>
          </div>
        </Tooltip>
      )}

      {/* Bureau Marker Tooltip */}
      {markerTooltip && (
        <Tooltip
          top={markerTooltip.coordinates[1] - 50}
          left={markerTooltip.coordinates[0] + 20}
          className="!rounded-lg !bg-gray-700 !p-2 !text-white !shadow-xl"
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: markerTooltip.border }} />
            {markerTooltip.label}
          </div>
        </Tooltip>
      )}
    </div>
  );
};
