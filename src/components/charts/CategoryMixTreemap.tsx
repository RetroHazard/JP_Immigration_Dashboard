// src/components/charts/CategoryMixTreemap.tsx
// Zoomable hierarchical treemap of the Category Mix: all applications at the
// root, categories as blocks, bureaus nested inside. Click a category to zoom
// into its full bureau breakdown; click the background (or Esc) to zoom out.
//
// The live Category Mix view. CategoryMixSunburst renders the same hierarchy
// (shared buildCategoryMixTree, same props contract) as a sunburst — swapping
// the `mix` entry in ChartComponents.tsx is all it takes to switch.
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type React from 'react';

import type { MixTree } from '../../utils/categoryMixTree';
import { buildCategoryMixTree, mixLeafColor } from '../../utils/categoryMixTree';
import type { ImmigrationChartData } from '../common/ChartComponents';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  op: number;
}

interface Item {
  key: string;
  value: number;
}

// Squarified treemap (Bruls et al.): fills width × height keeping rectangles
// as close to square as possible.
const squarify = (items: Item[], x: number, y: number, w: number, h: number): Record<string, Rect> => {
  const out: Record<string, Rect> = {};
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0 || w <= 0 || h <= 0) {
    items.forEach((item) => {
      out[item.key] = { x, y, w: 0, h: 0, op: 0 };
    });
    return out;
  }
  const scale = (w * h) / total;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  let cx = x,
    cy = y,
    cw = w,
    ch = h,
    rowSum = 0;
  let row: Item[] = [];
  const worst = (arr: Item[], sum: number, side: number) => {
    const thickness = (sum * scale) / side;
    return arr.reduce((max, item) => {
      const length = (item.value * scale) / thickness;
      return Math.max(max, thickness / length, length / thickness);
    }, 0);
  };
  const layoutRow = (arr: Item[], sum: number) => {
    const area = sum * scale;
    if (cw < ch) {
      const thickness = area / cw;
      let px = cx;
      for (const item of arr) {
        const length = (item.value * scale) / thickness;
        out[item.key] = { x: px, y: cy, w: length, h: thickness, op: 1 };
        px += length;
      }
      cy += thickness;
      ch -= thickness;
    } else {
      const thickness = area / ch;
      let py = cy;
      for (const item of arr) {
        const length = (item.value * scale) / thickness;
        out[item.key] = { x: cx, y: py, w: thickness, h: length, op: 1 };
        py += length;
      }
      cx += thickness;
      cw -= thickness;
    }
  };
  for (const item of sorted) {
    if (item.value <= 0) {
      out[item.key] = { x: cx, y: cy, w: 0, h: 0, op: 0 };
      continue;
    }
    const side = Math.min(cw, ch);
    if (row.length && worst([...row, item], rowSum + item.value, side) > worst(row, rowSum, side)) {
      layoutRow(row, rowSum);
      row = [];
      rowSum = 0;
    }
    row.push(item);
    rowSum += item.value;
  }
  if (row.length) layoutRow(row, rowSum);
  return out;
};

const HEAD = 24; // category title bar height
const GAP = 5; // gap between category blocks
const TOP_N = 6; // leaves shown per category at the root; the rest fold into "Others"

// layout(focus) → every tile's rect, so the same keyed set animates between views
const computeLayout = (tree: MixTree, focusKey: string | null, width: number, height: number) => {
  const out: Record<string, Rect> = {};
  if (width <= 0) return out;

  if (focusKey === null) {
    const catRects = squarify(
      tree.categories.map((category) => ({ key: 'c:' + category.key, value: category.value })),
      0,
      0,
      width,
      height
    );
    for (const category of tree.categories) {
      const rect = catRects['c:' + category.key];
      const inset = { x: rect.x + GAP / 2, y: rect.y + GAP / 2, w: Math.max(0, rect.w - GAP), h: Math.max(0, rect.h - GAP) };
      out['c:' + category.key] = { ...inset, op: 1 };
      const shown = category.children.slice(0, TOP_N);
      const rest = category.children.slice(TOP_N).reduce((sum, leaf) => sum + leaf.value, 0);
      const items = shown.map((leaf) => ({ key: `b:${category.key}:${leaf.name}`, value: leaf.value }));
      if (rest > 0) items.push({ key: `b:${category.key}:__rest`, value: rest });
      const leafRects = squarify(items, inset.x + 4, inset.y + HEAD, Math.max(0, inset.w - 8), Math.max(0, inset.h - HEAD - 4));
      for (const key in leafRects) {
        const leaf = leafRects[key];
        out[key] = { x: leaf.x + 1, y: leaf.y + 1, w: Math.max(0, leaf.w - 2), h: Math.max(0, leaf.h - 2), op: 1 };
      }
      for (const leaf of category.children.slice(TOP_N)) {
        out[`b:${category.key}:${leaf.name}`] = { x: inset.x + inset.w / 2, y: inset.y + inset.h / 2, w: 0, h: 0, op: 0 };
      }
    }
  } else {
    for (const category of tree.categories) {
      if (category.key === focusKey) {
        out['c:' + category.key] = { x: 0, y: 0, w: width, h: height, op: 1 };
        const leafRects = squarify(
          category.children.map((leaf) => ({ key: `b:${category.key}:${leaf.name}`, value: leaf.value })),
          5,
          HEAD + 2,
          width - 10,
          height - HEAD - 8
        );
        for (const key in leafRects) {
          const leaf = leafRects[key];
          out[key] = { x: leaf.x + 1.5, y: leaf.y + 1.5, w: Math.max(0, leaf.w - 3), h: Math.max(0, leaf.h - 3), op: 1 };
        }
        out[`b:${category.key}:__rest`] = { x: width / 2, y: height / 2, w: 0, h: 0, op: 0 };
      } else {
        const gone = { x: width / 2, y: height, w: 0, h: 0, op: 0 };
        out['c:' + category.key] = gone;
        for (const leaf of category.children) out[`b:${category.key}:${leaf.name}`] = gone;
        out[`b:${category.key}:__rest`] = gone;
      }
    }
  }
  return out;
};

const fmt = (value: number) => value.toLocaleString('en-US');
const HEIGHT = 430;
const TILE_TRANSITION = 'left 0.42s ease-out, top 0.42s ease-out, width 0.42s ease-out, height 0.42s ease-out, opacity 0.42s ease-out';

export const CategoryMixTreemap: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const tree = useMemo(() => buildCategoryMixTree(data, filters, range), [data, filters, range]);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // A focused category can disappear when filters change; fall back to the root.
  useEffect(() => {
    if (focusKey !== null && !tree.categories.some((category) => category.key === focusKey)) {
      setFocusKey(null);
    }
  }, [tree, focusKey]);

  const zoomOut = useCallback(() => setFocusKey(null), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') zoomOut();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomOut]);

  const layout = useMemo(() => computeLayout(tree, focusKey, width, HEIGHT), [tree, focusKey, width]);
  const focused = focusKey !== null ? tree.categories.find((category) => category.key === focusKey) : undefined;

  if (tree.total === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  const tileStyle = (rect: Rect | undefined): React.CSSProperties =>
    rect
      ? {
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          opacity: rect.op,
          pointerEvents: rect.op < 0.5 || rect.w < 2 ? 'none' : 'auto',
        }
      : { opacity: 0, pointerEvents: 'none' };

  return (
    <div className="card-content">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Treemap drill-down path">
          <button
            onClick={zoomOut}
            disabled={focusKey === null}
            className="rounded font-medium text-primary hover:opacity-80 disabled:font-semibold disabled:text-foreground"
          >
            All applications
          </button>
          {focused && (
            <>
              <span aria-hidden="true">›</span>
              <span className="font-semibold text-foreground">{focused.name}</span>
            </>
          )}
        </nav>
        <span className="text-xxs text-muted-foreground">
          {focusKey === null ? 'Click a category to zoom in' : 'Click the background (or press Esc) to zoom out'}
        </span>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-muted"
        style={{ height: HEIGHT }}
        onClick={zoomOut}
      >
        {tree.categories.map((category) => {
          const rect = layout['c:' + category.key];
          const compact = rect !== undefined && (rect.w < 150 || rect.h < 34);
          const tiny = rect !== undefined && (rect.w < 60 || rect.h < 34);
          return (
            <button
              key={category.key}
              aria-label={`${category.name}: ${fmt(category.value)} applications. Zoom in.`}
              onClick={(event) => {
                event.stopPropagation();
                if (focusKey === null) setFocusKey(category.key);
              }}
              className="absolute overflow-hidden rounded-lg text-left motion-reduce:transition-none"
              style={{ ...tileStyle(rect), background: category.color, transition: TILE_TRANSITION }}
            >
              {!tiny && (
                <span className="flex items-baseline justify-between gap-2 whitespace-nowrap px-2.5 pt-1.5 text-xs font-bold text-background">
                  <span className="overflow-hidden text-ellipsis">{category.name}</span>
                  {!compact && (
                    <span className="font-mono text-xxs font-semibold opacity-85">
                      {((category.value / tree.total) * 100).toFixed(1)}%
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
        {tree.categories.flatMap((category) => {
          const base = focusKey === category.key ? category.value : tree.total;
          const leaves = [
            ...category.children.map((leaf, rank) => ({ leaf, rank, rest: false })),
            { leaf: { name: '__rest', value: 0 }, rank: TOP_N + 1, rest: true },
          ];
          return leaves.map(({ leaf, rank, rest }) => {
            const key = `b:${category.key}:${leaf.name}`;
            const rect = layout[key];
            const showLabel = rect !== undefined && rect.w > 74 && rect.h > 30;
            return (
              <div
                key={key}
                title={rest ? undefined : `${leaf.name} · ${category.short}: ${fmt(leaf.value)} applications`}
                className="absolute overflow-hidden rounded-md text-foreground motion-reduce:transition-none"
                style={{ ...tileStyle(rect), background: mixLeafColor(category.color, rank), transition: TILE_TRANSITION }}
                onClick={(event) => {
                  // At the root a leaf click zooms into its category; when
                  // focused it bubbles to the background and zooms out.
                  if (focusKey === null) {
                    event.stopPropagation();
                    setFocusKey(category.key);
                  }
                }}
              >
                {showLabel && (
                  <span className="flex flex-col px-2 py-1 text-xs font-semibold leading-tight">
                    <span>{rest ? 'Others' : leaf.name}</span>
                    {!rest && (
                      <span className="font-mono text-xxs font-medium opacity-75">
                        {fmt(leaf.value)} · {((leaf.value / base) * 100).toFixed(1)}%
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
