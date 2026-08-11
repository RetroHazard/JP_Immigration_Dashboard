// The treemap is the one tap-mode chart that is plain HTML, which makes it the
// practical place to test the interaction end to end: visx-based charts need
// real measurements jsdom can't produce.
//
// It is also where tap has to serve two jobs a mouse kept apart — inspecting a
// tile and drilling into it — so this is the conflict resolution under test.
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { resetCoarsePointerCache } from '../../../hooks/useCoarsePointer';
import { en } from '../../../i18n/locales/en';
import { resetPinRegistry } from '../../../lib/tooltip-pin';
import { renderWithProviders, screen, setCoarsePointer } from '../../../test-utils';
import type { MixTree } from '../../../utils/categoryMixTree';
import { MixTreemap, type MixTreemapLabels } from '../CategoryMixTreemap';

const tree: MixTree = {
  total: 300,
  categories: [
    { key: '10', color: '#3366cc', value: 200, children: [{ code: '101000', value: 120 }, { code: '102000', value: 80 }] },
    { key: '20', color: '#cc6633', value: 100, children: [{ code: '101000', value: 100 }] },
  ],
};

const labels: MixTreemapLabels = {
  root: 'All applications',
  scopeAll: 'all applications',
  categoryLabel: (code) => `Category ${code}`,
  categoryShort: (code) => `C${code}`,
  leafLabel: (code) => `Bureau ${code}`,
  leafCompact: (code) => `B${code}`,
  categoryAria: ({ category, count }) => `${category}: ${count} applications. Zoom in.`,
  tooltipValue: ({ count, percent, scope }) => `${count} · ${percent} of ${scope}`,
};

const renderTreemap = (coarse: boolean) => {
  setCoarsePointer(coarse);
  return renderWithProviders(<MixTreemap labels={labels} tree={tree} />);
};

const categoryTile = (code: string) => screen.getByLabelText(new RegExp(`^Category ${code}:`));

/** The tip is an imperative DOM node, shown by toggling `display`. */
const tipVisible = () => {
  const chip = document.querySelector<HTMLElement>('.fixed.z-50');
  return chip?.style.display === 'block';
};
const tipText = () => document.querySelector<HTMLElement>('.fixed.z-50')?.textContent ?? '';

afterEach(() => {
  resetPinRegistry();
  resetCoarsePointerCache();
});

describe('hover devices keep click-to-zoom', () => {
  it('zooms straight in on the first click', () => {
    renderTreemap(false);
    expect(screen.getByText(en['chart.mix.zoomInHint'])).toBeTruthy();

    fireEvent.click(categoryTile('10'));
    expect(screen.getByText(en['chart.mix.zoomOutHint'])).toBeTruthy();
  });
});

describe('touch devices inspect first, then zoom', () => {
  it('shows the tap-mode hint instead of the click one', () => {
    renderTreemap(true);
    expect(screen.getByText(en['chart.mix.zoomInHintTap'])).toBeTruthy();
  });

  it('first tap opens the tooltip without zooming', () => {
    renderTreemap(true);

    fireEvent.click(categoryTile('10'));
    expect(tipVisible()).toBe(true);
    expect(tipText()).toContain('Category 10');
    // Still at the root — the breadcrumb hint has not switched.
    expect(screen.getByText(en['chart.mix.zoomInHintTap'])).toBeTruthy();
  });

  it('second tap on the same tile drills in and closes the tooltip', () => {
    renderTreemap(true);

    fireEvent.click(categoryTile('10'));
    fireEvent.click(categoryTile('10'));

    expect(tipVisible()).toBe(false);
    expect(screen.getByText(en['chart.mix.zoomOutHintTap'])).toBeTruthy();
  });

  it('tapping a different tile moves the tooltip rather than zooming', () => {
    renderTreemap(true);

    fireEvent.click(categoryTile('10'));
    fireEvent.click(categoryTile('20'));

    expect(tipVisible()).toBe(true);
    expect(tipText()).toContain('Category 20');
    expect(screen.getByText(en['chart.mix.zoomInHintTap'])).toBeTruthy();
  });

  it('a tap outside the chart dismisses the tooltip', () => {
    renderTreemap(true);
    fireEvent.click(categoryTile('10'));
    expect(tipVisible()).toBe(true);

    // fireEvent.click does not emit pointerdown, and that is what the pin
    // registry listens for.
    fireEvent.pointerDown(document.body);
    expect(tipVisible()).toBe(false);
  });

  it('a synthesized mouse event after a tap does not disturb the pin', () => {
    // The compat mouseenter/mousemove burst a browser fires after touchend is
    // the reason the hover handlers are left off entirely on coarse pointers.
    renderTreemap(true);
    fireEvent.click(categoryTile('10'));

    fireEvent.mouseMove(categoryTile('20'));
    fireEvent.mouseLeave(categoryTile('10'));

    expect(tipVisible()).toBe(true);
    expect(tipText()).toContain('Category 10');
  });
});
