// src/components/charts/GeographicDistributionChart.jsx
import React, { useMemo, useState, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Icon } from '@iconify/react';
import { japanPrefectures } from '../../constants/japanPrefectures';
import { bureauOptions } from '../../constants/bureauOptions';

const geoUrl = '/static/japan.topo.json';

// Calculate alpha channel based on density
const calculateAlpha = (density, minDensity, maxDensity) => {
  if (minDensity === maxDensity) return 0.75;
  const scaled = (density - minDensity) / (maxDensity - minDensity);
  return scaled * 0.75 + 0.65;
}; // TODO: also adjust Hue/Saturation based on Density Rating

export const GeographicDistributionChart = ({ isDarkMode }) => {
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [markerTooltip, setMarkerTooltip] = useState(null);
  const [position, setPosition] = useState({ coordinates: [136, 36], zoom: 1 });
  const geographyRefs = useRef(new Map());
  const markerRefs = useRef(new Map());

  // Zoom controls
  const handleZoomIn = () => setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  const handleZoomOut = () => setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  const handleReset = () => setPosition({ coordinates: [136, 36], zoom: 1 });

  // Bureau density calculations
  const bureauDensityRanges = useMemo(() => {
    const groups = japanPrefectures.reduce((acc, prefecture) => {
      const bureau = prefecture.bureau;
      acc[bureau] = acc[bureau] || [];
      acc[bureau].push(parseFloat(prefecture.density));
      return acc;
    }, {});

    return Object.entries(groups).reduce((acc, [bureau, densities]) => {
      acc[bureau] = { min: Math.min(...densities), max: Math.max(...densities) };
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
    const alpha = range ? calculateAlpha(parseFloat(prefecture.density), range.min, range.max) : 0.75;

    return bureau.background.replace(/0\.4\)$/, `${alpha})`);
  };

  // Marker position adjustment
  const adjustMarkerPosition = ([lon, lat]) => [lon - 0.425, lat + 0.615];

  return (
    <div className="card-content">
      <div className="mb-4 flex items-center justify-between">
        <div className="section-title">National Distribution</div>
        <div className="flex gap-2">
          <button onClick={handleZoomIn} className="zoom-button">
            +
          </button>
          <button onClick={handleZoomOut} className="zoom-button">
            -
          </button>
          <button onClick={handleReset} className="zoom-button">
            ⟲
          </button>
        </div>
      </div>

      <div className="chart-container">
        {' '}
        {/* // TODO: Fix Chart Container Height */}
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1000, center: [136, 36] }}>
          <ZoomableGroup center={position.coordinates} zoom={position.zoom}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const prefecture = prefectureMap[geo.properties.name];

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getFillColor(geo.properties.name)}
                      stroke={isDarkMode ? '#475569' : '#CBD5E1'}
                      strokeWidth={0.25}
                      onMouseMove={() =>
                        prefecture &&
                        setTooltipInfo({
                          name: geo.properties.name,
                          name_ja: geo.properties.name_ja,
                          bureau: bureauColorMap[prefecture.bureau]?.label,
                          population: prefecture.population.toLocaleString(),
                          area: `${prefecture.area.toLocaleString()} km²`,
                          density: prefecture.density,
                        })
                      }
                      onMouseLeave={() => setTooltipInfo(null)}
                      ref={(node) => geographyRefs.current.set(geo.properties.name, node)}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fillOpacity: 0.8 },
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
                  coordinates={adjustMarkerPosition(bureau.coordinates)}
                  onMouseEnter={() => setMarkerTooltip(bureau)}
                  onMouseLeave={() => setMarkerTooltip(null)}
                  ref={(node) => markerRefs.current.set(bureau.value, node)}
                >
                  <Icon
                    icon="carbon:location-filled" // TODO: Switch Icon if Airport Bureau
                    color={bureau.border}
                    stroke={'black'}
                    strokeWidth={0.5}
                    width={15} // TODO: Scale Marker Size based on current Zoom level
                    height={15}
                  />
                </Marker>
              ))}
          </ZoomableGroup>
        </ComposableMap>
        {/* Prefecture Tooltips */}
        <Tippy
          visible={!!tooltipInfo}
          content={
            tooltipInfo && (
              <div className="font-semibold">
                <div className="font-semibold">
                  {tooltipInfo.name} ({tooltipInfo.name_ja})
                </div>
                <div>Bureau: {tooltipInfo.bureau}</div>
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
          reference={geographyRefs.current.get(tooltipInfo?.name)}
        />
        {/* Bureau Tooltips */}
        <Tippy
          visible={!!markerTooltip}
          content={
            markerTooltip && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: markerTooltip.border }} />
                {markerTooltip.label}{' '}
                {/* // TODO: Add additional label to identify Immigration Bureau, to clarify that this is not a city marker. */}
              </div>
            )
          }
          placement="top"
          arrow={true}
          animation="shift-away"
          theme="stat-tooltip"
          delay={[300, 50]}
          reference={markerRefs.current.get(markerTooltip?.value)}
        />
      </div>
    </div>
  );
};
