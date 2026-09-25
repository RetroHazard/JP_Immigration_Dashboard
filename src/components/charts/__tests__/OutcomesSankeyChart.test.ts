// The node colors are the one visual decision this chart makes for itself.
// Left to the vendored sankey they followed each node's position in the list,
// which drew Denied in the Granted tile's green, so the map is pinned here.
// Whether SankeyNode and SankeyLink both receive it is a browser check: the
// SVG never renders under jsdom (see IntakeProcessingBarChart.test.tsx).
import { describe, expect, it } from 'vitest';

import { applicationOptions } from '../../../constants/applicationOptions';
import { outcomesNodeColors } from '../OutcomesSankeyChart';

const TYPES = applicationOptions.filter((option) => option.value !== 'all').map((option) => option.value);

/** The outcome nodes come after the type nodes. */
const outcomeColors = (typeCodes: string[]) => outcomesNodeColors(typeCodes).slice(typeCodes.length);

describe('outcomesNodeColors', () => {
  it('colors granted, denied and other by their metric, as the stat tiles do', () => {
    expect(outcomeColors(TYPES)).toEqual(['var(--chart-3)', 'var(--chart-8)', 'var(--chart-4)']);
  });

  it('keeps the outcome colors when the type filter changes how many nodes precede them', () => {
    for (const type of TYPES) {
      expect(outcomeColors([type])).toEqual(outcomeColors(TYPES));
    }
  });

  it('gives each type its Category Mix hue, whether it is shown alone or with the others', () => {
    const all = outcomesNodeColors(TYPES);
    TYPES.forEach((type, index) => {
      expect(all[index]).toBe(`var(--chart-mix-${index + 1})`);
      expect(outcomesNodeColors([type])[0]).toBe(all[index]);
    });
  });
});
