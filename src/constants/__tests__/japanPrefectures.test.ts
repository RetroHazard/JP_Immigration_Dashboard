// src/constants/__tests__/japanPrefectures.test.ts
// The prefecture list derives its JIS code from array position, and the map
// joins on that code. This asserts the derivation against the actual TopoJSON
// rather than trusting the ordering — a reordered or inserted entry would
// otherwise silently repaint the map with the wrong bureau colors.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { japanPrefectures, prefectureById } from '../japanPrefectures';

interface TopoGeometry {
  properties: { id: number; name: string; name_ja?: string };
}

const topo = JSON.parse(readFileSync(join(process.cwd(), 'public/static/japan.topo.json'), 'utf8')) as {
  objects: { japan: { geometries: TopoGeometry[] } };
};
const topoNameById = new Map(topo.objects.japan.geometries.map((g) => [g.properties.id, g.properties.name]));

describe('japanPrefectures', () => {
  it('covers all 47 prefectures', () => {
    expect(japanPrefectures).toHaveLength(47);
    expect(topoNameById.size).toBe(47);
  });

  it('assigns ids 1-47 with no gaps', () => {
    expect(japanPrefectures.map((prefecture) => prefecture.id)).toEqual(
      Array.from({ length: 47 }, (_, index) => index + 1)
    );
  });

  it('matches the TopoJSON on every id', () => {
    const mismatched = japanPrefectures
      .filter((prefecture) => topoNameById.get(prefecture.id) !== prefecture.name)
      .map((prefecture) => `${prefecture.id}: ${prefecture.name} != ${topoNameById.get(prefecture.id)}`);
    expect(mismatched).toEqual([]);
  });

  it('indexes every prefecture by id', () => {
    expect(prefectureById.size).toBe(47);
    expect(prefectureById.get(1)?.name).toBe('Hokkaido');
    expect(prefectureById.get(47)?.name).toBe('Okinawa');
  });

  it('exposes density as a number derived from population and area', () => {
    const hokkaido = prefectureById.get(1)!;
    expect(hokkaido.density).toBeCloseTo(hokkaido.population / hokkaido.area, 6);
  });
});
