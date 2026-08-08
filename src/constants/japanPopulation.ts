// src/constants/japanPopulation.ts
// Japan's total population (Japanese nationals + foreign residents), from the
// Statistics Bureau's official Population Estimates (総務省統計局「人口推計」,
// e-Stat table 0003448232 and the annual 人口推計 reports): the October 1
// figure for each year, rounded to the nearest thousand. 2025 carries the
// provisional monthly estimate.
//
// The residents cube has no total-population dimension of its own — these
// values exist so the stat tiles can express the foreign-resident stock as a
// share of the country. They are a denominator, not chart data: update the
// table once a year when the Bureau publishes the new estimate.

/** Total population by calendar year, persons. */
const JAPAN_POPULATION: Record<number, number> = {
  2012: 127_515_000,
  2013: 127_298_000,
  2014: 127_083_000,
  2015: 127_095_000, // census year
  2016: 127_042_000,
  2017: 126_919_000,
  2018: 126_749_000,
  2019: 126_555_000,
  2020: 126_146_000, // census year
  2021: 125_502_000,
  2022: 124_947_000,
  2023: 124_352_000,
  2024: 123_802_000,
  2025: 123_340_000, // provisional
};

const YEARS = Object.keys(JAPAN_POPULATION).map(Number);
const MIN_YEAR = Math.min(...YEARS);
const MAX_YEAR = Math.max(...YEARS);

/**
 * The population estimate matching a residents period ('YYYY-06' | 'YYYY-12').
 * Population moves ~0.4% a year, so the calendar-year figure is precise
 * enough for a share readout. A period outside the table (a new data release
 * before the table's annual update, say) clamps to the nearest known year
 * rather than losing the tile.
 */
export const japanPopulationForPeriod = (period: string): number => {
  const year = Number(period.slice(0, 4));
  const clamped = Number.isFinite(year) ? Math.min(MAX_YEAR, Math.max(MIN_YEAR, year)) : MAX_YEAR;
  return JAPAN_POPULATION[clamped];
};
