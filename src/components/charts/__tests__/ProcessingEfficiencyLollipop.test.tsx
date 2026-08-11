// The lollipop's rows are focusable, so a mouse click focuses one as well as
// hovering it. That made an unconditional `onFocus` yank the hover card from
// the cursor to the row's top edge on every click — the behaviour under test.
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { resetCoarsePointerCache } from '../../../hooks/useCoarsePointer';
import type { ImmigrationData } from '../../../hooks/useImmigrationData';
import { resetPinRegistry } from '../../../lib/tooltip-pin';
import { renderWithProviders, screen, setCoarsePointer } from '../../../test-utils';
import { ProcessingEfficiencyLollipop } from '../ProcessingEfficiencyLollipop';

const entry = (overrides: Partial<ImmigrationData>): ImmigrationData => ({
  month: '2025-06',
  bureau: '101170',
  type: '20',
  status: '103000', // newly received
  value: 100,
  ...overrides,
});

const data: ImmigrationData[] = [
  entry({ bureau: '100000', value: 1000 }),
  entry({ bureau: '100000', status: '300000', value: 800 }),
  entry({ bureau: '101170', value: 600 }),
  entry({ bureau: '101170', status: '300000', value: 450 }),
  entry({ bureau: '101190', value: 300 }),
  entry({ bureau: '101190', status: '300000', value: 150 }),
];

const renderChart = (coarse: boolean) => {
  setCoarsePointer(coarse);
  return renderWithProviders(
    <ProcessingEfficiencyLollipop data={data} filters={{ bureau: 'all', type: 'all' }} range="all" />
  );
};

const row = (name: string) => screen.getByLabelText(new RegExp(`^${name}:`));

/** The card is portaled to <body> and positioned from the anchor it was given. */
const card = () => document.body.querySelector<HTMLElement>('[role="status"]');

afterEach(() => {
  resetPinRegistry();
  resetCoarsePointerCache();
});

describe('hover devices keep the card on the cursor', () => {
  it('anchors the card where the pointer is', () => {
    renderChart(false);
    fireEvent.pointerMove(row('Shinagawa'), { clientX: 250, clientY: 300 });

    expect(card()?.style.top).toBe('300px');
  });

  it('does not re-anchor when a click focuses the row', () => {
    // Regression: onFocus used to fire for a mouse click too, moving the card
    // to the row's top edge — which jsdom reports as 0, clamped to 96.
    renderChart(false);
    fireEvent.pointerMove(row('Shinagawa'), { clientX: 250, clientY: 300 });
    expect(card()?.style.top).toBe('300px');

    fireEvent.focus(row('Shinagawa'));

    expect(card()?.style.top).toBe('300px');
  });

  it('keeps the card open when a row the pointer already left blurs', () => {
    renderChart(false);
    fireEvent.pointerMove(row('Shinagawa'), { clientX: 250, clientY: 300 });
    fireEvent.focus(row('Shinagawa'));
    fireEvent.pointerMove(row('Narita Airport'), { clientX: 250, clientY: 340 });
    fireEvent.blur(row('Shinagawa'));

    expect(card()).not.toBeNull();
    expect(card()?.style.top).toBe('340px');
  });

  it('still closes the card when the pointer leaves', () => {
    renderChart(false);
    fireEvent.pointerMove(row('Shinagawa'), { clientX: 250, clientY: 300 });
    expect(card()).not.toBeNull();

    fireEvent.pointerLeave(row('Shinagawa'));

    expect(card()).toBeNull();
  });
});
