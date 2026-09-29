// LOCAL ADDITION: not in the Bklit registry, so a re-vendor keeps this file
// but drops its imports in sankey-node.tsx and sankey-link.tsx (re-apply those).
//
// Transitive hover connectivity for multi-tier sankeys; the stock 1-hop hover
// dims the status groups a hovered region's residents flow into. Walks strictly
// downstream and strictly upstream, never re-reversing, so a region doesn't
// reach its sibling regions through a shared middle node.
import type { SankeyLink as SankeyLinkType, SankeyNode as SankeyNodeType } from "d3-sankey";
import type { SankeyLinkDatum, SankeyNodeDatum } from "./sankey-context";

type LaidOutLink = SankeyLinkType<SankeyNodeDatum, SankeyLinkDatum>;
type NodeOrIndex = SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum> | number;

const indexOf = (nodeOrIndex: NodeOrIndex): number | undefined =>
  typeof nodeOrIndex === "number" ? nodeOrIndex : nodeOrIndex.index;

/**
 * Every node reachable from `nodeIndex` by walking links forward only, plus
 * every node reachable by walking backward only, plus the node itself.
 */
export function getReachableNodes(
  links: readonly LaidOutLink[],
  nodeIndex: number
): Set<number> {
  const downstream = new Map<number, number[]>();
  const upstream = new Map<number, number[]>();
  for (const link of links) {
    const source = indexOf(link.source as NodeOrIndex);
    const target = indexOf(link.target as NodeOrIndex);
    if (source === undefined || target === undefined) {
      continue;
    }
    (downstream.get(source) ?? downstream.set(source, []).get(source))?.push(
      target
    );
    (upstream.get(target) ?? upstream.set(target, []).get(target))?.push(
      source
    );
  }

  const reachable = new Set<number>([nodeIndex]);
  const walk = (edges: Map<number, number[]>) => {
    const queue = [nodeIndex];
    const seen = new Set<number>([nodeIndex]);
    while (queue.length > 0) {
      const current = queue.pop();
      if (current === undefined) {
        break;
      }
      for (const next of edges.get(current) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          reachable.add(next);
          queue.push(next);
        }
      }
    }
  };
  walk(downstream);
  walk(upstream);
  return reachable;
}
