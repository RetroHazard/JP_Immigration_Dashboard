"use client";

import type { SankeyNode as SankeyNodeType } from "d3-sankey";
import { motion, type Transition } from "motion/react";
import { type ReactNode, useCallback, useMemo } from "react";
import { intFmt } from "../chart-formatters";
import { transitionWithDelay } from "../motion-utils";
// LOCAL MODIFICATION: transitive hover connectivity for multi-tier sankeys.
import { getReachableNodes } from "./sankey-connectivity";
import {
  type SankeyLinkDatum,
  type SankeyNodeDatum,
  useSankey,
} from "./sankey-context";

// Helper to get node index from link source/target
type NodeOrIndex = SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum> | number;

export type SankeyLabelOrientation = "horizontal" | "vertical";

function getNodeIndex(nodeOrIndex: NodeOrIndex): number | undefined {
  if (typeof nodeOrIndex === "number") {
    return nodeOrIndex;
  }
  return nodeOrIndex.index;
}

export interface SankeyNodeProps {
  /** Fill color for nodes. Default: uses theme colors */
  fill?: string;
  /** Corner radius for nodes. Default: 4 */
  lineCap?: number;
  /** Opacity when another node/link is hovered. Default: 0.4 */
  fadedOpacity?: number;
  /** Show node labels. Default: true */
  showLabels?: boolean;
  /** Show value labels under node names. Default: true */
  showValueLabels?: boolean;
  /** Unit suffix for value labels. Default: "sessions" (local extension) */
  valueUnit?: string;
  /**
   * Label reading direction for outside node labels.
   * - "horizontal": labels sit left/right of nodes (default).
   * - "vertical": labels rotate 90° and read along the node edge.
   */
  labelOrientation?: SankeyLabelOrientation;
  /** Custom node color function */
  getNodeColor?: (
    node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>,
    index: number
  ) => string;
  /**
   * LOCAL MODIFICATION: show name labels on middle-tier nodes (three-column
   * sankeys). Middle labels render centered above the node; there is no
   * collision avoidance, so narrow charts pass false. Default: true.
   */
  showMiddleLabels?: boolean;
}

type TextAnchor = "start" | "middle" | "end";

// LOCAL MODIFICATION: label side is derived from the node's column rather
// than its x-position, so a three-column sankey gets 'middle' for its inner
// tier instead of drawing its labels leftward over the incoming ribbons.
// Two-column charts resolve to left/right exactly as before.
type LabelSide = "left" | "middle" | "right";

interface NodeLabelLayout {
  x: number;
  y: number;
  textAnchor: TextAnchor;
  dy: string;
  textLocalX: number;
  rotate: number;
  initialX: number;
  initialY: number;
}

const LABEL_OFFSET = 12;
const VALUE_LABEL_GAP = 16;

function getNodeLabelLayouts({
  labelOrientation,
  labelSide,
  x,
  y,
  width,
  height,
  showValueLabels,
}: {
  labelOrientation: SankeyLabelOrientation;
  labelSide: LabelSide;
  x: number;
  y: number;
  width: number;
  height: number;
  showValueLabels: boolean;
}): { name: NodeLabelLayout; value: NodeLabelLayout | null } {
  const centerY = y + height / 2;
  const isLeftSide = labelSide === "left";
  const initialX = isLeftSide ? x + 8 : x + width - 8;

  // LOCAL MODIFICATION: middle-tier labels sit centered above the node —
  // any left/right placement would draw them across a ribbon bundle. Never
  // a value sublabel (no room; d3 gives short nodes only a few px).
  if (labelSide === "middle") {
    const centerX = x + width / 2;
    return {
      name: {
        x: centerX,
        y: y - 7,
        textAnchor: "middle",
        dy: "0",
        textLocalX: 0,
        rotate: 0,
        initialX: centerX,
        initialY: y + 4,
      },
      value: null,
    };
  }

  if (labelOrientation === "horizontal") {
    const labelX = isLeftSide ? x - LABEL_OFFSET : x + width + LABEL_OFFSET;
    const textAnchor: TextAnchor = isLeftSide ? "end" : "start";

    return {
      name: {
        x: labelX,
        y: centerY,
        textAnchor,
        dy: "0.35em",
        textLocalX: 0,
        rotate: 0,
        initialX,
        initialY: centerY,
      },
      value: showValueLabels
        ? {
            x: labelX,
            y: centerY + VALUE_LABEL_GAP,
            textAnchor,
            dy: "0.35em",
            textLocalX: 0,
            rotate: 0,
            initialX,
            initialY: centerY + VALUE_LABEL_GAP,
          }
        : null,
    };
  }

  const labelX = isLeftSide ? x - LABEL_OFFSET : x + width + LABEL_OFFSET;
  const rotate = isLeftSide ? -90 : 90;
  const halfGap = VALUE_LABEL_GAP / 2;
  let nameLocalX = 0;
  if (showValueLabels) {
    nameLocalX = isLeftSide ? halfGap : -halfGap;
  }
  const valueLocalX = isLeftSide ? -halfGap : halfGap;

  return {
    name: {
      x: labelX,
      y: centerY,
      textAnchor: "middle",
      dy: "0.35em",
      textLocalX: nameLocalX,
      rotate,
      initialX,
      initialY: centerY,
    },
    value: showValueLabels
      ? {
          x: labelX,
          y: centerY,
          textAnchor: "middle",
          dy: "0.35em",
          textLocalX: valueLocalX,
          rotate,
          initialX,
          initialY: centerY,
        }
      : null,
  };
}

interface AnimatedNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rx: number;
  index: number;
  totalNodes: number;
  isFaded: boolean;
  fadedOpacity: number;
  animationDuration: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  name: string;
  value: number;
  labelSide: LabelSide;
  showLabels: boolean;
  showValueLabels: boolean;
  valueUnit: string;
  labelOrientation: SankeyLabelOrientation;
}

function NodeLabel({
  layout,
  opacity,
  transition,
  className,
  children,
}: {
  layout: NodeLabelLayout;
  opacity: number;
  transition: Transition;
  className: string;
  children: ReactNode;
}) {
  return (
    <motion.g
      animate={{
        opacity,
        x: layout.x,
        y: layout.y,
        rotate: layout.rotate,
      }}
      initial={{
        opacity: 0,
        x: layout.initialX,
        y: layout.initialY,
        rotate: layout.rotate,
      }}
      transition={transition}
    >
      <text
        className={className}
        dy={layout.dy}
        textAnchor={layout.textAnchor}
        x={layout.textLocalX}
      >
        {children}
      </text>
    </motion.g>
  );
}

function AnimatedNode({
  valueUnit,
  x,
  y,
  width,
  height,
  fill,
  rx,
  index,
  totalNodes,
  isFaded,
  fadedOpacity,
  animationDuration,
  onMouseEnter,
  onMouseLeave,
  name,
  value,
  labelSide,
  showLabels,
  showValueLabels,
  labelOrientation,
}: AnimatedNodeProps) {
  const { enterTransition, revealEpoch } = useSankey();

  const nodeAnimDuration = animationDuration * 0.6;
  const staggerDelaySec =
    ((index / totalNodes) * nodeAnimDuration * 0.4) / 1000;
  const nameLabelDelaySec =
    staggerDelaySec + (nodeAnimDuration * 0.6 * 0.3) / 1000;
  const valueLabelDelaySec = nameLabelDelaySec + 0.06;

  const nodeEnter = transitionWithDelay(enterTransition, staggerDelaySec);
  const nameEnter = transitionWithDelay(enterTransition, nameLabelDelaySec);
  const valueEnter = transitionWithDelay(enterTransition, valueLabelDelaySec);
  const nodeOpacity = isFaded ? fadedOpacity : 1;
  const nameOpacity = isFaded ? fadedOpacity : 1;
  const valueOpacity = isFaded ? fadedOpacity * 0.8 : 0.6;
  const labelLayouts = getNodeLabelLayouts({
    labelOrientation,
    labelSide,
    x,
    y,
    width,
    height,
    showValueLabels,
  });

  return (
    <motion.g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <motion.rect
        animate={{ opacity: nodeOpacity, scaleY: 1 }}
        fill={fill}
        height={height}
        initial={{ opacity: 0, scaleY: 0 }}
        key={`node-${index}-${revealEpoch}`}
        rx={rx}
        ry={rx}
        style={{ originY: 0.5 }}
        transition={nodeEnter}
        width={width}
        x={x}
        y={y}
      />
      {showLabels ? (
        <>
          <NodeLabel
            className="fill-foreground font-medium text-[13px]"
            key={`name-${index}-${revealEpoch}`}
            layout={labelLayouts.name}
            opacity={nameOpacity}
            transition={nameEnter}
          >
            {name}
          </NodeLabel>
          {labelLayouts.value ? (
            <NodeLabel
              className="fill-foreground text-[11px]"
              key={`value-${index}-${revealEpoch}`}
              layout={labelLayouts.value}
              opacity={valueOpacity}
              transition={valueEnter}
            >
              {intFmt(value)} {valueUnit}
            </NodeLabel>
          ) : null}
        </>
      ) : null}
    </motion.g>
  );
}

export function SankeyNode({
  fill,
  lineCap = 4,
  fadedOpacity = 0.4,
  showLabels = true,
  showValueLabels = true,
  showMiddleLabels = true,
  valueUnit = "sessions",
  labelOrientation = "horizontal",
  getNodeColor: getNodeColorProp,
}: SankeyNodeProps) {
  const {
    nodes,
    links,
    width,
    margin,
    hoveredNodeIndex,
    hoveredLinkIndex,
    setHoveredNodeIndex,
    setTooltipData,
    animationDuration,
  } = useSankey();

  // Default colors using CSS variables
  const defaultColors = useMemo(
    () => [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ],
    []
  );

  // Get color for a node
  const getColor = useCallback(
    (
      node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>,
      index: number
    ): string => {
      if (fill) {
        return fill;
      }
      if (getNodeColorProp) {
        return getNodeColorProp(node, index);
      }

      return defaultColors[index % defaultColors.length] ?? "var(--chart-1)";
    },
    [fill, getNodeColorProp, defaultColors]
  );

  // LOCAL MODIFICATION: hover connectivity is transitive rather than 1-hop,
  // so on a three-tier chart hovering a source lights the whole path through
  // the middle tier. Hovering a single link stays 1-hop.
  const reachableFromHovered = useMemo(
    () =>
      hoveredNodeIndex !== null
        ? getReachableNodes(links, hoveredNodeIndex)
        : null,
    [hoveredNodeIndex, links]
  );

  // Check if a node is connected to the hovered element
  const isNodeConnected = useCallback(
    (nodeIndex: number) => {
      if (reachableFromHovered !== null) {
        return reachableFromHovered.has(nodeIndex);
      }
      if (hoveredLinkIndex !== null) {
        const link = links[hoveredLinkIndex];
        if (!link) {
          return false;
        }
        const sIdx = getNodeIndex(link.source as NodeOrIndex);
        const tIdx = getNodeIndex(link.target as NodeOrIndex);
        return sIdx === nodeIndex || tIdx === nodeIndex;
      }
      return false;
    },
    [reachableFromHovered, hoveredLinkIndex, links]
  );

  const isAnyHovered = hoveredNodeIndex !== null || hoveredLinkIndex !== null;
  const innerWidth = width - margin.left - margin.right;

  // LOCAL MODIFICATION: the deepest column, for depth-based label sides.
  const maxDepth = useMemo(
    () => nodes.reduce((max, node) => Math.max(max, node.depth ?? 0), 0),
    [nodes]
  );

  return (
    <g className="sankey-nodes">
      {nodes.map((node, index) => {
        const nodeX = node.x0 ?? 0;
        const nodeY = node.y0 ?? 0;
        const nodeWidth = (node.x1 ?? 0) - nodeX;
        const nodeHeight = (node.y1 ?? 0) - nodeY;

        const isConnected = isNodeConnected(index);
        const isFaded = isAnyHovered && !isConnected;
        // LOCAL MODIFICATION: side from the node's column, not its x-position
        // (identical result for two-column charts). x-position stays the tie
        // breaker when d3 reports no depth.
        const depth = node.depth;
        let labelSide: LabelSide;
        if (depth === undefined) {
          labelSide = nodeX < innerWidth / 2 ? "left" : "right";
        } else if (depth === 0) {
          labelSide = "left";
        } else if (depth === maxDepth) {
          labelSide = "right";
        } else {
          labelSide = "middle";
        }

        let displayValue = 0;
        for (const l of links) {
          const sIdx = getNodeIndex(l.source as NodeOrIndex);
          const tIdx = getNodeIndex(l.target as NodeOrIndex);
          if (node.category === "source" && sIdx === index) {
            displayValue += l.value;
          } else if (node.category !== "source" && tIdx === index) {
            displayValue += l.value;
          }
        }

        const handleMouseEnter = () => {
          setHoveredNodeIndex(index);
          setTooltipData({
            type: "node",
            nodeIndex: index,
            x: 0,
            y: 0,
            data: node,
          });
        };

        const handleMouseLeave = () => {
          setHoveredNodeIndex(null);
          setTooltipData(null);
        };

        return (
          <AnimatedNode
            animationDuration={animationDuration}
            fadedOpacity={fadedOpacity}
            fill={getColor(node, index)}
            height={nodeHeight}
            index={index}
            isFaded={isFaded}
            labelSide={labelSide}
            // LOCAL MODIFICATION: index in the key — the same name can appear
            // in two tiers (無国籍 is both a region and a country).
            key={`node-${index}-${node.name}`}
            labelOrientation={labelOrientation}
            name={node.name}
            valueUnit={valueUnit}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            rx={lineCap}
            showLabels={showLabels && (labelSide !== "middle" || showMiddleLabels)}
            showValueLabels={showValueLabels}
            totalNodes={nodes.length}
            value={displayValue}
            width={nodeWidth}
            x={nodeX}
            y={nodeY}
          />
        );
      })}
    </g>
  );
}

SankeyNode.displayName = "SankeyNode";

export default SankeyNode;
