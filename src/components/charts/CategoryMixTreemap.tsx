// src/components/charts/CategoryMixTreemap.tsx
// Zoomable hierarchical treemap: a total at the root, categories as blocks,
// leaves nested inside. Click a category to zoom into its full breakdown;
// click the background (or Esc) to zoom out.
//
// `MixTreemap` is the presentation half and knows nothing about which dataset
// it is drawing — it takes a MixTree of codes plus the functions that turn
// those codes into words. `CategoryMixTreemap` binds it to the processing
// hierarchy (application type → bureau) and ResidenceStatusMixChart binds it
// to the residents one (status group → residence status).
//
// CategoryMixSunburst renders the processing hierarchy (shared
// buildCategoryMixTree, same props contract) as a sunburst — swapping the
// `mix` entry in ChartComponents.tsx is all it takes to switch.
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type React from 'react';
import { createPortal } from 'react-dom';

import { useCoarsePointer } from '../../hooks/useCoarsePointer';
import { useTapPin } from '../../hooks/useTapPin';
import { useLocale } from '../../i18n/LocaleContext';
import { useApplicationType, useBureauCompact, useBureauLabel } from '../../i18n/useDomainLabels';
import type { MixTree } from '../../utils/categoryMixTree';
import { buildCategoryMixTree, mixLeafColor } from '../../utils/categoryMixTree';
import type { ImmigrationChartData } from '../common/ChartComponents';

/**
 * Everything the treemap needs in words. Passed in rather than looked up so
 * the component stays free of any one dataset's domain constants — and so the
 * tile keys that drive the zoom animation remain codes, never display text.
 */
export interface MixTreemapLabels {
  /** Breadcrumb root, e.g. "All applications". */
  root: string;
  /** Scope phrase inside a tooltip, e.g. "all applications". */
  scopeAll: string;
  categoryLabel: (key: string) => string;
  categoryShort: (key: string) => string;
  leafLabel: (code: string) => string;
  leafCompact: (code: string) => string;
  categoryAria: (params: { category: string; count: string }) => string;
  tooltipValue: (params: { count: string; percent: string; scope: string }) => string;
}

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
      const items = shown.map((leaf) => ({ key: `b:${category.key}:${leaf.code}`, value: leaf.value }));
      if (rest > 0) items.push({ key: `b:${category.key}:__rest`, value: rest });
      const leafRects = squarify(items, inset.x + 4, inset.y + HEAD, Math.max(0, inset.w - 8), Math.max(0, inset.h - HEAD - 4));
      for (const key in leafRects) {
        const leaf = leafRects[key];
        out[key] = { x: leaf.x + 1, y: leaf.y + 1, w: Math.max(0, leaf.w - 2), h: Math.max(0, leaf.h - 2), op: 1 };
      }
      for (const leaf of category.children.slice(TOP_N)) {
        out[`b:${category.key}:${leaf.code}`] = { x: inset.x + inset.w / 2, y: inset.y + inset.h / 2, w: 0, h: 0, op: 0 };
      }
    }
  } else {
    for (const category of tree.categories) {
      if (category.key === focusKey) {
        out['c:' + category.key] = { x: 0, y: 0, w: width, h: height, op: 1 };
        const leafRects = squarify(
          category.children.map((leaf) => ({ key: `b:${category.key}:${leaf.code}`, value: leaf.value })),
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
        for (const leaf of category.children) out[`b:${category.key}:${leaf.code}`] = gone;
        out[`b:${category.key}:__rest`] = gone;
      }
    }
  }
  return out;
};

const HEIGHT = 430;
const TILE_TRANSITION =
  'left 0.42s ease-out, top 0.42s ease-out, width 0.42s ease-out, height 0.42s ease-out, opacity 0.42s ease-out, filter 0.15s';

export const MixTreemap: React.FC<{ tree: MixTree; labels: MixTreemapLabels }> = ({ tree, labels }) => {
  const { t, formatters } = useLocale();
  const fmt = formatters.number;
  const { categoryLabel, categoryShort, leafLabel, leafCompact } = labels;
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const coarsePointer = useCoarsePointer();

  // Tiles animate only between focus states. Renders caused by mount or a
  // container resize snap instantly, so tiles never "fly in" from stale rects.
  const widthRef = useRef(0);
  const widthStable = widthRef.current === width;
  useEffect(() => {
    widthRef.current = width;
  });

  // Cursor-following tooltip, driven imperatively so pointer moves never
  // re-render the ~90 tiles.
  const tipRef = useRef<HTMLDivElement>(null);
  const tipChipRef = useRef<HTMLSpanElement>(null);
  const tipNameRef = useRef<HTMLSpanElement>(null);
  const tipValueRef = useRef<HTMLDivElement>(null);
  const placeTip = (anchorX: number, anchorY: number) => {
    const tip = tipRef.current;
    if (!tip) return;
    const pad = 14;
    const bounds = tip.getBoundingClientRect();
    let x = anchorX + pad;
    let y = anchorY + pad;
    if (x + bounds.width > window.innerWidth - 8) x = anchorX - bounds.width - pad;
    if (y + bounds.height > window.innerHeight - 8) y = anchorY - bounds.height - pad;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  };
  const moveTip = (event: React.MouseEvent) => placeTip(event.clientX, event.clientY);
  const showTip = (event: React.MouseEvent, name: string, color: string, detail: string) => {
    showTipAt(event.clientX, event.clientY, name, color, detail);
  };
  const showTipAt = (anchorX: number, anchorY: number, name: string, color: string, detail: string) => {
    const tip = tipRef.current;
    if (!tip || !tipChipRef.current || !tipNameRef.current || !tipValueRef.current) return;
    tipChipRef.current.style.background = color;
    tipNameRef.current.textContent = name;
    tipValueRef.current.textContent = detail;
    tip.style.display = 'block';
    placeTip(anchorX, anchorY);
  };
  const hideTip = () => {
    if (tipRef.current) tipRef.current.style.display = 'none';
  };
  /** On touch the finger covers the tile, so anchor above it instead. */
  const showTipOnTile = (element: Element, name: string, color: string, detail: string) => {
    const rect = element.getBoundingClientRect();
    showTipAt(rect.left + rect.width / 2, rect.top, name, color, detail);
  };

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

  const tapMode = useTapPin({ enabled: coarsePointer, containerRef, onDismiss: hideTip });

  /**
   * A tile tap has to serve two purposes that a mouse got to keep separate:
   * inspecting and zooming. First tap shows the tooltip, second tap on the same
   * tile drills in — so the tooltip is reachable at all on touch, where a
   * single-tap zoom used to move the tile out from under the finger before it
   * could be read. Leaves have nothing to drill into, so their second tap just
   * closes.
   */
  const tapTile = (event: React.MouseEvent, key: string, drillTo: string | null, name: string, color: string, detail: string) => {
    event.stopPropagation();
    if (!tapMode) return;
    if (tapMode.tap(key) === 'unpinned') {
      hideTip();
      if (drillTo !== null) setFocusKey(drillTo);
      return;
    }
    showTipOnTile(event.currentTarget, name, color, detail);
  };

  const layout = useMemo(() => computeLayout(tree, focusKey, width, HEIGHT), [tree, focusKey, width]);
  const focused = focusKey !== null ? tree.categories.find((category) => category.key === focusKey) : undefined;

  if (tree.total === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        {t('common.noDataForFilters')}
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
          transition: widthStable ? TILE_TRANSITION : 'none',
        }
      : { opacity: 0, pointerEvents: 'none' };

  return (
    <div className="chart-card-content">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label={t('chart.mix.breadcrumbAria')}>
          <button
            onClick={zoomOut}
            disabled={focusKey === null}
            className="rounded font-medium text-primary hover:opacity-80 disabled:font-semibold disabled:text-foreground"
          >
            {labels.root}
          </button>
          {focused && (
            <>
              <span aria-hidden="true">›</span>
              <span className="font-semibold text-foreground">{categoryLabel(focused.key)}</span>
            </>
          )}
        </nav>
        <span className="text-xxs text-muted-foreground">
          {t(
            focusKey === null
              ? coarsePointer
                ? 'chart.mix.zoomInHintTap'
                : 'chart.mix.zoomInHint'
              : coarsePointer
                ? 'chart.mix.zoomOutHintTap'
                : 'chart.mix.zoomOutHint'
          )}
        </span>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-muted"
        style={{ height: HEIGHT }}
        onClick={() => {
          // On touch a background tap dismisses the tooltip first and only
          // zooms out once nothing is pinned, matching the tile behaviour.
          if (tapMode?.pinned) {
            tapMode.clear();
            hideTip();
            return;
          }
          zoomOut();
        }}
      >
        {tree.categories.map((category) => {
          const rect = layout['c:' + category.key];
          const compact = rect !== undefined && (rect.w < 150 || rect.h < 34);
          // Slightly below the old 60/34 cutoff: a category block just under
          // that size still had comfortable room for its name-only compact
          // form (the percent chip is what needed the extra width), so it
          // was going unlabeled for no reason tied to actual legibility.
          const tiny = rect !== undefined && (rect.w < 46 || rect.h < 26);
          return (
            <button
              key={category.key}
              aria-label={labels.categoryAria({
                category: categoryLabel(category.key),
                count: fmt(category.value),
              })}
              onClick={(event) => {
                if (tapMode) {
                  tapTile(
                    event,
                    `c:${category.key}`,
                    focusKey === null ? category.key : null,
                    categoryLabel(category.key),
                    category.color,
                    labels.tooltipValue({
                      count: fmt(category.value),
                      percent: formatters.percent((category.value / tree.total) * 100),
                      scope: labels.scopeAll,
                    })
                  );
                  return;
                }
                event.stopPropagation();
                hideTip();
                if (focusKey === null) setFocusKey(category.key);
              }}
              onMouseLeave={tapMode ? undefined : hideTip}
              onMouseMove={
                tapMode
                  ? undefined
                  : (event) =>
                      showTip(
                        event,
                        categoryLabel(category.key),
                        category.color,
                        labels.tooltipValue({
                          count: fmt(category.value),
                          percent: formatters.percent((category.value / tree.total) * 100),
                          scope: labels.scopeAll,
                        })
                      )
              }
              className="absolute overflow-hidden rounded-lg text-left hover:brightness-105 motion-reduce:transition-none"
              style={{
                ...tileStyle(rect),
                background: category.color,
                boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 0.06)',
              }}
            >
              {!tiny && (
                <span className="flex items-baseline justify-between gap-2 whitespace-nowrap px-2.5 pt-1.5 text-xs font-bold text-background">
                  <span className="overflow-hidden text-ellipsis">{categoryLabel(category.key)}</span>
                  {!compact && (
                    <span className="font-mono text-xxs font-semibold opacity-85">
                      {formatters.percent((category.value / tree.total) * 100)}
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
            { leaf: { code: '__rest', value: 0 }, rank: TOP_N + 1, rest: true },
          ];
          return leaves.map(({ leaf, rank, rest }) => {
            const key = `b:${category.key}:${leaf.code}`;
            const rect = layout[key];
            // Lowered from 74/30: a compact bureau label (single line, no
            // value row — see below) fits comfortably smaller than that, so
            // the old threshold was leaving more small tiles unlabeled than
            // the label itself needed.
            const showLabel = rect !== undefined && rect.w > 60 && rect.h > 24;
            const showLeafValue = rect !== undefined && rect.w > 74 && rect.h > 30;
            return (
              <div
                key={key}
                className="absolute cursor-pointer overflow-hidden rounded-md text-foreground hover:brightness-105 motion-reduce:transition-none"
                style={{ ...tileStyle(rect), background: mixLeafColor(category.color, rank) }}
                onClick={(event) => {
                  if (tapMode) {
                    // The `__rest` tile carries no figures, so it has nothing
                    // to inspect — it keeps the plain zoom behaviour.
                    if (rest) {
                      event.stopPropagation();
                      tapMode.clear();
                      hideTip();
                      if (focusKey === null) setFocusKey(category.key);
                      return;
                    }
                    const ofLabel = focusKey === category.key ? categoryLabel(category.key) : labels.scopeAll;
                    tapTile(
                      event,
                      key,
                      focusKey === null ? category.key : null,
                      `${leafLabel(leaf.code)} · ${categoryShort(category.key)}`,
                      mixLeafColor(category.color, rank),
                      labels.tooltipValue({
                        count: fmt(leaf.value),
                        percent: formatters.percent((leaf.value / base) * 100),
                        scope: ofLabel,
                      })
                    );
                    return;
                  }
                  // At the root a leaf click zooms into its category; when
                  // focused it bubbles to the background and zooms out.
                  hideTip();
                  if (focusKey === null) {
                    event.stopPropagation();
                    setFocusKey(category.key);
                  }
                }}
                onMouseLeave={tapMode ? undefined : hideTip}
                onMouseMove={
                  tapMode
                    ? undefined
                    : (event) => {
                        event.stopPropagation();
                        if (rest) return;
                        const ofLabel = focusKey === category.key ? categoryLabel(category.key) : labels.scopeAll;
                        showTip(
                          event,
                          `${leafLabel(leaf.code)} · ${categoryShort(category.key)}`,
                          mixLeafColor(category.color, rank),
                          labels.tooltipValue({
                            count: fmt(leaf.value),
                            percent: formatters.percent((leaf.value / base) * 100),
                            scope: ofLabel,
                          })
                        );
                      }
                }
              >
                {showLabel && (
                  <span className="flex flex-col px-2 py-1 text-xs font-semibold leading-tight">
                    {/* Compact on the tile — it only renders above 60px wide
                        and ellipsizes. The tooltip above keeps the full name. */}
                    <span>{rest ? t('chart.mix.others') : leafCompact(leaf.code)}</span>
                    {!rest && showLeafValue && (
                      <span className="font-mono text-xxs font-medium opacity-75">
                        {fmt(leaf.value)} · {formatters.percent((leaf.value / base) * 100)}
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          });
        })}
      </div>
      {/* Portaled to <body>: the card's entrance animation leaves a transform
          on an ancestor, which would re-anchor (and clip) position: fixed. */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tipRef}
            aria-hidden="true"
            className="pointer-events-none fixed z-50 max-w-[260px] rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-soft"
            style={{ display: 'none' }}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <span ref={tipChipRef} className="inline-block size-2.5 shrink-0 rounded-[3px]" />
              <span ref={tipNameRef} />
            </div>
            <div ref={tipValueRef} className="mt-0.5 font-mono text-xxs text-muted-foreground" />
          </div>,
          document.body
        )}
    </div>
  );
};

/**
 * The Category Mix view: application type → bureau, from the processing cube.
 */
export const CategoryMixTreemap: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const tree = useMemo(() => buildCategoryMixTree(data, filters, range), [data, filters, range]);
  const { t } = useLocale();
  const applicationType = useApplicationType();
  const bureauLabel = useBureauLabel();
  const bureauCompact = useBureauCompact();

  const labels: MixTreemapLabels = {
    root: t('chart.mix.root'),
    scopeAll: t('chart.mix.scopeAll'),
    categoryLabel: (code) => applicationType(code)?.label ?? code,
    categoryShort: (code) => applicationType(code)?.short ?? code,
    leafLabel: bureauLabel,
    leafCompact: bureauCompact,
    categoryAria: (params) => t('chart.mix.categoryAria', params),
    tooltipValue: (params) => t('chart.mix.tooltipValue', params),
  };

  return <MixTreemap tree={tree} labels={labels} />;
};
