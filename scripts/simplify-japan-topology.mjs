#!/usr/bin/env node
/**
 * Simplifies public/static/japan.topo.json in place, the same "generated asset
 * committed to the repo" model scripts/vendor-world-topology.mjs follows.
 *
 * Why: the source topology carries ~59.5k vertices across 1,019 rings for 47
 * prefectures — roughly 13-19x finer than a single screen pixel at the size the
 * Regional Map actually renders (and ~19x on a 360px phone). That detail is
 * invisible but the browser still projects, serialises and rasterises every
 * point of it, which is what made the prefectural map sluggish.
 *
 * How: Visvalingam-Whyatt on the topology's *shared arcs*, never on decoded
 * rings. Arcs are precisely the mechanism that keeps neighbouring prefecture
 * borders welded together; simplifying each ring independently would tear the
 * shared seams open. Arc endpoints are junctions between arcs and are always
 * preserved, so the topology stays consistent by construction.
 *
 * The threshold is expressed in screen pixels rather than degrees so it tracks
 * how the map is actually drawn: GeographicDistributionChart uses
 * `scale={(innerWidth) => innerWidth * 1.55}`, so a ~900px-wide map projects at
 * a Mercator scale of ~1395. We keep detail down to 0.25px^2 at 4x zoom, which
 * is visually lossless at the default view and holds up when zoomed in.
 *
 * Idempotency: the output records a `simplified` metadata block and the script
 * refuses to run against an already-simplified file, so it can never be applied
 * twice. To regenerate from the pristine source, restore it first:
 *
 *   git show 307dd13:public/static/japan.topo.json > public/static/japan.topo.json
 *   node scripts/simplify-japan-topology.mjs
 *
 * Usage: node scripts/simplify-japan-topology.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'public/static/japan.topo.json';
const DRY_RUN = process.argv.includes('--dry-run');

/** Mercator scale the Regional Map projects at on a ~900px-wide viewport. */
const FIT_SCALE = 1395;
/** Zoom level the simplified geometry should still look crisp at. */
const CRISP_TO_ZOOM = 4;
/** Vertex is dropped when its effective area falls below this, in px^2. */
const VERTEX_TOLERANCE_PX2 = 0.25;
/** Whole ring is dropped when its area falls below this, in px^2. */
const RING_TOLERANCE_PX2 = 1;

/** Triangle area for three points, in quantized units^2. */
function triangleArea(a, b, c) {
  return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
}

/** Shoelace area of a closed point sequence, in quantized units^2. */
function ringArea(points) {
  let sum = 0;
  for (let i = 0, n = points.length; i < n; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % n];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum / 2);
}

/**
 * Visvalingam-Whyatt: repeatedly drop the vertex whose triangle with its two
 * neighbours is smallest, until every remaining vertex clears `tolerance`.
 * First and last points are junctions shared with adjacent arcs and are kept.
 */
function simplifyArc(points, tolerance) {
  if (points.length <= 2) return points;

  // Doubly linked list over the point indices, so removals are O(1).
  const prev = new Int32Array(points.length);
  const next = new Int32Array(points.length);
  const area = new Float64Array(points.length);
  const alive = new Uint8Array(points.length).fill(1);

  for (let i = 0; i < points.length; i++) {
    prev[i] = i - 1;
    next[i] = i + 1;
  }
  next[points.length - 1] = -1;

  const recompute = (i) => {
    if (i <= 0 || i >= points.length - 1 || !alive[i]) return;
    area[i] = triangleArea(points[prev[i]], points[i], points[next[i]]);
  };
  for (let i = 1; i < points.length - 1; i++) recompute(i);

  let remaining = points.length;
  for (;;) {
    let minIndex = -1;
    let minArea = Infinity;
    for (let i = 1; i < points.length - 1; i++) {
      if (alive[i] && area[i] < minArea) {
        minArea = area[i];
        minIndex = i;
      }
    }
    // Two points (the endpoints) is the floor — the arc is then a straight
    // segment between its junctions, which is still topologically valid.
    if (minIndex === -1 || minArea >= tolerance || remaining <= 2) break;

    alive[minIndex] = 0;
    remaining--;
    next[prev[minIndex]] = next[minIndex];
    prev[next[minIndex]] = prev[minIndex];
    recompute(prev[minIndex]);
    recompute(next[minIndex]);
  }

  const out = [];
  for (let i = 0; i < points.length; i++) if (alive[i]) out.push(points[i]);
  return out;
}

/** Absolute coordinates for a ring's arc index list. */
function ringPoints(ringArcs, arcs) {
  const points = [];
  for (const index of ringArcs) {
    const reversed = index < 0;
    const arc = arcs[reversed ? ~index : index];
    const sequence = reversed ? arc.slice().reverse() : arc;
    // Consecutive arcs share a junction point; drop the duplicate.
    points.push(...(points.length ? sequence.slice(1) : sequence));
  }
  return points;
}

const topology = JSON.parse(readFileSync(FILE, 'utf8'));

if (topology.simplified) {
  console.error(
    `${FILE} is already simplified (${topology.simplified.vertices} vertices).\n` +
      'Restore the pristine source before re-running — see the header of this script.'
  );
  process.exit(1);
}
if (!topology.transform) {
  console.error(`${FILE} is not quantized; this script expects a quantized topology.`);
  process.exit(1);
}

const [scaleX] = topology.transform.scale;
// Pixels per quantized unit: quantized units are degrees of longitude scaled by
// transform.scale, and Mercator maps a degree of longitude to scale * pi/180 px.
const pixelsPerUnit = FIT_SCALE * (Math.PI / 180) * scaleX * CRISP_TO_ZOOM;
const vertexTolerance = VERTEX_TOLERANCE_PX2 / pixelsPerUnit ** 2;
const ringTolerance = RING_TOLERANCE_PX2 / pixelsPerUnit ** 2;

// Delta-decode arcs to absolute quantized coordinates.
const absoluteArcs = topology.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x, y];
  });
});

const before = {
  bytes: readFileSync(FILE).length,
  arcs: absoluteArcs.length,
  vertices: absoluteArcs.reduce((sum, arc) => sum + arc.length, 0),
};

const simplifiedArcs = absoluteArcs.map((arc) => simplifyArc(arc, vertexTolerance));

// Drop rings that are now sub-pixel specks. Every feature keeps its largest
// polygon no matter what, so no prefecture can vanish from the map.
let droppedRings = 0;
for (const object of Object.values(topology.objects)) {
  const geometries = object.geometries ?? [object];
  for (const geometry of geometries) {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') continue;
    const polygons = geometry.type === 'MultiPolygon' ? geometry.arcs : [geometry.arcs];

    const measured = polygons.map((polygon) => ({
      polygon,
      area: ringArea(ringPoints(polygon[0], simplifiedArcs)),
    }));
    let largest = 0;
    for (let i = 1; i < measured.length; i++) {
      if (measured[i].area > measured[largest].area) largest = i;
    }

    const kept = [];
    for (let i = 0; i < measured.length; i++) {
      if (i !== largest && measured[i].area < ringTolerance) {
        droppedRings += measured[i].polygon.length;
        continue;
      }
      // Keep the outer ring, then any hole still big enough to see.
      const [outer, ...holes] = measured[i].polygon;
      const keptHoles = holes.filter((hole) => {
        if (ringArea(ringPoints(hole, simplifiedArcs)) >= ringTolerance) return true;
        droppedRings++;
        return false;
      });
      kept.push([outer, ...keptHoles]);
    }

    if (geometry.type === 'MultiPolygon') {
      geometry.arcs = kept;
    } else {
      geometry.arcs = kept[0] ?? [];
    }
  }
}

// Reindex so arcs no longer referenced by any geometry drop out of the file.
const used = new Set();
for (const object of Object.values(topology.objects)) {
  const geometries = object.geometries ?? [object];
  for (const geometry of geometries) {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') continue;
    const polygons = geometry.type === 'MultiPolygon' ? geometry.arcs : [geometry.arcs];
    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const index of ring) used.add(index < 0 ? ~index : index);
      }
    }
  }
}

const remap = new Map();
const finalArcs = [];
for (let i = 0; i < simplifiedArcs.length; i++) {
  if (!used.has(i)) continue;
  remap.set(i, finalArcs.length);
  finalArcs.push(simplifiedArcs[i]);
}
for (const object of Object.values(topology.objects)) {
  const geometries = object.geometries ?? [object];
  for (const geometry of geometries) {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') continue;
    const polygons = geometry.type === 'MultiPolygon' ? geometry.arcs : [geometry.arcs];
    for (const polygon of polygons) {
      for (let r = 0; r < polygon.length; r++) {
        polygon[r] = polygon[r].map((index) =>
          index < 0 ? ~remap.get(~index) : remap.get(index)
        );
      }
    }
  }
}

// Delta-encode back to the same quantized grid the source used.
topology.arcs = finalArcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([px, py]) => {
    const delta = [px - x, py - y];
    x = px;
    y = py;
    return delta;
  });
});

const after = {
  arcs: topology.arcs.length,
  vertices: finalArcs.reduce((sum, arc) => sum + arc.length, 0),
};

topology.simplified = {
  method: 'visvalingam-whyatt on shared arcs',
  crispToZoom: CRISP_TO_ZOOM,
  vertexTolerancePx2: VERTEX_TOLERANCE_PX2,
  ringTolerancePx2: RING_TOLERANCE_PX2,
  vertices: after.vertices,
  sourceVertices: before.vertices,
};

const output = `${JSON.stringify(topology)}\n`;

console.log(`arcs      ${before.arcs} -> ${after.arcs}`);
console.log(
  `vertices  ${before.vertices} -> ${after.vertices}` +
    ` (${((100 * after.vertices) / before.vertices).toFixed(1)}% kept)`
);
console.log(`rings dropped: ${droppedRings}`);
console.log(
  `bytes     ${before.bytes} -> ${output.length}` +
    ` (${((100 * output.length) / before.bytes).toFixed(1)}%)`
);

if (DRY_RUN) {
  console.log('\n--dry-run: no file written.');
} else {
  writeFileSync(FILE, output);
  console.log(`\nwrote ${FILE}`);
}
