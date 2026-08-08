// LOCAL ADDITION: not part of the vendored Bklit registry (vendor-bklit.mjs
// will not overwrite it, but the imports in sankey-node.tsx/sankey-link.tsx
// that reference it are LOCAL MODIFICATIONS and would need re-applying after
// a re-vendor).
//
// Transitive connectivity for multi-tier sankeys. The stock hover logic is
// 1-hop, which reads as broken on a three-column chart: hovering a region
// would dim the very status groups its residents flow into. This walks the
// link graph strictly downstream and strictly upstream from a node — never
// re-reversing direction, so a region does not reach its sibling regions
// through a shared middle node.
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
