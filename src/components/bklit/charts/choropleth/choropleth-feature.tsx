"use client";

import { geoCentroid } from "d3-geo";
import { motion, useTransform } from "motion/react";
import { memo, useCallback, useMemo } from "react";
import { useEnterComplete } from "../use-enter-complete";
import { useMountProgress } from "../use-mount-progress";
import {
  type ChoroplethFeature as ChoroplethFeatureType,
  defaultChoroplethColors,
  useChoroplethInteraction,
  useChoroplethStable,
} from "./choropleth-context";

export interface ChoroplethFeatureProps {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fadedOpacity?: number;
  getFeatureColor?: (feature: ChoroplethFeatureType, index: number) => string;
  patterns?: React.ReactNode;
  getFeaturePattern?: (
    feature: ChoroplethFeatureType,
    index: number
  ) => string | null | undefined;
}

interface FeatureRecord {
  index: number;
  path: string;
  fill: string;
  feature: ChoroplethFeatureType;
  centroid: { x: number; y: number } | null;
}

function resolveFeatureFill(
  feature: ChoroplethFeatureType,
  index: number,
  fill: string | undefined,
  getFeatureColor: ChoroplethFeatureProps["getFeatureColor"],
  getFeaturePattern: ChoroplethFeatureProps["getFeaturePattern"]
): string {
  const patternId = getFeaturePattern?.(feature, index);
  if (patternId) {
    return `url(#${patternId})`;
  }
  if (fill) {
    return fill;
  }
  if (getFeatureColor) {
    return getFeatureColor(feature, index);
  }
  return (
    defaultChoroplethColors[index % defaultChoroplethColors.length] ??
    "var(--chart-1)"
  );
}

/** Feature index carried by the delegated handlers, or null for a miss. */
function featureIndexFromEvent(event: React.SyntheticEvent): number | null {
  const attribute = (event.target as Element | null)?.getAttribute?.(
    "data-feature-index"
  );
  if (attribute == null) {
    return null;
  }
  const index = Number(attribute);
  return Number.isNaN(index) ? null : index;
}

/**
 * The paths themselves. Deliberately free of per-feature handlers and of any
 * hover-dependent prop, so this memo holds across hover and pan — the geometry
 * is the expensive part and it never needs to re-render for an interaction.
 *
 * `non-scaling-stroke` is what keeps borders hairline-thin at every zoom level.
 * The zoom transform sits on an ancestor <g>, and SVG scales stroke width along
 * with geometry, so a 0.75 border renders 12px wide at 16x. Dividing the width
 * by the live zoom scale instead would drag this layer into the zoom context and
 * re-render all 47 paths per gesture frame; a static attribute leaves the memo
 * intact and hands the work to the rasteriser.
 */
const FeaturePaths = memo(function FeaturePaths({
  records,
  stroke,
  strokeWidth,
}: {
  records: FeatureRecord[];
  stroke: string;
  strokeWidth: number;
}) {
  return (
    <>
      {records.map((record) => (
        <path
          className="cursor-pointer"
          d={record.path}
          data-feature-index={record.index}
          fill={record.fill}
          key={record.index}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  );
});

const StaticFeatureLayer = memo(function StaticFeatureLayer({
  records,
  stroke,
  strokeWidth,
  baseOpacity,
  dimOpacity,
  hoveredIndex,
  onFeatureEnter,
  onFeatureLeave,
}: {
  records: FeatureRecord[];
  stroke: string;
  strokeWidth: number;
  baseOpacity: number;
  dimOpacity: number;
  hoveredIndex: number | null;
  onFeatureEnter: (index: number) => void;
  onFeatureLeave: () => void;
}) {
  // One delegated listener per event instead of two closures per feature.
  const handlePointerOver = useCallback(
    (event: React.MouseEvent) => {
      const index = featureIndexFromEvent(event);
      if (index !== null) {
        onFeatureEnter(index);
      }
    },
    [onFeatureEnter]
  );

  const highlighted =
    hoveredIndex === null
      ? undefined
      : records.find((record) => record.index === hoveredIndex);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegated hit target for the feature paths
    <g
      onClick={handlePointerOver}
      onMouseLeave={onFeatureLeave}
      onMouseOver={handlePointerOver}
    >
      <g
        opacity={hoveredIndex === null ? baseOpacity : dimOpacity}
        style={{ transition: "opacity 0.18s ease-out" }}
      >
        <FeaturePaths
          records={records}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>
      {/* Always mounted, so hovering swaps one `d` attribute rather than
          remounting the whole layer. Transparent to pointers, so the path
          underneath keeps ownership of the hover. */}
      <path
        d={highlighted?.path ?? ""}
        fill={highlighted?.fill ?? "none"}
        pointerEvents="none"
        stroke={highlighted ? stroke : "none"}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
});

const EnterFeatureLayer = memo(function EnterFeatureLayer({
  records,
  stroke,
  strokeWidth,
  baseOpacity,
  dimOpacity,
  hoveredIndex,
  onFeatureEnter,
  onFeatureLeave,
  revealEpoch,
}: {
  records: FeatureRecord[];
  stroke: string;
  strokeWidth: number;
  baseOpacity: number;
  dimOpacity: number;
  hoveredIndex: number | null;
  onFeatureEnter: (index: number) => void;
  onFeatureLeave: () => void;
  revealEpoch: number;
}) {
  const { enterTransition, animationDuration } = useChoroplethStable();
  const mountProgress = useMountProgress(
    enterTransition,
    0,
    `choropleth-layer-${revealEpoch}`
  );
  const enterComplete = useEnterComplete(mountProgress);
  const layerOpacity = useTransform(mountProgress, (t) => t * baseOpacity);

  if (enterComplete) {
    return (
      <StaticFeatureLayer
        baseOpacity={baseOpacity}
        dimOpacity={dimOpacity}
        hoveredIndex={hoveredIndex}
        onFeatureEnter={onFeatureEnter}
        onFeatureLeave={onFeatureLeave}
        records={records}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <motion.g
      key={`enter-${revealEpoch}`}
      opacity={layerOpacity}
      transition={{
        duration: animationDuration / 1000,
        ease: "easeOut",
      }}
    >
      <FeaturePaths
        records={records}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </motion.g>
  );
});

export const ChoroplethFeature = memo(function ChoroplethFeature({
  fill,
  stroke = "var(--background)",
  strokeWidth = 0.5,
  fadedOpacity = 0.4,
  getFeatureColor,
  patterns,
  getFeaturePattern,
}: ChoroplethFeatureProps) {
  const {
    features,
    featurePaths,
    pathGenerator,
    projectPoint,
    isLoaded,
    revealEpoch,
    width,
    height,
  } = useChoroplethStable();
  const { hoveredFeatureIndex, setHoveredFeatureIndex, setTooltipData } =
    useChoroplethInteraction();

  const featureCentroids = useMemo(() => {
    return features.map((feature) => {
      try {
        const centroid = geoCentroid(feature);
        if (
          centroid &&
          !Number.isNaN(centroid[0]) &&
          !Number.isNaN(centroid[1])
        ) {
          const projected = projectPoint(centroid as [number, number]);
          if (projected) {
            const padding = 60;
            return {
              x: Math.max(padding, Math.min(width - padding, projected[0])),
              y: Math.max(padding, Math.min(height - padding, projected[1])),
            };
          }
        }
      } catch {
        // Some geometries may not have valid centroids
      }
      return null;
    });
  }, [features, projectPoint, width, height]);

  const records = useMemo(() => {
    const items: FeatureRecord[] = [];
    for (let index = 0; index < features.length; index++) {
      const feature = features[index];
      if (!feature) {
        continue;
      }

      const path = featurePaths[index] ?? pathGenerator(feature);
      if (!path) {
        continue;
      }

      items.push({
        index,
        path,
        fill: resolveFeatureFill(
          feature,
          index,
          fill,
          getFeatureColor,
          getFeaturePattern
        ),
        feature,
        centroid: featureCentroids[index] ?? null,
      });
    }
    return items;
  }, [
    featureCentroids,
    featurePaths,
    features,
    fill,
    getFeatureColor,
    getFeaturePattern,
    pathGenerator,
  ]);

  const recordsByIndex = useMemo(() => {
    const lookup = new Map<number, FeatureRecord>();
    for (const record of records) {
      lookup.set(record.index, record);
    }
    return lookup;
  }, [records]);

  const handleFeatureEnter = useCallback(
    (index: number) => {
      const record = recordsByIndex.get(index);
      if (!record) {
        return;
      }
      setHoveredFeatureIndex(record.index);
      setTooltipData({
        featureIndex: record.index,
        x: record.centroid?.x ?? width / 2,
        y: record.centroid?.y ?? height / 2,
        feature: record.feature,
      });
    },
    [height, recordsByIndex, setHoveredFeatureIndex, setTooltipData, width]
  );

  const handleFeatureLeave = useCallback(() => {
    setHoveredFeatureIndex(null);
    setTooltipData(null);
  }, [setHoveredFeatureIndex, setTooltipData]);

  const layerProps = {
    baseOpacity: 0.85,
    dimOpacity: fadedOpacity,
    hoveredIndex: hoveredFeatureIndex,
    onFeatureEnter: handleFeatureEnter,
    onFeatureLeave: handleFeatureLeave,
    records,
    stroke,
    strokeWidth,
  };

  return (
    <g className="choropleth-features">
      {patterns ? <defs>{patterns}</defs> : null}
      {isLoaded ? (
        <StaticFeatureLayer {...layerProps} />
      ) : (
        <EnterFeatureLayer {...layerProps} revealEpoch={revealEpoch} />
      )}
    </g>
  );
});

ChoroplethFeature.displayName = "ChoroplethFeature";

export default ChoroplethFeature;
