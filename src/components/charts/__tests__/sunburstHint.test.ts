// The idle sunburst hint tells the user which gesture to make, and the gesture
// differs by pointer type — so a wrong branch here is a wrong instruction, not
// just a wrong string.
import { describe, expect, it } from 'vitest';

import { en } from '../../../i18n/locales/en';
import { idleSunburstHint } from '../sunburstHint';

describe('idleSunburstHint', () => {
  it('tells a mouse user to click, and a touch user to tap twice', () => {
    expect(en[idleSunburstHint(0, false)]).toBe(en['chart.sunburst.hintClick']);
    expect(en[idleSunburstHint(0, true)]).toBe(en['chart.sunburst.hintTap']);
  });

  it('switches to the zoom-out wording once drilled in', () => {
    expect(en[idleSunburstHint(2, false)]).toBe(en['chart.sunburst.zoomOutClick']);
    expect(en[idleSunburstHint(2, true)]).toBe(en['chart.sunburst.zoomOutTap']);
  });

  it('only the touch wording mentions the second tap', () => {
    // Guards the actual point of the two-tap resolution: a touch user who is
    // told to "tap to zoom" will think the first tap failed.
    expect(en['chart.sunburst.hintTap']).toMatch(/again/i);
    expect(en['chart.mix.zoomInHintTap']).toMatch(/again/i);
  });
});
