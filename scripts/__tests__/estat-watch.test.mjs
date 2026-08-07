// scripts/__tests__/estat-watch.test.mjs
// `decide` is the rule that determines whether the site publishes. It runs once
// a day, unattended, and both of its failure modes are silent: never deploying
// (a stale dashboard behind a green check) or deploying every day (a rebuild
// loop). Neither shows up in a build log, so the rule is pinned here.
//
// It is a pure function of the restored baseline and the probe results, so none
// of this touches the network.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { decide, readBaseline } from '../estat-watch.mjs';

const probe = (id, surveyDate, label = id) => ({ id, label, surveyDate });

describe('decide', () => {
  it('baselines without deploying when there is no previous record', () => {
    const { changed, save, reasons } = decide({}, [probe('processing', '2025-10'), probe('residents', '2025-06')]);

    // Never seen is not the same as moved: recording it must not publish.
    expect(changed).toBe(false);
    expect(save).toBe(true);
    expect(reasons.map((r) => r.state)).toEqual(['baseline', 'baseline']);
  });

  it('does nothing when every table is unchanged', () => {
    const baseline = { processing: '2025-10', residents: '2025-06' };
    const { changed, save, reasons } = decide(baseline, [
      probe('processing', '2025-10'),
      probe('residents', '2025-06'),
    ]);

    expect(changed).toBe(false);
    expect(save).toBe(false);
    expect(reasons.every((r) => r.state === 'unchanged')).toBe(true);
  });

  it('deploys when a single table moves', () => {
    const baseline = { processing: '2025-10', residents: '2025-06' };
    const { changed, save, reasons } = decide(baseline, [
      probe('processing', '2025-11'),
      probe('residents', '2025-06'),
    ]);

    expect(changed).toBe(true);
    expect(save).toBe(true);
    expect(reasons.find((r) => r.id === 'processing').state).toBe('changed');
    expect(reasons.find((r) => r.id === 'residents').state).toBe('unchanged');
  });

  it('deploys once when both tables move', () => {
    const baseline = { processing: '2025-10', residents: '2025-06' };
    const { changed, save } = decide(baseline, [probe('processing', '2025-11'), probe('residents', '2025-12')]);

    expect(changed).toBe(true);
    expect(save).toBe(true);
  });

  it('baselines a newly registered dataset without deploying the others', () => {
    // The run after a dataset is added to scripts/datasets.mjs: the cache entry
    // predates it, so it has no baseline while its neighbours are unchanged.
    const baseline = { processing: '2025-10' };
    const { changed, save, reasons } = decide(baseline, [probe('processing', '2025-10'), probe('arrivals', '2025-09')]);

    expect(changed).toBe(false);
    expect(save).toBe(true);
    expect(reasons.find((r) => r.id === 'arrivals').state).toBe('baseline');
  });

  it('ignores a stale key left by a dataset that was removed', () => {
    const baseline = { processing: '2025-10', retired: '2019-01' };
    const { changed, save } = decide(baseline, [probe('processing', '2025-10')]);

    expect(changed).toBe(false);
    expect(save).toBe(false);
  });

  it('compares by value, not by type', () => {
    // e-Stat returns SURVEY_DATE as a number for some tables and a string for
    // others; a baseline written before that was normalised must not read as a
    // change every single day.
    const { changed } = decide({ processing: 202510 }, [probe('processing', '202510')]);

    expect(changed).toBe(false);
  });
});

describe('readBaseline', () => {
  const withTempDir = (fn) => {
    const dir = mkdtempSync(join(tmpdir(), 'estat-watch-'));
    try {
      return fn(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it('treats a missing file as no baseline', () => {
    withTempDir((dir) => {
      expect(readBaseline(join(dir, 'absent.json'))).toEqual({});
    });
  });

  it('re-baselines rather than throwing on a corrupt entry', () => {
    // Failing here would wedge the watcher permanently: the run would die before
    // the cache save, so the bad entry would never be replaced and every later
    // run would fail identically.
    withTempDir((dir) => {
      const path = join(dir, 'corrupt.json');
      writeFileSync(path, '{ not json');
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(readBaseline(path)).toEqual({});
      expect(warn).toHaveBeenCalled();

      warn.mockRestore();
    });
  });

  it('rejects a well-formed file of the wrong shape', () => {
    withTempDir((dir) => {
      const path = join(dir, 'array.json');
      writeFileSync(path, '["2025-10"]');
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(readBaseline(path)).toEqual({});

      warn.mockRestore();
    });
  });

  it('reads a valid baseline back', () => {
    withTempDir((dir) => {
      const path = join(dir, 'baseline.json');
      writeFileSync(path, JSON.stringify({ processing: '2025-10', residents: '2025-06' }));

      expect(readBaseline(path)).toEqual({ processing: '2025-10', residents: '2025-06' });
    });
  });
});
